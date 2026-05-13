import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import {
  LISTING_SUBMITTED_KEY,
  MOGZU_PREFERRED_PORTAL_KEY,
  ONBOARDING_COMPLETED_KEY,
  VENDOR_EMAIL_VERIFY_PENDING_KEY,
  type VendorEmailVerifyPending,
} from '@/app/lib/vendorOnboardingStorage';

/**
 * Email/OTP step after listing submit — mirrors LoginPage OTP rules (6 digits, mock code 123456).
 */
export default function VendorVerifyEmailPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [emailDisplay, setEmailDisplay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(VENDOR_EMAIL_VERIFY_PENDING_KEY);
    if (!raw) {
      navigate('/signup/vendor/register', { replace: true });
      return;
    }
    try {
      const pending = JSON.parse(raw) as VendorEmailVerifyPending;
      if (pending.email?.trim()) {
        setEmailDisplay(pending.email.trim());
        return;
      }
      const completedRaw = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (completedRaw) {
        const c = JSON.parse(completedRaw) as { email?: string };
        if (c.email?.trim()) setEmailDisplay(c.email.trim());
      }
    } catch {
      navigate('/signup/vendor/register', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError('Enter a valid 6-digit code.');
      return;
    }
    if (otp.trim() !== '123456') {
      setOtpError('Incorrect code. Please try again.');
      return;
    }

    const raw = localStorage.getItem(VENDOR_EMAIL_VERIFY_PENDING_KEY);
    if (!raw) {
      navigate('/signup/vendor/register', { replace: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const pending = JSON.parse(raw) as VendorEmailVerifyPending;
      if (!pending.onboardingId) {
        navigate('/signup/vendor/register', { replace: true });
        return;
      }

      localStorage.setItem(
        LISTING_SUBMITTED_KEY,
        JSON.stringify({
          onboardingId: pending.onboardingId,
          submittedAt: Date.now(),
          spaceName: pending.spaceName ?? '',
        })
      );
      localStorage.removeItem(VENDOR_EMAIL_VERIFY_PENDING_KEY);
      localStorage.setItem(MOGZU_PREFERRED_PORTAL_KEY, 'vendor');

      navigate('/vendor/registration-complete', { replace: true });
    } catch {
      setOtpError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#0e1e3f]">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <MogzuLogo className="mb-8 h-12 w-auto max-w-[220px]" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            {emailDisplay
              ? `Enter the 6-digit code sent to ${emailDisplay}.`
              : 'Enter the 6-digit code we sent to your work email.'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Demo: use code 123456</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="vendor-otp" className="mb-1 block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="vendor-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-semibold tracking-widest focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="000000"
              />
              {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-[#1E4FCC] disabled:opacity-70"
            >
              {isSubmitting ? 'Verifying…' : 'Verify and continue'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/signup/vendor/listing" className="font-semibold text-[#2563EB] hover:underline">
              Back to listing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
