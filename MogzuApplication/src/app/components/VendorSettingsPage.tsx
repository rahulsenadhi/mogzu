import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Building2,
  CreditCard,
  Bell,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  listMethods,
  createMethod,
  removeMethod,
  setPrimary,
  maskAccount,
  PAYOUT_RAILS,
} from '@/lib/vendorPayouts'
import type {
  PayoutRail,
  VendorPayoutMethod,
} from '@/lib/vendorPayouts'
import type {
  NotificationPreference,
  NotificationType,
  Vendor,
} from '@/lib/database.types'

type Section = 'profile' | 'payouts' | 'notifications'

const NOTIF_LABELS: { key: NotificationType; label: string }[] = [
  { key: 'booking_confirmed', label: 'New bookings' },
  { key: 'booking_cancelled', label: 'Booking cancellations' },
  { key: 'approval_required', label: 'Approval requests' },
  { key: 'payment_received', label: 'Payment received' },
  { key: 'refund_initiated', label: 'Refunds initiated' },
  { key: 'support_reply', label: 'Support replies' },
  { key: 'reminder_24h', label: 'Booking reminders (24h)' },
]

const ALL_TYPES: NotificationType[] = NOTIF_LABELS.map((n) => n.key)

export default function VendorSettingsPage() {
  const { vendorId, profile } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('profile')

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    description: '',
    city: '',
    state: '',
    logo_url: '',
    gst_number: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileNotice, setProfileNotice] = useState('')
  const [profileError, setProfileError] = useState('')

  // Payout methods
  const [methods, setMethods] = useState<VendorPayoutMethod[]>([])
  const [methodsError, setMethodsError] = useState('')
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [newMethod, setNewMethod] = useState({
    currency: 'INR',
    rail: 'razorpay_x' as PayoutRail,
    account_holder: '',
    account_number: '',
    is_primary: false,
  })
  const [methodSaving, setMethodSaving] = useState(false)

  // Notification prefs
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null)
  const [notifEnabled, setNotifEnabled] = useState<Record<NotificationType, boolean>>(
    Object.fromEntries(ALL_TYPES.map((t) => [t, true])) as Record<NotificationType, boolean>,
  )
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifNotice, setNotifNotice] = useState('')
  const [notifError, setNotifError] = useState('')

  const load = useCallback(async () => {
    if (!vendorId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    const [vendorRes, methodsRes, prefsRes] = await Promise.all([
      db.vendors.getById(vendorId),
      listMethods(vendorId),
      profile ? db.notificationPreferences.get(profile.id) : Promise.resolve({ data: null, error: null }),
    ])
    if (vendorRes.error) {
      setLoadError(vendorRes.error.message)
      setLoading(false)
      return
    }
    const v = vendorRes.data as Vendor
    setVendor(v)
    setProfileForm({
      business_name: v.business_name ?? '',
      description: v.description ?? '',
      city: v.city ?? '',
      state: v.state ?? '',
      logo_url: v.logo_url ?? '',
      gst_number: v.gst_number ?? '',
    })
    setMethods(methodsRes.data)
    if (methodsRes.error) setMethodsError(methodsRes.error)
    if (prefsRes.data) {
      const p = prefsRes.data as NotificationPreference
      setPrefs(p)
      const inApp = (p.in_app_enabled_types ?? ALL_TYPES) as NotificationType[]
      setNotifEnabled(
        Object.fromEntries(ALL_TYPES.map((t) => [t, inApp.includes(t)])) as Record<NotificationType, boolean>,
      )
    }
    setLoading(false)
  }, [vendorId, profile])

  useEffect(() => {
    load()
  }, [load])

  const handleProfileSave = async () => {
    setProfileNotice('')
    setProfileError('')
    if (!vendorId) return
    if (!profileForm.business_name.trim()) {
      setProfileError('Business name is required.')
      return
    }
    setProfileSaving(true)
    const { error } = await db.vendors.updateProfile(vendorId, {
      business_name: profileForm.business_name.trim(),
      description: profileForm.description.trim() || null,
      city: profileForm.city.trim() || null,
      state: profileForm.state.trim() || null,
      logo_url: profileForm.logo_url.trim() || null,
      gst_number: profileForm.gst_number.trim() || null,
    })
    setProfileSaving(false)
    if (error) {
      setProfileError(error.message)
      return
    }
    setProfileNotice('Profile updated.')
    load()
  }

  const handleAddMethod = async () => {
    setMethodsError('')
    if (!vendorId) return
    if (!newMethod.account_holder.trim() || !newMethod.account_number.trim()) {
      setMethodsError('Account holder + account number required.')
      return
    }
    setMethodSaving(true)
    const { error } = await createMethod({
      vendor_id: vendorId,
      currency: newMethod.currency.toUpperCase(),
      rail: newMethod.rail,
      account_holder: newMethod.account_holder.trim(),
      account_number: newMethod.account_number.trim(),
      is_primary: newMethod.is_primary || methods.length === 0,
    })
    setMethodSaving(false)
    if (error) {
      setMethodsError(error)
      return
    }
    setNewMethod({
      currency: 'INR',
      rail: 'razorpay_x',
      account_holder: '',
      account_number: '',
      is_primary: false,
    })
    setShowAddMethod(false)
    load()
  }

  const handleSetPrimary = async (id: string) => {
    if (!vendorId) return
    const { error } = await setPrimary(vendorId, id)
    if (error) setMethodsError(error)
    else load()
  }

  const handleRemoveMethod = async (id: string) => {
    const { error } = await removeMethod(id)
    if (error) setMethodsError(error)
    else load()
  }

  const handleNotifSave = async () => {
    setNotifError('')
    setNotifNotice('')
    if (!profile) {
      setNotifError('Not signed in.')
      return
    }
    setNotifSaving(true)
    const enabled = ALL_TYPES.filter((t) => notifEnabled[t])
    // Always-on critical types
    const arr = Array.from(new Set([...enabled, 'gift_received', 'gift_pending_approval', 'system'])) as NotificationType[]
    const { error } = await db.notificationPreferences.upsert({
      user_id: profile.id,
      in_app_enabled_types: arr,
      email_enabled_types: arr,
    })
    setNotifSaving(false)
    if (error) {
      setNotifError(error.message)
      return
    }
    setNotifNotice('Notification preferences saved.')
  }

  return (
    <VendorAppShell title="Settings">
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Vendor settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your business profile, payout rails, and notification preferences.
        </p>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {([
            { key: 'profile', label: 'Business profile', Icon: Building2 },
            { key: 'payouts', label: 'Payouts', Icon: CreditCard },
            { key: 'notifications', label: 'Notifications', Icon: Bell },
          ] as { key: Section; label: string; Icon: typeof Building2 }[]).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                section === key
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : loadError ? (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {section === 'profile' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Business profile</h2>
                {profileNotice && (
                  <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {profileNotice}
                  </p>
                )}
                {profileError && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {profileError}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Business name" required>
                    <input
                      type="text"
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                  <Field label="GST number">
                    <input
                      type="text"
                      value={profileForm.gst_number}
                      onChange={(e) => setProfileForm({ ...profileForm, gst_number: e.target.value })}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                  <Field label="Logo URL" className="sm:col-span-2">
                    <input
                      type="url"
                      value={profileForm.logo_url}
                      onChange={(e) => setProfileForm({ ...profileForm, logo_url: e.target.value })}
                      placeholder="https://…"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                  <Field label="Description" className="sm:col-span-2">
                    <textarea
                      rows={4}
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      placeholder="Tell corporate buyers what you do best…"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    />
                  </Field>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Status: <span className="font-semibold">{vendor?.status ?? '—'}</span>
                    {vendor?.bank_account_verified && ' · Bank verified'}
                  </p>
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
                  >
                    {profileSaving && <Loader2 className="size-4 animate-spin" />}
                    Save profile
                  </button>
                </div>
              </div>
            )}

            {section === 'payouts' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Payout methods</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddMethod((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                  >
                    <Plus className="size-3.5" />
                    Add method
                  </button>
                </div>
                {methodsError && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {methodsError}
                  </p>
                )}

                {showAddMethod && (
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <Field label="Rail">
                      <select
                        value={newMethod.rail}
                        onChange={(e) => setNewMethod({ ...newMethod, rail: e.target.value as PayoutRail })}
                        className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                      >
                        {PAYOUT_RAILS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Currency">
                      <input
                        type="text"
                        value={newMethod.currency}
                        onChange={(e) => setNewMethod({ ...newMethod, currency: e.target.value.toUpperCase() })}
                        maxLength={3}
                        className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                      />
                    </Field>
                    <Field label="Account holder">
                      <input
                        type="text"
                        value={newMethod.account_holder}
                        onChange={(e) => setNewMethod({ ...newMethod, account_holder: e.target.value })}
                        className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                      />
                    </Field>
                    <Field label="Account number">
                      <input
                        type="text"
                        value={newMethod.account_number}
                        onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
                        className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                      />
                    </Field>
                    <label className="flex items-center gap-2 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={newMethod.is_primary}
                        onChange={(e) => setNewMethod({ ...newMethod, is_primary: e.target.checked })}
                      />
                      <span className="text-xs text-slate-700">Set as primary</span>
                    </label>
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMethod(false)}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMethod}
                        disabled={methodSaving}
                        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {methodSaving ? 'Saving…' : 'Save method'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {methods.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                      No payout methods yet. Add one to receive vendor payouts.
                    </p>
                  ) : (
                    methods.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{m.account_holder}</span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                              {m.rail}
                            </span>
                            <span className="text-[10px] text-slate-500">{m.currency}</span>
                            {m.is_primary && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                <Star className="size-3" />
                                Primary
                              </span>
                            )}
                            {m.verified_at && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="size-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-slate-500">{maskAccount(m.account_number)}</p>
                        </div>
                        <div className="flex gap-2">
                          {!m.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(m.id)}
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              Set primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMethod(m.id)}
                            className="text-rose-500 hover:text-rose-600"
                            title="Remove"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Notification preferences</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Critical alerts (gift received, system) are always on.
                </p>
                {notifNotice && (
                  <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {notifNotice}
                  </p>
                )}
                {notifError && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {notifError}
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  {NOTIF_LABELS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300"
                    >
                      <span className="text-sm text-slate-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={notifEnabled[key]}
                        onChange={(e) => setNotifEnabled({ ...notifEnabled, [key]: e.target.checked })}
                        className="size-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]/20"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNotifSave}
                    disabled={notifSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
                  >
                    {notifSaving && <Loader2 className="size-4 animate-spin" />}
                    Save preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </VendorAppShell>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}
