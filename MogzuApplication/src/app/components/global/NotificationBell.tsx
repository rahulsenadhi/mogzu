import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Bell, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscribeToTable } from '@/lib/realtime'
import type { Notification } from '@/lib/database.types'

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function NotificationBell() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    if (!profile) return
    const { data } = await db.notifications.listByUser(profile.id, 20)
    const list = (data ?? []) as Notification[]
    setItems(list)
    setUnread(list.filter((n) => !n.is_read).length)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  // Realtime
  useEffect(() => {
    if (!profile) return
    return subscribeToTable<Notification>(`notifications-${profile.id}`, {
      table: 'notifications',
      filter: `user_id=eq.${profile.id}`,
      onData: () => load(),
    })
  }, [profile, load])

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await db.notifications.markRead(n.id)
      load()
    }
    if (n.link_url) {
      setOpen(false)
      navigate(n.link_url)
    }
  }

  const handleMarkAll = async () => {
    if (!profile) return
    await db.notifications.markAllRead(profile.id)
    load()
  }

  if (!profile) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                >
                  <Check className="size-3" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-auto">
              {items.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">
                  No notifications yet.
                </p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className={`block w-full border-b border-slate-100 px-3 py-2 text-left transition hover:bg-slate-50 ${
                          n.is_read ? '' : 'bg-blue-50/40'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && (
                            <span className="mt-1 inline-block size-2 shrink-0 rounded-full bg-[#2563eb]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                                {n.body}
                              </p>
                            )}
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-slate-100 p-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/notifications')
                }}
                className="text-xs text-[#2563eb] hover:underline"
              >
                View all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
