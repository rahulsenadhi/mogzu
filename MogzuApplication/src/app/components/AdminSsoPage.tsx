// Phase 3 Feature 5 (part 1) — admin SSO config console.

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Plus, Save, ShieldAlert, X, XCircle } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  SSO_PROVIDERS,
  listSsoConfigs,
  recordSsoTest,
  resolveSsoForEmail,
  upsertSsoConfig,
  type SsoConfig,
  type SsoConfigDraft,
  type SsoProvider,
} from '@/lib/ssoConfig'

const emptyDraft = (): SsoConfigDraft => ({
  corporate_id: '',
  provider: 'okta',
  display_name: '',
  entity_id: '',
  sso_url: '',
  acs_url: null,
  certificate: '',
  email_domain: '',
  email_attribute_name: 'email',
  enforce_sso: false,
  is_active: false,
})

export default function AdminSsoPage() {
  const { role, user } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<SsoConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [draft, setDraft] = useState<SsoConfigDraft | null>(null)
  const [corporates, setCorporates] = useState<{ id: string; name: string }[]>([])
  const [testEmail, setTestEmail] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listSsoConfigs()
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [])

  const loadCorporates = useCallback(async () => {
    const { data } = await db.corporateAccounts.list()
    setCorporates(
      ((data ?? []) as { id: string; name: string }[]).map((r) => ({
        id: r.id,
        name: r.name,
      })),
    )
  }, [])

  useEffect(() => {
    if (isAdmin) {
      load()
      loadCorporates()
    }
  }, [isAdmin, load, loadCorporates])

  const openCreate = () => {
    setDraft(emptyDraft())
    setError('')
  }

  const openEdit = (row: SsoConfig) => {
    setDraft({
      id: row.id,
      corporate_id: row.corporate_id,
      provider: row.provider,
      display_name: row.display_name,
      entity_id: row.entity_id,
      sso_url: row.sso_url,
      acs_url: row.acs_url,
      certificate: row.certificate,
      email_domain: row.email_domain,
      email_attribute_name: row.email_attribute_name,
      enforce_sso: row.enforce_sso,
      is_active: row.is_active,
    })
    setError('')
  }

  const save = async () => {
    if (!draft || !user?.id) return
    if (
      !draft.corporate_id ||
      !draft.entity_id.trim() ||
      !draft.sso_url.trim() ||
      !draft.certificate.trim() ||
      !draft.email_domain.trim()
    ) {
      setError('corporate, entity ID, SSO URL, certificate, and email domain are required')
      return
    }
    setBusy('save')
    const { error: err } = await upsertSsoConfig(draft, user.id)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice(draft.id ? 'SSO config updated.' : 'SSO config created (inactive — flip the switch when ready).')
    setDraft(null)
    load()
  }

  const testRouting = async (row: SsoConfig) => {
    const email = window.prompt(`Test SSO routing — enter an email at @${row.email_domain}:`)
    if (!email) return
    setBusy(`test-${row.id}`)
    const { data, error: err } = await resolveSsoForEmail(email)
    setBusy(null)
    if (err) {
      await recordSsoTest(row.id, 'failed', err)
      setError(err)
      load()
      return
    }
    if (data && data.config_id === row.id) {
      await recordSsoTest(row.id, 'ok', null)
      setNotice(`Routing OK — ${email} resolves to provider ${data.provider}.`)
    } else {
      const reason = data
        ? `Routed to a DIFFERENT corporate (config ${data.config_id}). Check email_domain.`
        : `No SSO config matched. Ensure is_active is on and email_domain matches.`
      await recordSsoTest(row.id, 'failed', reason)
      setError(reason)
    }
    load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Mogzu admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <AdminPageTitleRow title="SSO / SAML" totalLabel={`${rows.length} configured`} />
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            <Plus className="size-4" />
            New config
          </button>
        </div>

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="anyone@anycorporate.com — test global routing"
            className="flex-1 text-sm outline-none"
          />
          <button
            type="button"
            disabled={!testEmail || busy === 'global-test'}
            onClick={async () => {
              setBusy('global-test')
              const { data, error: err } = await resolveSsoForEmail(testEmail)
              setBusy(null)
              if (err) setError(err)
              else if (data) setNotice(`${testEmail} → corporate ${data.corporate_id} via ${data.provider} (${data.enforce_sso ? 'enforced' : 'optional'})`)
              else setError(`No SSO config matches ${testEmail}.`)
            }}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Resolve routing
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">
              No SSO configs yet. Create one to wire an IdP for a corporate.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((r) => {
                const corp = corporates.find((c) => c.id === r.corporate_id)
                return (
                  <li key={r.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {corp?.name ?? r.corporate_id} · {SSO_PROVIDERS.find((p) => p.value === r.provider)?.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          domain: <span className="font-mono">{r.email_domain}</span> ·{' '}
                          {r.is_active ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              active
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              inactive
                            </span>
                          )}
                          {r.enforce_sso && (
                            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              password disabled
                            </span>
                          )}
                        </p>
                        {r.last_tested_at && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs">
                            {r.last_tested_status === 'ok' ? (
                              <CheckCircle2 className="size-3 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3 text-rose-500" />
                            )}
                            <span className="text-slate-500">
                              tested {new Date(r.last_tested_at).toLocaleString('en-IN')}
                              {r.last_tested_error ? ` — ${r.last_tested_error}` : ''}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => testRouting(r)}
                          disabled={busy === `test-${r.id}`}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {draft.id ? 'Edit SSO config' : 'New SSO config'}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Corporate</span>
                <select
                  value={draft.corporate_id}
                  onChange={(e) => setDraft({ ...draft, corporate_id: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select corporate…</option>
                  {corporates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Provider</span>
                <select
                  value={draft.provider}
                  onChange={(e) => setDraft({ ...draft, provider: e.target.value as SsoProvider })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  {SSO_PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Email domain</span>
                <input
                  type="text"
                  value={draft.email_domain}
                  onChange={(e) => setDraft({ ...draft, email_domain: e.target.value })}
                  placeholder="acme.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Entity ID</span>
                <input
                  type="text"
                  value={draft.entity_id}
                  onChange={(e) => setDraft({ ...draft, entity_id: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>

              <label className="col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">SSO URL</span>
                <input
                  type="url"
                  value={draft.sso_url}
                  onChange={(e) => setDraft({ ...draft, sso_url: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>

              <label className="col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">ACS URL (callback — leave blank to use Mogzu default)</span>
                <input
                  type="url"
                  value={draft.acs_url ?? ''}
                  onChange={(e) => setDraft({ ...draft, acs_url: e.target.value || null })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>

              <label className="col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">X.509 Certificate</span>
                <textarea
                  rows={5}
                  value={draft.certificate}
                  onChange={(e) => setDraft({ ...draft, certificate: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                  placeholder="-----BEGIN CERTIFICATE-----…"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Email attribute name</span>
                <input
                  type="text"
                  value={draft.email_attribute_name}
                  onChange={(e) => setDraft({ ...draft, email_attribute_name: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>

              <label className="col-span-2 mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                />
                Active (route logins through this IdP)
              </label>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.enforce_sso}
                  disabled={!draft.is_active}
                  onChange={(e) => setDraft({ ...draft, enforce_sso: e.target.checked })}
                />
                Enforce SSO (disable password login for this domain)
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy === 'save'}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {busy === 'save' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
