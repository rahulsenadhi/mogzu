import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { ImagePlus, Plus, Search, Trash2 } from 'lucide-react';
import imgProductThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { appendVendorCatalogProduct } from '@/app/lib/vendorProductsCatalogStorage';
import { VendorAppShell } from './layouts/VendorAppShell';
import { MogzuLegacyDemoBanner } from '@/app/components/ui/MogzuLegacyDemoBanner';
import { isListingUuid } from '@/app/lib/activityListingResolver';
import PricingTypeSelector, { type PricingTypeSelectorValue } from './ui/PricingTypeSelector';

type SpecRow = { id: string; label: string; value: string };
type VariantRow = { id: string; name: string; variantPrice: string; sku: string; quantity: string; weight: string; visible: boolean };

type VendorBrandingCategory = 'apparel' | 'bags' | 'tech' | 'wellness' | 'stationery';

/** Branding / decoration add-ons: optional, with commercial and applicability detail */
export type BrandingOptionRow = {
  id: string;
  /** Corporate branding method id (matches `ProductBookingPage` modal) */
  methodId: string;
  label: string;
  enabled: boolean;
  /** Extra charge for this branding option (same currency as your catalog) */
  price: string;
  /** Logo placements supported for this method (category-driven) */
  applicableLogoPositions: string[];
  /** Logo sizes supported for this method (same across categories for now) */
  applicableLogoSizes: Array<'small' | 'medium' | 'large'>;
  /** What the buyer can expect / constraints */
  whatsApplicable: string;
};

/** How corporate buyers see and interact with price on the storefront */
export type VendorPricingModel = 'transparent' | 'opaque' | 'offer';

export type VendorProductListItem = {
  id: string;
  name: string;
  productId: string;
  category: string;
  qtyCapacity: number;
  price: number;
  stock: string;
  pricingModel?: VendorPricingModel;
  mogzuMarkupPercent?: number;
};

type LocationState = { product?: VendorProductListItem };

const LOGO_SIZE_OPTIONS: Array<{ id: 'small' | 'medium' | 'large'; label: string }> = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const VENDOR_PAYMENT_PRESETS = [
  { id: 'UPI', label: 'UPI' },
  { id: 'Bank transfer', label: 'Bank transfer' },
  { id: 'Credit card', label: 'Credit card' },
  { id: 'Corporate invoice', label: 'Corporate invoice' },
  { id: 'Cheque', label: 'Cheque' },
] as const;

function parseListingLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapVendorCategoryToBrandingCategory(vendorCategory: string): VendorBrandingCategory {
  const v = String(vendorCategory || '').trim().toLowerCase();
  if (!v || v === 'choose category') return 'apparel';
  if (v.includes('bag')) return 'bags';
  if (v.includes('tech')) return 'tech';
  if (v.includes('wellness')) return 'wellness';
  if (v.includes('stationery')) return 'stationery';
  return 'apparel';
}

function getBrandingCategoryConfig(cat: VendorBrandingCategory): {
  sizeOptions: string[];
  brandingMethods: Array<{ id: string; label: string }>;
  logoPositions: Array<{ id: string; label: string }>;
} {
  // Mirrors the lists used in `ProductBookingPage` customization modal.
  switch (cat) {
    case 'apparel':
      return {
        sizeOptions: ['XS', 'Small', 'Medium', 'Large', 'XL', '2XL'],
        brandingMethods: [
          { id: 'screen-print', label: 'Screen Printing' },
          { id: 'embroidery', label: 'Embroidery' },
          { id: 'vinyl', label: 'Vinyl Transfer' },
          { id: 'dtg', label: 'DTG Printing' },
        ],
        logoPositions: [
          { id: 'center-chest', label: 'Center Chest' },
          { id: 'left-chest', label: 'Left Chest' },
          { id: 'back', label: 'Back' },
          { id: 'sleeve', label: 'Sleeve' },
        ],
      };
    case 'bags':
      return {
        sizeOptions: [],
        brandingMethods: [
          { id: 'embossing', label: 'Embossing' },
          { id: 'debossing', label: 'Debossing' },
          { id: 'screen-print', label: 'Screen Print' },
          { id: 'metal-badge', label: 'Metal Badge' },
        ],
        logoPositions: [
          { id: 'front', label: 'Front Panel' },
          { id: 'side', label: 'Side Panel' },
          { id: 'strap', label: 'Strap' },
          { id: 'interior', label: 'Interior Label' },
        ],
      };
    case 'tech':
      return {
        sizeOptions: [],
        brandingMethods: [
          { id: 'laser-engraving', label: 'Laser Engraving' },
          { id: 'uv-print', label: 'UV Printing' },
          { id: 'sticker', label: 'Premium Sticker' },
          { id: 'metal-plate', label: 'Metal Plate' },
        ],
        logoPositions: [
          { id: 'back', label: 'Back Surface' },
          { id: 'lid', label: 'Lid/Cover' },
          { id: 'side', label: 'Side Panel' },
          { id: 'packaging', label: 'Packaging Only' },
        ],
      };
    case 'wellness':
      return {
        sizeOptions: ['Small', 'Medium', 'Large'],
        brandingMethods: [
          { id: 'sticker', label: 'Custom Label' },
          { id: 'uv-print', label: 'UV Printing' },
          { id: 'packaging', label: 'Custom Packaging' },
          { id: 'sleeve', label: 'Sleeve Branding' },
        ],
        logoPositions: [
          { id: 'label', label: 'Product Label' },
          { id: 'box', label: 'Box/Packaging' },
          { id: 'sleeve', label: 'Sleeve' },
          { id: 'insert', label: 'Package Insert' },
        ],
      };
    case 'stationery':
      return {
        sizeOptions: [],
        brandingMethods: [
          { id: 'foil-stamping', label: 'Foil Stamping' },
          { id: 'embossing', label: 'Embossing' },
          { id: 'uv-print', label: 'UV Printing' },
          { id: 'screen-print', label: 'Screen Print' },
        ],
        logoPositions: [
          { id: 'cover', label: 'Cover' },
          { id: 'spine', label: 'Spine' },
          { id: 'back', label: 'Back Cover' },
          { id: 'inside', label: 'Inside Page' },
        ],
      };
  }
}

function getMethodDefaultNotes(cat: VendorBrandingCategory, methodId: string): string {
  // Mirrors the description copy shown to corporate buyers in `ProductBookingPage`.
  // Kept as vendor-editable notes (vendors can override).
  if (cat === 'apparel') {
    if (methodId === 'screen-print') return 'Durable, cost-effective for bulk orders. Best for simple logos with 1-4 colors. Vibrant colors that last through many washes.';
    if (methodId === 'embroidery') return 'Premium, professional look with raised texture. Perfect for polo shirts and caps. Extremely durable and adds perceived value.';
    if (methodId === 'vinyl') return 'Great for small quantities and detailed designs. Smooth finish, works well on dark fabrics. Quick turnaround time.';
    if (methodId === 'dtg') return 'Direct-to-garment printing for photo-quality, full-color designs. Ideal for complex artwork and gradients. Soft feel, no texture.';
  }
  if (cat === 'bags') {
    if (methodId === 'embossing') return 'Raised lettering creates a sophisticated, premium look. Perfect for leather and premium materials. Long-lasting and elegant.';
    if (methodId === 'debossing') return 'Indented branding for a subtle, professional appearance. Works excellently on leather and synthetic materials. Highly durable.';
    if (methodId === 'screen-print') return 'Vibrant, cost-effective printing for fabric bags. Great for colorful logos and bulk orders. Weather-resistant finish.';
    if (methodId === 'metal-badge') return 'Premium metal plate with engraved logo. Adds luxury appeal and brand prestige. Extremely durable and scratch-resistant.';
  }
  if (cat === 'tech') {
    if (methodId === 'laser-engraving') return 'Permanent, precise etching on metal and plastic surfaces. Professional finish that won\'t fade. Perfect for tech products.';
    if (methodId === 'uv-print') return 'Full-color printing with high detail and durability. Works on various materials. Resistant to scratching and fading.';
    if (methodId === 'sticker') return 'High-quality vinyl stickers with lamination. Cost-effective and easy to apply. Great for packaging or product surface.';
    if (methodId === 'metal-plate') return 'Premium metal nameplate with custom engraving. Adds professional touch. Extremely durable and high-end look.';
  }
  if (cat === 'wellness') {
    if (methodId === 'sticker') return 'Custom printed labels for product branding. Easy to apply, colorful designs. Perfect for bottles, boxes, and packaging.';
    if (methodId === 'uv-print') return 'Direct printing on containers and packaging. High-quality, full-color results. Waterproof and durable finish.';
    if (methodId === 'packaging') return 'Fully customized packaging with your brand identity. Premium unboxing experience. Includes printed box, inserts, and sleeves.';
    if (methodId === 'sleeve') return 'Printed sleeve that wraps around product. Easy to apply, professional look. Great for temporary branding.';
  }
  if (cat === 'stationery') {
    if (methodId === 'foil-stamping') return 'Metallic foil creates a luxurious, premium appearance. Available in gold, silver, and colors. Perfect for corporate gifting.';
    if (methodId === 'embossing') return 'Raised design adds tactile dimension and elegance. Works beautifully on covers and cards. Professional finish.';
    if (methodId === 'uv-print') return 'Full-color printing with glossy or matte finish. High detail reproduction. Cost-effective for bulk orders.';
    if (methodId === 'screen-print') return 'Vibrant, durable printing for notebooks and folders. Excellent for simple logos. Long-lasting colors.';
  }
  return '';
}

function buildBrandingRowsForCategory(cat: VendorBrandingCategory): BrandingOptionRow[] {
  const cfg = getBrandingCategoryConfig(cat);
  const allPositions = cfg.logoPositions.map((p) => p.id);
  return cfg.brandingMethods.map((m) => ({
    id: `b-${m.id}`,
    methodId: m.id,
    label: m.label,
    enabled: m.id === 'screen-print' || m.id === 'embossing' || m.id === 'laser-engraving' || m.id === 'sticker',
    price: '',
    applicableLogoPositions: allPositions,
    applicableLogoSizes: ['small', 'medium', 'large'],
    whatsApplicable: getMethodDefaultNotes(cat, m.id),
  }));
}

export default function VendorAddProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const routeState = (location.state as LocationState | null)?.product;

  const isCreate = !productId;
  const isView = Boolean(productId) && searchParams.get('mode') === 'view';
  const readOnly = isView;

  const [search, setSearch] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [productName, setProductName] = useState("Women's Cotton Stretch Half Sleeve");
  const [category, setCategory] = useState('Choose category');
  const [subCategory, setSubCategory] = useState('Choose category');
  const [qtyCapacity, setQtyCapacity] = useState('2000');
  const [brand, setBrand] = useState('SAVOT');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [terms, setTerms] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [portfolioLinksText, setPortfolioLinksText] = useState('');
  const [vendorPaymentTerms, setVendorPaymentTerms] = useState('');
  const [paymentPresetOn, setPaymentPresetOn] = useState<Record<string, boolean>>({});
  const [paymentCustomText, setPaymentCustomText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [brandingRows, setBrandingRows] = useState<BrandingOptionRow[]>(() => buildBrandingRowsForCategory('apparel'));

  const [pricingModel, setPricingModel] = useState<VendorPricingModel>('transparent');
  /** Shown to buyers as platform fee on top of your base price (transparent model) */
  const [mogzuMarkupPercent, setMogzuMarkupPercent] = useState('12');
  /** Anchor / list price buyers see before making an offer (offer model) */
  const [referenceOfferPrice, setReferenceOfferPrice] = useState('');
  const [offerNegotiationNote, setOfferNegotiationNote] = useState(
    'Open to reasonable offers on volume orders; MOQ may apply.',
  );
  const [pricingSetup, setPricingSetup] = useState<PricingTypeSelectorValue>({
    pricing_type: 'transparent',
    price_type: 'per_person',
    base_price: 0,
  });

  /** Used for catalog list price when saving a new product */
  const [sellPrice, setSellPrice] = useState('');

  const [specRows, setSpecRows] = useState<SpecRow[]>([
    { id: 's1', label: 'Material composition', value: 'Select' },
    { id: 's2', label: 'Pattern', value: 'Select' },
    { id: 's3', label: 'Fit type', value: 'Select' },
    { id: 's4', label: 'Sleeve type', value: 'Select' },
    { id: 's5', label: 'Collar style', value: 'Select' },
  ]);

  const [variantRows, setVariantRows] = useState<VariantRow[]>([
    { id: 'v1', name: 'White', variantPrice: '20', sku: '0123', quantity: '540', weight: '0.5 Kg', visible: true },
    { id: 'v2', name: 'Black', variantPrice: '40', sku: '0126', quantity: '540', weight: '0.5 Kg', visible: true },
    { id: 'v3', name: 'Blue', variantPrice: '20', sku: '0123', quantity: '540', weight: '0.5 Kg', visible: true },
  ]);
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>('v2');
  useEffect(() => {
    setPricingModel(
      pricingSetup.pricing_type === 'offer_price'
        ? 'offer'
        : pricingSetup.pricing_type === 'request_for_price'
          ? 'opaque'
          : 'transparent',
    );
  }, [pricingSetup.pricing_type]);

  const [variantSizeQty, setVariantSizeQty] = useState<Record<string, string>>({});

  const brandingCategoryKey = mapVendorCategoryToBrandingCategory(category);
  const brandingCategoryConfig = useMemo(() => getBrandingCategoryConfig(brandingCategoryKey), [brandingCategoryKey]);

  useEffect(() => {
    const p = (location.state as LocationState | null)?.product;
    if (!productId || !p) return;
    setProductName(p.name);
    setCategory(p.category);
    setSubCategory('Choose category');
    setQtyCapacity(String(p.qtyCapacity));
    setBrand('SAVOT');
    if (p.pricingModel) setPricingModel(p.pricingModel);
    if (p.mogzuMarkupPercent != null) setMogzuMarkupPercent(String(p.mogzuMarkupPercent));
    if (p.pricingModel === 'offer') setReferenceOfferPrice(String(p.price));
    if (p.pricingModel !== 'offer') setSellPrice(String(p.price));
    setPricingSetup(
      p.pricingModel === 'offer'
        ? {
            pricing_type: 'offer_price',
            price_type: 'per_person',
            starting_price: p.price,
            min_acceptable_offer: Math.max(0, Math.round(p.price * 0.85)),
            offer_validity_hours: 48,
          }
        : p.pricingModel === 'opaque'
          ? { pricing_type: 'request_for_price', response_time_hours: 24 }
          : {
              pricing_type: 'transparent',
              price_type: 'per_person',
              base_price: p.price,
            },
    );
  }, [productId, location.key, location.state]);

  // Hydrate saved branding + pricing setup when opening an existing product.
  useEffect(() => {
    if (!productId) return;
    try {
      const key = `mogzu_vendor_product_${productId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const j = JSON.parse(raw) as any;

      if (Array.isArray(j.brandingRows)) {
        const rows = j.brandingRows as any[];
        const looksValid = rows.every(
          (r) =>
            r &&
            typeof r.id === 'string' &&
            typeof r.methodId === 'string' &&
            typeof r.label === 'string' &&
            typeof r.enabled === 'boolean' &&
            typeof r.price === 'string' &&
            Array.isArray(r.applicableLogoPositions) &&
            Array.isArray(r.applicableLogoSizes) &&
            typeof r.whatsApplicable === 'string',
        );
        if (looksValid) setBrandingRows(j.brandingRows as BrandingOptionRow[]);
      }

      if (j.pricingModel === 'transparent' || j.pricingModel === 'opaque' || j.pricingModel === 'offer') {
        setPricingModel(j.pricingModel);
      }
      if (j.mogzuMarkupPercent != null) setMogzuMarkupPercent(String(j.mogzuMarkupPercent));
      if (j.referenceOfferPrice != null) setReferenceOfferPrice(String(j.referenceOfferPrice));
      if (j.offerNegotiationNote != null) setOfferNegotiationNote(String(j.offerNegotiationNote));
      if (j.sellPrice != null) setSellPrice(String(j.sellPrice));
      if (j.pricing_type === 'transparent' || j.pricing_type === 'offer_price' || j.pricing_type === 'request_for_price') {
        setPricingSetup({
          pricing_type: j.pricing_type,
          price_type: j.price_type,
          base_price: j.base_price,
          starting_price: j.starting_price,
          min_acceptable_offer: j.min_acceptable_offer,
          offer_validity_hours: j.offer_validity_hours,
          response_time_hours: j.response_time_hours,
        });
      }
      if (Array.isArray(j.specRows)) setSpecRows(j.specRows as SpecRow[]);
      if (Array.isArray(j.variantRows)) setVariantRows(j.variantRows as VariantRow[]);
    } catch {
      // If older drafts exist or localStorage is malformed, keep UI defaults.
    }
  }, [productId]);

  // Keep branding options and applicability aligned to the selected listing category.
  useEffect(() => {
    const nextCat = brandingCategoryKey;
    setBrandingRows((prev) => {
      const target = buildBrandingRowsForCategory(nextCat);
      return target.map((t) => {
        const existing = prev.find((x) => x.methodId === t.methodId);
        if (!existing) return t;
        // If category changed, positions might differ; clamp to what's allowed for the new category.
        const allowedPositions = new Set(t.applicableLogoPositions);
        const clampedPositions = existing.applicableLogoPositions.filter((pos) => allowedPositions.has(pos));
        return {
          ...t,
          enabled: existing.enabled,
          price: existing.price,
          applicableLogoPositions: clampedPositions.length ? clampedPositions : t.applicableLogoPositions,
          applicableLogoSizes: existing.applicableLogoSizes?.length ? existing.applicableLogoSizes : t.applicableLogoSizes,
          whatsApplicable: existing.whatsApplicable,
        };
      });
    });

    if (brandingCategoryConfig.sizeOptions.length > 0) {
      setVariantSizeQty((prev) => {
        const next: Record<string, string> = {};
        brandingCategoryConfig.sizeOptions.forEach((sz) => {
          next[sz] = prev[sz] ?? '0';
        });
        return next;
      });
    } else {
      setVariantSizeQty({});
    }
  }, [brandingCategoryKey, brandingCategoryConfig.sizeOptions]);

  const addSpecRow = () => setSpecRows((prev) => [...prev, { id: `s-${Date.now()}`, label: 'Specification', value: 'Select' }]);
  const removeSpecRow = (id: string) => setSpecRows((prev) => prev.filter((row) => row.id !== id));
  const addVariant = () =>
    setVariantRows((prev) => [...prev, { id: `v-${Date.now()}`, name: 'New', variantPrice: '', sku: '', quantity: '', weight: '', visible: true }]);
  const removeVariant = (id: string) => setVariantRows((prev) => prev.filter((row) => row.id !== id));
  const updateVariant = (id: string, key: keyof VariantRow, value: string | boolean) =>
    setVariantRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const updateBrandingRow = (id: string, patch: Partial<BrandingOptionRow>) =>
    setBrandingRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const onPickImage = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadedImages((prev) => [...prev, ...Array.from(files).map((f) => f.name)]);
  };

  const onSave = () => {
    const payload = {
      productId: productId ?? 'new',
      productName,
      category,
      subCategory,
      qtyCapacity,
      brand,
      description,
      additionalInfo,
      terms,
      uploadedImages,
      specRows,
      variantRows,
      sellPrice,
      brandingRows,
      pricingModel,
      pricing_type: pricingSetup.pricing_type,
      price_type: pricingSetup.price_type,
      base_price: pricingSetup.base_price,
      starting_price: pricingSetup.starting_price,
      min_acceptable_offer: pricingSetup.min_acceptable_offer,
      offer_validity_hours: pricingSetup.offer_validity_hours,
      response_time_hours: pricingSetup.response_time_hours,
      mogzuMarkupPercent,
      referenceOfferPrice,
      offerNegotiationNote,
      savedAt: new Date().toISOString(),
    };
    const key = productId ? `mogzu_vendor_product_${productId}` : 'mogzu_vendor_add_product_draft';
    localStorage.setItem(key, JSON.stringify(payload));

    if (isCreate && !readOnly) {
      const name = productName.trim();
      if (!name) {
        setUiNotice('Please enter a product name before adding to your catalog.');
        return;
      }
      const cat = category === 'Choose category' ? 'Uncategorised' : category;
      const qty = Math.max(0, Math.floor(Number(String(qtyCapacity).replace(/,/g, '')) || 0));
      const fromSell = parseFloat(String(sellPrice).replace(/[₹,\s]/g, ''));
      const fromVariant = parseFloat(String(variantRows[0]?.variantPrice ?? '').replace(/,/g, ''));
      const basePriceRaw = Number.isFinite(fromSell) && fromSell >= 0 ? fromSell : fromVariant;
      const basePrice = Number.isFinite(basePriceRaw) && basePriceRaw >= 0 ? Math.round(basePriceRaw) : 0;
      const refOffer = parseFloat(String(referenceOfferPrice).replace(/[₹,\s]/g, ''));
      const refOfferRounded =
        Number.isFinite(refOffer) && refOffer >= 0 ? Math.round(refOffer) : basePrice;
      const markupNum = parseFloat(String(mogzuMarkupPercent).replace(/,/g, ''));
      const markupRounded =
        Number.isFinite(markupNum) && markupNum >= 0 ? Math.round(markupNum * 10) / 10 : 0;

      const pricingModelMapped: VendorPricingModel =
        pricingSetup.pricing_type === 'offer_price'
          ? 'offer'
          : pricingSetup.pricing_type === 'request_for_price'
            ? 'opaque'
            : 'transparent';
      const catalogPrice =
        pricingSetup.pricing_type === 'offer_price'
          ? (pricingSetup.starting_price ?? refOfferRounded)
          : pricingSetup.pricing_type === 'transparent'
            ? (pricingSetup.base_price ?? basePrice)
            : basePrice;
      const stock: 'Available' | 'Out of stock' = qty > 0 ? 'Available' : 'Out of stock';
      const catalogId = `p-${Date.now()}`;
      const sku = `POD${Date.now().toString(36).toUpperCase()}`;

      const payment_methods = [
        ...VENDOR_PAYMENT_PRESETS.filter((p) => paymentPresetOn[p.id]).map((p) => p.id),
        ...parseListingLines(paymentCustomText),
      ];
      appendVendorCatalogProduct({
        id: catalogId,
        name,
        productId: sku,
        category: cat,
        qtyCapacity: qty,
        price: catalogPrice,
        stock,
        pricingModel: pricingModelMapped,
        mogzuMarkupPercent: pricingModelMapped === 'transparent' ? markupRounded : undefined,
        buyer_detail: {
          amenities: parseListingLines(amenitiesText),
          portfolio_links: parseListingLines(portfolioLinksText),
          portfolio_captions: [],
          policies: parseListingLines(terms),
          payment_methods,
          payment_terms: vendorPaymentTerms.trim(),
        },
      });

      setUiNotice(null);
      setSaveMessage('Product added to your catalog. Redirecting to your product list…');
      window.setTimeout(
        () =>
          navigate('/vendor/products', {
            state: { catalogNotice: `“${name}” was added to your catalog.` },
          }),
        700,
      );
      return;
    }

    setSaveMessage(isCreate ? 'Product draft saved. You can continue editing.' : 'Product updated.');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const inputRo = readOnly ? { readOnly: true, className: '...' } : {};
  const baseInput = (extra: string) =>
    `h-8 rounded border border-slate-200 px-3 text-xs ${readOnly ? 'cursor-default bg-slate-50 text-slate-600' : ''} ${extra}`;
  const baseSelect = (extra: string) =>
    `h-8 rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-default bg-slate-50 text-slate-600' : ''} ${extra}`;

  return (
    <>
      <VendorAppShell
        activeNav="products"
        routeSource="vendor-add-product"
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
      >
        <main className="min-h-full w-full bg-transparent">
          <div className="px-4 pb-28 pt-4 sm:px-6">
            {uiNotice ? (
              <p className="mx-auto mb-3 max-w-[1300px] rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {uiNotice}
              </p>
            ) : null}
            <MogzuLegacyDemoBanner className="mx-auto mb-4 max-w-[1300px]" />
            {isCreate ? (
              <p className="mx-auto mb-4 max-w-[1300px] text-sm text-slate-600">
                This form saves to your local vendor catalog. To publish a live gifting listing for corporates, use{' '}
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:underline"
                  onClick={() => navigate('/vendor/gifting/products/new')}
                >
                  gifting product setup
                </button>
                .
              </p>
            ) : null}
            {productId && isListingUuid(productId) ? (
              <p className="mx-auto mb-4 max-w-[1300px] text-sm text-slate-600">
                This product id is a live listing —{' '}
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:underline"
                  onClick={() => navigate(`/vendor/gifting/products/${productId}`)}
                >
                  open in gifting editor
                </button>
                .
              </p>
            ) : null}
            <section className="mx-auto max-w-[1300px] rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 border-b border-slate-100 pb-3">
                <h1 className="text-lg font-semibold text-slate-900">
                  {isCreate ? 'Add product' : isView ? 'View product' : 'Edit product'}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  {isCreate
                    ? 'Fill in the details below, then use Add to catalog to publish this product to your store list.'
                    : isView
                      ? 'You are viewing this product. Switch to edit from the product list if needed.'
                      : 'Update details and save. Your catalog row updates in step 3 when edit sync is wired.'}
                </p>
              </div>
              <h2 className="mb-3 text-sm font-semibold text-slate-800">Attributes & details</h2>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <input value={productName} onChange={(e) => setProductName(e.target.value)} className="h-8 w-full rounded border border-slate-200 px-3 text-xs" placeholder="Product name" />
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-xs">
                        <option>Choose category</option>
                        <option>Apparel</option>
                        <option>Bags</option>
                        <option>Tech</option>
                        <option>Wellness</option>
                        <option>Stationery</option>
                      </select>
                      <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-xs">
                        <option>Choose category</option>
                        <option>Tshirts</option>
                        <option>Hoodies</option>
                        <option>Backpacks</option>
                        <option>Tote bags</option>
                        <option>Power banks</option>
                        <option>Yoga kits</option>
                        <option>Notebooks</option>
                      </select>
                      <input value={qtyCapacity} onChange={(e) => setQtyCapacity(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Qty/capacity" />
                      <input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Brand" />
                    </div>
                    <p className="mt-3 text-[11px] font-medium text-[#2563EB]">+ Food Custom Attribute</p>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe" className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-xs" />
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-700">Specifications</p>
                    <div className="space-y-2">
                      {specRows.map((row) => (
                        <div key={row.id} className="grid grid-cols-[1fr_120px_24px] items-center gap-2">
                          <input value={row.label} onChange={(e) => setSpecRows((prev) => prev.map((x) => (x.id === row.id ? { ...x, label: e.target.value } : x)))} className="h-8 rounded border border-slate-200 px-2 text-xs" />
                          <input value={row.value} onChange={(e) => setSpecRows((prev) => prev.map((x) => (x.id === row.id ? { ...x, value: e.target.value } : x)))} className="h-8 rounded border border-slate-200 px-2 text-xs" />
                          <button type="button" onClick={() => removeSpecRow(row.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addSpecRow} className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-600"><Plus className="h-3.5 w-3.5" />Add custom</button>
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-700">Amenities (one per line)</p>
                    <textarea
                      value={amenitiesText}
                      onChange={(e) => setAmenitiesText(e.target.value)}
                      rows={3}
                      placeholder="e.g. Rush delivery available"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-700">Portfolio / reference links (one per line)</p>
                    <textarea
                      value={portfolioLinksText}
                      onChange={(e) => setPortfolioLinksText(e.target.value)}
                      rows={2}
                      placeholder="https://…"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="rounded-md border border-slate-200 p-3"><textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows={3} placeholder="Add additional information" className="w-full rounded border border-slate-200 px-3 py-2 text-xs" /></div>
                  <div className="rounded-md border border-dashed border-slate-300 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-700">T&amp;C / policies (one per line)</p>
                    <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} placeholder="Returns, lead time, damage policy…" className="w-full bg-transparent text-xs outline-none" />
                  </div>
                  <div className="rounded-md border border-slate-200 p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Payment</p>
                    <div className="flex flex-wrap gap-2">
                      {VENDOR_PAYMENT_PRESETS.map((p) => (
                        <label key={p.id} className="inline-flex items-center gap-1 text-[11px] text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(paymentPresetOn[p.id])}
                            onChange={(e) =>
                              setPaymentPresetOn((prev) => ({ ...prev, [p.id]: e.target.checked }))
                            }
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={paymentCustomText}
                      onChange={(e) => setPaymentCustomText(e.target.value)}
                      rows={2}
                      placeholder="Other payment methods (one per line)"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs"
                    />
                    <textarea
                      value={vendorPaymentTerms}
                      onChange={(e) => setVendorPaymentTerms(e.target.value)}
                      rows={2}
                      placeholder="Payment terms (e.g. 50% advance)"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((idx) => (
                        <label key={idx} className="flex aspect-[1.2] cursor-pointer items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => onPickImage(e.target.files)} />
                          {idx < 2 ? (
                            <img src={imgProductThumb} alt="preview" className="h-full w-full object-contain p-1" />
                          ) : (
                            <div className="px-2 text-center">
                              <ImagePlus className="mx-auto h-5 w-5" />
                              <p className="mt-1 text-[10px]">Click to add photos or drag and drop here</p>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                    {uploadedImages.length > 0 && <p className="mt-2 text-xs text-slate-500">Selected: {uploadedImages.join(', ')}</p>}
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    {brandingCategoryConfig.sizeOptions.length > 0 ? (
                      <>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">Choose quantities for size</span>
                          <span className="text-rose-500">
                            Quantity{' '}
                            {Object.values(variantSizeQty)
                              .reduce((sum, v) => sum + (parseInt(v || '0', 10) || 0), 0)
                              .toString()}
                          </span>
                    </div>
                        <div className={`grid gap-2 ${brandingCategoryConfig.sizeOptions.length > 4 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                          {brandingCategoryConfig.sizeOptions.map((sz) => (
                            <input
                              key={sz}
                              value={variantSizeQty[sz] ?? ''}
                              onChange={(e) => setVariantSizeQty((prev) => ({ ...prev, [sz]: e.target.value }))}
                              disabled={readOnly}
                              className={`h-8 rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                              placeholder={sz}
                              aria-label={`Quantity ${sz}`}
                            />
                      ))}
                    </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Size breakups aren&apos;t applicable for this product type.</p>
                    )}
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-medium text-slate-700">Branding & customization</p>
                    <p className="mb-3 text-[11px] leading-snug text-slate-500">
                      Turn branding methods on for what you offer. Set add-on price, which logo placements/sizes are applicable, and what the buyer should know.
                    </p>
                    <div className="space-y-3">
                      {brandingRows.map((row) => (
                        <div
                          key={row.id}
                          className={`rounded-md border p-2.5 ${row.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/80'}`}
                        >
                          <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-800">
                            <input
                              type="checkbox"
                              checked={row.enabled}
                              disabled={readOnly}
                              onChange={(e) => updateBrandingRow(row.id, { enabled: e.target.checked })}
                            />
                            {row.label}
                          </label>
                          <div className="grid gap-2 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                              <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">Add-on price</span>
                              <input
                                value={row.price}
                                disabled={readOnly}
                                onChange={(e) => updateBrandingRow(row.id, { price: e.target.value })}
                                className={`h-8 w-full rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                                placeholder="e.g. 25"
                                inputMode="decimal"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">Applicable logo positions</span>
                              <div className="flex flex-wrap gap-2">
                                {brandingCategoryConfig.logoPositions.map((pos) => {
                                  const selected = row.applicableLogoPositions.includes(pos.id);
                                  return (
                                    <button
                                      key={pos.id}
                                      type="button"
                                      disabled={readOnly}
                                      onClick={() => {
                                        const next = selected
                                          ? row.applicableLogoPositions.filter((x) => x !== pos.id)
                                          : [...row.applicableLogoPositions, pos.id];
                                        updateBrandingRow(row.id, { applicableLogoPositions: next });
                                      }}
                                      className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                                        selected
                                          ? 'border-[#2563EB] bg-blue-50 text-[#1D4ED8]'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                      } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                      {pos.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">Applicable logo sizes</span>
                              <div className="flex flex-wrap gap-2">
                                {LOGO_SIZE_OPTIONS.map((s) => {
                                  const selected = row.applicableLogoSizes.includes(s.id);
                                  return (
                                    <button
                                      key={s.id}
                                      type="button"
                                      disabled={readOnly}
                                      onClick={() => {
                                        const next = selected
                                          ? row.applicableLogoSizes.filter((x) => x !== s.id)
                                          : [...row.applicableLogoSizes, s.id];
                                        updateBrandingRow(row.id, { applicableLogoSizes: next });
                                      }}
                                      className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                                        selected
                                          ? 'border-[#2563EB] bg-blue-50 text-[#1D4ED8]'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                      } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                      {s.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">What&apos;s applicable</span>
                              <textarea
                                value={row.whatsApplicable}
                                disabled={readOnly}
                                onChange={(e) => updateBrandingRow(row.id, { whatsApplicable: e.target.value })}
                                rows={2}
                                className={`w-full rounded border border-slate-200 px-2 py-1.5 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                                placeholder="Artwork rules, file type, lead time, material limits…"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 p-3 space-y-2">
                    <input className="h-8 w-full rounded border border-slate-200 px-2 text-xs" placeholder="Availability" />
                    <input className="h-8 w-full rounded border border-slate-200 px-2 text-xs" placeholder="Minimum order quantity" />
                    <input className="h-8 w-full rounded border border-slate-200 px-2 text-xs" placeholder="Splicing status" />
                  </div>

                  <div className="rounded-md border border-slate-200 p-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-700">Buyer-facing pricing</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                        Choose how corporate clients see and act on price on Mogzu.
                      </p>
                    </div>
                    <PricingTypeSelector value={pricingSetup} onChange={setPricingSetup} />
                    {pricingSetup.pricing_type === 'transparent' && (
                      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 p-2.5">
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">Mogzu markup (%)</label>
                        <input
                          value={mogzuMarkupPercent}
                          onChange={(e) => setMogzuMarkupPercent(e.target.value)}
                          disabled={readOnly}
                          className={`h-8 w-full max-w-[120px] rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                          placeholder="12"
                          inputMode="decimal"
                          aria-label="Mogzu markup percent"
                        />
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Client sees approximately{' '}
                          <span className="font-medium text-slate-700">
                            ₹
                            {(() => {
                              const base = parseFloat(String(sellPrice).replace(/[₹,\s]/g, ''));
                              const v0 = parseFloat(String(variantRows[0]?.variantPrice ?? '').replace(/,/g, ''));
                              const b = Number.isFinite(base) && base >= 0 ? base : Number.isFinite(v0) && v0 >= 0 ? v0 : 0;
                              const m = parseFloat(String(mogzuMarkupPercent).replace(/,/g, ''));
                              const mm = Number.isFinite(m) && m >= 0 ? m : 0;
                              return Math.round(b * (1 + mm / 100)) || '—';
                            })()}
                          </span>{' '}
                          / unit when your base is set below (preview).
                        </p>
                      </div>
                    )}
                    {pricingSetup.pricing_type === 'request_for_price' && (
                      <p className="rounded-md border border-amber-100 bg-amber-50/80 p-2 text-[11px] text-amber-900">
                        Listing will show &quot;Quote on request&quot;. Keep your internal sell price for your records — it is not shown to buyers.
                      </p>
                    )}
                    {pricingSetup.pricing_type === 'offer_price' && (
                      <div className="space-y-2 rounded-md border border-dashed border-slate-200 bg-slate-50/80 p-2.5">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">Reference / list price (anchor)</label>
                          <input
                            value={referenceOfferPrice}
                            onChange={(e) => setReferenceOfferPrice(e.target.value)}
                            disabled={readOnly}
                            className={`h-8 w-full rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                            placeholder="Same as sell price or MSRP"
                            inputMode="decimal"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">Negotiation note (optional)</label>
                          <textarea
                            value={offerNegotiationNote}
                            onChange={(e) => setOfferNegotiationNote(e.target.value)}
                            disabled={readOnly}
                            rows={2}
                            className={`w-full rounded border border-slate-200 px-2 py-1.5 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                            placeholder="e.g. Volume discounts, MOQ…"
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs font-medium text-slate-700">Your numbers</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="MRP" />
                      <input
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        disabled={readOnly}
                        className={`h-8 rounded border border-slate-200 px-2 text-xs ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                        placeholder={
                          pricingSetup.pricing_type === 'request_for_price'
                            ? 'Internal sell (not public)'
                            : pricingSetup.pricing_type === 'offer_price'
                              ? 'Internal floor (optional)'
                              : 'Base / sell price'
                        }
                        aria-label="Sell price for catalog"
                      />
                    </div>
                    <input className="h-8 w-full rounded border border-slate-200 px-2 text-xs" placeholder="Storage price" />
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-medium text-slate-700">Quantity Base Pricing</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Qty" />
                      <input className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Price per unit" />
                      <input className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Qty" />
                      <input className="h-8 rounded border border-slate-200 px-2 text-xs" placeholder="Price per unit" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Additional quantity-based pricing rows will be available in a future release.')}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#2563EB] hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />Add
                    </button>
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-medium text-slate-700">Marketing</p>
                    <div className="mt-1 flex gap-4 text-[11px] text-[#2563EB]">
                      <button
                        type="button"
                        onClick={() => setUiNotice('Combo suggestion setup will be available in a future release.')}
                        className="hover:underline"
                      >
                        + Add Combo Suggestion
                      </button>
                      <button
                        type="button"
                        onClick={() => setUiNotice('Related product linking will be available in a future release.')}
                        className="hover:underline"
                      >
                        + Add Related Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-slate-200 p-3">
                <h2 className="mb-2 text-sm font-semibold text-slate-800">Product Variants</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="text-[11px] text-slate-400">
                        <th className="pb-2 font-medium">Variant</th>
                        <th className="pb-2 font-medium">Variant price</th>
                        <th className="pb-2 font-medium">SKU</th>
                        <th className="pb-2 font-medium">Quantity</th>
                        <th className="pb-2 font-medium">Weight</th>
                        <th className="pb-2 font-medium">Visible</th>
                        <th className="pb-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {variantRows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 text-[13px]">
                          <td className="py-2"><input value={row.name} onChange={(e) => updateVariant(row.id, 'name', e.target.value)} className="h-8 w-full rounded border border-slate-200 px-2 text-xs" /></td>
                          <td className="py-2"><input value={row.variantPrice} onChange={(e) => updateVariant(row.id, 'variantPrice', e.target.value)} className="h-8 w-full rounded border border-slate-200 px-2 text-xs" /></td>
                          <td className="py-2"><input value={row.sku} onChange={(e) => updateVariant(row.id, 'sku', e.target.value)} className="h-8 w-full rounded border border-slate-200 px-2 text-xs" /></td>
                          <td className="py-2"><input value={row.quantity} onChange={(e) => updateVariant(row.id, 'quantity', e.target.value)} className="h-8 w-full rounded border border-slate-200 px-2 text-xs" /></td>
                          <td className="py-2"><input value={row.weight} onChange={(e) => updateVariant(row.id, 'weight', e.target.value)} className="h-8 w-full rounded border border-slate-200 px-2 text-xs" /></td>
                          <td className="py-2 text-center">
                            <input type="checkbox" checked={row.visible} onChange={(e) => updateVariant(row.id, 'visible', e.target.checked)} />
                          </td>
                          <td className="py-2"><button type="button" onClick={() => removeVariant(row.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addVariant} className="mt-2 inline-flex items-center gap-1 text-xs text-[#2563EB] hover:underline"><Plus className="h-3.5 w-3.5" />Add variant</button>
              </div>
            </section>
          </div>
        </main>
      </VendorAppShell>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3">
          {saveMessage && <p className="mr-auto text-sm text-emerald-600">{saveMessage}</p>}
          <button type="button" onClick={() => navigate('/vendor/products')} className="rounded-full border border-slate-300 px-6 py-2 text-sm text-slate-700 hover:bg-slate-50">
            {isCreate ? 'Back to list' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (readOnly) navigate('/vendor/products');
              else onSave();
            }}
            className="rounded-full bg-[#2563EB] px-7 py-2 text-sm text-white hover:bg-[#1f55c8]"
          >
            {isCreate ? 'Add to catalog' : readOnly ? 'Back to list' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}
