// Phase 5 Feature 6 — SOC2 evidence packet builder.
//
// One-click CSV bundle for auditor handoff. Pulls (a) audit events
// across the chosen window, (b) every access_reviews row, (c) every
// ai_autonomy_settings row, (d) every security_questionnaires row.
// Each table downloads as its own CSV file because the browser can't
// produce a real zip without a heavyweight dep — multi-file is fine
// for SOC2 evidence binders that get re-zipped server-side anyway.

import { useCallback, useState } from 'react'
import { Download, Loader2, ShieldAlert, AlertCircle, FileCheck2 } from 'lucide-react'
import { AdminComplianceNavChips } from '@/app/components/admin/AdminComplianceNavChips'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { MOGZU_CTA_GRADIENT,
  MOGZU_FILTER_SIDEBAR,
  MOGZU_MODULE_CONTAINER,
  MOGZU_PRODUCT_CARD,
} from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import { exportAuditEvents, toCsv as toAuditCsv } from '@/lib/auditLog'
import { listReviews, listQuestionnaires } from '@/lib/accessReviews'
import { listAllSettings } from '@/lib/aiAutonomy'

function escape(val: unknown): string {
  if (val == null) return ''
  const s = typeof val === 'object' ? JSON.stringify(val) : String(val)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function rowsToCsv<T extends Record<string, unknown>>(rows: T[], cols: string[]): string {
  const lines = [cols.join(',')]
  for (const r of rows) {
    lines.push(cols.map((c) => escape(r[c])).join(','))
  }
  return lines.join('\n')
}

function download(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AdminSoc2EvidencePage() {
  const { role } = useAuth()
  const isAdmin = role === 'mogzu_admin'

  const today = new Date().toISOString().slice(0, 10)
  const ninetyAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const [from, setFrom] = useState(ninetyAgo)
  const [to, setTo] = useState(today)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Record<string, number>>({})

  const fetchAudit = useCallback(async () => {
    setBusy('audit')
    setError('')
    const { data, error: err } = await exportAuditEvents({
      from: new Date(from),
      to: new Date(to + 'T23:59:59'),
      limit: 100_000,
    })
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    download(toAuditCsv(data), `soc2_audit_${from}_${to}.csv`)
    setStatus((s) => ({ ...s, audit: data.length }))
  }, [from, to])

  const fetchAccessReviews = useCallback(async () => {
    setBusy('reviews')
    setError('')
    const { data, error: err } = await listReviews()
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    const csv = rowsToCsv(
      data as unknown as Record<string, unknown>[],
      [
        'id',
        'scheduled_for',
        'reviewed_by',
        'reviewed_at',
        'status',
        'notes',
        'decisions',
        'snapshot',
      ],
    )
    download(csv, `soc2_access_reviews_${today}.csv`)
    setStatus((s) => ({ ...s, reviews: data.length }))
  }, [today])

  const fetchAutonomy = useCallback(async () => {
    setBusy('autonomy')
    setError('')
    const { data, error: err } = await listAllSettings()
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    const csv = rowsToCsv(
      data as unknown as Record<string, unknown>[],
      [
        'corporate_id',
        'is_enabled',
        'spend_cap_inr',
        'blocked_categories',
        'updated_by',
        'updated_at',
      ],
    )
    download(csv, `soc2_ai_autonomy_${today}.csv`)
    setStatus((s) => ({ ...s, autonomy: data.length }))
  }, [today])

  const fetchQuestionnaires = useCallback(async () => {
    setBusy('quest')
    setError('')
    const { data, error: err } = await listQuestionnaires()
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    const csv = rowsToCsv(
      data as unknown as Record<string, unknown>[],
      [
        'id',
        'requester_email',
        'requester_company',
        'source',
        'status',
        'created_at',
        'updated_at',
        'filled_at',
        'questionnaire_payload',
        'filled_payload',
      ],
    )
    download(csv, `soc2_security_questionnaires_${today}.csv`)
    setStatus((s) => ({ ...s, quest: data.length }))
  }, [today])

  const exportAll = useCallback(async () => {
    setBusy('all')
    await fetchAudit()
    await fetchAccessReviews()
    await fetchAutonomy()
    await fetchQuestionnaires()
    setBusy(null)
  }, [fetchAudit, fetchAccessReviews, fetchAutonomy, fetchQuestionnaires])

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="mb-3 size-10 text-amber-500" />
        <p className="text-base font-semibold text-amber-800">Access restricted</p>
        <p className="mt-1 text-sm text-slate-500">mogzu_admin role required.</p>
      </div>
    )
  }

  const cards: Array<{
    id: string
    title: string
    body: string
    count: number | undefined
    onClick: () => void | Promise<void>
  }> = [
    {
      id: 'audit',
      title: 'Audit events',
      body: `audit_events_unified rows between ${from} and ${to}.`,
      count: status.audit,
      onClick: fetchAudit,
    },
    {
      id: 'reviews',
      title: 'Access reviews',
      body: 'Quarterly access_reviews with snapshot + decisions.',
      count: status.reviews,
      onClick: fetchAccessReviews,
    },
    {
      id: 'autonomy',
      title: 'AI autonomy policy',
      body: 'ai_autonomy_settings per corporate (spend caps + blocklists).',
      count: status.autonomy,
      onClick: fetchAutonomy,
    },
    {
      id: 'quest',
      title: 'Security questionnaires',
      body: 'Vendor + customer security questionnaires history.',
      count: status.quest,
      onClick: fetchQuestionnaires,
    },
  ]

  return (
    <div className={`${MOGZU_MODULE_CONTAINER} mx-auto w-full space-y-5 py-2`}>
      <div className="rounded-2xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl shadow-[0_16px_36px_rgba(37,99,235,0.12)]">
        <AdminPageTitleRow title="SOC2 evidence packet" totalLabel="Quarterly handoff" />
        <p className="mt-1 text-[14px] text-[#64748b]">
          One-click CSV bundle for auditor handoff — audit events, access reviews, AI policy, questionnaires.
        </p>
        <div className="mt-4">
          <AdminComplianceNavChips active="soc2" />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      <section className={MOGZU_FILTER_SIDEBAR}>
        <h2 className="text-sm font-bold text-[#0e1e3f]">Audit window</h2>
        <p className="text-xs text-slate-500">Defaults to last 90 days. Affects the audit events CSV only.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void exportAll()}
            className={`inline-flex items-center gap-1.5 ${MOGZU_CTA_GRADIENT} !bg-[linear-gradient(135deg,#059669,#10b981)] disabled:opacity-40`}
          >
            {busy === 'all' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileCheck2 className="size-4" />
            )}
            Export full packet
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.id} className={`${MOGZU_PRODUCT_CARD} p-5`}>
            <h3 className="text-base font-bold text-[#0e1e3f]">{c.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{c.body}</p>
            {c.count !== undefined && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <FileCheck2 className="size-3" /> Exported {c.count} row
                {c.count === 1 ? '' : 's'}
              </p>
            )}
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void c.onClick()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur-sm hover:border-[#93c5fd] disabled:opacity-40"
            >
              {busy === c.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download CSV
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
