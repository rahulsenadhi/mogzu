// Phase 4 Feature 4 — webhook endpoints admin console.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, ShieldAlert, Webhook } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  AVAILABLE_EVENTS,
  createEndpoint,
  listEndpoints,
  setEndpointActive,
  type WebhookEndpoint,
  type WebhookEvent,
} from '@/lib/webhooks'

type CorpRow = { id: string; name: string }

export default function AdminWebhooksPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([])
  const [corps, setCorps] = useState<CorpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)

  const [corporateId, setCorporateId] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<WebhookEvent[]>([
    'booking.created',
    'booking.approved',
    'invoice.paid',
  ])

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: e, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listEndpoints(),
      corporateAccounts.list(),
    ])
    setEndpoints(e)
    setCorps(
      ((c ?? []) as { id: string; name: string }[]).map((row) => ({
        id: row.id,
        name: row.name,
      })),
    )
    if (e1 || e2?.message) setError(e1 || e2?.message || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const corpName = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of corps) m.set(c.id, c.name)
    return m
  }, [corps])

  const toggleEvent = (e: WebhookEvent) =>
    setEvents((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]))

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!corporateId || !url || events.length === 0) {
      setError('Corporate, URL, and at least one event are required.')
      return
    }
    setCreating(true)
    setError('')
    const { data, error: err } = await createEndpoint({
      corporate_id: corporateId,
      url,
      events,
    })
    setCreating(false)
    if (err || !data) {
      setError(err ?? 'Could not create webhook endpoint')
      return
    }
    setRevealedSecret(data.signing_secret)
    setUrl('')
    load()
  }

  const onToggle = async (ep: WebhookEndpoint) => {
    const { error: err } = await setEndpointActive(ep.id, !ep.is_active)
    if (err) setError(err)
    else load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / support role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <AdminPageTitleRow
          title="Webhooks"
          totalLabel={loading ? 'Loading…' : `${endpoints.filter((e) => e.is_active).length} active`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {revealedSecret && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Signing secret — copy now, won't be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-sm">
              <span className="flex-1 break-all">{revealedSecret}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(revealedSecret)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Copy className="size-3.5" /> Copy
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRevealedSecret(null)}
              className="mt-3 text-xs font-semibold text-amber-900 underline"
            >
              Copied — dismiss
            </button>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Webhook className="size-4 text-slate-500" /> Register endpoint
          </h2>
          <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Corporate</span>
              <select
                value={corporateId}
                onChange={(e) => setCorporateId(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select corporate</option>
                {corps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">HTTPS URL</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhooks/mogzu"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Events</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EVENTS.map((ev) => (
                  <button
                    key={ev}
                    type="button"
                    onClick={() => toggleEvent(ev)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      events.includes(ev)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                Register
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Corporate</th>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">Events</th>
                <th className="px-4 py-2 text-right">Failures</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep) => (
                <tr key={ep.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {corpName.get(ep.corporate_id) ?? ep.corporate_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate font-mono text-xs">{ep.url}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{ep.events.join(', ')}</td>
                  <td className="px-4 py-2 text-right text-xs">{ep.failure_streak}</td>
                  <td className="px-4 py-2 text-xs">
                    {ep.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                        active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">
                        paused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onToggle(ep)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {ep.is_active ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
              {endpoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                    No webhook endpoints registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
