import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Settings,
  Shield,
  Percent,
  FileText,
  GitBranch,
  Key,
  Webhook,
  Users,
  Bell,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { db } from '@/lib/db'
import { listAllBlocks } from '@/lib/cms'
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner'

type SettingsLink = {
  title: string
  description: string
  to: string
  icon: typeof Settings
}

const PLATFORM_LINKS: SettingsLink[] = [
  {
    title: 'SSO & identity',
    description: 'SAML/OIDC providers, domain routing, and JIT provisioning.',
    to: '/admin/sso',
    icon: Shield,
  },
  {
    title: 'Commissions',
    description: 'Global, vendor, and module commission rates.',
    to: '/admin/commissions',
    icon: Percent,
  },
  {
    title: 'CMS & marketing',
    description: 'Hero copy, announcements, and public landing blocks.',
    to: '/admin/cms',
    icon: FileText,
  },
  {
    title: 'Approval workflows',
    description: 'Corporate booking approval rules and thresholds.',
    to: '/settings/workflow',
    icon: GitBranch,
  },
  {
    title: 'API keys',
    description: 'Partner and integration API credentials.',
    to: '/admin/api-keys',
    icon: Key,
  },
  {
    title: 'Webhooks',
    description: 'Outbound event subscriptions and delivery logs.',
    to: '/admin/webhooks',
    icon: Webhook,
  },
  {
    title: 'AI policy',
    description: 'Agent autonomy, guardrails, and conversation policy.',
    to: '/admin/ai-policy',
    icon: Sparkles,
  },
  {
    title: 'HeyGenie',
    description: 'Assistant configuration (VAPI integration when enabled).',
    to: '/admin/heygenie',
    icon: Bell,
  },
  {
    title: 'Team & permissions',
    description: 'Mogzu staff roles and admin access.',
    to: '/admin/team',
    icon: Users,
  },
]

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [corporateCount, setCorporateCount] = useState<number | null>(null)
  const [vendorCount, setVendorCount] = useState<number | null>(null)
  const [cmsBlockCount, setCmsBlockCount] = useState<number | null>(null)
  const [pendingVendors, setPendingVendors] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setStatsError('')
      const [corps, vendorsActive, vendorsPending, cms] = await Promise.all([
        db.corporateAccounts.list(),
        db.vendors.listActive(),
        db.vendors.listPending(),
        listAllBlocks(),
      ])
      if (cancelled) return
      if (corps.error || vendorsActive.error) {
        setStatsError(corps.error?.message ?? vendorsActive.error?.message ?? 'Could not load platform stats.')
      }
      setCorporateCount(corps.data?.length ?? 0)
      setVendorCount(vendorsActive.data?.length ?? 0)
      setPendingVendors(vendorsPending.data?.length ?? 0)
      setCmsBlockCount(cms.data?.length ?? 0)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-6">
      <AdminPageTitleRow
        title="Admin Settings"
        totalLabel="Platform configuration hub"
      />

      {statsError ? (
        <div className="mt-4">
          <DevMockDataBanner message={statsError} />
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Corporates', value: corporateCount },
          { label: 'Active vendors', value: vendorCount },
          { label: 'Pending vendors', value: pendingVendors },
          { label: 'CMS blocks', value: cmsBlockCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? (
                <Loader2 className="size-5 animate-spin text-slate-400" aria-hidden />
              ) : (
                (stat.value ?? '—')
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Configuration
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-slate-300 group-hover:text-blue-500 mt-0.5" />
              </Link>
            )
          })}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Publish marketing copy under{' '}
        <Link to="/admin/cms" className="font-medium text-blue-600 hover:underline">
          CMS
        </Link>{' '}
        with slugs <code className="text-xs bg-slate-100 px-1 rounded">home</code>,{' '}
        <code className="text-xs bg-slate-100 px-1 rounded">why-mogzu</code>, and{' '}
        <code className="text-xs bg-slate-100 px-1 rounded">vendor-benefits</code> to override
        public pages.
      </p>
    </div>
  )
}
