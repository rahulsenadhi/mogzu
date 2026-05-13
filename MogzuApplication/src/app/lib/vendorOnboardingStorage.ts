export const ONBOARDING_DRAFT_KEY = 'mogzu_vendor_onboarding_draft';
export const ONBOARDING_COMPLETED_KEY = 'mogzu_vendor_onboarding_completed';
export const LISTING_DRAFT_KEY = 'mogzu_vendor_listing_draft';
export const LISTING_SUBMITTED_KEY = 'mogzu_vendor_listing_submitted';
/** Set after listing API succeeds; cleared after email/OTP step completes. */
export const VENDOR_EMAIL_VERIFY_PENDING_KEY = 'mogzu_vendor_email_verify_pending';

export type VendorEmailVerifyPending = {
  onboardingId: string;
  email?: string;
  spaceName?: string;
};

type OnboardingCompletedShape = {
  onboardingId?: string;
};

export function hasOnboardingCompleted(): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as OnboardingCompletedShape;
    return Boolean(parsed?.onboardingId);
  } catch {
    return false;
  }
}

export function hasListingSubmitted(): boolean {
  return Boolean(localStorage.getItem(LISTING_SUBMITTED_KEY));
}

export function hasVendorEmailVerifyPending(): boolean {
  return Boolean(localStorage.getItem(VENDOR_EMAIL_VERIFY_PENDING_KEY));
}

/**
 * Single source of truth for partner entry routing (landing “Partner with us”, /register, etc.).
 * Matches previous VendorRegisterEntryPage useEffect logic.
 */
export function getVendorSignupRedirectPath(): string {
  try {
    const hasOnboardingDraft = Boolean(localStorage.getItem(ONBOARDING_DRAFT_KEY));
    const hasListingDraft = Boolean(localStorage.getItem(LISTING_DRAFT_KEY));
    const onboardingComplete = hasOnboardingCompleted();
    const listingSubmitted = hasListingSubmitted();
    const verifyPending = hasVendorEmailVerifyPending();

    if (listingSubmitted) return '/vendor/registration-complete';
    if (verifyPending) return '/signup/vendor/verify-email';
    if (onboardingComplete && hasListingDraft) return '/signup/vendor/listing';
    if (onboardingComplete) return '/signup/vendor/listing';
    if (hasOnboardingDraft) return '/signup/vendor';
    return '/signup/vendor';
  } catch {
    return '/signup/vendor';
  }
}

/** After partner registration + OTP; Login uses this to route to /vendor/dashboard. */
export const MOGZU_PREFERRED_PORTAL_KEY = 'mogzuPreferredPortal';
