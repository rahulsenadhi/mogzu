import { useMemo, useState } from 'react'
import { getAdminGiftingState, loadAdminVendorProfiles, saveAdminVendorProfiles, type AdminVendorStatus } from '@/app/lib/adminGiftingStore'

export default function AdminGiftingVendorsPage() {
  const [vendorProfiles, setVendorProfiles] = useState(() => loadAdminVendorProfiles())
  const [state] = useState(() => getAdminGiftingState())
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)

  const rows = useMemo(() => {
    return vendorProfiles.map((v) => {
      const listings = state.products.filter((p) => (p.vendorName || state.settings.businessName) === v.vendorName)
      const orders = state.orders.filter((o) => (o.vendorName || state.settings.businessName) === v.vendorName)
      const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.amount, 0)
      return {
        ...v,
        activeListings: listings.filter((p) => p.status === 'active').length,
        totalOrders: orders.length,
        revenue,
        listings,
        orders,
      }
    })
  }, [state.orders, state.products, state.settings.businessName, vendorProfiles])

  const selected = rows.find((r) => r.id === selectedVendorId) || null

  const setVendorStatus = (id: string, status: AdminVendorStatus) => {
    const next = vendorProfiles.map((v) =>
      v.id === id
        ? {
            ...v,
            status,
            approvalHistory: [{ at: new Date().toISOString(), message: `Vendor status changed to ${status}` }, ...v.approvalHistory],
          }
        : v,
    )
    setVendorProfiles(next)
    saveAdminVendorProfiles(next)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0e1e3f] mb-4">Gifting Vendor Management</h1>
      <div className="bg-white border border-[#ececec] rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#64748b]">
            <tr>
              <th className="py-2 px-3">Vendor Name</th>
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
                <td className="py-2 px-3">{row.vendorName}</td>
                <td className="py-2">{row.category}</td>
                <td className="py-2">{row.activeListings}</td>
                <td className="py-2">{row.totalOrders}</td>
                <td className="py-2">₹{row.revenue.toLocaleString('en-IN')}</td>
                <td className="py-2">{row.status}</td>
                <td className="py-2"><button onClick={() => setSelectedVendorId(row.id)} className="text-[#2563eb]">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSelectedVendorId(null)}>
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white border-l border-[#ececec] p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{selected.vendorName}</h3>
              <button onClick={() => setSelectedVendorId(null)}>Close</button>
            </div>
            <p className="text-sm"><strong>Status:</strong> {selected.status}</p>
            <p className="text-sm"><strong>Email:</strong> {selected.contactEmail}</p>
            <p className="text-sm"><strong>Phone:</strong> {selected.contactPhone}</p>
            <p className="text-sm"><strong>GSTIN:</strong> {selected.gstin}</p>
            <p className="text-sm"><strong>PAN:</strong> {selected.pan}</p>
            <p className="text-sm mb-2"><strong>Bank:</strong> {selected.bankDetails}</p>

            <h4 className="font-semibold mb-2">Listings</h4>
            <div className="space-y-1 mb-3">
              {selected.listings.map((l) => (
                <div key={l.id} className="text-sm flex items-center justify-between border rounded px-2 py-1">
                  <span>{l.productName}</span>
                  <span>{l.status}</span>
                </div>
              ))}
            </div>

            <h4 className="font-semibold mb-2">Order history</h4>
            <div className="space-y-1 mb-3">
              {selected.orders.map((o) => (
                <div key={o.id} className="text-sm flex items-center justify-between border rounded px-2 py-1">
                  <span>{o.id}</span>
                  <span>{o.status}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button onClick={() => setVendorStatus(selected.id, 'suspended')} className="h-9 rounded bg-rose-600 text-white text-sm">Suspend</button>
              <button onClick={() => setVendorStatus(selected.id, 'active')} className="h-9 rounded bg-emerald-600 text-white text-sm">Reactivate</button>
              <button
                onClick={() => {
                  const next = vendorProfiles.map((v) =>
                    v.id === selected.id
                      ? { ...v, approvalHistory: [{ at: new Date().toISOString(), message: 'Admin sent message to vendor' }, ...v.approvalHistory] }
                      : v,
                  )
                  setVendorProfiles(next)
                  saveAdminVendorProfiles(next)
                }}
                className="h-9 rounded border border-[#2563eb] text-[#2563eb] text-sm"
              >
                Send Message
              </button>
            </div>

            <h4 className="font-semibold mb-2">Approval history</h4>
            <div className="space-y-2">
              {selected.approvalHistory.map((h, idx) => (
                <div key={`${h.at}-${idx}`} className="text-sm border-l-2 border-[#e2e8f0] pl-3">
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

