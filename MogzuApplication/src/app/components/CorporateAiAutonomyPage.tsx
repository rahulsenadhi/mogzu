// Phase 5 Feature 5 — corporate L3 autonomy settings page.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Bot, Loader2, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'
import { CorporateModuleShell } from '@/app/components/layouts/CorporateModuleShell'
import { MOGZU_GLASS_CARD } from '@/app/components/ui/mogzuGlassStyles'
import { MOGZU_CTA_GRADIENT, MOGZU_FILTER_SIDEBAR } from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { getSettings, upsertSettings } from '@/lib/aiAutonomy'

export default function CorporateAiAutonomyPage() {
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  const isL3 = role === 'l3_admin'
  const corporateId = profile?.corporate_id ?? null

  const [enabled, setEnabled] = useState(false)
  const [cap, setCap] = useState(50000)
  const [blocked, setBlocked] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [killBusy, setKillBusy] = useState(false)
  const [hasStoredSettings, setHasStoredSettings] = useState(false)

  const toggleKill = async (next: boolean) => {
    if (!corporateId) return
    setKillBusy(true)
    setError('')
    const blocked_categories = blocked
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
    const { error: err } = await upsertSettings({
      corporate_id: corporateId,
      is_enabled: next,
      spend_cap_inr: cap,
      blocked_categories,
      updated_by: profile?.id ?? null,
    })
    setKillBusy(false)
    if (err) setError(err)
    else setEnabled(next)
  }

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const { data, error: err } = await getSettings(corporateId)
    if (err) setError(err)
    if (data) {
      setEnabled(data.is_enabled)
      setCap(data.spend_cap_inr)
      setBlocked(data.blocked_categories.join(', '))
      setHasStoredSettings(true)
    } else {
      setHasStoredSettings(false)
    }
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    if (isL3 && corporateId) void load()
  }, [isL3, corporateId, load])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!corporateId) return
    setSaving(true)
    setError('')
    setSaved(false)
    const blocked_categories = blocked
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
    const { error: err } = await upsertSettings({
      corporate_id: corporateId,
      is_enabled: enabled,
      spend_cap_inr: cap,
      blocked_categories,
      updated_by: profile?.id ?? null,
    })
    setSaving(false)
    if (err) setError(err)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  if (!isL3) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">Corporate L3 admin role required.</p>
      </div>
    )
  }

  return (
    <CorporateModuleShell
      title="AI agent autonomy"
      subtitle="Control when Mogzu AI agents may complete bookings without human approval."
      activeNav="settings"
      searchPlaceholder="Search settings"
      breadcrumbs={[
        { label: 'Home', onClick: () => navigate('/dashboard') },
        { label: 'Settings', onClick: () => navigate('/settings') },
        { label: 'AI autonomy' },
      ]}
      navChips={[
        { id: 'billing', label: 'Billing', onClick: () => navigate('/account/billing') },
        { id: 'ai', label: 'AI autonomy', active: true, onClick: () => navigate('/corporate/ai-autonomy') },
      ]}
    >
      {error && (
        <p className="mb-4 rounded-xl border border-rose-100 bg-rose-50/90 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {!loading && !hasStoredSettings ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              No saved settings yet — defaults apply until you save.
            </p>
          ) : null}
          <section
            className={`${MOGZU_GLASS_CARD} border-2 p-6 ${
              enabled
                ? 'border-emerald-300/60 bg-emerald-50/40'
                : 'border-rose-300/60 bg-rose-50/40'
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {enabled ? (
                  <ShieldCheck className="mt-1 size-8 text-emerald-600" />
                ) : (
                  <ShieldOff className="mt-1 size-8 text-rose-600" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Kill switch</p>
                  <h2
                    className={`text-2xl font-bold ${enabled ? 'text-emerald-900' : 'text-rose-900'}`}
                  >
                    {enabled ? 'AI autonomy ON' : 'Kill switch engaged'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {enabled
                      ? 'Agents may book within the policy below. Disable instantly to halt all autonomous activity.'
                      : 'No agent can book without human approval. Re-enable when ready.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={killBusy}
                onClick={() => void toggleKill(!enabled)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50 ${
                  enabled
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {killBusy ? 'Updating…' : enabled ? 'Engage kill switch' : 'Re-enable autonomy'}
              </button>
            </div>
          </section>

          <form onSubmit={onSave} className={`${MOGZU_FILTER_SIDEBAR} space-y-5`}>
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-indigo-500" />
              <p className="text-sm font-semibold text-[#0e1e3f]">Spend & category policy</p>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Per-booking spend cap (INR)</span>
              <input
                type="number"
                min={0}
                value={cap}
                onChange={(e) => setCap(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Attempts above this cap fall back to manual approval.
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Blocked categories (comma-separated)</span>
              <input
                type="text"
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                placeholder="e.g. alcohol, gambling"
                className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-1.5 ${MOGZU_CTA_GRADIENT} disabled:opacity-60`}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save policy
              </button>
              {saved && <span className="text-xs font-medium text-emerald-700">Saved</span>}
            </div>
          </form>
        </div>
      )}
    </CorporateModuleShell>
  )
}
