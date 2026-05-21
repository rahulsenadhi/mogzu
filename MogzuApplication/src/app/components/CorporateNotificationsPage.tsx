import { useEffect, useMemo, useRef, useState } from 'react';
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
  Layers
} from 'lucide-react';

const mockNotifications = [
  {
    id: 'n1',
    title: 'Booking Approval Required',
    message: 'Sarah Jenkins requested approval for "Grand Hyatt Event Space". Needs approval by tomorrow.',
    date: '10 mins ago',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    avatar: 'https://images.unsplash.com/photo-1758691737605-69a0e78bd193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBmZW1hbGUlMjBkaXZlcnNlJTIwc21pbGluZyUyMGF2YXRhcnxlbnwxfHx8fDE3NzM3NTYyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'n2',
    title: 'New Team Policy Published',
    message: 'Corporate updated the "Q3 Remote Work & Co-working Reimbursement" policies.',
    date: '2 hours ago',
    type: 'shared',
    status: 'read',
    icon: <Megaphone className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'n3',
    title: 'Invoice Payment Failed',
    message: 'Transaction TRX-9975-3 failed. Please update the corporate payment method.',
    date: 'Yesterday',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n6',
    title: 'Payment Successful',
    message: 'Payment for booking BK-2024-0091 was successful. Receipt is ready for download.',
    date: '3 hours ago',
    type: 'shared',
    status: 'read',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'n7',
    title: 'Refund Initiated',
    message: 'Refund for cancelled booking BK-2024-0088 has been initiated and is under processing.',
    date: 'Oct 24, 2024',
    type: 'shared',
    status: 'pending',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n8',
    title: 'Refund Completed',
    message: 'Refund for booking BK-2024-0072 has been completed and credited to the original payment method.',
    date: 'Oct 23, 2024',
    type: 'shared',
    status: 'read',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'n9',
    title: 'Enquiry Submitted Successfully',
    message: 'Your enquiry for "Grand Hyatt Event Space" has been sent to the vendor.',
    date: 'Just now',
    type: 'shared',
    status: 'read',
    icon: <Send className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'n10',
    title: 'Vendor Responded with Best Offer',
    message: 'A best offer is available for enquiry ENQ-2201. Review and respond.',
    date: '20 mins ago',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n11',
    title: 'Vendor Accepted Offer',
    message: 'Your offer for enquiry ENQ-2198 has been accepted. Proceed to payment.',
    date: '1 hour ago',
    type: 'action',
    status: 'pending',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'n12',
    title: 'Vendor Declined Offer',
    message: 'Your offer for enquiry ENQ-2191 was declined. View alternatives.',
    date: 'Yesterday',
    type: 'shared',
    status: 'read',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n13',
    title: 'Enquiry Expired',
    message: 'Enquiry ENQ-2186 expired due to no vendor response in 24 hours.',
    date: 'Oct 24, 2024',
    type: 'shared',
    status: 'pending',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n14',
    title: 'Vendor Withdrew Listing',
    message: 'The listing for enquiry ENQ-2180 was withdrawn by the vendor.',
    date: 'Oct 24, 2024',
    type: 'shared',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n15',
    title: 'Personal Spend Limit at 80%',
    message: 'You have used 80% of your approved personal budget this quarter.',
    date: 'Today',
    type: 'shared',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n16',
    title: 'Personal Spend Limit Reached',
    message: 'You have reached 100% of your personal spend limit. New requests may require manager approval.',
    date: 'Today',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n17',
    title: 'Department Budget at 80%',
    message: 'Your department has consumed 80% of the allocated budget.',
    date: 'Today',
    type: 'shared',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n18',
    title: 'Department Budget Exhausted',
    message: 'Department budget is exhausted. New requests are blocked until reset or limit increase.',
    date: 'Today',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n19',
    title: 'Booking Confirmed',
    message: 'Your booking BK-2024-0091 is confirmed and vendor has been notified.',
    date: '2 hours ago',
    type: 'shared',
    status: 'read',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'n20',
    title: 'Booking Cancelled by Employee',
    message: 'Booking BK-2024-0088 was cancelled by the requester.',
    date: 'Yesterday',
    type: 'shared',
    status: 'read',
    icon: <AlertCircle className="w-5 h-5 text-slate-500" />,
  },
  {
    id: 'n21',
    title: 'Booking Cancelled by Vendor',
    message: 'Vendor cancelled booking BK-2024-0079. Please review alternatives.',
    date: 'Yesterday',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n22',
    title: 'Upcoming Booking Reminder',
    message: 'Reminder: Booking BK-2024-0091 starts in 24 hours.',
    date: 'Today',
    type: 'shared',
    status: 'pending',
    icon: <Clock className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'n23',
    title: 'Request Submitted for Approval',
    message: 'Your request for "Grand Hyatt Event Space" was submitted and is pending manager review.',
    date: '5 mins ago',
    type: 'shared',
    status: 'pending',
    icon: <Send className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'n24',
    title: 'Request Approved',
    message: 'Your approval request APR-4821 has been approved.',
    date: '1 hour ago',
    type: 'shared',
    status: 'read',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'n25',
    title: 'Request Rejected with Reason',
    message: 'APR-4814 was rejected: "Budget head exhausted for this month. Please revise and resubmit."',
    date: 'Yesterday',
    type: 'action',
    status: 'pending',
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    id: 'n26',
    title: 'Approval Deadline Approaching',
    message: 'Approval request APR-4826 is due in 2 hours. Review before escalation.',
    date: 'Just now',
    type: 'action',
    status: 'pending',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'n4',
    title: 'Mogzu System Update',
    date: 'Oct 24, 2024',
    message: 'The Activity Suite has new integrated empanelled vendors in your region.',
    type: 'shared',
    status: 'read',
    icon: <Bell className="w-5 h-5 text-slate-400" />,
  },
  {
    id: 'n5',
    title: 'Employee Gifting Order Shipped',
    message: 'Diwali Hampers (50x) have been dispatched to the Bangalore office.',
    date: 'Oct 23, 2024',
    type: 'shared',
    status: 'read',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  }
];

const teamDepartments = [
  "All Company",
  "Engineering & Product",
  "Marketing & Sales",
  "Human Resources",
  "Finance",
  "Operations"
];

const teamMembers = [
  { id: 'u1', name: 'Sarah Jenkins', role: 'Engineering Lead' },
  { id: 'u2', name: 'James Brown', role: 'Corporate Admin' },
  { id: 'u3', name: 'Priya Sharma', role: 'Marketing Director' },
  { id: 'u4', name: 'Michael Chen', role: 'Product Manager' },
  { id: 'u5', name: 'Emily Davis', role: 'HR Specialist' }
];

export default function CorporateNotificationsPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Tabs: 'inbox', 'publish'
  const [activeTab, setActiveTab] = useState<'inbox' | 'publish'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState('');
  const [inboxFilterNotice, setInboxFilterNotice] = useState('');
  const [publishDraftNotice, setPublishDraftNotice] = useState('');
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

  const loadNotifications = () => {
    setIsLoading(true);
    setLoadError('');

    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setLoadError('Unable to load notifications right now. Please retry.');
        setIsLoading(false);
        return;
      }

      try {
        const raw = localStorage.getItem('corporateNotificationStatuses');
        const parsed: Record<string, string> = raw ? JSON.parse(raw) : {};
        const hydrated = mockNotifications.map((n) => ({
          ...n,
          status: parsed[n.id] === 'read' ? 'read' : n.status,
        }));
        setNotifications(hydrated);
      } catch {
        setLoadError('Unable to load notifications right now. Please retry.');
      }
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    loadNotifications();
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter((n) =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

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

    setPublishSuccess('Announcement published successfully.');
    setPublishForm({
      title: '',
      message: '',
      targetType: 'all',
      selectedTeam: '',
      selectedMembers: [],
      priority: 'normal',
    });
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
                <button 
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
                      onClick={() =>
                        setInboxFilterNotice(
                          'Notification filters will be available in a future update. Use search to narrow the list for now.'
                        )
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((n) => (n.status === 'pending' ? { ...n, status: 'read' } : n))
                        )
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {inboxFilterNotice && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      {inboxFilterNotice}
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
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-500">No notifications found.</p>
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
            {activeTab === 'publish' && (
              <div className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Create New Announcement</h2>
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
                          {teamDepartments.filter(d => d !== "All Company").map((dept, idx) => (
                            <option key={idx} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {publishForm.targetType === 'members' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-sm text-slate-600 mb-1.5">Select Members</label>
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
                      onClick={handlePublishAnnouncement}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/20"
                    >
                      <Send className="w-4 h-4" />
                      Publish Now
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
