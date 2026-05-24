import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  loadAdminVendorProfiles,
  type AdminVendorProfile,
  type AdminVendorStatus,
} from '@/app/lib/adminGiftingStore'
import { bookingToOrderStatus } from '@/app/lib/giftingBookingOrders'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { Booking, Listing, UserProfile, Vendor, VendorStatus } from '@/lib/database.types'

type VendorRow = Vendor & {
  vendor_modules: { module: string; status: string }[] | null
  user_profiles: Pick<UserProfile, 'full_name' | 'phone'> | null
}

type GiftingVendorRow = {
  id: string
  vendorName: string
  category: string
  status: AdminVendorStatus
  contactEmail: string
  contactPhone: string
  gstin: string
  pan: string
  bankDetails: string
  activeListings: number
  totalOrders: number
  revenue: number
  listings: { id: string; title: string; status: string }[]
  orders: { id: string; status: string }[]
  approvalHistory: Array<{ at: string; message: string }>
  isDemo: boolean
}

function mapVendorStatus(status: VendorStatus): AdminVendorStatus {
  if (status === 'active') return 'active'
  if (status === 'suspended') return 'suspended'
  return 'pending_verification'
}

function demoToRows(profiles: AdminVendorProfile[]): GiftingVendorRow[] {
  return profiles.map((v) => ({
    id: v.id,
    vendorName: v.vendorName,
    category: v.category,
    status: v.status,
    contactEmail: v.contactEmail,
    contactPhone: v.contactPhone,
    gstin: v.gstin,
    pan: v.pan,
    bankDetails: v.bankDetails,
    activeListings: 0,
    totalOrders: 0,
    revenue: 0,
    listings: [],
    orders: [],
    approvalHistory: v.approvalHistory,
    isDemo: true,
  }))
}

function hasGiftingModule(v: VendorRow): boolean {
  const mods = v.vendor_modules ?? []
  return mods.some((m) => m.module === 'gifting' && m.status === 'active')
}

export default function AdminGiftingVendorsPage() {
  const [rows, setRows] = useState<GiftingVendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice('')

    const [vendorsRes, listingsRes, bookingsRes] = await Promise.all([
      supabase
        .from('vendors')
        .select('*, vendor_modules(module, status), user_profiles!user_id(full_name, phone)'),
      supabase.from('listings').select('id, vendor_id, title, status, module').eq('module', 'gifting'),
      supabase
        .from('bookings')
        .select('id, vendor_id, total_amount, status, fulfilment_stage, module, created_at')
        .eq('module', 'gifting'),
    ])

    const vendors = ((vendorsRes.data ?? []) as VendorRow[]).filter(hasGiftingModule)
    const listings = (listingsRes.data ?? []) as Listing[]
    const bookings = (bookingsRes.data ?? []) as Booking[]

    if (vendors.length === 0) {
      setUsingDemo(true)
      setRows(demoToRows(loadAdminVendorProfiles()))
      setLoading(false)
      return
    }

    setUsingDemo(false)
    const listingsByVendor = new Map<string, Listing[]>()
    for (const l of listings) {
      if (!l.vendor_id) continue
      const list = listingsByVendor.get(l.vendor_id) ?? []
      list.push(l)
      listingsByVendor.set(l.vendor_id, list)
    }

    const bookingsByVendor = new Map<string, Booking[]>()
    for (const b of bookings) {
      if (!b.vendor_id) continue
      const list = bookingsByVendor.get(b.vendor_id) ?? []
      list.push(b)
      bookingsByVendor.set(b.vendor_id, list)
    }

    setRows(
      vendors.map((v) => {
        const vListings = listingsByVendor.get(v.id) ?? []
        const vBookings = bookingsByVendor.get(v.id) ?? []
        const revenue = vBookings
          .filter((b) => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.total_amount ?? 0), 0)
        return {
          id: v.id,
          vendorName: v.business_name,
          category: vListings[0]?.title ? 'Gifting' : 'Gifting',
          status: mapVendorStatus(v.status),
          contactEmail: '—',
          contactPhone: v.user_profiles?.phone ?? '—',
          gstin: v.gst_number ?? '—',
          pan: '—',
          bankDetails: v.bank_account_verified ? 'Verified payout account' : 'Payout not verified',
          activeListings: vListings.filter((l) => l.status === 'active').length,
          totalOrders: vBookings.length,
          revenue,
          listings: vListings.map((l) => ({ id: l.id, title: l.title, status: l.status })),
          orders: vBookings.map((b) => ({
            id: b.id.slice(0, 8).toUpperCase(),
            status: bookingToOrderStatus(b),
          })),
          approvalHistory: [
            {
              at: v.updated_at,
              message: `Vendor ${v.status}${v.kyc_status ? ` · KYC ${v.kyc_status}` : ''}`,
            },
          ],
          isDemo: false,
        }
      }),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedVendorId) ?? null,
    [rows, selectedVendorId],
  )

  const setVendorStatus = async (row: GiftingVendorRow, status: VendorStatus) => {
    if (row.isDemo) {
      setNotice('Demo vendor — sign in with live data or complete vendor onboarding.')
      return
    }
    setBusyId(row.id)
    setNotice('')
    const { error } = await db.vendors.updateStatus(row.id, status)
    if (error) setNotice(error.message)
    else {
      setNotice(`${row.vendorName} → ${status}`)
      await load()
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-4 p-6">
      <AdminPageTitleRow title="Gifting Vendor Management" totalLabel={`${rows.length} vendors`} />

      {usingDemo && import.meta.env.DEV && (
        <DevMockDataBanner message="No gifting vendors in Supabase — showing demo vendor profiles." />
      )}

      {notice && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {notice}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-[#ececec] bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading vendors…
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No gifting vendors found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#64748b]">
              <tr>
                <th className="px-3 py-2">Vendor Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Active Listings</th>
                <th className="py-2">Total Orders</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                  <td className="px-3 py-2">{row.vendorName}</td>
                  <td className="py-2">{row.category}</td>
                  <td className="py-2">{row.activeListings}</td>
                  <td className="py-2">{row.totalOrders}</td>
                  <td className="py-2">₹{row.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-2">{row.status}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVendorId(row.id)}
                      className="text-[#2563eb]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setSelectedVendorId(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full overflow-auto border-l border-[#ececec] bg-white p-4 sm:w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selected.vendorName}</h3>
              <button type="button" onClick={() => setSelectedVendorId(null)}>
                Close
              </button>
            </div>
            <p className="text-sm">
              <strong>Status:</strong> {selected.status}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {selected.contactPhone}
            </p>
            <p className="text-sm">
              <strong>GSTIN:</strong> {selected.gstin}
            </p>
            <p className="mb-2 text-sm">
              <strong>Payout:</strong> {selected.bankDetails}
            </p>

            <h4 className="mb-2 font-semibold">Listings</h4>
            <div className="mb-3 space-y-1">
              {selected.listings.length === 0 ? (
                <p className="text-sm text-slate-500">No gifting listings.</p>
              ) : (
                selected.listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded border px-2 py-1 text-sm"
                  >
                    <span>{l.title}</span>
                    <span>{l.status}</span>
                  </div>
                ))
              )}
            </div>

            <h4 className="mb-2 font-semibold">Order history</h4>
            <div className="mb-3 space-y-1">
              {selected.orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders yet.</p>
              ) : (
                selected.orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded border px-2 py-1 text-sm"
                  >
                    <span>{o.id}</span>
                    <span>{o.status}</span>
                  </div>
                ))
              )}
            </div>

            {!selected.isDemo && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={() => void setVendorStatus(selected, 'suspended')}
                  className="h-9 rounded bg-rose-600 text-sm text-white disabled:opacity-50"
                >
                  Suspend
                </button>
                <button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={() => void setVendorStatus(selected, 'active')}
                  className="h-9 rounded bg-emerald-600 text-sm text-white disabled:opacity-50"
                >
                  Reactivate
                </button>
              </div>
            )}

            <h4 className="mb-2 font-semibold">History</h4>
            <div className="space-y-2">
              {selected.approvalHistory.map((h, idx) => (
                <div key={`${h.at}-${idx}`} className="border-l-2 border-[#e2e8f0] pl-3 text-sm">
                  <p>{h.message}</p>
                  <p className="text-xs text-[#64748b]">{new Date(h.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
