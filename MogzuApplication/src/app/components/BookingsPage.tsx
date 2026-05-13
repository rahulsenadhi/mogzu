import { useState, useEffect, useMemo } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { useNavigate } from 'react-router';
import { ChevronDown, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import svgPaths from '@/imports/svg-camfkj9vq4';
import imgAvatar from 'figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png';
import { VendorStatusBadge } from '/components/ui/VendorStatusBadge.tsx';
import { mapVendorStatusFromBookingStatus } from '/utils/vendorStatusMap.ts';
import { loadUnifiedBookings, migrateLegacyGiftingBookings, type UnifiedBookingRecord } from '@/app/lib/bookingRecordsStorage';
import { getBookingActionLabel } from '@/app/lib/bookingStatus';

interface Booking {
  id: string;
  name: string;
  venue: string;
  vendor: string;
  assignTo: string;
  fromDate: string;
  toDate: string;
  attendance: number;
  price: number;
  status: 'PENDING' | 'Requested' | 'PUBLISHED' | 'CONFIRMED' | 'CANCELLED' | 'INQUIRY' | 'APPROVED';
  type: 'Inquiry' | 'Request' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Approved';
}

const mockBookings: Booking[] = [
  // Booking Inquiries
  {
    id: '001015',
    name: 'Team building event',
    venue: 'Mumbai, Maharashtra',
    vendor: 'Rajesh Kumar',
    assignTo: 'Sarah Johnson',
    fromDate: 'Jul 15, 2024',
    toDate: 'Jul 16, 2024',
    attendance: 50,
    price: 8500,
    status: 'INQUIRY',
    type: 'Inquiry'
  },
  {
    id: '001016',
    name: 'Product launch',
    venue: 'Bangalore, Karnataka',
    vendor: 'Priya Sharma',
    assignTo: 'Mike Chen',
    fromDate: 'Jul 20, 2024',
    toDate: 'Jul 20, 2024',
    attendance: 100,
    price: 15000,
    status: 'INQUIRY',
    type: 'Inquiry'
  },
  {
    id: '001017',
    name: 'Conference hall',
    venue: 'Delhi, NCR',
    vendor: 'Amit Patel',
    assignTo: 'John Doe',
    fromDate: 'Aug 01, 2024',
    toDate: 'Aug 03, 2024',
    attendance: 200,
    price: 45000,
    status: 'INQUIRY',
    type: 'Inquiry'
  },
  // Booking Requests
  {
    id: '001021',
    name: 'Team meeting',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 10,
    price: 1500,
    status: 'Requested',
    type: 'Request'
  },
  {
    id: '001022',
    name: 'Office party',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 12,
    price: 4520,
    status: 'Requested',
    type: 'Request'
  },
  // Pending
  {
    id: '001018',
    name: 'Team meeting',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 15,
    price: 1500,
    status: 'PENDING',
    type: 'Pending'
  },
  {
    id: '001019',
    name: 'Client meeting',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 8,
    price: 520,
    status: 'PENDING',
    type: 'Pending'
  },
  // Confirmed
  {
    id: '001023',
    name: 'Annual meeting',
    venue: 'Mumbai, Maharashtra',
    vendor: 'Suresh Raina',
    assignTo: 'James Brown',
    fromDate: 'Jul 10, 2024',
    toDate: 'Jul 11, 2024',
    attendance: 30,
    price: 12000,
    status: 'CONFIRMED',
    type: 'Confirmed'
  },
  {
    id: '001024',
    name: 'Workshop',
    venue: 'Pune, Maharashtra',
    vendor: 'Virat Kohli',
    assignTo: 'Emily Davis',
    fromDate: 'Jul 25, 2024',
    toDate: 'Jul 25, 2024',
    attendance: 25,
    price: 8000,
    status: 'CONFIRMED',
    type: 'Confirmed'
  },
  // Cancelled
  {
    id: '001025',
    name: 'Training session',
    venue: 'Chennai, Tamil Nadu',
    vendor: 'Rohit Sharma',
    assignTo: 'David Lee',
    fromDate: 'Jun 30, 2024',
    toDate: 'Jun 30, 2024',
    attendance: 15,
    price: 3500,
    status: 'CANCELLED',
    type: 'Cancelled'
  },
  // Request Approved
  {
    id: '001026',
    name: 'Executive retreat',
    venue: 'Goa',
    vendor: 'MS Dhoni',
    assignTo: 'Lisa Wang',
    fromDate: 'Aug 15, 2024',
    toDate: 'Aug 17, 2024',
    attendance: 40,
    price: 35000,
    status: 'APPROVED',
    type: 'Approved'
  },
  {
    id: '001027',
    name: 'Gift',
    venue: '50',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 20,
    price: 4520,
    status: 'PUBLISHED',
    type: 'Approved'
  },
  {
    id: '001028',
    name: 'Birthday gift',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 50,
    price: 1520,
    status: 'PUBLISHED',
    type: 'Approved'
  },
  {
    id: '001029',
    name: 'Associate',
    venue: 'Panjim, Goa',
    vendor: 'Kapil Dev',
    assignTo: 'Kapil Dev',
    fromDate: 'Jun 21, 2024',
    toDate: 'Nov 21, 2024',
    attendance: 20,
    price: 4520,
    status: 'PUBLISHED',
    type: 'Approved'
  }
];

export default function BookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [flowBookings, setFlowBookings] = useState<Booking[]>([]);
  
  // Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search, Sort, Filter, and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load unified bookings from storage on mount
  useEffect(() => {
    migrateLegacyGiftingBookings();
    const records = loadUnifiedBookings();
    const normalized: Booking[] = records.map((item: UnifiedBookingRecord) => ({
      id: item.id,
      name: item.name,
      venue: item.venue,
      vendor: item.vendor,
      assignTo: item.assignTo,
      fromDate: item.fromDate,
      toDate: item.toDate,
      attendance: item.attendance,
      price: item.price,
      status: item.status,
      type: item.type,
    }));
    setFlowBookings(normalized);
  }, []);
  
  const allBookings = useMemo(() => [...mockBookings, ...flowBookings], [flowBookings]);

  const tabs = [
    'All',
    'Booking Inquiry',
    'Booking Request',
    'Approvals',
    'Pending',
    'Confirmed',
    'Cancelled',
    'Request approved',
    'Invoices'
  ];

  const toggleBooking = (id: string) => {
    setSelectedBookings(prev =>
      prev.includes(id) ? prev.filter(bookingId => bookingId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedBookings.length === currentItems.length && currentItems.length > 0) {
      setSelectedBookings(prev => prev.filter(id => !currentItems.some(item => item.id === id)));
    } else {
      const newSelections = new Set([...selectedBookings, ...currentItems.map(b => b.id)]);
      setSelectedBookings(Array.from(newSelections));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-500 text-white';
      case 'Requested': return 'bg-orange-400 text-white';
      case 'PUBLISHED': return 'bg-teal-500 text-white';
      case 'CONFIRMED': return 'bg-green-500 text-white';
      case 'CANCELLED': return 'bg-red-500 text-white';
      case 'INQUIRY': return 'bg-gray-500 text-white';
      case 'APPROVED': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Processing Data: Filter -> Search -> Sort
  const processedBookings = useMemo(() => {
    let result = allBookings;

    // 1. Tab Filtering
    if (activeTab !== 'All') {
      if (activeTab === 'Booking Inquiry') result = result.filter(b => b.type === 'Inquiry');
      else if (activeTab === 'Booking Request') result = result.filter(b => b.type === 'Request');
      else if (activeTab === 'Approvals') result = result.filter(b => b.type === 'Request' || b.status === 'PENDING' || b.status === 'Requested');
      else if (activeTab === 'Pending') result = result.filter(b => b.type === 'Pending');
      else if (activeTab === 'Confirmed') result = result.filter(b => b.type === 'Confirmed');
      else if (activeTab === 'Cancelled') result = result.filter(b => b.type === 'Cancelled');
      else if (activeTab === 'Request approved') result = result.filter(b => b.type === 'Approved');
      else if (activeTab === 'Invoices') result = result.filter(b => b.type === 'Confirmed' || b.type === 'Approved');
    }

    // 2. Search Query Filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.id.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.venue.toLowerCase().includes(q) ||
        b.vendor.toLowerCase().includes(q) ||
        b.assignTo.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'id_asc': return a.id.localeCompare(b.id);
        case 'id_desc': return b.id.localeCompare(a.id);
        case 'date_desc':
        default:
          return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
      }
    });

    return result;
  }, [allBookings, activeTab, searchQuery, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  // Statistics calculation based on ALL bookings (not just processed/filtered)
  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter(b => b.type === 'Pending').length,
      requests: allBookings.filter(b => b.type === 'Request').length,
      confirmed: allBookings.filter(b => b.type === 'Confirmed').length,
      cancelled: allBookings.filter(b => b.type === 'Cancelled').length,
    };
  }, [allBookings]);

  // Pagination
  const totalPages = Math.ceil(processedBookings.length / itemsPerPage);
  const currentItems = processedBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      {/* Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search bookings..." />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 font-['Montserrat']">Booking Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Total booking</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <span>+3.5%</span>
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-gray-400">than last month</span>
                    </p>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 64 40">
                    <path d="M0 30 L16 25 L32 28 L48 20 L64 15" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Pending booking</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <span>+1.2%</span>
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-gray-400">than last month</span>
                    </p>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 64 40">
                    <path d="M0 25 L16 30 L32 20 L48 25 L64 18" stroke="#f97316" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Booking request</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-cyan-500">{stats.requests}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <span>+2.4%</span>
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-gray-400">than last month</span>
                    </p>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 64 40">
                    <path d="M0 35 L16 30 L32 32 L48 25 L64 22" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Confirmed booking</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <span>+5.1%</span>
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-gray-400">than last month</span>
                    </p>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 64 40">
                    <path d="M0 30 L16 20 L32 25 L48 15 L64 10" stroke="#16a34a" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Booking Cancelled</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-red-500">{stats.cancelled}</p>
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <span>-1.5%</span>
                      <svg className="w-3 h-3 transform rotate-180" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-gray-400">than last month</span>
                    </p>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 64 40">
                    <path d="M0 20 L16 25 L32 22 L48 28 L64 30" stroke="#ef4444" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-lg border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 px-6 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    aria-current={activeTab === tab ? "page" : undefined}
                    className={`py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                      activeTab === tab
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-b-lg shadow-sm overflow-visible">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, Name, Vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSortBy('date_desc');
                      setSortDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  
                  <div className="relative flex-1 sm:flex-none">
                    <button 
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <span>Sort by</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {sortDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-20 overflow-hidden">
                          <div className="py-1">
                            <button onClick={() => { setSortBy('date_desc'); setSortDropdownOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'date_desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>Newest First</button>
                            <button onClick={() => { setSortBy('price_desc'); setSortDropdownOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'price_desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>Price: High to Low</button>
                            <button onClick={() => { setSortBy('price_asc'); setSortDropdownOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'price_asc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>Price: Low to High</button>
                            <button onClick={() => { setSortBy('id_desc'); setSortDropdownOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'id_desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>ID: Descending</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={currentItems.length > 0 && currentItems.every(b => selectedBookings.includes(b.id))}
                          onChange={toggleAll}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue / City</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign to</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((booking) => (
                        <tr 
                          key={booking.id} 
                          onClick={() => navigate(`/bookings/${booking.id}`, { state: { booking, fromTab: activeTab } })}
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedBookings.includes(booking.id)}
                              onChange={() => toggleBooking(booking.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{booking.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{booking.venue}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <img src={imgAvatar} alt={booking.vendor} className="w-6 h-6 rounded-full bg-gray-100" />
                              <span className="text-sm text-gray-900">{booking.vendor}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <img src={imgAvatar} alt={booking.assignTo} className="w-6 h-6 rounded-full bg-gray-100" />
                              <span className="text-sm text-gray-900">{booking.assignTo}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="text-gray-900">{booking.fromDate}</div>
                            {booking.toDate !== booking.fromDate && <div className="text-xs text-gray-500 mt-0.5">to {booking.toDate}</div>}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{booking.attendance}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">₹ {booking.price.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <VendorStatusBadge
                              status={mapVendorStatusFromBookingStatus(
                                booking.status === 'PUBLISHED' || booking.status === 'APPROVED'
                                  ? 'CONFIRMED'
                                  : booking.status
                              ).displayStatus}
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bookings/${booking.id}`, { state: { booking, fromTab: activeTab } });
                              }}
                              className="inline-flex min-h-[36px] items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                              {getBookingActionLabel(booking.status)}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                          No bookings found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    {getPageNumbers().map((page, index) => (
                      <button 
                        key={index}
                        disabled={page === '...'}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                          page === currentPage 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : page === '...' 
                              ? 'text-gray-500 cursor-default' 
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
