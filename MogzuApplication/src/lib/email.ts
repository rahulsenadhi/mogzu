// Email service via Resend — call only from server-side or edge functions.
// Never call Resend directly from frontend components.
// In production these run as Supabase Edge Functions.

const RESEND_API_URL = 'https://api.resend.com/emails'

type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

type EmailResult = {
  id: string | null
  error: string | null
}

async function send(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = import.meta.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping send in dev')
    return { id: 'dev-skip', error: null }
  }

  const from = import.meta.env.RESEND_FROM_EMAIL ?? 'noreply@mogzu.com'

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, ...payload }),
  })

  if (!res.ok) {
    const err = await res.text()
    return { id: null, error: err }
  }

  const data = await res.json()
  return { id: data.id, error: null }
}

// ─── Transactional email templates ───────────────────────────────────────────

export const emailService = {
  bookingConfirmed: (to: string, params: { bookingRef: string; vendorName: string; date: string }) =>
    send({
      to,
      subject: `Booking confirmed — ${params.bookingRef}`,
      html: `<h2>Your booking is confirmed</h2>
<p>Vendor: <strong>${params.vendorName}</strong></p>
<p>Date: <strong>${params.date}</strong></p>
<p>Reference: <strong>${params.bookingRef}</strong></p>
<p>You'll receive event details from the vendor closer to the date.</p>`,
    }),

  bookingApprovalRequired: (
    to: string,
    params: { requesterName: string; amount: number; bookingRef: string; approvalUrl: string },
  ) =>
    send({
      to,
      subject: `Approval required — ₹${params.amount.toLocaleString('en-IN')} booking request`,
      html: `<h2>Booking Approval Required</h2>
<p><strong>${params.requesterName}</strong> has submitted a booking request for ₹${params.amount.toLocaleString('en-IN')}.</p>
<p>Reference: <strong>${params.bookingRef}</strong></p>
<p><a href="${params.approvalUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Review &amp; Approve</a></p>`,
    }),

  bookingCancelled: (
    to: string,
    params: { bookingRef: string; reason: string },
  ) =>
    send({
      to,
      subject: `Booking cancelled — ${params.bookingRef}`,
      html: `<h2>Booking Cancelled</h2>
<p>Your booking <strong>${params.bookingRef}</strong> has been cancelled.</p>
<p>Reason: ${params.reason}</p>
<p>If you have questions, contact your account manager.</p>`,
    }),

  vendorBookingRequest: (
    to: string,
    params: { bookingRef: string; corporateName: string; date: string; headcount: number; confirmUrl: string },
  ) =>
    send({
      to,
      subject: `New booking request — ${params.bookingRef}`,
      html: `<h2>New Booking Request</h2>
<p>Client: <strong>${params.corporateName}</strong></p>
<p>Date: <strong>${params.date}</strong></p>
<p>Headcount: <strong>${params.headcount}</strong></p>
<p>Please confirm or decline within <strong>24 hours</strong>.</p>
<p><a href="${params.confirmUrl}" style="background:#22c55e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">View &amp; Respond</a></p>`,
    }),

  walletTopUpConfirmed: (
    to: string,
    params: { amount: number; newBalance: number },
  ) =>
    send({
      to,
      subject: `Wallet topped up — ₹${params.amount.toLocaleString('en-IN')}`,
      html: `<h2>Wallet Top-Up Confirmed</h2>
<p>₹${params.amount.toLocaleString('en-IN')} has been added to your Mogzu wallet.</p>
<p>New balance: <strong>₹${params.newBalance.toLocaleString('en-IN')}</strong></p>`,
    }),

  vendorApproved: (to: string, params: { businessName: string; dashboardUrl: string }) =>
    send({
      to,
      subject: 'Your Mogzu vendor account is approved',
      html: `<h2>Welcome to Mogzu, ${params.businessName}!</h2>
<p>Your vendor account has been approved. You can now:</p>
<ul>
<li>Add your listings</li>
<li>Set your availability</li>
<li>Receive booking requests</li>
</ul>
<p><a href="${params.dashboardUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Go to Dashboard</a></p>`,
    }),
}
