import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Download } from 'lucide-react';
import LocalePickerCard from './LocalePickerCard';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { authActions } from '@/lib/authActions';
import type { NotificationType } from '@/lib/database.types';
import {
  getSubscriptionByCorporate,
  type SubscriptionWithPlan,
} from '@/lib/subscriptions';
import {
  listCorporateInvoices,
  getInvoicePdfSignedUrl,
  type InvoiceRunWithContract,
} from '@/lib/contracts';

type NotifKey = 'enquiryUpdates' | 'approvalUpdates' | 'paymentUpdates' | 'bookingReminders';

const NOTIF_GROUP: Record<NotifKey, NotificationType[]> = {
  enquiryUpdates: ['support_reply'],
  approvalUpdates: ['approval_required', 'approval_decided'],
  paymentUpdates: ['payment_received', 'payment_failed', 'refund_initiated', 'refund_failed'],
  bookingReminders: ['booking_confirmed', 'booking_cancelled', 'reminder_24h'],
};

const ALL_NOTIF_TYPES: NotificationType[] = [
  'support_reply',
  'approval_required',
  'approval_decided',
  'payment_received',
  'payment_failed',
  'refund_initiated',
  'refund_failed',
  'booking_confirmed',
  'booking_cancelled',
  'reminder_24h',
  'gift_received',
  'gift_pending_approval',
  'system',
];

function splitName(fullName: string | null | undefined): { firstName: string; lastName: string } {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { profile, corporateId, refreshProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isProfileEmpty, setIsProfileEmpty] = useState(false);
  const [profileTopTab, setProfileTopTab] = useState<'personal' | 'billing'>('personal');
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [invoiceRuns, setInvoiceRuns] = useState<InvoiceRunWithContract[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationForm, setNotificationForm] = useState({
    enquiryUpdates: true,
    approvalUpdates: true,
    paymentUpdates: true,
    bookingReminders: true,
  });

  const loadProfile = async () => {
    setIsLoading(true);
    setLoadError('');
    if (!profile) {
      setIsProfileEmpty(true);
      setIsLoading(false);
      return;
    }
    const { firstName, lastName } = splitName(profile.full_name);
    setProfileForm({
      firstName,
      lastName,
      phone: profile.phone ?? '',
      department: profile.department ?? '',
    });
    const { data: prefs, error: prefsErr } = await db.notificationPreferences.get(profile.id);
    if (prefsErr) {
      setLoadError(prefsErr.message);
      setIsLoading(false);
      return;
    }
    const inAppEnabled = (prefs?.in_app_enabled_types ?? ALL_NOTIF_TYPES) as NotificationType[];
    const isOn = (key: NotifKey) =>
      NOTIF_GROUP[key].some((t) => inAppEnabled.includes(t));
    setNotificationForm({
      enquiryUpdates: prefs ? isOn('enquiryUpdates') : true,
      approvalUpdates: prefs ? isOn('approvalUpdates') : true,
      paymentUpdates: prefs ? isOn('paymentUpdates') : true,
      bookingReminders: prefs ? isOn('bookingReminders') : true,
    });
    setIsProfileEmpty(false);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    if (profileTopTab !== 'billing' || !corporateId) return;
    let cancelled = false;
    (async () => {
      setBillingLoading(true);
      const [{ data: sub }, { data: runs }] = await Promise.all([
        getSubscriptionByCorporate(corporateId),
        listCorporateInvoices(corporateId),
      ]);
      if (cancelled) return;
      setSubscription(sub);
      setInvoiceRuns(runs);
      setBillingLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileTopTab, corporateId]);

  const openInvoicePdf = async (path: string | null) => {
    if (!path) return;
    const { url } = await getInvoicePdfSignedUrl(path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSavePersonal = async () => {
    setSubmitError('');
    setSubmitSuccess('');
    if (!profile) {
      setSubmitError('Not signed in.');
      return;
    }
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setSubmitError('First name and last name are required.');
      return;
    }
    if (!/^\d{10}$/.test(profileForm.phone.trim())) {
      setSubmitError('Phone number must be 10 digits.');
      return;
    }

    setIsSubmitting(true);
    const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`;
    const { error } = await db.userProfiles.upsert({
      ...profile,
      full_name: fullName,
      phone: profileForm.phone.trim(),
      department: profileForm.department.trim() || null,
    });
    setIsSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    await refreshProfile();
    setSubmitSuccess('Personal profile updated successfully.');
  };

  const handleChangePassword = async () => {
    setSubmitError('');
    setSubmitSuccess('');
    if (!securityForm.currentPassword.trim()) {
      setSubmitError('Current password is required.');
      return;
    }
    if (securityForm.newPassword.length < 8) {
      setSubmitError('New password must be at least 8 characters.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSubmitError('New password and confirm password do not match.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await authActions.updatePassword(securityForm.newPassword);
    setIsSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSubmitSuccess('Password changed successfully.');
  };

  const handleSaveNotifications = async () => {
    setSubmitError('');
    setSubmitSuccess('');
    if (!profile) {
      setSubmitError('Not signed in.');
      return;
    }
    setIsSubmitting(true);
    const enabledTypes = new Set<NotificationType>();
    (Object.keys(notificationForm) as NotifKey[]).forEach((key) => {
      if (notificationForm[key]) NOTIF_GROUP[key].forEach((t) => enabledTypes.add(t));
    });
    // Critical types always-on (gift / system) included implicitly
    enabledTypes.add('gift_received');
    enabledTypes.add('gift_pending_approval');
    enabledTypes.add('system');
    const typesArr = Array.from(enabledTypes);
    const { error } = await db.notificationPreferences.upsert({
      user_id: profile.id,
      in_app_enabled_types: typesArr,
      email_enabled_types: typesArr,
    });
    setIsSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitSuccess('Notification preferences saved.');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search profile settings..." />

        <MogzuCorporateScrollSurface>
          <div className="max-w-[1200px] mx-auto px-8 py-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[#2563eb] font-medium mb-6 hover:underline flex items-center gap-2"
            >
          &larr; Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl p-8 border border-[#ececec] shadow-sm">
              <h1 className="text-3xl font-bold text-[#0e1e3f] mb-2">My Profile</h1>
              <p className="text-slate-600 font-['Inter'] mb-6">
                Manage your personal information, security preferences, and notification settings.
              </p>

              <div className="mb-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setProfileTopTab('personal')}
                  className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                    profileTopTab === 'personal'
                      ? 'border-[#2563eb] bg-white text-[#2563eb] shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/company-settings')}
                  className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                    'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Company
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTopTab('billing')}
                  className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                    profileTopTab === 'billing'
                      ? 'border-[#2563eb] bg-white text-[#2563eb] shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Plans and billing
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-3 border border-[#ececec] rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-700">{submitError}</p>
                </div>
              )}
              {submitSuccess && (
                <div className="mb-4 p-3 border border-[#ececec] rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-700">{submitSuccess}</p>
                </div>
              )}

              {isLoading && (
                <div className="p-6 border border-[#ececec] rounded-xl bg-slate-50 text-sm text-slate-500">
                  Loading profile...
                </div>
              )}

              {!isLoading && loadError && (
                <div className="p-6 border border-[#ececec] rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-700 mb-3">{loadError}</p>
                  <button
                    type="button"
                    onClick={loadProfile}
                    className="px-4 py-2 border border-[#ececec] rounded-md text-sm text-slate-700 hover:bg-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !loadError && isProfileEmpty && (
                <div className="p-6 border border-[#ececec] rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-700 mb-3">No profile data found for this account.</p>
                  <button
                    onClick={() => setIsProfileEmpty(false)}
                    className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-sm hover:bg-[#1d4ed8] transition-colors"
                  >
                    Start profile setup
                  </button>
                </div>
              )}

              {!isLoading && !loadError && !isProfileEmpty && (
                <>
                  {profileTopTab === 'personal' && (
                    <>
                      <div className="flex items-center gap-6 border-b border-[#ececec] mb-6">
                        <button
                          onClick={() => setActiveTab('personal')}
                          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'personal'
                              ? 'border-[#2563eb] text-[#2563eb]'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Personal Info
                        </button>
                        <button
                          onClick={() => setActiveTab('security')}
                          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'security'
                              ? 'border-[#2563eb] text-[#2563eb]'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Security
                        </button>
                        <button
                          onClick={() => setActiveTab('notifications')}
                          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'notifications'
                              ? 'border-[#2563eb] text-[#2563eb]'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Notification Preferences
                        </button>
                      </div>

                      {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">First Name</label>
                            <input
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Last Name</label>
                            <input
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Phone</label>
                            <input
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Department</label>
                            <input
                              value={profileForm.department}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={handleSavePersonal}
                              disabled={isSubmitting}
                              className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                            >
                              {isSubmitting ? 'Saving...' : 'Save Personal Info'}
                            </button>
                          </div>
                          <div className="md:col-span-2">
                            <LocalePickerCard />
                          </div>
                        </div>
                      )}

                      {activeTab === 'security' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-slate-500 uppercase mb-1">Current Password</label>
                            <input
                              type="password"
                              value={securityForm.currentPassword}
                              onChange={(e) =>
                                setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                              }
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">New Password</label>
                            <input
                              type="password"
                              value={securityForm.newPassword}
                              onChange={(e) => setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              value={securityForm.confirmPassword}
                              onChange={(e) =>
                                setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                              }
                              className="w-full px-3 py-2 border border-[#ececec] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={handleChangePassword}
                              disabled={isSubmitting}
                              className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                            >
                              {isSubmitting ? 'Updating...' : 'Change Password'}
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'notifications' && (
                        <div className="space-y-4">
                          {[
                            { key: 'enquiryUpdates', label: 'Enquiry updates' },
                            { key: 'approvalUpdates', label: 'Approval updates' },
                            { key: 'paymentUpdates', label: 'Payment updates' },
                            { key: 'bookingReminders', label: 'Booking reminders' },
                          ].map((item) => (
                            <label
                              key={item.key}
                              className="flex items-center justify-between p-3 border border-[#ececec] rounded-lg"
                            >
                              <span className="text-sm text-slate-700">{item.label}</span>
                              <input
                                type="checkbox"
                                checked={notificationForm[item.key as keyof typeof notificationForm]}
                                onChange={(e) =>
                                  setNotificationForm((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-[#2563eb] rounded border-slate-300"
                              />
                            </label>
                          ))}
                          <button
                            onClick={handleSaveNotifications}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Preferences'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {profileTopTab === 'billing' && (
                    <div className="space-y-10">
                      {billingLoading ? (
                        <div className="p-6 border border-[#ececec] rounded-xl bg-slate-50 text-sm text-slate-500">
                          Loading billing…
                        </div>
                      ) : !subscription ? (
                        <div className="p-6 border border-[#ececec] rounded-xl bg-slate-50">
                          <p className="text-sm text-slate-700 mb-3">
                            No active subscription on this corporate. Contact sales or pick a plan.
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate('/account/billing')}
                            className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-sm hover:bg-[#1d4ed8] transition-colors"
                          >
                            View plans
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl p-8 border border-[#ececec] shadow-sm">
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {subscription.plan?.name ?? 'Plan'}
                              </h2>
                              <div className="text-sm text-gray-600">
                                <span className="font-bold text-gray-900">
                                  ₹
                                  {Math.round(
                                    (subscription.plan?.monthly_per_seat ?? 0) *
                                      (subscription.seat_count ?? 1),
                                  ).toLocaleString('en-IN')}
                                </span>{' '}
                                <span>
                                  / month · {subscription.seat_count} seat
                                  {subscription.seat_count === 1 ? '' : 's'}
                                </span>
                              </div>
                              <span
                                className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  subscription.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : subscription.status === 'past_due'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {subscription.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-8">
                              <button
                                type="button"
                                onClick={() => navigate('/account/billing')}
                                className="text-sm font-medium text-slate-600 hover:text-slate-800"
                              >
                                Manage seats
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate('/account/billing')}
                                className="text-sm font-medium text-[#2563eb] hover:underline"
                              >
                                Upgrade
                              </button>
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Period start
                              </div>
                              <div className="mt-1 font-medium text-slate-900">
                                {subscription.current_period_starts_on}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Renewal date
                              </div>
                              <div className="mt-1 font-medium text-slate-900">
                                {subscription.current_period_ends_on}
                              </div>
                            </div>
                          </div>

                          {subscription.dunning_attempts > 0 && (
                            <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-5 py-3">
                              <p className="text-sm font-bold text-rose-900">
                                Payment retries pending ({subscription.dunning_attempts}/4)
                              </p>
                              <p className="text-xs text-rose-800 mt-1">
                                {subscription.last_payment_error ?? 'Resolve via /account/billing.'}
                              </p>
                            </div>
                          )}

                          {subscription.status === 'active' &&
                            subscription.dunning_attempts === 0 && (
                              <div className="mt-6 rounded-lg border border-[#2563eb]/20 bg-[#ebf1ff] px-5 py-3 flex items-start gap-3">
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[11px] font-bold">
                                  i
                                </div>
                                <p className="text-sm text-slate-700">
                                  Auto-renews on {subscription.current_period_ends_on}.
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Billing history</h2>
                        <div className="bg-white rounded-2xl border border-[#ececec] shadow-sm overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-white">
                              <tr className="border-b border-[#ececec] text-xs text-slate-500">
                                <th className="text-left px-6 py-4 font-medium">Invoice</th>
                                <th className="text-left px-6 py-4 font-medium">Contract</th>
                                <th className="text-left px-6 py-4 font-medium">Period</th>
                                <th className="text-left px-6 py-4 font-medium">Amount</th>
                                <th className="text-left px-6 py-4 font-medium">Status</th>
                                <th className="text-right px-6 py-4 font-medium"> </th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceRuns.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-slate-400"
                                  >
                                    No invoices yet.
                                  </td>
                                </tr>
                              )}
                              {invoiceRuns.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-[#ececec] last:border-b-0"
                                >
                                  <td className="px-6 py-4 font-mono text-xs text-slate-800">
                                    {row.id.slice(0, 12)}
                                  </td>
                                  <td className="px-6 py-4 text-slate-700">
                                    {row.contract?.name ?? '—'}
                                  </td>
                                  <td className="px-6 py-4 text-slate-700">
                                    {row.period_starts_on} → {row.period_ends_on}
                                  </td>
                                  <td className="px-6 py-4 text-slate-700">
                                    ₹{Math.round(row.total).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                        row.status === 'paid'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : row.status === 'overdue'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {row.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      type="button"
                                      disabled={!row.pdf_storage_path}
                                      onClick={() => void openInvoicePdf(row.pdf_storage_path)}
                                      className="inline-flex items-center justify-center rounded p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-30"
                                      title={row.pdf_storage_path ? 'Download PDF' : 'No PDF yet'}
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment methods</h2>
                        <div className="bg-white rounded-2xl border border-[#ececec] shadow-sm p-6 text-sm text-slate-600">
                          Saved cards are managed at checkout via Razorpay. Wallet balance and
                          top-ups live on{' '}
                          <button
                            type="button"
                            onClick={() => navigate('/wallet')}
                            className="font-medium text-[#2563eb] hover:underline"
                          >
                            /wallet
                          </button>
                          .
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
