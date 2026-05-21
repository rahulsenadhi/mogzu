import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Bookmark,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { EventTemplate, Listing, Vendor } from '@/lib/database.types'

type FormState = {
  name: string
  description: string
  groupSize: string
  budget: string
  vendorIds: string[]
  listingIds: string[]
}

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    groupSize: '',
    budget: '',
    vendorIds: [],
    listingIds: [],
  }
}

export default function CorporateEventTemplatesPage() {
  const navigate = useNavigate()
  const { corporateId, role } = useAuth()
  const canManage = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const [tRes, vRes, lRes] = await Promise.all([
      db.eventTemplates.listByCorporate(corporateId),
      db.vendors.listActive(),
      db.listings.listByModule('events', 'active'),
    ])
    setTemplates(tRes.data ?? [])
    setVendors(vRes.data ?? [])
    setListings(lRes.data ?? [])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async () => {
    if (!corporateId) return
    if (!form.name.trim()) {
      setNotice('Name required.')
      return
    }
    setSubmitting(true)
    const { error } = await db.eventTemplates.create({
      corporate_id: corporateId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      default_group_size: form.groupSize ? Number(form.groupSize) : null,
      default_budget: form.budget ? Number(form.budget) : null,
      preferred_vendor_ids: form.vendorIds,
      preferred_listing_ids: form.listingIds,
      usage_count: 0,
      is_active: true,
    })
    setSubmitting(false)
    if (error) setNotice(`Failed: ${error.message}`)
    else {
      setShowForm(false)
      setForm(emptyForm())
      setNotice('Template added to Corporate Picks.')
      load()
    }
  }

  const toggleArr = (arr: string[], id: string): string[] =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]

  if (!canManage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">L3 Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <Bookmark className="size-5" />
                  Event templates
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Pre-set event params + approved vendors. Surface to L1/L2 as "Corporate
                  Picks".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="size-4" />
                New template
              </button>
            </div>

            {notice && (
              <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {notice}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Bookmark className="mx-auto mb-2 size-10 text-slate-300" />
                <p className="text-sm text-slate-500">No templates yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">
                          {t.default_group_size ? `Group ${t.default_group_size}` : '—'}
                          {t.default_budget != null
                            ? ` · ₹${t.default_budget.toLocaleString('en-IN')}`
                            : ''}
                          · {t.preferred_listing_ids.length} listings ·{' '}
                          {t.preferred_vendor_ids.length} vendors · Used {t.usage_count}×
                        </p>
                        {t.description && (
                          <p className="mt-1 text-xs text-slate-600">{t.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            db.eventTemplates
                              .update(t.id, { is_active: !t.is_active })
                              .then(load)
                          }
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {t.is_active ? 'Hide' : 'Show in Picks'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">New template</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Template name (Annual Day, Quarterly Offsite…)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={form.groupSize}
                  onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
                  placeholder="Default group size"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="Default budget (₹)"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Preferred listings
                </p>
                <div className="max-h-32 space-y-1 overflow-auto rounded-lg border border-slate-100 p-2">
                  {listings.map((l) => (
                    <label
                      key={l.id}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.listingIds.includes(l.id)}
                        onChange={() =>
                          setForm({ ...form, listingIds: toggleArr(form.listingIds, l.id) })
                        }
                      />
                      {l.title}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Preferred vendors
                </p>
                <div className="max-h-32 space-y-1 overflow-auto rounded-lg border border-slate-100 p-2">
                  {vendors.map((v) => (
                    <label
                      key={v.id}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.vendorIds.includes(v.id)}
                        onChange={() =>
                          setForm({ ...form, vendorIds: toggleArr(form.vendorIds, v.id) })
                        }
                      />
                      {v.business_name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Save template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
