import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getAdminGiftingState, updateAdminOrder } from '@/app/lib/adminGiftingStore'
import {
  giftingRowToDisplayOrder,
  orderStatusToFulfilmentStage,
  type GiftingBookingRow,
  type GiftingDisplayOrder,
} from '@/app/lib/giftingBookingOrders'
import type { OrderStatus, VendorGiftingOrder } from '@/app/lib/vendorGiftingStore'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'

type DisplayOrder = GiftingDisplayOrder | VendorGiftingOrder

export default function AdminGiftingOrdersPage() {
  const [demoState, setDemoState] = useState(() => getAdminGiftingState())
  const [liveOrders, setLiveOrders] = useState<GiftingDisplayOrder[]>([])
  const [usingDemo, setUsingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus>('all')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [deliveryPartner, setDeliveryPartner] = useState('')
  const [disputeFlag, setDisputeFlag] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select(
        '*, listings(title, location_address), user_profiles!user_id(full_name, phone), corporate_accounts(name), vendors(business_name)',
      )
      .eq('module', 'gifting')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      setUsingDemo(true)
      setLiveOrders([])
    } else {
      const rows = (data ?? []) as GiftingBookingRow[]
      if (rows.length === 0) {
        setUsingDemo(true)
        setLiveOrders([])
      } else {
        setUsingDemo(false)
        setLiveOrders(rows.map(giftingRowToDisplayOrder))
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const allOrders: DisplayOrder[] = useMemo(
    () => (usingDemo ? demoState.orders : liveOrders),
    [usingDemo, demoState.orders, liveOrders],
  )

  const orders = useMemo(
    () => (statusTab === 'all' ? allOrders : allOrders.filter((o) => o.status === statusTab)),
    [allOrders, statusTab],
  )

  const selectedOrder = useMemo(() => {
    if (!selectedKey) return null
    return allOrders.find((o) => ('bookingId' in o ? o.bookingId : o.id) === selectedKey) ?? null
  }, [allOrders, selectedKey])

  const applyStatus = async (order: DisplayOrder, status: OrderStatus) => {
    if ('bookingId' in order && order.bookingId && !usingDemo) {
      const bookingId = order.bookingId
      if (status === 'cancelled') {
        await db.bookings.cancel(bookingId, 'Cancelled by admin')
      } else if (status === 'delivered') {
        await db.bookings.complete(bookingId)
      } else {
        if (status === 'confirmed') await db.bookings.updateStatus(bookingId, 'confirmed')
        const stage = orderStatusToFulfilmentStage(status)
        if (stage) {
          await db.bookings.setFulfilment(bookingId, stage, {
            carrier: deliveryPartner || null,
          })
        }
      }
      await load()
      return
    }
    const next = updateAdminOrder(order.id, status, deliveryPartner, disputeFlag)
    setDemoState(next)
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-[#0e1e3f]">Gifting Order Management</h1>

      {usingDemo && import.meta.env.DEV && (
        <DevMockDataBanner message="No gifting bookings in Supabase — showing demo admin orders." />
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto whitespace-nowrap">
        {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`h-9 rounded-lg border px-4 text-sm ${
              statusTab === tab ? 'border-[#2563eb] bg-[#ebf1ff] text-[#2563eb]' : 'border-[#e5e7eb] bg-white'
            }`}
          >
            {tab === 'all' ? 'All' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-auto rounded-xl border border-[#ececec] bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No gifting orders match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#64748b]">
              <tr>
                <th className="px-3 py-2">Order ID</th>
                <th className="py-2">Corporate Name</th>
                <th className="py-2">Vendor Name</th>
                <th className="py-2">Products</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const key = 'bookingId' in o ? o.bookingId : o.id
                return (
                  <tr key={key} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                    <td className="px-3 py-2">{o.id}</td>
                    <td className="py-2">{o.corporateName}</td>
                    <td className="py-2">{o.vendorName || '—'}</td>
                    <td className="py-2">{o.products.map((p) => p.productName).join(', ')}</td>
                    <td className="py-2">₹{o.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2">{o.date}</td>
                    <td className="py-2">
                      <button
                        onClick={() => {
                          setSelectedKey(key)
                          setDeliveryPartner(o.deliveryPartner || '')
                          setDisputeFlag(Boolean(o.disputeFlag))
                        }}
                        className="text-[#2563eb]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setSelectedKey(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full overflow-auto border-l border-[#ececec] bg-white p-4 sm:w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order {selectedOrder.id}</h3>
              <button type="button" onClick={() => setSelectedKey(null)}>
                Close
              </button>
            </div>
            <p className="text-sm">
              <strong>Corporate:</strong> {selectedOrder.corporateName}
            </p>
            <p className="text-sm">
              <strong>Vendor:</strong> {selectedOrder.vendorName || '—'}
            </p>
            <p className="text-sm">
              <strong>Address:</strong> {selectedOrder.deliveryAddress}
            </p>
            <p className="mb-2 text-sm">
              <strong>Amount:</strong> ₹{selectedOrder.amount.toLocaleString('en-IN')}
            </p>

            <div className="mb-3 rounded border p-3">
              {selectedOrder.products.map((p) => (
                <div key={p.productId} className="flex justify-between py-1 text-sm">
                  <span>
                    {p.productName} x {p.quantity}
                  </span>
                  <span>₹{(p.quantity * p.unitPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="mb-3 space-y-2">
              <select
                value={selectedOrder.status}
                onChange={(e) => void applyStatus(selectedOrder, e.target.value as OrderStatus)}
                className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                value={deliveryPartner}
                onChange={(e) => setDeliveryPartner(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3"
                placeholder="Assign delivery partner / carrier"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={disputeFlag} onChange={(e) => setDisputeFlag(e.target.checked)} />
                Raise dispute flag
              </label>
              {!usingDemo && (
                <button
                  type="button"
                  onClick={() => void applyStatus(selectedOrder, selectedOrder.status)}
                  className="h-10 w-full rounded bg-[#2563eb] font-semibold text-white"
                >
                  Save carrier &amp; status
                </button>
              )}
            </div>

            <h4 className="mb-2 font-semibold">Timeline log</h4>
            <div className="space-y-2">
              {selectedOrder.timeline.map((t, idx) => (
                <div key={`${t.at}-${idx}`} className="border-l-2 border-[#e2e8f0] pl-3 text-sm">
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
