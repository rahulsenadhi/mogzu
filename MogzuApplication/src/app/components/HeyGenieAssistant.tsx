import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, Mic, Send, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storageService } from '@/lib/storage'
import {
  buildBookingHref,
  findMatchingListings,
  formatIntentSummary,
  parseHeyGenieIntent,
  type HeyGenieIntent,
  type ListingMatch,
} from '@/lib/heygenie'

type Message =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; text: string; matches?: ListingMatch[]; intent?: HeyGenieIntent }

type Props = {
  open: boolean
  onClose: () => void
}

const SUGGESTIONS = [
  'Book a team lunch for 10 next Friday under ₹500 per person',
  'Find a coworking space in Bangalore for 25 people tomorrow',
  'Send Diwali gift hampers to 50 employees, budget ₹1500 each',
  'Hotel stay in Goa for 8 people next weekend',
]

export default function HeyGenieAssistant({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy || !profile?.corporate_id) return
      setInput('')
      setBusy(true)
      setMessages((m) => [...m, { kind: 'user', text }])

      const intent = parseHeyGenieIntent(text)

      if (!intent.module) {
        setMessages((m) => [
          ...m,
          {
            kind: 'assistant',
            text:
              "I can help with events, gifting, coworking, or stays. Try “Book a team lunch for 10 next Friday”.",
            intent,
          },
        ])
        await persistSession(profile.id, profile.corporate_id, text, intent, null)
        setBusy(false)
        return
      }

      let matches: ListingMatch[] = []
      try {
        matches = await findMatchingListings(intent, 3)
      } catch (err) {
        console.error('[HeyGenie] match failed', err)
      }

      const summary = formatIntentSummary(intent)
      const tail =
        matches.length === 0
          ? "I couldn’t find an active listing matching that. Try adjusting headcount, city, or budget."
          : `Here are ${matches.length} options that fit:`
      setMessages((m) => [
        ...m,
        { kind: 'assistant', text: `${summary}. ${tail}`, matches, intent },
      ])
      await persistSession(profile.id, profile.corporate_id, text, intent, null)
      setBusy(false)
    },
    [busy, profile],
  )

  const handleSelect = useCallback(
    (match: ListingMatch, intent: HeyGenieIntent) => {
      if (profile?.corporate_id) {
        void persistSession(profile.id, profile.corporate_id, intent.rawText, intent, match.listing.id)
      }
      const href = buildBookingHref(match.listing, intent)
      onClose()
      navigate(href)
    },
    [navigate, onClose, profile],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="flex h-[min(640px,90vh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-amber-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Hey Genie</p>
              <p className="text-[11px] text-slate-500">
                Ask in plain English — I’ll find listings + pre-fill your booking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-slate-900"
            aria-label="Close Hey Genie"
          >
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Try one of these:</p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSubmit(s)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} onSelect={handleSelect} />
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="size-3 animate-spin" /> Genie is thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit(input)
          }}
          className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-3"
        >
          <button
            type="button"
            disabled
            title="Voice coming soon"
            className="rounded-full p-2 text-slate-300"
            aria-label="Voice input (coming soon)"
          >
            <Mic className="size-4" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Genie anything..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            <Send className="size-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onSelect,
}: {
  message: Message
  onSelect: (m: ListingMatch, intent: HeyGenieIntent) => void
}) {
  if (message.kind === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white">
          {message.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800">
        {message.text}
      </div>
      {message.matches && message.matches.length > 0 && message.intent && (
        <div className="w-full space-y-2">
          {message.matches.map((m) => (
            <MatchCard
              key={m.listing.id}
              match={m}
              onSelect={() => onSelect(m, message.intent!)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, onSelect }: { match: ListingMatch; onSelect: () => void }) {
  const l = match.listing
  const cover = l.listing_images?.[0]
  const imgUrl =
    cover &&
    (l.module === 'gifting'
      ? storageService.giftImages.getUrl(cover.storage_path)
      : storageService.spaceImages.getUrl(cover.storage_path))
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {imgUrl && <img src={imgUrl} alt="" className="size-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{l.title}</p>
        <p className="truncate text-[11px] text-slate-500">
          {l.vendors?.business_name ?? '—'}
          {l.location_city ? ` · ${l.location_city}` : ''}
        </p>
        {match.reasons.length > 0 && (
          <p className="mt-1 line-clamp-2 text-[11px] text-emerald-700">
            {match.reasons.join(' · ')}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between">
          {l.base_price != null && (
            <span className="text-xs font-medium text-indigo-700">
              ₹ {l.base_price.toLocaleString('en-IN')}
              {l.price_unit === 'per_person' ? '/head' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={onSelect}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
          >
            Book this
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session log ─────────────────────────────────────────────────────────────

async function persistSession(
  userId: string,
  corporateId: string,
  transcript: string,
  intent: HeyGenieIntent,
  bookingId: string | null,
) {
  try {
    await db.heyGenie.logSession({
      user_id: userId,
      corporate_id: corporateId,
      transcript,
      intent: intent as unknown as Record<string, unknown>,
      resulting_booking_id: bookingId,
      modality: 'text',
    })
  } catch (err) {
    console.error('[HeyGenie] session log failed', err)
  }
}
