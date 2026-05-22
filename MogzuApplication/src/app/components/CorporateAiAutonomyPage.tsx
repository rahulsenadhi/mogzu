// Phase 5 Feature 5 — corporate L3 autonomy settings page.

import { useCallback, useEffect, useState } from 'react'
import { Bot, Loader2, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  getSettings,
  upsertSettings,
  type AiAutonomySettings,
} from '@/lib/aiAutonomy'

export default function CorporateAiAutonomyPage() {
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
    }
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    if (isL3 && corporateId) load()
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
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Corporate L3 admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Bot className="size-6 text-indigo-500" /> AI agent autonomy
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Controls when Mogzu's AI agents may complete bookings without human approval. Every
          autonomous action is stamped to the booking's <code>created_by_agent_id</code> column.
        </p>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
          <section
            className={`mt-6 rounded-2xl border-2 p-6 shadow-sm ${
              enabled
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-rose-300 bg-rose-50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {enabled ? (
                  <ShieldCheck className="mt-1 size-8 text-emerald-600" />
                ) : (
                  <ShieldOff className="mt-1 size-8 text-rose-600" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Autonomy status
                  </p>
                  <h2
                    className={`text-2xl font-bold ${
                      enabled ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {enabled ? 'AI autonomy ON' : 'KILL SWITCH ENGAGED'}
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
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold text-white shadow disabled:opacity-50 ${
                  enabled
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {killBusy ? '…' : enabled ? 'Engage kill switch' : 'Re-enable autonomy'}
              </button>
            </div>
          </section>

          <form
            onSubmit={onSave}
            className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Policy
            </p>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Per-booking spend cap (INR)</span>
              <input
                type="number"
                min={0}
                value={cap}
                onChange={(e) => setCap(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Attempts above this cap fall back to manual approval.
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Blocked categories (comma-separated)
              </span>
              <input
                type="text"
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                placeholder="e.g. alcohol, gambling"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save policy
              </button>
              {saved && (
                <span className="text-xs font-medium text-emerald-700">Saved</span>
              )}
            </div>
          </form>
          </>
        )}
      </div>
    </div>
  )
}
