import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import {
  loadVendorGiftingState,
  saveVendorGiftingSettings,
  type OrderStatus,
  updateVendorGiftingOrderStatus,
  type VendorGiftingOrder,
  type VendorGiftingSettings,
} from '@/app/lib/vendorGiftingStore'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import type { Listing, ListingImage, ListingStatus } from '@/lib/database.types'

type ListingWithImages = Listing & { listing_images: ListingImage[] }

type DashboardTab = 'products' | 'orders' | 'performance' | 'settings'

const MODULE_ID = 'gifting' as const

const statusClass: Record<ListingStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-blue-100 text-blue-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const statusLabel: Record<ListingStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending',
  active: 'Active',
  paused: 'Paused',
  rejected: 'Rejected',
}

const orderStatusClass: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

const pricingLabel: Record<Listing['pricing_type'], string> = {
  transparent: 'Fixed',
  offer: 'Offer',
  request_for_price: 'Request',
}

type GiftingMetadata = {
  moq?: number
  inventory?: number
  outOfStock?: boolean
}

export default function VendorGiftingDashboardPage() {
  const navigate = useNavigate()
  const { vendorId } = useAuth()

  const [activeTab, setActiveTab] = useState<DashboardTab>('products')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all')

  // Supabase-backed product catalogue
  const [products, setProducts] = useState<ListingWithImages[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  // Mock-backed orders + settings (out of 4.4 scope — future sprint wiring)
  const [storeState, setStoreState] = useState(() => loadVendorGiftingState())
  const [orderDrawer, setOrderDrawer] = useState<VendorGiftingOrder | null>(null)

  const loadProducts = useCallback(async () => {
    if (!vendorId) return
    setProductsLoading(true)
    setProductsError('')
    const { data, error } = await db.listings.listByVendor(vendorId)
    if (error) setProductsError(error.message)
    else {
      const all = (data ?? []) as ListingWithImages[]
      setProducts(all.filter((l) => l.module === MODULE_ID))
    }
    setProductsLoading(false)
  }, [vendorId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    })
  }, [products, search, statusFilter])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const activeListings = products.filter((p) => p.status === 'active').length
    const pendingOrders = storeState.orders.filter((o) =>
      ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status),
    ).length
    const totalRevenue = storeState.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.amount, 0)
    return { totalProducts, activeListings, pendingOrders, totalRevenue }
  }, [products, storeState.orders])

  const handlePauseResume = async (p: ListingWithImages) => {
    const next: ListingStatus = p.status === 'paused' ? 'active' : 'paused'
    const { error } = await db.listings.updateStatus(p.id, next)
    if (!error) loadProducts()
  }

  const handleDelete = async (p: ListingWithImages) => {
    if (p.status !== 'draft') return
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    if (p.listing_images?.length) {
      await storageService.giftImages.delete(p.listing_images.map((i) => i.storage_path))
    }
    await db.listings.update(p.id, { status: 'paused' })
    loadProducts()
  }

  const handleOrderStatusUpdate = (id: string, status: OrderStatus) => {
    const next = updateVendorGiftingOrderStatus(id, status)
    setStoreState(next)
    setOrderDrawer(next.orders.find((o) => o.id === id) || null)
  }

  const updateSettings = (patch: Partial<VendorGiftingSettings>) =>
    setStoreState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))

  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    storeState.orders.forEach((o) =>
      o.products.forEach((p) => map.set(p.productName, (map.get(p.productName) || 0) + p.quantity)),
    )
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [storeState.orders])

  const avgOrderValue = Math.round(
    (storeState.orders.reduce((sum, o) => sum + o.amount, 0) || 1) /
      (storeState.orders.length || 1),
  )

  return (
    <div className="min-h-screen bg-[#FFFDF9] px-5 md:px-8 lg:px-12 py-6">
      <h1 className="mb-4 text-2xl font-bold text-[#0e1e3f]">Vendor Gifting Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Active Listings" value={stats.activeListings} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} />
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto whitespace-nowrap">
        <TabButton label="My Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        <TabButton label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <TabButton label="Performance" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
        <TabButton label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {activeTab === 'products' && (
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ListingStatus)}
                className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              >
                <option value="all">Status: All</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/vendor/gifting/products/new')}
              disabled={!vendorId}
              className="h-10 rounded-lg bg-[#2563eb] px-4 font-semibold text-white disabled:opacity-50"
            >
              + Add Product
            </button>
          </div>

          {productsError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{productsError}</p>
              <button
                onClick={loadProducts}
                className="mt-2 rounded bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white"
              >
                Retry
              </button>
            </div>
          )}

          {productsLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#cbd5e1] py-14 text-center">
              <p className="mb-3 text-[#64748b]">No products yet</p>
              <button
                onClick={() => navigate('/vendor/gifting/products/new')}
                disabled={!vendorId}
                className="h-10 rounded-lg bg-[#2563eb] px-4 font-semibold text-white disabled:opacity-50"
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#64748b]">
                    <th className="py-2">Thumbnail</th>
                    <th className="py-2">Product</th>
                    <th className="py-2">Pricing</th>
                    <th className="py-2">MOQ</th>
                    <th className="py-2">Price / unit</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const md = (p.metadata ?? {}) as GiftingMetadata
                    const cover = p.listing_images?.[0]
                    const lowStock = md.inventory != null && md.inventory < 10
                    return (
                      <tr key={p.id} className="border-t border-[#f1f5f9]">
                        <td className="py-2">
                          {cover ? (
                            <img
                              src={storageService.giftImages.getUrl(cover.storage_path)}
                              alt=""
                              className="size-10 rounded object-cover"
                            />
                          ) : (
                            <div className="size-10 rounded bg-slate-100" />
                          )}
                        </td>
                        <td className="py-2">
                          <p className="font-semibold text-[#0e1e3f]">{p.title}</p>
                          {p.location_city && (
                            <span className="text-xs text-slate-500">{p.location_city}</span>
                          )}
                        </td>
                        <td className="py-2">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                            {pricingLabel[p.pricing_type]}
                          </span>
                        </td>
                        <td className="py-2">{md.moq ?? '—'}</td>
                        <td className="py-2">
                          {p.pricing_type === 'request_for_price' || p.base_price == null
                            ? '—'
                            : `₹${p.base_price.toLocaleString('en-IN')}`}
                        </td>
                        <td className="py-2">
                          {md.outOfStock ? (
                            <span className="rounded bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                              Out of stock
                            </span>
                          ) : md.inventory != null ? (
                            <span className={lowStock ? 'text-rose-600 font-medium' : ''}>
                              {md.inventory}
                              {lowStock && <span className="ml-1 text-[10px]">(low)</span>}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2">
                          <span className={`rounded px-2 py-0.5 text-xs ${statusClass[p.status]}`}>
                            {statusLabel[p.status]}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/vendor/gifting/products/${p.id}`)}
                              className="text-[#2563eb]"
                            >
                              Edit
                            </button>
                            {(p.status === 'active' || p.status === 'paused') && (
                              <button
                                onClick={() => handlePauseResume(p)}
                                className="text-[#2563eb]"
                              >
                                {p.status === 'paused' ? 'Resume' : 'Pause'}
                              </button>
                            )}
                            {p.status === 'draft' && (
                              <button onClick={() => handleDelete(p)} className="text-rose-600">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="overflow-auto rounded-xl border border-[#ececec] bg-white p-4">
          <p className="mb-3 text-xs text-amber-700">
            Orders are demo data. Real order pipeline ships in Sprint 4.
          </p>
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
              {storeState.orders.map((o) => (
                <tr key={o.id} className="border-t border-[#f1f5f9]">
                  <td className="py-2">{o.id}</td>
                  <td className="py-2">{o.corporateName}</td>
                  <td className="py-2">{o.products.map((p) => p.productName).join(', ')}</td>
                  <td className="py-2">{o.quantity}</td>
                  <td className="py-2">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${orderStatusClass[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2">{o.date}</td>
                  <td className="py-2">
                    <button onClick={() => setOrderDrawer(o)} className="text-[#2563eb]">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-[#ececec] bg-white p-4 xl:col-span-2">
            <h3 className="mb-3 font-semibold text-[#0e1e3f]">Revenue over time (30 days, demo)</h3>
            <div className="flex h-40 items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[#2563eb1A]"
                  style={{ height: `${20 + ((i * 13) % 80)}%` }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#ececec] bg-white p-4">
            <h3 className="mb-3 font-semibold text-[#0e1e3f]">Top 5 products by orders</h3>
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span>{p.qty}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-[#2563eb]"
                      style={{ width: `${Math.min(100, p.qty)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm">
              Avg order value: <strong>₹{avgOrderValue.toLocaleString('en-IN')}</strong>
            </p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={storeState.settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              placeholder="Business name"
            />
            <input
              value={storeState.settings.gstin}
              onChange={(e) => updateSettings({ gstin: e.target.value })}
              className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              placeholder="GSTIN"
            />
            <input
              value={storeState.settings.pan}
              onChange={(e) => updateSettings({ pan: e.target.value })}
              className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              placeholder="PAN"
            />
            <input
              value={storeState.settings.bankDetails}
              onChange={(e) => updateSettings({ bankDetails: e.target.value })}
              className="h-10 rounded-lg border border-[#e5e7eb] px-3"
              placeholder="Bank details"
            />
            <textarea
              value={storeState.settings.pickupDeliveryPreferences}
              onChange={(e) => updateSettings({ pickupDeliveryPreferences: e.target.value })}
              className="rounded-lg border border-[#e5e7eb] p-3 md:col-span-2"
              rows={3}
              placeholder="Pickup/delivery preferences"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={storeState.settings.notifyEmail}
                onChange={(e) => updateSettings({ notifyEmail: e.target.checked })}
              />
              Email notifications
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={storeState.settings.notifySms}
                onChange={(e) => updateSettings({ notifySms: e.target.checked })}
              />
              SMS notifications
            </label>
          </div>
          <button
            onClick={() => {
              const next = saveVendorGiftingSettings(storeState.settings)
              setStoreState(next)
            }}
            className="mt-4 h-10 rounded-lg bg-[#2563eb] px-4 font-semibold text-white"
          >
            Save Changes
          </button>
          <p className="mt-2 text-xs text-amber-700">
            Settings are stored locally for now. Real persistence ships with corporate vendor profile sprint.
          </p>
        </div>
      )}

      {orderDrawer && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOrderDrawer(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full overflow-auto border-l border-[#ececec] bg-white p-4 sm:w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0e1e3f]">Order {orderDrawer.id}</h3>
              <button onClick={() => setOrderDrawer(null)}>Close</button>
            </div>
            <p className="mb-2 text-sm text-[#64748b]">{orderDrawer.corporateName}</p>
            <p className="mb-1 text-sm">
              <strong>Contact:</strong> {orderDrawer.contactName}
            </p>
            <p className="mb-1 text-sm">
              <strong>Email:</strong> {orderDrawer.contactEmail}
            </p>
            <p className="mb-2 text-sm">
              <strong>Address:</strong> {orderDrawer.deliveryAddress}
            </p>
            <div className="mb-3 rounded border p-3">
              {orderDrawer.products.map((p) => (
                <div key={p.productId} className="flex justify-between py-1 text-sm">
                  <span>
                    {p.productName} x {p.quantity}
                  </span>
                  <span>₹{(p.quantity * p.unitPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <select
              value={orderDrawer.status}
              onChange={(e) =>
                handleOrderStatusUpdate(orderDrawer.id, e.target.value as OrderStatus)
              }
              className="mb-3 h-10 w-full rounded-lg border border-[#e5e7eb] px-3"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </aside>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#ececec] bg-white p-4">
      <p className="text-sm text-[#64748b]">{label}</p>
      <p className="text-2xl font-bold text-[#0e1e3f]">{value}</p>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg border px-4 text-sm font-medium ${
        active
          ? 'border-[#2563eb] bg-[#ebf1ff] text-[#2563eb]'
          : 'border-[#e5e7eb] bg-white text-[#475569]'
      }`}
    >
      {label}
    </button>
  )
}
