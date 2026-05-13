import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronDown, Filter, SlidersHorizontal, Plus, MoreVertical } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import svgPaths from '../../imports/svg-7oj4o74nfw';
import dashboardSvgPaths from '../../imports/svg-camfkj9vq4';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import imgAvatar1 from 'figma:asset/5c621f1539bd85478054d8d7af4ac0bac0a72fd1.png';
import imgEllipse978 from 'figma:asset/1866054134f6a3c57930f21f41a0c5955df9b3c2.png';
import imgEllipse3282 from 'figma:asset/6fe09f9e642fc50a138aed4a81002a7cb9813ed9.png';
import imgEllipse979 from 'figma:asset/e598c936515c3a0ae1f2e58a43ab24f7cb3e9dd1.png';
import imgEllipse980 from 'figma:asset/8afe8d9a226435fe3ef4a1aad7d4daf418dc8846.png';
import imgImage2742 from 'figma:asset/3343fab6d9b912e4151b80a43a23a01889ac749c.png';
import imgFrame26 from 'figma:asset/f89db83641bb906adb1604f260e8fe4b09ed6652.png';

const initialUsers = [
  { name: 'Kapil Dev', role: 'Software Engineer', group: 'Software team', email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgAvatar1 },
  { name: 'Kapil Dev', role: 'Associate',          group: 'Software team', email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgEllipse978 },
  { name: 'Kapil Dev', role: 'Software Engineer', group: 'Software team', email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgAvatar1 },
  { name: 'Kapil Dev', role: 'Designer',           group: 'Design team',   email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgEllipse979 },
  { name: 'Kapil Dev', role: 'Designer II',        group: 'Software team', email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgEllipse3282 },
  { name: 'Kapil Dev', role: 'Human Resource',     group: 'Management team', email: 'kapildev@mail.com', permissions: 'Full-permission', avatar: imgAvatar1 },
  { name: 'Kapil Dev', role: 'Associate',          group: 'Software team', email: 'kapildev@mail.com', permissions: 'Limited', avatar: imgEllipse980 },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400', path: '/dashboard' },
  { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800', path: '/activitysuite' },
  { id: 'bookings', label: 'Bookings', icon: 'paf72c00', path: '/bookings' },
  { id: 'favorites', label: 'Favorites', icon: 'p27070280', path: '/favourites' },
  { id: 'users', label: 'Users', icon: 'p29193540', path: '/user-management' },
  { id: 'notification', label: 'Notification', icon: 'p4e64800', path: '/corporate/notifications' },
  { id: 'communication', label: 'Communication', icon: 'p319d300', path: '/communication' },
  { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/report' },
  { id: 'transactions', label: 'Transactions', icon: 'p2683f80', path: '/corporate/transactions' },
  { id: 'settings', label: 'Settings', icon: 'pde1bb00', path: '/settings/workflow' },
];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState<'users' | 'vendors'>('users');
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [headerChecked, setHeaderChecked] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddUsersOpen, setIsAddUsersOpen] = useState(false);
  const [isAddSingleUserOpen, setIsAddSingleUserOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [manageGroupsActiveTab, setManageGroupsActiveTab] = useState('Software group');
  const [groupChangeUserIdx, setGroupChangeUserIdx] = useState<number | null>(null);
  const [manageGroupsError, setManageGroupsError] = useState('');
  const [manageGroupsDemoNotice, setManageGroupsDemoNotice] = useState('');

  const [listDemoNotice, setListDemoNotice] = useState('');
  const [paginationDemoNotice, setPaginationDemoNotice] = useState('');
  const [addUserDemoNotice, setAddUserDemoNotice] = useState('');

  const [addUserActiveTab, setAddUserActiveTab] = useState<'personal' | 'address' | 'permissions' | 'budget'>('personal');
  const [openActionIdx, setOpenActionIdx] = useState<number | null>(null);
  const [selectedUserProfileIdx, setSelectedUserProfileIdx] = useState<number | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'personal' | 'address' | 'permissions' | 'budget'>('personal');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Add Single User modal: connected form state + validation
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');
  const [isAddUserSubmitting, setIsAddUserSubmitting] = useState(false);
  const [addPersonalForm, setAddPersonalForm] = useState({
    name: 'Kapil Dev',
    email: '',
    contact: '',
  });
  const [addAddressForm, setAddAddressForm] = useState({
    streetAddress: '',
    city: '',
    zipPostalCode: '',
  });
  const [addBudget1Form, setAddBudget1Form] = useState({
    type: '',
    amount: '',
    startDate: '',
    endDate: '',
  });
  
  // Permissions Tab State
  const [permissionLevel, setPermissionLevel] = useState('editor');
  const [accessCategories, setAccessCategories] = useState<string[]>(['Order creation', 'See cart page', 'Get order emails']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userBudgetRole, setUserBudgetRole] = useState('manager');
  const [isApprover, setIsApprover] = useState(true);
  const [defaultApprovalLevel, setDefaultApprovalLevel] = useState('level1');

  const selectedNav = 'users';

  const AVAILABLE_CATEGORIES = [
    'Order creation',
    'See cart page',
    'Get order emails',
    'Financials',
    'Inventory',
    'Reporting',
    'Marketing',
    'Gifting',
    'Event Management',
    'Approvals'
  ];

  function handleAddCategory() {
    if (selectedCategory && !accessCategories.includes(selectedCategory)) {
      setAccessCategories([...accessCategories, selectedCategory]);
      setSelectedCategory('');
    }
  }

  function handleRemoveCategory(catToRemove: string) {
    setAccessCategories(accessCategories.filter(cat => cat !== catToRemove));
  }

  function handleClearAllCategories() {
    setAccessCategories([]);
  }

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const manageGroupsTabToGroupLabel = (tab: string) => {
    if (tab === 'Design Team') return 'Design team';
    if (tab === 'Management team') return 'Management team';
    return 'Software team';
  };

  // Profile modal: editable role/department + budget allocation (simple demo form).
  const [profilePersonalForm, setProfilePersonalForm] = useState<{ role: string; group: string }>({
    role: '',
    group: '',
  });
  const [profilePersonalError, setProfilePersonalError] = useState('');
  const [profilePersonalSuccess, setProfilePersonalSuccess] = useState('');
  const [isProfilePersonalSaving, setIsProfilePersonalSaving] = useState(false);

  type ProfileBudgetAllocation = {
    type: string;
    amount: string;
    startDate: string;
    endDate: string;
  };

  const [profileBudgetsByIdx, setProfileBudgetsByIdx] = useState<Record<number, ProfileBudgetAllocation[]>>(
    {},
  );
  const [profileBudgetForm, setProfileBudgetForm] = useState<ProfileBudgetAllocation>({
    type: '',
    amount: '',
    startDate: '',
    endDate: '',
  });
  const [profileBudgetError, setProfileBudgetError] = useState('');
  const [profileBudgetSuccess, setProfileBudgetSuccess] = useState('');
  const [isProfileBudgetSubmitting, setIsProfileBudgetSubmitting] = useState(false);

  useEffect(() => {
    if (selectedUserProfileIdx === null) return;
    const u = users[selectedUserProfileIdx];
    setProfilePersonalForm({ role: u.role, group: u.group });
  }, [selectedUserProfileIdx, users]);

  const handleAddSingleUserNext = () => {
    setAddUserError('');
    setAddUserSuccess('');
    if (isAddUserSubmitting) return;

    if (addUserActiveTab === 'personal') {
      if (!addPersonalForm.name.trim()) {
        setAddUserError('User name is required.');
        return;
      }
      if (!validateEmail(addPersonalForm.email)) {
        setAddUserError('Enter a valid email address.');
        return;
      }
      if (!/^\d{10}$/.test(addPersonalForm.contact.replace(/\D/g, ''))) {
        setAddUserError('Contact number must be 10 digits.');
        return;
      }
      setAddUserActiveTab('address');
      return;
    }

    if (addUserActiveTab === 'address') {
      if (!addAddressForm.streetAddress.trim()) {
        setAddUserError('Street address is required.');
        return;
      }
      if (!addAddressForm.city.trim()) {
        setAddUserError('City is required.');
        return;
      }
      if (!addAddressForm.zipPostalCode.trim()) {
        setAddUserError('Zip/Postal Code is required.');
        return;
      }
      setAddUserActiveTab('permissions');
      return;
    }

    if (addUserActiveTab === 'permissions') {
      if (!permissionLevel) {
        setAddUserError('Permission level is required.');
        return;
      }
      if (accessCategories.length === 0) {
        setAddUserError('Please select at least one access category.');
        return;
      }
      if (isApprover && !defaultApprovalLevel) {
        setAddUserError('Default approval level is required for approvers.');
        return;
      }
      setAddUserActiveTab('budget');
      return;
    }

    // budget step
    if (!addBudget1Form.type) {
      setAddUserError('Budget type is required.');
      return;
    }
    const amountNum = Number(addBudget1Form.amount);
    if (!amountNum || Number.isNaN(amountNum) || amountNum <= 0) {
      setAddUserError('Budget amount must be greater than 0.');
      return;
    }
    if (!addBudget1Form.startDate || !addBudget1Form.endDate) {
      setAddUserError('Start date and end date are required.');
      return;
    }

    setIsAddUserSubmitting(true);
    setAddUserError('');
    setTimeout(() => {
      setIsAddUserSubmitting(false);
      setAddUserSuccess('User added successfully.');
      setIsAddSingleUserOpen(false);
      setAddUserActiveTab('personal');
      setAddPersonalForm({ name: 'Kapil Dev', email: '', contact: '' });
      setAddAddressForm({ streetAddress: '', city: '', zipPostalCode: '' });
      setAddBudget1Form({ type: '', amount: '', startDate: '', endDate: '' });
      setAddUserError('');
    }, 700);
  };

  const handleSaveProfilePersonal = () => {
    setProfilePersonalError('');
    setProfilePersonalSuccess('');
    if (selectedUserProfileIdx === null) return;
    if (!profilePersonalForm.role.trim()) {
      setProfilePersonalError('Job title is required.');
      return;
    }
    if (!profilePersonalForm.group) {
      setProfilePersonalError('Department is required.');
      return;
    }

    if (isProfilePersonalSaving) return;
    setIsProfilePersonalSaving(true);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u, i) =>
          i === selectedUserProfileIdx ? { ...u, role: profilePersonalForm.role, group: profilePersonalForm.group } : u,
        ),
      );
      setIsProfilePersonalSaving(false);
      setProfilePersonalSuccess('Details saved successfully.');
    }, 600);
  };

  const handleSaveProfileBudget = () => {
    setProfileBudgetError('');
    setProfileBudgetSuccess('');
    if (selectedUserProfileIdx === null) return;
    if (!profileBudgetForm.type) {
      setProfileBudgetError('Budget type is required.');
      return;
    }

    const amountNum = Number(profileBudgetForm.amount);
    if (!amountNum || Number.isNaN(amountNum) || amountNum <= 0) {
      setProfileBudgetError('Budget amount must be greater than 0.');
      return;
    }

    if (!profileBudgetForm.startDate || !profileBudgetForm.endDate) {
      setProfileBudgetError('Start date and end date are required.');
      return;
    }

    if (isProfileBudgetSubmitting) return;
    setIsProfileBudgetSubmitting(true);
    setTimeout(() => {
      setProfileBudgetsByIdx((prev) => {
        const current = prev[selectedUserProfileIdx] || [];
        const next = [
          ...current,
          {
            type: profileBudgetForm.type,
            amount: profileBudgetForm.amount,
            startDate: profileBudgetForm.startDate,
            endDate: profileBudgetForm.endDate,
          },
        ];
        return { ...prev, [selectedUserProfileIdx]: next };
      });
      setIsProfileBudgetSubmitting(false);
      setProfileBudgetSuccess('Budget allocation saved.');
      setProfileBudgetForm({ type: '', amount: '', startDate: '', endDate: '' });
    }, 700);
  };

  function toggleRow(idx: number) {
    setCheckedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function toggleAll() {
    if (headerChecked) {
      setCheckedRows(new Set());
      setHeaderChecked(false);
    } else {
      setCheckedRows(new Set(users.map((_, i) => i)));
      setHeaderChecked(true);
    }
  }

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="users"
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search bookings, events, users..." />

        {/* ── PAGE CONTENT ── */}
        <MogzuCorporateScrollSurface className="px-8 py-8">
          {/* Title + Tabs row */}
          <div className="flex items-center gap-6 mb-2">
            <h1 className="font-['Montserrat'] font-bold text-[28px] text-gray-900 tracking-tight whitespace-nowrap">
              User Management
            </h1>
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/60 shadow-sm">
              {/* Users tab - active */}
              <button
                onClick={() => setActiveTab('users')}
                className={`relative h-10 px-6 rounded-full flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-white shadow-[0_2px_8px_rgba(37,99,235,0.12)] border border-blue-100'
                    : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                <div className="size-5 shrink-0 flex items-center justify-center">
                  <svg className="size-full" fill="none" viewBox="0 0 24 24">
                    <path d={(svgPaths as Record<string, string>)['p33a59d00']} fill={activeTab === 'users' ? '#2563eb' : '#64748b'} />
                  </svg>
                </div>
                <span className={`font-['Inter'] font-semibold text-[15px] ${activeTab === 'users' ? 'text-blue-700' : 'text-gray-500'}`}>
                  Users
                </span>
              </button>

              {/* Vendors tab */}
              <button
                onClick={() => setActiveTab('vendors')}
                className={`relative h-10 px-6 rounded-full flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'vendors' 
                    ? 'bg-white shadow-[0_2px_8px_rgba(37,99,235,0.12)] border border-blue-100' 
                    : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                <div className="size-5 shrink-0 flex items-center justify-center">
                  <svg className="size-full" fill="none" viewBox="0 0 24 24">
                    <path d={(svgPaths as Record<string, string>)['p1648cd00']} fill={activeTab === 'vendors' ? '#2563eb' : '#64748b'} />
                  </svg>
                </div>
                <span className={`font-['Inter'] font-semibold text-[15px] ${activeTab === 'vendors' ? 'text-blue-700' : 'text-gray-500'}`}>
                  Vendors
                </span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="font-['Inter'] text-[15px] text-gray-500 mb-8 max-w-2xl leading-relaxed">
            List of all the corporate employees, added by you. Manage their roles, permissions, and group allocations here.
          </p>

          {/* Search + Action buttons row */}
          <div className="flex items-center justify-between mb-6">
            {/* Search */}
            <div className="relative w-full max-w-[380px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-full text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm font-['Inter'] placeholder:text-gray-400"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {/* Manage groups */}
              <button
                onClick={() => setIsManageGroupsOpen(true)}
                className="h-11 px-6 rounded-full border border-gray-200 bg-white text-gray-700 whitespace-nowrap hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm font-['Inter'] font-semibold text-[14px]"
              >
                Manage Groups
              </button>
              {/* Add users */}
              <div className="relative">
                <button
                  onClick={() => setIsAddUsersOpen(!isAddUsersOpen)}
                  className="h-11 pl-5 pr-4 rounded-full bg-[#2563eb] text-white flex items-center gap-2 hover:bg-[#1d4ed8] hover:shadow-md transition-all shadow-sm font-['Inter'] font-semibold text-[14px]"
                >
                  <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  Add Users
                  <ChevronDown className={`w-[18px] h-[18px] ml-1 transition-transform duration-200 ${isAddUsersOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>
                {isAddUsersOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-1.5 z-20 font-['Inter']">
                    <button
                      type="button"
                      onClick={() => {
                        setListDemoNotice('Bulk upload (CSV) will be available in a future release. This screen is demo-only.');
                        setIsAddUsersOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-gray-700 text-[14px] transition-colors font-medium flex items-center gap-3"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Bulk Upload
                    </button>
                    <button 
                      onClick={() => {
                        setIsAddSingleUserOpen(true);
                        setIsAddUsersOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-gray-700 text-[14px] transition-colors font-medium flex items-center gap-3"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                      Add Single User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Total items + Filter/Sort row */}
          <div className="flex items-center justify-between mb-4 h-10">
            {checkedRows.size > 0 ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-['Inter'] font-semibold text-blue-700 bg-blue-50/80 px-3.5 py-1.5 rounded-full text-[13px] border border-blue-100">
                  {checkedRows.size} user{checkedRows.size !== 1 ? 's' : ''} selected
                </span>
                <div className="h-5 w-[1px] bg-gray-200 mx-1"></div>
                <button
                  onClick={() => {
                    if (checkedRows.size === 0) return;
                    const firstIdx = Array.from(checkedRows)[0];
                    setSelectedUserProfileIdx(firstIdx);
                    setProfileActiveTab('budget');
                  }}
                  className="h-9 px-5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-['Inter'] text-[13px] font-semibold text-gray-700 shadow-sm"
                >
                  Update Allocation
                </button>
                <button 
                  onClick={() => setIsRemoveModalOpen(true)}
                  className="h-9 px-5 rounded-full bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors font-['Inter'] text-[13px] font-semibold shadow-sm"
                >
                  Remove Users
                </button>
              </div>
            ) : (
              <p className="font-['Inter'] text-[14px] font-medium text-gray-500">
                <span className="text-gray-900 font-bold mr-1">520</span> total users
              </p>
            )}
            <div className="flex items-center gap-2.5 transition-opacity duration-300">
              {/* Filter */}
              <button
                type="button"
                onClick={() =>
                  setListDemoNotice('Filter controls will be available in a future release. This listing is demo-only.')
                }
                className="h-10 px-4 rounded-full border border-gray-200 bg-white flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all font-['Inter'] text-[14px] font-medium shadow-sm text-gray-700"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span>Filter</span>
              </button>
              {/* Sort by */}
              <button
                type="button"
                onClick={() =>
                  setListDemoNotice('Sort controls will be available in a future release. This listing is demo-only.')
                }
                className="h-10 px-4 rounded-full border border-gray-200 bg-white flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all font-['Inter'] text-[14px] font-medium shadow-sm text-gray-700"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span>Sort by</span>
              </button>
            </div>
          </div>

          {listDemoNotice && (
            <p className="font-['Inter'] text-[13px] text-gray-600 mb-3" role="status">
              {listDemoNotice}
            </p>
          )}

          {/* ── TABLE ── */}
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden mb-6 border border-gray-200">
            {/* Table Header */}
            <div className="grid items-center border-b border-gray-200 bg-gray-50/50 px-6 py-3.5"
              style={{ gridTemplateColumns: '32px 48px 1fr 160px 180px 240px 160px 48px' }}>
              {/* Header checkbox */}
              <button onClick={toggleAll} className="flex items-center justify-center cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${headerChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                  {headerChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
              <div />
              {/* User name */}
              <div className="flex items-center gap-2 pl-2">
                <span className="font-['Inter'] font-semibold text-[13px] text-gray-500 uppercase tracking-wider">User</span>
              </div>
              {/* Roles */}
              <div className="flex items-center gap-1.5 cursor-pointer group">
                <span className="font-['Inter'] font-semibold text-[13px] text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">Role</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>
              {/* Group */}
              <div className="flex items-center gap-1.5 cursor-pointer group">
                <span className="font-['Inter'] font-semibold text-[13px] text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">Group</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>
              {/* Email ID */}
              <div className="flex items-center gap-1.5 cursor-pointer group">
                <span className="font-['Inter'] font-semibold text-[13px] text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">Email</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>
              {/* Permissions */}
              <div className="flex items-center gap-1.5 cursor-pointer group">
                <span className="font-['Inter'] font-semibold text-[13px] text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">Permissions</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>
              <div />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {users.map((user, idx) => (
                <div key={idx}
                  className={`grid items-center px-6 py-3.5 transition-all duration-200 ${checkedRows.has(idx) ? 'bg-blue-50/40' : 'hover:bg-gray-50/80 bg-white'}`}
                  style={{ gridTemplateColumns: '32px 48px 1fr 160px 180px 240px 160px 48px' }}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleRow(idx)} className="flex items-center justify-center cursor-pointer">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkedRows.has(idx) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                      {checkedRows.has(idx) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0 shadow-sm">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Name */}
                  <span className="font-['Inter'] font-semibold text-[14px] text-gray-900 pl-2 truncate">
                    {user.name}
                  </span>

                  {/* Role */}
                  <span className="font-['Inter'] text-[14px] text-gray-600 truncate">
                    {user.role}
                  </span>

                  {/* Group */}
                  <div className="flex items-center">
                    <span className="font-['Inter'] text-[13px] font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 truncate max-w-full">
                      {user.group}
                    </span>
                  </div>

                  {/* Email */}
                  <span className="font-['Inter'] text-[14px] text-gray-500 truncate">
                    {user.email}
                  </span>

                  {/* Permissions */}
                  <div className="flex items-center">
                    <span className={`font-['Inter'] text-[12px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
                      user.permissions.toLowerCase().includes('full') 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {user.permissions}
                    </span>
                  </div>

                  {/* 3-dot action */}
                  <div className="relative flex justify-end pr-2">
                    <button 
                      onClick={() => setOpenActionIdx(openActionIdx === idx ? null : idx)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${openActionIdx === idx ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openActionIdx === idx && (
                      <div className="absolute right-0 top-[calc(100%+4px)] w-[220px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-1.5 z-20 font-['Inter']">
                        <button 
                          onClick={() => {
                            setSelectedUserProfileIdx(idx);
                            setOpenActionIdx(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-[14px] transition-colors font-medium"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserProfileIdx(idx);
                            setProfileActiveTab('personal');
                            setOpenActionIdx(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-[14px] transition-colors font-medium"
                        >
                          Edit Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserProfileIdx(idx);
                            setProfileActiveTab('budget');
                            setOpenActionIdx(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-[14px] transition-colors font-medium"
                        >
                          Add Budget Allocation
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserProfileIdx(null);
                            setGroupChangeUserIdx(idx);
                            setManageGroupsError('');
                            setIsManageGroupsOpen(true);
                            setOpenActionIdx(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-[14px] transition-colors font-medium"
                        >
                          Change Group
                        </button>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <button
                          onClick={() => {
                            setCheckedRows(new Set([idx]));
                            setHeaderChecked(false);
                            setSelectedUserProfileIdx(null);
                            setGroupChangeUserIdx(null);
                            setIsRemoveModalOpen(true);
                            setOpenActionIdx(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-[14px] transition-colors font-medium"
                        >
                          Remove User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PAGINATION ── */}
          <div className="flex flex-col gap-3 pt-4 pb-8 border-t border-gray-200/60 mt-6">
            {paginationDemoNotice && (
              <p className="font-['Inter'] text-[13px] text-gray-600 text-center" role="status">
                {paginationDemoNotice}
              </p>
            )}
            <div className="flex items-center justify-between">
            {/* Previous */}
            <button
              type="button"
              onClick={() =>
                setPaginationDemoNotice('Pagination is demo-only on this screen; the table shows a sample slice.')
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-['Inter'] text-[14px] font-medium border border-transparent hover:border-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 8, 9, 10].map((page, i) => (
                <button
                  key={i}
                  disabled={page === '...'}
                  type="button"
                  onClick={() => {
                    if (page === '...') return;
                    setPaginationDemoNotice(`Page ${page} is not wired in this demo; navigation will be added with real data.`);
                  }}
                  className={`min-w-[36px] h-[36px] px-2 rounded-lg flex items-center justify-center transition-all font-['Inter'] text-[14px] ${
                    page === 1
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : page === '...'
                      ? 'cursor-default text-gray-400 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 font-semibold border border-transparent hover:border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() =>
                setPaginationDemoNotice('Pagination is demo-only on this screen; the table shows a sample slice.')
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-['Inter'] text-[14px] font-medium border border-transparent hover:border-gray-200"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Remove Confirmation Modal */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2 font-sans">
              Remove User{checkedRows.size !== 1 ? 's' : ''}
            </h3>
            <p className="text-slate-600 mb-6 font-sans">
              Are you sure you want to remove the selected {checkedRows.size} user{checkedRows.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button 
                onClick={() => setIsRemoveModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const remaining = users
                    .map((u, i) => ({ u, i }))
                    .filter(({ i }) => !checkedRows.has(i));

                  setProfileBudgetsByIdx((prev) => {
                    const next: Record<number, ProfileBudgetAllocation[]> = {};
                    let newIdx = 0;
                    for (const { i } of remaining) {
                      if (prev[i] && prev[i].length > 0) next[newIdx] = prev[i];
                      newIdx += 1;
                    }
                    return next;
                  });

                  setUsers(remaining.map(({ u }) => u));
                  setIsRemoveModalOpen(false);
                  setCheckedRows(new Set());
                  setHeaderChecked(false);
                  setSelectedUserProfileIdx(null);
                  setGroupChangeUserIdx(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors font-sans"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Groups Modal */}
      {isManageGroupsOpen && (
        <div className="fixed inset-0 z-50 flex bg-white animate-in fade-in duration-200 font-sans">
          <div className="w-full h-full flex flex-col relative overflow-hidden">
            
            {/* Header Area */}
            <div className="w-full relative shrink-0">
              {/* Full width gray background */}
              <div className="absolute top-0 left-0 w-full h-[64px] bg-[#f6f6f8]/80 pointer-events-none -z-10" />
              
              {/* Centered Content Container */}
              <div className="w-full max-w-[1119px] mx-auto relative h-[240px]">
                <div className="absolute top-[16px] left-[62px] right-[60px] flex justify-between items-start z-10">
                  <h2 className="text-[22px] font-medium text-[#0e1e3f] leading-[32px] m-0">Manage groups</h2>
                  <button onClick={() => setIsManageGroupsOpen(false)} className="text-black hover:bg-slate-100 p-1 rounded-full transition-colors mt-[4px] mr-[-4px]">
                    <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="absolute left-[61px] top-[109px] text-[18px] text-[#475569] leading-[24px] m-0">
                  Add and manage teammates for better work efficiency
                </p>

                <button
                  onClick={() => setManageGroupsError('Group creation is not available in this demo.')}
                  className="absolute left-[803px] top-[96px] w-[256px] h-[50px] bg-[#2563eb] rounded-[60px] flex items-center justify-center gap-[8px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] hover:bg-[#1d4ed8] transition-colors"
                >
                  <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" className="text-white" />
                  </svg>
                  <span className="text-[18px] font-medium text-white">Create a group</span>
                </button>
                
                {/* Tabs */}
                <div className="absolute left-[62px] top-[189px] flex gap-[43px] text-[20px] font-medium leading-[28px] w-full">
                  <button 
                    onClick={() => setManageGroupsActiveTab('Software group')}
                    className={`${manageGroupsActiveTab === 'Software group' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative text-left transition-colors whitespace-nowrap`}
                  >
                    Software group
                    {manageGroupsActiveTab === 'Software group' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setManageGroupsActiveTab('Software group 2')}
                    className={`${manageGroupsActiveTab === 'Software group 2' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative text-left transition-colors whitespace-nowrap`}
                  >
                    Software group 2
                    {manageGroupsActiveTab === 'Software group 2' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setManageGroupsActiveTab('Design Team')}
                    className={`${manageGroupsActiveTab === 'Design Team' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative text-left transition-colors whitespace-nowrap`}
                  >
                    Design Team
                    {manageGroupsActiveTab === 'Design Team' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setManageGroupsActiveTab('Management team')}
                    className={`${manageGroupsActiveTab === 'Management team' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative text-left transition-colors whitespace-nowrap`}
                  >
                    Management team
                    {manageGroupsActiveTab === 'Management team' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                </div>
                
                <div className="absolute left-[62px] top-[224px] w-[999px] h-[1px] bg-[#878e9e] opacity-[0.36]" />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 w-full overflow-y-auto pb-[130px]">
              <div className="w-full max-w-[1119px] mx-auto relative h-full">
                
                {/* Search & Add User Row */}
                <div className="absolute left-[61px] top-[30px] flex items-center justify-between w-[1004px]">
                  <div className="w-[437px] h-[42px] bg-white rounded-[6px] border border-[#dde2e4] flex items-center px-[12px] relative focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                    <svg className="w-[24px] h-[24px] text-[#959595] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" placeholder="Search" className="w-full bg-transparent border-none text-[14px] text-[#0e1e3f] placeholder-[#959595] focus:outline-none leading-[24px] ml-[6px]" />
                  </div>

                  <div className="flex items-center gap-[20px]">
                    <button
                      onClick={() => {
                        if (groupChangeUserIdx === null) {
                          setManageGroupsError('Select a user to change group.');
                          return;
                        }
                        setManageGroupsError('');
                        const targetGroup = manageGroupsTabToGroupLabel(manageGroupsActiveTab);
                        setUsers((prev) =>
                          prev.map((u, i) => (i === groupChangeUserIdx ? { ...u, group: targetGroup } : u)),
                        );
                        setIsManageGroupsOpen(false);
                        setSelectedUserProfileIdx(groupChangeUserIdx);
                        setProfileActiveTab('personal');
                        setGroupChangeUserIdx(null);
                      }}
                      className="w-[264px] h-[50px] bg-[#2563eb] rounded-[60px] flex items-center justify-center gap-[8px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] hover:bg-[#1d4ed8] transition-colors"
                    >
                      <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" className="text-white" />
                      </svg>
                      <span className="text-[18px] font-medium text-white">Add user to this group</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setManageGroupsDemoNotice('More actions for group management will be available in a future release.')
                      }
                      className="text-[#878e9e] hover:text-slate-700 p-1"
                    >
                      <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="absolute left-[61px] top-[90px] text-[14px] text-[#878e9e] leading-[normal]">20 total users</div>

                {manageGroupsDemoNotice && (
                  <div className="absolute left-[61px] top-[112px] text-[14px] text-[#475569] font-medium max-w-[640px] leading-snug">
                    {manageGroupsDemoNotice}
                  </div>
                )}

                {manageGroupsError && (
                  <div className="absolute left-[61px] top-[60px] text-[14px] text-[#dc2626] font-medium">
                    {manageGroupsError}
                  </div>
                )}

                {/* Table Container */}
                <div className="absolute left-[57px] top-[125px] w-[1004px] bg-white rounded-[8px] shadow-[0px_2.717px_6.792px_0px_rgba(0,0,0,0.1)] pb-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-[300px_300px_1fr] px-[60px] pt-[25px] pb-[15px] border-b border-[#e3e3e5]/80 text-[16px] text-[#475569]">
                    <div className="flex items-center gap-[6px] cursor-pointer hover:text-slate-800">
                      User name
                      <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 14">
                        <path d="M4.0835 8.75L7.00016 11.6667L9.91683 8.75" fill="#D2D2D2" />
                        <path d="M4.0835 5.25L7.00016 2.33333L9.91683 5.25" fill="#6C6C6C" />
                      </svg>
                    </div>
                    <div>Roles</div>
                    <div className="flex items-center gap-[6px] cursor-pointer hover:text-slate-800">
                      Permission level
                      <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 14 14">
                        <path d="M4.0835 8.75L7.00016 11.6667L9.91683 8.75" fill="#D2D2D2" />
                        <path d="M4.0835 5.25L7.00016 2.33333L9.91683 5.25" fill="#6C6C6C" />
                      </svg>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="flex flex-col relative">
                    {/* Vertical Divider Lines */}
                    <div className="absolute left-[302px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#d3d3d3] via-[#d3d3d3]/90 to-transparent" />
                    <div className="absolute left-[590px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#d3d3d3] via-[#d3d3d3]/90 to-transparent" />

                    {/* Scrollbar Track (Visual) */}
                    <div className="absolute right-[16px] top-[16px] bottom-[16px] w-[3px] bg-black/20 rounded-full" />

                    {users
                      .map((user, globalIdx) => ({ user, globalIdx }))
                      .filter(({ user }) => user.group === manageGroupsTabToGroupLabel(manageGroupsActiveTab))
                      .map(({ user, globalIdx }) => (
                      <div key={globalIdx} className="grid grid-cols-[300px_300px_200px_1fr] items-center px-[60px] py-[25px] border-b border-[#e3e3e5]/80 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-[14px]">
                          <img src={user.avatar} alt={user.name} className="w-[32px] h-[32px] rounded-full object-cover border border-[#c8c8c8]" />
                          <span className="text-[18px] text-[#0e1e3f] leading-[24px]">{user.name}</span>
                        </div>
                        <div className="text-[18px] text-[#0e1e3f] leading-[24px]">{user.role}</div>
                        <div className="text-[18px] text-[#0e1e3f] leading-[24px]">{user.permissions}</div>
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setCheckedRows(new Set([globalIdx]));
                              setHeaderChecked(false);
                              setGroupChangeUserIdx(null);
                              setSelectedUserProfileIdx(null);
                              setIsManageGroupsOpen(false);
                              setIsRemoveModalOpen(true);
                            }}
                            className="h-[42px] px-[24px] bg-white rounded-[60px] border border-[#f73d31] text-[#f73d31] flex items-center justify-center gap-[8px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-[18px] font-medium whitespace-nowrap">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full h-[106px] bg-white shadow-[0px_-3px_11px_0px_rgba(0,0,0,0.11)] flex items-center justify-center gap-[12px] z-20">
              <button 
                onClick={() => setIsManageGroupsOpen(false)}
                className="w-[264px] h-[50px] rounded-[60px] border border-[#2563eb] text-[#2563eb] font-medium hover:bg-blue-50 transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsManageGroupsOpen(false)}
                className="w-[264px] h-[50px] rounded-[60px] bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]"
              >
                Add user
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddSingleUserOpen && (
        <div className="fixed inset-0 z-50 flex bg-white animate-in fade-in duration-200 font-sans">
          <div className="w-full h-full flex flex-col relative overflow-hidden">
            
            {/* Header Area */}
            <div className="w-full relative shrink-0">
              {/* Full width gray background */}
              <div className="absolute top-0 left-0 w-full h-[64px] bg-[#f6f6f8]/80 pointer-events-none -z-10" />
              
              {/* Centered Content Container */}
              <div className="w-full max-w-[1119px] mx-auto relative h-[170px]">
                <div className="absolute top-[16px] left-[62px] right-[60px] flex justify-between items-start z-10">
                  <h2 className="text-[22px] font-medium text-[#0e1e3f] leading-[32px] m-0">Adding a User</h2>
                  <button onClick={() => setIsAddSingleUserOpen(false)} className="text-black hover:bg-slate-100 p-1 rounded-full transition-colors mt-[4px] mr-[-4px]">
                    <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="absolute left-[60px] top-[96px] text-[18px] text-[#475569] leading-[24px] m-0">
                  Add user details to create a user. This will be added to the user listing.
                </p>
                
                <div className="absolute left-[60px] top-[135px] flex gap-[43px] text-[20px] font-medium leading-[28px]">
                  <button 
                    onClick={() => setAddUserActiveTab('personal')}
                    className={`${addUserActiveTab === 'personal' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative w-[190px] text-left transition-colors`}
                  >
                    Personal details
                    {addUserActiveTab === 'personal' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setAddUserActiveTab('address')}
                    className={`${addUserActiveTab === 'address' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative w-[120px] text-left transition-colors`}
                  >
                    Address
                    {addUserActiveTab === 'address' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setAddUserActiveTab('permissions')}
                    className={`${addUserActiveTab === 'permissions' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative w-[150px] text-left transition-colors`}
                  >
                    Permissions
                    {addUserActiveTab === 'permissions' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                  <button 
                    onClick={() => setAddUserActiveTab('budget')}
                    className={`${addUserActiveTab === 'budget' ? 'text-[#2563eb]' : 'text-[#878e9e] hover:text-slate-700'} relative w-[100px] text-left transition-colors`}
                  >
                    Budget
                    {addUserActiveTab === 'budget' && <div className="absolute top-[35px] left-0 w-full h-[3px] bg-[#2563eb]" />}
                  </button>
                </div>
                
                <div className="absolute left-[60px] top-[170px] w-[999px] h-[1px] bg-[#878e9e] opacity-[0.36]" />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 w-full overflow-y-auto pb-[130px]">
              <div className="w-full max-w-[1119px] mx-auto px-[60px] pt-[30px]">
                {addUserDemoNotice && (
                  <p className="text-[14px] text-[#475569] mb-4 leading-relaxed" role="status">
                    {addUserDemoNotice}
                  </p>
                )}

                {addUserActiveTab === 'personal' && (
                  <div className="grid grid-cols-[469px_468px] gap-x-[62px] gap-y-[24px]">
                    
                    {/* Row 1 */}
                    <div className="h-[104px] relative w-[104px]">
                      <img src={imgFrame26} alt="Profile" className="w-[104px] h-[104px] rounded-[80px] object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={() =>
                          setAddUserDemoNotice('Profile photo upload will be available in a future release (demo).')
                        }
                        className="absolute top-[62px] left-[83px] w-[42px] h-[42px] bg-[#2563eb] rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors text-white"
                      >
                        <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="pt-[10px]">
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">User Name*</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input
                          type="text"
                          value={addPersonalForm.name}
                          onChange={(e) => setAddPersonalForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Email ID*</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input
                          type="email"
                          value={addPersonalForm.email}
                          onChange={(e) => setAddPersonalForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter user email id"
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Contact number*</label>
                      <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <button
                          type="button"
                          onClick={() =>
                            setAddUserDemoNotice('Country and dial-code picker will be available in a future release (demo).')
                          }
                          className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img src={imgImage2742} alt="Flag" className="w-[24px] h-[16px] object-cover" />
                          <span className="text-[#363c48] text-[16px] leading-[24px] ml-[8px]">+91</span>
                          <svg className="w-[18px] h-[18px] text-[#5E687E] ml-[4px]" fill="none" viewBox="0 0 18 18" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 6.75l4.5 4.5 4.5-4.5" />
                          </svg>
                        </button>
                        <div className="w-[1px] h-[24px] bg-[#919BB0] mx-[11px]"></div>
                        <input
                          type="tel"
                          value={addPersonalForm.contact}
                          onChange={(e) => setAddPersonalForm((prev) => ({ ...prev, contact: e.target.value }))}
                          placeholder="Enter user contact"
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Date of Joining</label>
                      <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                        <input type="text" placeholder="Select date" className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer" readOnly />
                        <svg className="w-[24px] h-[24px] text-[#878E9E] absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Birthday</label>
                      <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                        <input type="text" placeholder="Select date" className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer" readOnly />
                        <svg className="w-[24px] h-[24px] text-[#878e9e] absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Role</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input type="text" placeholder="Enter role" className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Add to group</label>
                      <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                        <select defaultValue="" className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]">
                          <option value="" disabled hidden className="text-[#878e9e]">Select</option>
                          <option value="1">Software team</option>
                          <option value="2">Design team</option>
                        </select>
                        <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                  </div>
                )}

                {addUserActiveTab === 'address' && (
                  <div className="grid grid-cols-[469px_468px] gap-x-[62px] gap-y-[24px]">
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Street Address*</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input
                          type="text"
                          value={addAddressForm.streetAddress}
                          onChange={(e) => setAddAddressForm((prev) => ({ ...prev, streetAddress: e.target.value }))}
                          placeholder="Enter street address"
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">City*</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input
                          type="text"
                          value={addAddressForm.city}
                          onChange={(e) => setAddAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">State/Province</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input type="text" placeholder="Enter state/province" className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Zip/Postal Code*</label>
                      <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                        <input
                          type="text"
                          value={addAddressForm.zipPostalCode}
                          onChange={(e) => setAddAddressForm((prev) => ({ ...prev, zipPostalCode: e.target.value }))}
                          placeholder="Enter zip code"
                          className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px]">Country</label>
                      <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                        <select defaultValue="" className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]">
                          <option value="" disabled hidden className="text-[#878e9e]">Select country</option>
                          <option value="US">United States</option>
                          <option value="IN">India</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                        <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                {addUserActiveTab === 'permissions' && (
                  <div className="flex flex-col pb-[32px]">
                    <div className="grid grid-cols-[469px_468px] gap-x-[62px]">
                      {/* Left Column */}
                      <div className="flex flex-col">
                        <div className="w-[469px] mb-[20px]">
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Permission level*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                            <select 
                              value={permissionLevel}
                              onChange={(e) => setPermissionLevel(e.target.value)}
                              className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]"
                            >
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                              <option value="admin">Administrator</option>
                            </select>
                            <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[469px]">
                          <button
                            type="button"
                            onClick={() =>
                              setAddUserDemoNotice('Additional access presets will be available in a future release (demo).')
                            }
                            className="text-[16px] text-[#2563eb] leading-[20px] hover:underline flex items-center mb-[4px]"
                          >
                            + Add more
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAddUserDemoNotice('Extended permission details will be available in a future release (demo).')
                            }
                            className="text-[16px] text-[#2563eb] leading-[20px] hover:underline flex items-center"
                          >
                            Add more details
                          </button>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="flex flex-col">
                        <div className="w-[468px] mb-[24px]">
                          <div className="flex justify-between items-center mb-[8px]">
                            <span className="text-[16px] text-[#0e1e3f] leading-[20px] font-medium">Access to categories*</span>
                            <button onClick={handleClearAllCategories} className="text-[16px] text-[#dc2626] leading-[20px] hover:underline">Clear all</button>
                          </div>
                          <div className="w-full min-h-[92px] p-[16px] rounded-[6px] border border-[#dde2e4] bg-[#f9fafb] flex flex-wrap gap-[8px] content-start">
                            {accessCategories.map(cat => (
                              <div key={cat} className="h-[28px] px-[12px] bg-[#dbeafe] rounded-[4px] flex items-center gap-[6px]">
                                <span className="text-[14px] text-[#1d4ed8] leading-[20px]">{cat}</span>
                                <button onClick={() => handleRemoveCategory(cat)} className="text-[#1d4ed8] hover:opacity-80">
                                  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            {accessCategories.length === 0 && (
                              <span className="text-[14px] text-[#878e9e] italic leading-[20px] py-[4px]">No categories selected</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-[468px]">
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Categories*</label>
                          <div className="flex gap-[16px]">
                            <div className="flex-1 h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                              <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]"
                              >
                                <option value="" disabled hidden className="text-[#878e9e]">Select</option>
                                {AVAILABLE_CATEGORIES.filter(cat => !accessCategories.includes(cat)).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <button 
                              onClick={handleAddCategory}
                              className="w-[102px] h-[48px] rounded-[60px] bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Approval Settings Section */}
                    <div className="flex flex-col mt-[40px] pt-[32px] border-t border-[#dde2e4]">
                      <h3 className="text-[18px] font-medium text-[#0e1e3f] leading-[24px] mb-[24px]">Approval & Budget Roles</h3>
                      
                      <div className="grid grid-cols-[469px_468px] gap-x-[62px]">
                        {/* Left Column - User Budget Role */}
                        <div className="w-[469px]">
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">User Budget Role*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                            <select 
                              value={userBudgetRole}
                              onChange={(e) => setUserBudgetRole(e.target.value)}
                              className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]"
                            >
                              <option value="" disabled hidden className="text-[#878e9e]">e.g., Manager, Employee, Finance</option>
                              <option value="manager">Manager</option>
                              <option value="employee">Employee</option>
                              <option value="finance">Finance</option>
                            </select>
                            <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Right Column - Approver settings */}
                        <div className="flex flex-col gap-[20px] w-[468px]">
                          <label className="flex items-center gap-[12px] cursor-pointer mt-[12px] group w-fit">
                            <div className="relative inline-flex items-center h-[24px] w-[44px] shrink-0 cursor-pointer rounded-[12px] border-2 border-transparent transition-colors duration-200 ease-in-out bg-[#dde2e4] group-has-[:checked]:bg-[#2563eb]">
                               <input 
                                 type="checkbox" 
                                 checked={isApprover}
                                 onChange={(e) => setIsApprover(e.target.checked)}
                                 className="sr-only peer" 
                               />
                               <span className="pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 peer-checked:translate-x-[20px]" />
                            </div>
                            <span className="text-[16px] text-[#0e1e3f] leading-[20px] font-medium">Designate as an Approver*</span>
                          </label>

                          <div className={`pl-[56px] transition-opacity duration-200 ${!isApprover ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Default Approval Level*</label>
                            <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                              <select 
                                value={defaultApprovalLevel}
                                onChange={(e) => setDefaultApprovalLevel(e.target.value)}
                                disabled={!isApprover}
                                className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px] disabled:cursor-not-allowed"
                              >
                                <option value="" disabled hidden className="text-[#878e9e]">e.g., Level 1, Level 2</option>
                                <option value="level1">Level 1</option>
                                <option value="level2">Level 2</option>
                              </select>
                              <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {addUserActiveTab === 'budget' && (
                  <div className="flex flex-col gap-8 pb-[32px] w-[1000px]">
                    {/* Budget 1 Section */}
                    <div className="flex flex-col gap-5 p-6 rounded-lg border border-[#dde2e4] bg-[#f8fafc]">
                      <div className="flex justify-between items-center pb-4 border-b border-[#dde2e4]">
                        <h3 className="text-xl font-medium text-[#0e1e3f] leading-6">#Budget 1</h3>
                          <button
                            onClick={() => setAddBudget1Form({ type: '', amount: '', startDate: '', endDate: '' })}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr] gap-x-[62px] gap-y-6">
                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Budget type*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                              <select
                                value={addBudget1Form.type}
                                onChange={(e) => setAddBudget1Form((prev) => ({ ...prev, type: e.target.value }))}
                                className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]"
                              >
                              <option value="" disabled hidden className="text-[#878e9e]">Select</option>
                              <option value="marketing">Marketing</option>
                              <option value="sales">Sales</option>
                              <option value="events">Events</option>
                            </select>
                            <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Budget amount*</label>
                          <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                              <input
                                type="text"
                                value={addBudget1Form.amount}
                                onChange={(e) => setAddBudget1Form((prev) => ({ ...prev, amount: e.target.value }))}
                                placeholder="Type here"
                                className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                              />
                          </div>
                        </div>

                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Start date*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                              <input
                                type="date"
                                value={addBudget1Form.startDate}
                                onChange={(e) => setAddBudget1Form((prev) => ({ ...prev, startDate: e.target.value }))}
                                className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer"
                              />
                            <svg className="w-[24px] h-[24px] text-[#878e9e] absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">End date*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                              <input
                                type="date"
                                value={addBudget1Form.endDate}
                                onChange={(e) => setAddBudget1Form((prev) => ({ ...prev, endDate: e.target.value }))}
                                className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer"
                              />
                            <svg className="w-[24px] h-[24px] text-[#878e9e] absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add More Button */}
                    <div className="flex justify-center -mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAddUserDemoNotice('Adding extra budget or points rows will be available in a future release (demo).')
                        }
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#2563eb] text-[#2563eb] hover:bg-[#ebf1ff] transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add more
                      </button>
                    </div>

                    {/* Points Section */}
                    <div className="flex flex-col gap-5 p-6 rounded-lg border border-[#dde2e4] bg-[#f8fafc]">
                      <div className="flex justify-between items-center pb-4 border-b border-[#dde2e4]">
                        <h3 className="text-xl font-medium text-[#0e1e3f] leading-6">#Points</h3>
                        <button
                          type="button"
                          onClick={() =>
                            setAddUserDemoNotice('Removing points rows will be available in a future release (demo).')
                          }
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr] gap-x-[62px] gap-y-6">
                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Points to be allocated*</label>
                          <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                            <input type="text" placeholder="Type here" className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Frequency*</label>
                          <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                            <select defaultValue="" className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]">
                              <option value="" disabled hidden className="text-[#878e9e]">Select</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="annually">Annually</option>
                            </select>
                            <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full h-[106px] bg-white shadow-[0px_-3px_11px_0px_rgba(0,0,0,0.11)] flex items-center justify-center gap-[12px] z-20">
              {addUserError && (
                <div className="absolute left-6 right-6 top-3">
                  <p className="text-[#dc2626] text-[14px] font-medium">{addUserError}</p>
                </div>
              )}
              <button 
                onClick={() => setIsAddSingleUserOpen(false)}
                className="w-[264px] h-[50px] rounded-[60px] border border-[#2563eb] text-[#2563eb] font-medium hover:bg-blue-50 transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSingleUserNext}
                disabled={isAddUserSubmitting}
                className={`w-[264px] h-[50px] rounded-[60px] bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] disabled:opacity-60`}
              >
                {isAddUserSubmitting
                  ? 'Submitting...'
                  : addUserActiveTab === 'budget'
                    ? 'Create User'
                    : 'Next'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserProfileIdx !== null && (
        <div 
          className={`fixed inset-y-0 right-0 z-50 flex bg-[#f8fafc] animate-in fade-in slide-in-from-right-16 duration-300 left-0 ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-56'} transition-all`} 
          style={{ fontFamily: 'Inter, sans-serif', boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.05)' }}
        >
          
          {/* Main Layout Container */}
          <div className="w-full h-full flex flex-col relative">
            
            {/* Header */}
            <div className="w-full h-[72px] bg-white border-b border-slate-200 flex items-center px-8 shrink-0 z-20 shadow-sm relative">
              <button 
                onClick={() => setSelectedUserProfileIdx(null)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors mr-4 text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-[18px] font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span className="text-slate-400">User management</span> <span className="text-slate-300 mx-2">/</span> <span className="text-slate-900">User profile</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar */}
              <div className="w-[380px] h-full bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 z-10 relative shadow-[4px_0px_10px_0px_rgba(0,0,0,0.02)]">
                
                {/* Decorative Top Banner */}
                <div className="w-full h-[140px] bg-gradient-to-br from-blue-50 to-indigo-100 shrink-0 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="flex flex-col items-center px-8 pb-10 -mt-16 relative z-10">
                  {/* Avatar & Name */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-lg mb-4 bg-white">
                    <img src={users[selectedUserProfileIdx].avatar} alt={users[selectedUserProfileIdx].name} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>{users[selectedUserProfileIdx].name}</h2>
                  <div className="px-5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 font-semibold text-sm tracking-wide mb-8">
                    {users[selectedUserProfileIdx].role}
                  </div>

                  {/* Details list */}
                  <div className="w-full flex flex-col gap-8">
                    
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-[11px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Basic information</h3>
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Email address</div>
                            <div className="text-sm text-slate-900 font-medium break-all">{users[selectedUserProfileIdx].email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Phone number</div>
                            <div className="text-sm text-slate-900 font-medium">+1 (555) 123-4567</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Status</div>
                            <div className="text-sm text-emerald-700 font-medium">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-slate-100"></div>

                    {/* Organization info */}
                    <div>
                      <h3 className="text-[11px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Organization</h3>
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Group</div>
                            <div className="text-sm text-slate-900 font-medium">{users[selectedUserProfileIdx].group}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Permission level</div>
                            <div className="text-sm text-slate-900 font-medium">{users[selectedUserProfileIdx].permissions}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Main Content */}
              <div className="flex-1 h-full overflow-y-auto bg-slate-50 relative">
                {/* Subtle background decoration */}
                <div className="absolute top-0 left-0 w-full h-[240px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>

                <div className="p-10 max-w-[1000px] mx-auto relative z-10">
                  
                  {/* Tabs */}
                  <div className="flex gap-8 border-b border-slate-200 mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {['personal', 'address', 'permissions', 'budget'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setProfileActiveTab(tab as any)}
                        className={`pb-4 text-[15px] font-bold relative transition-colors capitalize-first ${profileActiveTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <span className="capitalize">{tab === 'personal' ? 'Personal details' : tab}</span>
                        {profileActiveTab === tab && (
                          <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                    
                    {profileActiveTab === 'personal' && (
                      <div className="animate-in fade-in">
                        <div className="mb-10">
                          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>Personal Information</h3>
                          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div className="flex flex-col border-b border-slate-100 pb-3">
                              <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>First Name</span>
                              <span className="text-[15px] text-slate-900">{users[selectedUserProfileIdx].name.split(' ')[0]}</span>
                            </div>
                            <div className="flex flex-col border-b border-slate-100 pb-3">
                              <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Last Name</span>
                              <span className="text-[15px] text-slate-900">{users[selectedUserProfileIdx].name.split(' ').slice(1).join(' ') || '-'}</span>
                            </div>
                            <div className="flex flex-col border-b border-slate-100 pb-3">
                              <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Job Title</span>
                              <span className="text-[15px] text-slate-900">{users[selectedUserProfileIdx].role}</span>
                            </div>
                            <div className="flex flex-col border-b border-slate-100 pb-3">
                              <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Department</span>
                              <span className="text-[15px] text-slate-900">{users[selectedUserProfileIdx].group}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 p-6 rounded-lg border border-[#dde2e4] bg-white">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              Edit role & department
                            </h3>
                            {isProfilePersonalSaving && (
                              <span className="text-[14px] text-[#2563eb] font-medium">Saving...</span>
                            )}
                          </div>

                          {profilePersonalError && (
                            <div className="text-[14px] text-[#dc2626] font-medium mb-4">{profilePersonalError}</div>
                          )}
                          {profilePersonalSuccess && (
                            <div className="text-[14px] text-[#16a34a] font-medium mb-4">{profilePersonalSuccess}</div>
                          )}

                          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div>
                              <label className="text-[13px] font-semibold text-slate-500 mb-1 block">Job Title</label>
                              <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                                <input
                                  value={profilePersonalForm.role}
                                  onChange={(e) => setProfilePersonalForm((p) => ({ ...p, role: e.target.value }))}
                                  className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[13px] font-semibold text-slate-500 mb-1 block">Department</label>
                              <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] bg-white flex items-center relative focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                                <select
                                  value={profilePersonalForm.group}
                                  onChange={(e) => setProfilePersonalForm((p) => ({ ...p, group: e.target.value }))}
                                  className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer appearance-none"
                                >
                                  <option value="" disabled>Select</option>
                                  <option value="Software team">Software team</option>
                                  <option value="Design team">Design team</option>
                                  <option value="Management team">Management team</option>
                                </select>
                                <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end mt-8">
                            <button
                              onClick={handleSaveProfilePersonal}
                              disabled={isProfilePersonalSaving}
                              className="w-[264px] h-[50px] rounded-[60px] bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] disabled:opacity-60"
                            >
                              {isProfilePersonalSaving ? 'Saving...' : 'Save changes'}
                            </button>
                          </div>
                        </div>

                        <div className="mt-12">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Order History & Rewards</h3>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2 rounded-full shadow-sm">
                              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                              <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Total points: 4,000 pts</span>
                            </div>
                          </div>
                          
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Date</th>
                                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Reward Type</th>
                                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right" style={{ fontFamily: 'Montserrat, sans-serif' }}>Points Earned</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                <tr className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">Oct 12, 2023</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                      Q3 Performance Bonus
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-[15px] text-emerald-600 font-bold text-right">+1,500</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">Aug 05, 2023</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                                      Work Anniversary
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-[15px] text-emerald-600 font-bold text-right">+2,000</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">Jun 22, 2023</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100">
                                      Peer Recognition
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-[15px] text-emerald-600 font-bold text-right">+500</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileActiveTab === 'address' && (
                      <div className="animate-in fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>Shipping Address</h3>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                          <div className="col-span-2 flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Address Line 1</span>
                            <span className="text-[15px] text-slate-900">123 Business Parkway</span>
                          </div>
                          <div className="col-span-2 flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Address Line 2 (Optional)</span>
                            <span className="text-[15px] text-slate-900">Suite 400</span>
                          </div>
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>City</span>
                            <span className="text-[15px] text-slate-900">San Francisco</span>
                          </div>
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>State/Province</span>
                            <span className="text-[15px] text-slate-900">California</span>
                          </div>
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Zip/Postal Code</span>
                            <span className="text-[15px] text-slate-900">94107</span>
                          </div>
                          <div className="flex flex-col border-b border-slate-100 pb-3">
                            <span className="text-[13px] font-semibold text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Country</span>
                            <span className="text-[15px] text-slate-900">United States</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileActiveTab === 'permissions' && (
                      <div className="animate-in fade-in flex items-center justify-center h-[300px] text-slate-400 flex-col gap-5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>Detailed permission settings are managed by admins.</p>
                      </div>
                    )}

                    {profileActiveTab === 'budget' && (
                      <div className="animate-in fade-in">
                        <div className="mb-8">
                          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Spending limit allocation
                          </h3>

                          {profileBudgetError && (
                            <div className="text-[14px] text-[#dc2626] font-medium mb-4">{profileBudgetError}</div>
                          )}
                          {profileBudgetSuccess && (
                            <div className="text-[14px] text-[#16a34a] font-medium mb-4">{profileBudgetSuccess}</div>
                          )}
                        </div>

                        {((profileBudgetsByIdx[selectedUserProfileIdx] || []) as ProfileBudgetAllocation[]).length > 0 ? (
                          <div className="mb-8 p-6 rounded-lg border border-[#dde2e4] bg-white">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[16px] font-bold text-slate-900">Existing allocations</h4>
                              <span className="text-[14px] text-[#878e9e]">
                                {(profileBudgetsByIdx[selectedUserProfileIdx] || []).length} record(s)
                              </span>
                            </div>
                            <div className="flex flex-col gap-4">
                              {(profileBudgetsByIdx[selectedUserProfileIdx] || []).map((b, i) => (
                                <div key={i} className="p-4 rounded-lg border border-[#dde2e4] bg-[#f8fafc]">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-[14px] font-semibold text-[#0e1e3f]">#{b.type}</div>
                                    <div className="text-[14px] font-bold text-[#0e1e3f]">${b.amount}</div>
                                  </div>
                                  <div className="text-[13px] text-[#475569]">
                                    {b.startDate} to {b.endDate}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-8 p-6 rounded-lg border border-[#dde2e4] bg-white">
                            <p className="text-[14px] text-[#475569] font-medium">
                              No budget allocations yet for this employee.
                            </p>
                          </div>
                        )}

                        <div className="p-6 rounded-lg border border-[#dde2e4] bg-white">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[16px] font-bold text-slate-900">Add allocation</h4>
                            {isProfileBudgetSubmitting && (
                              <span className="text-[14px] text-[#2563eb] font-medium">Saving...</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div>
                              <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Budget type*</label>
                              <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center relative cursor-pointer hover:border-blue-500 transition-colors">
                                <select
                                  value={profileBudgetForm.type}
                                  onChange={(e) => setProfileBudgetForm((p) => ({ ...p, type: e.target.value }))}
                                  className="w-full h-full px-[16px] bg-transparent appearance-none border-none text-[16px] text-[#0e1e3f] focus:outline-none leading-[20px] cursor-pointer pr-[40px]"
                                >
                                  <option value="" disabled hidden className="text-[#878e9e]">Select</option>
                                  <option value="marketing">Marketing</option>
                                  <option value="sales">Sales</option>
                                  <option value="events">Events</option>
                                </select>
                                <svg className="w-[20px] h-[20px] text-black absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            <div>
                              <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Budget amount*</label>
                              <div className="w-full h-[48px] px-[16px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                                <input
                                  type="text"
                                  value={profileBudgetForm.amount}
                                  onChange={(e) => setProfileBudgetForm((p) => ({ ...p, amount: e.target.value }))}
                                  placeholder="Type here"
                                  className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">Start date*</label>
                              <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                  type="date"
                                  value={profileBudgetForm.startDate}
                                  onChange={(e) => setProfileBudgetForm((p) => ({ ...p, startDate: e.target.value }))}
                                  className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[16px] text-[#0e1e3f] block mb-[4px] leading-[20px] font-medium">End date*</label>
                              <div className="w-full h-[48px] rounded-[6px] border border-[#dde2e4] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white flex items-center px-[16px] relative cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                  type="date"
                                  value={profileBudgetForm.endDate}
                                  onChange={(e) => setProfileBudgetForm((p) => ({ ...p, endDate: e.target.value }))}
                                  className="w-full bg-transparent border-none text-[16px] text-[#0e1e3f] placeholder-[#878e9e] focus:outline-none leading-[20px] cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end mt-8">
                            <button
                              onClick={handleSaveProfileBudget}
                              disabled={isProfileBudgetSubmitting}
                              className="w-[264px] h-[50px] rounded-[60px] bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors text-[18px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12),inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)] disabled:opacity-60"
                            >
                              {isProfileBudgetSubmitting ? 'Saving...' : 'Save allocation'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}