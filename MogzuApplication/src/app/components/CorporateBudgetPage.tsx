import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { PieChart, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DepartmentBudget {
  name: string;
  allocated: number;
  spent: number;
  percentage: number;
  color: string;
}

export default function CorporateBudgetPage() {
  const navigate = useNavigate();
  const loadTimerRef = useRef<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [departments, setDepartments] = useState<DepartmentBudget[]>([]);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');
  const [exportPreview, setExportPreview] = useState<{ rows: number; totalAmount: number } | null>(null);
  const [exportForm, setExportForm] = useState({
    startDate: '',
    endDate: '',
    department: 'All',
    category: 'All',
    employee: 'All',
  });
  const [setupForm, setSetupForm] = useState({
    annualBudget: '5000000',
    venuesBudget: '1500000',
    giftingBudget: '1200000',
    eventsBudget: '1800000',
    perTransactionLimit: '100000',
    perEmployeeLimit: '50000',
  });

  const seedDepartments: DepartmentBudget[] = [
    { name: 'Marketing', allocated: 1500000, spent: 1400000, percentage: 93, color: 'bg-red-500' },
    { name: 'Sales', allocated: 2000000, spent: 1200000, percentage: 60, color: 'bg-blue-500' },
    { name: 'Engineering', allocated: 1000000, spent: 400000, percentage: 40, color: 'bg-green-500' },
    { name: 'HR & Operations', allocated: 500000, spent: 250000, percentage: 50, color: 'bg-purple-500' },
  ];

  const loadBudget = () => {
    setIsLoading(true);
    setLoadError('');
    setDepartments([]);

    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      // Demo behavior: sometimes fail to exercise error + retry UI.
      if (Math.random() < 0.12) {
        setLoadError('Unable to load budget data right now. Please retry.');
        setIsLoading(false);
        return;
      }

      setDepartments(seedDepartments);
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    loadBudget();
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasBudgetSetup = departments.length > 0;

  const budgetOverview = useMemo(() => {
    const allocated = departments.reduce((sum, d) => sum + d.allocated, 0);
    const spent = departments.reduce((sum, d) => sum + d.spent, 0);
    const remaining = Math.max(0, allocated - spent);
    const critical = departments.filter((d) => d.percentage >= 90).length;
    return { allocated, spent, remaining, critical };
  }, [departments]);

  const handleAllocateBudget = () => {
    setShowSetupForm(true);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleExportSpendReport = (format: 'csv' | 'pdf') => {
    setExportError('');
    setExportSuccess('');
    setExportPreview(null);
    setExportFormat(format);

    if (!hasBudgetSetup) {
      setExportError('Budget setup is required before exporting reports.');
      return;
    }

    if (!exportForm.startDate || !exportForm.endDate) {
      setExportError('Please select a valid date range.');
      return;
    }

    const startTs = new Date(exportForm.startDate).getTime();
    const endTs = new Date(exportForm.endDate).getTime();
    if (Number.isNaN(startTs) || Number.isNaN(endTs) || startTs > endTs) {
      setExportError('Start date must be before or equal to end date.');
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      try {
        // Demo-only: build a small mock preview based on current budget allocation.
        const deptWeight =
          exportForm.department === 'All'
            ? 1
            : Math.max(
                0.1,
                (departments.find((d) => d.name === exportForm.department)?.allocated ?? 0) /
                  Math.max(1, budgetOverview.allocated)
              );

        const categoryWeight =
          exportForm.category === 'All'
            ? 1
            : exportForm.category === 'Venues'
              ? 0.35
              : exportForm.category === 'Gifting'
                ? 0.25
                : exportForm.category === 'Events'
                  ? 0.25
                  : 0.15;

        const employeeWeight = exportForm.employee === 'All' ? 1 : 0.3;
        const simulatedTotal = Math.round(budgetOverview.spent * deptWeight * categoryWeight * employeeWeight);

        if (simulatedTotal <= 0) {
          setExportPreview({ rows: 0, totalAmount: 0 });
          setExportSuccess('No spend found for the selected filters.');
          setIsExporting(false);
          return;
        }

        const rows = Math.max(1, Math.round(simulatedTotal / 25000));
        setExportPreview({ rows, totalAmount: simulatedTotal });
        setExportSuccess(`Exported ${format.toUpperCase()} report successfully (demo).`);

        const lines = [
          `Spend Report (${format.toUpperCase()})`,
          `Date range: ${exportForm.startDate} to ${exportForm.endDate}`,
          `Department: ${exportForm.department}`,
          `Category: ${exportForm.category}`,
          `Employee: ${exportForm.employee}`,
          `Rows: ${rows}`,
          `Total amount: ${simulatedTotal}`,
        ];
        const csv = [
          ['report_type', 'start_date', 'end_date', 'department', 'category', 'employee', 'rows', 'total_amount'].join(','),
          [
            'spend_report',
            exportForm.startDate,
            exportForm.endDate,
            exportForm.department,
            exportForm.category,
            exportForm.employee,
            String(rows),
            String(simulatedTotal),
          ]
            .map((x) => `"${String(x).replace(/"/g, '""')}"`)
            .join(','),
        ].join('\n');
        const content = format === 'csv' ? csv : lines.join('\n');
        const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/pdf';
        const ext = format === 'csv' ? 'csv' : 'pdf';
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spend-report-${format}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        setExportError('Unable to export report. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }, 900);
  };

  const handleSaveBudget = () => {
    setSubmitError('');
    setSubmitSuccess('');

    const numericValues = Object.values(setupForm).map((value) => Number(value));
    const hasInvalid = numericValues.some((num) => Number.isNaN(num) || num <= 0);
    if (hasInvalid) {
      setSubmitError('All budget fields must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const venues = Number(setupForm.venuesBudget);
      const gifting = Number(setupForm.giftingBudget);
      const events = Number(setupForm.eventsBudget);
      const annual = Number(setupForm.annualBudget);
      const other = Math.max(0, annual - (venues + gifting + events));

      setDepartments([
        { name: 'Venues', allocated: venues, spent: Math.round(venues * 0.5), percentage: 50, color: 'bg-blue-500' },
        { name: 'Gifting', allocated: gifting, spent: Math.round(gifting * 0.45), percentage: 45, color: 'bg-green-500' },
        { name: 'Events', allocated: events, spent: Math.round(events * 0.62), percentage: 62, color: 'bg-purple-500' },
        { name: 'Operations', allocated: other, spent: Math.round(other * 0.4), percentage: 40, color: 'bg-red-500' },
      ]);
      setIsSubmitting(false);
      setSubmitSuccess('Budget saved and active.');
      setShowSetupForm(false);
    }, 700);
  };

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav="budget"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search budgets..." />

        <MogzuCorporateScrollSurface>
          <div className="max-w-[1400px] mx-auto px-8 py-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-[32px] font-semibold text-[#0e1e3f] leading-10">Budget Management</h1>
                <p className="text-sm text-[#878e9e] mt-1">Track departmental spending and budget allocations</p>
              </div>
              <button
                onClick={handleAllocateBudget}
                className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors"
              >
                Allocate Budget
              </button>
            </div>

            {submitError && (
              <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-sm text-gray-700">{submitError}</p>
              </div>
            )}

            {submitSuccess && (
              <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-sm text-gray-700">{submitSuccess}</p>
              </div>
            )}

            {showSetupForm && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Setup</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Annual Budget</label>
                    <input
                      value={setupForm.annualBudget}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, annualBudget: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Venues Budget</label>
                    <input
                      value={setupForm.venuesBudget}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, venuesBudget: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Gifting Budget</label>
                    <input
                      value={setupForm.giftingBudget}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, giftingBudget: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Events Budget</label>
                    <input
                      value={setupForm.eventsBudget}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, eventsBudget: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Per-Transaction Limit</label>
                    <input
                      value={setupForm.perTransactionLimit}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, perTransactionLimit: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Per-Employee Limit</label>
                    <input
                      value={setupForm.perEmployeeLimit}
                      onChange={(e) => setSetupForm((prev) => ({ ...prev, perEmployeeLimit: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={handleSaveBudget}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Budget'}
                  </button>
                  <button
                    onClick={() => setShowSetupForm(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                <p className="text-sm text-gray-500">Loading budget data...</p>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                <p className="text-sm text-gray-700 mb-3">{loadError}</p>
                <button
                  type="button"
                  onClick={loadBudget}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && !hasBudgetSetup && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Budget setup pending</h2>
                <p className="text-sm text-gray-500 mb-4">
                  No active budget found for the current financial year. Set annual and category budgets to continue.
                </p>
                <button
                  onClick={handleAllocateBudget}
                  className="px-5 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors"
                >
                  Start Budget Setup
                </button>
              </div>
            )}

            {!isLoading && !loadError && hasBudgetSetup && (
            <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#2563eb]" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Budget (FY 23-24)</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹ {budgetOverview.allocated.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Spent Till Date</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹ {budgetOverview.spent.toLocaleString()}</span>
                  <span className="flex items-center text-xs font-medium text-green-600 mb-1">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" /> {budgetOverview.allocated ? Math.round((budgetOverview.spent / budgetOverview.allocated) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PieChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Remaining Budget</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹ {budgetOverview.remaining.toLocaleString()}</span>
                  <span className="flex items-center text-xs font-medium text-purple-600 mb-1">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" /> {budgetOverview.allocated ? Math.round((budgetOverview.remaining / budgetOverview.allocated) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-sm font-medium text-red-800">Critical Departments</h3>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-red-700">{budgetOverview.critical}</span>
                  <span className="text-xs font-medium text-red-600 mt-1">Exceeding 90% allocation</span>
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Department Allocations</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {departments.map((dept, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                          <p className="text-xs text-gray-500">₹ {dept.spent.toLocaleString()} / ₹ {dept.allocated.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{dept.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${dept.color}`} style={{ width: `${dept.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spend Report Export */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Export Spend Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Filter by date range, department, category, and employee.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleExportSpendReport('csv')}
                    disabled={isExporting}
                    className="px-5 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isExporting && exportFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportSpendReport('pdf')}
                    disabled={isExporting}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isExporting && exportFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {exportError && (
                  <div className="mb-4 bg-white rounded-xl border border-red-200 shadow-sm p-4">
                    <p className="text-sm text-red-700">{exportError}</p>
                  </div>
                )}

                {exportSuccess && (
                  <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-sm text-gray-700">{exportSuccess}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Start date</label>
                    <input
                      type="date"
                      value={exportForm.startDate}
                      onChange={(e) => setExportForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">End date</label>
                    <input
                      type="date"
                      value={exportForm.endDate}
                      onChange={(e) => setExportForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Department</label>
                    <select
                      value={exportForm.department}
                      onChange={(e) => setExportForm((prev) => ({ ...prev, department: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option value="All">All</option>
                      {departments.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Category</label>
                    <select
                      value={exportForm.category}
                      onChange={(e) => setExportForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option value="All">All</option>
                      <option value="Venues">Venues</option>
                      <option value="Gifting">Gifting</option>
                      <option value="Events">Events</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Employee</label>
                    <select
                      value={exportForm.employee}
                      onChange={(e) => setExportForm((prev) => ({ ...prev, employee: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option value="All">All</option>
                      <option value="Amit Kumar">Amit Kumar</option>
                      <option value="Priya Sharma">Priya Sharma</option>
                      <option value="Rahul Verma">Rahul Verma</option>
                      <option value="Sarah Jenkins">Sarah Jenkins</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  {!exportPreview && !isExporting && (
                    <div className="p-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
                      Select a date range and export to preview spend data.
                    </div>
                  )}

                  {exportPreview && exportPreview.rows === 0 && (
                    <div className="p-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
                      No spend found for the selected filters.
                    </div>
                  )}

                  {exportPreview && exportPreview.rows > 0 && (
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Report preview</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Rows: {exportPreview.rows} • Total: ₹ {exportPreview.totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="w-4 h-4 text-[#2563eb]" />
                          <span>Ready to export</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}