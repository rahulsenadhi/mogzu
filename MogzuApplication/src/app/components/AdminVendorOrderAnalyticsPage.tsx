import { useMemo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Eye, ListFilter, Loader2, Pencil, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { supabase } from '@/lib/supabase';
import type { Booking, ModuleId } from '@/lib/database.types';

type StatusTab = 'Pending' | 'Confirmed' | 'Processing' | 'Delivered' | 'On the way' | 'Pick up' | 'Cancelled';

type OrderRow = {
  id: string;
  vendorName: string;
  orderId: string;
  category: 'SpaceX' | 'Event' | 'Gifting';
  orderedItem: string;
  customer: string;
  pendingAmount: string;
  status: StatusTab;
};

const statusTabs: StatusTab[] = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'On the way', 'Pick up', 'Cancelled'];

const DEMO_ORDER_ROWS: OrderRow[] = [
  { id: 'o1', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'SpaceX', orderedItem: 'NESCO IT Park', customer: 'Riya Singh', pendingAmount: '₹ 9710', status: 'Pending' },
  { id: 'o2', vendorName: 'Riya Nair', orderId: 'ENZ004130', category: 'Event', orderedItem: 'Printed Round Neck Co..', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
  { id: 'o3', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'Gifting', orderedItem: 'Printed Round Neck Co..', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
  { id: 'o4', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'SpaceX', orderedItem: 'kapil@mail.com', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
  { id: 'o5', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'Gifting', orderedItem: 'kapil@mail.com', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
  { id: 'o6', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'Gifting', orderedItem: 'kapil@mail.com', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
  { id: 'o7', vendorName: 'Kapil Dev', orderId: 'ENZ004130', category: 'Gifting', orderedItem: 'kapil@mail.com', customer: 'Ravi Kumar', pendingAmount: '₹ 228', status: 'Pending' },
];

type AdminGiftingOrderStatus = 'new' | 'confirmed' | 'in_production' | 'dispatched' | 'delivered'
type AdminGiftingPaymentStatus = 'paid' | 'pending' | 'refunded'
type AdminGiftingOrderRecord = {
  id: string
  product_id: string
  product_name: string
  product_image: string
  corporate_client: string
  client_contact: string
  vendor_name: string
  quantity: number
  price_per_unit: number
  total_value: number
  status: AdminGiftingOrderStatus
  payment_status: AdminGiftingPaymentStatus
  order_date: string
  delivery_date: string
  tracking_number: string | null
  special_instructions: string
  branding_required: boolean
}

// MOCK: Admin — Gifting Orders [Step 3G]
export const adminGiftingOrdersMock: AdminGiftingOrderRecord[] = [
  {
    id: 'ORD-2026-1001',
    product_id: '1',
    product_name: 'Premium Round Neck Corporate T-Shirt',
    product_image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'BlueOrbit Systems Pvt Ltd',
    client_contact: 'Aarav Mehta',
    vendor_name: 'Adidas',
    quantity: 300,
    price_per_unit: 350,
    total_value: 105000,
    status: 'new',
    payment_status: 'pending',
    order_date: '2026-02-18',
    delivery_date: '2026-04-20',
    tracking_number: null,
    special_instructions: 'Add employee names on sleeve tags and pack by team.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1002',
    product_id: '2',
    product_name: 'Classic Business Polo Shirt with Logo',
    product_image: 'https://images.unsplash.com/photo-1763771444795-85740205e3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Zenbyte Analytics',
    client_contact: 'Ishita Rao',
    vendor_name: 'Puma',
    quantity: 220,
    price_per_unit: 550,
    total_value: 121000,
    status: 'new',
    payment_status: 'pending',
    order_date: '2026-03-03',
    delivery_date: '2026-04-24',
    tracking_number: null,
    special_instructions: 'Use navy fabric and include bilingual thank-you inserts.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1003',
    product_id: '4',
    product_name: 'Performance Dry-Fit T-Shirt',
    product_image: 'https://images.unsplash.com/photo-1564316800929-be17a69d6966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Northshore Payments',
    client_contact: 'Rohan Chawla',
    vendor_name: 'Reebok',
    quantity: 180,
    price_per_unit: 480,
    total_value: 86400,
    status: 'confirmed',
    payment_status: 'paid',
    order_date: '2026-02-27',
    delivery_date: '2026-04-18',
    tracking_number: null,
    special_instructions: 'Pack event-day kits with color-wise size separation.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1004',
    product_id: '8',
    product_name: 'Classic Bomber Jacket',
    product_image: 'https://images.unsplash.com/photo-1762344686263-23b39789bf55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Arclight Ventures',
    client_contact: 'Neha Kulkarni',
    vendor_name: 'Reebok',
    quantity: 90,
    price_per_unit: 1800,
    total_value: 162000,
    status: 'confirmed',
    payment_status: 'paid',
    order_date: '2026-02-11',
    delivery_date: '2026-04-22',
    tracking_number: null,
    special_instructions: 'Embroidery should match updated branding guidelines v2.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1005',
    product_id: '12',
    product_name: 'Executive Formal Shirt',
    product_image: 'https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'MetroSphere Infra',
    client_contact: 'Pranav Jain',
    vendor_name: 'Nike',
    quantity: 260,
    price_per_unit: 750,
    total_value: 195000,
    status: 'in_production',
    payment_status: 'paid',
    order_date: '2026-02-20',
    delivery_date: '2026-04-19',
    tracking_number: null,
    special_instructions: 'Do size-wise QC photos before dispatch.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1006',
    product_id: '15',
    product_name: 'Classic Baseball Cap',
    product_image: 'https://images.unsplash.com/photo-1765875485201-0fca8c027f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Strata Cloud Tech',
    client_contact: 'Mitali Sen',
    vendor_name: 'Puma',
    quantity: 500,
    price_per_unit: 280,
    total_value: 140000,
    status: 'in_production',
    payment_status: 'paid',
    order_date: '2026-03-01',
    delivery_date: '2026-04-26',
    tracking_number: null,
    special_instructions: 'Split shipment to Bengaluru and Pune offices equally.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1007',
    product_id: '18',
    product_name: 'Athletic Track Pants',
    product_image: 'https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Helio Dynamics',
    client_contact: 'Kabir Sethi',
    vendor_name: 'Reebok',
    quantity: 140,
    price_per_unit: 650,
    total_value: 91000,
    status: 'dispatched',
    payment_status: 'paid',
    order_date: '2026-02-14',
    delivery_date: '2026-04-15',
    tracking_number: 'TRK-MGZ-778201',
    special_instructions: 'Dispatch with moisture-proof packaging for monsoon route.',
    branding_required: false,
  },
  {
    id: 'ORD-2026-1008',
    product_id: '19',
    product_name: 'Premium Jogger Pants',
    product_image: 'https://images.unsplash.com/photo-1715609104589-97585b210c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Bridgeway Consulting',
    client_contact: 'Suhani Bhatia',
    vendor_name: 'Nike',
    quantity: 130,
    price_per_unit: 750,
    total_value: 97500,
    status: 'dispatched',
    payment_status: 'paid',
    order_date: '2026-02-25',
    delivery_date: '2026-04-16',
    tracking_number: 'TRK-MGZ-778245',
    special_instructions: 'Keep SKU labels visible on every carton.',
    branding_required: false,
  },
  {
    id: 'ORD-2026-1009',
    product_id: '20',
    product_name: 'Complete Corporate Uniform Set',
    product_image: 'https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Vertex Logistics',
    client_contact: 'Aditya Pillai',
    vendor_name: 'Puma',
    quantity: 95,
    price_per_unit: 1800,
    total_value: 171000,
    status: 'delivered',
    payment_status: 'paid',
    order_date: '2026-02-07',
    delivery_date: '2026-04-12',
    tracking_number: null,
    special_instructions: 'Delivered kits should include role-wise assignment slips.',
    branding_required: true,
  },
  {
    id: 'ORD-2026-1010',
    product_id: '21',
    product_name: 'Sports Team Kit Bundle',
    product_image: 'https://images.unsplash.com/photo-1566827886031-7d0f288f76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    corporate_client: 'Nimbus Finserve',
    client_contact: 'Ananya Verma',
    vendor_name: 'Adidas',
    quantity: 110,
    price_per_unit: 1500,
    total_value: 165000,
    status: 'delivered',
    payment_status: 'refunded',
    order_date: '2026-02-09',
    delivery_date: '2026-04-13',
    tracking_number: null,
    special_instructions: 'Replace 8 damaged units in follow-up dispatch.',
    branding_required: true,
  },
]

function moduleToCategory(module: ModuleId): OrderRow['category'] {
  if (module === 'gifting') return 'Gifting';
  if (module === 'events') return 'Event';
  return 'SpaceX';
}

function mapBookingToStatusTab(b: Booking): StatusTab {
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'completed' || b.fulfilment_stage === 'delivered') return 'Delivered';
  if (b.fulfilment_stage === 'out_for_delivery' || b.fulfilment_stage === 'dispatched') {
    return 'On the way';
  }
  if (b.fulfilment_stage === 'packed' || b.fulfilment_stage === 'ordered') return 'Processing';
  if (b.status === 'confirmed') return 'Confirmed';
  return 'Pending';
}

function categoryClass(category: OrderRow['category']) {
  if (category === 'SpaceX') return 'bg-orange-50 text-orange-600 border-orange-200';
  if (category === 'Event') return 'bg-rose-50 text-rose-600 border-rose-200';
  return 'bg-emerald-50 text-emerald-600 border-emerald-200';
}

export default function AdminVendorOrderAnalyticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusTab>('Pending');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'general' | 'permissions' | 'sales' | 'orders'>('general');
  const [uiNotice, setUiNotice] = useState('');
  const [salesPage, setSalesPage] = useState(1);
  const [orderRows, setOrderRows] = useState<OrderRow[]>(DEMO_ORDER_ROWS);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);
  const pageSize = 7;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, module, status, fulfilment_stage, total_amount, listings(title), vendors(business_name), user_profiles!user_id(full_name)',
      )
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data?.length) {
      setUsingDemo(true);
      setOrderRows(DEMO_ORDER_ROWS);
      setLoading(false);
      return;
    }
    setUsingDemo(false);
    setOrderRows(
      (data as Array<Booking & {
        listings: { title: string | null } | null;
        vendors: { business_name: string | null } | null;
        user_profiles: { full_name: string | null } | null;
      }>).map((b) => ({
        id: b.id,
        vendorName: b.vendors?.business_name ?? '—',
        orderId: b.id.slice(0, 8).toUpperCase(),
        category: moduleToCategory(b.module),
        orderedItem: b.listings?.title ?? 'Booking',
        customer: b.user_profiles?.full_name ?? '—',
        pendingAmount: `₹ ${Math.round(b.total_amount ?? 0).toLocaleString('en-IN')}`,
        status: mapBookingToStatusTab(b),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orderRows.filter((r) => {
      if (r.status !== activeTab) return false;
      if (!q) return true;
      return (
        r.vendorName.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.orderedItem.toLowerCase().includes(q)
      );
    });
  }, [activeTab, query, orderRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      <div className="text-[11px] text-slate-400">
        Vendor Management Dashboard <span className="px-1">›</span> <span className="text-slate-500">Order Analytics</span>
      </div>
      <h1 className="text-3xl font-semibold text-slate-900">Order Analytics</h1>
      <p className="text-xs text-slate-500">{filtered.length} orders · {usingDemo ? 'demo data' : 'live bookings'}</p>

      {usingDemo && import.meta.env.DEV && (
        <DevMockDataBanner message="No bookings in Supabase — showing demo order analytics rows." />
      )}

      <div className="rounded-2xl border border-slate-200 bg-[#ECEFF6] p-4">
        <div className="mb-4 flex flex-wrap border-b border-slate-200">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                activeTab === tab
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUiNotice('Advanced filters will be available in a future release.')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            >
              <SlidersHorizontal className="size-4" />
              Filter
            </button>
            <button
              type="button"
              onClick={() => setUiNotice('Sort controls will be available in a future release.')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            >
              <ListFilter className="size-4" />
              Sort by
            </button>
          </div>
        </div>
        {uiNotice && (
          <p className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            {uiNotice}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-3 py-3">Vendor name</th>
                <th className="px-3 py-3">Order ID</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Ordered item</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Pending Amount</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-3 py-3 text-slate-700">{row.vendorName}</td>
                  <td className="px-3 py-3 text-slate-600">{row.orderId}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryClass(row.category)}`}>
                      {row.category === 'SpaceX' ? 'D Space' : row.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{row.orderedItem}</td>
                  <td className="px-3 py-3 text-slate-600">{row.customer}</td>
                  <td className="px-3 py-3 font-medium text-slate-700">{row.pendingAmount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => { setProfileOpen(true); setProfileTab('general'); }} className="text-slate-400 hover:text-slate-600">
                        <Eye className="size-4" />
                      </button>
                      <button type="button" onClick={() => setUiNotice(`Delete flow for ${row.orderId} will be available in a future release.`)} className="text-slate-400 hover:text-slate-600">
                        <Trash2 className="size-4" />
                      </button>
                      <button type="button" onClick={() => setUiNotice(`Edit flow for ${row.orderId} will be available in a future release.`)} className="text-[#2563EB] hover:underline">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} className="hover:text-slate-700">
            ← Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-7 min-w-7 rounded px-2 ${safePage === n ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="hover:text-slate-700">
            Next →
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/admin/vendors')}
        className="text-sm font-medium text-[#2563EB] hover:underline"
      >
        Back to vendor dashboard
      </button>

      {profileOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded p-1 text-slate-600 hover:bg-slate-100">
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUiNotice('Profile edit flow will be available in a future release.')}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-4 py-1.5 text-sm text-white hover:bg-[#1D4ED8]"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button type="button" onClick={() => setProfileOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="px-5 pt-3">
              <div className="flex items-center gap-6 border-b border-slate-200 text-sm">
                {([
                  ['general', 'General details'],
                  ['permissions', 'Permissions'],
                  ['sales', 'Sales'],
                  ['orders', 'Orders'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setProfileTab(id)}
                    className={`-mb-px border-b-2 pb-2 ${
                      profileTab === id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[68vh] overflow-auto p-5">
              {profileTab === 'general' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[120px_1fr]">
                    <div className="pt-1">
                      <img src={imgAvatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 text-sm">
                      <div><p className="text-xs text-slate-400">Email ID</p><p className="text-slate-700">kapildev@mail.com</p></div>
                      <div><p className="text-xs text-slate-400">User Name</p><p className="text-slate-700">Michiel</p></div>
                      <div><p className="text-xs text-slate-400">Company Name</p><p className="text-slate-700">Smart works</p></div>
                      <div><p className="text-xs text-slate-400">Contact Number</p><p className="text-slate-700">+91 8945988888</p></div>
                      <div><p className="text-xs text-slate-400">Type</p><p className="text-slate-700">Manufacturer</p></div>
                      <div><p className="text-xs text-slate-400">Location</p><p className="text-slate-700">Thane, Mumbai</p></div>
                      <div><p className="text-xs text-slate-400">Role</p><p className="text-slate-700">Vendor</p></div>
                      <div><p className="text-xs text-slate-400">Birthday</p><p className="text-slate-700">Smart works</p></div>
                      <div><p className="text-xs text-slate-400">Category</p><span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Gifting</span></div>
                      <div><p className="text-xs text-slate-400">Remarks</p><p className="text-slate-700">N/A</p></div>
                      <div><p className="text-xs text-slate-400">PAN</p><p className="text-slate-700">N/A</p></div>
                      <div><p className="text-xs text-slate-400">Description</p><p className="text-slate-700">Discover seamless meetings at Ginger Goa Panjim's 65 sq mt space, accommodating up to 40 guests.</p></div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 text-sm">
                      <div><p className="text-xs text-slate-400">Bank Name</p><p className="text-slate-700">HDFC Bank</p></div>
                      <div><p className="text-xs text-slate-400">Account No.</p><p className="text-slate-700">1220904678</p></div>
                      <div><p className="text-xs text-slate-400">Branch Name</p><p className="text-slate-700">Panjim</p></div>
                      <div><p className="text-xs text-slate-400">Bank IFSC Code</p><p className="text-slate-700">Fz088</p></div>
                      <div><p className="text-xs text-slate-400">Payment Terms</p><p className="text-slate-700">N/A</p></div>
                      <div><p className="text-xs text-slate-400">Payment Mode</p><p className="text-slate-700">N/A</p></div>
                      <div><p className="text-xs text-slate-400">Due Payment</p><p className="text-rose-500">360.00</p></div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'permissions' && (
                <div className="min-h-[360px]">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">Permission level</p>
                      <p className="mt-1 text-sm text-slate-700">Full-permission</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Access to categories</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full border border-[#2563EB] bg-blue-50 px-3 py-0.5 text-[11px] text-[#2563EB]">Order accept</span>
                        <span className="inline-flex rounded-full border border-[#2563EB] bg-blue-50 px-3 py-0.5 text-[11px] text-[#2563EB]">Create category</span>
                        <span className="inline-flex rounded-full border border-[#2563EB] bg-blue-50 px-3 py-0.5 text-[11px] text-[#2563EB]">Add product</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {profileTab === 'sales' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                          <th className="px-4 py-3">Sr No.</th>
                          <th className="px-3 py-3">Order ID</th>
                          <th className="px-3 py-3">Category</th>
                          <th className="px-3 py-3">Ordered item</th>
                          <th className="px-3 py-3">Paid Amount</th>
                          <th className="px-3 py-3">Credited by</th>
                          <th className="px-4 py-3 text-right"> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                          <tr key={n} className="border-b border-slate-100 text-sm text-slate-600">
                            <td className="px-4 py-3">{n}</td>
                            <td className="px-3 py-3">ENZ004199</td>
                            <td className="px-3 py-3">21 July 2024</td>
                            <td className="px-3 py-3">{n === 1 ? 'Printed Round ...' : '600.00'}</td>
                            <td className="px-3 py-3">{n === 1 ? '600.00' : n === 2 || n === 3 ? 'Limited' : '600.00'}</td>
                            <td className="px-3 py-3">Azad Ahirwar</td>
                            <td className="px-4 py-3 text-right text-slate-400">⋮</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button type="button" onClick={() => setSalesPage((p) => Math.max(1, p - 1))}>← Previous</button>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setSalesPage(1)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 1 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>1</button>
                      <button type="button" onClick={() => setSalesPage(2)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 2 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>2</button>
                      <button type="button" onClick={() => setSalesPage(3)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 3 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>3</button>
                      <span className="px-1">..</span>
                      <button type="button" onClick={() => setSalesPage(8)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 8 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>8</button>
                      <button type="button" onClick={() => setSalesPage(9)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 9 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>9</button>
                      <button type="button" onClick={() => setSalesPage(10)} className={`h-7 min-w-7 rounded px-2 ${salesPage === 10 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>10</button>
                    </div>
                    <button type="button" onClick={() => setSalesPage((p) => Math.min(10, p + 1))}>Next →</button>
                  </div>
                </div>
              )}
              {profileTab === 'orders' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                          <th className="px-4 py-3">Sr No.</th>
                          <th className="px-3 py-3">Order ID</th>
                          <th className="px-3 py-3">Date</th>
                          <th className="px-3 py-3">Item</th>
                          <th className="px-3 py-3">Amount</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                          <tr key={n} className="border-b border-slate-100 text-sm text-slate-600">
                            <td className="px-4 py-3">{n}</td>
                            <td className="px-3 py-3">ENZ00{4100 + n}</td>
                            <td className="px-3 py-3">21 July 2024</td>
                            <td className="px-3 py-3">Printed Round Neck Co..</td>
                            <td className="px-3 py-3">₹ 600.00</td>
                            <td className="px-3 py-3">
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">Delivered</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
