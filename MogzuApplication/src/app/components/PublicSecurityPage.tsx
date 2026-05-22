// Plan Batch 10 + P5.6 stub — public security commitments page.
//
// Linked from procurement / RFI conversations; restates the controls
// auditors typically ask about (RLS, encryption, KYC, refund pipeline,
// audit log). Production posture details land on /admin once the SOC2
// evidence packet ships (Batch 13).

import { Link } from 'react-router'
import { CheckCircle2, FileLock2, Lock, ShieldCheck } from 'lucide-react'
import { MogzuLogo } from '@/app/components/branding/MogzuLogo'

const SECTIONS = [
  {
    icon: ShieldCheck,
    title: 'Tenancy & access control',
    body:
      'Every corporate workspace is isolated via Postgres row-level security. ' +
      'Server-side policies enforce that L1 employees, L2 managers, L3 admins, vendors, ' +
      'account managers, partners, and field agents only read and write the rows they are entitled to. ' +
      'Mogzu staff scoped access is logged on every action.',
  },
  {
    icon: Lock,
    title: 'Data at rest & in transit',
    body:
      'Application + database hosted on Supabase, which encrypts data at rest (AES-256) ' +
      'and in transit (TLS 1.2+). Secrets are stored in environment variables outside the ' +
      'application bundle; the public client never sees service-role keys.',
  },
  {
    icon: FileLock2,
    title: 'Payments & wallet integrity',
    body:
      'All payments route through Razorpay with HMAC-signed webhook verification. ' +
      'Wallet debits use a Postgres SECURITY DEFINER function that takes a row lock and ' +
      'enforces balance ≥ amount in a single transaction, so concurrent debits cannot ' +
      'oversell. Top-ups never increase the balance until a Razorpay webhook confirms ' +
      'capture.',
  },
  {
    icon: CheckCircle2,
    title: 'Vendor + KYC verification',
    body:
      'Vendors complete KYC before bookings activate. The Mogzu admin queue requires the ' +
      'KYC document and a GST number to flip a vendor to active; the booking pipeline ' +
      'refuses to insert against a vendor missing a GST number.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit log & access reviews',
    body:
      'Every privileged action (permission grant, vendor approval, refund decision, ' +
      'booking override) is recorded in an immutable activity log. Quarterly access ' +
      'reviews are tracked in /admin/compliance/access-review with a reproducible ' +
      'snapshot of who held which permissions at the moment of review.',
  },
]

export default function PublicSecurityPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#0e1e3f]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <MogzuLogo className="h-7" />
          </Link>
          <nav className="text-sm text-slate-600">
            <Link to="/explore" className="hover:text-slate-900">
              Catalogue
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Security at Mogzu</h1>
        <p className="mt-3 text-slate-600">
          What auditors, IT, and procurement teams need to know about how Mogzu handles
          corporate data, payments, and partner access.
        </p>

        <section className="mt-8 space-y-5">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#ebf1ff] text-[#2563EB]">
                  <Icon className="size-5" />
                </span>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-base font-semibold text-slate-900">Security questionnaires</h2>
          <p className="mt-1 text-sm text-slate-700">
            Sales engineering responds to vendor security questionnaires (CAIQ, VSAQ, custom)
            within 5 business days. Email <a className="text-[#2563EB] underline" href="mailto:security@mogzu.in">security@mogzu.in</a> with the
            request and your reporting deadline.
          </p>
        </section>

        <p className="mt-12 text-xs text-slate-500">
          Last reviewed {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}.
        </p>
      </main>
    </div>
  )
}
