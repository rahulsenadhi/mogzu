// Razorpay Checkout integration. Loads the SDK on first use; creates a
// server-side order via the edge function so the order_id ↔ payment_id
// pairing stays trustworthy (webhook confirms with the same order_id /
// notes that the order create call set).

import { supabase } from './supabase'

declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => RazorpayInstance
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler?: (response: RazorpayResponse) => void
  modal?: { ondismiss?: () => void }
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, handler: (err: unknown) => void) => void
}

export type RazorpayResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loadPromise: Promise<void> | null = null

export function loadRazorpaySdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Razorpay) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Razorpay Checkout SDK.'))
    }
    document.head.appendChild(script)
  })
  return loadPromise
}

export type CreateOrderInput = {
  amount: number
  currency?: string
  kind: 'booking_payment' | 'wallet_topup'
  bookingId?: string
  requestId?: string
}

export type CreateOrderResult = {
  ok: boolean
  order_id?: string
  amount?: number
  currency?: string
  key_id?: string
  error?: string
}

function getEdgeBaseUrl(): string {
  const env = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
  if (!env) return ''
  return `${env.replace(/\/$/, '')}/functions/v1/server/make-server-56765691`
}

export async function createRazorpayOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const base = getEdgeBaseUrl()
  if (!base) return { ok: false, error: 'VITE_SUPABASE_URL not configured.' }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) return { ok: false, error: 'Not authenticated.' }

  const res = await fetch(`${base}/razorpay-create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? 'INR',
      kind: input.kind,
      booking_id: input.bookingId,
      request_id: input.requestId,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: `create-order failed: ${text}` }
  }
  return (await res.json()) as CreateOrderResult
}

export async function openRazorpayCheckout(opts: {
  order: CreateOrderResult
  buyerName?: string
  buyerEmail?: string
  description: string
  onSuccess: (resp: RazorpayResponse) => void
  onDismiss?: () => void
}): Promise<void> {
  if (!opts.order.ok || !opts.order.order_id || !opts.order.key_id) {
    throw new Error(opts.order.error ?? 'Order creation failed.')
  }
  await loadRazorpaySdk()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('Razorpay SDK unavailable.')

  const rp = new Razorpay({
    key: opts.order.key_id,
    amount: opts.order.amount ?? 0,
    currency: opts.order.currency ?? 'INR',
    name: 'Mogzu',
    description: opts.description,
    order_id: opts.order.order_id,
    prefill: { name: opts.buyerName, email: opts.buyerEmail },
    theme: { color: '#2563eb' },
    handler: opts.onSuccess,
    modal: { ondismiss: opts.onDismiss },
  })
  rp.open()
}
