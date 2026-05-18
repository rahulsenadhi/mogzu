// Phase 4 Feature 4 — admin API key console.
//
// Admin issues keys per corporate; the plaintext is shown exactly once
// after creation. After dismiss the secret is unrecoverable.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, KeyRound, Loader2, ShieldAlert, Trash2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import {
  AVAILABLE_SCOPES,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKey,
  type ApiKeyScope,
} from '@/lib/apiKeys'

type CorpRow = { id: string; name: string }

export default function AdminApiKeysPage() {
  const { role, profile } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [corps, setCorps] = useState<CorpRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [corporateId, setCorporateId] = useState('')
  const [scopes, setScopes] = useState<ApiKeyScope[]>(['read:bookings', 'read:invoices'])
  const [rateLimit, setRateLimit] = useState(100)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: k, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      listApiKeys(),
      corporateAccounts.list(),
    ])
    setKeys(k)
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

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!corporateId || !name.trim() || scopes.length === 0) {
      setError('Corporate, name, and at least one scope are required.')
      return
    }
    setCreating(true)
    setError('')
    const { plaintext, error: err } = await createApiKey({
      corporate_id: corporateId,
      name: name.trim(),
      scopes,
      rate_limit_per_minute: rateLimit,
      created_by: profile?.id ?? null,
    })
    setCreating(false)
    if (err || !plaintext) {
      setError(err ?? 'Could not create API key')
      return
    }
    setNewKeyPlaintext(plaintext)
    setName('')
    load()
  }

  const onRevoke = async (id: string) => {
    if (!window.confirm('Revoke this API key? Calls using it will start failing immediately.')) {
      return
    }
    const { error: err } = await revokeApiKey(id)
    if (err) setError(err)
    else load()
  }

  const toggleScope = (s: ApiKeyScope) =>
    setScopes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

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
          title="API keys"
          totalLabel={loading ? 'Loading…' : `${keys.filter((k) => k.is_active).length} active`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {newKeyPlaintext && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Copy this key now — it won't be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-sm">
              <span className="flex-1 break-all">{newKeyPlaintext}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(newKeyPlaintext)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Copy className="size-3.5" /> Copy
              </button>
            </div>
            <button
              type="button"
              onClick={() => setNewKeyPlaintext(null)}
              className="mt-3 text-xs font-semibold text-amber-900 underline"
            >
              I've copied it — dismiss
            </button>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <KeyRound className="size-4 text-slate-500" /> Issue new key
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
              <span className="mb-1 block font-medium text-slate-700">Name / purpose</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NetSuite sync"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Scopes</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SCOPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      scopes.includes(s)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Rate limit (per minute)</span>
              <input
                type="number"
                min={1}
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                Issue key
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Corporate</th>
                <th className="px-4 py-2 font-mono">Prefix</th>
                <th className="px-4 py-2">Scopes</th>
                <th className="px-4 py-2">Rate</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">{k.name}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {corpName.get(k.corporate_id) ?? k.corporate_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{k.scopes.join(', ')}</td>
                  <td className="px-4 py-2 text-right text-xs">{k.rate_limit_per_minute}/m</td>
                  <td className="px-4 py-2 text-xs">
                    {k.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                        active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">
                        revoked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {k.is_active && (
                      <button
                        type="button"
                        onClick={() => onRevoke(k.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                    No keys issued yet.
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
