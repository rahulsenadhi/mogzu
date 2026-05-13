import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Headphones,
  HelpCircle,
  MessageSquare,
  Package,
  Paperclip,
  Search,
  Send,
  Shirt,
  ShoppingBag,
  Smile,
  Store,
  Users,
  X,
} from 'lucide-react';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgProductThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import quoteSentPreviewImg from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';

type StatusTag = { label: string; className: string };

/** Corporate buyers vs Mogzu platform vs your internal store team */
export type VendorCommScope = 'client' | 'mogzu' | 'team';

type ChatThread = {
  id: string;
  scope: VendorCommScope;
  contactName: string;
  company: string;
  status: StatusTag | null;
  lastMessage: string;
  timestamp: string;
  productLabel?: string;
  memberSince: string;
  location: string;
};

type MsgBase = { id: string; time: string };
type TextMsg = MsgBase & { kind: 'text'; sender: 'corporate' | 'vendor'; text: string };
type ProductMsg = MsgBase & {
  kind: 'product';
  sender: 'vendor';
  title: string;
  description: string;
  url: string;
  image: string;
};
type QuoteMsg = MsgBase & {
  kind: 'quote';
  sender: 'vendor';
  quotationId: string;
};
type ChatMessage = TextMsg | ProductMsg | QuoteMsg;

type PickerProduct = {
  id: string;
  name: string;
  brand: string;
  priceLabel: string;
  minQty: string;
  image: string;
  rating: string;
};

const initialThreads: ChatThread[] = [
  {
    id: 't1',
    scope: 'client',
    contactName: 'Abhishek Tripathi',
    company: 'Mumbai moving co.',
    status: { label: 'Deal done', className: 'bg-emerald-100 text-emerald-800' },
    lastMessage: 'We need custom printing on 75 T-shirts for our team event.',
    timestamp: '2:14 PM',
    productLabel: 'Printed Round Neck Cotton Blend Black T-Shirt',
    memberSince: 'Last month',
    location: 'Andheri East, Mumbai',
  },
  {
    id: 't2',
    scope: 'client',
    contactName: 'Priya Sharma',
    company: 'Mindwave Labs',
    status: { label: 'Quotation sent', className: 'bg-amber-100 text-amber-800' },
    lastMessage: 'Please confirm MOQ for the premium welcome kits.',
    timestamp: 'Yesterday',
    productLabel: 'Executive welcome kit — premium',
    memberSince: '3 months ago',
    location: 'Whitefield, Bengaluru',
  },
  {
    id: 't3',
    scope: 'client',
    contactName: 'Rahul Jain',
    company: 'Finbridge Tech',
    status: null,
    lastMessage: 'Can we schedule a call to discuss branding options?',
    timestamp: 'Mon',
    memberSince: '2 weeks ago',
    location: 'Gurugram, Haryana',
  },
  {
    id: 'mz-1',
    scope: 'mogzu',
    contactName: 'Mogzu Support',
    company: 'Platform · payouts & policy',
    status: { label: 'In progress', className: 'bg-sky-100 text-sky-800' },
    lastMessage: 'Your last payout is scheduled for Friday; let us know if bank details changed.',
    timestamp: 'Today',
    memberSince: 'Since signup',
    location: 'Mogzu HQ',
  },
  {
    id: 'mz-2',
    scope: 'mogzu',
    contactName: 'Vendor success',
    company: 'Mogzu · listings & compliance',
    status: { label: 'Action needed', className: 'bg-amber-100 text-amber-900' },
    lastMessage: 'Please upload the updated GST certificate to keep your store verified.',
    timestamp: 'Yesterday',
    memberSince: 'Since signup',
    location: 'Mogzu HQ',
  },
  {
    id: 'vt-1',
    scope: 'team',
    contactName: 'Store owner',
    company: 'Internal · BK group',
    status: null,
    lastMessage: 'Can you approve the rush order on the conference kits?',
    timestamp: '11:02 AM',
    memberSince: 'Team',
    location: 'Internal',
  },
  {
    id: 'vt-2',
    scope: 'team',
    contactName: 'Operations lead',
    company: 'Internal · BK group',
    status: null,
    lastMessage: 'Shipment for Acme Corp goes out tomorrow — flag if anything slips.',
    timestamp: 'Yesterday',
    memberSince: 'Team',
    location: 'Internal',
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  t1: [
    {
      id: 'm1',
      kind: 'text',
      sender: 'corporate',
      text: 'Hi, we need custom printing on 75 T-shirts for our team event. What timelines can you commit to?',
      time: '2:05 PM',
    },
    {
      id: 'm2',
      kind: 'product',
      sender: 'vendor',
      title: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
      description: 'Black · Puma · Corporate bulk pricing available',
      url: 'https://mogzu.example/p/puma-cotton-tee',
      image: imgProductThumb,
      time: '2:10 PM',
    },
  ],
  t2: [
    {
      id: 'm3',
      kind: 'text',
      sender: 'corporate',
      text: 'Please confirm MOQ for the premium welcome kits.',
      time: 'Yesterday',
    },
  ],
  t3: [
    {
      id: 'm4',
      kind: 'text',
      sender: 'corporate',
      text: 'Can we schedule a call to discuss branding options?',
      time: 'Mon',
    },
  ],
  'mz-1': [
    {
      id: 'mz1-a',
      kind: 'text',
      sender: 'corporate',
      text: 'Hi — confirming your last payout is scheduled for this Friday. Reply if your bank account or UPI details have changed.',
      time: '9:41 AM',
    },
    {
      id: 'mz1-b',
      kind: 'text',
      sender: 'vendor',
      text: 'Thanks — same account as on file. Appreciate the heads-up.',
      time: '10:05 AM',
    },
  ],
  'mz-2': [
    {
      id: 'mz2-a',
      kind: 'text',
      sender: 'corporate',
      text: 'We need an updated GST certificate on file to keep your verified badge. You can upload it under Settings → Documents.',
      time: 'Yesterday',
    },
  ],
  'vt-1': [
    {
      id: 'vt1-a',
      kind: 'text',
      sender: 'corporate',
      text: 'Can you approve the rush order on the conference kits? Client needs dispatch by Thursday.',
      time: '10:58 AM',
    },
    {
      id: 'vt1-b',
      kind: 'text',
      sender: 'vendor',
      text: 'Approved — I’ll ask fulfillment to prioritise. Will update the thread once packed.',
      time: '11:02 AM',
    },
  ],
  'vt-2': [
    {
      id: 'vt2-a',
      kind: 'text',
      sender: 'vendor',
      text: 'Shipment for Acme Corp goes out tomorrow morning. Ping me if you see any stock issues on the premium kits.',
      time: 'Yesterday',
    },
    {
      id: 'vt2-b',
      kind: 'text',
      sender: 'corporate',
      text: 'All good on stock — I’ll double-check labels tonight.',
      time: 'Yesterday',
    },
  ],
};

const labelOptions: Array<{ id: string; label: string; className: string }> = [
  { id: 'deal-done', label: 'Deal done', className: 'bg-emerald-100 text-emerald-800' },
  { id: 'negotiation', label: 'Negotiation', className: 'bg-sky-100 text-sky-800' },
  { id: 'quotation-sent-1', label: 'Quotation sent', className: 'bg-amber-100 text-amber-800' },
  { id: 'contacted', label: 'Contacted', className: 'bg-cyan-100 text-cyan-800' },
  { id: 'follow-up', label: 'Follow up', className: 'bg-orange-100 text-orange-800' },
  { id: 'important', label: 'Important', className: 'bg-blue-100 text-blue-800' },
  { id: 'irrelevant', label: 'Irrelevant', className: 'bg-rose-100 text-rose-800' },
  { id: 'quotation-sent-2', label: 'Quotation sent', className: 'bg-emerald-100 text-emerald-800' },
];

const quoteVariantOptions = ['Black', 'White', 'Navy'];
const quoteSizeOptions = ['Small', 'Medium', 'Large'];

const pickerProducts: PickerProduct[] = [
  {
    id: 'p1',
    name: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
    brand: 'Puma',
    priceLabel: 'Starting at ₹400/each',
    minQty: '28',
    image: imgProductThumb,
    rating: '4.5',
  },
  {
    id: 'p2',
    name: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
    brand: 'Puma',
    priceLabel: 'Starting at ₹400/each',
    minQty: '28',
    image: imgProductThumb,
    rating: '4.5',
  },
  {
    id: 'p3',
    name: "Women's Cotton Stretch Half Sleeve Round Neck Regular Fit",
    brand: 'Puma',
    priceLabel: 'Starting at ₹400/each',
    minQty: '28',
    image: imgProductThumb,
    rating: '4.5',
  },
];

const quickRepliesByScope: Record<VendorCommScope, string[]> = {
  client: ['Qty & order value?', 'What is the Quantity?', 'Ask for review'],
  mogzu: ['Payout status?', 'Escalate to finance', 'Document uploaded'],
  team: ['Handoff to ops', 'Update on shipment', 'Can someone cover chat?'],
};

const scopeTabs: Array<{
  id: VendorCommScope;
  label: string;
  hint: string;
  Icon: LucideIcon;
}> = [
  { id: 'client', label: 'Clients', hint: 'Corporate buyers', Icon: Building2 },
  { id: 'mogzu', label: 'Mogzu', hint: 'Platform & support', Icon: Headphones },
  { id: 'team', label: 'Team', hint: 'Your store', Icon: Users },
];

const apparelSubs = [
  'T-Shirts',
  'Hoodies & Pullovers',
  'Outerwear & Fleece',
  'Pants',
  'Sweaters & Blazers',
  'Dress and Work Shirts',
  'Accessories',
];

export default function VendorCommunicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [headerSearch, setHeaderSearch] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [commScope, setCommScope] = useState<VendorCommScope>('client');
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [listSearch, setListSearch] = useState('');
  const [activeThreadId, setActiveThreadId] = useState('t1');
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>(initialMessages);
  const [composer, setComposer] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set(['p1']));
  const [pickerCategory, setPickerCategory] = useState('Apparel');

  const [applyLabelModalOpen, setApplyLabelModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [labelSelections, setLabelSelections] = useState<Set<string>>(new Set());
  const [labelsQuery, setLabelsQuery] = useState('');
  const [appliedLabelsByThread, setAppliedLabelsByThread] = useState<Record<string, string[]>>({});

  const [createQuoteModalOpen, setCreateQuoteModalOpen] = useState(false);
  const [quoteSentModalOpen, setQuoteSentModalOpen] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  const [quoteLines, setQuoteLines] = useState<
    Array<{ productId: string; variant: string; size: string; qty: number }>
  >([]);
  const [quoteProcessingFee, setQuoteProcessingFee] = useState(1000);
  const [quoteDiscount, setQuoteDiscount] = useState(0);

  useEffect(() => {
    const state = location.state as { channel?: string } | null;
    if (state?.channel !== 'notifications') return;
    const notifThread = initialThreads.find((t) => t.scope === 'mogzu');
    setCommScope('mogzu');
    setListSearch('');
    if (notifThread) setActiveThreadId(notifThread.id);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = messagesByThread[activeThreadId] || [];
  const activeAppliedLabelIds = appliedLabelsByThread[activeThreadId] ?? [];
  const isClientThread = activeThread?.scope === 'client';

  const quickReplies = useMemo(() => quickRepliesByScope[commScope], [commScope]);

  const bumpThreadPreview = useCallback((threadId: string, lastMessage: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, lastMessage, timestamp: 'Just now' } : t)),
    );
  }, []);

  const selectScope = useCallback(
    (s: VendorCommScope) => {
      setCommScope(s);
      setListSearch('');
      const first = threads.find((t) => t.scope === s);
      if (first) setActiveThreadId(first.id);
    },
    [threads],
  );

  const filteredThreads = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return threads
      .filter((t) => t.scope === commScope)
      .filter(
        (t) =>
          !q ||
          t.contactName.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          (t.productLabel && t.productLabel.toLowerCase().includes(q)),
      );
  }, [threads, listSearch, commScope]);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shareSelectedProducts = () => {
    const selected = pickerProducts.filter((p) => selectedProductIds.has(p.id));
    if (!selected.length) {
      setProductModalOpen(false);
      return;
    }
    const newMsgs: ChatMessage[] = selected.map((p, i) => ({
      id: `share-${Date.now()}-${i}`,
      kind: 'product' as const,
      sender: 'vendor' as const,
      title: p.name,
      description: `${p.brand} · ${p.priceLabel} · Min Qty: ${p.minQty}`,
      url: `https://mogzu.example/p/${p.id}`,
      image: p.image,
      time: 'Just now',
    }));
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), ...newMsgs],
    }));
    bumpThreadPreview(
      activeThreadId,
      newMsgs.length > 1 ? `Shared ${newMsgs.length} products` : 'Shared a product',
    );
    setProductModalOpen(false);
  };

  const parseUnitPrice = (priceLabel: string) => {
    const match = priceLabel.match(/₹\s*([\d,]+)/);
    if (!match) return 400;
    return Number(match[1].replace(/,/g, ''));
  };

  const sendText = () => {
    const t = composer.trim();
    if (!t) return;
    const msg: TextMsg = {
      id: `tx-${Date.now()}`,
      kind: 'text',
      sender: 'vendor',
      text: t,
      time: 'Just now',
    };
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), msg],
    }));
    bumpThreadPreview(activeThreadId, t);
    setComposer('');
  };

  const openCreateQuote = () => {
    const productMsgs = messages.filter((m) => m.kind === 'product' && m.sender === 'vendor');
    const lines =
      productMsgs.length > 0
        ? productMsgs
            .map((m) => {
              if (m.kind !== 'product') return null;
              const match = m.url.match(/\/p\/([^/?#]+)/);
              const productId = match?.[1];
              if (!productId) return null;
              return {
                productId,
                variant: 'Black',
                size: 'Medium',
                qty: 28,
              };
            })
            .filter(Boolean)
        : [];
    setQuoteLines(lines);
    setQuoteProcessingFee(1000);
    setQuoteDiscount(0);
    setQuoteId(`Q-${Math.floor(100000 + Math.random() * 900000)}`);
    setCreateQuoteModalOpen(true);
  };

  const createQuoteTotals = useMemo(() => {
    const subTotal = quoteLines.reduce((sum, l) => {
      const p = pickerProducts.find((x) => x.id === l.productId);
      if (!p) return sum;
      return sum + l.qty * parseUnitPrice(p.priceLabel);
    }, 0);
    const discountAmount = Math.max(0, quoteDiscount);
    const total = subTotal + quoteProcessingFee - discountAmount;
    return { subTotal, discountAmount, total };
  }, [quoteLines, quoteProcessingFee, quoteDiscount]);

  const sendQuote = () => {
    const id = quoteId || `Q-${Math.floor(100000 + Math.random() * 900000)}`;

    const msg: QuoteMsg = {
      id: `quote-${Date.now()}`,
      kind: 'quote',
      sender: 'vendor',
      quotationId: id,
      time: 'Just now',
    };

    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), msg],
    }));
    bumpThreadPreview(activeThreadId, `Quotation ${id}`);

    setQuoteId(id);
    setCreateQuoteModalOpen(false);
    setQuoteSentModalOpen(true);
  };

  return (
    <>
      <VendorAppShell
        activeNav="communication"
        routeSource="vendor-communication"
        useScrollSurface={false}
        onNavNotice={(msg) => setUiNotice(msg)}
        headerSearch={
          <>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </>
        }
        headerEnd={
          <>
            <button
              type="button"
              onClick={() => setUiNotice('Help docs will be available in a future release.')}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Open communication and notifications"
              onClick={() =>
                navigate('/vendor/communication', {
                  state: { source: 'vendor-communication-header', channel: 'notifications' },
                })
              }
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                12
              </span>
            </button>
            <VendorTopRightMenu />
          </>
        }
      >
        <>
          {uiNotice ? (
            <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700 sm:px-5">
              {uiNotice}
            </div>
          ) : null}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FFFDF9] text-slate-900 lg:flex-row">
            {/* Middle: lists */}
            <section className="flex w-full shrink-0 flex-col border-slate-200 bg-white lg:w-[340px] lg:border-r xl:w-[380px]">
              <div className="border-b border-slate-100 px-3 pt-3">
                <h2 className="pb-2 text-[13px] font-semibold text-slate-800">Conversations</h2>
                <div className="pb-2" role="tablist" aria-label="Who you are messaging">
                  <div className="flex gap-1 rounded-lg border border-slate-100 bg-slate-50 p-1">
                    {scopeTabs.map(({ id, label, hint, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={commScope === id}
                        title={hint}
                        onClick={() => selectScope(id)}
                        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md px-1.5 py-2 text-center transition ${
                          commScope === id
                            ? 'bg-white text-[#2563EB] shadow-sm ring-1 ring-slate-200/80'
                            : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="text-[10px] font-semibold leading-tight sm:text-[11px]">{label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] leading-snug text-slate-400">
                    {commScope === 'client' && 'Corporate buyers: orders, quotes, and products.'}
                    {commScope === 'mogzu' && 'Mogzu: payouts, verification, policy, and platform help.'}
                    {commScope === 'team' && 'Internal: coordinate with your store team outside client threads.'}
                  </p>
                </div>
                <div className="flex gap-2 pb-3">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder="Search…"
                      className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setUiNotice('Thread sorting options will be available once advanced filters are enabled.')}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Sort by <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredThreads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCommScope(t.scope);
                      setActiveThreadId(t.id);
                    }}
                    className={`flex w-full gap-3 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 ${
                      activeThreadId === t.id ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <img src={imgAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{t.contactName}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{t.timestamp}</span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{t.company}</p>
                      {t.status && (
                        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${t.status.className}`}>
                          {t.status.label}
                        </span>
                      )}
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{t.lastMessage}</p>
                      {t.productLabel && (
                        <span className="mt-1 inline-block max-w-full truncate rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                          {t.productLabel}
                        </span>
                      )}
                      {(appliedLabelsByThread[t.id] ?? []).slice(0, 2).map((labelId) => {
                        const l = labelOptions.find((x) => x.id === labelId);
                        if (!l) return null;
                        return (
                          <span
                            key={labelId}
                            className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${l.className}`}
                          >
                            {l.label}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Chat pane */}
            <section className="flex min-h-[420px] min-w-0 flex-1 flex-col bg-[#F4F6FB]">
              {activeThread ? (
                <>
                  <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <img src={imgAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-slate-900">{activeThread.contactName}</h2>
                            {activeThread.status && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${activeThread.status.className}`}
                              >
                                {activeThread.status.label}
                              </span>
                            )}
                            {(activeAppliedLabelIds ?? []).slice(0, 2).map((labelId) => {
                              const l = labelOptions.find((x) => x.id === labelId);
                              if (!l) return null;
                              return (
                                <span
                                  key={labelId}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${l.className}`}
                                >
                                  {l.label}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-sm text-slate-500">{activeThread.company}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            Member since: {activeThread.memberSince} · {activeThread.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAddNoteModalOpen(true)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Add notes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLabelSelections(new Set(appliedLabelsByThread[activeThreadId] ?? []));
                            setLabelsQuery('');
                            setApplyLabelModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Apply label
                        </button>
                        {isClientThread ? (
                          <button type="button" onClick={openCreateQuote} className="text-xs font-medium text-[#2563EB] hover:underline">
                            View details
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setUiNotice(
                                activeThread?.scope === 'mogzu'
                                  ? 'Ticket history and attachments will link here once helpdesk wiring is enabled.'
                                  : 'Team thread details stay internal; client-facing activity lives under Clients.',
                              )
                            }
                            className="text-xs font-medium text-slate-500 hover:text-[#2563EB] hover:underline"
                          >
                            Thread info
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                    {messages.map((m) => {
                      if (m.kind === 'text') {
                        return (
                          <div
                            key={m.id}
                            className={`flex ${m.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                m.sender === 'vendor'
                                  ? 'rounded-br-md bg-[#2563EB] text-white'
                                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'
                              }`}
                            >
                              <p>{m.text}</p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  m.sender === 'vendor' ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {m.time}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      if (m.kind === 'product') {
                        return (
                          <div key={m.id} className="flex justify-end">
                            <div className="max-w-[90%] overflow-hidden rounded-2xl rounded-br-md border border-slate-200 bg-white shadow-sm sm:max-w-md">
                              <div className="flex gap-3 p-3">
                                <img
                                  src={m.image}
                                  alt=""
                                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                                  <p className="mt-1 text-xs text-slate-500">{m.description}</p>
                                  <a
                                    href={m.url}
                                    className="mt-2 inline-block truncate text-xs font-medium text-[#2563EB] hover:underline"
                                  >
                                    {m.url}
                                  </a>
                                </div>
                              </div>
                              <p className="border-t border-slate-100 px-3 py-1.5 text-right text-[10px] text-slate-400">
                                {m.time}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className="flex justify-end">
                          <div className="max-w-[90%] overflow-hidden rounded-2xl rounded-br-md border border-blue-200 bg-white shadow-sm sm:max-w-md">
                            <div className="flex flex-col gap-3 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  Quotation {m.quotationId}
                                </p>
                                <span className="shrink-0 rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                                  Quote
                                </span>
                              </div>

                              <div className="overflow-hidden rounded-lg bg-[#2563EB]/5">
                                <img
                                  src={quoteSentPreviewImg}
                                  alt="Quotation preview"
                                  className="h-36 w-full object-cover"
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setUiNotice(`Opening quotation ${m.quotationId}.`)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUiNotice(`Quotation ${m.quotationId} saved.`)}
                                  className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                  Save as
                                </button>
                              </div>
                            </div>
                            <p className="border-t border-slate-100 px-3 py-1.5 text-right text-[10px] text-slate-400">
                              {m.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {quickReplies.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setComposer((prev) => (prev ? `${prev} ${q}` : q))}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-[#2563EB]/40 hover:bg-blue-50/50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setUiNotice('Notes and templates panel will be available in a future release.')}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        title="Notes / templates"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                      {isClientThread ? (
                        <button
                          type="button"
                          onClick={() => setProductModalOpen(true)}
                          className="rounded-lg p-2 text-[#2563EB] hover:bg-blue-50"
                          title="Share products"
                        >
                          <Package className="h-5 w-5" />
                        </button>
                      ) : null}
                      <div className="relative min-w-0 flex-1">
                        <input
                          value={composer}
                          onChange={(e) => setComposer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendText())}
                          placeholder={
                            activeThread?.scope === 'mogzu'
                              ? 'Message Mogzu…'
                              : activeThread?.scope === 'team'
                                ? 'Message your team…'
                                : 'Type a message…'
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-20 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                        />
                        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-0.5">
                          <button
                            type="button"
                            onClick={() => setUiNotice('Emoji picker will be available in a future release.')}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-200/60"
                          >
                            <Smile className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUiNotice('File attachments will be available in a future release.')}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-200/60"
                          >
                            <Paperclip className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={sendText}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500">
                  <MessageSquare className="mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">Select a conversation</p>
                  <p className="mt-1 max-w-sm text-xs">Choose a thread from the list to read and reply to messages.</p>
                </div>
              )}
            </section>
          </div>
        </>
      </VendorAppShell>

      {/* Apply Label modal */}
      {applyLabelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Apply Label</h3>
              <button
                type="button"
                onClick={() => setApplyLabelModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={labelsQuery}
                    onChange={(e) => setLabelsQuery(e.target.value)}
                    placeholder="Search labels"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLabelsQuery('')}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {labelOptions
                  .filter((l) => !labelsQuery.trim() || l.label.toLowerCase().includes(labelsQuery.trim().toLowerCase()))
                  .map((l) => {
                    const checked = labelSelections.has(l.id);
                    return (
                      <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setLabelSelections((prev) => {
                              const next = new Set(prev);
                              if (next.has(l.id)) next.delete(l.id);
                              else next.add(l.id);
                              return next;
                            });
                          }}
                        />
                        <span className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium ${l.className}`}>
                          {l.label}
                        </span>
                      </label>
                    );
                  })}
              </div>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-[#2563EB] font-medium hover:underline"
                onClick={() => {
                  // UI-only: placeholder for adding a label
                  setLabelSelections(new Set(labelOptions.slice(0, 1).map((l) => l.id)));
                }}
              >
                + Add Label
              </button>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setApplyLabelModalOpen(false);
                  setLabelsQuery('');
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedLabelsByThread((prev) => ({
                    ...prev,
                    [activeThreadId]: Array.from(labelSelections),
                  }));
                  setApplyLabelModalOpen(false);
                  setLabelsQuery('');
                }}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes modal */}
      {addNoteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Add notes</h3>
              <button
                type="button"
                onClick={() => setAddNoteModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700">Note</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={6}
                placeholder="Write a note for this conversation"
                className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setAddNoteModalOpen(false);
                  setNoteText('');
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = noteText.trim();
                  if (!trimmed) return;

                  const msg: TextMsg = {
                    id: `note-${Date.now()}`,
                    kind: 'text',
                    sender: 'vendor',
                    text: `Note: ${trimmed}`,
                    time: 'Just now',
                  };

                  setMessagesByThread((prev) => ({
                    ...prev,
                    [activeThreadId]: [...(prev[activeThreadId] || []), msg],
                  }));
                  bumpThreadPreview(activeThreadId, trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed);

                  setAddNoteModalOpen(false);
                  setNoteText('');
                }}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create quote modal */}
      {createQuoteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Create Quotation</h3>
              <button
                type="button"
                onClick={() => setCreateQuoteModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {['Shop', 'Celebrations', 'Combo', 'E-gift'].map((pill) => (
                  <span
                    key={pill}
                    className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 ${
                      pill === 'Shop' ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    {pill}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        Shop &gt; Apparel &gt; T-Shirts
                      </div>
                      <div className="text-xs text-slate-500">
                        Sort by: <span className="font-medium text-slate-700">Price</span>
                      </div>
                    </div>
                    <div className="mt-3 relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder="Search product by ID, Name, Brand"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-4">
                    {quoteLines.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
                        <p className="text-sm font-medium text-slate-700">No products selected</p>
                        <p className="mt-1 text-xs text-slate-500">Go back and share products first.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quoteLines.map((l, idx) => {
                          const product = pickerProducts.find((p) => p.id === l.productId);
                          if (!product) return null;
                          const unitPrice = parseUnitPrice(product.priceLabel);
                          return (
                            <div key={`${l.productId}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
                              <div className="flex gap-4">
                                <img src={product.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">{product.brand}</p>
                                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-[11px] text-slate-500">Variant</label>
                                      <select
                                        value={l.variant}
                                        onChange={(e) =>
                                          setQuoteLines((prev) =>
                                            prev.map((x) => (x.productId === l.productId ? { ...x, variant: e.target.value } : x))
                                          )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                                      >
                                        {quoteVariantOptions.map((v) => (
                                          <option key={v} value={v}>
                                            {v}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[11px] text-slate-500">Size</label>
                                      <select
                                        value={l.size}
                                        onChange={(e) =>
                                          setQuoteLines((prev) =>
                                            prev.map((x) => (x.productId === l.productId ? { ...x, size: e.target.value } : x))
                                          )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                                      >
                                        {quoteSizeOptions.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="mb-1 block text-[11px] text-slate-500">Qty</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={l.qty}
                                        onChange={(e) => {
                                          const nextQty = Math.max(1, Number(e.target.value) || 1);
                                          setQuoteLines((prev) => prev.map((x) => (x.productId === l.productId ? { ...x, qty: nextQty } : x)));
                                        }}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs text-slate-500">Unit: ₹{unitPrice}</div>
                                    <div className="text-sm font-semibold text-slate-900">₹{unitPrice * l.qty}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Price</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Sub total</span>
                      <span className="font-semibold">₹{createQuoteTotals.subTotal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Processing fee</span>
                      <span className="font-semibold">₹{quoteProcessingFee}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-600">Discount</span>
                      <input
                        type="number"
                        min={0}
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(Math.max(0, Number(e.target.value) || 0))}
                        className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-right text-sm focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-slate-700 font-semibold">Total</span>
                      <span className="text-lg font-bold text-[#2563EB]">₹{createQuoteTotals.total}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={sendQuote}
                    disabled={quoteLines.length === 0}
                    className={`mt-5 w-full rounded-lg px-4 py-2 text-sm font-medium text-white ${
                      quoteLines.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'
                    }`}
                  >
                    SendQuote
                  </button>

                  <div className="mt-2 text-xs text-slate-500">
                    Tip: quote number will be generated after sending.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote sent modal */}
      {quoteSentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Quote sent</h3>
              <button
                type="button"
                onClick={() => {
                  setQuoteSentModalOpen(false);
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Quotation ID</p>
                <p className="mt-1 text-base font-bold text-slate-900">{quoteId || 'Q-000000'}</p>
                <div className="mt-3 h-44 w-full overflow-hidden rounded-lg bg-slate-50">
                  <img
                    src={quoteSentPreviewImg}
                    alt="Quotation preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuoteSentModalOpen(false);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteSentModalOpen(false);
                  }}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save as
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product picker — share add-on */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-slate-900">Product</h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-4 py-2">
              <button
                type="button"
                onClick={() => setUiNotice('Store selector will be available once multi-store support is enabled.')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Store className="h-4 w-4" />
                Shop
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-2">
              {(['Apparel', 'Bags', 'Stationary', 'Tech', 'Health & wellness'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPickerCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    pickerCategory === cat
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'Apparel' && <Shirt className="h-3.5 w-3.5" />}
                  {cat === 'Bags' && <ShoppingBag className="h-3.5 w-3.5" />}
                  {cat !== 'Apparel' && cat !== 'Bags' && <Package className="h-3.5 w-3.5" />}
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <aside className="hidden w-44 shrink-0 border-r border-slate-100 bg-slate-50/80 py-3 sm:block">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
                <ul className="space-y-0.5">
                  {apparelSubs.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => setUiNotice(`${s} subcategory selection will be available once nested filters are enabled.`)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-slate-600 hover:bg-white"
                      >
                        <span className="truncate">{s}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="min-w-0 flex-1 overflow-y-auto p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search"
                      className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setUiNotice('Product sorting options will be available once advanced filters are enabled.')}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Sort by: Featured <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pickerProducts
                    .filter((p) => {
                      const q = pickerSearch.trim().toLowerCase();
                      return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                    })
                    .map((p) => {
                      const sel = selectedProductIds.has(p.id);
                      return (
                        <div
                          key={p.id}
                          className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                            sel ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleProduct(p.id)}
                            className={`absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border ${
                              sel ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-slate-200 bg-white'
                            }`}
                          >
                            {sel && <Check className="h-3.5 w-3.5" />}
                          </button>
                          <div className="flex h-36 items-center justify-center bg-slate-50 p-4">
                            <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="p-3">
                            <p className="text-[11px] text-slate-400">{p.brand}</p>
                            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {p.rating} ★
                            </span>
                            <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-900">{p.name}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-800">{p.priceLabel}</p>
                            <p className="text-[11px] text-slate-500">Min Qty: {p.minQty}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Selected products</span>
                <div className="flex gap-1 overflow-x-auto">
                  {pickerProducts
                    .filter((p) => selectedProductIds.has(p.id))
                    .map((p, idx) => (
                      <div key={p.id} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-0.5 text-[9px] font-bold text-white">
                            {selectedProductIds.size}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-lg border border-[#2563EB] bg-white px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={shareSelectedProducts}
                  className="rounded-lg bg-[#2563EB] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
