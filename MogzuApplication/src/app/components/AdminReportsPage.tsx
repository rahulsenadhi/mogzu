import { Link } from 'react-router'
import {
  ArrowRight,
  BarChart3,
  Building2,
  LayoutDashboard,
  Receipt,
  Scale,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'

const REPORT_CARDS = [
  {
    to: '/admin',
    title: 'Admin dashboard',
    description: 'Platform KPIs, revenue trends, and quick actions.',
    Icon: LayoutDashboard,
    iconColor: '#2563EB',
    tint: '#EFF6FF',
  },
  {
    to: '/admin/transactions',
    title: 'Transactions',
    description: 'Booking and payment activity across all modules.',
    Icon: Receipt,
    iconColor: '#7C3AED',
    tint: '#F5F3FF',
  },
  {
    to: '/admin/finance/reconciliation',
    title: 'Finance reconciliation',
    description: 'Match payouts, fees, and ledger entries.',
    Icon: Scale,
    iconColor: '#059669',
    tint: '#ECFDF5',
  },
  {
    to: '/corporate/spend-report',
    title: 'Corporate spend report',
    description: 'Organisation-level spend breakdown and exports.',
    Icon: Building2,
    iconColor: '#D97706',
    tint: '#FFFBEB',
  },
] as const

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf1ff] via-[#f8fbff] to-[#fff2f8] px-6 py-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#1E4DB7]">
            <BarChart3 className="size-3.5" />
            Reports hub
          </span>
          <AdminPageTitleRow
            title="Reports"
            totalLabel="Choose a report destination"
            className="mt-3"
          />
          <p className="mt-2 text-sm text-slate-500">
            Jump to dashboards and finance views without hunting through the sidebar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {REPORT_CARDS.map(({ to, title, description, Icon, iconColor, tint }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(37,99,235,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]/60"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-100"
                  style={{ color: iconColor, backgroundColor: tint }}
                >
                  <Icon className="size-6" strokeWidth={2} />
                </span>
                <ArrowRight className="size-5 text-slate-300 transition-colors group-hover:text-[#2563EB]" />
              </div>
              <h2 className="mt-4 text-base font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
