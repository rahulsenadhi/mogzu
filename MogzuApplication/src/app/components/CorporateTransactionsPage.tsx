import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { SharedHeader } from './layouts/SharedHeader';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  CreditCard,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

// Mock Data
const metrics = [
  {
    title: 'Total Billed (YTD)',
    value: '$124,500.00',
    change: '+12.5%',
    trend: 'up',
    icon: <Briefcase className="w-5 h-5 text-white" />,
    color: 'from-blue-600 to-blue-700',
  },
  {
    title: 'Mogzu SaaS Subscriptions',
    value: '$45,200.00',
    change: '+5.2%',
    trend: 'up',
    icon: <Layers className="w-5 h-5 text-blue-600" />,
    color: 'bg-white',
  },
  {
    title: 'Platform Booking Fees',
    value: '$12,350.00',
    change: '-2.4%',
    trend: 'down',
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    color: 'bg-white',
  },
  {
    title: 'Upcoming Payments',
    value: '$8,450.00',
    change: '3 Invoices',
    trend: 'neutral',
    icon: <Calendar className="w-5 h-5 text-blue-600" />,
    color: 'bg-white',
  }
];

const transactions = [
  {
    id: 'TRX-9982-1',
    date: 'Oct 24, 2024',
    description: 'Mogzu Enterprise License (Annual)',
    category: 'SaaS Subscription',
    amount: '$24,000.00',
    status: 'Completed',
    invoice: 'INV-2024-1024',
  },
  {
    id: 'TRX-9981-5',
    date: 'Oct 18, 2024',
    description: 'Corporate Offsite - Grand Hyatt',
    category: 'Event Booking',
    amount: '$12,450.00',
    status: 'Completed',
    invoice: 'INV-2024-1018',
  },
  {
    id: 'TRX-9980-2',
    date: 'Oct 15, 2024',
    description: 'WeWork All-Access Passes (x50)',
    category: 'Coworking Space',
    amount: '$14,950.00',
    status: 'Pending',
    invoice: 'INV-2024-1015',
  },
  {
    id: 'TRX-9979-4',
    date: 'Oct 12, 2024',
    description: 'Mogzu Platform Usage Fee (Q3)',
    category: 'Platform Fee',
    amount: '$3,240.00',
    status: 'Completed',
    invoice: 'INV-2024-1012',
  },
  {
    id: 'TRX-9978-8',
    date: 'Oct 05, 2024',
    description: 'Employee Gifting - Diwali Hampers',
    category: 'Gifting',
    amount: '$8,500.00',
    status: 'Completed',
    invoice: 'INV-2024-1005',
  },
  {
    id: 'TRX-9975-3',
    date: 'Sep 28, 2024',
    description: 'Team Activity - Escape Room',
    category: 'Activity Suite',
    amount: '$1,200.00',
    status: 'Failed',
    invoice: 'INV-2024-0928',
  },
  {
    id: 'TRX-9972-1',
    date: 'Sep 15, 2024',
    description: 'Mogzu Assistant Pro Add-on',
    category: 'SaaS Subscription',
    amount: '$1,800.00',
    status: 'Completed',
    invoice: 'INV-2024-0915',
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    default:
      return null;
  }
};

export default function CorporateTransactionsPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 7;
  const totalItems = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const paginatedTransactions = transactions.slice(pageStart, pageEnd);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      {/* Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="transactions"
      />

      {/* Main Content */}
      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search transactions, invoices..." />

        <MogzuCorporateScrollSurface>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Transactions</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your Mogzu SaaS billing, platform fees, and corporate spending.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/billing-invoices')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/wallet')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/20"
                >
                  <CreditCard className="w-4 h-4" />
                  Add Payment Method
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {metrics.map((metric, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-2xl p-6 shadow-sm border ${
                    metric.color.includes('bg-white') 
                      ? 'bg-white border-slate-200' 
                      : `bg-gradient-to-br ${metric.color} border-transparent text-white`
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${
                      metric.color.includes('bg-white') ? 'bg-blue-50' : 'bg-white/20'
                    }`}>
                      {metric.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      metric.color.includes('bg-white')
                        ? metric.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : metric.trend === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
                        : 'text-white/90 bg-white/20'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : metric.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium mb-1 ${
                      metric.color.includes('bg-white') ? 'text-slate-500' : 'text-blue-100'
                    }`}>{metric.title}</h3>
                    <p className={`text-2xl font-bold tracking-tight ${
                      metric.color.includes('bg-white') ? 'text-slate-900' : 'text-white'
                    }`}>{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transactions Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Table Header / Filters */}
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/corporate/budget')}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 bg-white transition-colors"
                  >
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                      <th className="px-6 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          {tx.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {tx.date}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                          {tx.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-medium hover:underline">
                          {tx.invoice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/billing-invoices');
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
                <div>
                  {totalItems === 0
                    ? 'No entries'
                    : `Showing ${pageStart + 1} to ${pageEnd} of ${totalItems} entries`}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>

                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      disabled={p > totalPages}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        currentPage === p
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      } ${p > totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
