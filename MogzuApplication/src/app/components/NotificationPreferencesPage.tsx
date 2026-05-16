import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Lock, Loader2 } from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  CRITICAL_NOTIFICATION_TYPES,
  type NotificationType,
} from '@/lib/database.types'

const ALL_TYPES: NotificationType[] = [
  'booking_confirmed',
  'booking_cancelled',
  'approval_required',
  'approval_decided',
  'payment_received',
  'payment_failed',
  'refund_initiated',
  'refund_failed',
  'reminder_24h',
  'gift_received',
  'gift_pending_approval',
  'support_reply',
  'system',
]

const LABEL: Record<NotificationType, string> = {
  booking_confirmed: 'Booking confirmed',
  booking_cancelled: 'Booking cancelled',
  approval_required: 'Approval required',
  approval_decided: 'Approval decision (your request)',
  payment_received: 'Payment received',
  payment_failed: 'Payment failed',
  refund_initiated: 'Refund initiated',
  refund_failed: 'Refund failed',
  reminder_24h: '24h booking reminder',
  gift_received: 'Gift received',
  gift_pending_approval: 'Gift pending approval',
  support_reply: 'Support reply',
  system: 'System updates',
}

const DEFAULT_IN_APP: NotificationType[] = ALL_TYPES
const DEFAULT_EMAIL: NotificationType[] = [
  'booking_confirmed',
  'booking_cancelled',
  'approval_decided',
  'payment_failed',
  'refund_initiated',
  'refund_failed',
  'support_reply',
]

export default function NotificationPreferencesPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const [inApp, setInApp] = useState<Set<NotificationType>>(new Set(DEFAULT_IN_APP))
  const [email, setEmail] = useState<Set<NotificationType>>(new Set(DEFAULT_EMAIL))

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await db.notificationPreferences.get(profile.id)
    if (data) {
      setInApp(new Set(data.in_app_enabled_types ?? DEFAULT_IN_APP))
      setEmail(new Set(data.email_enabled_types ?? DEFAULT_EMAIL))
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  const criticalSet = useMemo(() => new Set(CRITICAL_NOTIFICATION_TYPES), [])

  const toggle = (
    channel: 'in_app' | 'email',
    type: NotificationType,
    next: boolean,
  ) => {
    if (criticalSet.has(type)) return
    if (channel === 'in_app') {
      setInApp((s) => {
        const r = new Set(s)
        next ? r.add(type) : r.delete(type)
        return r
      })
    } else {
      setEmail((s) => {
        const r = new Set(s)
        next ? r.add(type) : r.delete(type)
        return r
      })
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setNotice('')
    const inAppList = ALL_TYPES.filter((t) => inApp.has(t) || criticalSet.has(t))
    const emailList = ALL_TYPES.filter((t) => email.has(t) || criticalSet.has(t))
    const { error } = await db.notificationPreferences.upsert({
      user_id: profile.id,
      in_app_enabled_types: inAppList,
      email_enabled_types: emailList,
    })
    setSaving(false)
    setNotice(error ? `Save failed: ${error.message}` : 'Preferences saved.')
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

            <h1 className="text-2xl font-bold text-[#0e1e3f]">Notification preferences</h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose how Mogzu reaches you. Critical alerts (cancellations, payment failures,
              refunds, support) cannot be disabled.
            </p>

            {notice && (
              <p
                role="status"
                className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
              >
                {notice}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">Notification type</th>
                      <th className="px-4 py-3 text-center">In-app</th>
                      <th className="px-4 py-3 text-center">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_TYPES.map((t) => {
                      const locked = criticalSet.has(t)
                      return (
                        <tr key={t}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-medium text-slate-900">
                              {LABEL[t]}
                              {locked && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700"
                                  title="Critical — always enabled"
                                >
                                  <Lock className="size-3" />
                                  Required
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={locked || inApp.has(t)}
                              disabled={locked}
                              onChange={(e) => toggle('in_app', t, e.target.checked)}
                              className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={locked || email.has(t)}
                              disabled={locked}
                              onChange={(e) => toggle('email', t, e.target.checked)}
                              className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 disabled:opacity-60"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save preferences
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
              Email delivery uses Resend (backend wiring still pending). Until live, emails are
              queued and visible as the "Email queued" badge on the notification list.
            </p>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
