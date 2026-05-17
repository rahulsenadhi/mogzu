import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  MessageCircle,
  Send,
  ShieldAlert,
  Star,
  UserPlus,
} from 'lucide-react'
import { VendorAppShell } from './layouts/VendorAppShell'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Listing, Review, ReviewInvite } from '@/lib/database.types'

type ReviewRow = Review & { listings: { title: string | null } | null }

const MAX_INVITES_PER_MONTH = 10

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function VendorReviewsPage() {
  const { vendorId } = useAuth()

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [invites, setInvites] = useState<ReviewInvite[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeListingId, setComposeListingId] = useState('')
  const [composeEmail, setComposeEmail] = useState('')
  const [composeName, setComposeName] = useState('')
  const [composing, setComposing] = useState(false)

  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)
    const [rRes, iRes, lRes] = await Promise.all([
      db.reviews.listByVendor(vendorId),
      db.reviewInvites.listByVendor(vendorId),
      db.listings.listByVendor(vendorId),
    ])
    setReviews((rRes.data ?? []) as ReviewRow[])
    setInvites((iRes.data ?? []) as ReviewInvite[])
    setListings((lRes.data ?? []) as Listing[])
    setLoading(false)
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  const monthInvites = useMemo(() => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return invites.filter((i) => new Date(i.created_at) >= start).length
  }, [invites])

  const handleInvite = async () => {
    if (!vendorId) return
    if (monthInvites >= MAX_INVITES_PER_MONTH) {
      setNotice(`Limit reached (${MAX_INVITES_PER_MONTH}/month).`)
      return
    }
    if (!composeEmail.trim() || !composeEmail.includes('@')) {
      setNotice('Valid email required.')
      return
    }
    setComposing(true)
    const { error } = await db.reviewInvites.create({
      vendor_id: vendorId,
      listing_id: composeListingId || null,
      recipient_email: composeEmail.trim().toLowerCase(),
      recipient_name: composeName.trim() || null,
      token: randomToken(),
      used_at: null,
    })
    setComposing(false)
    if (error) {
      setNotice(`Failed: ${error.message}`)
      return
    }
    setNotice(
      `Invite queued. Email will go out via Resend when the worker drains. ${monthInvites + 1}/${MAX_INVITES_PER_MONTH} used this month.`,
    )
    setComposeEmail('')
    setComposeName('')
    setComposeOpen(false)
    load()
  }

  const handleReply = async (review: ReviewRow) => {
    const draft = (replyDraft[review.id] ?? '').trim()
    if (!draft) return
    setReplying(review.id)
    await db.reviews.setReply(review.id, draft)
    setReplying(null)
    setReplyDraft((p) => ({ ...p, [review.id]: '' }))
    load()
  }

  if (!vendorId) {
    return (
      <VendorAppShell activeNav="orders" routeSource="vendor-reviews">
        <main className="flex min-h-full items-center justify-center bg-transparent p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
            <p className="text-sm text-amber-800">Vendor account required.</p>
          </div>
        </main>
      </VendorAppShell>
    )
  }

  return (
    <VendorAppShell activeNav="orders" routeSource="vendor-reviews">
      <main className="min-h-full w-full bg-transparent">
        <section className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Reviews</h1>
              <p className="text-sm text-slate-500">
                Reviews from completed bookings post directly. Invite past clients to seed
                pre-platform reviews (admin-approved before going live).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <UserPlus className="size-4" />
              Invite past client ({monthInvites}/{MAX_INVITES_PER_MONTH})
            </button>
          </div>

          {notice && (
            <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {notice}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <MessageCircle className="mx-auto mb-2 size-10 text-slate-300" />
              <p className="text-sm text-slate-500">No reviews yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {r.reviewer_name ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.listings?.title ?? '—'} ·{' '}
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                        {r.source === 'invite' && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Pre-platform review
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`size-4 ${n <= r.rating ? 'text-amber-500' : 'text-slate-200'}`}
                          fill={n <= r.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          r.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{r.body}</p>

                  {r.vendor_reply ? (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <p className="text-[11px] font-semibold text-blue-700">Your reply</p>
                      <p className="mt-1 text-sm text-blue-900">{r.vendor_reply}</p>
                    </div>
                  ) : r.status === 'approved' ? (
                    <div className="mt-3">
                      <textarea
                        value={replyDraft[r.id] ?? ''}
                        onChange={(e) =>
                          setReplyDraft((p) => ({ ...p, [r.id]: e.target.value }))
                        }
                        rows={2}
                        placeholder="Reply publicly (one reply per review)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReply(r)}
                          disabled={replying === r.id || !(replyDraft[r.id] ?? '').trim()}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {replying === r.id && <Loader2 className="size-3 animate-spin" />}
                          <Send className="size-3" />
                          Post reply
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {composeOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Invite past client</h2>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Listing (optional)
                </label>
                <select
                  value={composeListingId}
                  onChange={(e) => setComposeListingId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <option value="">Generic invite (no specific listing)</option>
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recipient email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={composeEmail}
                  onChange={(e) => setComposeEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recipient name (optional)
                </label>
                <input
                  value={composeName}
                  onChange={(e) => setComposeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </div>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Pre-platform reviews enter the admin approval queue before going live and are
                badged "Pre-platform review".
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={composing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {composing && <Loader2 className="size-4 animate-spin" />}
                  Send invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VendorAppShell>
  )
}
