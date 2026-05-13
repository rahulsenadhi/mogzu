import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  issueCategoryToProductLine,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';
import {
  Search,
  ArrowDownWideNarrow,
  Building2,
  Store,
  Paperclip,
  Smile,
  ClipboardList,
  Package,
} from 'lucide-react';
import {
  appendVendorSupportAdminReply,
  loadVendorSupportQueue,
  markVendorSupportTicketResolved,
  VENDOR_SUPPORT_QUEUE_STORAGE_KEY,
  type VendorSupportTicket,
} from '@/app/lib/vendorSupportQueueStorage';

export type IssueCategory = 'Gifting' | 'Event' | 'SpaceX';

type ChatMsg = { id: string; from: 'user' | 'admin'; text: string; time: string };

export type AdminIssue = {
  id: string;
  audience: 'client' | 'vendor';
  status: 'pending' | 'resolved';
  userName: string;
  userRoleLabel: 'Client' | 'Vendor';
  category: IssueCategory;
  snippet: string;
  enquiryDate: string;
  issueType: string;
  raisedOn: string;
  memberSince: string;
  address: string;
  threadMessage: string;
  threadTime: string;
  messages: ChatMsg[];
};

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function categoryPill(category: IssueCategory) {
  const map = {
    Gifting: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    Event: 'bg-red-50 text-red-700 border border-red-100',
    SpaceX: 'bg-orange-50 text-orange-800 border border-orange-100',
  } as const;
  return map[category];
}

const seedIssues = (): AdminIssue[] => [
  {
    id: '1',
    audience: 'client',
    status: 'pending',
    userName: 'Kapil Dev',
    userRoleLabel: 'Client',
    category: 'Gifting',
    snippet:
      'Campaign owners also have the ability to generate CSV files for reporting. We are unable to upload the latest inventory sheet.',
    enquiryDate: '18 Jun 2024',
    issueType: 'Uploading file',
    raisedOn: '18 Jun 2024',
    memberSince: 'Jan 2023',
    address: 'Smart works, BKC, Mumbai 400051',
    threadMessage:
      'Campaign owners also have the ability to generate CSV files for reporting. We are unable to upload the latest inventory sheet — the portal returns an error after 90% upload. Please advise.',
    threadTime: '18:10',
    messages: [
      {
        id: 'm1',
        from: 'user',
        text: 'Campaign owners also have the ability to generate CSV files for reporting. We are unable to upload the latest inventory sheet — the portal returns an error after 90% upload. Please advise.',
        time: '18:10',
      },
    ],
  },
  {
    id: '2',
    audience: 'client',
    status: 'pending',
    userName: 'Priya Sharma',
    userRoleLabel: 'Client',
    category: 'Event',
    snippet: 'Commission statement mismatch for February invoice batch — need reconciliation.',
    enquiryDate: '11 Mar 2025',
    issueType: 'Billing',
    raisedOn: '11 Mar 2025',
    memberSince: 'Aug 2022',
    address: 'Acme Corp, Andheri East, Mumbai',
    threadMessage: 'Commission statement mismatch for February invoice batch — need reconciliation.',
    threadTime: '14:22',
    messages: [
      {
        id: 'm2',
        from: 'user',
        text: 'Commission statement mismatch for February invoice batch — need reconciliation.',
        time: '14:22',
      },
    ],
  },
  {
    id: '3',
    audience: 'client',
    status: 'pending',
    userName: 'Rahul Verma',
    userRoleLabel: 'Client',
    category: 'SpaceX',
    snippet: 'Refund processed for cancelled booking REF-9921 — follow-up on timeline.',
    enquiryDate: '08 Mar 2025',
    issueType: 'Refund status',
    raisedOn: '08 Mar 2025',
    memberSince: 'Mar 2024',
    address: 'Globex India, Powai, Mumbai',
    threadMessage: 'Refund processed for cancelled booking REF-9921 — when will amount reflect in wallet?',
    threadTime: '09:05',
    messages: [
      {
        id: 'm3',
        from: 'user',
        text: 'Refund processed for cancelled booking REF-9921 — when will amount reflect in wallet?',
        time: '09:05',
      },
    ],
  },
  {
    id: '4',
    audience: 'vendor',
    status: 'pending',
    userName: 'Fresh Catering Co.',
    userRoleLabel: 'Vendor',
    category: 'Event',
    snippet: 'Payout for March events not received — UTR pending.',
    enquiryDate: '05 Mar 2025',
    issueType: 'Payout',
    raisedOn: '05 Mar 2025',
    memberSince: '2021',
    address: 'Lower Parel, Mumbai',
    threadMessage: 'Payout for March events not received — please share UTR.',
    threadTime: '11:30',
    messages: [
      { id: 'm4', from: 'user', text: 'Payout for March events not received — please share UTR.', time: '11:30' },
    ],
  },
  {
    id: '5',
    audience: 'vendor',
    status: 'resolved',
    userName: 'Urban Events',
    userRoleLabel: 'Vendor',
    category: 'Gifting',
    snippet: 'SKU mapping issue resolved — thank you.',
    enquiryDate: '01 Mar 2025',
    issueType: 'Catalog',
    raisedOn: '28 Feb 2025',
    memberSince: '2022',
    address: 'Thane, Maharashtra',
    threadMessage: 'SKU mapping issue on bulk upload — fixed on your end?',
    threadTime: '16:00',
    messages: [
      { id: 'm5', from: 'user', text: 'SKU mapping issue on bulk upload.', time: '16:00' },
      { id: 'm6', from: 'admin', text: 'Resolved — catalog sync completed.', time: '17:15' },
    ],
  },
];

function formatIssueDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatIssueTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ISSUE_CATEGORIES: IssueCategory[] = ['Gifting', 'Event', 'SpaceX'];

function vendorTicketToAdminIssue(t: VendorSupportTicket): AdminIssue {
  const snippet =
    t.subject.trim().length > 0
      ? t.subject.trim()
      : t.message.length > 120
        ? `${t.message.slice(0, 120)}…`
        : t.message;
  const enquiryDate = formatIssueDate(t.createdAt);
  const threadTime = formatIssueTime(t.createdAt);
  const cat = ISSUE_CATEGORIES.includes(t.category) ? t.category : 'Gifting';
  const body =
    t.subject.trim().length > 0 ? `${t.subject.trim()}\n\n${t.message}` : t.message;
  const threadMessages =
    t.messages && t.messages.length > 0
      ? t.messages.map((m) => ({
          id: m.id,
          from: m.from,
          text: m.text,
          time: m.time,
        }))
      : [{ id: `${t.id}-m0`, from: 'user' as const, text: body, time: threadTime }];
  return {
    id: t.id,
    audience: 'vendor',
    status: t.status === 'resolved' ? 'resolved' : 'pending',
    userName: t.businessName,
    userRoleLabel: 'Vendor',
    category: cat,
    snippet,
    enquiryDate,
    issueType: t.subject.trim() || 'Partner support',
    raisedOn: enquiryDate,
    memberSince: 'Partner',
    address: t.email,
    threadMessage: t.message,
    threadTime,
    messages: threadMessages,
  };
}

function mergeVendorSupportIntoIssues(prev: AdminIssue[]): AdminIssue[] {
  const withoutQueue = prev.filter((i) => !String(i.id).startsWith('vs-'));
  const vendorIssues = loadVendorSupportQueue().map(vendorTicketToAdminIssue);
  return [...vendorIssues, ...withoutQueue];
}

const TOTAL_ISSUES_SHOWN = 80;

export default function AdminIssuesPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<AdminIssue[]>(() => mergeVendorSupportIntoIssues(seedIssues()));
  const [productLine, setProductLine] = useState<AdminProductLine>('gifting');
  const [audience, setAudience] = useState<'client' | 'vendor'>('client');
  const [statusTab, setStatusTab] = useState<'pending' | 'resolved'>('pending');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [replyDraft, setReplyDraft] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [toolbarNotice, setToolbarNotice] = useState('');

  const filtered = useMemo(() => {
    let list = issues.filter(
      (i) =>
        issueCategoryToProductLine(i.category) === productLine &&
        i.audience === audience &&
        i.status === statusTab
    );
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.userName.toLowerCase().includes(q) ||
          i.snippet.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      // simple: by id for stability
      return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
  }, [issues, productLine, audience, statusTab, query, sortAsc]);

  const openCount = useMemo(
    () =>
      issues.filter(
        (i) =>
          issueCategoryToProductLine(i.category) === productLine &&
          i.audience === audience &&
          i.status === 'pending'
      ).length,
    [issues, productLine, audience]
  );

  const selected = useMemo(
    () => issues.find((i) => i.id === selectedId) ?? null,
    [issues, selectedId]
  );

  useEffect(() => {
    if (selectedId && !filtered.some((i) => i.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    const sync = () => setIssues((prev) => mergeVendorSupportIntoIssues(prev));
    const onStorage = (e: StorageEvent) => {
      if (e.key === VENDOR_SUPPORT_QUEUE_STORAGE_KEY) sync();
    };
    const onCustom = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    window.addEventListener('mogzu-vendor-support-queue-updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
      window.removeEventListener('mogzu-vendor-support-queue-updated', onCustom);
    };
  }, []);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleMarkResolved = () => {
    if (!selectedId) return;
    if (selectedId.startsWith('vs-')) {
      markVendorSupportTicketResolved(selectedId);
    } else {
      setIssues((prev) =>
        prev.map((i) => (i.id === selectedId ? { ...i, status: 'resolved' as const } : i))
      );
    }
    setReplyDraft('');
  };

  const handleReply = () => {
    const text = replyDraft.trim();
    if (!text || !selectedId) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (selectedId.startsWith('vs-')) {
      appendVendorSupportAdminReply(selectedId, text);
      setIssues((prev) => mergeVendorSupportIntoIssues(prev));
      setReplyDraft('');
      return;
    }
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedId
          ? {
              ...i,
              messages: [
                ...i.messages,
                { id: `m-${Date.now()}`, from: 'admin' as const, text, time },
              ],
            }
          : i
      )
    );
    setReplyDraft('');
  };

  return (
    <div className="space-y-4">
      <AdminPageTitleRow
        title="Issues"
        totalLabel={
          <>
            <span className="font-semibold text-slate-700">{TOTAL_ISSUES_SHOWN}</span> total
          </>
        }
      />
      <AdminProductLineTabs value={productLine} onChange={setProductLine} />

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:min-h-[calc(100vh-10rem)]">
      {/* List column */}
      <div className="w-full lg:w-[40%] flex flex-col min-h-0 lg:max-w-none">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-slate-100 shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setAudience('client')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    audience === 'client'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Building2 className="size-4" />
                  Clients
                </button>
                <button
                  type="button"
                  onClick={() => setAudience('vendor')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    audience === 'vendor'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Store className="size-4" />
                  Vendors
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="relative flex-1 min-w-0 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search issues…"
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSortAsc((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 shrink-0 sm:ml-auto"
                >
                  <ArrowDownWideNarrow className="size-4 text-slate-500" />
                  Sort by {sortAsc ? '(A-Z)' : '(Z-A)'}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{openCount}</span> open issues
              </p>

              <div className="flex border-b border-slate-200 gap-6">
                <button
                  type="button"
                  onClick={() => setStatusTab('pending')}
                  className={`pb-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    statusTab === 'pending'
                      ? 'text-[#2563EB] border-[#2563EB]'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  Pending Issues
                </button>
                <button
                  type="button"
                  onClick={() => setStatusTab('resolved')}
                  className={`pb-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    statusTab === 'resolved'
                      ? 'text-[#2563EB] border-[#2563EB]'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  Recently Resolved
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No issues in this view.</p>
            ) : (
              filtered.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => handleSelect(issue.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    selectedId === issue.id
                      ? 'border-slate-200 bg-blue-50/50 border-l-4 border-l-[#2563EB] pl-[9px]'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="size-10 rounded-full bg-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-600 shrink-0">
                      {initials(issue.userName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">{issue.userName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {issue.userRoleLabel}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryPill(issue.category)}`}
                        >
                          {issue.category === 'SpaceX' ? 'D Space' : issue.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{issue.snippet}</p>
                      <p className="text-[11px] font-medium text-[#FA8D40] mt-2">
                        Enquiry Date: {issue.enquiryDate}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail column */}
      <div className="w-full lg:w-[60%] flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col flex-1 min-h-[420px] lg:min-h-0 overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-sm">
              Select an issue to view details
            </div>
          ) : (
            <>
              <div className="p-5 lg:p-6 border-b border-slate-100 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="size-14 rounded-full bg-slate-200 text-sm font-bold flex items-center justify-center text-slate-700 shrink-0">
                      {initials(selected.userName)}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{selected.userName}</h2>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {selected.userRoleLabel}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryPill(selected.category)}`}
                        >
                          {selected.category === 'SpaceX' ? 'D Space' : selected.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Member since: {selected.memberSince}</p>
                      <p className="text-xs text-slate-600 mt-1 max-w-md">{selected.address}</p>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/clients')}
                        className="text-xs font-semibold text-[#2563EB] hover:underline mt-2"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                  <span
                    className={`self-start px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide shrink-0 ${
                      selected.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selected.status === 'pending' ? 'Pending issue' : 'Resolved'}
                  </span>
                </div>
              </div>

              <div className="px-5 lg:px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 shrink-0">
                <span className="font-semibold text-slate-800">Type of issue:</span> {selected.issueType}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-800">Raised on:</span> {selected.raisedOn}
              </div>

              <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-4">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.from === 'admin' ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="size-8 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600 shrink-0">
                      {msg.from === 'user' ? initials(selected.userName) : 'AD'}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                          : 'bg-[#2563EB] text-white rounded-tr-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-[10px] mt-2 ${
                          msg.from === 'user' ? 'text-slate-500' : 'text-blue-100'
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 lg:p-5 border-t border-slate-100 bg-white shrink-0">
                {toolbarNotice && (
                  <p className="mb-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    {toolbarNotice}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setToolbarNotice('Attach: file upload will be available in a future release.')}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Attach"
                  >
                    <ClipboardList className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolbarNotice('Template shortcuts will be available in a future release.')}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Template"
                  >
                    <Package className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolbarNotice('Emoji picker will be available in a future release.')}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Emoji"
                  >
                    <Smile className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolbarNotice('Paperclip attachments will be available in a future release.')}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Paperclip"
                  >
                    <Paperclip className="size-4" />
                  </button>
                </div>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Type your message here"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                />
                <div className="flex flex-wrap justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleMarkResolved}
                    disabled={selected.status !== 'pending'}
                    className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Mark as resolved
                  </button>
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={!replyDraft.trim()}
                    className="px-5 py-2 rounded-full text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      <p className="lg:hidden text-center text-[11px] text-slate-400 pt-2">
        <Link to="/admin" className="text-[#2563EB] hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
