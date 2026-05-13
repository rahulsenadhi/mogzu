import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpDown, Eye, Filter, Search } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import {
  CORP_VENDOR_ENQUIRY_UPDATED_EVENT,
  loadCorpVendorEnquiries,
  type CorpVendorEnquiry,
} from '@/app/lib/corpVendorEnquiryStorage';
import {
  DEMO_VENDOR_STATIC_ORDERS,
  type VendorDemoOrderRow,
  type VendorOrderListTab,
} from '@/app/lib/vendorOrdersDemoSeed';

type OrderTab = VendorOrderListTab;

type OrderRow = VendorDemoOrderRow;

function corpEnquiryToOrderRow(e: CorpVendorEnquiry, displayIndex: number): OrderRow {
  const detail =
    e.requirementSummary.length > 220 ? `${e.requirementSummary.slice(0, 220)}…` : e.requirementSummary;
  const confirmed =
    e.bookingConfirmedAt != null
      ? `\nBooking confirmed: ${new Date(e.bookingConfirmedAt).toLocaleString()}`
      : '';
  return {
    srNo: String(displayIndex + 1).padStart(4, '0'),
    orderId: e.vendorOrderId,
    productService: e.productName,
    customerName: e.corporateCompanyName,
    dates: `Requested date: ${e.requestedDate}\nDuration: ${e.durationLabel}\nEvent / requirement:\n${detail}\nReceived: ${new Date(e.createdAt).toLocaleString()}${confirmed}`,
    qty: e.headcountOrQty,
    price: e.offerAmountDisplay ?? 'Negotiable',
    status: e.bookingConfirmedAt != null ? 'Processing' : 'Pending',
    paymentStatus: e.bookingConfirmedAt != null ? 'Paid' : 'Waiting',
    type: 'order_request',
  };
}

const tabs: Array<{ id: OrderTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'order_request', label: 'Order request' },
  { id: 'pending_orders', label: 'Pending orders' },
  { id: 'confirmed_orders', label: 'Confirmed orders' },
  { id: 'canceled_orders', label: 'Canceled orders' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'completed', label: 'Completed' },
];

const orders: OrderRow[] = DEMO_VENDOR_STATIC_ORDERS;

export default function VendorOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [enquiryRefresh, setEnquiryRefresh] = useState(0);

  useEffect(() => {
    const onUp = () => setEnquiryRefresh((n) => n + 1);
    window.addEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, onUp);
    return () => window.removeEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, onUp);
  }, []);

  const mergedOrders = useMemo(() => {
    const fromCorp = loadCorpVendorEnquiries().map((e, i) => corpEnquiryToOrderRow(e, i));
    return [...fromCorp, ...orders];
  }, [enquiryRefresh]);

  const filteredOrders = useMemo(() => {
    return mergedOrders.filter((order) => {
      const matchesTab = activeTab === 'all' ? true : order.type === activeTab;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        order.orderId.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.productService.toLowerCase().includes(q) ||
        order.dates.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search, mergedOrders]);

  return (
    <VendorAppShell
      activeNav="orders"
      routeSource="vendor-orders"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex min-w-max gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 text-sm font-medium leading-normal transition-colors ${
                          activeTab === tab.id
                            ? 'border-b-2 border-blue-600 font-semibold text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm leading-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium leading-normal text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      Processing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      Pending
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      Canceled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      Waiting
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUiNotice('Filter controls will be available once advanced order filters are enabled.')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Filter className="h-4 w-4 text-slate-500" />
                      Filter
                    </button>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Sort controls will be available once advanced sorting options are enabled.')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <ArrowUpDown className="h-4 w-4 text-slate-500" />
                      Sort by
                    </button>
                  </div>
                </div>

                {uiNotice ? (
                  <p
                    className="mx-5 mt-4 mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium leading-normal text-blue-800"
                    role="status"
                  >
                    {uiNotice}
                  </p>
                ) : null}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase leading-normal tracking-wider text-slate-500">
                        <th className="px-6 py-4">Sr No.</th>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Product/service</th>
                        <th className="px-6 py-4">Customer name</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Attendance / Qty</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Payment Status</th>
                        <th className="px-6 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm leading-normal text-slate-700">
                      {filteredOrders.map((order, rowIndex) => (
                        <tr
                          key={`${order.orderId}-${rowIndex}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/vendor/orders/${encodeURIComponent(order.orderId)}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/vendor/orders/${encodeURIComponent(order.orderId)}`);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{order.srNo}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{order.orderId}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{order.productService}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{order.customerName}</td>
                          <td className="whitespace-pre-line px-6 py-4 text-xs leading-normal text-slate-500">
                            {order.dates}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">{order.qty}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{order.price}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-normal ${
                                order.status === 'Completed'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : order.status === 'Canceled'
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : order.status === 'Processing'
                                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}
                            >
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-normal ${
                                order.paymentStatus === 'Paid'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : order.paymentStatus === 'Cancel'
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : order.paymentStatus === 'Pending'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : 'border-slate-200 bg-slate-100 text-slate-600'
                              }`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendor/orders/${encodeURIComponent(order.orderId)}`);
                              }}
                              className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
        </div>
      </main>
    </VendorAppShell>
  );
}
