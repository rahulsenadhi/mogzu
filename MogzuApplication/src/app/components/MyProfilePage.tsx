import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Download } from 'lucide-react';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isProfileEmpty, setIsProfileEmpty] = useState(false);
  const [profileTopTab, setProfileTopTab] = useState<'personal' | 'billing'>('personal');
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<'visa'>('visa');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: 'James',
    lastName: 'Brown',
    phone: '9876543210',
    department: 'Operations',
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
  const loadTimerRef = useRef<number | null>(null);

  const loadProfile = () => {
    setIsLoading(true);
    setLoadError('');

    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setLoadError('Unable to load profile right now. Please retry.');
        setIsLoading(false);
        return;
      }
      setIsProfileEmpty(false);
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    loadProfile();
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePersonal = () => {
    setSubmitError('');
    setSubmitSuccess('');
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setSubmitError('First name and last name are required.');
      return;
    }
    if (!/^\d{10}$/.test(profileForm.phone.trim())) {
      setSubmitError('Phone number must be 10 digits.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess('Personal profile updated successfully.');
    }, 700);
  };

  const handleChangePassword = () => {
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
    setTimeout(() => {
      setIsSubmitting(false);
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSubmitSuccess('Password changed successfully.');
    }, 700);
  };

  const handleSaveNotifications = () => {
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess('Notification preferences saved.');
    }, 700);
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
                      <div className="bg-white rounded-2xl p-8 border border-[#ececec] shadow-sm">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Standard</h2>
                            <div className="text-sm text-gray-600">
                              <span className="font-bold text-gray-900">₹10,201</span> <span>/ month</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <button
                              type="button"
                              className="text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                              Cancel subscription
                            </button>
                            <button
                              type="button"
                              className="text-sm font-medium text-[#2563eb] hover:underline"
                            >
                              Upgrade
                            </button>
                          </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
                          <div>
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Start date
                            </div>
                            <div className="mt-1 font-medium text-slate-900">25 July 2024</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Renewal date
                            </div>
                            <div className="mt-1 font-medium text-slate-900">25 August 2024</div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-[#2563eb]/20 bg-[#ebf1ff] px-5 py-3 flex items-start gap-3">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[11px] font-bold">
                            i
                          </div>
                          <p className="text-sm text-slate-700">
                            Your subscription will be automatically renewed for 1 month on 25 August 2024.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
                        <div className="bg-white rounded-2xl border border-[#ececec] shadow-sm overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-white">
                              <tr className="border-b border-[#ececec] text-xs text-slate-500">
                                <th className="text-left px-6 py-4 font-medium">Invoice ID</th>
                                <th className="text-left px-6 py-4 font-medium">Plan</th>
                                <th className="text-left px-6 py-4 font-medium">Amount</th>
                                <th className="text-left px-6 py-4 font-medium">Date</th>
                                <th className="text-right px-6 py-4 font-medium"> </th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { id: '12444632', plan: 'Standard', amount: '₹10,201', date: 'Jul 25, 2024' },
                                { id: '23446132', plan: 'Standard', amount: '₹10,201', date: 'Jun 25, 2024' },
                                { id: '21445463', plan: 'Standard', amount: '₹10,201', date: 'May 25, 2024' },
                                { id: '143534113', plan: 'Standard', amount: '₹10,201', date: 'Apr 25, 2024' },
                              ].map((row) => (
                                <tr key={row.id} className="border-b border-[#ececec] last:border-b-0">
                                  <td className="px-6 py-4 font-medium text-slate-800">{row.id}</td>
                                  <td className="px-6 py-4 text-slate-700">{row.plan}</td>
                                  <td className="px-6 py-4 text-slate-700">{row.amount}</td>
                                  <td className="px-6 py-4 text-slate-700">{row.date}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center rounded p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
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
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
                        <div className="bg-white rounded-2xl border border-[#ececec] shadow-sm overflow-hidden p-6">
                          <div className="rounded-xl border border-[#ececec] p-4">
                            <label className="flex items-center gap-4 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedPaymentMethodId === 'visa'}
                                onChange={() => setSelectedPaymentMethodId('visa')}
                                className="accent-[#2563eb]"
                              />
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-14 rounded border border-slate-200 flex items-center justify-center">
                                  <span className="text-xs font-bold text-[#2563eb]">VISA</span>
                                </div>
                                <div className="text-sm text-slate-600">
                                  <span className="font-medium text-slate-800">**** ****</span> 9272
                                </div>
                              </div>
                            </label>
                          </div>

                          <button
                            type="button"
                            className="mt-4 text-sm font-medium text-[#2563eb] hover:underline"
                          >
                            + New payment method
                          </button>
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
