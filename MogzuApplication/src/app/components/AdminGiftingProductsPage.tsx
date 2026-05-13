import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { approveProducts, getAdminGiftingState } from '@/app/lib/adminGiftingStore'
import type { ProductStatus } from '@/app/lib/vendorGiftingStore'

export default function AdminGiftingProductsPage() {
  const navigate = useNavigate()
  const [state, setState] = useState(() => getAdminGiftingState())
  const [statusTab, setStatusTab] = useState<'all' | ProductStatus>('all')
  const [selected, setSelected] = useState<string[]>([])

  const products = useMemo(
    () => (statusTab === 'all' ? state.products : state.products.filter((p) => p.status === statusTab)),
    [state.products, statusTab],
  )

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selected.length === products.length) {
      setSelected([])
      return
    }
    setSelected(products.map((p) => p.id))
  }

  const handleApproveAll = () => {
    if (!selected.length) return
    const next = approveProducts(selected)
    setState(next)
    setSelected([])
  }

  const handleRejectAll = () => {
    if (!selected.length) return
    const reason = 'Bulk rejection by admin'
    let next = state
    selected.forEach((id) => {
      next = {
        ...next,
        products: next.products.map((p) =>
          p.id === id
            ? { ...p, status: 'rejected', rejectionReason: reason, activityLog: [{ at: new Date().toISOString(), message: `Rejected by admin: ${reason}` }, ...(p.activityLog || [])] }
            : p,
        ),
      }
    })
    localStorage.setItem('mogzu_vendor_gifting_state_v1', JSON.stringify(next))
    setState(next)
    setSelected([])
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0e1e3f] mb-4">Gifting Product Approval Queue</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto whitespace-nowrap">
        {(['all', 'pending', 'active', 'rejected', 'paused'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`h-9 px-4 rounded-lg border text-sm ${statusTab === tab ? 'bg-[#ebf1ff] border-[#2563eb] text-[#2563eb]' : 'bg-white border-[#e5e7eb]'}`}
          >
            {tab === 'all' ? 'All' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={handleApproveAll} className="h-9 px-3 rounded bg-emerald-600 text-white text-sm">Approve All</button>
        <button onClick={handleRejectAll} className="h-9 px-3 rounded bg-rose-600 text-white text-sm">Reject All</button>
      </div>
      <div className="bg-white border border-[#ececec] rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#64748b]">
            <tr>
              <th className="py-2 px-2"><input type="checkbox" checked={selected.length > 0 && selected.length === products.length} onChange={toggleAll} /></th>
              <th className="py-2">Thumbnail</th>
              <th className="py-2">Product Name</th>
              <th className="py-2">Vendor Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Pricing Type</th>
              <th className="py-2">Submitted Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                <td className="py-2 px-2"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} /></td>
                <td className="py-2"><img src={p.primaryImage?.url || 'https://placehold.co/40x40'} alt={p.productName} className="w-10 h-10 rounded object-cover" /></td>
                <td className="py-2">{p.productName}</td>
                <td className="py-2">{p.vendorName || 'Mogzu Vendor Pvt Ltd'}</td>
                <td className="py-2">{p.category}</td>
                <td className="py-2">{p.pricingType}</td>
                <td className="py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="py-2">{p.status}</td>
                <td className="py-2">
                  <button onClick={() => navigate(`/admin/gifting/products/${p.id}`)} className="text-[#2563eb]">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

