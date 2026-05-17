import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MessageSquare, Paperclip, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscribeToTable } from '@/lib/realtime'
import { storageService } from '@/lib/storage'
import type { BookingMessage, BookingMessageAttachment } from '@/lib/database.types'

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingMessagesPanel({
  bookingId,
  vendorId,
}: {
  bookingId: string
  vendorId: string
}) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<BookingMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.bookingMessages.listByBooking(bookingId)
    setMessages((data ?? []) as BookingMessage[])
    setLoading(false)
  }, [bookingId])

  useEffect(() => {
    load()
  }, [load])

  // Realtime
  useEffect(() => {
    return subscribeToTable<BookingMessage>(`messages-${bookingId}`, {
      table: 'booking_messages',
      filter: `booking_id=eq.${bookingId}`,
      onData: () => load(),
    })
  }, [bookingId, load])

  // Mark messages as read once seen
  useEffect(() => {
    if (!profile) return
    messages
      .filter((m) => m.sender_id !== profile.id && !m.read_by.includes(profile.id))
      .forEach((m) => {
        db.bookingMessages.markRead(m.id, profile.id)
      })
  }, [messages, profile])

  // Auto-scroll to bottom on new
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleFile = (files: FileList | null) => {
    if (!files) return
    const oversized = Array.from(files).find((f) => f.size > MAX_ATTACHMENT_BYTES)
    if (oversized) {
      setError(`${oversized.name} exceeds 5MB.`)
      return
    }
    setError('')
    setPendingFiles((prev) => [...prev, ...Array.from(files)])
  }

  const handleSend = async () => {
    if (!profile) return
    const trimmed = body.trim()
    if (!trimmed && pendingFiles.length === 0) return
    setSending(true)
    setError('')

    const attachments: BookingMessageAttachment[] = []
    for (const f of pendingFiles) {
      const res = await storageService.documents.upload(bookingId, f)
      if (res.error) continue
      attachments.push({ url: res.url, name: f.name, size: f.size })
    }

    const { error: sendErr } = await db.bookingMessages.send({
      booking_id: bookingId,
      sender_id: profile.id,
      body: trimmed || '(attachment)',
      attachments,
      read_by: [profile.id],
    })

    setSending(false)
    if (sendErr) {
      setError(sendErr.message)
      return
    }
    setBody('')
    setPendingFiles([])
    load()
  }

  const isVendorMessage = (m: BookingMessage) => {
    if (!profile) return false
    return profile.vendor_id === vendorId
      ? m.sender_id === profile.id
      : m.sender_id !== profile.id
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <MessageSquare className="size-4" />
        Booking chat
      </h2>

      <div
        ref={scrollerRef}
        className="mb-3 max-h-80 overflow-auto rounded-xl bg-slate-50 p-3"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No messages yet.</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => {
              const own = m.sender_id === profile?.id
              return (
                <li key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      own
                        ? 'bg-[#2563eb] text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    {m.attachments && m.attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {m.attachments.map((a, i) => (
                          <li key={i}>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1 text-xs underline ${
                                own ? 'text-white' : 'text-[#2563eb]'
                              }`}
                            >
                              <Paperclip className="size-3" />
                              {a.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p
                      className={`mt-1 text-[10px] ${own ? 'text-blue-100' : 'text-slate-400'}`}
                    >
                      {isVendorMessage(m) ? 'Vendor' : own ? 'You' : 'Booker'} ·{' '}
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Type a message…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
      />

      {pendingFiles.length > 0 && (
        <ul className="mt-2 space-y-1">
          {pendingFiles.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
              <Paperclip className="size-3" />
              {f.name} <span className="text-slate-400">({Math.round(f.size / 1024)} KB)</span>
              <button
                type="button"
                onClick={() =>
                  setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-rose-600 hover:underline"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          <Paperclip className="size-3" />
          Attach (max 5MB)
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="sr-only"
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || (!body.trim() && pendingFiles.length === 0)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {sending && <Loader2 className="size-3 animate-spin" />}
          <Send className="size-3" />
          Send
        </button>
      </div>
    </div>
  )
}
