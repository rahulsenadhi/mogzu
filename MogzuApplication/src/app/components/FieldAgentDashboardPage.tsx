import { ShieldAlert } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'
import { useAuth } from '@/lib/auth'

export default function FieldAgentDashboardPage() {
  const { role, profile, signOut } = useAuth()

  if (role !== 'field_agent' && role !== 'mogzu_admin') {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Field agent access required.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <MogzuLogo className="mx-auto mb-4 h-10" />
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome, {profile?.full_name ?? 'Field Agent'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Field agent tooling — OTP proof, photo uploads, GPS check-in — ships with Feature 2 (Live
        Status Tracker). Until then this dashboard is a placeholder confirming your sub-user
        account is active.
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-6 rounded-md border border-slate-200 px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
      >
        Sign out
      </button>
    </div>
  )
}
