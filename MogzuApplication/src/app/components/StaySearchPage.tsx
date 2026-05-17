import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Calendar as CalIcon,
  Loader2,
  MapPin,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type {
  Listing,
  ListingImage,
  TravelPolicy,
  Vendor,
} from '@/lib/database.types'

type StayRow = Listing & {
  listing_images: ListingImage[]
  vendors: Pick<Vendor, 'business_name'> | null
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowIso(): string {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return t.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.max(
    0,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000),
  )
}

type PolicyCheck = {
  withinPolicy: boolean
  reasons: string[]
}

function evaluatePolicy(
  listing: Listing,
  policies: TravelPolicy[],
  checkIn: string,
): PolicyCheck {
  if (policies.length === 0) {
    return { withinPolicy: true, reasons: [] }
  }
  const reasons: string[] = []
  let rateOk = false
  let cityOk = false
  let leadOk = false
  for (const p of policies) {
    if (listing.base_price != null && listing.base_price <= p.max_nightly_rate) rateOk = true
    const cities = p.approved_cities ?? []
    if (
      cities.length === 0 ||
      (listing.location_city && cities.includes(listing.location_city))
    ) {
      cityOk = true
    }
    const lead = daysBetween(todayIso(), checkIn)
    if (lead >= p.min_lead_days) leadOk = true
  }
  if (!rateOk) {
    const minCap = Math.min(...policies.map((p) => p.max_nightly_rate))
    reasons.push(`Rate ₹${listing.base_price ?? '—'} above policy cap ₹${minCap}`)
  }
  if (!cityOk && listing.location_city) {
    reasons.push(`City ${listing.location_city} not in approved list`)
  }
  if (!leadOk) {
    const maxLead = Math.max(...policies.map((p) => p.min_lead_days))
    reasons.push(`Check-in inside ${maxLead}-day lead window`)
  }
  return { withinPolicy: reasons.length === 0, reasons }
}

export default function StaySearchPage() {
  const navigate = useNavigate()
  const { profile, corporateId, role } = useAuth()
  const canBook = role === 'l1_employee' || role === 'l2_manager' || role === 'l3_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [city, setCity] = useState('')
  const [checkIn, setCheckIn] = useState(tomorrowIso())
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().slice(0, 10)
  })
  const [stays, setStays] = useState<StayRow[]>([])
  const [policies, setPolicies] = useState<TravelPolicy[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [lRes, pRes] = await Promise.all([
      db.listings.listByModule('spacex_stay', 'active'),
      corporateId && role
        ? db.travelPolicies.listActiveForRole(corporateId, role, 'spacex_stay')
        : Promise.resolve({ data: [], error: null }),
    ])
    setStays((lRes.data ?? []) as StayRow[])
    setPolicies((pRes.data ?? []) as TravelPolicy[])
    setLoading(false)
  }, [corporateId, role])

  useEffect(() => {
    load()
  }, [load])

  const results = useMemo(() => {
    const q = city.trim().toLowerCase()
    return stays
      .filter((s) => !q || (s.location_city ?? '').toLowerCase().includes(q))
      .map((s) => ({ stay: s, policy: evaluatePolicy(s, policies, checkIn) }))
  }, [stays, city, policies, checkIn])

  const nights = daysBetween(checkIn, checkOut)

  if (!canBook) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">Corporate account required.</p>
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
          <div className="mx-auto max-w-5xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0e1e3f]">Stay search</h1>
              <p className="mt-1 text-sm text-slate-500">
                Find a corporate-approved hotel or serviced apartment. Stays outside your travel
                policy are flagged "requires approval".
              </p>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <Search className="size-3" /> City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Bengaluru"
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <CalIcon className="size-3" /> Check-in
                </label>
                <input
                  type="date"
                  min={todayIso()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <CalIcon className="size-3" /> Check-out
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                />
              </div>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              {nights} night{nights !== 1 ? 's' : ''} · {policies.length} active polic
              {policies.length === 1 ? 'y' : 'ies'} for your role
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <MapPin className="mx-auto mb-2 size-10 text-slate-300" />
                <p className="text-sm text-slate-500">No stays match this search.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {results.map(({ stay, policy }) => {
                  const cover = stay.listing_images?.[0]
                  const subtotal = (stay.base_price ?? 0) * nights
                  return (
                    <li
                      key={stay.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
                    >
                      <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-28">
                        {cover && (
                          <img
                            src={storageService.spaceImages.getUrl(cover.storage_path)}
                            alt=""
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{stay.title}</p>
                          {policy.withinPolicy ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                              Within policy
                            </span>
                          ) : (
                            <span
                              className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                              title={policy.reasons.join(' · ')}
                            >
                              Requires approval
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {stay.vendors?.business_name ?? '—'}
                          {stay.location_city ? ` · ${stay.location_city}` : ''}
                        </p>
                        {!policy.withinPolicy && (
                          <p className="text-[11px] text-amber-700">
                            {policy.reasons.join(' · ')}
                          </p>
                        )}
                        <p className="mt-1 text-sm">
                          <strong>₹{stay.base_price?.toLocaleString('en-IN') ?? '—'}</strong>{' '}
                          / night · {nights}n total ₹{subtotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-end">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/book/space/${stay.id}?from=${checkIn}&to=${checkOut}`,
                            )
                          }
                          className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Book stay
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
              Auto-generated invoice on booking and policy-violation report (monthly) deferred
              to the N8N invoicing workflow and Resend dispatch.
            </p>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
