// Phase 5 Feature 2 — admin queue for vendor onboarding applications.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  ONBOARDING_STATUSES,
  listApplications,
  setStatus,
  setKycStatus,
  type OnboardingStatus,
  type VendorApplication,
} from '@/lib/vendorOnboarding'

export default function AdminVendorApplicationsPage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin' || role === 'support'

  const [apps, setApps] = useState<VendorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<OnboardingStatus | 'all'>('submitted')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listApplications(filter === 'all' ? undefined : filter)
    setApps(data)
    if (err) setError(err)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const onStatus = async (id: string, st: OnboardingStatus) => {
    const { error: err } = await setStatus(id, st)
    if (err) setError(err)
    else load()
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Admin / support role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <AdminPageTitleRow
          title="Vendor applications"
          totalLabel={loading ? 'Loading…' : `${apps.length} in queue`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['all', ...ONBOARDING_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === s
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Business</th>
                  <th className="px-4 py-2">Applicant</th>
                  <th className="px-4 py-2">Region</th>
                  <th className="px-4 py-2">KYC</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">{a.business_name}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      <div>{a.applicant_name}</div>
                      <div className="font-mono">{a.applicant_email}</div>
                    </td>
                    <td className="px-4 py-2 text-xs uppercase">{a.region}</td>
                    <td className="px-4 py-2 text-xs">
                      <select
                        value={a.kyc_status}
                        onChange={(e) =>
                          setKycStatus(a.id, e.target.value as VendorApplication['kyc_status']).then(
                            load,
                          )
                        }
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        {['pending', 'approved', 'review', 'rejected'].map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={a.status}
                        onChange={(e) => onStatus(a.id, e.target.value as OnboardingStatus)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        {ONBOARDING_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-slate-400">
                      {a.created_at.slice(0, 10)}
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                      No applications match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}
