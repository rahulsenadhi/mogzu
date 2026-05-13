import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { approveProducts, getAdminGiftingState, rejectProduct, requestMoreInfo } from '@/app/lib/adminGiftingStore'

const rejectReasons = [
  'Images below quality standard',
  'Pricing not compliant',
  'Missing product information',
  'Prohibited item',
  'Other',
]

export default function AdminGiftingProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState(() => getAdminGiftingState())
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState(rejectReasons[0])
  const [otherReason, setOtherReason] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  const product = useMemo(() => state.products.find((p) => p.id === id), [id, state.products])
  if (!product) return <div className="p-6">Product not found</div>

  const vendorRating = 4.6
  const pastApprovals = 14

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0e1e3f]">Product Approval View</h1>
        <button onClick={() => navigate('/admin/gifting/products')} className="h-9 px-3 rounded border">Back</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-[#ececec] rounded-xl p-4">
          <h2 className="text-lg font-semibold text-[#0e1e3f] mb-3">{product.productName}</h2>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[product.primaryImage, ...product.additionalImages].filter(Boolean).slice(0, 5).map((img) => (
              <img key={img!.id} src={img!.url} alt={img!.name} className="w-full h-24 rounded object-cover" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Sub-category:</strong> {product.subCategory}</p>
            <p><strong>Pricing Type:</strong> {product.pricingType}</p>
            <p><strong>MOQ:</strong> {product.moq}</p>
            <p><strong>Price:</strong> {product.pricingType === 'request' ? 'Request for Price' : `₹${product.offerPrice || product.pricePerUnit || product.originalPrice || 0}`}</p>
            <p><strong>GST:</strong> {product.gstPercent}%</p>
            <p className="col-span-2"><strong>Short Description:</strong> {product.shortDescription}</p>
            <p className="col-span-2"><strong>Long Description:</strong> {product.longDescription}</p>
            <p className="col-span-2"><strong>Customization:</strong> {product.brandingOptions.join(', ') || 'None'}</p>
            <p className="col-span-2"><strong>Add-ons:</strong> {product.addOns.join(', ') || 'None'}</p>
          </div>
          {product.bulkPricingEnabled && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Bulk pricing table</h3>
              <table className="w-full text-sm border border-[#e5e7eb] rounded overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-2">Min Qty</th>
                    <th className="p-2">Max Qty</th>
                    <th className="p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bulkTiers.map((t, idx) => (
                    <tr key={`${idx}-${t.minQty}`} className="border-t">
                      <td className="p-2">{t.minQty}</td>
                      <td className="p-2">{t.maxQty}</td>
                      <td className="p-2">₹{t.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="bg-white border border-[#ececec] rounded-xl p-4">
          <h3 className="font-semibold text-[#0e1e3f] mb-2">Vendor info</h3>
          <p className="text-sm"><strong>Name:</strong> {product.vendorName || 'Mogzu Vendor Pvt Ltd'}</p>
          <p className="text-sm"><strong>Rating:</strong> {vendorRating}</p>
          <p className="text-sm"><strong>Past approvals:</strong> {pastApprovals}</p>
          <p className="text-sm"><strong>Contact:</strong> vendor@mogzu.com</p>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                const next = approveProducts([product.id])
                setState(next)
              }}
              className="h-10 w-full rounded bg-emerald-600 text-white font-semibold"
            >
              Approve
            </button>
            <button onClick={() => setRejectOpen(true)} className="h-10 w-full rounded bg-rose-600 text-white font-semibold">Reject</button>
            <div className="space-y-2">
              <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={3} className="w-full rounded border border-[#e5e7eb] p-2 text-sm" placeholder="Request More Info message" />
              <button
                onClick={() => {
                  const next = requestMoreInfo(product.id, requestMessage || 'Please share additional details.')
                  setState(next)
                  setRequestMessage('')
                }}
                className="h-10 w-full rounded border border-[#2563eb] text-[#2563eb] font-semibold"
              >
                Request More Info
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-4 bg-white border border-[#ececec] rounded-xl p-4">
        <h3 className="font-semibold text-[#0e1e3f] mb-2">Activity log</h3>
        <div className="space-y-2">
          {(product.activityLog || []).map((entry, idx) => (
            <div key={`${entry.at}-${idx}`} className="text-sm border-l-2 border-[#e2e8f0] pl-3">
              <p>{entry.message}</p>
              <p className="text-xs text-[#64748b]">{new Date(entry.at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 grid place-items-center p-4" onClick={() => setRejectOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Rejection reason</h3>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg mb-2">
              {rejectReasons.map((r) => <option key={r}>{r}</option>)}
            </select>
            {rejectReason === 'Other' && (
              <textarea value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3} className="w-full rounded border border-[#e5e7eb] p-2 text-sm mb-2" placeholder="Enter custom reason" />
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectOpen(false)} className="h-9 px-3 rounded border">Cancel</button>
              <button
                onClick={() => {
                  const finalReason = rejectReason === 'Other' ? otherReason || 'Other' : rejectReason
                  const next = rejectProduct(product.id, finalReason)
                  setState(next)
                  setRejectOpen(false)
                }}
                className="h-9 px-3 rounded bg-rose-600 text-white"
              >
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

