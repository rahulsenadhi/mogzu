import { Link } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { hasListingSubmitted } from '@/app/lib/vendorOnboardingStorage';

/**
 * Shown after email/OTP verification; same card layout pattern as VendorVerificationPendingPage.
 */
export default function VendorRegistrationCompletePage() {
  const canContinue = hasListingSubmitted();

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#0e1e3f]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <MogzuLogo className="mb-8 h-12 w-auto max-w-[220px]" />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]">
            <CheckCircle2 className="h-4 w-4" />
            Registration complete
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your partner account is ready.</h1>
          <p className="mt-3 text-lg text-slate-600">
            Email verified. You can open your vendor dashboard now or sign in later from the login page.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {canContinue ? (
              <Link
                to="/vendor/welcome"
                className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-[#1E4FCC]"
              >
                Go to vendor dashboard
              </Link>
            ) : null}
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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
