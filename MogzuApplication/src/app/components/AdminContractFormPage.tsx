// Phase 3 Feature 8 — admin contract create / edit form.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import { corporateAccounts } from '@/lib/db'
import { listCurrencies, type Currency } from '@/lib/currencies'
import {
  createContract,
  deleteLineItem,
  getContract,
  listLineItems,
  updateContract,
  upsertLineItem,
  type Contract,
  type ContractLineItem,
} from '@/lib/contracts'

type CorporateOpt = { id: string; name: string }

const PAYMENT_TERMS = [0, 7, 15, 30, 45, 60, 90]
const LINE_KINDS: ContractLineItem['kind'][] = [
  'event_type',
  'gift_unit',
  'space_night',
  'space_day',
  'custom',
]

type LineDraft = Omit<ContractLineItem, 'created_at'> & { id?: string; _dirty?: boolean }

export default function AdminContractFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { role, profile } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const [corporates, setCorporates] = useState<CorporateOpt[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [form, setForm] = useState<Partial<Contract>>({
    name: '',
    term_starts_on: new Date().toISOString().slice(0, 10),
    term_ends_on: null,
    payment_terms_days: 30,
    currency: 'INR',
    status: 'draft',
    notes: null,
  })
  const [lines, setLines] = useState<LineDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [corpsRes, currs] = await Promise.all([
      corporateAccounts.list(),
      listCurrencies(),
    ])
    if (corpsRes.error) setError(corpsRes.error.message)
    setCorporates(((corpsRes.data ?? []) as { id: string; name: string }[]).map((c) => ({
      id: c.id,
      name: c.name,
    })))
    setCurrencies(currs)

    if (isEdit && id) {
      const [{ data: c, error: e1 }, { data: items, error: e2 }] = await Promise.all([
        getContract(id),
        listLineItems(id),
      ])
      if (e1) setError(e1)
      else if (e2) setError(e2)
      if (c) setForm(c)
      setLines(items.map((i) => ({ ...i })))
    }
    setLoading(false)
  }, [id, isEdit])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: undefined,
        contract_id: id ?? '',
        kind: 'event_type',
        description: '',
        unit_rate: 0,
        notes: null,
        display_order: prev.length,
        _dirty: true,
      },
    ])
  }

  const updateLine = (idx: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch, _dirty: true } : l)))
  }

  const removeLine = async (idx: number) => {
    const target = lines[idx]
    if (target.id) {
      const { error: err } = await deleteLineItem(target.id)
      if (err) {
        setError(err)
        return
      }
    }
    setLines((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (!form.name?.trim()) {
        setError('Contract name is required')
        return
      }
      if (!form.corporate_id) {
        setError('Pick a corporate')
        return
      }
      let contractId = id
      if (isEdit && id) {
        const { error: err } = await updateContract(id, form)
        if (err) {
          setError(err)
          return
        }
      } else {
        const payload = {
          corporate_id: form.corporate_id,
          name: form.name,
          term_starts_on: form.term_starts_on!,
          term_ends_on: form.term_ends_on ?? null,
          payment_terms_days: form.payment_terms_days ?? 30,
          currency: form.currency ?? 'INR',
          status: form.status ?? 'draft',
          notes: form.notes ?? null,
          created_by: profile?.id ?? null,
        } as Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'signed_at' | 'signed_by'>
        const { data: created, error: err } = await createContract(payload)
        if (err || !created) {
          setError(err ?? 'Failed to create contract')
          return
        }
        contractId = created.id
      }

      for (const [idx, l] of lines.entries()) {
        if (!l._dirty) continue
        if (!l.description.trim()) continue
        const { error: err } = await upsertLineItem({
          id: l.id,
          contract_id: contractId!,
          kind: l.kind,
          description: l.description.trim(),
          unit_rate: Number(l.unit_rate) || 0,
          notes: l.notes ?? null,
          display_order: idx,
        })
        if (err) {
          setError(err)
          return
        }
      }

      navigate('/admin/contracts', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const corporateName = useMemo(
    () => corporates.find((c) => c.id === form.corporate_id)?.name ?? '',
    [corporates, form.corporate_id],
  )

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin role required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <AdminPageTitleRow
          title={isEdit ? `Edit contract — ${form.name}` : 'New contract'}
          totalLabel={corporateName || undefined}
        />
        {error && (
          <p className="mt-3 mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Corporate</span>
              <select
                value={form.corporate_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, corporate_id: e.target.value }))}
                disabled={isEdit}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
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
              <span className="mb-1 block font-medium text-slate-700">Contract name</span>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Term starts</span>
              <input
                type="date"
                value={form.term_starts_on ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, term_starts_on: e.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Term ends (optional)</span>
              <input
                type="date"
                value={form.term_ends_on ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, term_ends_on: e.target.value || null }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Payment terms (days)</span>
              <select
                value={form.payment_terms_days ?? 30}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payment_terms_days: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {PAYMENT_TERMS.map((d) => (
                  <option key={d} value={d}>
                    Net {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Currency</span>
              <select
                value={form.currency ?? 'INR'}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Status</span>
              <select
                value={form.status ?? 'draft'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Contract['status'] }))
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Notes</span>
              <textarea
                rows={2}
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Rate card line items</h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="size-3.5" /> Add line
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No line items yet.</p>
          ) : (
            <div className="space-y-2">
              {lines.map((l, idx) => (
                <div
                  key={l.id ?? `new-${idx}`}
                  className="grid grid-cols-12 gap-2 rounded-md border border-slate-100 p-2"
                >
                  <select
                    value={l.kind}
                    onChange={(e) =>
                      updateLine(idx, { kind: e.target.value as ContractLineItem['kind'] })
                    }
                    className="col-span-3 rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    {LINE_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={l.description}
                    onChange={(e) => updateLine(idx, { description: e.target.value })}
                    placeholder="Description"
                    className="col-span-5 rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={l.unit_rate}
                    onChange={(e) => updateLine(idx, { unit_rate: Number(e.target.value) })}
                    placeholder="Unit rate"
                    className="col-span-3 rounded-md border border-slate-200 px-2 py-1.5 text-right text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="col-span-1 flex items-center justify-center rounded-md text-rose-500 hover:bg-rose-50"
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/contracts')}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create contract'}
          </button>
        </div>
      </div>
    </div>
  )
}
