import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  loadVendorGiftingState,
  upsertVendorGiftingProduct,
  type BulkTier,
  type PricingType,
  type VendorGiftingProduct,
} from '@/app/lib/vendorGiftingStore'

type Step = 1 | 2 | 3 | 4 | 5

const subcategoriesByCategory: Record<VendorGiftingProduct['category'], string[]> = {
  Apparel: ['T-Shirts', 'Hoodies', 'Jackets', 'Shirts'],
  Bags: ['Backpacks', 'Laptop Bags', 'Duffel'],
  Stationary: ['Notebooks', 'Pens', 'Desk Accessories'],
  Tech: ['Power Banks', 'Speakers', 'Earbuds'],
  'Health & Wellness': ['Hampers', 'Aromatherapy', 'Skincare'],
}

const emptyProduct = (): VendorGiftingProduct => ({
  id: `VG-${Date.now()}`,
  productName: '',
  category: 'Apparel',
  subCategory: '',
  shortDescription: '',
  longDescription: '',
  tags: [],
  primaryImage: undefined,
  additionalImages: [],
  pricingType: 'fixed',
  pricePerUnit: undefined,
  originalPrice: undefined,
  offerPrice: undefined,
  moq: 1,
  gstPercent: 18,
  bulkPricingEnabled: false,
  bulkTiers: [],
  brandingOptions: [],
  leadTimeDays: 7,
  sampleAvailable: false,
  packagingType: 'Box',
  addOns: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function VendorGiftingProductFormPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const isEdit = Boolean(params.id)
  const [step, setStep] = useState<Step>(1)
  const [product, setProduct] = useState<VendorGiftingProduct>(emptyProduct())
  const [tagInput, setTagInput] = useState('')
  const [addOnInput, setAddOnInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!params.id) return
    const state = loadVendorGiftingState()
    const found = state.products.find((p) => p.id === params.id)
    if (found) setProduct(found)
  }, [params.id])

  const stepLabels = ['Basic Info', 'Images', 'Pricing', 'Customization', 'Review']

  const highlightRejected = (field: string) => product.status === 'rejected' && (product.rejectedFields || []).includes(field)

  const validateStep = (target: Step) => {
    const nextErrors: Record<string, string> = {}
    if (target === 1) {
      if (!product.productName.trim()) nextErrors.productName = 'Product name is required'
      if (!product.subCategory.trim()) nextErrors.subCategory = 'Sub-category is required'
      if (!product.shortDescription.trim()) nextErrors.shortDescription = 'Short description is required'
      if (product.shortDescription.length > 160) nextErrors.shortDescription = 'Max 160 characters'
    }
    if (target === 2) {
      if (!product.primaryImage) nextErrors.primaryImage = 'Primary image is required'
    }
    if (target === 3) {
      if (product.pricingType === 'fixed' && (!product.pricePerUnit || product.pricePerUnit <= 0)) nextErrors.pricePerUnit = 'Price per unit required'
      if (product.pricingType === 'offer' && (!product.originalPrice || !product.offerPrice)) nextErrors.offerPrice = 'Original and offer price required'
      if (!product.moq || product.moq <= 0) nextErrors.moq = 'MOQ required'
    }
    if (target === 4) {
      if (!product.leadTimeDays || product.leadTimeDays <= 0) nextErrors.leadTimeDays = 'Lead time required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleImageSelect = async (file: File, isPrimary: boolean) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const dimensionsOk = await new Promise<boolean>((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.width >= 800 && img.height >= 800)
      img.onerror = () => resolve(false)
      img.src = dataUrl
    })
    if (!dimensionsOk) {
      setErrors((prev) => ({ ...prev, primaryImage: 'Image must be at least 800x800px' }))
      return
    }
    const image = { id: `${Date.now()}-${file.name}`, url: dataUrl, name: file.name }
    if (isPrimary) {
      setProduct((p) => ({ ...p, primaryImage: image }))
      return
    }
    setProduct((p) => ({ ...p, additionalImages: [...p.additionalImages, image].slice(0, 4) }))
  }

  const saveDraft = () => {
    const next = { ...product, status: 'draft' as const }
    upsertVendorGiftingProduct(next)
    navigate('/vendor/gifting')
  }

  const submitForApproval = () => {
    const next = {
      ...product,
      status: 'pending' as const,
      rejectionReason: undefined,
      rejectedFields: [],
      updatedAt: new Date().toISOString(),
    }
    upsertVendorGiftingProduct(next)
    setSuccess(true)
    window.setTimeout(() => navigate('/vendor/gifting'), 3000)
  }

  const statusBadgeClass = useMemo(() => {
    if (product.status === 'rejected') return 'bg-rose-100 text-rose-700'
    if (product.status === 'pending') return 'bg-amber-100 text-amber-700'
    if (product.status === 'active') return 'bg-emerald-100 text-emerald-700'
    if (product.status === 'paused') return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }, [product.status])

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] p-6 grid place-items-center">
        <div className="bg-white border border-[#ececec] rounded-xl p-6 text-center max-w-xl">
          <h2 className="text-xl font-bold text-[#0e1e3f] mb-2">Your product has been submitted.</h2>
          <p className="text-[#64748b]">Mogzu Admin will review within 48 hours.</p>
          <p className="text-xs text-[#94a3b8] mt-3">Redirecting to Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6">
      <div className="max-w-5xl mx-auto bg-white border border-[#ececec] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#0e1e3f]">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <span className={`text-xs px-2 py-1 rounded ${statusBadgeClass}`}>{product.status}</span>
        </div>
        {product.status === 'rejected' && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
            <p><strong>Rejection reason:</strong> {product.rejectionReason || 'Please correct highlighted fields and resubmit.'}</p>
            <button className="mt-2 text-rose-700 underline" onClick={() => setStep(1)}>Fix & Resubmit</button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-6">
          {stepLabels.map((label, idx) => (
            <button key={label} className={`h-10 rounded-lg text-xs border ${step === (idx + 1) ? 'bg-[#ebf1ff] border-[#2563eb] text-[#2563eb]' : 'bg-white border-[#e5e7eb] text-[#64748b]'}`}>
              {idx + 1}. {label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <input className={`h-10 w-full px-3 border rounded-lg ${highlightRejected('productName') ? 'border-rose-400' : 'border-[#e5e7eb]'}`} placeholder="Product Name" value={product.productName} onChange={(e) => setProduct((p) => ({ ...p, productName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <select className="h-10 px-3 border border-[#e5e7eb] rounded-lg" value={product.category} onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value as VendorGiftingProduct['category'], subCategory: '' }))}>
                {Object.keys(subcategoriesByCategory).map((cat) => <option key={cat}>{cat}</option>)}
              </select>
              <select className={`h-10 px-3 border rounded-lg ${highlightRejected('subCategory') ? 'border-rose-400' : 'border-[#e5e7eb]'}`} value={product.subCategory} onChange={(e) => setProduct((p) => ({ ...p, subCategory: e.target.value }))}>
                <option value="">Select sub-category</option>
                {subcategoriesByCategory[product.category].map((sub) => <option key={sub}>{sub}</option>)}
              </select>
            </div>
            <input className={`h-10 w-full px-3 border rounded-lg ${highlightRejected('shortDescription') ? 'border-rose-400' : 'border-[#e5e7eb]'}`} placeholder="Short Description (max 160)" maxLength={160} value={product.shortDescription} onChange={(e) => setProduct((p) => ({ ...p, shortDescription: e.target.value }))} />
            <textarea className={`w-full rounded-lg border p-3 ${highlightRejected('longDescription') ? 'border-rose-400' : 'border-[#e5e7eb]'}`} rows={5} placeholder="Long Description" value={product.longDescription} onChange={(e) => setProduct((p) => ({ ...p, longDescription: e.target.value }))} />
            <div>
              <div className="flex gap-2 flex-wrap mb-2">{product.tags.map((tag) => <span key={tag} className="px-2 py-1 rounded-full bg-slate-100 text-xs">{tag}</span>)}</div>
              <input
                className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg"
                placeholder="Tags (press Enter, max 10)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (!tagInput.trim() || product.tags.length >= 10) return
                  setProduct((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }))
                  setTagInput('')
                }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Primary image (required, min 800x800)</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], true)} />
            {product.primaryImage && <img src={product.primaryImage.url} alt="primary" className="w-28 h-28 rounded object-cover" />}

            <label className="block text-sm font-medium">Additional images (max 4)</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], false)} />
            <div className="grid grid-cols-4 gap-2">
              {product.additionalImages.map((img, idx) => (
                <div key={img.id} className="border rounded p-1">
                  <img src={img.url} alt={img.name} className="w-full h-20 rounded object-cover" />
                  <div className="mt-1 flex justify-between text-xs">
                    <button
                      onClick={() =>
                        setProduct((p) => {
                          if (idx === 0) return p
                          const arr = [...p.additionalImages]
                          const prev = arr[idx - 1]
                          arr[idx - 1] = arr[idx]
                          arr[idx] = prev
                          return { ...p, additionalImages: arr }
                        })
                      }
                    >
                      ↑
                    </button>
                    <button onClick={() => setProduct((p) => ({ ...p, additionalImages: p.additionalImages.filter((i) => i.id !== img.id) }))}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <select className="h-10 px-3 border border-[#e5e7eb] rounded-lg" value={product.pricingType} onChange={(e) => setProduct((p) => ({ ...p, pricingType: e.target.value as PricingType }))}>
              <option value="fixed">Fixed</option>
              <option value="offer">Offer Price</option>
              <option value="request">Request for Price</option>
            </select>
            {product.pricingType === 'fixed' && <input type="number" className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg" placeholder="Price per unit" value={product.pricePerUnit || ''} onChange={(e) => setProduct((p) => ({ ...p, pricePerUnit: Number(e.target.value) }))} />}
            {product.pricingType === 'offer' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg" placeholder="Original price" value={product.originalPrice || ''} onChange={(e) => setProduct((p) => ({ ...p, originalPrice: Number(e.target.value) }))} />
                <input type="number" className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg" placeholder="Offer price" value={product.offerPrice || ''} onChange={(e) => setProduct((p) => ({ ...p, offerPrice: Number(e.target.value) }))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <input type="number" className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg" placeholder="MOQ" value={product.moq} onChange={(e) => setProduct((p) => ({ ...p, moq: Number(e.target.value) }))} />
              <select className="h-10 px-3 border border-[#e5e7eb] rounded-lg" value={product.gstPercent} onChange={(e) => setProduct((p) => ({ ...p, gstPercent: Number(e.target.value) as 0 | 5 | 12 | 18 | 28 }))}>
                {[0, 5, 12, 18, 28].map((v) => <option key={v} value={v}>GST {v}%</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={product.bulkPricingEnabled} onChange={(e) => setProduct((p) => ({ ...p, bulkPricingEnabled: e.target.checked }))} />Bulk pricing table</label>
            {product.bulkPricingEnabled && (
              <div className="space-y-2">
                {product.bulkTiers.map((tier, idx) => (
                  <div key={`${idx}-${tier.minQty}`} className="grid grid-cols-4 gap-2">
                    <input type="number" value={tier.minQty} onChange={(e) => setProduct((p) => ({ ...p, bulkTiers: p.bulkTiers.map((t, i) => i === idx ? { ...t, minQty: Number(e.target.value) } : t) }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" />
                    <input type="number" value={tier.maxQty} onChange={(e) => setProduct((p) => ({ ...p, bulkTiers: p.bulkTiers.map((t, i) => i === idx ? { ...t, maxQty: Number(e.target.value) } : t) }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" />
                    <input type="number" value={tier.price} onChange={(e) => setProduct((p) => ({ ...p, bulkTiers: p.bulkTiers.map((t, i) => i === idx ? { ...t, price: Number(e.target.value) } : t) }))} className="h-10 px-3 border border-[#e5e7eb] rounded-lg" />
                    <button onClick={() => setProduct((p) => ({ ...p, bulkTiers: p.bulkTiers.filter((_, i) => i !== idx) }))} className="h-10 rounded border">Remove</button>
                  </div>
                ))}
                <button onClick={() => setProduct((p) => ({ ...p, bulkTiers: [...p.bulkTiers, { minQty: 1, maxQty: 10, price: 0 } as BulkTier] }))} className="h-10 px-3 rounded border">+ Add tier</button>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['Logo print', 'Embroidery', 'Engraving', 'Custom packaging', 'None'].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={product.brandingOptions.includes(opt as VendorGiftingProduct['brandingOptions'][number])}
                    onChange={(e) => {
                      setProduct((p) => ({
                        ...p,
                        brandingOptions: e.target.checked
                          ? [...p.brandingOptions, opt as VendorGiftingProduct['brandingOptions'][number]]
                          : p.brandingOptions.filter((o) => o !== opt),
                      }))
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <input type="number" className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg" placeholder="Lead time (days)" value={product.leadTimeDays} onChange={(e) => setProduct((p) => ({ ...p, leadTimeDays: Number(e.target.value) }))} />
            <label className="flex items-center gap-2"><input type="checkbox" checked={product.sampleAvailable} onChange={(e) => setProduct((p) => ({ ...p, sampleAvailable: e.target.checked }))} />Sample available</label>
            <select className="h-10 px-3 border border-[#e5e7eb] rounded-lg" value={product.packagingType} onChange={(e) => setProduct((p) => ({ ...p, packagingType: e.target.value as VendorGiftingProduct['packagingType'] }))}>
              {['Box', 'Pouch', 'Bag', 'Custom'].map((v) => <option key={v}>{v}</option>)}
            </select>
            <div>
              <div className="flex gap-2 flex-wrap mb-2">{product.addOns.map((addOn) => <span key={addOn} className="px-2 py-1 rounded-full bg-slate-100 text-xs">{addOn}</span>)}</div>
              <input
                className="h-10 w-full px-3 border border-[#e5e7eb] rounded-lg"
                placeholder="Add-ons (press Enter)"
                value={addOnInput}
                onChange={(e) => setAddOnInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (!addOnInput.trim()) return
                  setProduct((p) => ({ ...p, addOns: [...p.addOns, addOnInput.trim()] }))
                  setAddOnInput('')
                }}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-sm">
            <Section label="Basic Info" onEdit={() => setStep(1)}>
              <p><strong>Name:</strong> {product.productName || '—'}</p>
              <p><strong>Category:</strong> {product.category} / {product.subCategory || '—'}</p>
              <p><strong>Short Description:</strong> {product.shortDescription || '—'}</p>
            </Section>
            <Section label="Images" onEdit={() => setStep(2)}>
              <p>Primary: {product.primaryImage?.name || 'Not uploaded'}</p>
              <p>Additional: {product.additionalImages.length}</p>
            </Section>
            <Section label="Pricing" onEdit={() => setStep(3)}>
              <p><strong>Pricing Type:</strong> {product.pricingType}</p>
              <p><strong>MOQ:</strong> {product.moq}</p>
            </Section>
            <Section label="Customization" onEdit={() => setStep(4)}>
              <p><strong>Branding:</strong> {product.brandingOptions.join(', ') || '—'}</p>
              <p><strong>Lead time:</strong> {product.leadTimeDays} days</p>
            </Section>
          </div>
        )}

        {Object.values(errors).length > 0 && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {Object.values(errors).map((e) => <p key={e}>{e}</p>)}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(1, (s - 1) as Step))}
            className="h-10 px-4 rounded-lg border border-[#e5e7eb]"
            disabled={step === 1}
          >
            Back
          </button>
          <div className="flex gap-2">
            {step === 5 ? (
              <>
                <button onClick={saveDraft} className="h-10 px-4 rounded-lg border border-[#cbd5e1]">Save as Draft</button>
                <button
                  onClick={() => {
                    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
                      setStep(1)
                      return
                    }
                    submitForApproval()
                  }}
                  className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold"
                >
                  {product.status === 'rejected' ? 'Save Changes & Resubmit' : 'Submit for Approval'}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (!validateStep(step)) return
                  setStep((s) => Math.min(5, (s + 1) as Step))
                }}
                className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-[#0e1e3f]">{label}</h4>
        <button onClick={onEdit} className="text-[#2563eb]">Edit</button>
      </div>
      {children}
    </div>
  )
}

