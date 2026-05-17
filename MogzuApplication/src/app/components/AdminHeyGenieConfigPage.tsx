import { useCallback, useEffect, useState } from 'react'
import { Loader2, Mic, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { CorporateAccount, HeyGenieConfig, ModuleId } from '@/lib/database.types'

const ALL_MODULES: ModuleId[] = ['events', 'gifting', 'spacex_coworking', 'spacex_stay']

export default function AdminHeyGenieConfigPage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [accounts, setAccounts] = useState<CorporateAccount[]>([])
  const [configs, setConfigs] = useState<Record<string, HeyGenieConfig>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.corporateAccounts.list()
    setAccounts(data ?? [])
    const map: Record<string, HeyGenieConfig> = {}
    await Promise.all(
      (data ?? []).map(async (a) => {
        const { data: cfg } = await db.heyGenie.getConfig(a.id)
        if (cfg) map[a.id] = cfg as HeyGenieConfig
      }),
    )
    setConfigs(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = async (
    corp: CorporateAccount,
    patch: Partial<Omit<HeyGenieConfig, 'corporate_id' | 'created_at' | 'updated_at'>>,
  ) => {
    if (!profile) return
    setBusy(corp.id)
    const existing = configs[corp.id]
    const next: Omit<HeyGenieConfig, 'created_at' | 'updated_at'> = {
      corporate_id: corp.id,
      enabled: existing?.enabled ?? false,
      enabled_modules: existing?.enabled_modules ?? [],
      voice_locale: existing?.voice_locale ?? 'en-IN',
      wake_word_enabled: existing?.wake_word_enabled ?? false,
      configured_by: profile.id,
      ...patch,
    }
    await db.heyGenie.upsertConfig(next)
    setBusy(null)
    setNotice('Saved.')
    load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="Hey Genie configuration"
          subtitle="Enable per-client. Scope which modules the assistant can act on. Real VAPI SDK wiring still pending."
        />
        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <ul className="space-y-3">
            {accounts.map((c) => {
              const cfg = configs[c.id]
              const enabledModules = new Set(cfg?.enabled_modules ?? [])
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-slate-900">
                        <Mic className="size-4 text-[#2563EB]" />
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500">{c.plan} · {c.status}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={cfg?.enabled ?? false}
                        disabled={busy === c.id}
                        onChange={(e) => update(c, { enabled: e.target.checked })}
                      />
                      Enable Hey Genie
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {ALL_MODULES.map((m) => {
                      const active = enabledModules.has(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            const next = new Set(enabledModules)
                            active ? next.delete(m) : next.add(m)
                            update(c, { enabled_modules: Array.from(next) })
                          }}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            active
                              ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {m.replace('_', ' ')}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <select
                      value={cfg?.voice_locale ?? 'en-IN'}
                      onChange={(e) => update(c, { voice_locale: e.target.value })}
                      className="h-8 rounded-md border border-slate-200 px-2"
                    >
                      <option value="en-IN">English (IN)</option>
                      <option value="hi-IN">Hindi (IN)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cfg?.wake_word_enabled ?? false}
                        onChange={(e) => update(c, { wake_word_enabled: e.target.checked })}
                      />
                      Wake word ("Hey Genie")
                    </label>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
