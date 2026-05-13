import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  deleteVendorGiftingProduct,
  loadVendorGiftingState,
  saveVendorGiftingSettings,
  type OrderStatus,
  type PricingType,
  type ProductStatus,
  updateVendorGiftingOrderStatus,
  type VendorGiftingOrder,
} from '@/app/lib/vendorGiftingStore'

type DashboardTab = 'products' | 'orders' | 'performance' | 'settings'

const statusClass: Record<ProductStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-blue-100 text-blue-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const orderStatusClass: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

const pricingLabel: Record<PricingType, string> = {
  fixed: 'Fixed',
  offer: 'Offer Price',
  request: 'Request for Price',
}

export default function VendorGiftingDashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState(() => loadVendorGiftingState())
  const [activeTab, setActiveTab] = useState<DashboardTab>('products')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pricingFilter, setPricingFilter] = useState<'all' | PricingType>('all')
  const [orderDrawer, setOrderDrawer] = useState<VendorGiftingOrder | null>(null)

  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      if (search && !`${p.productName} ${p.subCategory}`.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (pricingFilter !== 'all' && p.pricingType !== pricingFilter) return false
      return true
    })
  }, [state.products, search, statusFilter, categoryFilter, pricingFilter])

  const stats = useMemo(() => {
    const totalProducts = state.products.length
    const activeListings = state.products.filter((p) => p.status === 'active').length
    const pendingOrders = state.orders.filter((o) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length
    const totalRevenue = state.orders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.amount, 0)
    return { totalProducts, activeListings, pendingOrders, totalRevenue }
  }, [state.orders, state.products])

  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    state.orders.forEach((o) => o.products.forEach((p) => map.set(p.productName, (map.get(p.productName) || 0) + p.quantity)))
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [state.orders])

  const handleDelete = (id: string) => setState(deleteVendorGiftingProduct(id))

  const handlePauseResume = (id: string) => {
    const next = {
      ...state,
      products: state.products.map((p) =>
        p.id === id ? { ...p, status: p.status === 'paused' ? 'active' : 'paused', updatedAt: new Date().toISOString() } : p,
      ),
    }
    localStorage.setItem('mogzu_vendor_gifting_state_v1', JSON.stringify(next))
    setState(next)
  }

  const handleOrderStatusUpdate = (id: string, status: OrderStatus) => {
    const next = updateVendorGiftingOrderStatus(id, status)
    setState(next)
    setOrderDrawer(next.orders.find((o) => o.id === id) || null)
  }

  const repeatBuyerRate = 42
  const avgRating = 4.6
  const avgOrderValue = Math.round((state.orders.reduce((sum, o) => sum + o.amount, 0) || 1) / (state.orders.length || 1))
  const totalReviews = state.products.length * 7

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6">
      <h1 className="text-2xl font-bold text-[#0e1e3f] mb-4">Vendor Gifting Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Active Listings" value={stats.activeListings} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} />
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto whitespace-nowrap">
        <TabButton label="My Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        <TabButton label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <TabButton label="Performance" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
        <TabButton label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-[#ececec] p-4">
          <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="h-10 px-3 border border-[#e5e7eb] rounded-lg" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ProductStatus)} className="h-10 px-3 border border-[#e5e7eb] rounded-lg">
                <option value="all">Status: All</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 border border-[#e5e7eb] rounded-lg">
                <option value="all">Category: All</option>
                <option value="Apparel">Apparel</option>
                <option value="Bags">Bags</option>
                <option value="Stationary">Stationary</option>
                <option value="Tech">Tech</option>
                <option value="Health & Wellness">Health & Wellness</option>
              </select>
              <select value={pricingFilter} onChange={(e) => setPricingFilter(e.target.value as 'all' | PricingType)} className="h-10 px-3 border border-[#e5e7eb] rounded-lg">
                <option value="all">Pricing Type: All</option>
                <option value="fixed">Fixed</option>
                <option value="offer">Offer Price</option>
                <option value="request">Request for Price</option>
              </select>
            </div>
            <button onClick={() => navigate('/vendor/gifting/products/new')} className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold">+ Add Product</button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-[#cbd5e1] rounded-lg">
              <p className="text-[#64748b] mb-3">No products yet</p>
              <button onClick={() => navigate('/vendor/gifting/products/new')} className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold">Add Product</button>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#64748b]">
                    <th className="py-2">Thumbnail</th>
                    <th className="py-2">Product</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Pricing Type</th>
                    <th className="py-2">MOQ</th>
                    <th className="py-2">Price / unit</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-t border-[#f1f5f9]">
                      <td className="py-2"><img src={p.primaryImage?.url || 'https://placehold.co/40x40'} alt={p.productName} className="w-10 h-10 rounded object-cover" /></td>
                      <td className="py-2">
                        <p className="font-semibold text-[#0e1e3f]">{p.productName}</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#ebf1ff] text-[#2563eb]">{p.subCategory}</span>
                      </td>
                      <td className="py-2">{p.category}</td>
                      <td className="py-2"><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{pricingLabel[p.pricingType]}</span></td>
                      <td className="py-2">{p.moq}</td>
                      <td className="py-2">{p.pricingType === 'request' ? '—' : `₹${p.offerPrice || p.pricePerUnit || p.originalPrice || 0}`}</td>
                      <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded ${statusClass[p.status]}`}>{p.status}</span></td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/vendor/gifting/products/${p.id}`)} className="text-[#2563eb]">Edit</button>
                          <button onClick={() => handlePauseResume(p.id)} className="text-[#2563eb]">{p.status === 'paused' ? 'Resume' : 'Pause'}</button>
                          <button onClick={() => handleDelete(p.id)} className="text-rose-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-[#ececec] p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748b]">
                <th className="py-2">Order ID</th>
                <th className="py-2">Corporate Name</th>
                <th className="py-2">Products</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.orders.map((o) => (
                <tr key={o.id} className="border-t border-[#f1f5f9]">
                  <td className="py-2">{o.id}</td>
                  <td className="py-2">{o.corporateName}</td>
                  <td className="py-2">{o.products.map((p) => p.productName).join(', ')}</td>
                  <td className="py-2">{o.quantity}</td>
                  <td className="py-2">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded ${orderStatusClass[o.status]}`}>{o.status}</span></td>
                  <td className="py-2">{o.date}</td>
                  <td className="py-2">
                    <button onClick={() => setOrderDrawer(o)} className="text-[#2563eb]">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#ececec] p-4 xl:col-span-2">
            <h3 className="font-semibold text-[#0e1e3f] mb-3">Revenue over time (30 days)</h3>
            <div className="h-40 flex items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 bg-[#2563eb1A] rounded-t" style={{ height: `${20 + ((i * 13) % 80)}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#ececec] p-4">
            <h3 className="font-semibold text-[#0e1e3f] mb-3">Order status breakdown</h3>
            <div className="w-36 h-36 mx-auto rounded-full border-[14px] border-[#2563eb] border-r-[#f59e0b] border-b-[#10b981] border-l-[#6366f1]" />
          </div>
          <div className="bg-white rounded-xl border border-[#ececec] p-4 xl:col-span-2">
            <h3 className="font-semibold text-[#0e1e3f] mb-3">Top 5 products by orders</h3>
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm"><span>{p.name}</span><span>{p.qty}</span></div>
                  <div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-[#2563eb] rounded" style={{ width: `${Math.min(100, p.qty)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#ececec] p-4">
            <h3 className="font-semibold text-[#0e1e3f] mb-3">KPIs</h3>
            <div className="space-y-2 text-sm">
              <p>Avg order value: <strong>₹{avgOrderValue.toLocaleString('en-IN')}</strong></p>
              <p>Repeat buyer rate: <strong>{repeatBuyerRate}%</strong></p>
              <p>Total reviews: <strong>{totalReviews}</strong></p>
              <p>Avg rating: <strong>{avgRating}</strong></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-[#ececec] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={state.settings.businessName} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, businessName: e.target.value } }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" placeholder="Business name" />
            <input value={state.settings.gstin} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, gstin: e.target.value } }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" placeholder="GSTIN" />
            <input value={state.settings.pan} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, pan: e.target.value } }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" placeholder="PAN" />
            <input value={state.settings.bankDetails} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, bankDetails: e.target.value } }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" placeholder="Bank details" />
            <input value={state.settings.logoUrl} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, logoUrl: e.target.value } }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg md:col-span-2" placeholder="Logo URL" />
            <textarea value={state.settings.pickupDeliveryPreferences} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, pickupDeliveryPreferences: e.target.value } }))} className="rounded-lg border border-[#e5e7eb] p-3 md:col-span-2" rows={3} placeholder="Pickup/delivery preferences" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.settings.notifyEmail} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, notifyEmail: e.target.checked } }))} />Email notifications</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.settings.notifySms} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, notifySms: e.target.checked } }))} />SMS notifications</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.settings.notifyWhatsapp} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, notifyWhatsapp: e.target.checked } }))} />WhatsApp notifications</label>
          </div>
          <button
            onClick={() => {
              const next = saveVendorGiftingSettings(state.settings)
              setState(next)
            }}
            className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold mt-4"
          >
            Save Changes
          </button>
        </div>
      )}

      {orderDrawer && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setOrderDrawer(null)}>
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-[#ececec] p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#0e1e3f]">Order {orderDrawer.id}</h3>
              <button onClick={() => setOrderDrawer(null)}>Close</button>
            </div>
            <p className="text-sm text-[#64748b] mb-2">{orderDrawer.corporateName}</p>
            <p className="text-sm mb-1"><strong>Contact:</strong> {orderDrawer.contactName}</p>
            <p className="text-sm mb-1"><strong>Email:</strong> {orderDrawer.contactEmail}</p>
            <p className="text-sm mb-1"><strong>Phone:</strong> {orderDrawer.contactPhone}</p>
            <p className="text-sm mb-2"><strong>Address:</strong> {orderDrawer.deliveryAddress}</p>
            <div className="border rounded p-3 mb-3">
              {orderDrawer.products.map((p) => (
                <div key={p.productId} className="flex justify-between text-sm py-1">
                  <span>{p.productName} x {p.quantity}</span>
                  <span>₹{(p.quantity * p.unitPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <select
              value={orderDrawer.status}
              onChange={(e) => handleOrderStatusUpdate(orderDrawer.id, e.target.value as OrderStatus)}
              className="h-10 px-3 border border-[#e5e7eb] rounded-lg w-full mb-3"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <h4 className="font-semibold mb-2">Timeline</h4>
            <div className="space-y-2">
              {orderDrawer.timeline.map((t, idx) => (
                <div key={`${t.at}-${idx}`} className="text-sm border-l-2 border-[#e2e8f0] pl-3">
                  <p>{t.message}</p>
                  <p className="text-xs text-[#64748b]">{new Date(t.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-[#ececec] rounded-xl p-4">
      <p className="text-sm text-[#64748b]">{label}</p>
      <p className="text-2xl font-bold text-[#0e1e3f]">{value}</p>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 rounded-lg border text-sm font-medium ${active ? 'bg-[#ebf1ff] border-[#2563eb] text-[#2563eb]' : 'bg-white border-[#e5e7eb] text-[#475569]'}`}
    >
      {label}
    </button>
  )
}

