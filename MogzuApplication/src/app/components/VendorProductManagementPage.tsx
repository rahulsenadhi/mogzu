import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronDown, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { VendorProductListItem } from '@/app/components/VendorAddProductPage';
import imgProductThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { formatBuyerPaymentSummary } from '@/app/lib/mogzuDomain';
import {
  formatVendorCatalogPriceLabel,
  loadVendorCatalogProducts,
  saveVendorCatalogProducts,
  type VendorCatalogProduct,
  VENDOR_CATALOG_UPDATED_EVENT,
} from '@/app/lib/vendorProductsCatalogStorage';
import { VendorAppShell } from './layouts/VendorAppShell';

type MgmtTab = 'product' | 'inventory' | 'category';

type ProductItem = VendorCatalogProduct;

type Variant = {
  id: string;
  label: string;
  price: number;
  sku: string;
  qty: number;
  visible: boolean;
};

type InventoryItem = {
  id: string;
  name: string;
  variantPrice: number;
  sku: string;
  priceLabel: string;
  qty: number;
  visible: boolean;
  variants: Variant[];
};

type CategoryItem = {
  id: string;
  name: string;
  productCount: number;
};

type AdditionalSection = {
  id: string;
  title: string;
  description: string;
};

const sectionTitleOptions = ['General note', 'Packaging note', 'Quality note', 'Delivery note', 'Other'];

export default function VendorProductManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MgmtTab>('product');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [productRowExpanded, setProductRowExpanded] = useState<Record<string, boolean>>({});

  const [products, setProducts] = useState<ProductItem[]>(() => loadVendorCatalogProducts());

  useEffect(() => {
    saveVendorCatalogProducts(products);
  }, [products]);

  useEffect(() => {
    const sync = () => setProducts(loadVendorCatalogProducts());
    window.addEventListener(VENDOR_CATALOG_UPDATED_EVENT, sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(VENDOR_CATALOG_UPDATED_EVENT, sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  useEffect(() => {
    const notice = (location.state as { catalogNotice?: string } | null)?.catalogNotice;
    if (!notice) return;
    setUiNotice(notice);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);
  const inventoryItems = useMemo<InventoryItem[]>(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.name,
        variantPrice: p.price,
        sku: p.productId,
        priceLabel: formatVendorCatalogPriceLabel(p),
        qty: p.qtyCapacity,
        visible: p.stock === 'Available',
        variants: [
          {
            id: 'default',
            label: 'Default',
            price: p.price,
            sku: p.productId,
            qty: p.qtyCapacity,
            visible: p.stock === 'Available',
          },
        ],
      })),
    [products],
  );
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'c1', name: 'Apparel', productCount: 42 },
    { id: 'c2', name: 'Swag Kits', productCount: 16 },
    { id: 'c3', name: 'Gift Boxes', productCount: 9 },
  ]);

  // Keep category counts in sync with your saved catalog products.
  useEffect(() => {
    const counts = products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {});

    const categoryIdFromName = (name: string) =>
      `c_${name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .slice(0, 64)}`;

    setCategories((prev) => {
      const byName = new Map(prev.map((c) => [c.name, c]));
      for (const [name, count] of Object.entries(counts)) {
        const existing = byName.get(name);
        if (existing) {
          byName.set(name, { ...existing, productCount: count });
        } else {
          byName.set(name, { id: categoryIdFromName(name), name, productCount: count });
        }
      }
      // If a category no longer has products, show 0 instead of stale count.
      for (const [name, c] of byName.entries()) {
        if (counts[name] == null) byName.set(name, { ...c, productCount: 0 });
      }
      return Array.from(byName.values());
    });
  }, [products]);

  const [additionalSections, setAdditionalSections] = useState<AdditionalSection[]>([]);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.productId.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, search]);

  const filteredInventory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter((p) => p.name.toLowerCase().includes(q));
  }, [inventoryItems, search]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const openProductDetails = (item: ProductItem, mode: 'view' | 'edit') => {
    const stateProduct: VendorProductListItem = {
      id: item.id,
      name: item.name,
      productId: item.productId,
      category: item.category,
      qtyCapacity: item.qtyCapacity,
      price: item.price,
      stock: item.stock,
      pricingModel: item.pricingModel,
      mogzuMarkupPercent: item.mogzuMarkupPercent,
    };
    navigate(`/vendor/products/${item.id}?mode=${mode}`, { state: { product: stateProduct } });
  };

  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const editProduct = (id: string) =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, stock: p.stock === 'Available' ? 'Out of stock' : 'Available' }
          : p
      )
    );
  const toggleInventoryVisible = (id: string) => editProduct(id);

  const toggleVariantVisible = (itemId: string, _variantId: string) => editProduct(itemId);

  const deleteInventoryItem = (id: string) => deleteProduct(id);

  const addVariant = (itemId: string) => {
    setUiNotice(`Variants are not editable in the inventory tab yet. Opening product edit instead.`);
    openInventoryProductDetails(itemId, 'edit');
  };

  const openInventoryProductDetails = (itemId: string, mode: 'view' | 'edit') => {
    const p = products.find((pp) => pp.id === itemId);
    if (!p) return;
    openProductDetails(p, mode);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategories((prev) => [{ id: `c-${Date.now()}`, name, productCount: 0 }, ...prev]);
    setNewCategoryName('');
  };
  const editCategory = (id: string) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: `${c.name} (Updated)` } : c)));
  const deleteCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));
  const viewCategory = (_id: string) => {
    // Non-breaking affordance for now; dedicated category details screen can be wired later.
  };

  const saveAdditionalSection = () => {
    if (!sectionTitle.trim() || !sectionDescription.trim()) return;
    setAdditionalSections((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, title: sectionTitle, description: sectionDescription },
    ]);
    setSectionTitle('');
    setSectionDescription('');
    setShowAddSectionModal(false);
  };

  return (
    <>
      <VendorAppShell
        activeNav="products"
        routeSource="vendor-product-management"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU, category…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          <div className="p-4 sm:p-6">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              {uiNotice ? (
                <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {uiNotice}
                </p>
              ) : null}
              <div className="mb-4 border-b border-slate-200">
                <div className="flex gap-6">
                  {(['product', 'inventory', 'category'] as MgmtTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-[13px] ${
                        activeTab === tab ? 'border-b-2 border-[#2563EB] font-medium text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab === 'product' ? 'Product' : tab === 'inventory' ? 'Inventory' : 'Category'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-medium tracking-tight text-[#1F2A44] sm:text-[28px]">
                    {activeTab === 'product' ? 'Product/service' : activeTab === 'inventory' ? 'Inventory' : 'Category'}
                  </h2>
                  {activeTab === 'product' ? (
                    <p className="mt-1 text-xs text-slate-500">
                      This list shows only products saved for your vendor account (per onboarding profile).
                    </p>
                  ) : null}
                </div>
                <p className="text-xs font-medium text-slate-400">
                  Total{' '}
                  {activeTab === 'product'
                    ? products.length
                    : activeTab === 'inventory'
                      ? filteredInventory.length
                      : filteredCategories.length}
                </p>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  {activeTab === 'inventory' && (
                    <>
                      <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                        <option>Sort by category</option>
                      </select>
                      <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                        <option>Sort by sub category</option>
                      </select>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/products/new')}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f55c8]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                  {activeTab !== 'product' && (
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(true)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Additional section
                    </button>
                  )}
                </div>
              </div>

              {activeTab === 'product' && filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                    <Plus className="h-7 w-7" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">No products in your catalog</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {search.trim()
                      ? 'Try a different search, or clear the filter to see all products for your store.'
                      : 'Add your first gift or product so corporate buyers can discover and order from you.'}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/vendor/products/new')}
                      className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1f55c8]"
                    >
                      <Plus className="h-4 w-4" />
                      Add product
                    </button>
                    {search.trim() ? (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Clear search
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {activeTab === 'product' && filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="text-[11px] text-slate-400">
                        <th className="pb-3 font-medium">Sr. No</th>
                        <th className="pb-3 font-medium">Product/service</th>
                        <th className="pb-3 font-medium">Product ID</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Qty/capacity</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Stock</th>
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((item, idx) => (
                        <Fragment key={item.id}>
                          <tr className="border-t border-slate-100 text-[13px] text-slate-700">
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setProductRowExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                                }
                                className="text-slate-500"
                                aria-expanded={Boolean(productRowExpanded[item.id])}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${productRowExpanded[item.id] ? 'rotate-180' : 'rotate-0'}`}
                                />
                              </button>
                            </td>
                            <td className="py-3">{String(idx + 1).padStart(4, '0')}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={imgProductThumb}
                                  alt={item.name}
                                  className="h-10 w-10 rounded-md border border-slate-200 object-cover bg-slate-50"
                                />
                                <span className="max-w-[190px] leading-tight text-slate-700">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3">{item.productId}</td>
                            <td className="py-3">{item.category}</td>
                            <td className="py-3">{item.qtyCapacity}</td>
                            <td className="py-3 max-w-[220px] leading-snug">{formatVendorCatalogPriceLabel(item)}</td>
                            <td className="py-3">
                              <span className={`rounded-[4px] px-2 py-1 text-[10px] font-medium ${
                                item.stock === 'Available' ? 'bg-[#DDF8E7] text-[#3BAA5C]' : 'bg-[#FCE4E4] text-[#D35454]'
                              }`}>
                                {item.stock}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-3 text-slate-400">
                                <button type="button" onClick={() => openProductDetails(item, 'view')} className="text-slate-400 hover:text-slate-600" title="View">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => deleteProduct(item.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                                <button type="button" onClick={() => openProductDetails(item, 'edit')} className="text-xs font-medium text-[#2563EB] hover:underline">Edit</button>
                              </div>
                            </td>
                          </tr>
                          {productRowExpanded[item.id] ? (
                            <tr className="border-t border-slate-100 bg-slate-50/80 text-[12px] text-slate-600">
                              <td colSpan={8} className="px-3 py-3">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Buyer listing details</p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <p>
                                    <span className="font-medium text-slate-800">Amenities: </span>
                                    {item.buyer_detail.amenities.length ? item.buyer_detail.amenities.join('; ') : '—'}
                                  </p>
                                  <p>
                                    <span className="font-medium text-slate-800">Policies: </span>
                                    {item.buyer_detail.policies.length ? item.buyer_detail.policies.join('; ') : '—'}
                                  </p>
                                  <p className="sm:col-span-2">
                                    <span className="font-medium text-slate-800">Portfolio: </span>
                                    {item.buyer_detail.portfolio_links.length ? item.buyer_detail.portfolio_links.join(' · ') : '—'}
                                  </p>
                                  <p className="sm:col-span-2">
                                    <span className="font-medium text-slate-800">Payment: </span>
                                    {formatBuyerPaymentSummary(item.buyer_detail) || '—'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {activeTab === 'inventory' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left">
                    <thead>
                      <tr className="text-xs text-slate-400">
                        <th className="pb-3 font-medium" />
                        <th className="pb-3 font-medium">Sr. No</th>
                        <th className="pb-3 font-medium">Product/service</th>
                        <th className="pb-3 font-medium">Variant Price</th>
                        <th className="pb-3 font-medium">SKU</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Qty</th>
                        <th className="pb-3 font-medium">Visible</th>
                        <th className="pb-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item, idx) => [
                          <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700">
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => setExpandedRows((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className="text-slate-500"
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${expandedRows[item.id] ? 'rotate-180' : 'rotate-0'}`}
                                />
                              </button>
                            </td>
                            <td className="py-3">{String(idx + 1).padStart(4, '0')}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={imgProductThumb}
                                  alt={item.name}
                                  className="h-10 w-10 rounded-md border border-slate-200 object-cover bg-slate-50"
                                />
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3">₹{item.variantPrice}</td>
                            <td className="py-3">{item.sku}</td>
                            <td className="py-3">{item.priceLabel}</td>
                            <td className="py-3">{item.qty}</td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => toggleInventoryVisible(item.id)}
                                className={`h-6 w-11 rounded-full px-1 ${item.visible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <span className={`block h-4 w-4 rounded-full bg-white transition ${item.visible ? 'translate-x-5' : ''}`} />
                              </button>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openInventoryProductDetails(item.id, 'view')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openInventoryProductDetails(item.id, 'edit')}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => deleteInventoryItem(item.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>,
                          expandedRows[item.id] ? (
                            <tr key={`${item.id}-expanded`} className="border-t border-slate-100 bg-slate-50/70 text-sm text-slate-700">
                              <td colSpan={9} className="p-3">
                                <div className="space-y-2">
                                  {item.variants.map((variant) => (
                                    <div key={variant.id} className="grid grid-cols-6 gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                      <span>{variant.label}</span>
                                      <span>₹{variant.price}</span>
                                      <span>{variant.sku}</span>
                                      <span>{variant.qty} qty</span>
                                      <button
                                        type="button"
                                        onClick={() => toggleVariantVisible(item.id, variant.id)}
                                        className={`h-6 w-11 rounded-full px-1 ${variant.visible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                      >
                                        <span className={`block h-4 w-4 rounded-full bg-white transition ${variant.visible ? 'translate-x-5' : ''}`} />
                                      </button>
                                      <button type="button" onClick={() => openInventoryProductDetails(item.id, 'edit')} className="text-[#2563EB] hover:underline">
                                        Edit
                                      </button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => addVariant(item.id)} className="text-sm text-[#2563EB] hover:underline">
                                    Add variant
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : null,
                      ])}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'category' && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="h-9 w-full max-w-xs rounded-md border border-slate-200 px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                    <button type="button" onClick={addCategory} className="rounded-full bg-[#2563EB] px-4 py-2 text-sm text-white">
                      Add category
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className="text-[11px] text-slate-400">
                          <th className="pb-3 font-medium">Sr. No</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Products</th>
                          <th className="pb-3 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((cat, idx) => (
                          <tr key={cat.id} className="border-t border-slate-100 text-[13px] text-slate-700">
                            <td className="py-3">{String(idx + 1).padStart(4, '0')}</td>
                            <td className="py-3 font-medium">{cat.name}</td>
                            <td className="py-3">{cat.productCount}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => viewCategory(cat.id)} className="text-slate-400 hover:text-slate-600"><Eye className="h-4 w-4" /></button>
                                <button type="button" onClick={() => editCategory(cat.id)} className="text-slate-400 hover:text-slate-600"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => deleteCategory(cat.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => setUiNotice('Previous page is not available in this demo.')}
                        className="inline-flex items-center gap-1.5 hover:text-slate-600"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Previous
                      </button>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setUiNotice('You are already on page 1.')} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2563EB] text-[10px] text-white">1</button>
                        <button type="button" onClick={() => setUiNotice('Pagination page 2 will be enabled with backend data.')} className="hover:text-slate-600">2</button>
                        <button type="button" onClick={() => setUiNotice('Pagination page 3 will be enabled with backend data.')} className="hover:text-slate-600">3</button>
                        <span>...</span>
                        <button type="button" onClick={() => setUiNotice('Pagination page 8 will be enabled with backend data.')} className="hover:text-slate-600">8</button>
                        <button type="button" onClick={() => setUiNotice('Pagination page 9 will be enabled with backend data.')} className="hover:text-slate-600">9</button>
                        <button type="button" onClick={() => setUiNotice('Pagination page 10 will be enabled with backend data.')} className="hover:text-slate-600">10</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUiNotice('Next page is not available in this demo.')}
                        className="inline-flex items-center gap-1.5 hover:text-slate-600"
                      >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {additionalSections.length > 0 && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Additional sections</h3>
                  <div className="space-y-2">
                    {additionalSections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-800">{section.title}</p>
                        <p className="text-sm text-slate-600">{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'product' && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => setUiNotice('Previous page is not available in this demo.')}
                      className="inline-flex items-center gap-1.5 hover:text-slate-600"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setUiNotice('You are already on page 1.')} className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2563EB] text-[10px] text-white">1</button>
                      <button type="button" onClick={() => setUiNotice('Pagination page 2 will be enabled with backend data.')} className="hover:text-slate-600">2</button>
                      <button type="button" onClick={() => setUiNotice('Pagination page 3 will be enabled with backend data.')} className="hover:text-slate-600">3</button>
                      <span>...</span>
                      <button type="button" onClick={() => setUiNotice('Pagination page 8 will be enabled with backend data.')} className="hover:text-slate-600">8</button>
                      <button type="button" onClick={() => setUiNotice('Pagination page 9 will be enabled with backend data.')} className="hover:text-slate-600">9</button>
                      <button type="button" onClick={() => setUiNotice('Pagination page 10 will be enabled with backend data.')} className="hover:text-slate-600">10</button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Next page is not available in this demo.')}
                      className="inline-flex items-center gap-1.5 hover:text-slate-600"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </VendorAppShell>

      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-2xl font-semibold text-slate-700">Additional section</h3>
              <button type="button" onClick={() => setShowAddSectionModal(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Section Title</label>
                <select
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-200 px-4 text-lg text-slate-600"
                >
                  <option value="">Select Reason</option>
                  {sectionTitleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-slate-700">Description</label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  rows={6}
                  placeholder="Add description"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-center gap-6 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="min-w-[220px] rounded-full border border-slate-600 px-8 py-3 text-xl text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAdditionalSection}
                className="min-w-[220px] rounded-full bg-[#2563EB] px-8 py-3 text-xl text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
