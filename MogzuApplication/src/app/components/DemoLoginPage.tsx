/**
 * DEV-ONLY demo persona selector.
 * Injects a mock UserProfile into localStorage so the full app is navigable
 * without real Supabase credentials.  Never rendered in production.
 */
import { useNavigate } from 'react-router'
import { setDemoProfile } from '@/lib/auth'
import type { UserProfile, UserRole } from '@/lib/database.types'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'

if (!import.meta.env.DEV) {
  throw new Error('DemoLoginPage must never be imported in production builds.')
}

interface Persona {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  badge: string
  badgeColor: string
  description: string
  landingPath: string
}

const DEMO_CORP_ID = 'demo-corp-001'

const PERSONAS: Persona[] = [
  {
    id: 'l1',
    name: 'Riya Sharma',
    email: 'riya.sharma@acme.in',
    role: 'l1_employee',
    department: 'Engineering',
    badge: 'L1 Employee',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: 'Browse spaces, book events & gifts, submit approval requests.',
    landingPath: '/dashboard',
  },
  {
    id: 'l2',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@acme.in',
    role: 'l2_manager',
    department: 'Product',
    badge: 'L2 Manager',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    description: 'Approve team bookings, manage budget, view reports.',
    landingPath: '/dashboard',
  },
  {
    id: 'l3',
    name: 'Priya Iyer',
    email: 'priya.iyer@acme.in',
    role: 'l3_admin',
    department: 'Operations',
    badge: 'L3 Admin',
    badgeColor: 'bg-violet-100 text-violet-700',
    description: 'Full corporate admin: team management, approvals & policies.',
    landingPath: '/dashboard',
  },
  {
    id: 'vendor',
    name: 'Karan Patel',
    email: 'karan@demovenue.in',
    role: 'vendor',
    badge: 'Vendor',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Manage listings, view enquiries, respond to bookings.',
    landingPath: '/vendor/dashboard',
  },
  {
    id: 'admin',
    name: 'Mogzu Admin',
    email: 'admin@mogzu.com',
    role: 'mogzu_admin',
    badge: 'Mogzu Admin',
    badgeColor: 'bg-rose-100 text-rose-700',
    description: 'Platform-wide visibility: users, vendors, finance & ops.',
    landingPath: '/admin/dashboard',
  },
  {
    id: 'am',
    name: 'Deepa Nair',
    email: 'deepa@mogzu.com',
    role: 'account_manager',
    badge: 'Account Manager',
    badgeColor: 'bg-teal-100 text-teal-700',
    description: 'Manage corporate client relationships & onboarding.',
    landingPath: '/am/dashboard',
  },
]

function buildDemoProfile(p: Persona): UserProfile {
  const now = new Date().toISOString()
  return {
    id: `demo-${p.id}`,
    email: p.email,
    full_name: p.name,
    role: p.role,
    available_roles: [],
    corporate_id: p.role === 'l1_employee' || p.role === 'l2_manager' || p.role === 'l3_admin' ? DEMO_CORP_ID : null,
    vendor_id: p.role === 'vendor' ? 'demo-vendor-001' : null,
    phone: null,
    avatar_url: null,
    department: p.department ?? null,
    employee_id: null,
    kyc_status: 'verified',
    is_active: true,
    status: 'active',
    invited_by: null,
    invited_at: null,
    locale: 'en-IN',
    preferred_currency: null,
    created_at: now,
    updated_at: now,
  } as unknown as UserProfile
}

export default function DemoLoginPage() {
  const navigate = useNavigate()

  const handleSelect = (p: Persona) => {
    setDemoProfile(buildDemoProfile(p))
    window.location.href = p.landingPath // hard reload so AuthProvider re-initialises
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#fff8f0] to-[#fff3e6] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MogzuLogo variant="wordmark" className="h-10 w-40" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Demo Mode</h1>
        <p className="text-sm text-slate-500">
          Pick a persona to explore the platform — no login required.
        </p>
        <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Dev only — not shown in production
        </span>
      </div>

      {/* Persona Grid */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p)}
            className="group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#fa8d40]/50 transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fa8d40] to-[#ff6b35] flex items-center justify-center text-white text-lg font-bold mb-4 group-hover:scale-105 transition-transform">
              {p.name.charAt(0)}
            </div>

            {/* Name + badge */}
            <div className="mb-2">
              <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
              <p className="text-xs text-slate-400">{p.email}</p>
            </div>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-3 ${p.badgeColor}`}>
              {p.badge}
            </span>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>

            {/* CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#fa8d40] group-hover:underline">
                Enter as {p.badge} →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Real login link */}
      <p className="mt-10 text-xs text-slate-400">
        Have real credentials?{' '}
        <button
          type="button"
          className="text-[#2563eb] hover:underline"
          onClick={() => navigate('/login')}
        >
          Log in with Supabase
        </button>
      </p>
    </div>
  )
}
