import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import {
  CORP_VENDOR_ENQUIRY_UPDATED_EVENT,
  findCorpVendorEnquiryByVendorOrderId,
  setCorpVendorEnquiryBookingConfirmed,
  updateCorpVendorEnquiryByVendorOrderId,
} from '@/app/lib/corpVendorEnquiryStorage';
import {
  findDemoVendorStaticOrderByOrderId,
  type VendorDemoOrderRow,
} from '@/app/lib/vendorOrdersDemoSeed';

type OrderStage = 'received' | 'processing' | 'out_for_delivery' | 'completed' | 'rejected';

const stageOrder: OrderStage[] = ['received', 'processing', 'out_for_delivery', 'completed'];
const dropdownStatusOptions: OrderStage[] = ['processing', 'out_for_delivery', 'completed', 'rejected'];

const stageLabels: Record<OrderStage, string> = {
  received: 'Order received',
  processing: 'Order processing',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  rejected: 'Rejected',
};

const lineItems = [
  { id: 'P001', item: "Women's Cotton Stretch Half Sleeve", color: 'Blue', size: 'Medium', quantity: 30, unitPrice: 400 },
  { id: 'P002', item: "Women's Cotton Stretch Half Sleeve", color: 'Blue', size: 'Large', quantity: 30, unitPrice: 400 },
  { id: 'P003', item: "Women's Cotton Stretch Half Sleeve", color: 'Blue', size: 'Small', quantity: 30, unitPrice: 400 },
];

const historyRows = [{ date: 'Jun 21, 2024', time: '12:56 pm', updatedBy: 'Kapil Dev', description: 'Order requested' }];

export default function VendorOrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const orderId = orderIdParam ? decodeURIComponent(orderIdParam).trim() : '';

  const [search, setSearch] = useState('');
  const [currentStage, setCurrentStage] = useState<OrderStage>('processing');
  const [deliveryPartner, setDeliveryPartner] = useState('');
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [updateStatusDraft, setUpdateStatusDraft] = useState<OrderStage>('processing');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateImageName, setUpdateImageName] = useState('');
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [enquiryRev, setEnquiryRev] = useState(0);
  const [vendorEnquiryReply, setVendorEnquiryReply] = useState('');

  useEffect(() => {
    const h = () => setEnquiryRev((n) => n + 1);
    window.addEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, h);
    return () => window.removeEventListener(CORP_VENDOR_ENQUIRY_UPDATED_EVENT, h);
  }, []);

  const corpEnquiry = useMemo(
    () => (orderId ? findCorpVendorEnquiryByVendorOrderId(orderId) : undefined),
    [orderId, enquiryRev],
  );

  const demoListRow = useMemo(
    () => (orderId ? findDemoVendorStaticOrderByOrderId(orderId) : undefined),
    [orderId],
  );

  const orderKnown = Boolean(corpEnquiry || demoListRow);

  const displayHistoryRows = useMemo(() => {
    if (corpEnquiry) {
      const created = new Date(corpEnquiry.createdAt);
      return [
        {
          date: created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          time: created.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
          updatedBy: corpEnquiry.corporateCompanyName,
          description: `Enquiry received — ${corpEnquiry.productName}`,
        },
      ];
    }
    if (demoListRow) {
      return [
        {
          date: 'Jun 21, 2024',
          time: '6:10 pm',
          updatedBy: demoListRow.customerName,
          description: `Order ${demoListRow.orderId} — ${demoListRow.productService} (${demoListRow.status})`,
        },
      ];
    }
    return historyRows;
  }, [corpEnquiry, demoListRow]);

  useEffect(() => {
    if (!demoListRow) return;
    const map: Record<VendorDemoOrderRow['status'], OrderStage> = {
      Completed: 'completed',
      Canceled: 'rejected',
      Processing: 'processing',
      Pending: 'received',
    };
    setCurrentStage(map[demoListRow.status] ?? 'processing');
  }, [demoListRow]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, row) => sum + row.unitPrice * row.quantity, 0),
    []
  );
  const shippingFee = 400;
  const taxAmount = Math.round(subtotal * 0.16);
  const total = subtotal + shippingFee + taxAmount;

  const stageIndex = stageOrder.indexOf(currentStage);
  const isRejected = currentStage === 'rejected';

  const openRejectModal = () => {
    setRejectReasonError('');
    setShowRejectReasonModal(true);
  };

  const openUpdateStatusModal = () => {
    setUpdateStatusDraft(currentStage === 'rejected' ? 'processing' : currentStage);
    setShowUpdateStatusModal(true);
  };

  const applyStatusUpdate = () => {
    if (updateStatusDraft === 'rejected') {
      setShowUpdateStatusModal(false);
      openRejectModal();
      return;
    }
    setCurrentStage(updateStatusDraft);
    setShowUpdateStatusModal(false);
  };

  const continueRejectFlow = () => {
    if (!rejectReason.trim()) {
      setRejectReasonError('Please add a rejection reason before continuing.');
      return;
    }
    setRejectReasonError('');
    setShowRejectReasonModal(false);
    setShowRejectConfirmModal(true);
  };

  const confirmReject = () => {
    setCurrentStage('rejected');
    setShowRejectConfirmModal(false);
  };

  return (
    <>
      <VendorAppShell
        activeNav="orders"
        routeSource="vendor-order-details"
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
          <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {uiNotice ? (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium leading-normal text-blue-800">
                {uiNotice}
              </p>
            ) : null}
              {!orderKnown ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <h1 className="text-lg font-semibold leading-normal text-slate-900">Order not found</h1>
                  <p className="mt-2 text-sm leading-normal text-slate-600">
                    No order matches{' '}
                    <span className="font-mono text-slate-800">{orderId || 'this link'}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/orders')}
                    className="mt-6 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Back to orders
                  </button>
                </section>
              ) : (
                <>
              {corpEnquiry ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
                  <h2 className="text-lg font-bold leading-normal text-[#0e1e3f]">Corporate enquiry</h2>
                  <p className="mt-1 text-sm leading-normal text-slate-500">Source: {corpEnquiry.source}</p>
                  <dl className="mt-4 grid gap-3 text-sm leading-normal sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Corporate company</dt>
                      <dd className="font-medium text-slate-900">{corpEnquiry.corporateCompanyName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Product / space</dt>
                      <dd className="font-medium text-slate-900">{corpEnquiry.productName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Requested date</dt>
                      <dd className="font-medium text-slate-900">{corpEnquiry.requestedDate}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Duration</dt>
                      <dd className="font-medium text-slate-900">{corpEnquiry.durationLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Headcount / quantity</dt>
                      <dd className="font-medium text-slate-900">{corpEnquiry.headcountOrQty}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Offer</dt>
                      <dd className="font-medium text-slate-900">
                        {corpEnquiry.offerAmountDisplay ?? 'Negotiable'}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 rounded-xl border border-amber-100 bg-white/80 p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase leading-normal tracking-wider text-slate-500">
                      Event or requirement
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-normal text-slate-700">
                      {corpEnquiry.requirementSummary}
                    </p>
                  </div>
                  {corpEnquiry.bookingConfirmedAt ? (
                    <p
                      className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-normal text-emerald-900"
                      role="status"
                    >
                      Booking confirmed with corporate — {new Date(corpEnquiry.bookingConfirmedAt).toLocaleString()}
                    </p>
                  ) : null}
                  {corpEnquiry.bookingConfirmedAt ? (
                    <div
                      className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-normal text-slate-800"
                      role="status"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payout tracking</p>
                      <p className="mt-1 font-medium">
                        {corpEnquiry.payoutStatus === 'paid'
                          ? 'Marked as paid (demo).'
                          : 'Pending — settlement typically follows Mogzu’s payout schedule after corporate payment clears.'}
                      </p>
                      {corpEnquiry.payoutStatus !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateCorpVendorEnquiryByVendorOrderId(corpEnquiry.vendorOrderId, {
                              payoutStatus: 'paid',
                            });
                            setUiNotice('Payout marked paid for this order (demo).');
                          }}
                          className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Record payout received (demo)
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 space-y-3 border-t border-amber-200/60 pt-4">
                    <p className="text-sm font-medium leading-normal text-slate-700">
                      Respond to corporate (updates their banner)
                    </p>
                    <textarea
                      value={vendorEnquiryReply}
                      onChange={(e) => setVendorEnquiryReply(e.target.value)}
                      rows={3}
                      placeholder="Optional message to corporate…"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const note = vendorEnquiryReply.trim() || 'We sent our best offer for your enquiry.';
                          updateCorpVendorEnquiryByVendorOrderId(corpEnquiry.vendorOrderId, {
                            responseStatus: 'best_offer',
                            vendorComment: note,
                          });
                          setUiNotice('Corporate sees “Best offer received”.');
                        }}
                        className="px-4 py-2 text-sm font-medium leading-normal text-white shadow-sm transition-colors bg-[#2563eb] rounded-lg hover:bg-blue-700"
                      >
                        Send best offer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const note = vendorEnquiryReply.trim() || 'We accepted your terms.';
                          updateCorpVendorEnquiryByVendorOrderId(corpEnquiry.vendorOrderId, {
                            responseStatus: 'accepted',
                            vendorComment: note,
                          });
                          setUiNotice('Corporate sees “Offer accepted”.');
                        }}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium leading-normal text-emerald-900 transition-colors hover:bg-emerald-100"
                      >
                        Accept their offer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const note = vendorEnquiryReply.trim() || 'We are unable to fulfil this enquiry.';
                          updateCorpVendorEnquiryByVendorOrderId(corpEnquiry.vendorOrderId, {
                            responseStatus: 'declined',
                            vendorComment: note,
                          });
                          setUiNotice('Corporate sees “Offer declined”.');
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-rose-700 transition-colors hover:bg-slate-50"
                      >
                        Decline
                      </button>
                      {!corpEnquiry.bookingConfirmedAt ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCorpVendorEnquiryBookingConfirmed(corpEnquiry.vendorOrderId);
                            setUiNotice('Booking marked confirmed — corporate product page shows the same.');
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Record booking confirmed
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs leading-normal text-slate-500">
                      Status: <span className="font-medium text-slate-700">{corpEnquiry.responseStatus}</span>
                    </p>
                  </div>
                </section>
              ) : null}
              {!corpEnquiry ? (
              <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => navigate('/vendor/orders')}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium leading-normal text-slate-600 transition-colors hover:text-[#2563eb]"
              >
                  <ChevronLeft className="h-5 w-5" />
                Order#{orderId}
              </button>
                <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold leading-normal tracking-tight text-[#0e1e3f]">
                      Request ID: {orderId}
                    </h1>
                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium leading-normal text-[#2563eb]">
                      {demoListRow
                        ? demoListRow.status === 'Completed'
                          ? 'Completed'
                          : demoListRow.status === 'Canceled'
                            ? 'Canceled'
                            : demoListRow.status === 'Pending'
                              ? 'Pending'
                              : 'Processing'
                        : 'Ready to ship'}
                  </span>
                  {isRejected && (
                      <span className="ml-2 inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium leading-normal text-rose-700">
                      Rejected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openRejectModal}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    Reject order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStage('processing');
                      setUiNotice(`Order #${orderId} marked as accepted.`);
                    }}
                      className="px-4 py-2 text-sm font-medium leading-normal text-white shadow-sm transition-colors bg-[#2563eb] rounded-lg hover:bg-blue-700"
                  >
                    Accept order
                  </button>
                </div>
              </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium leading-normal text-slate-500">
                  {demoListRow ? (
                    <span className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 whitespace-pre-line">
                      {demoListRow.dates}
                    </span>
                  ) : (
                    <>
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                        Request on: Jun 21, 2024 - 12:56
                      </span>
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                        Placed on: Jun 21, 2024 - 12:56
                      </span>
                    </>
                  )}
              </div>
            </section>

              <section className="grid gap-6 lg:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold leading-normal text-[#0e1e3f]">
                      {demoListRow ? 'Corporate / customer details' : 'Customer details'}
                    </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/communication')}
                      className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium leading-normal text-[#2563eb] transition-colors hover:bg-blue-50"
                  >
                    Chat now
                  </button>
                </div>
                  <dl className="space-y-2 text-sm leading-normal">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="font-medium text-slate-900">
                        {demoListRow?.customerName ?? 'Prashik Krishna'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Email Id</dt>
                      <dd className="font-medium text-slate-900">prashik@gmail.com</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="font-medium text-slate-900">+91 9876543210</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">PO</dt>
                      <dd className="font-medium text-slate-900">98765432101231</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment Terms</dt>
                      <dd className="font-medium text-slate-900">Net 30</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Delivery Method</dt>
                      <dd className="font-medium text-slate-900">Net 30</dd>
                    </div>
                </dl>
              </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-lg font-bold leading-normal text-[#0e1e3f]">Shipping address</h2>
                  <p className="text-sm leading-normal text-slate-600">
                    1st Floor, Kovil Villa, 2nd Rd, Rajiv Gandhi, Mambalam, Chennai, Tamil Nadu 600017
                  </p>
                  <h3 className="mb-2 mt-4 text-base font-bold leading-normal text-[#0e1e3f]">Billing address</h3>
                  <p className="text-sm leading-normal text-slate-600">
                    Area: Wadi, Ankur Marg, N Q Road, Chiklodar East, Mumbai, Maharashtra 400075
                  </p>
              </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-lg font-bold leading-normal text-[#0e1e3f]">Payment details</h2>
                  <dl className="space-y-2 text-sm leading-normal">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment ID</dt>
                      <dd className="font-medium text-slate-900">9932407884</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment Type</dt>
                      <dd className="font-medium text-slate-900">With Purchase Order (PO)</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Total</dt>
                      <dd className="font-semibold text-[#0e1e3f]">
                        {demoListRow ? demoListRow.price : `₹ ${total}`}
                      </dd>
                    </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-normal ${
                            demoListRow
                              ? demoListRow.paymentStatus === 'Paid'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : demoListRow.paymentStatus === 'Cancel'
                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                  : demoListRow.paymentStatus === 'Pending'
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-slate-200 bg-slate-100 text-slate-600'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {demoListRow ? demoListRow.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                      <button
                        type="button"
                        onClick={openUpdateStatusModal}
                          className="text-xs font-medium leading-normal text-[#2563eb] hover:underline"
                      >
                        Edit
                      </button>
                    </dd>
                  </div>
                </dl>
              </article>
            </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold leading-normal text-[#0e1e3f]">Order status</h2>
                  <button
                    type="button"
                    onClick={openUpdateStatusModal}
                      className="text-xs font-medium leading-normal text-[#2563eb] hover:underline"
                  >
                    Update
                  </button>
                </div>
                <button
                  type="button"
                  onClick={openUpdateStatusModal}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-normal text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Edit status
                </button>
              </div>

              {isRejected ? (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-normal text-rose-700">
                  This order has been rejected. Reason: {rejectReason}
                </div>
              ) : (
                  <div className="mt-6">
                    <div className="relative mb-6 h-1 rounded-full bg-slate-200">
                    <div
                        className="h-1 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${((stageIndex + 1) / stageOrder.length) * 100}%` }}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    {stageOrder.map((stage, idx) => {
                      const active = idx <= stageIndex;
                      return (
                        <div key={stage} className="text-center">
                            <div
                              className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium leading-normal ${
                                active
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-300 bg-white text-slate-400'
                              }`}
                            >
                            {idx + 1}
                            </div>
                            <p className="text-xs leading-normal text-slate-600">{stageLabels[stage]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <label className="mb-2 block text-sm font-medium leading-normal text-slate-700">
                    Assign delivery partner
                  </label>
                <select
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-normal text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select delivery partner</option>
                  <option value="fasttrack">FastTrack Logistics</option>
                  <option value="bluedart">Blue Dart</option>
                  <option value="delhivery">Delhivery</option>
                </select>
              </div>
            </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold leading-normal text-[#0e1e3f]">Products</h2>
              <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase leading-normal tracking-wider text-slate-500">
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Product ID</th>
                        <th className="px-6 py-4">Color</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Qty</th>
                        <th className="px-6 py-4">Unit price</th>
                        <th className="px-6 py-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm leading-normal text-slate-700">
                      {demoListRow ? (
                        <tr className="transition-colors hover:bg-slate-50/80">
                          <td className="px-6 py-4 font-medium text-slate-900">{demoListRow.productService}</td>
                          <td className="px-6 py-4">—</td>
                          <td className="px-6 py-4">—</td>
                          <td className="px-6 py-4">—</td>
                          <td className="px-6 py-4">{demoListRow.qty}</td>
                          <td className="px-6 py-4">{demoListRow.price}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{demoListRow.price}</td>
                        </tr>
                      ) : (
                        lineItems.map((item) => (
                          <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                            <td className="px-6 py-4 font-medium text-slate-900">{item.item}</td>
                            <td className="px-6 py-4">{item.id}</td>
                            <td className="px-6 py-4">{item.color}</td>
                            <td className="px-6 py-4">{item.size}</td>
                            <td className="px-6 py-4">{item.quantity}</td>
                            <td className="px-6 py-4">₹ {item.unitPrice}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">₹ {item.unitPrice * item.quantity}</td>
                          </tr>
                        ))
                      )}
                  </tbody>
                </table>
              </div>
                <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm leading-normal">
                  {demoListRow ? (
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base leading-normal">
                      <span className="font-semibold text-[#0e1e3f]">Total</span>
                      <span className="font-bold text-[#0e1e3f]">{demoListRow.price}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sub total</span>
                        <span className="font-medium text-slate-900">₹ {subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shipping fee</span>
                        <span className="font-medium text-slate-900">₹ {shippingFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tax amount</span>
                        <span className="font-medium text-slate-900">
                          {subtotal > 0 ? `${Math.round((taxAmount / subtotal) * 100)}%` : '—'}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base leading-normal">
                        <span className="font-semibold text-[#0e1e3f]">Total</span>
                        <span className="font-bold text-[#0e1e3f]">₹ {total}</span>
                      </div>
                    </>
                  )}
              </div>
            </section>

              </>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/orders')}
                    className="mb-4 inline-flex items-center gap-2 text-sm font-medium leading-normal text-slate-600 transition-colors hover:text-[#2563eb]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Order#{orderId}
                  </button>
                  <h1 className="text-2xl font-bold leading-normal tracking-tight text-[#0e1e3f]">
                    Request ID: {orderId}
                  </h1>
                  <p className="mt-3 text-sm leading-normal text-slate-600">
                    Status, confirm / reject / cancel, payouts, and messaging for this request are handled in the
                    corporate enquiry card above.
                  </p>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold leading-normal text-[#0e1e3f]">Order history</h2>
                <button
                  type="button"
                  onClick={() => setUiNotice('Add history entry will be available with timeline editing support.')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Clock3 className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase leading-normal tracking-wider text-slate-500">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Updated by</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Image</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm leading-normal text-slate-700">
                      {displayHistoryRows.map((row) => (
                        <tr key={`${row.date}-${row.time}-${row.description}`} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-6 py-4">{row.date}</td>
                          <td className="px-6 py-4">{row.time}</td>
                          <td className="px-6 py-4">{row.updatedBy}</td>
                          <td className="px-6 py-4">{row.description}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-200">
                              <Truck className="h-3.5 w-3.5 text-slate-600" />
                            </span>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

              {!corpEnquiry ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-lg font-bold leading-normal text-[#0e1e3f]">Message thread</h2>
                  <ul className="space-y-3 text-sm leading-normal text-slate-700">
                    <li className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                      <span className="text-xs font-medium text-slate-500">System</span>
                      <p className="mt-1">
                        Order <span className="font-mono">{orderId}</span> is open — use Chat now or vendor messages for
                        live discussion.
                      </p>
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/vendor/communication', {
                        state: { source: 'vendor-order-details-messages', orderId },
                      })
                    }
                    className="mt-4 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium leading-normal text-[#2563eb] transition-colors hover:bg-blue-50"
                  >
                    Open vendor messages
                  </button>
                </section>
              ) : null}
                </>
              )}
          </div>
        </main>
      </VendorAppShell>

      {showUpdateStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold leading-normal text-slate-900">Update Order status</h3>
              <button
                type="button"
                onClick={() => setShowUpdateStatusModal(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-sm leading-normal text-slate-500">Jun 21, 2024</p>
                  <p className="mt-1 text-base font-medium leading-normal text-slate-600">Order receive</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm leading-normal text-blue-600">Jun 21, 2024</p>
                  <p className="mt-1 text-base font-medium leading-normal text-blue-600">Order processing</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium leading-normal text-slate-700">Status</label>
                <select
                  value={updateStatusDraft}
                  onChange={(e) => setUpdateStatusDraft(e.target.value as OrderStage)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-normal text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  {dropdownStatusOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stageLabels[stage]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium leading-normal text-slate-700">Description</label>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2.5 text-slate-500">
                    <button
                      type="button"
                      onClick={() => setUiNotice('Rich text formatting will be available in a future release.')}
                    >
                      <Bold className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Rich text formatting will be available in a future release.')}
                    >
                      <Italic className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('Link support will be available in a future release.')}>
                      <Link2 className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('List formatting will be available in a future release.')}>
                      <List className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setUiNotice('Ordered list formatting will be available in a future release.')}
                    >
                      <ListOrdered className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('Attachment support will be available in a future release.')}>
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Add description"
                    rows={3}
                    className="w-full resize-none px-4 py-3 text-sm leading-normal text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <label className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 px-6 py-8 text-center transition-colors hover:border-slate-400">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setUpdateImageName(e.target.files?.[0]?.name ?? '')}
                />
                <div className="flex flex-col items-center justify-center gap-3 text-slate-500 sm:flex-row sm:gap-4">
                  <ImagePlus className="h-8 w-8 shrink-0" />
                  <p className="text-sm leading-normal">
                    <span className="font-medium text-[#2563eb] underline">Click to add image</span> or
                    <br className="sm:hidden" />
                    <span className="sm:ml-1">drag and drop file here</span>
                  </p>
                </div>
                {updateImageName && <p className="mt-3 text-sm leading-normal text-slate-600">Selected: {updateImageName}</p>}
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowUpdateStatusModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyStatusUpdate}
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium leading-normal text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold leading-normal text-slate-900">Reject order: reason</h3>
              <button
                type="button"
                onClick={() => setShowRejectReasonModal(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-sm leading-normal text-slate-600">
              Please share why this order is being rejected. This note will be recorded in order history.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Type rejection reason..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {rejectReasonError && <p className="mt-2 text-sm leading-normal text-rose-600">{rejectReasonError}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectReasonModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={continueRejectFlow}
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium leading-normal text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold leading-normal text-slate-900">Confirm rejection</h3>
              <button
                type="button"
                onClick={() => setShowRejectConfirmModal(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-normal text-slate-600">
              You are about to reject order <span className="font-semibold text-slate-900">#{orderId}</span>. This action
              cannot be undone from this screen.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-normal text-slate-700">
              <span className="font-medium text-slate-900">Reason:</span> {rejectReason}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectConfirmModal(false);
                  setShowRejectReasonModal(true);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium leading-normal text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
