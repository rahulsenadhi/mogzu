import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import svgPaths from '../../imports/svg-7oj4o74nfw';
import dashboardSvgPaths from '../../imports/svg-camfkj9vq4';
import imgImage24877 from 'figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'p1d971400', path: '/dashboard' },
  { id: 'activity', label: 'Activity Suite', icon: 'p2c29c800', path: '/activitysuite' },
  { id: 'bookings', label: 'Bookings', icon: 'paf72c00', path: '/bookings' },
  { id: 'favorites', label: 'Favorites', icon: 'p27070280', path: '/favourites' },
  { id: 'users', label: 'Users', icon: 'p29193540', path: '/user-management' },
  { id: 'notification', label: 'Notification', icon: 'p4e64800', path: '/corporate/notifications' },
  { id: 'communication', label: 'Communication', icon: 'p319d300', path: '/communication' },
  { id: 'report', label: 'Report', icon: 'p1f81a280', path: '/corporate/spend-report' },
  { id: 'transactions', label: 'Transactions', icon: 'p2683f80', path: '/corporate/transactions' },
  { id: 'settings', label: 'Settings', icon: 'pde1bb00', path: '/settings/workflow' },
];

const totalSpentData = [
  { name: 'Jan', Gifting: 40000, Event: 24000, SpaceX: 24000 },
  { name: 'Feb', Gifting: 30000, Event: 13980, SpaceX: 22100 },
  { name: 'Mar', Gifting: 20000, Event: 9800, SpaceX: 22900 },
  { name: 'Apr', Gifting: 27800, Event: 39080, SpaceX: 20000 },
  { name: 'May', Gifting: 18900, Event: 48000, SpaceX: 21810 },
  { name: 'Jun', Gifting: 23900, Event: 38000, SpaceX: 25000 },
  { name: 'Jul', Gifting: 34900, Event: 43000, SpaceX: 21000 },
  { name: 'Aug', Gifting: 50000, Event: 55000, SpaceX: 30000 },
  { name: 'Sep', Gifting: 45000, Event: 48000, SpaceX: 28000 },
  { name: 'Oct', Gifting: 60000, Event: 52000, SpaceX: 35000 },
  { name: 'Nov', Gifting: 80000, Event: 60000, SpaceX: 40000 },
  { name: 'Dec', Gifting: 90000, Event: 85000, SpaceX: 50000 },
];

const totalSavingsData = [
  { name: 'Jan', Saving: 10000 },
  { name: 'Feb', Saving: 15000 },
  { name: 'Mar', Saving: 12000 },
  { name: 'Apr', Saving: 18000 },
  { name: 'May', Saving: 14000 },
  { name: 'Jun', Saving: 20000 },
  { name: 'Jul', Saving: 25000 },
  { name: 'Aug', Saving: 30000 },
  { name: 'Sep', Saving: 28000 },
  { name: 'Oct', Saving: 32000 },
  { name: 'Nov', Saving: 40000 },
  { name: 'Dec', Saving: 45000 },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'custom' | 'audit'>('overview');
  const [showBuilder, setShowBuilder] = useState(false);
  const [reportsNotice, setReportsNotice] = useState<string | null>(null);
  const [chartPeriodLabel, setChartPeriodLabel] = useState('This year');
  const [builderReportName, setBuilderReportName] = useState('');
  const [builderVizType, setBuilderVizType] = useState<'Bar Chart' | 'Line Chart' | 'Pie Chart' | 'Data Table'>('Bar Chart');
  const selectedNav = 'report';

  // Mock data for custom reports
  const [customReports, setCustomReports] = useState([
    { id: 1, title: 'Q3 Event Spend by Department', type: 'Bar Chart', date: 'Oct 12, 2023' },
    { id: 2, title: 'Monthly Savings Trend', type: 'Line Chart', date: 'Nov 05, 2023' },
  ]);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-['Inter']">
      {/* Sidebar */}
      <aside
        className={`bg-[#f9fafb] ${sidebarCollapsed ? 'w-20' : 'w-56'} flex-shrink-0 border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 h-full`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-200 bg-[#f9fafb] px-5 overflow-hidden whitespace-nowrap">
          <img 
            src={imgImage24877} 
            alt="Mogzu" 
            className={`transition-all duration-300 object-contain ${sidebarCollapsed ? 'h-7 w-7' : 'h-9 w-auto'}`}
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Navigation */}
        <nav className="py-4 px-3 overflow-y-auto overflow-x-hidden scrollbar-hide h-[calc(100%-3.5rem)]">
          <div className="mb-6">
            {navItems.slice(0, 1).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path || '/')}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 ${
                  selectedNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-5">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={(dashboardSvgPaths as Record<string, string>)[item.icon]} fill="currentColor" />
                  </svg>
                </div>
                <span className={`whitespace-nowrap flex-1 text-left transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
              Manage
            </p>
            {navItems.slice(1, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 ${
                  selectedNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-5">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={(dashboardSvgPaths as Record<string, string>)[item.icon]} fill="currentColor" />
                  </svg>
                </div>
                <span className={`whitespace-nowrap flex-1 text-left transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            ))}

            <button
              onClick={() => navigate('/deals')}
              title={sidebarCollapsed ? 'Deals' : undefined}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 hover:bg-gray-100 text-gray-700`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <span className={`whitespace-nowrap flex-1 text-left transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                Deals
              </span>
            </button>
            {navItems.slice(6, 7).map((item) => (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 ${
                  selectedNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-5">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={(dashboardSvgPaths as Record<string, string>)[item.icon]} fill="currentColor" />
                  </svg>
                </div>
                <span className={`whitespace-nowrap flex-1 text-left transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
              Account
            </p>
            {navItems.slice(7).map((item) => (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mb-0.5 ${
                  selectedNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-5">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <path d={(dashboardSvgPaths as Record<string, string>)[item.icon]} fill="currentColor" />
                  </svg>
                </div>
                <span className={`whitespace-nowrap flex-1 text-left transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 shadow-sm z-10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#eef1f9] p-6 lg:p-10">
          <div className="max-w-[1440px] mx-auto space-y-6">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'custom' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Custom Reports
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Export / Audit Trail
                </button>
              </div>
              
              {activeTab === 'custom' && !showBuilder && (
                <button
                  type="button"
                  onClick={() => {
                    setBuilderReportName('');
                    setBuilderVizType('Bar Chart');
                    setShowBuilder(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Create Custom Report
                </button>
              )}
            </div>

            {reportsNotice ? (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {reportsNotice}
              </p>
            ) : null}

            {activeTab === 'overview' ? (
              <>
                {/* Overview Stats */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-[20px] font-medium text-gray-900 mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total booking */}
                <div className="bg-blue-50/50 rounded-lg p-5 border border-blue-100/50 relative overflow-hidden">
                  <p className="text-[16px] text-gray-600 mb-2">Total booking</p>
                  <p className="text-[32px] font-semibold text-blue-600">175</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[14px] text-blue-600">+3.25</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-gray-500">than last month</span>
                  </div>
                </div>

                {/* Total request */}
                <div className="bg-orange-50/50 rounded-lg p-5 border border-orange-100/50 relative overflow-hidden">
                  <p className="text-[16px] text-gray-600 mb-2">Total request</p>
                  <p className="text-[32px] font-semibold text-orange-500">64</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[14px] text-orange-500">+3.25</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#fa8d40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-gray-500">than last month</span>
                  </div>
                </div>

                {/* Total employees */}
                <div className="bg-green-50/50 rounded-lg p-5 border border-green-100/50 relative overflow-hidden">
                  <p className="text-[16px] text-gray-600 mb-2">Total employees</p>
                  <p className="text-[32px] font-semibold text-green-500">25</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[14px] text-green-500">+3.25</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-gray-500">than last month</span>
                  </div>
                </div>

                {/* Total Savings */}
                <div className="bg-cyan-50/50 rounded-lg p-5 border border-cyan-100/50 relative overflow-hidden">
                  <p className="text-[16px] text-gray-600 mb-2">Total Savings</p>
                  <p className="text-[32px] font-semibold text-cyan-500">3246</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[14px] text-cyan-500">+3.25</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#34c5dc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-gray-500">than last month</span>
                  </div>
                </div>

                {/* Payment Pending */}
                <div className="bg-red-50/50 rounded-lg p-5 border border-red-100/50 relative overflow-hidden">
                  <p className="text-[16px] text-gray-600 mb-2">Payment Pending</p>
                  <p className="text-[32px] font-semibold text-red-500">1215</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[14px] text-red-500">+3.25</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-gray-500">than last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Spent Line Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[20px] font-medium text-gray-900">Total Spent</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] text-green-500">+3.25</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[14px] text-gray-500">than last year</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#fa8d40]"></div>
                        <span className="text-sm text-gray-600">D Space</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        <span className="text-sm text-gray-600">Event</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                        <span className="text-sm text-gray-600">Gifting</span>
                      </div>
                    </div>
                    {/* Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setChartPeriodLabel((prev) =>
                          prev === 'This year' ? 'Last year' : prev === 'Last year' ? 'Last 90 days' : 'This year',
                        );
                        setReportsNotice(
                          'Period label updated. Chart values are sample data until live reporting is connected.',
                        );
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      {chartPeriodLabel}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={totalSpentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs key="defs">
                        <linearGradient key="lg-gifting" id="colorGifting" x1="0" y1="0" x2="0" y2="1">
                          <stop key="stop-1" offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop key="stop-2" offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient key="lg-event" id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                          <stop key="stop-3" offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop key="stop-4" offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient key="lg-spacex" id="colorSpaceX" x1="0" y1="0" x2="0" y2="1">
                          <stop key="stop-5" offset="5%" stopColor="#fa8d40" stopOpacity={0.3}/>
                          <stop key="stop-6" offset="95%" stopColor="#fa8d40" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid key="grid-spent" strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis key="xaxis-spent" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis key="yaxis-spent" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value / 1000}K`} />
                      <Tooltip 
                        key="tooltip-spent"
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Area key="area-spacex" type="monotone" dataKey="SpaceX" stroke="#fa8d40" strokeWidth={2} fillOpacity={1} fill="url(#colorSpaceX)" />
                      <Area key="area-event" type="monotone" dataKey="Event" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorEvent)" />
                      <Area key="area-gifting" type="monotone" dataKey="Gifting" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorGifting)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Total Savings Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-medium text-gray-900">Total Savings</h2>
                </div>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={totalSavingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                      <CartesianGrid key="grid-savings" strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis key="xaxis-savings" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis key="yaxis-savings" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value / 1000}K`} />
                      <Tooltip 
                        key="tooltip-savings"
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Saved']}
                      />
                      <Bar key="bar" dataKey="Saving" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-[18px] font-medium text-gray-900">Order overview</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: 'Order', value: '4,37,802', change: '+3.25%' },
                    { label: 'Cart', value: '1,20,500', change: '+1.15%' },
                    { label: 'Wishlist', value: '85,000', change: '+2.50%' },
                  ].map((item, i) => (
                    <div key={`order-${item.label}-${i}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <span className="text-[16px] font-medium text-gray-900">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[16px] font-medium text-gray-900">₹{item.value}</span>
                        <div className="flex items-center gap-1 w-20 justify-end">
                          <span className="text-[14px] text-green-500">{item.change}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee spend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-[18px] font-medium text-gray-900">Employee spend</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: 'Events', value: '5,802', change: '+3.25%' },
                    { label: 'Gifting', value: '3,450', change: '+1.80%' },
                    { label: 'D Space', value: '1,240', change: '+0.95%' },
                  ].map((item, i) => (
                    <div key={`spend-${item.label}-${i}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <span className="text-[16px] font-medium text-gray-900">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[16px] font-medium text-gray-900">{item.value}</span>
                        <div className="flex items-center gap-1 w-20 justify-end">
                          <span className="text-[14px] text-green-500">{item.change}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2L10 6M6 2L2 6M6 2V10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
            ) : activeTab === 'custom' ? (
              // Custom Reports Section
              <div className="space-y-6">
                {showBuilder ? (
                  // Report Builder UI
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 font-['Montserrat']">Report Builder</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure and generate custom insights for your organization.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBuilder(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column: Configuration */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Q4 Regional Spending"
                            value={builderReportName}
                            onChange={(e) => setBuilderReportName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                            <option>Corporate Gifting</option>
                            <option>Event Spend</option>
                            <option>Employee Bookings</option>
                            <option>Savings Overview</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                              <option>Last 30 Days</option>
                              <option>This Quarter</option>
                              <option>Year to Date</option>
                              <option>Custom Range</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                              <option>Department</option>
                              <option>Month</option>
                              <option>Location</option>
                              <option>Event Type</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Metrics to Include</label>
                          <div className="space-y-3">
                            {['Total Spent', 'Total Bookings', 'Average Cost', 'Total Savings'].map((metric) => (
                              <label key={metric} className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked={metric === 'Total Spent'} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span className="text-sm text-gray-600">{metric}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Visualization Type</label>
                          <div className="flex flex-wrap gap-3">
                            {(['Bar Chart', 'Line Chart', 'Pie Chart', 'Data Table'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setBuilderVizType(type)}
                                className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                                  builderVizType === type
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Live Preview */}
                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-md font-medium">Auto-updating</span>
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                          {/* Placeholder Chart */}
                          <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500 mb-4">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <line x1="3" y1="9" x2="21" y2="9"/>
                              <line x1="9" y1="21" x2="9" y2="9"/>
                            </svg>
                            <p className="text-sm text-gray-500 text-center max-w-[200px]">
                              Select metrics and data source to generate chart preview
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setShowBuilder(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = builderReportName.trim() || 'Untitled report';
                          const nextId = customReports.reduce((m, r) => Math.max(m, r.id), 0) + 1;
                          setCustomReports((prev) => [
                            ...prev,
                            {
                              id: nextId,
                              title,
                              type: builderVizType,
                              date: new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }),
                            },
                          ]);
                          setBuilderReportName('');
                          setShowBuilder(false);
                          setReportsNotice(`"${title}" was added to your saved reports (demo).`);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Save Custom Report
                      </button>
                    </div>
                  </div>
                ) : (
                  // Saved Reports List
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900 font-['Montserrat']">Your Saved Reports</h2>
                    </div>
                    {customReports.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {customReports.map((report) => (
                          <div key={report.id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                              </div>
                              <div>
                                <h3 className="text-base font-medium text-gray-900">{report.title}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{report.type} • Created {report.date}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setReportsNotice(
                                    `Opening "${report.title}" in the full report viewer will be available in a future release.`,
                                  )
                                }
                                className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBuilderReportName(report.title);
                                  setBuilderVizType(
                                    report.type === 'Line Chart'
                                      ? 'Line Chart'
                                      : report.type === 'Pie Chart'
                                        ? 'Pie Chart'
                                        : report.type === 'Data Table'
                                          ? 'Data Table'
                                          : 'Bar Chart',
                                  );
                                  setShowBuilder(true);
                                  setReportsNotice(
                                    `Editing "${report.title}" in the builder will be available in a future release; you can still create a new saved copy.`,
                                  );
                                }}
                                className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomReports((prev) => prev.filter((r) => r.id !== report.id));
                                  setReportsNotice(`Removed "${report.title}" from your saved reports.`);
                                }}
                                className="px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mx-auto mb-4">
                          <path d="M9 17v1a3 3 0 106 0v-1m-5 0a2 2 0 104 0v-1m-4 0a1 1 0 102 0v-1M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v16a2 2 0 002 2z"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1 font-['Montserrat']">No custom reports yet</h3>
                        <p className="text-gray-500 mb-6">Create a new report to visualize data exactly how you need it.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setBuilderReportName('');
                            setBuilderVizType('Bar Chart');
                            setShowBuilder(true);
                          }}
                          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Build Your First Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Export / Audit Trail Section
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-['Montserrat']">Export / Audit Trail</h2>
                    <p className="text-sm text-gray-500 mt-1">Full log of every booking action, approval, and document upload.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setReportsNotice('CSV export for the audit trail will be available in a future release.')
                      }
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReportsNotice('PDF export for the audit trail will be available in a future release.')
                      }
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Export PDF
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-white">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]">
                    <option>All Actions</option>
                    <option>Approvals</option>
                    <option>Bookings</option>
                    <option>Cancellations</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]">
                    <option>All Users</option>
                    <option>Sarah Jenkins</option>
                    <option>Mike Chen</option>
                  </select>
                  <input 
                    type="date" 
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Search booking ref..." 
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Audit Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Ref</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vertical</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">Oct 20, 10:45 AM</td>
                        <td className="px-6 py-4 font-medium text-gray-900">Sarah Jenkins</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                            Approved
                          </span>
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-medium">#BK-2024-0091</td>
                        <td className="px-6 py-4 text-gray-900">₹1,20,000</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold text-indigo-700 bg-indigo-100 uppercase tracking-wider">D Space</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">Oct 20, 09:30 AM</td>
                        <td className="px-6 py-4 font-medium text-gray-900">Mike Chen</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                            Requested
                          </span>
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-medium">#BK-2024-0091</td>
                        <td className="px-6 py-4 text-gray-900">₹1,20,000</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold text-indigo-700 bg-indigo-100 uppercase tracking-wider">D Space</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">Oct 19, 04:15 PM</td>
                        <td className="px-6 py-4 font-medium text-gray-900">Priya Patel</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">
                            Modified
                          </span>
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-medium">#BK-2024-0088</td>
                        <td className="px-6 py-4 text-gray-900">₹45,000</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold text-emerald-700 bg-emerald-100 uppercase tracking-wider">Events</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="h-8"></div> {/* Bottom padding spacer */}
          </div>
        </main>
      </div>
    </div>
  );
}