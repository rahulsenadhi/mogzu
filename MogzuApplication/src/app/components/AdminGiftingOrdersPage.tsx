import { useMemo, useState } from 'react'
import { getAdminGiftingState, updateAdminOrder } from '@/app/lib/adminGiftingStore'
import type { OrderStatus } from '@/app/lib/vendorGiftingStore'

export default function AdminGiftingOrdersPage() {
  const [state, setState] = useState(() => getAdminGiftingState())
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [deliveryPartner, setDeliveryPartner] = useState('')
  const [disputeFlag, setDisputeFlag] = useState(false)

  const orders = useMemo(
    () => (statusTab === 'all' ? state.orders : state.orders.filter((o) => o.status === statusTab)),
    [state.orders, statusTab],
  )
  const selectedOrder = state.orders.find((o) => o.id === selectedOrderId) || null

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0e1e3f] mb-4">Gifting Order Management</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto whitespace-nowrap">
        {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
          <button key={tab} onClick={() => setStatusTab(tab)} className={`h-9 px-4 rounded-lg border text-sm ${statusTab === tab ? 'bg-[#ebf1ff] border-[#2563eb] text-[#2563eb]' : 'bg-white border-[#e5e7eb]'}`}>
            {tab === 'all' ? 'All' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-white border border-[#ececec] rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#64748b]">
            <tr>
              <th className="py-2 px-3">Order ID</th>
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
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#f1f5f9] hover:bg-[#fafafa]">
                <td className="py-2 px-3">{o.id}</td>
                <td className="py-2">{o.corporateName}</td>
                <td className="py-2">{o.vendorName || 'Mogzu Vendor Pvt Ltd'}</td>
                <td className="py-2">{o.products.map((p) => p.productName).join(', ')}</td>
                <td className="py-2">₹{o.amount.toLocaleString('en-IN')}</td>
                <td className="py-2">{o.status}</td>
                <td className="py-2">{o.date}</td>
                <td className="py-2"><button onClick={() => { setSelectedOrderId(o.id); setDeliveryPartner(o.deliveryPartner || ''); setDisputeFlag(Boolean(o.disputeFlag)) }} className="text-[#2563eb]">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSelectedOrderId(null)}>
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white border-l border-[#ececec] p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Order {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrderId(null)}>Close</button>
            </div>
            <p className="text-sm"><strong>Corporate:</strong> {selectedOrder.corporateName}</p>
            <p className="text-sm"><strong>Vendor:</strong> {selectedOrder.vendorName || 'Mogzu Vendor Pvt Ltd'}</p>
            <p className="text-sm"><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
            <p className="text-sm mb-2"><strong>Amount:</strong> ₹{selectedOrder.amount.toLocaleString('en-IN')}</p>

            <div className="border rounded p-3 mb-3">
              {selectedOrder.products.map((p) => (
                <div key={p.productId} className="flex justify-between text-sm py-1">
                  <span>{p.productName} x {p.quantity}</span>
                  <span>₹{(p.quantity * p.unitPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-3">
              <select
                value={selectedOrder.status}
                onChange={(e) => {
                  const next = updateAdminOrder(selectedOrder.id, e.target.value as OrderStatus, deliveryPartner, disputeFlag)
                  setState(next)
                }}
                className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg"
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
                className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg"
                placeholder="Assign delivery partner"
              />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={disputeFlag} onChange={(e) => setDisputeFlag(e.target.checked)} />Raise dispute flag</label>
              <button
                onClick={() => {
                  const next = updateAdminOrder(selectedOrder.id, selectedOrder.status, deliveryPartner, disputeFlag)
                  setState(next)
                }}
                className="h-10 w-full rounded bg-[#2563eb] text-white font-semibold"
              >
                Save Admin Actions
              </button>
              <button
                onClick={() => {
                  const next = updateAdminOrder(selectedOrder.id, selectedOrder.status, deliveryPartner, disputeFlag)
                  const withNotifications = {
                    ...next,
                    orders: next.orders.map((o) =>
                      o.id === selectedOrder.id
                        ? { ...o, timeline: [{ at: new Date().toISOString(), message: 'Notification sent to corporate/vendor by admin' }, ...o.timeline] }
                        : o,
                    ),
                  }
                  localStorage.setItem('mogzu_vendor_gifting_state_v1', JSON.stringify(withNotifications))
                  setState(withNotifications)
                }}
                className="h-10 w-full rounded border border-[#2563eb] text-[#2563eb] font-semibold"
              >
                Send notification to corporate/vendor
              </button>
            </div>

            <h4 className="font-semibold mb-2">Timeline log</h4>
            <div className="space-y-2">
              {selectedOrder.timeline.map((t, idx) => (
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

