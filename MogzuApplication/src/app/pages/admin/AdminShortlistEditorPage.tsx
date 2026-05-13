import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Mail, MessageCircle } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import type { AdminProductLine } from '@/app/components/admin/AdminPageChrome';
import { MOCK_PRODUCTS } from '@/app/lib/adminProductsMock';
import { CORP } from '@/app/lib/adminTheme';
import {
  digitsOnlyPhone,
  ensureOrderFromShortlistSelection,
  newProposalToken,
  optionFromCatalogueItem,
  optionFromVendorMock,
  shortlistPublicUrl,
} from '@/app/lib/mogzuShortlistHelpers';
import type { ShortlistOption, ShortlistProposal } from '@/app/lib/mogzuDomain';
import { loadShortlistProposals, saveShortlistProposals } from '@/app/lib/mogzuDomain';
import type { CatalogueItem } from '@/utils/catalogueTypes';
import { getMergedCatalogue } from '@/utils/catalogueUtils';
import { matchesPriceRange, matchesSourceFilter, parsePriceLike, type CatalogueSourceFilter } from '@/utils/filterContracts';

function catalogueItemMatchesQuery(item: CatalogueItem, q: string): boolean {
  if (!q) return true;
  const blob = [
    item.name,
    item.id,
    item.category,
    item.description,
    item.vendor_name ?? '',
    item.tagline ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return blob.includes(q);
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function AdminShortlistEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams<{ id: string }>();
  const isNew = location.pathname.endsWith('/shortlists/new');

  const [proposalId, setProposalId] = useState<string | null>(isNew ? null : routeId ?? null);
  const [token, setToken] = useState(() => (isNew ? newProposalToken() : ''));
  const [corporateEnquiryId, setCorporateEnquiryId] = useState('');
  const [corporateUserId, setCorporateUserId] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [corporateWhatsapp, setCorporateWhatsapp] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('0');
  const [eventDate, setEventDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [expiresAt, setExpiresAt] = useState(() => addDaysIso(30));
  const [options, setOptions] = useState<ShortlistOption[]>([]);
  const [status, setStatus] = useState<ShortlistProposal['status']>('draft');
  const [sentVia, setSentVia] = useState<('email' | 'whatsapp')[]>([]);
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());

  const [catalogTab, setCatalogTab] = useState<'mogzu_direct' | 'partner' | 'vendor'>('mogzu_direct');
  const [vendorLine, setVendorLine] = useState<AdminProductLine>('gifting');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'all' | 'events' | 'gifting' | 'dspace'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<CatalogueSourceFilter>('all');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setLoaded(true);
      return;
    }
    if (!routeId) {
      setError('Missing proposal id.');
      setLoadFailed(true);
      setLoaded(true);
      return;
    }
    const list = loadShortlistProposals();
    const row = list.find((p) => p.id === routeId);
    if (!row) {
      setError('Proposal not found.');
      setLoadFailed(true);
      setLoaded(true);
      return;
    }
    setProposalId(row.id);
    setToken(row.proposal_token);
    setCorporateEnquiryId(row.corporate_enquiry_id);
    setCorporateUserId(row.corporate_user_id);
    setCorporateEmail(row.corporate_email);
    setCorporateWhatsapp(row.corporate_whatsapp);
    setTitle(row.title);
    setMessage(row.message);
    setBudget(String(row.budget));
    setEventDate(row.event_date);
    setRequirements(row.requirements);
    setExpiresAt(row.expires_at);
    setOptions(row.shortlisted_options.map((o) => ({ ...o })));
    setStatus(row.status);
    setSentVia([...row.sent_via]);
    setCreatedAt(row.created_at);
    setLoaded(true);
  }, [isNew, routeId]);

  const shareUrl = useMemo(() => (token ? shortlistPublicUrl(token) : ''), [token]);

  const shortlistableItems = useMemo(() => {
    const allItems = getMergedCatalogue();
    return allItems.filter((item) =>
      item.is_mogzu_direct ? item.is_shortlistable !== false : true,
    );
  }, [catalogQuery, options.length]);

  const categoryOptionsByModule: Record<'events' | 'gifting' | 'dspace', string[]> = {
    events: [
      'Live Music & Bands', 'DJ & Electronic', 'Comedy & Stand-up', 'Cultural Performances',
      'Emcee & Anchoring', 'Team Building Activities', 'Corporate Workshops', 'Outdoor Adventures',
      'Magic & Illusion', 'Catering & F&B', 'Photography & Videography', 'Décor & Ambience',
      'AV & Technical Production',
    ],
    gifting: [
      'Premium Gift Hampers', 'Branded Merchandise / Swag', 'Tech Accessories', 'Wellness & Self-care',
      'Gourmet & Food Gifts', 'Apparel & Clothing', 'Stationery & Office', 'Experiential Gifts',
      'Personalised Gifts', 'Eco-friendly Gifts', 'Festival Specials',
    ],
    dspace: [
      'Conference & Boardroom', 'Event Hall & Banquet', 'Rooftop & Terrace', 'Outdoor & Lawn',
      'Co-working & Studio', 'Farmhouse & Resort', 'Hotel Banquet', 'Unique & Offbeat Venues',
    ],
  };

  const categoryPasses = (text: string): boolean => {
    if (categoryFilter === 'all') return true;
    return text.toLowerCase().includes(categoryFilter.toLowerCase());
  };

  const directRows = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    let list = shortlistableItems.filter((i) => i.source_type === 'mogzu_direct');
    if (moduleFilter !== 'all') list = list.filter((i) => i.module === moduleFilter);
    list = list.filter((i) => categoryPasses(`${i.category} ${i.name} ${i.description}`));
    list = list.filter((i) => matchesSourceFilter(sourceFilter, i.is_mogzu_direct));
    list = list.filter((i) => matchesPriceRange(i.base_price ?? parsePriceLike(i.price_label ?? null), budgetMin ? Number(budgetMin) : undefined, budgetMax ? Number(budgetMax) : undefined));
    if (q) list = list.filter((i) => catalogueItemMatchesQuery(i, q));
    return list;
  }, [budgetMax, budgetMin, catalogQuery, moduleFilter, options.length, shortlistableItems, sourceFilter, categoryFilter]);

  const partnerRows = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    let list = shortlistableItems.filter((i) => i.source_type === 'vendor');
    if (moduleFilter !== 'all') list = list.filter((i) => i.module === moduleFilter);
    list = list.filter((i) => categoryPasses(`${i.category} ${i.name} ${i.description}`));
    list = list.filter((i) => matchesSourceFilter(sourceFilter, i.is_mogzu_direct));
    list = list.filter((i) => matchesPriceRange(i.base_price ?? parsePriceLike(i.price_label ?? null), budgetMin ? Number(budgetMin) : undefined, budgetMax ? Number(budgetMax) : undefined));
    if (q) list = list.filter((i) => catalogueItemMatchesQuery(i, q));
    return list;
  }, [budgetMax, budgetMin, catalogQuery, moduleFilter, options.length, shortlistableItems, sourceFilter, categoryFilter]);

  const vendorRows = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    let list = MOCK_PRODUCTS.filter((p) => p.vertical === vendorLine);
    if (moduleFilter !== 'all') {
      const vertical = moduleFilter === 'dspace' ? 'spacex' : moduleFilter;
      list = list.filter((p) => p.vertical === vertical);
    }
    if (categoryFilter !== 'all') list = list.filter((p) => categoryPasses(`${p.category} ${p.name}`));
    if (sourceFilter !== 'all' && sourceFilter !== 'vendor') list = [];
    list = list.filter((p) => matchesPriceRange(parsePriceLike(p.price), budgetMin ? Number(budgetMin) : undefined, budgetMax ? Number(budgetMax) : undefined));
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q)
      );
    }
    return list;
  }, [budgetMax, budgetMin, catalogQuery, categoryFilter, moduleFilter, options.length, sourceFilter, vendorLine]);

  const persistRow = (patch: Partial<ShortlistProposal>, nextOptions?: ShortlistOption[]): ShortlistProposal => {
    const list = loadShortlistProposals();
    const pid = proposalId ?? `sp-${Date.now()}`;
    const tok = token || newProposalToken();
    const opts = nextOptions ?? options;
    const budgetNum = Number(budget) || 0;
    const base: ShortlistProposal = {
      id: pid,
      proposal_token: tok,
      corporate_enquiry_id: corporateEnquiryId.trim() || `enq-${pid}`,
      corporate_user_id: corporateUserId.trim() || '',
      corporate_email: corporateEmail.trim(),
      corporate_whatsapp: corporateWhatsapp.trim(),
      created_by_admin: 'admin',
      title: title.trim() || 'Untitled proposal',
      message: message.trim(),
      budget: budgetNum,
      event_date: eventDate.trim(),
      requirements: requirements.trim(),
      shortlisted_options: opts,
      status: patch.status ?? status,
      sent_via: patch.sent_via ?? sentVia,
      created_at: createdAt,
      expires_at: expiresAt,
    };
    const merged = { ...base, ...patch, shortlisted_options: patch.shortlisted_options ?? opts };
    const without = list.filter((p) => p.id !== pid);
    saveShortlistProposals([...without, merged]);
    return merged;
  };

  const saveDraft = () => {
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const saved = persistRow({ status: 'draft' });
    if (isNew || !proposalId) {
      setProposalId(saved.id);
      setToken(saved.proposal_token);
      navigate(`/admin/shortlists/${saved.id}`, { replace: true });
    }
    setStatus(saved.status);
    setNotice('Draft saved.');
    setTimeout(() => setNotice(''), 2000);
  };

  const markSent = (channel: 'email' | 'whatsapp'): boolean => {
    setError('');
    if (!title.trim()) {
      setError('Save title before sending.');
      return false;
    }
    if (options.length === 0) {
      setError('Add at least one option before sending.');
      return false;
    }
    const nextSent = sentVia.includes(channel) ? sentVia : [...sentVia, channel];
    const saved = persistRow({ status: 'sent', sent_via: nextSent });
    setProposalId(saved.id);
    setToken(saved.proposal_token);
    setSentVia(saved.sent_via);
    setStatus(saved.status);
    if (isNew || !proposalId) {
      navigate(`/admin/shortlists/${saved.id}`, { replace: true });
    }
    return true;
  };

  const copyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl).then(
      () => {
        setNotice('Public link copied.');
        setTimeout(() => setNotice(''), 2500);
      },
      () => setNotice('Clipboard unavailable.')
    );
  };

  const openMailto = () => {
    const subject = encodeURIComponent(`Mogzu shortlist: ${title.trim() || 'Your curated options'}`);
    const body = encodeURIComponent(`Hi,\n\nPlease review your shortlist here:\n${shareUrl}\n\n— Mogzu`);
    if (!corporateEmail.trim()) {
      setError('Add corporate email for mailto, or copy the link instead.');
      return;
    }
    const ok = markSent('email');
    if (!ok) return;
    window.open(`mailto:${corporateEmail.trim()}?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  const openWhatsApp = () => {
    const digits = digitsOnlyPhone(corporateWhatsapp);
    if (!digits) {
      setError('Add corporate WhatsApp (digits) for wa.me, or copy the link instead.');
      return;
    }
    const text = encodeURIComponent(`Your Mogzu shortlist: ${shareUrl}`);
    const ok = markSent('whatsapp');
    if (!ok) return;
    window.open(`https://wa.me/${digits}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const addOption = (opt: ShortlistOption) => {
    if (options.some((o) => o.listing_id === opt.listing_id && o.listing_type === opt.listing_type)) {
      setNotice('That listing is already on the shortlist.');
      setTimeout(() => setNotice(''), 2000);
      return;
    }
    setOptions((prev) => [...prev, opt]);
  };

  const removeOption = (id: string) => setOptions((prev) => prev.filter((o) => o.id !== id));

  const moveOption = (index: number, dir: -1 | 1) => {
    setOptions((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const updateOption = (id: string, patch: Partial<ShortlistOption>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const recordMogzuOrderFromShortlist = () => {
    const pid = proposalId ?? `sp-${Date.now()}`;
    const tok = token || newProposalToken();
    const proposal: ShortlistProposal = {
      id: pid,
      proposal_token: tok,
      corporate_enquiry_id: corporateEnquiryId.trim() || `enq-${pid}`,
      corporate_user_id: corporateUserId.trim() || '',
      corporate_email: corporateEmail.trim(),
      corporate_whatsapp: corporateWhatsapp.trim(),
      created_by_admin: 'admin',
      title: title.trim() || 'Untitled proposal',
      message: message.trim(),
      budget: Number(budget) || 0,
      event_date: eventDate.trim(),
      requirements: requirements.trim(),
      shortlisted_options: options,
      status,
      sent_via: sentVia,
      created_at: createdAt,
      expires_at: expiresAt,
    };
    const r = ensureOrderFromShortlistSelection(proposal);
    setNotice(r.message);
    setTimeout(() => setNotice(''), 3500);
  };

  if (!loaded) return <p className="text-sm text-slate-500">Loading…</p>;
  if (loadFailed) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => navigate('/admin/shortlists')} className="text-sm text-blue-600 hover:underline">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <button
        type="button"
        onClick={() => navigate('/admin/shortlists')}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        All shortlists
      </button>
      <AdminPageTitleRow title={isNew ? 'New shortlist' : 'Edit shortlist'} totalLabel={status} />

      {notice ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{notice}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Enquiry &amp; client</h2>
          <label className="text-xs font-medium text-slate-600 block">
            Proposal title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Message (shown on client page)
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-slate-600 block">
              Enquiry ID
              <input value={corporateEnquiryId} onChange={(e) => setCorporateEnquiryId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
            <label className="text-xs font-medium text-slate-600 block">
              Corporate user ID
              <input value={corporateUserId} onChange={(e) => setCorporateUserId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
          </div>
          <label className="text-xs font-medium text-slate-600 block">
            Corporate email
            <input type="email" value={corporateEmail} onChange={(e) => setCorporateEmail(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Corporate WhatsApp (digits, country code)
            <input value={corporateWhatsapp} onChange={(e) => setCorporateWhatsapp(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs font-medium text-slate-600 block">
              Budget (₹)
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
            <label className="text-xs font-medium text-slate-600 block col-span-2">
              Event date
              <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </label>
          </div>
          <label className="text-xs font-medium text-slate-600 block">
            Requirements
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Expires (ISO)
            <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-mono text-xs" />
          </label>
          <p className="text-xs text-slate-500 break-all">
            Token: <span className="font-mono">{token || '—'}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Send</h2>
          <p className="text-xs text-slate-600 break-all">{shareUrl || 'Save draft to fix share URL.'}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Copy className="size-3.5" />
              Copy link
            </button>
            <button
              type="button"
              onClick={openMailto}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Mail className="size-3.5" />
              Open email
            </button>
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </button>
          </div>
          <p className="text-xs text-slate-500">Sending records the channel on the proposal and sets status to &quot;sent&quot; when applicable.</p>
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: CORP.primary }}
          >
            Save draft
          </button>
          {status === 'selection_made' ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50/90 p-4 space-y-2 mt-3">
              <p className="text-xs font-semibold text-violet-900">Corporate picked an option</p>
              <p className="text-xs text-violet-800/90">
                Create a Mogzu order from this shortlist if one was not recorded (e.g. different browser profile).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={recordMogzuOrderFromShortlist}
                  className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800"
                >
                  Record Mogzu order
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/mogzu-orders')}
                  className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100/50"
                >
                  View Mogzu orders
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Browse catalogue &amp; add options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value as 'all' | 'events' | 'gifting' | 'dspace')} className="h-9 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Module: All</option>
            <option value="events">Events</option>
            <option value="gifting">Gifting</option>
            <option value="dspace">Dspace</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Category: All</option>
            {(moduleFilter === 'all'
              ? [...categoryOptionsByModule.events, ...categoryOptionsByModule.gifting, ...categoryOptionsByModule.dspace]
              : categoryOptionsByModule[moduleFilter]
            ).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as CatalogueSourceFilter)} className="h-9 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="all">Source: All</option>
            <option value="mogzu">Source: ✦ By Mogzu</option>
            <option value="vendor">Source: Vendor Partners</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="number" min={0} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Budget min (₹)" className="h-9 rounded-xl border border-slate-200 px-3 text-sm" />
          <input type="number" min={0} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Budget max (₹)" className="h-9 rounded-xl border border-slate-200 px-3 text-sm" />
          <button
            type="button"
            onClick={() => {
              setModuleFilter('all');
              setCategoryFilter('all');
              setSourceFilter('all');
              setBudgetMin('');
              setBudgetMax('');
              setCatalogQuery('');
            }}
            className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['mogzu_direct', 'partner', 'vendor'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCatalogTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                catalogTab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t === 'mogzu_direct' ? 'Mogzu Direct' : t === 'partner' ? 'Partner' : 'Vendor (mock)'}
            </button>
          ))}
        </div>
        {catalogTab === 'vendor' ? (
          <div className="flex flex-wrap gap-2">
            {(['gifting', 'events', 'spacex'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVendorLine(v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  vendorLine === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        ) : null}
        <input
          type="search"
          value={catalogQuery}
          onChange={(e) => setCatalogQuery(e.target.value)}
          placeholder="Search…"
          className="h-9 w-full max-w-md rounded-xl border border-slate-200 px-3 text-sm"
        />
        <p className="text-xs text-slate-500">
          Results: {catalogTab === 'mogzu_direct' ? directRows.length : catalogTab === 'partner' ? partnerRows.length : vendorRows.length}
        </p>
        <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
          {catalogTab === 'mogzu_direct'
            ? directRows.map((item) => {
                const priceLine =
                  item.base_price != null
                    ? `₹${item.base_price.toLocaleString('en-IN')}`
                    : (item.price_label ?? '—');
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p className="text-xs text-slate-600">{priceLine}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-[#D4206A]">✦ By Mogzu</span>
                        <span
                          className={`text-[10px] font-medium ${item.is_available ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addOption(optionFromCatalogueItem(item))}
                      className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                );
              })
            : catalogTab === 'partner'
              ? partnerRows.map((item) => {
                  const priceLine =
                    item.base_price != null
                      ? `₹${item.base_price.toLocaleString('en-IN')}`
                      : (item.price_label ?? '—');
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                        <p className="text-xs text-slate-600">{priceLine}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-[#1A1A2E]">
                            {item.vendor_name ?? 'Vendor'}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${item.is_available ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addOption(optionFromCatalogueItem(item))}
                        className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  );
                })
              : vendorRows.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.id} · {p.seller}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addOption(optionFromVendorMock(p))}
                      className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Shortlisted options ({options.length})</h2>
        {options.length === 0 ? (
          <p className="text-sm text-slate-500">Add items from the catalogue above.</p>
        ) : (
          <ul className="space-y-3">
            {options.map((o, i) => (
              <li key={o.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{o.title}</p>
                    <p className="text-xs text-slate-500">
                      {o.listing_type} · {o.listing_id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => moveOption(i, -1)} className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-50" aria-label="Move up">
                      <ArrowUp className="size-4" />
                    </button>
                    <button type="button" onClick={() => moveOption(i, 1)} className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-50" aria-label="Move down">
                      <ArrowDown className="size-4" />
                    </button>
                    <button type="button" onClick={() => removeOption(o.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={o.is_recommended}
                    onChange={(e) => updateOption(o.id, { is_recommended: e.target.checked })}
                  />
                  Recommended pick
                </label>
                <label className="text-xs font-medium text-slate-600 block">
                  Admin note (internal)
                  <input
                    value={o.admin_note}
                    onChange={(e) => updateOption(o.id, { admin_note: e.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
