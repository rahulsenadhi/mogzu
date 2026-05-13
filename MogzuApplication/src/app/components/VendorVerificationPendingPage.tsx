import { Link } from 'react-router';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

export default function VendorVerificationPendingPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#0e1e3f]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <MogzuLogo className="mb-8 h-12 w-auto max-w-[220px]" />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]">
            <CheckCircle2 className="h-4 w-4" />
            Application submitted
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Thanks for registering as a Mogzu partner.
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Our team will get in touch with you shortly to complete verification.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <Mail className="mt-0.5 h-5 w-5 text-[#2563EB]" />
              <p className="text-slate-700">You will receive an email once verification is done.</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[#2563EB]" />
              <p className="text-slate-700">After approval, your vendor dashboard access will be activated.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-[#1E4FCC]"
            >
              Go to home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
