import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { LeadOpsBanner } from '@/app/components/leads/LeadOpsBanner'
import { LEAD_OPS } from '@/app/components/leads/leadOpsStyles'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type {
  Listing,
  QuickShare,
  QuickShareItem,
  QuickShareSubmission,
} from '@/lib/database.types'

type ItemRow = QuickShareItem & { listings?: Listing | null }

function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function AdminQuickShareDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const fromLeadFlow = Boolean(
    (location.state as { returnToLeads?: boolean } | null)?.returnToLeads,
  )
  const { profile } = useAuth()
  const [share, setShare] = useState<QuickShare | null>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [subs, setSubs] = useState<QuickShareSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [shareRes, itemRes, subRes] = await Promise.all([
      db.quickShares.getById(id),
      db.quickShares.listItems(id),
      db.quickShares.listSubmissions(id),
    ])
    if (shareRes.error || !shareRes.data) {
      setNotice(shareRes.error?.message ?? 'Share not found.')
      setLoading(false)
      return
    }
    setShare(shareRes.data as QuickShare)
    setItems(((itemRes.data ?? []) as unknown as ItemRow[]) ?? [])
    setSubs(((subRes.data ?? []) as QuickShareSubmission[]) ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const publicLink = share
    ? `${window.location.origin}/qs/${share.token}`
    : null

  const copyLink = async () => {
    if (!publicLink) return
    try {
      await navigator.clipboard.writeText(publicLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const toggleHidden = async (item: ItemRow) => {
    setBusy(item.id)
    const { error } = await db.quickShares.toggleItemHidden(item.id, !item.hidden)
    if (error) setNotice(error.message)
    else await load()
    setBusy(null)
  }

  const closeShare = async () => {
    if (!share || !profile) return
    if (!window.confirm('Close this share? It will no longer be accessible to the client.')) return
    setBusy('close')
    const { error } = await db.quickShares.close(share.id)
    if (error) setNotice(error.message)
    else {
      await db.userActivity.log(profile.id, 'quickshare.closed', 'quick_shares', share.id)
      await load()
    }
    setBusy(null)
  }

  const setSubmissionPayment = async (
    sub: QuickShareSubmission,
    status: 'pending' | 'sent' | 'paid' | 'cancelled',
  ) => {
    if (!profile) return
    let link = sub.payment_link_url ?? ''
    if (status === 'sent' && !link) {
      const supplied = window.prompt('Payment link URL (UPI / card / wallet):', '')
      if (!supplied || !supplied.trim()) return
      link = supplied.trim()
    }
    setBusy(sub.id)
    const { error } = await db.quickShares.setSubmissionPayment(
      sub.id,
      status === 'sent' ? link : (sub.payment_link_url ?? null),
      status,
    )
    if (error) setNotice(error.message)
    else {
      await db.userActivity.log(
        profile.id,
        `quickshare.submission.${status}`,
        'quick_share_submissions',
        sub.id,
        { quick_share_id: sub.quick_share_id },
      )
      await load()
    }
    setBusy(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading...
      </div>
    )
  }

  if (!share) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {notice || 'Share not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/leads?tab=catalogue')}
          className={`${LEAD_OPS.ghostBtn} min-h-[40px] px-2 text-sm`}
        >
          <ArrowLeft className="size-3.5" /> Quick Share
        </button>
        {fromLeadFlow ? (
          <Link
            to="/admin/leads?tab=inbox"
            className={`${LEAD_OPS.secondaryBtn} min-h-[40px] text-sm`}
          >
            ← Lead inbox
          </Link>
        ) : null}
      </div>

      <AdminPageTitleRow
        title={share.client_label || 'Quick share'}
        totalLabel={`${share.module} · expires ${fmt(share.expires_at)}`}
      />

      {notice ? (
        <LeadOpsBanner variant={notice.toLowerCase().includes('fail') ? 'error' : 'info'}>
          {notice}
        </LeadOpsBanner>
      ) : null}

      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-amber-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900">Share link</p>
        {publicLink && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded-md bg-white px-3 py-2 text-xs text-slate-800 shadow-sm">
              {publicLink}
            </code>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(publicLink)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle className="size-3" /> WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(publicLink)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700"
            >
              <Send className="size-3" /> Telegram
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Mogzu picks for you')}&body=${encodeURIComponent(publicLink)}`}
              className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Mail className="size-3" /> Email
            </a>
          </div>
        )}
        {share.budget_cap != null && (
          <p className="mt-2 text-[11px] text-indigo-900">
            Budget cap (admin-only): ₹ {share.budget_cap.toLocaleString('en-IN')}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 p-3 text-sm font-semibold text-slate-900">
          Items ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="p-4 text-xs text-slate-500">No items.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {it.listings?.title ?? '—'}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {it.listings?.location_city ?? ''}
                    {it.listings?.base_price != null
                      ? ` · ₹ ${it.listings.base_price.toLocaleString('en-IN')}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy === it.id}
                  onClick={() => toggleHidden(it)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${
                    it.hidden
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {it.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  {it.hidden ? 'Hidden' : 'Visible'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-100 p-3 text-sm font-semibold text-slate-900">
          Client submissions ({subs.length})
        </h3>
        {subs.length === 0 ? (
          <p className="p-4 text-xs text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {subs.map((s) => (
              <li key={s.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">
                      {s.client_name}
                      {s.client_company ? ` · ${s.client_company}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {s.client_phone ?? '—'}
                      {s.client_email ? ` · ${s.client_email}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500">Submitted {fmt(s.submitted_at)}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      s.payment_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : s.payment_status === 'sent'
                          ? 'bg-amber-50 text-amber-900 border border-amber-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {s.payment_status}
                  </span>
                </div>

                {s.selected_items.length > 0 && (
                  <ul className="ml-4 list-disc text-[11px] text-slate-700">
                    {s.selected_items.map((it, i) => (
                      <li key={i}>
                        listing <code className="text-[10px]">{it.listing_id.slice(0, 8)}</code>
                        {it.quantity ? ` · qty ${it.quantity}` : ''}
                        {it.note ? ` — ${it.note}` : ''}
                      </li>
                    ))}
                  </ul>
                )}

                {s.client_note && (
                  <p className="rounded-md bg-slate-50 p-2 text-[11px] italic text-slate-700">
                    Note: {s.client_note}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    disabled={busy === s.id}
                    onClick={() => setSubmissionPayment(s, 'sent')}
                    className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Send payment link
                  </button>
                  <button
                    type="button"
                    disabled={busy === s.id || s.payment_status !== 'sent'}
                    onClick={() => setSubmissionPayment(s, 'paid')}
                    className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    disabled={busy === s.id}
                    onClick={() => setSubmissionPayment(s, 'cancelled')}
                    className="rounded-md border border-rose-200 bg-white px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                {s.payment_link_url && (
                  <p className="break-all text-[10px] text-indigo-700">
                    Payment link: <a href={s.payment_link_url} target="_blank" rel="noreferrer">{s.payment_link_url}</a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy === 'close' || share.status !== 'active'}
          onClick={closeShare}
          className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        >
          Close share
        </button>
      </div>
    </div>
  )
}
