import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Search, LifeBuoy } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import { ONBOARDING_COMPLETED_KEY } from '@/app/lib/vendorOnboardingStorage';
import {
  enqueueVendorSupportTicket,
  loadVendorSupportQueue,
  VENDOR_SUPPORT_QUEUE_STORAGE_KEY,
  type VendorSupportTicket,
} from '@/app/lib/vendorSupportQueueStorage';
import type { IssueCategory } from './AdminIssuesPage';

const categories: { value: IssueCategory; label: string }[] = [
  { value: 'Gifting', label: 'Gifting' },
  { value: 'Event', label: 'Events' },
  { value: 'SpaceX', label: 'Spaces (D Space)' },
];

const inputClass =
  'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

export default function VendorSupportPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Gifting');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [uiNotice, setUiNotice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState<VendorSupportTicket[]>(() => loadVendorSupportQueue());

  const syncTickets = () => setTickets(loadVendorSupportQueue());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (!raw) return;
      const c = JSON.parse(raw) as { businessName?: string; email?: string };
      if (c.businessName?.trim()) setBusinessName(c.businessName.trim());
      if (c.email?.trim()) setEmail(c.email.trim());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onUp = () => syncTickets();
    const onStorage = (e: StorageEvent) => {
      if (e.key === VENDOR_SUPPORT_QUEUE_STORAGE_KEY) syncTickets();
    };
    window.addEventListener('mogzu-vendor-support-queue-updated', onUp);
    window.addEventListener('focus', onUp);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('mogzu-vendor-support-queue-updated', onUp);
      window.removeEventListener('focus', onUp);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUiNotice('');
    const sub = subject.trim();
    const msg = message.trim();
    if (!sub) {
      setUiNotice('Please enter a short subject.');
      return;
    }
    if (!msg) {
      setUiNotice('Please describe your issue so our team can help.');
      return;
    }
    enqueueVendorSupportTicket({
      businessName: businessName.trim() || 'Partner',
      email: email.trim() || '—',
      category,
      subject: sub,
      message: msg,
    });
    syncTickets();
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <VendorAppShell
      activeNav="dashboard"
      routeSource="vendor-support"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
      headerEnd={
        <>
          <button
            type="button"
            onClick={() => navigate('/vendor/calendar')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            aria-label="Open calendar"
          >
            <Bell className="h-5 w-5" />
          </button>
          <VendorTopRightMenu />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent p-4 sm:p-6">
            {uiNotice && !submitted && (
              <p
                className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                role="status"
              >
                {uiNotice}
              </p>
            )}

            <div className="mx-auto max-w-xl">
              {tickets.length > 0 ? (
                <section className="mb-8 space-y-4">
                  <h2 className="text-sm font-semibold text-[#0e1e3f]">Your conversations</h2>
                  <p className="text-xs text-slate-500">
                    Replies from Mogzu admin appear below after they respond in Admin → Issues.
                  </p>
                  <ul className="space-y-4">
                    {tickets.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{t.subject || 'Support request'}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              t.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-900'
                            }`}
                          >
                            {t.status === 'resolved' ? 'Resolved' : 'Open'}
                          </span>
                        </div>
                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                          {(t.messages ?? []).map((m) => (
                            <div
                              key={m.id}
                              className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                                m.from === 'admin'
                                  ? 'ml-4 border border-blue-100 bg-blue-50/90 text-slate-800'
                                  : 'mr-4 border border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                {m.from === 'admin' ? 'Mogzu admin' : 'You'} · {m.time}
                              </span>
                              <p className="whitespace-pre-wrap">{m.text}</p>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-lg font-semibold text-[#0e1e3f]">Contact support</h1>
                  <p className="text-sm text-slate-500">
                    Your request is sent to the Mogzu admin team (this demo uses your browser only).
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-6 text-center">
                  <p className="text-sm font-semibold text-emerald-900">Thanks — we&apos;ve received your message.</p>
                  <p className="mt-2 text-sm text-emerald-800/90">
                    An administrator can review it under Admin → Issues → Vendors.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm font-semibold text-[#2563eb] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div>
                    <label htmlFor="vs-business" className="mb-1 block text-xs font-semibold text-slate-600">
                      Business name
                    </label>
                    <input
                      id="vs-business"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your business"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="vs-email" className="mb-1 block text-xs font-semibold text-slate-600">
                      Contact email
                    </label>
                    <input
                      id="vs-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="vs-category" className="mb-1 block text-xs font-semibold text-slate-600">
                      Product line
                    </label>
                    <select
                      id="vs-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                      className={inputClass}
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vs-subject" className="mb-1 block text-xs font-semibold text-slate-600">
                      Subject
                    </label>
                    <input
                      id="vs-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Short summary"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="vs-message" className="mb-1 block text-xs font-semibold text-slate-600">
                      Message
                    </label>
                    <textarea
                      id="vs-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe the issue…"
                      rows={5}
                      className={`${inputClass} min-h-[120px] resize-y py-2.5`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#2563eb] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] sm:w-auto sm:px-8"
                  >
                    Submit to Mogzu
                  </button>
                </form>
              )}
            </div>
      </main>
    </VendorAppShell>
  );
}
