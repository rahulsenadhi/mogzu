import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Bookmark, Loader2 } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { EventTemplate } from '@/lib/database.types'

export default function CorporatePicksPage() {
  const navigate = useNavigate()
  const { corporateId } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!corporateId) return
    setLoading(true)
    const { data } = await db.eventTemplates.listActive(corporateId)
    setTemplates(data ?? [])
    setLoading(false)
  }, [corporateId])

  useEffect(() => {
    load()
  }, [load])

  const open = async (t: EventTemplate) => {
    await db.eventTemplates.incrementUsage(t.id)
    const firstListing = t.preferred_listing_ids[0]
    if (firstListing) navigate(`/book/event/${firstListing}`)
    else navigate('/events')
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
          <div className="mx-auto max-w-4xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
              <Bookmark className="size-5" />
              Corporate Picks
            </h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Curated templates from your L3 Admin — pre-set params and approved vendors.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : templates.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                No Corporate Picks yet.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t.default_group_size ? `Group ${t.default_group_size}` : '—'}
                      {t.default_budget != null
                        ? ` · ₹${t.default_budget.toLocaleString('en-IN')}`
                        : ''}
                      · {t.preferred_listing_ids.length} approved listings
                    </p>
                    {t.description && (
                      <p className="mt-2 text-sm text-slate-600">{t.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => open(t)}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Use this template
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
