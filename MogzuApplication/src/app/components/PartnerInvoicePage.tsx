import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Loader2, Printer } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { Partner } from '@/lib/database.types'

type InvoiceRow = {
  id: string
  corporate_id: string
  listing_id: string
  module: string
  status: string
  group_size: number | null
  total_amount: number | null
  base_amount: number | null
  add_ons_amount: number
  platform_fee: number
  partner_id: string | null
  partner_markup_pct: number | null
  partner_margin_amount: number | null
  partner_invoice_token: string
  created_at: string
  listing_title: string | null
  listing_city: string | null
  corporate_name: string | null
}

type InvoiceBundle = {
  booking: InvoiceRow
  partner: Partner
}

export default function PartnerInvoicePage() {
  const { token } = useParams<{ token: string }>()
  const [bundle, setBundle] = useState<InvoiceBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) {
        setError('Invoice token missing.')
        setLoading(false)
        return
      }
      // Public access flows through a SECURITY DEFINER RPC that returns at
      // most one row matching the exact token. The bookings table itself is
      // not readable without auth.
      const { data: rows, error: bErr } = await supabase.rpc(
        'get_booking_by_invoice_token',
        { p_token: token },
      )
      if (cancelled) return
      if (bErr) {
        setError(bErr.message)
        setLoading(false)
        return
      }
      const row = (rows as InvoiceRow[] | null)?.[0]
      if (!row) {
        setError('Invoice not found.')
        setLoading(false)
        return
      }
      if (!row.partner_id) {
        setError('Booking is not partner-managed.')
        setLoading(false)
        return
      }
      const { data: partner, error: pErr } = await db.partners.getById(row.partner_id)
      if (cancelled) return
      if (pErr || !partner) {
        setError(pErr?.message ?? 'Partner not found.')
        setLoading(false)
        return
      }
      setBundle({ booking: row, partner: partner as Partner })
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !bundle) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <p className="text-sm text-rose-700">{error || 'Invoice not available.'}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-500 underline">
          Back to Mogzu
        </Link>
      </div>
    )
  }

  const { booking, partner } = bundle
  const baseTotal = (booking.base_amount ?? 0) + booking.add_ons_amount
  const issued = booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-IN') : '—'
  const invoiceNo = booking.id.slice(0, 8).toUpperCase()

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-lg print:shadow-none">
        <header className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {partner.business_name || partner.full_name}
            </h1>
            <p className="mt-1 text-xs text-slate-500">{partner.email}</p>
            {partner.phone && <p className="text-xs text-slate-500">{partner.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Invoice</p>
            <p className="text-lg font-semibold text-slate-900">#{invoiceNo}</p>
            <p className="text-xs text-slate-500">Issued {issued}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-6 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Bill to</p>
            <p className="mt-1 font-medium text-slate-900">
              {booking.corporate_name ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Booking reference</p>
            <p className="mt-1 font-mono text-slate-700">{booking.id}</p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4 pr-3">Description</th>
                <th className="py-3 pr-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="py-3 pl-4 pr-3">
                  <p className="font-medium text-slate-900">{booking.listing_title ?? 'Booking'}</p>
                  <p className="text-xs text-slate-500">
                    {booking.module} · {booking.listing_city ?? ''} ·{' '}
                    {booking.group_size ?? '—'} guests
                  </p>
                </td>
                <td className="py-3 pr-4 text-right text-slate-900">
                  ₹ {baseTotal.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-t border-slate-100 text-slate-500">
                <td className="py-2 pl-4 pr-3">Platform fee</td>
                <td className="py-2 pr-4 text-right">
                  ₹ {Number(booking.platform_fee).toLocaleString('en-IN')}
                </td>
              </tr>
              {booking.partner_margin_amount != null && booking.partner_margin_amount > 0 && (
                <tr className="border-t border-slate-100 text-slate-500">
                  <td className="py-2 pl-4 pr-3">
                    Partner fee ({Number(booking.partner_markup_pct ?? 0)}%)
                  </td>
                  <td className="py-2 pr-4 text-right">
                    ₹ {Number(booking.partner_margin_amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
                <td className="py-3 pl-4 pr-3 text-slate-900">Total</td>
                <td className="py-3 pr-4 text-right text-slate-900">
                  ₹ {Number(booking.total_amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 print:hidden">
          <p>Powered by Mogzu</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Printer className="size-3" /> Print / save as PDF
          </button>
        </footer>
      </div>
    </div>
  )
}
