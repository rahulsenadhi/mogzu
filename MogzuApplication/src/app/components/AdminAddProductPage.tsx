import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, ImagePlus } from 'lucide-react';

export default function AdminAddProductPage() {
  const navigate = useNavigate();
  const [specsOpen, setSpecsOpen] = useState(false);
  const [uiNotice, setUiNotice] = useState('');

  const handleSubmit = () => {
    navigate('/admin/products');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add Product</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Product details
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Product name</span>
              <input
                type="text"
                placeholder="e.g. Women's Cotton Stretch Half Sleeve"
                className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Category</span>
                <select className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20">
                  <option>Apparel</option>
                  <option>Electronics</option>
                  <option>Experiences</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Sub category</span>
                <select className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20">
                  <option>T-shirt</option>
                  <option>Outerwear</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Qty / Capacity</span>
              <input
                type="text"
                defaultValue="2000"
                className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Description</span>
              <textarea
                rows={4}
                placeholder="Product description…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setSpecsOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 w-full text-left py-2 border border-slate-200 rounded-xl px-3 hover:bg-slate-50"
          >
            <input type="checkbox" readOnly checked={specsOpen} className="rounded border-slate-300" />
            Specifications
            <ChevronDown className={`size-4 ml-auto transition-transform ${specsOpen ? 'rotate-180' : ''}`} />
          </button>
          {specsOpen && (
            <div className="pl-2 space-y-2 text-sm text-slate-600 border-l-2 border-[#2563EB]/40 ml-1 py-2">
              <p>Material, pattern, fit — mock dropdowns in a future iteration.</p>
              <button
                type="button"
                onClick={() => setUiNotice('Custom specification field creation will be available in a future release.')}
                className="text-[#2563EB] font-semibold text-sm hover:underline"
              >
                + Add Custom
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Media & pricing
          </h2>
          <div>
            <span className="text-xs font-medium text-slate-600">Images</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="size-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setUiNotice('Photo upload will be available in a future release.')}
                className="size-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-100"
              >
                <ImagePlus className="size-6" />
                <span className="text-[10px] px-1 text-center leading-tight">Add photo</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">MRP</span>
              <input
                type="text"
                defaultValue="₹599"
                className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Sale price</span>
              <input
                type="text"
                defaultValue="₹400"
                className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-600">Quantity base pricing</span>
            <table className="mt-2 w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left py-2 px-3">Quantity</th>
                  <th className="text-left py-2 px-3">Price / unit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="py-2 px-3">
                    <input className="w-full h-8 px-2 rounded-lg border border-slate-200 text-sm" defaultValue="1–99" />
                  </td>
                  <td className="py-2 px-3">
                    <input className="w-full h-8 px-2 rounded-lg border border-slate-200 text-sm" defaultValue="₹450" />
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="py-2 px-3">
                    <input className="w-full h-8 px-2 rounded-lg border border-slate-200 text-sm" defaultValue="100+" />
                  </td>
                  <td className="py-2 px-3">
                    <input className="w-full h-8 px-2 rounded-lg border border-slate-200 text-sm" defaultValue="₹400" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6">
        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-3">
          Variants
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                <th className="py-2 pr-4">Variant</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Qty</th>
              </tr>
            </thead>
            <tbody>
              {['White', 'Black', 'Blue'].map((v) => (
                <tr key={v} className="border-b border-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{v}</td>
                  <td className="py-2.5 pr-4 text-slate-600">₹400</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{`SKU-${v.toUpperCase()}-001`}</td>
                  <td className="py-2.5 pr-4 text-slate-600">500</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => setUiNotice('Variant creation will be available in a future release.')}
          className="mt-3 text-sm font-semibold text-[#2563EB] hover:underline"
        >
          + Add variant
        </button>
      </div>

      {uiNotice && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {uiNotice}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-6 mt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8]"
        >
          Add product
        </button>
      </div>
    </div>
  );
}
