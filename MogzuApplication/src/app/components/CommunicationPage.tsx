import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { SupportTicket } from '@/lib/database.types';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import svgPaths from '@/imports/svg-camfkj9vq4';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import { Bell, Building2, HelpCircle, MessageSquare, MoreVertical, Paperclip, Search, Send, Smile, Users, X } from 'lucide-react';

type FilterTab = 'all' | 'corporate' | 'vendor' | 'internal' | 'reminder';
type PartyType = 'corporate' | 'vendor' | 'internal' | 'reminder';
type ModuleTag = 'SpaceX' | 'GiEv' | 'Gifting' | 'Hey Genie';
type Msg = { id: string; sender: 'admin' | 'other'; text: string; time: string };

type Thread = {
  id: string;
  name: string;
  subtitle: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  partyType: PartyType;
  moduleTag: ModuleTag;
  userBadge: string;
  userBadgeClass: string;
  moduleClass: string;
  online: boolean;
  location: string;
  memberSince: string;
  bookingSummary?: string[];
  listingSummary?: string[];
  teamContext?: string[];
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400', path: '/dashboard' },
  { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800', path: '/activitysuite' },
  { id: 'bookings', label: 'Bookings', icon: 'paf72c00', path: '/bookings' },
  { id: 'favorites', label: 'Favorites', icon: 'p27070280', path: '/favourites' },
  { id: 'users', label: 'Users', icon: 'p29193540', path: '/user-management' },
  { id: 'notification', label: 'Notification', icon: 'p4e64800', path: '/corporate/notifications' },
  { id: 'communication', label: 'Communication', icon: 'p319d300', path: '/communication' },
  { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/corporate/spend-report' },
  { id: 'transactions', label: 'Transactions', icon: 'p2683f80', path: '/admin/transactions' },
  { id: 'settings', label: 'Settings', icon: 'pde1bb00', path: '/settings/workflow' },
];

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_THREADS: Thread[] = [
  {
    id: 'a1',
    name: 'Abhishek Tripathi',
    subtitle: 'Mumbai moving co.',
    lastMessage: 'Need custom printing for 75 T-shirts.',
    timestamp: '16 Jul, 18:10',
    unreadCount: 2,
    partyType: 'corporate',
    moduleTag: 'Gifting',
    userBadge: 'Corporate',
    userBadgeClass: 'bg-blue-50 text-blue-700',
    moduleClass: 'bg-emerald-50 text-emerald-700',
    online: true,
    location: 'Worli, Mumbai',
    memberSince: 'Last month',
    bookingSummary: ['Booking #1240909 · In Progress', 'Booking #1240811 · Waiting approval'],
  },
  {
    id: 'a2',
    name: 'Kapil Dev',
    subtitle: 'Mumbai moving co.',
    lastMessage: 'Can you share updated listing stock?',
    timestamp: '16 Jul, 18:10',
    unreadCount: 1,
    partyType: 'vendor',
    moduleTag: 'GiEv',
    userBadge: 'Vendor',
    userBadgeClass: 'bg-violet-50 text-violet-700',
    moduleClass: 'bg-amber-50 text-amber-700',
    online: false,
    location: 'Andheri East, Mumbai',
    memberSince: '2 months',
    listingSummary: ['Listing: Premium Gift Box · Active', 'Listing: Event Kit Bundle · Low stock'],
  },
  {
    id: 'a3',
    name: 'Operations Team',
    subtitle: 'Mogzu Internal',
    lastMessage: 'Escalate this thread to finance?',
    timestamp: 'Today, 10:31',
    unreadCount: 0,
    partyType: 'internal',
    moduleTag: 'Hey Genie',
    userBadge: 'Internal',
    userBadgeClass: 'bg-slate-100 text-slate-700',
    moduleClass: 'bg-cyan-50 text-cyan-700',
    online: true,
    location: 'HQ',
    memberSince: 'Internal',
    teamContext: ['Escalation owner: Priya S.', 'SLA target: 2 hours'],
  },
  {
    id: 'a4',
    name: 'Reminder Queue',
    subtitle: 'Admin Follow-ups',
    lastMessage: 'Follow up with Smartworks invoice thread.',
    timestamp: 'Today, 09:00',
    unreadCount: 0,
    partyType: 'reminder',
    moduleTag: 'SpaceX',
    userBadge: 'Reminder',
    userBadgeClass: 'bg-orange-50 text-orange-700',
    moduleClass: 'bg-sky-50 text-sky-700',
    online: false,
    location: 'Admin',
    memberSince: 'System',
    teamContext: ['Reminder count: 4 open', 'Next due: 11:30 AM'],
  },
];

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_MESSAGES: Record<string, Msg[]> = {
  a1: [
    { id: 'm1', sender: 'other', text: 'Hi looking for the T-Shirt for new year party for my team of 75.', time: '18:10' },
    { id: 'm2', sender: 'admin', text: 'Sure, sharing options and MOQ details now.', time: '18:12' },
  ],
  a2: [{ id: 'm3', sender: 'other', text: 'Can you share updated listing stock?', time: '18:10' }],
  a3: [{ id: 'm4', sender: 'other', text: 'Escalate this thread to finance?', time: '10:31' }],
  a4: [{ id: 'm5', sender: 'other', text: 'Follow up with Smartworks invoice thread.', time: '09:00' }],
};

const quickRepliesByType: Record<PartyType, string[]> = {
  corporate: ['Qty & order value?', 'Share booking ID', 'Ask for review'],
  vendor: ['Listing status update?', 'Stock availability?', 'Need revised quotation'],
  internal: ['Assign to me', 'Escalate to L2', 'Add internal summary'],
  reminder: ['Mark complete', 'Snooze 2h', 'Open related thread'],
};

const moduleClassByTag: Record<ModuleTag, string> = {
  SpaceX: 'bg-sky-50 text-sky-700',
  GiEv: 'bg-amber-50 text-amber-700',
  Gifting: 'bg-emerald-50 text-emerald-700',
  'Hey Genie': 'bg-cyan-50 text-cyan-700',
};

const categoryToModuleTag = (category: string): ModuleTag => {
  const lower = category.toLowerCase();
  if (lower.includes('gift')) return 'Gifting';
  if (lower.includes('genie') || lower.includes('travel')) return 'Hey Genie';
  if (lower.includes('event') || lower.includes('giev')) return 'GiEv';
  if (lower.includes('space') || lower.includes('venue')) return 'SpaceX';
  return 'Gifting';
};

const formatThreadTimestamp = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const ticketToThread = (t: SupportTicket): Thread => {
  const moduleTag = categoryToModuleTag(t.category);
  const snippet = t.body.length > 80 ? `${t.body.slice(0, 80)}…` : t.body;
  return {
    id: t.id,
    name: t.subject,
    subtitle: t.category,
    lastMessage: snippet,
    timestamp: formatThreadTimestamp(t.updated_at || t.created_at),
    unreadCount: t.status === 'waiting_user' ? 1 : 0,
    partyType: 'corporate',
    moduleTag,
    userBadge: 'Corporate',
    userBadgeClass: 'bg-blue-50 text-blue-700',
    moduleClass: moduleClassByTag[moduleTag],
    online: false,
    location: 'Support',
    memberSince: formatThreadTimestamp(t.created_at),
  };
};

const labelOptions: Array<{ id: string; label: string; className: string }> = [
  { id: 'deal-done', label: 'Deal done', className: 'bg-emerald-100 text-emerald-800' },
  { id: 'negotiation', label: 'Negotiation', className: 'bg-sky-100 text-sky-800' },
  { id: 'quotation-sent', label: 'Quotation sent', className: 'bg-amber-100 text-amber-800' },
  { id: 'follow-up', label: 'Follow up', className: 'bg-orange-100 text-orange-800' },
  { id: 'important', label: 'Important', className: 'bg-blue-100 text-blue-800' },
];

export default function CommunicationPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [hasRealData, setHasRealData] = useState(false);
  const [realTicketIds, setRealTicketIds] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNav, setSelectedNav] = useState('communication');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [threads, setThreads] = useState<Thread[]>(DEMO_DATA_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(DEMO_DATA_THREADS[0].id);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Msg[]>>(DEMO_DATA_MESSAGES);
  const [composer, setComposer] = useState('');
  const [internalNotesByThread, setInternalNotesByThread] = useState<Record<string, string>>({});
  const [actionInfo, setActionInfo] = useState('');
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeTargetType, setComposeTargetType] = useState<'corporate' | 'vendor'>('corporate');
  const [composeName, setComposeName] = useState('');
  const [composeModule, setComposeModule] = useState<ModuleTag>('Gifting');
  const [unreadNotificationsCount] = useState(12);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [setReminderModalOpen, setSetReminderModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [applyLabelModalOpen, setApplyLabelModalOpen] = useState(false);
  const [reminderDue, setReminderDue] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [noteText, setNoteText] = useState('');
  const [labelsQuery, setLabelsQuery] = useState('');
  const [labelSelections, setLabelSelections] = useState<Set<string>>(new Set());
  const [appliedLabelsByThread, setAppliedLabelsByThread] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    void (async () => {
      const { data } = await db.supportTickets.listMine(profile.id);
      if (cancelled) return;
      const tickets = ((data ?? []) as SupportTicket[]).filter((t) => t.audience === 'corporate');
      if (tickets.length === 0) return;
      const mapped = tickets.map(ticketToThread);
      const msgs: Record<string, Msg[]> = {};
      for (const t of tickets) {
        msgs[t.id] = [{ id: `body-${t.id}`, sender: 'other', text: t.body, time: formatThreadTimestamp(t.created_at) }];
      }
      setThreads(mapped);
      setMessagesByThread(msgs);
      setActiveThreadId(mapped[0].id);
      setRealTicketIds(new Set(tickets.map((t) => t.id)));
      setHasRealData(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const handleNavClick = (item: (typeof navItems)[number]) => {
    setSelectedNav(item.id);
    if (item.path && item.path !== '#') navigate(item.path);
  };

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads.filter((t) => {
      if (filterTab !== 'all' && t.partyType !== filterTab) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.moduleTag.toLowerCase().includes(q)
      );
    });
  }, [threads, filterTab, searchQuery]);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? filteredThreads[0] ?? threads[0];
  const currentMessages = messagesByThread[activeThread?.id ?? ''] || [];

  const selectThread = (id: string) => {
    setActiveThreadId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)));
  };

  const sendMessage = () => {
    const txt = composer.trim();
    if (!txt || !activeThread) return;
    const msg: Msg = { id: `msg-${Date.now()}`, sender: 'admin', text: txt, time: 'Just now' };
    setMessagesByThread((prev) => ({ ...prev, [activeThread.id]: [...(prev[activeThread.id] || []), msg] }));
    setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? { ...t, lastMessage: txt, timestamp: 'Just now' } : t)));
    setComposer('');
    if (hasRealData && realTicketIds.has(activeThread.id) && profile?.id) {
      void db.supportTicketNotes.create({
        ticket_id: activeThread.id,
        author_id: profile.id,
        body: txt,
        is_internal: false,
      });
    }
  };

  const runAction = (action: 'assign' | 'escalate' | 'close' | 'note') => {
    const labels = {
      assign: 'Thread assigned.',
      escalate: 'Thread escalated to support lead.',
      close: 'Thread marked closed.',
      note: 'Internal note saved.',
    };
    setActionInfo(labels[action]);
  };

  const saveReminder = () => {
    if (!activeThread) return;
    const due = reminderDue.trim();
    if (!due) return;
    const text = reminderNote.trim() || `Reminder set for ${activeThread.name}`;
    const msg: Msg = { id: `rem-${Date.now()}`, sender: 'admin', text: `Reminder: ${text} (${due})`, time: 'Just now' };
    setMessagesByThread((prev) => ({ ...prev, [activeThread.id]: [...(prev[activeThread.id] || []), msg] }));
    setSetReminderModalOpen(false);
    setReminderDue('');
    setReminderNote('');
  };

  const saveNote = () => {
    if (!activeThread) return;
    const text = noteText.trim();
    if (!text) return;
    const msg: Msg = { id: `note-${Date.now()}`, sender: 'admin', text: `Note: ${text}`, time: 'Just now' };
    setMessagesByThread((prev) => ({ ...prev, [activeThread.id]: [...(prev[activeThread.id] || []), msg] }));
    setAddNoteModalOpen(false);
    setNoteText('');
  };

  const startNewConversation = () => {
    const name = composeName.trim();
    if (!name) return;
    const isCorporate = composeTargetType === 'corporate';
    const id = `n-${Date.now()}`;
    const created: Thread = {
      id,
      name,
      subtitle: isCorporate ? 'New corporate thread' : 'New vendor thread',
      lastMessage: 'Conversation started',
      timestamp: 'Just now',
      unreadCount: 0,
      partyType: isCorporate ? 'corporate' : 'vendor',
      moduleTag: composeModule,
      userBadge: isCorporate ? 'Corporate' : 'Vendor',
      userBadgeClass: isCorporate ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700',
      moduleClass: 'bg-emerald-50 text-emerald-700',
      online: true,
      location: 'N/A',
      memberSince: 'Just now',
      bookingSummary: isCorporate ? ['No active bookings yet'] : undefined,
      listingSummary: isCorporate ? undefined : ['No active listings yet'],
    };
    setThreads((prev) => [created, ...prev]);
    setMessagesByThread((prev) => ({ ...prev, [id]: [{ id: `s-${id}`, sender: 'admin', text: 'Hi, welcome to Mogzu communication.', time: 'Just now' }] }));
    setComposeModalOpen(false);
    setComposeName('');
    setActiveThreadId(id);
    setFilterTab('all');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB] font-['Inter']">
      <aside className={`bg-[#f9fafb] ${sidebarCollapsed ? 'w-20' : 'w-56'} flex-shrink-0 border-r border-gray-200 transition-all duration-300 hidden lg:flex relative z-40 h-full flex-col`}>
        <div className="h-14 flex items-center justify-center border-b border-gray-200 bg-[#f9fafb] px-5 overflow-hidden whitespace-nowrap shrink-0">
          <img src={imgImage24877} alt="Mogzu" className={`transition-all duration-300 object-contain ${sidebarCollapsed ? 'h-7 w-7' : 'h-9 w-auto'}`} style={{ mixBlendMode: 'multiply' }} />
        </div>
        <nav className="py-4 px-3 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 ${
                selectedNav === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-5">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                  <path d={svgPaths[item.icon as keyof typeof svgPaths]} fill="currentColor" />
                </svg>
              </div>
              {!sidebarCollapsed && <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarCollapsed((v) => !v)} className="hidden lg:flex absolute -right-3 top-[4.5rem] w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 shadow-md z-50">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transform transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6">
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="relative w-full min-w-0 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={headerSearch} onChange={(e) => setHeaderSearch(e.target.value)} placeholder="Search" className="w-full h-10 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
            </div>
          </div>
          <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><HelpCircle className="h-5 w-5" /></button>
          <button type="button" className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
              {unreadNotificationsCount}
            </span>
          </button>
        </header>

        <div className="flex-1 p-4 lg:p-6 min-h-0">
          {!hasRealData && <DevMockDataBanner />}
          <div className="h-full min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr]">
              <section className="border-r border-slate-200 min-h-0 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Chats</h2>
                    <button type="button" onClick={() => setComposeModalOpen(true)} className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Compose new</button>
                  </div>
                  <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-50 p-2">
                    {([
                      ['all', 'Chats', MessageSquare],
                      ['internal', 'Internal', Building2],
                      ['corporate', 'Clients', Users],
                      ['vendor', 'Vendors', Users],
                      ['reminder', 'Reminder', Bell],
                    ] as const).map(([id, label, Icon]) => (
                      <button key={id} type="button" onClick={() => setFilterTab(id)} className={`rounded-lg px-2 py-1.5 text-[11px] font-medium ${filterTab === id ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:bg-white/60'}`}>
                        <Icon className="mx-auto mb-1 h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs" />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredThreads.length === 0 && (
                    <p className="p-8 text-center text-xs text-slate-500">No conversations yet.</p>
                  )}
                  {filteredThreads.map((t) => (
                    <button key={t.id} type="button" onClick={() => selectThread(t.id)} className={`w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${activeThread?.id === t.id ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <img src={imgAvatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                            <span className="text-[11px] text-slate-400 shrink-0">{t.timestamp}</span>
                          </div>
                          <p className="truncate text-xs text-slate-500">{t.subtitle}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.userBadgeClass}`}>{t.userBadge}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.moduleClass}`}>
                              {t.moduleTag === 'SpaceX' ? 'D Space' : t.moduleTag}
                            </span>
                            {t.unreadCount > 0 && <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">{t.unreadCount}</span>}
                            {(appliedLabelsByThread[t.id] ?? []).slice(0, 1).map((labelId) => {
                              const l = labelOptions.find((x) => x.id === labelId);
                              if (!l) return null;
                              return <span key={labelId} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${l.className}`}>{l.label}</span>;
                            })}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{t.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="min-h-0 flex flex-col bg-[#F4F6FB]">
                {activeThread ? (
                  <>
                    <div className="bg-white border-b border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <img src={imgAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-900">{activeThread.name}</h3>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${activeThread.userBadgeClass}`}>{activeThread.userBadge}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${activeThread.moduleClass}`}>
                                {activeThread.moduleTag === 'SpaceX' ? 'D Space' : activeThread.moduleTag}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{activeThread.subtitle}</p>
                            <p className="text-[11px] text-slate-400">{activeThread.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setSetReminderModalOpen(true)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Set Reminder</button>
                            <button type="button" onClick={() => setAddNoteModalOpen(true)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Add notes</button>
                            <button
                              type="button"
                              onClick={() => {
                                setLabelsQuery('');
                                setLabelSelections(new Set(appliedLabelsByThread[activeThread.id] ?? []));
                                setApplyLabelModalOpen(true);
                              }}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                            >
                              Apply label
                            </button>
                            <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></button>
                          </div>
                          <button type="button" onClick={() => setDetailsOpen(true)} className="text-xs font-medium text-[#2563EB] hover:underline">View details</button>
                        </div>
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
                      {currentMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.sender === 'admin' ? 'rounded-br-md bg-[#2563EB] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'}`}>
                            <p>{m.text}</p>
                            <p className={`mt-1 text-[10px] ${m.sender === 'admin' ? 'text-blue-100' : 'text-slate-400'}`}>{m.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 bg-white p-3">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {quickRepliesByType[activeThread.partyType].map((chip) => (
                          <button key={chip} type="button" onClick={() => setComposer((prev) => (prev ? `${prev} ${chip}` : chip))} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-[#2563EB]/40 hover:bg-blue-50/50">{chip}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Smile className="h-4 w-4" /></button>
                        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Paperclip className="h-4 w-4" /></button>
                        <div className="relative min-w-0 flex-1">
                          <input value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), sendMessage())} placeholder="Type your message here" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15" />
                        </div>
                        <button type="button" onClick={sendMessage} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm hover:bg-blue-700"><Send className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Select a conversation</div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {composeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">Compose new message</h3>
              <button type="button" onClick={() => setComposeModalOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Target type</label>
                <select value={composeTargetType} onChange={(e) => setComposeTargetType(e.target.value as 'corporate' | 'vendor')} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                  <option value="corporate">Corporate</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Name</label>
                <input value={composeName} onChange={(e) => setComposeName(e.target.value)} placeholder="Enter recipient name" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Module</label>
                <select value={composeModule} onChange={(e) => setComposeModule(e.target.value as ModuleTag)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                  <option value="SpaceX">D Space</option>
                  <option>GiEv</option>
                  <option>Gifting</option>
                  <option>Hey Genie</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button type="button" onClick={() => setComposeModalOpen(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={startNewConversation} className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Start</button>
            </div>
          </div>
        </div>
      )}

      {detailsOpen && activeThread && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/35">
          <button type="button" className="h-full flex-1" onClick={() => setDetailsOpen(false)} aria-label="Close details panel" />
          <aside className="h-full w-full max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Contact details</h4>
              <button type="button" onClick={() => setDetailsOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <p className="text-sm font-medium text-slate-800">{activeThread.name}</p>
              <p className="text-xs text-slate-500">{activeThread.subtitle}</p>
              <p className="mt-1 text-[11px] text-slate-400">{activeThread.location} · Member since {activeThread.memberSince}</p>
            </div>
            <div className="border-b border-slate-100 py-4">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {activeThread.partyType === 'corporate' ? 'Active bookings' : activeThread.partyType === 'vendor' ? 'Active listings' : 'Internal context'}
              </h5>
              <div className="mt-2 space-y-1.5">
                {(activeThread.partyType === 'corporate'
                  ? activeThread.bookingSummary
                  : activeThread.partyType === 'vendor'
                    ? activeThread.listingSummary
                    : activeThread.teamContext
                )?.map((row, i) => (
                  <p key={i} className="text-xs text-slate-600">{row}</p>
                ))}
              </div>
            </div>
            <div className="border-b border-slate-100 py-4">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin actions</h5>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => runAction('assign')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Assign</button>
                <button type="button" onClick={() => runAction('escalate')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Escalate</button>
                <button type="button" onClick={() => runAction('close')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Close</button>
                <button type="button" onClick={() => runAction('note')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Add Note</button>
              </div>
              {actionInfo && <p className="mt-2 text-xs text-[#2563EB]">{actionInfo}</p>}
            </div>
            {activeThread.partyType === 'internal' && (
              <div className="py-4">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Internal note</h5>
                <textarea
                  value={internalNotesByThread[activeThread.id] || ''}
                  onChange={(e) => setInternalNotesByThread((prev) => ({ ...prev, [activeThread.id]: e.target.value }))}
                  placeholder="Add admin-only note..."
                  className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            )}
          </aside>
        </div>
      )}

      {setReminderModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Set Reminder</h3>
              <button type="button" onClick={() => setSetReminderModalOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700">Reminder time</label>
              <input type="datetime-local" value={reminderDue} onChange={(e) => setReminderDue(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
              <label className="mt-4 block text-sm font-medium text-slate-700">Note (optional)</label>
              <textarea value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} rows={4} placeholder="Add a short reminder note" className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button type="button" onClick={() => setSetReminderModalOpen(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={saveReminder} className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {addNoteModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Add notes</h3>
              <button type="button" onClick={() => setAddNoteModalOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700">Note</label>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={6} placeholder="Write a note for this conversation" className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button type="button" onClick={() => setAddNoteModalOpen(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={saveNote} className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {applyLabelModalOpen && activeThread && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Apply Label</h3>
              <button type="button" onClick={() => setApplyLabelModalOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={labelsQuery} onChange={(e) => setLabelsQuery(e.target.value)} placeholder="Search labels" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                </div>
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
                        <span className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium ${l.className}`}>{l.label}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button type="button" onClick={() => setApplyLabelModalOpen(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  setAppliedLabelsByThread((prev) => ({ ...prev, [activeThread.id]: Array.from(labelSelections) }));
                  setApplyLabelModalOpen(false);
                }}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}