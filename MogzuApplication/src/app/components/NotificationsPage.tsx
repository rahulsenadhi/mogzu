import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Bell, Check, Loader2, Settings } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscribeToTable } from '@/lib/realtime'
import type { Notification, NotificationType } from '@/lib/database.types'

const TYPE_LABEL: Record<NotificationType, string> = {
  booking_confirmed: 'Booking confirmed',
  booking_cancelled: 'Booking cancelled',
  approval_required: 'Approval required',
  approval_decided: 'Approval decided',
  payment_received: 'Payment received',
  payment_failed: 'Payment failed',
  refund_initiated: 'Refund initiated',
  refund_failed: 'Refund failed',
  reminder_24h: '24h reminder',
  gift_received: 'Gift received',
  gift_pending_approval: 'Gift pending approval',
  support_reply: 'Support reply',
  system: 'System',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await db.notifications.listByUser(profile.id, 100)
    setItems((data ?? []) as Notification[])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!profile) return
    return subscribeToTable<Notification>(`notifications-feed-${profile.id}`, {
      table: 'notifications',
      filter: `user_id=eq.${profile.id}`,
      onData: () => load(),
    })
  }, [profile, load])

  const filtered = filter === 'unread' ? items.filter((n) => !n.is_read) : items

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await db.notifications.markRead(n.id)
      load()
    }
    if (n.link_url) navigate(n.link_url)
  }

  const handleMarkAll = async () => {
    if (!profile) return
    await db.notifications.markAllRead(profile.id)
    load()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-3xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0e1e3f]">
                  <Bell className="size-5" />
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Booking updates, approvals, payments, refunds, and reminders.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/settings/notifications"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="size-4" />
                  Preferences
                </Link>
                {items.some((n) => !n.is_read) && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Check className="size-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 flex gap-2 border-b border-slate-200">
              {(['all', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                    filter === f
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f === 'all' ? `All (${items.length})` : `Unread (${items.filter((n) => !n.is_read).length})`}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-12 text-center text-sm text-slate-500">
                  No {filter === 'unread' ? 'unread ' : ''}notifications.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className={`block w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                          n.is_read ? '' : 'bg-blue-50/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.is_read && (
                            <span className="mt-2 inline-block size-2 shrink-0 rounded-full bg-[#2563eb]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-900">{n.title}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {TYPE_LABEL[n.type]}
                              </span>
                              {n.email_status === 'queued' && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                  Email queued
                                </span>
                              )}
                              {n.email_status === 'sent' && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                                  Email sent
                                </span>
                              )}
                            </div>
                            {n.body && (
                              <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                            )}
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatTime(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
