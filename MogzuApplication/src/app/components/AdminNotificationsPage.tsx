import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Bold,
  Italic,
  Loader2,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import { type SentNotificationRow } from '@/app/lib/adminNotificationsMock';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { CORP } from '@/app/lib/adminTheme';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

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
];

type ReceiverOption = { id: string; label: string; group: string };

export default function AdminNotificationsPage() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [receiver, setReceiver] = useState('');
  const [allClients, setAllClients] = useState(true);
  const [allVendors, setAllVendors] = useState(true);
  const [recent, setRecent] = useState<SentNotificationRow[]>([]);
  const [receivers, setReceivers] = useState<ReceiverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentHint, setSentHint] = useState(false);
  const [sendError, setSendError] = useState('');
  const [editorNotice, setEditorNotice] = useState('');

  const senderLabel = profile?.full_name?.trim() || 'Mogzu Admin';

  const load = useCallback(async () => {
    setLoading(true);
    const [profilesRes, recentRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, full_name, role, corporate_id, vendor_id, status')
        .eq('status', 'active')
        .order('full_name'),
      db.notifications.listRecentBroadcasts(20),
    ]);

    const options: ReceiverOption[] = []
    for (const p of profilesRes.data ?? []) {
      const name = p.full_name?.trim()
      if (!name) continue
      const group = p.vendor_id ? 'Vendor' : p.corporate_id ? 'Corporate' : 'Platform'
      options.push({ id: p.id, label: name, group })
    }
    setReceivers(options)

    if (recentRes.data.length === 0 && options.length === 0) {
      setUsingDemo(true)
      setRecent(DEMO_DATA_NOTIFICATIONS)
    } else {
      setUsingDemo(false)
      setRecent(recentRes.data.length > 0 ? recentRes.data : DEMO_DATA_NOTIFICATIONS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resolveRecipientIds = (): string[] => {
    if (receiver) return [receiver]
    const ids = new Set<string>()
    if (allClients) {
      receivers.filter((r) => r.group === 'Corporate').forEach((r) => ids.add(r.id))
    }
    if (allVendors) {
      receivers.filter((r) => r.group === 'Vendor').forEach((r) => ids.add(r.id))
    }
    return Array.from(ids)
  }

  const handleSend = async () => {
    setSendError('')
    const t = title.trim()
    const desc = description.trim()
    const audienceParts: string[] = []
    if (allClients) audienceParts.push('clients')
    if (allVendors) audienceParts.push('vendors')

    if (!t) {
      setSendError('Title is required before sending.')
      return
    }
    if (!desc) {
      setSendError('Description is required before sending.')
      return
    }
    if (!receiver && audienceParts.length === 0) {
      setSendError('Select a receiver or at least one audience group.')
      return
    }

    const recipientIds = resolveRecipientIds()
    const audienceLabel = receiver
      ? receivers.find((r) => r.id === receiver)?.label ?? 'Selected user'
      : audienceParts.join(' + ')

    if (usingDemo || recipientIds.length === 0) {
      const row: SentNotificationRow = {
        id: `sent-${Date.now()}`,
        title: t,
        meta: `Added by ${senderLabel} · ${audienceLabel} (demo)`,
        time: new Date().toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        initials: senderLabel
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      }
      setRecent((prev) => [row, ...prev])
      setTitle('')
      setDescription('')
      setSentHint(true)
      window.setTimeout(() => setSentHint(false), 4000)
      return
    }

    setSending(true)
    const { error } = await db.notifications.broadcastSystem({
      title: t,
      body: desc,
      userIds: recipientIds,
      senderLabel,
      audienceLabel,
    })
    setSending(false)
    if (error) {
      setSendError(error)
      return
    }
    setTitle('')
    setDescription('')
    setSentHint(true)
    window.setTimeout(() => setSentHint(false), 4000)
    await load()
  }

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
          Reach corporate clients and vendors — notifications appear in each user&apos;s in-app inbox.
        </p>
      </div>

      {usingDemo && import.meta.env.DEV && (
        <DevMockDataBanner message="No active user profiles in Supabase — send adds to demo list only." />
      )}

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
          <span className="text-xs font-medium text-slate-600">Select receiver (optional)</span>
          <select
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            disabled={loading}
            className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] disabled:opacity-60"
          >
            <option value="">Broadcast by audience below</option>
            {receivers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.group})
              </option>
            ))}
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
            Sent — added to recipient in-app notification inboxes.
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
            disabled={sending || loading}
            onClick={() => void handleSend()}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold" style={{ color: CORP.titleNavy }}>
            Recent shared notifications
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading…
          </div>
        ) : (
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
        )}
        {!loading && recent.length === 0 && (
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
