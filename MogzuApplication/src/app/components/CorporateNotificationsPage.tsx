import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { SharedHeader } from './layouts/SharedHeader';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Search,
  Filter,
  Users,
  Megaphone,
  Briefcase,
  Layers,
  Gift,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  announcementAudienceLabel,
  resolveCorporateAnnouncementRecipients,
} from '@/lib/corporateAnnouncementBroadcast';
import {
  applyCorporateInboxFilters,
  DEFAULT_CORPORATE_INBOX_FILTERS,
  hasActiveCorporateInboxFilters,
  type CorporateInboxFilters,
  type InboxCategoryFilter,
  type InboxKindFilter,
  type InboxReadFilter,
} from '@/lib/corporateNotificationInboxFilters';
import { notifications as notificationsApi, userProfiles as userProfilesApi } from '@/lib/db';
import type { Notification as DbNotification, NotificationType, UserProfile, UserRole } from '@/lib/database.types';
import { subscribeToTable } from '@/lib/realtime';

type NotifKind = 'action' | 'shared';
type NotifStatus = 'pending' | 'read';

type DisplayNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotifKind;
  status: NotifStatus;
  icon: ReactNode;
  avatar?: string;
  linkUrl: string | null;
  rawType: NotificationType | null;
};

const ACTION_TYPES: NotificationType[] = [
  'approval_required',
  'payment_failed',
  'refund_failed',
  'gift_pending_approval',
];

const ICON_FOR_TYPE: Record<NotificationType, ReactNode> = {
  support_reply: <Send className="w-5 h-5 text-blue-500" />,
  approval_required: <AlertCircle className="w-5 h-5 text-amber-500" />,
  approval_decided: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  payment_received: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  payment_failed: <AlertCircle className="w-5 h-5 text-rose-500" />,
  refund_initiated: <Clock className="w-5 h-5 text-amber-500" />,
  refund_failed: <AlertCircle className="w-5 h-5 text-rose-500" />,
  booking_confirmed: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  booking_cancelled: <AlertCircle className="w-5 h-5 text-rose-500" />,
  reminder_24h: <Clock className="w-5 h-5 text-blue-500" />,
  gift_received: <Gift className="w-5 h-5 text-emerald-500" />,
  gift_pending_approval: <Gift className="w-5 h-5 text-amber-500" />,
  system: <Megaphone className="w-5 h-5 text-blue-500" />,
};

function fmtRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'Just now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapDbNotification(n: DbNotification): DisplayNotification {
  const t = (n.type ?? null) as NotificationType | null;
  return {
    id: n.id,
    title: n.title ?? 'Notification',
    message: n.body ?? '',
    date: fmtRelative(n.created_at),
    type: t && ACTION_TYPES.includes(t) ? 'action' : 'shared',
    status: n.is_read ? 'read' : 'pending',
    icon: t ? ICON_FOR_TYPE[t] : <Bell className="w-5 h-5 text-slate-500" />,
    linkUrl: n.link_url ?? null,
    rawType: t,
  };
}

const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  l1_employee: 'Employee',
  l2_manager: 'Manager',
  l3_admin: 'Admin',
  mogzu_admin: 'Mogzu admin',
};

type PublishMember = { id: string; name: string; role: string };

function mapProfileToMember(p: UserProfile): PublishMember {
  return {
    id: p.id,
    name: p.full_name?.trim() || p.phone || 'Team member',
    role: ROLE_LABELS[p.role] ?? p.role,
  };
}

const teamDepartments = [
  "All Company",
  "Engineering & Product",
  "Marketing & Sales",
  "Human Resources",
  "Finance",
  "Operations"
];

export default function CorporateNotificationsPage() {
  const navigate = useNavigate();
  const { profile, corporateId, role } = useAuth();
  const canPublish = role === 'l3_admin' || role === 'mogzu_admin';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tabs: 'inbox', 'publish'
  const [activeTab, setActiveTab] = useState<'inbox' | 'publish'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState('');
  const [showInboxFilters, setShowInboxFilters] = useState(false);
  const [inboxFilters, setInboxFilters] = useState<CorporateInboxFilters>(
    DEFAULT_CORPORATE_INBOX_FILTERS,
  );
  const [publishDraftNotice, setPublishDraftNotice] = useState('');
  const [corporateProfiles, setCorporateProfiles] = useState<UserProfile[]>([]);
  const [teamMembers, setTeamMembers] = useState<PublishMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const loadTimerRef = useRef<number | null>(null);

  // Publish Form State
  const [publishForm, setPublishForm] = useState({
    title: '',
    message: '',
    targetType: 'all', // 'all', 'team', 'members'
    selectedTeam: '',
    selectedMembers: [] as string[],
    priority: 'normal'
  });

  const loadNotifications = async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError('');
    const { data, error } = await notificationsApi.listByUser(profile.id, 100);
    if (error) {
      setLoadError(error.message);
      setIsLoading(false);
      return;
    }
    setNotifications(((data ?? []) as DbNotification[]).map(mapDbNotification));
    setIsLoading(false);
  };

  useEffect(() => {
    void loadNotifications();
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return
    return subscribeToTable<DbNotification>(`corporate-notifications-feed-${profile.id}`, {
      table: 'notifications',
      filter: `user_id=eq.${profile.id}`,
      onData: () => void loadNotifications(),
    })
  }, [profile?.id]);

  useEffect(() => {
    if (!canPublish && activeTab === 'publish') {
      setActiveTab('inbox');
    }
  }, [canPublish, activeTab]);

  useEffect(() => {
    if (!corporateId) {
      setTeamMembers([]);
      return;
    }
    setTeamMembersLoading(true);
    void userProfilesApi.listByCorporate(corporateId).then(({ data, error }) => {
      setTeamMembersLoading(false);
      if (error || !data?.length) {
        setCorporateProfiles([]);
        setTeamMembers([]);
        return;
      }
      const profiles = data as UserProfile[];
      setCorporateProfiles(profiles);
      setTeamMembers(profiles.map(mapProfileToMember));
    });
  }, [corporateId]);

  const teamOptions = useMemo(() => {
    const fromDb = corporateProfiles
      .map((p) => p.department?.trim())
      .filter((d): d is string => Boolean(d));
    const merged = new Set([
      ...teamDepartments.filter((d) => d !== 'All Company'),
      ...fromDb,
    ]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [corporateProfiles]);

  const filteredNotifications = useMemo(
    () => applyCorporateInboxFilters(notifications, inboxFilters, searchQuery),
    [notifications, inboxFilters, searchQuery],
  );

  const inboxFilterActive = hasActiveCorporateInboxFilters(inboxFilters);

  const setReadFilter = (read: InboxReadFilter) => {
    setInboxFilters((prev) => ({ ...prev, read }))
  }

  const setKindFilter = (kind: InboxKindFilter) => {
    setInboxFilters((prev) => ({ ...prev, kind }))
  }

  const setCategoryFilter = (category: InboxCategoryFilter) => {
    setInboxFilters((prev) => ({ ...prev, category }))
  }

  const clearInboxFilters = () => {
    setInboxFilters(DEFAULT_CORPORATE_INBOX_FILTERS)
    setSearchQuery('')
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === 'pending').length,
    [notifications]
  );
  const pendingApprovalsCount = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.status === 'pending' &&
          n.title.toLowerCase().includes('approval')
      ).length,
    [notifications]
  );
  const failedPaymentsCount = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.status === 'pending' &&
          (n.title.toLowerCase().includes('payment') || n.title.toLowerCase().includes('invoice'))
      ).length,
    [notifications]
  );

  useEffect(() => {
    localStorage.setItem('corporateUnreadNotifications', String(unreadCount));
    window.dispatchEvent(new Event('corporate-notifications-updated'));
  }, [unreadCount]);

  useEffect(() => {
    const statuses = notifications.reduce<Record<string, string>>((acc, n) => {
      acc[n.id] = n.status;
      return acc;
    }, {});
    localStorage.setItem('corporateNotificationStatuses', JSON.stringify(statuses));
    window.dispatchEvent(new Event('corporate-notifications-updated'));
  }, [notifications]);

  const handleNotificationAction = (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    if (!target) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, status: 'read' }
          : n
      )
    );
    void notificationsApi.markRead(notificationId);

    if (target.linkUrl) {
      navigate(target.linkUrl);
      return;
    }

    const normalizedTitle = target.title.toLowerCase();

    if (normalizedTitle.includes('approval') || normalizedTitle.includes('request approved') || normalizedTitle.includes('request rejected')) {
      navigate('/corporate/approvals');
      return;
    }
    if (normalizedTitle.includes('payment') || normalizedTitle.includes('invoice') || normalizedTitle.includes('refund')) {
      navigate('/corporate/transactions');
      return;
    }
    if (normalizedTitle.includes('policy')) {
      navigate('/company-settings');
      return;
    }
    if (normalizedTitle.includes('budget') || normalizedTitle.includes('spend limit')) {
      navigate('/corporate/budget');
      return;
    }
    if (
      normalizedTitle.includes('enquiry') ||
      normalizedTitle.includes('vendor responded') ||
      normalizedTitle.includes('vendor accepted') ||
      normalizedTitle.includes('vendor declined') ||
      normalizedTitle.includes('vendor withdrew') ||
      normalizedTitle.includes('listing')
    ) {
      navigate('/bookings');
      return;
    }
    if (normalizedTitle.includes('gifting') || normalizedTitle.includes('booking')) {
      navigate('/bookings');
      return;
    }
    navigate('/dashboard');
  };

  const handlePublishAnnouncement = () => {
    void (async () => {
      setPublishError('');
      setPublishSuccess('');
      setPublishDraftNotice('');

      if (!publishForm.title.trim()) {
        setPublishError('Announcement title is required.');
        return;
      }
      if (!publishForm.message.trim()) {
        setPublishError('Message content is required.');
        return;
      }
      if (publishForm.targetType === 'team' && !publishForm.selectedTeam) {
        setPublishError('Select a team for this announcement.');
        return;
      }
      if (publishForm.targetType === 'members' && publishForm.selectedMembers.length === 0) {
        setPublishError('Select at least one team member.');
        return;
      }
      if (!canPublish) {
        setPublishError('Only corporate admins (L3) can publish announcements.');
        return;
      }
      if (!corporateId) {
        setPublishError('Corporate account not loaded. Sign in again and retry.');
        return;
      }

      const recipientIds = resolveCorporateAnnouncementRecipients(
        corporateProfiles,
        profile?.id,
        publishForm,
      );

      if (recipientIds.length === 0) {
        setPublishError(
          publishForm.targetType === 'team'
            ? 'No active users matched that department. Set department on user profiles in Company Settings.'
            : 'No recipients matched this audience.',
        );
        return;
      }

      setPublishBusy(true);
      const senderLabel =
        profile?.full_name?.trim() || profile?.phone || 'Corporate admin';
      const audienceLabel = announcementAudienceLabel(publishForm);
      const body =
        publishForm.priority === 'high'
          ? `[High priority] ${publishForm.message.trim()}`
          : publishForm.message.trim();

      const { error } = await notificationsApi.broadcastSystem({
        title: publishForm.title.trim(),
        body,
        userIds: recipientIds,
        senderLabel,
        audienceLabel,
        linkUrl: '/corporate/notifications',
        forceEmail: publishForm.priority === 'high',
      });
      setPublishBusy(false);

      if (error) {
        setPublishError(error);
        return;
      }

      setPublishSuccess(
        `Announcement sent to ${recipientIds.length} teammate${recipientIds.length !== 1 ? 's' : ''}.`,
      );
      setPublishForm({
        title: '',
        message: '',
        targetType: 'all',
        selectedTeam: '',
        selectedMembers: [],
        priority: 'normal',
      });
      void loadNotifications();
    })();
  };

  const handleMarkAllRead = () => {
    if (!profile?.id) return;
    setNotifications((prev) =>
      prev.map((n) => (n.status === 'pending' ? { ...n, status: 'read' } : n)),
    );
    void notificationsApi.markAllRead(profile.id);
  };

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden font-['Inter']">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="corporate-notifications"
      />

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search notifications..." />

        <MogzuCorporateScrollSurface className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header & Tabs */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications Center</h1>
              <p className="text-sm text-slate-500 mt-1">Manage shared notifications, actionable requests, and broadcast messages to your teams.</p>
              
              <div className="flex items-center gap-4 mt-6 border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'inbox' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    My Inbox
                    <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{unreadCount}</span>
                  </div>
                </button>
                {canPublish ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('publish')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === 'publish'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Publish Announcement
                    </div>
                  </button>
                ) : null}
              </div>
            </div>

            {/* INBOX TAB */}
            {activeTab === 'inbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search notifications..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInboxFilters((v) => !v)}
                      aria-expanded={showInboxFilters}
                      className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        inboxFilterActive || showInboxFilters
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {inboxFilterActive ? (
                        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                          on
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {(showInboxFilters || inboxFilterActive) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Filter inbox
                        </p>
                        {inboxFilterActive ? (
                          <button
                            type="button"
                            onClick={clearInboxFilters}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ['all', 'All'],
                            ['unread', 'Unread'],
                            ['read', 'Read'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReadFilter(id)}
                            aria-pressed={inboxFilters.read === id}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              inboxFilters.read === id
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ['all', 'Any type'],
                            ['action', 'Action needed'],
                            ['shared', 'Updates'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setKindFilter(id)}
                            aria-pressed={inboxFilters.kind === id}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              inboxFilters.kind === id
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ['all', 'All topics'],
                            ['approvals', 'Approvals'],
                            ['payments', 'Payments'],
                            ['bookings', 'Bookings'],
                            ['gifting', 'Gifting'],
                            ['system', 'System'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setCategoryFilter(id)}
                            aria-pressed={inboxFilters.category === id}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              inboxFilters.category === id
                                ? 'border-violet-600 bg-violet-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Showing {filteredNotifications.length} of {notifications.length} notifications
                      </p>
                    </div>
                  )}

                  {/* Notification List */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {isLoading && (
                      <div className="p-4 text-sm text-slate-500">Loading notifications...</div>
                    )}

                    {!isLoading && loadError && (
                      <div className="p-4">
                        <p className="text-sm text-slate-700 mb-3">{loadError}</p>
                        <button
                          type="button"
                          onClick={loadNotifications}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {!isLoading && !loadError && filteredNotifications.length === 0 && (
                      <div className="p-6 text-center space-y-3">
                        <p className="text-sm text-slate-500">
                          {notifications.length === 0
                            ? 'No notifications yet.'
                            : 'No notifications match your filters.'}
                        </p>
                        {notifications.length > 0 && (inboxFilterActive || searchQuery.trim()) ? (
                          <button
                            type="button"
                            onClick={clearInboxFilters}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        ) : null}
                      </div>
                    )}

                    {!isLoading && !loadError && filteredNotifications.map(notification => (
                      <div key={notification.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${notification.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                        <div className="mt-1 flex-shrink-0">
                          {notification.avatar ? (
                            <img src={notification.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                              {notification.icon}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-semibold text-slate-900 truncate pr-4">{notification.title}</h3>
                            <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{notification.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{notification.message}</p>
                          
                          {notification.type === 'action' && notification.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleNotificationAction(notification.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                                className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                          {notification.type !== 'action' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleNotificationAction(notification.id)}
                                className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors"
                              >
                                Open
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Sidebar - Action Items Summary */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Action Items
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <span className="text-sm font-medium text-amber-800">Pending Approvals</span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {pendingApprovalsCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg">
                        <span className="text-sm font-medium text-rose-800">Failed Payments</span>
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {failedPaymentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PUBLISH TAB */}
            {activeTab === 'publish' && canPublish && (
              <div className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Create New Announcement</h2>
                <p className="mb-4 text-sm text-slate-500">
                  Recipients always receive an in-app notification. Email is queued when they have system emails enabled, or for all recipients when priority is High.
                </p>
                {publishError && (
                  <div className="mb-4 p-3 border border-slate-200 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{publishError}</p>
                  </div>
                )}
                {publishSuccess && (
                  <div className="mb-4 p-3 border border-slate-200 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{publishSuccess}</p>
                  </div>
                )}
                {publishDraftNotice && (
                  <div className="mb-4 p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-900">{publishDraftNotice}</p>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Announcement Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. New Policy Update"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm({...publishForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Content *</label>
                    <textarea 
                      rows={5}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                      value={publishForm.message}
                      onChange={(e) => setPublishForm({...publishForm, message: e.target.value})}
                    />
                  </div>

                  <div>
                    <label htmlFor="announcement-priority" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Priority
                    </label>
                    <select
                      id="announcement-priority"
                      value={publishForm.priority}
                      onChange={(e) =>
                        setPublishForm({
                          ...publishForm,
                          priority: e.target.value as 'normal' | 'high',
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="normal">Normal — in-app; email if recipient opted in</option>
                      <option value="high">High — in-app + email all recipients</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Who should receive this? *</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <button 
                        onClick={() => setPublishForm({...publishForm, targetType: 'all'})}
                        className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                          publishForm.targetType === 'all' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Megaphone className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">All Company</span>
                      </button>
                      <button 
                        onClick={() => setPublishForm({...publishForm, targetType: 'team'})}
                        className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                          publishForm.targetType === 'team' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Layers className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">Specific Team</span>
                      </button>
                      <button 
                        onClick={() => setPublishForm({...publishForm, targetType: 'members'})}
                        className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                          publishForm.targetType === 'members' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Users className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">Specific Members</span>
                      </button>
                    </div>

                    {/* Conditional Target Inputs */}
                    {publishForm.targetType === 'team' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-sm text-slate-600 mb-1.5">Select Department/Team</label>
                        <select 
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white appearance-none"
                          value={publishForm.selectedTeam}
                          onChange={(e) => setPublishForm({...publishForm, selectedTeam: e.target.value})}
                        >
                          <option value="">Choose a team...</option>
                          {teamOptions.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {publishForm.targetType === 'members' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-sm text-slate-600 mb-1.5">Select Members</label>
                        {teamMembersLoading ? (
                          <p className="text-sm text-slate-500 py-2">Loading team members…</p>
                        ) : teamMembers.length === 0 ? (
                          <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-200 p-4">
                            No corporate users found. Invite teammates from Company Settings, then return here to target announcements.
                          </p>
                        ) : null}
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                          {teamMembers.map(member => (
                            <label key={member.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={publishForm.selectedMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPublishForm(prev => ({...prev, selectedMembers: [...prev.selectedMembers, member.id]}));
                                  } else {
                                    setPublishForm(prev => ({...prev, selectedMembers: prev.selectedMembers.filter(id => id !== member.id)}));
                                  }
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPublishError('');
                        setPublishSuccess('');
                        setPublishDraftNotice('Draft saved. You can keep editing and publish when ready.');
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      disabled={publishBusy}
                      onClick={handlePublishAnnouncement}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {publishBusy ? 'Publishing…' : 'Publish Now'}
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
