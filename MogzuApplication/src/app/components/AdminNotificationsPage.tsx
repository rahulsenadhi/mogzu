import { useState } from 'react';
import { Link } from 'react-router';
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import {
  type SentNotificationRow,
} from '@/app/lib/adminNotificationsMock';

// DEMO DATA — swap for Supabase query when real data exists
const DEMO_DATA_NOTIFICATIONS: SentNotificationRow[] = [
  {
    id: 'demo-1',
    title: 'Diwali gifting catalogue is live',
    meta: 'Added by Marketing · All clients',
    time: '14 May 2026 09:15',
    initials: 'MK',
  },
  {
    id: 'demo-2',
    title: 'Vendor payout cycle 15 May processed',
    meta: 'Added by Finance · All vendors',
    time: '15 May 2026 17:30',
    initials: 'FN',
  },
  {
    id: 'demo-3',
    title: 'New SpaceX listings awaiting approval',
    meta: 'To Mogzu admin team',
    time: '13 May 2026 11:08',
    initials: 'AD',
  },
  {
    id: 'demo-4',
    title: 'Q2 wellness stipend reminder',
    meta: 'To Acme Corp employees',
    time: '12 May 2026 08:00',
    initials: 'HR',
  },
  {
    id: 'demo-5',
    title: 'Maintenance window — 18 May 02:00 IST',
    meta: 'Added by Ops · All clients + vendors',
    time: '11 May 2026 16:45',
    initials: 'OP',
  },
  {
    id: 'demo-6',
    title: 'Townhall AV vendors onboarded — 6 new partners',
    meta: 'To Account Managers',
    time: '10 May 2026 14:22',
    initials: 'AM',
  },
];
const INITIAL_SENT_NOTIFICATIONS = DEMO_DATA_NOTIFICATIONS;
import { CORP } from '@/app/lib/adminTheme';

function formatSentTime() {
  return new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [receiver, setReceiver] = useState('');
  const [allClients, setAllClients] = useState(true);
  const [allVendors, setAllVendors] = useState(true);
  const [recent, setRecent] = useState<SentNotificationRow[]>(INITIAL_SENT_NOTIFICATIONS);
  const [sentHint, setSentHint] = useState(false);
  const [sendError, setSendError] = useState('');
  const [editorNotice, setEditorNotice] = useState('');

  const handleSend = () => {
    setSendError('');
    const t = title.trim() || 'Untitled reminder';
    const desc = description.trim();
    const audienceParts: string[] = [];
    if (allClients) audienceParts.push('clients');
    if (allVendors) audienceParts.push('vendors');

    if (!title.trim()) {
      setSendError('Title is required before sending.');
      return;
    }
    if (!desc) {
      setSendError('Description is required before sending.');
      return;
    }
    if (!receiver && audienceParts.length === 0) {
      setSendError('Select a receiver or at least one audience group.');
      return;
    }

    const audience = audienceParts.length ? audienceParts.join(' + ') : 'no audience selected';

    const row: SentNotificationRow = {
      id: `sent-${Date.now()}`,
      title: t,
      meta: `Added by James Brown · ${receiver || 'All selected'} · ${audience}`,
      time: formatSentTime(),
      initials: 'JB',
    };
    setRecent((prev) => [row, ...prev]);
    setTitle('');
    setDescription('');
    setSentHint(true);
    window.setTimeout(() => setSentHint(false), 4000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: CORP.titleNavy }}
        >
          Send Reminder Notifications
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
          Reach <span className="text-slate-600 font-medium">corporate clients</span> and{' '}
          <span className="text-slate-600 font-medium">vendors</span> from one place — pick a receiver or
          broadcast by audience. Demo only; no messages are sent.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 p-5 lg:p-6 space-y-5">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add task name"
            className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </label>

        <div>
          <span className="text-xs font-medium text-slate-600">Description</span>
          <div className="mt-1.5 rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/90">
              {[
                { Icon: Bold, label: 'Bold' },
                { Icon: Italic, label: 'Italic' },
                { Icon: Strikethrough, label: 'Strikethrough' },
                { Icon: LinkIcon, label: 'Link' },
                { Icon: List, label: 'Bullet list' },
                { Icon: ListOrdered, label: 'Numbered list' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setEditorNotice(`${label} formatting will be available in a future release.`)}
                  className="p-2 rounded-lg text-slate-500 transition-colors hover:bg-white/90 hover:text-slate-700"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            {editorNotice && (
              <p className="px-3 py-2 text-xs text-slate-600 border-b border-slate-100 bg-slate-50/80">
                {editorNotice}
              </p>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={5}
              className="w-full px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2563EB]/15"
            />
          </div>
        </div>

        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">Select receiver</span>
          <select
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="">Select name</option>
            <option value="Kapil Dev">Kapil Dev</option>
            <option value="James Brown">James Brown</option>
            <option value="Store managers">Store managers</option>
            <option value="All regional leads">All regional leads</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allClients}
              onChange={(e) => setAllClients(e.target.checked)}
              className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-slate-700">Send all clients</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allVendors}
              onChange={(e) => setAllVendors(e.target.checked)}
              className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-slate-700">Send all vendors</span>
          </label>
        </div>

        {sentHint && (
          <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            Sent (demo) — added to recent list below.
          </p>
        )}
        {sendError && (
          <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {sendError}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSend}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8]"
          >
            Send
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold" style={{ color: CORP.titleNavy }}>
            Recent shared notification
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((row) => (
            <li
              key={row.id}
              className="flex gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFF]"
            >
              <span className="size-10 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-slate-100 shadow-sm">
                {row.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                <p className="text-xs text-slate-500 mt-1">{row.meta}</p>
              </div>
              <time className="text-xs text-slate-500 whitespace-nowrap shrink-0">{row.time}</time>
            </li>
          ))}
        </ul>
        {recent.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-10">No notifications sent yet.</p>
        )}
      </div>

      <p className="text-center text-sm">
        <Link to="/corporate/notifications" className="font-semibold text-[#2563EB] hover:underline">
          Open corporate notifications inbox
        </Link>
        <span className="text-slate-400"> · </span>
        <span className="text-slate-500">Full inbox and actions for corporate users</span>
      </p>
    </div>
  );
}
