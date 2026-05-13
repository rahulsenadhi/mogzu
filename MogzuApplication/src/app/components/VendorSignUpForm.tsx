import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, AlertCircle, X, Upload, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import imgImage24855 from 'figma:asset/97572b310bf103bcd94545d382d4a4a7ba1f9ce4.png';
import { enqueuePendingListingForAdmin } from '@/app/lib/adminVendorListingQueueStorage';
import { submitVendorListing } from '@/app/lib/vendorOnboardingApi';
import {
  LISTING_DRAFT_KEY,
  ONBOARDING_COMPLETED_KEY,
  VENDOR_EMAIL_VERIFY_PENDING_KEY,
  type VendorEmailVerifyPending,
} from '@/app/lib/vendorOnboardingStorage';
import { getVendorListingProfileIds, type VendorListingProfileId } from '@/app/lib/vendorModuleSelection';
import {
  CorporateOnboardingPageShell,
  CorporateOnboardingFooterLinks,
  CorporateOnboardingHeader,
} from '@/app/components/corporate/CorporateOnboardingChrome';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#dde2e4] bg-white px-4 text-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-[#878e9e] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';
const textareaClass =
  'min-h-[100px] w-full resize-y rounded-[6px] border border-[#dde2e4] bg-white p-4 text-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-[#878e9e] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

type ListingFormState = {
  listingTitle: string;
  shortDescription: string;
  longDescription: string;
  location: string;
  mapLink: string;
  maxCapacity: string;
  standing: string;
  parliament: string;
  block: string;
  boarding: string;
  amenities: string;
  galleryImagesNote: string;
  pricingMode: 'negotiable' | 'on_request' | 'fixed';
  price: string;
  priceUnit: string;
  gstApplicable: string;
  gstRate: string;
  activityCategory: string;
  coverageArea: string;
  groupSizeMin: string;
  groupSizeMax: string;
  durationOptions: string;
  equipmentProvided: string;
  equipmentRequiredFromClient: string;
  pricingPerHeadOrSession: string;
  availabilityCalendarActivity: string;
  cancellationPolicyActivity: string;
  eventTypeCategory: string;
  venueOrTravel: 'venue' | 'travel';
  guestCapacity: string;
  servicesOffered: string;
  setupBreakdownTime: string;
  equipmentAvProvided: string;
  cateringOptions: string;
  pricingPerEventOrDay: string;
  availabilityCalendarEvent: string;
  cancellationPolicyEvent: string;
  productCategory: string;
  productVariants: string;
  minOrderQty: string;
  maxOrderQty: string;
  bulkPricingTiers: string;
  customisationOptions: string;
  deliveryTimeline: string;
  deliveryCoverageCities: string;
  stockAvailability: string;
  couponOfferSummary: string;
};

function emptyForm(): ListingFormState {
  return {
    listingTitle: '',
    shortDescription: '',
    longDescription: '',
    location: '',
    mapLink: '',
    maxCapacity: '',
    standing: '',
    parliament: '',
    block: '',
    boarding: '',
    amenities: '',
    galleryImagesNote: '',
    pricingMode: 'on_request',
    price: '',
    priceUnit: '',
    gstApplicable: '',
    gstRate: '',
    activityCategory: '',
    coverageArea: '',
    groupSizeMin: '',
    groupSizeMax: '',
    durationOptions: '',
    equipmentProvided: '',
    equipmentRequiredFromClient: '',
    pricingPerHeadOrSession: '',
    availabilityCalendarActivity: '',
    cancellationPolicyActivity: '',
    eventTypeCategory: '',
    venueOrTravel: 'venue',
    guestCapacity: '',
    servicesOffered: '',
    setupBreakdownTime: '',
    equipmentAvProvided: '',
    cateringOptions: '',
    pricingPerEventOrDay: '',
    availabilityCalendarEvent: '',
    cancellationPolicyEvent: '',
    productCategory: '',
    productVariants: '',
    minOrderQty: '',
    maxOrderQty: '',
    bulkPricingTiers: '',
    customisationOptions: '',
    deliveryTimeline: '',
    deliveryCoverageCities: '',
    stockAvailability: '',
    couponOfferSummary: '',
  };
}

function migrateLegacyDraft(raw: Record<string, unknown>): Partial<ListingFormState> {
  if (raw.spaceName !== undefined || raw.description !== undefined) {
    return {
      listingTitle: String(raw.spaceName ?? ''),
      shortDescription: String(raw.description ?? ''),
      location: String(raw.location ?? ''),
      mapLink: String(raw.mapLink ?? ''),
      maxCapacity: String(raw.maxCapacity ?? ''),
      standing: String(raw.standing ?? ''),
      parliament: String(raw.parliament ?? ''),
      block: String(raw.block ?? ''),
      boarding: String(raw.boarding ?? ''),
      amenities: String(raw.amenities ?? ''),
    };
  }
  const { version: _v, ...rest } = raw;
  return rest as Partial<ListingFormState>;
}

export default function VendorSignUpForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorName, setVendorName] = useState('John');
  const [businessDisplayName, setBusinessDisplayName] = useState('');
  const [onboardingId, setOnboardingId] = useState('');
  const [form, setForm] = useState<ListingFormState>(emptyForm);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [galleryDrag, setGalleryDrag] = useState(false);
  const [logoDrag, setLogoDrag] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const profiles = useMemo(() => getVendorListingProfileIds(), []);
  const showSpace = profiles.includes('space');
  const showActivity = profiles.includes('activity');
  const showEvent = profiles.includes('event');
  const showGift = profiles.includes('gift');
  const showHeyGenie = profiles.includes('hey_genie');

  const wizardSteps = useMemo(() => {
    const steps: Array<{ id: string; label: string }> = [
      { id: 'basics', label: 'Basics' },
      { id: 'pricing', label: 'Pricing' },
    ];
    if (showSpace) steps.push({ id: 'space', label: 'Space' });
    if (showActivity) steps.push({ id: 'activity', label: 'Activity' });
    if (showEvent) steps.push({ id: 'event', label: 'Event' });
    if (showGift) steps.push({ id: 'gift', label: 'Products' });
    if (showHeyGenie) steps.push({ id: 'hey', label: 'Offer' });
    steps.push({ id: 'profile', label: 'Profile' }, { id: 'review', label: 'Review' });
    return steps;
  }, [showActivity, showEvent, showGift, showHeyGenie, showSpace]);

  const currentStepId = wizardSteps[currentStepIndex]?.id ?? 'basics';
  const isReviewStep = currentStepId === 'review';

  const update = useCallback((patch: Partial<ListingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (!raw) {
        navigate('/signup/vendor', { replace: true });
        return;
      }
      const completed = JSON.parse(raw) as {
        onboardingId?: string;
        fullName?: string;
        businessName?: string;
      };
      if (!completed?.onboardingId) {
        navigate('/signup/vendor', { replace: true });
        return;
      }
      setOnboardingId(completed.onboardingId);
      if (completed.fullName?.trim()) {
        setVendorName(completed.fullName.trim().split(' ')[0] ?? 'John');
      }
      if (completed.businessName?.trim()) {
        setBusinessDisplayName(completed.businessName.trim());
      }
    } catch {
      navigate('/signup/vendor', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LISTING_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const migrated = migrateLegacyDraft(parsed);
      setForm((prev) => ({ ...emptyForm(), ...prev, ...migrated }));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify({ version: 2, ...form }));
  }, [form]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const validate = () => {
    if (!form.listingTitle.trim()) return 'Please enter a listing name.';
    if (!form.shortDescription.trim()) return 'Please enter a short description.';
    if (!form.location.trim()) return 'Please enter location.';
    if (form.mapLink && !/^https?:\/\//i.test(form.mapLink.trim())) {
      return 'Map link should start with http:// or https://';
    }
    if (showGift && !form.deliveryCoverageCities.trim()) {
      return 'Please enter delivery coverage cities.';
    }
    if (showActivity && !form.activityCategory.trim()) return 'Please enter activity category.';
    if (showEvent && !form.eventTypeCategory.trim()) return 'Please enter event type and category.';
    if (showHeyGenie && !form.couponOfferSummary.trim()) return 'Please summarise your offer or coupon.';
    return null;
  };

  const validateCurrentStep = () => {
    if (currentStepId === 'basics') {
      if (!form.listingTitle.trim()) return 'Please enter a listing name.';
      if (!form.shortDescription.trim()) return 'Please enter a short description.';
      if (!form.location.trim()) return 'Please enter location.';
      if (form.mapLink && !/^https?:\/\//i.test(form.mapLink.trim())) {
        return 'Map link should start with http:// or https://';
      }
    }
    if (currentStepId === 'activity' && showActivity && !form.activityCategory.trim()) {
      return 'Please enter activity category.';
    }
    if (currentStepId === 'event' && showEvent && !form.eventTypeCategory.trim()) {
      return 'Please enter event type and category.';
    }
    if (currentStepId === 'gift' && showGift && !form.deliveryCoverageCities.trim()) {
      return 'Please enter delivery coverage cities.';
    }
    if (currentStepId === 'hey' && showHeyGenie && !form.couponOfferSummary.trim()) {
      return 'Please summarise your offer or coupon.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    if (!onboardingId) {
      setError('Please complete onboarding first.');
      return;
    }
    const listingPayload = {
      onboardingId,
      spaceName: form.listingTitle.trim(),
      description: form.shortDescription.trim(),
      location: form.location.trim(),
      mapLink: form.mapLink.trim() || undefined,
      maxCapacity: showSpace ? form.maxCapacity.trim() || undefined : undefined,
      standing: showSpace ? form.standing.trim() || undefined : undefined,
      parliament: showSpace ? form.parliament.trim() || undefined : undefined,
      block: showSpace ? form.block.trim() || undefined : undefined,
      boarding: showSpace ? form.boarding.trim() || undefined : undefined,
      amenities: showSpace ? form.amenities.trim() || undefined : undefined,
      listingProfileIds: profiles.join(','),
      longDescription: form.longDescription.trim() || undefined,
      galleryImagesNote: form.galleryImagesNote.trim() || undefined,
      pricingMode: form.pricingMode,
      price: form.price.trim() || undefined,
      priceUnit: form.priceUnit.trim() || undefined,
      gstApplicable: form.gstApplicable.trim() || undefined,
      gstRate: form.gstRate.trim() || undefined,
      activityCategory: showActivity ? form.activityCategory.trim() || undefined : undefined,
      coverageArea: showActivity ? form.coverageArea.trim() || undefined : undefined,
      groupSizeMin: showActivity ? form.groupSizeMin.trim() || undefined : undefined,
      groupSizeMax: showActivity ? form.groupSizeMax.trim() || undefined : undefined,
      durationOptions: showActivity ? form.durationOptions.trim() || undefined : undefined,
      equipmentProvided: showActivity ? form.equipmentProvided.trim() || undefined : undefined,
      equipmentRequiredFromClient: showActivity ? form.equipmentRequiredFromClient.trim() || undefined : undefined,
      pricingPerHeadOrSession: showActivity ? form.pricingPerHeadOrSession.trim() || undefined : undefined,
      availabilityCalendar: showActivity ? form.availabilityCalendarActivity.trim() || undefined : undefined,
      cancellationPolicy: showActivity ? form.cancellationPolicyActivity.trim() || undefined : undefined,
      eventTypeCategory: showEvent ? form.eventTypeCategory.trim() || undefined : undefined,
      eventAvailabilityCalendar: showEvent ? form.availabilityCalendarEvent.trim() || undefined : undefined,
      eventCancellationPolicy: showEvent ? form.cancellationPolicyEvent.trim() || undefined : undefined,
      venueOrTravel: showEvent ? form.venueOrTravel : undefined,
      guestCapacity: showEvent ? form.guestCapacity.trim() || undefined : undefined,
      servicesOffered: showEvent ? form.servicesOffered.trim() || undefined : undefined,
      setupBreakdownTime: showEvent ? form.setupBreakdownTime.trim() || undefined : undefined,
      equipmentAvProvided: showEvent ? form.equipmentAvProvided.trim() || undefined : undefined,
      cateringOptions: showEvent ? form.cateringOptions.trim() || undefined : undefined,
      pricingPerEventOrDay: showEvent ? form.pricingPerEventOrDay.trim() || undefined : undefined,
      productCategory: showGift ? form.productCategory.trim() || undefined : undefined,
      productVariants: showGift ? form.productVariants.trim() || undefined : undefined,
      minOrderQty: showGift ? form.minOrderQty.trim() || undefined : undefined,
      maxOrderQty: showGift ? form.maxOrderQty.trim() || undefined : undefined,
      bulkPricingTiers: showGift ? form.bulkPricingTiers.trim() || undefined : undefined,
      customisationOptions: showGift ? form.customisationOptions.trim() || undefined : undefined,
      deliveryTimeline: showGift ? form.deliveryTimeline.trim() || undefined : undefined,
      deliveryCoverageCities: showGift ? form.deliveryCoverageCities.trim() || undefined : undefined,
      stockAvailability: showGift ? form.stockAvailability.trim() || undefined : undefined,
      couponOfferSummary: showHeyGenie ? form.couponOfferSummary.trim() || undefined : undefined,
    };

    const completeListingFlow = (listingId: string) => {
      localStorage.removeItem(LISTING_DRAFT_KEY);

      let email: string | undefined;
      let businessName = '';
      try {
        const rawCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (rawCompleted) {
          const c = JSON.parse(rawCompleted) as { email?: string; businessName?: string };
          email = c.email?.trim();
          businessName = c.businessName?.trim() || '';
        }
      } catch {
        // ignore
      }

      enqueuePendingListingForAdmin({
        listingId,
        onboardingId,
        businessName: businessName || '—',
        vendorEmail: email,
        listingTitle: form.listingTitle.trim(),
        shortDescription: form.shortDescription.trim(),
        location: form.location.trim(),
        listingProfileIds: profiles.join(','),
      });

      const pending: VendorEmailVerifyPending = {
        onboardingId,
        email,
        spaceName: form.listingTitle.trim(),
      };
      localStorage.setItem(VENDOR_EMAIL_VERIFY_PENDING_KEY, JSON.stringify(pending));
      navigate('/signup/vendor/verify-email', { replace: true });
    };

    try {
      setIsSubmitting(true);
      const listingRes = await submitVendorListing(listingPayload);
      completeListingFlow(listingRes.listingId);
    } catch {
      // Frontend-only: queue listing for admin even when the API is unavailable or errors.
      completeListingFlow(`lst-${Date.now()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = useCallback(
    (id: string) => {
      const idx = wizardSteps.findIndex((s) => s.id === id);
      if (idx >= 0) setCurrentStepIndex(idx);
    },
    [wizardSteps]
  );

  const appendGalleryFileNames = useCallback((files: FileList | File[]) => {
    const names = Array.from(files)
      .map((f) => f.name)
      .filter(Boolean);
    if (names.length === 0) return;
    setForm((prev) => {
      const line = names.join(', ');
      const next = prev.galleryImagesNote.trim()
        ? `${prev.galleryImagesNote.trim()}\n${line}`
        : line;
      return { ...prev, galleryImagesNote: next };
    });
  }, []);

  const mergeLogoFileName = useCallback((file: File) => {
    const tag = `[Profile logo] ${file.name}`;
    setForm((prev) => {
      const lines = prev.galleryImagesNote
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('[Profile logo]'));
      return { ...prev, galleryImagesNote: [...lines, tag].join('\n') };
    });
  }, []);

  const handleSkipListing = () => {
    if (!onboardingId) {
      setError('Please wait — loading your partner profile.');
      return;
    }
    try {
      const rawCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      let email: string | undefined;
      if (rawCompleted) {
        const c = JSON.parse(rawCompleted) as { email?: string };
        email = c.email?.trim() || undefined;
      }
      const pending: VendorEmailVerifyPending = {
        onboardingId,
        email,
        spaceName: '',
      };
      localStorage.setItem(VENDOR_EMAIL_VERIFY_PENDING_KEY, JSON.stringify(pending));
      navigate('/signup/vendor/verify-email', { replace: true });
    } catch {
      setError('Could not continue. Please try again.');
    }
  };

  const profileLabel = (p: VendorListingProfileId) =>
    ({
      activity: 'Activity',
      event: 'Event services',
      gift: 'Gifting',
      space: 'Space',
      hey_genie: 'Hey Genie',
    })[p];

  const handleNextStep = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setCurrentStepIndex((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const handleBackStep = () => {
    setError(null);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <CorporateOnboardingPageShell>
      <div className="min-h-screen overflow-x-hidden pb-28 text-[#0e1e3f] md:pb-14">
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-md border-slate-200 bg-white font-['Inter',_sans-serif] text-[#0e1e3f] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#0e1e3f]">Bulk listing upload</DialogTitle>
            <DialogDescription className="text-left text-[15px] leading-relaxed text-[#475569]">
              CSV / spreadsheet import is almost ready. For now, add one listing with the form below, or skip and
              finish from your vendor dashboard after email verification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setBulkDialogOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0e1e3f] transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkDialogOpen(false);
                goToStep('basics');
              }}
              className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Add listing manually
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8 md:px-12 lg:py-12 lg:px-16">
        <div className="mx-auto w-full max-w-[980px] rounded-2xl border border-white/70 bg-white/88 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md ring-1 ring-slate-200/40 sm:p-8 md:p-10">
          <section className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7">
            <CorporateOnboardingHeader
              flowLabel="Partner listing"
              stepOfTotal="Final step"
              title={`Hi ${vendorName}, add your first listing`}
              description={`Fields match your modules: ${profiles.map(profileLabel).join(' · ')}. Everything saves automatically as you type.`}
              className="mb-6"
            />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <ul className="mt-4 space-y-2 text-[14px] text-[#475569] sm:text-[15px]">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span>Complete the sections you need — you can edit again from the vendor dashboard.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span>Use section chips to jump quickly between parts of the form.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span>Or verify email first and skip the listing for now.</span>
                  </li>
                </ul>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:min-w-[250px] lg:flex-col">
                <button
                  type="button"
                  onClick={() => goToStep('basics')}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-[14px] font-semibold text-[#0e1e3f] transition-colors hover:border-[#2563eb]/40 hover:bg-white"
                >
                  Start with images &amp; name
                </button>
                <button
                  type="button"
                  onClick={handleSkipListing}
                  className="rounded-xl bg-[#2563eb] px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
                >
                  Verify email — skip listing for now
                </button>
                <button
                  type="button"
                  onClick={() => goToStep('review')}
                  className="text-center text-[14px] font-medium text-[#2563eb] underline-offset-2 hover:underline sm:text-left"
                >
                  Jump to save &amp; continue
                </button>
              </div>
            </div>
            <p className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-[13px] text-[#64748b]">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-800">
                Draft saved
              </span>
              <span>We keep your answers in this browser until you submit.</span>
            </p>
          </section>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 relative">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
              <button
                type="button"
                onClick={() => setError(null)}
                className="absolute right-2 top-2 text-destructive transition-opacity hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[18px] font-semibold text-[#0e1e3f] sm:text-[20px]">
              Listing details
            </h2>
            <button
              type="button"
              onClick={() => setBulkDialogOpen(true)}
              className="flex w-fit items-center justify-center gap-2 rounded-full border border-[#2563eb]/25 bg-white px-6 py-2.5 text-[#2563eb] shadow-sm transition-colors hover:bg-blue-50"
            >
              <Upload className="h-4 w-4" aria-hidden />
              <span className="text-[15px] font-semibold">Bulk upload</span>
            </button>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#878e9e]">Jump to section</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-2">
              {wizardSteps.map(({ id, label }, idx) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    currentStepId === id
                      ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                      : 'border-slate-200 bg-white text-[#0e1e3f] hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form
            id="vendor-listing-form"
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7 md:p-8"
          >
            <div className="mb-8 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div>
                <h4 className="text-[17px] font-semibold text-[#0e1e3f]">First listing</h4>
                <p className="mt-0.5 text-[13px] text-[#64748b]">One submission — we&apos;ll match it to your modules.</p>
              </div>
              <ChevronDown className="shrink-0 text-slate-400" size={22} aria-hidden />
            </div>

            {currentStepId === 'basics' && (
              <>
            <h5 id="partner-listing-media" className="mb-5 text-[16px] font-semibold text-[#0e1e3f]">
              Images
            </h5>
            <div className="mb-8 flex flex-col gap-8 md:flex-row">
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const list = e.target.files;
                  if (list?.length) appendGalleryFileNames(list);
                  e.target.value = '';
                }}
              />
              <div className="w-full shrink-0 md:w-[295px]">
                <p className="mb-2 text-[15px] font-medium text-[#0e1e3f]">Gallery images</p>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setGalleryDrag(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setGalleryDrag(false);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setGalleryDrag(false);
                    if (e.dataTransfer.files?.length) appendGalleryFileNames(e.dataTransfer.files);
                  }}
                  className={`flex h-[min(295px,55vw)] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 transition-colors md:h-[295px] ${
                    galleryDrag ? 'border-[#2563eb] bg-blue-50/50' : 'border-slate-300 hover:border-[#2563eb]/50 hover:bg-slate-50'
                  }`}
                >
                  <img src={imgImage24855} alt="" className="mb-3 h-10 w-10 object-contain opacity-25" />
                  <p className="max-w-[200px] text-center text-[15px] leading-snug text-[#64748b]">
                    <span className="font-semibold text-[#2563eb]">Choose files</span>
                    <span className="hidden sm:inline"> or drag and drop</span>
                  </p>
                  <p className="mt-2 text-center text-xs text-[#94a3b8]">Names are saved in your draft (demo)</p>
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <label className="text-[16px] text-[#0e1e3f]">Gallery notes (URLs or filenames)</label>
                <textarea
                  value={form.galleryImagesNote}
                  onChange={(e) => update({ galleryImagesNote: e.target.value })}
                  placeholder="List image URLs or describe assets you will upload later"
                  className={textareaClass}
                />
                <p className="text-xs text-[#878e9e]">
                  Ratings and reviews will appear on your public listing after your first completed bookings.
                </p>
              </div>
            </div>

            <h5 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Overview</h5>

            <div id="partner-listing-title" className="mb-6 scroll-mt-24">
              <label className="mb-1 block text-[16px] text-[#0e1e3f]">Listing name</label>
              <input
                type="text"
                value={form.listingTitle}
                onChange={(e) => update({ listingTitle: e.target.value })}
                placeholder="Space, activity, product, or offer name"
                className={inputClass}
              />
            </div>

            <div id="partner-listing-description" className="mb-6 scroll-mt-24 space-y-4">
              <div>
                <label className="mb-1 block text-[16px] text-[#0e1e3f]">Short description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => update({ shortDescription: e.target.value })}
                  placeholder="One or two sentences"
                  className={textareaClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[16px] text-[#0e1e3f]">Long description</label>
                <textarea
                  value={form.longDescription}
                  onChange={(e) => update({ longDescription: e.target.value })}
                  placeholder="Full detail for buyers"
                  className={`${textareaClass} min-h-[139px]`}
                />
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <div id="partner-listing-location" className="scroll-mt-24 flex flex-1 flex-col gap-1">
                <label className="text-[16px] text-[#0e1e3f]">Location (base / HQ)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update({ location: e.target.value })}
                  placeholder="City, area, or address"
                  className={inputClass}
                />
              </div>
              <div id="partner-listing-map" className="scroll-mt-24 flex flex-1 flex-col gap-1">
                <label className="text-[16px] text-[#0e1e3f]">Map location (link)</label>
                <input
                  type="url"
                  value={form.mapLink}
                  onChange={(e) => update({ mapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className={inputClass}
                />
              </div>
            </div>
              </>
            )}

            {currentStepId === 'pricing' && (
            <div id="partner-listing-pricing" className="mb-10 space-y-4 border-t border-[#ececec] pt-8">
                <h5 className="text-[18px] font-semibold text-[#0e1e3f]">Pricing mode & GST</h5>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[16px] text-[#0e1e3f]">Pricing mode</label>
                  <select
                    value={form.pricingMode}
                    onChange={(e) =>
                      update({ pricingMode: e.target.value as ListingFormState['pricingMode'] })
                    }
                    className={inputClass}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="negotiable">Negotiable</option>
                    <option value="on_request">On request</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[16px] text-[#0e1e3f]">Price</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => update({ price: e.target.value })}
                      placeholder="e.g. 1500"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px] text-[#0e1e3f]">Unit</label>
                    <input
                      type="text"
                      value={form.priceUnit}
                      onChange={(e) => update({ priceUnit: e.target.value })}
                      placeholder="/ hour, / unit, / day"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[16px] text-[#0e1e3f]">GST applicability</label>
                  <input
                    type="text"
                    value={form.gstApplicable}
                    onChange={(e) => update({ gstApplicable: e.target.value })}
                    placeholder="Inclusive / exclusive / exempt"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[16px] text-[#0e1e3f]">GST rate %</label>
                  <input
                    type="text"
                    value={form.gstRate}
                    onChange={(e) => update({ gstRate: e.target.value })}
                    placeholder="e.g. 18"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            )}

            {showSpace && currentStepId === 'space' && (
              <>
                <div id="partner-listing-capacity" className="mb-10 flex w-full flex-wrap items-end gap-4">
                  <div className="flex w-full flex-col gap-1 sm:w-[220px]">
                    <label className="text-[16px] text-[#0e1e3f]">
                      Max capacity <span className="text-[#878e9e]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.maxCapacity}
                      onChange={(e) => update({ maxCapacity: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  {(['standing', 'parliament', 'block', 'boarding'] as const).map((k) => (
                    <div key={k} className="flex min-w-[130px] flex-1 flex-col gap-1">
                      <label className="text-[16px] capitalize text-[#0e1e3f]">{k}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form[k]}
                        onChange={(e) => update({ [k]: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
                <h5 className="mb-4 text-[18px] text-[#475569]">Amenities</h5>
                <div id="partner-listing-amenities" className="relative mb-12">
                  <label className="mb-1 block text-[16px] text-[#0e1e3f]">Select amenities</label>
                  <div className="relative">
                    <select
                      value={form.amenities}
                      onChange={(e) => update({ amenities: e.target.value })}
                      className={`${inputClass} cursor-pointer appearance-none`}
                    >
                      <option value="">Select amenities</option>
                      <option value="wifi">Wi-Fi</option>
                      <option value="projector">Projector</option>
                      <option value="av">AV setup</option>
                      <option value="parking">Parking</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0E1E3F]" />
                  </div>
                </div>
              </>
            )}

            {showActivity && currentStepId === 'activity' && (
              <div
                id="partner-listing-activity"
                className="mb-10 space-y-4 border-t border-[#ececec] pt-8"
              >
                <h5 className="text-[18px] font-semibold text-[#0e1e3f]">Activity listing</h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[16px]">Activity category</label>
                    <input
                      value={form.activityCategory}
                      onChange={(e) => update({ activityCategory: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Coverage area</label>
                    <input
                      value={form.coverageArea}
                      onChange={(e) => update({ coverageArea: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Group size min</label>
                    <input
                      value={form.groupSizeMin}
                      onChange={(e) => update({ groupSizeMin: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Group size max</label>
                    <input
                      value={form.groupSizeMax}
                      onChange={(e) => update({ groupSizeMax: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Duration options</label>
                    <textarea
                      value={form.durationOptions}
                      onChange={(e) => update({ durationOptions: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Equipment provided</label>
                    <textarea
                      value={form.equipmentProvided}
                      onChange={(e) => update({ equipmentProvided: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Equipment required from client</label>
                    <textarea
                      value={form.equipmentRequiredFromClient}
                      onChange={(e) => update({ equipmentRequiredFromClient: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Pricing per head or per session</label>
                    <input
                      value={form.pricingPerHeadOrSession}
                      onChange={(e) => update({ pricingPerHeadOrSession: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Availability calendar</label>
                    <textarea
                      value={form.availabilityCalendarActivity}
                      onChange={(e) => update({ availabilityCalendarActivity: e.target.value })}
                      placeholder="Blackout dates, weekly rhythm, lead time"
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Cancellation policy</label>
                    <textarea
                      value={form.cancellationPolicyActivity}
                      onChange={(e) => update({ cancellationPolicyActivity: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {showEvent && currentStepId === 'event' && (
              <div
                id="partner-listing-event"
                className="mb-10 space-y-4 border-t border-[#ececec] pt-8"
              >
                <h5 className="text-[18px] font-semibold text-[#0e1e3f]">Event services listing</h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Event type & category</label>
                    <input
                      value={form.eventTypeCategory}
                      onChange={(e) => update({ eventTypeCategory: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Venue or travel</label>
                    <select
                      value={form.venueOrTravel}
                      onChange={(e) =>
                        update({ venueOrTravel: e.target.value as 'venue' | 'travel' })
                      }
                      className={inputClass}
                    >
                      <option value="venue">Venue-based</option>
                      <option value="travel">Travel / on-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Guest capacity</label>
                    <input
                      value={form.guestCapacity}
                      onChange={(e) => update({ guestCapacity: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Services offered (checklist)</label>
                    <textarea
                      value={form.servicesOffered}
                      onChange={(e) => update({ servicesOffered: e.target.value })}
                      placeholder="List services, one per line"
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Setup & breakdown time</label>
                    <input
                      value={form.setupBreakdownTime}
                      onChange={(e) => update({ setupBreakdownTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Equipment & AV provided</label>
                    <textarea
                      value={form.equipmentAvProvided}
                      onChange={(e) => update({ equipmentAvProvided: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Catering options</label>
                    <textarea
                      value={form.cateringOptions}
                      onChange={(e) => update({ cateringOptions: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Pricing per event or per day</label>
                    <input
                      value={form.pricingPerEventOrDay}
                      onChange={(e) => update({ pricingPerEventOrDay: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Availability calendar</label>
                    <textarea
                      value={form.availabilityCalendarEvent}
                      onChange={(e) => update({ availabilityCalendarEvent: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Cancellation policy</label>
                    <textarea
                      value={form.cancellationPolicyEvent}
                      onChange={(e) => update({ cancellationPolicyEvent: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {showGift && currentStepId === 'gift' && (
              <div
                id="partner-listing-gift"
                className="mb-10 space-y-4 border-t border-[#ececec] pt-8"
              >
                <h5 className="text-[18px] font-semibold text-[#0e1e3f]">Gifting product</h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[16px]">Product category</label>
                    <input
                      value={form.productCategory}
                      onChange={(e) => update({ productCategory: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Variants (size, colour)</label>
                    <input
                      value={form.productVariants}
                      onChange={(e) => update({ productVariants: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Min order quantity</label>
                    <input
                      value={form.minOrderQty}
                      onChange={(e) => update({ minOrderQty: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[16px]">Max order quantity</label>
                    <input
                      value={form.maxOrderQty}
                      onChange={(e) => update({ maxOrderQty: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Bulk pricing tiers</label>
                    <textarea
                      value={form.bulkPricingTiers}
                      onChange={(e) => update({ bulkPricingTiers: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Customisation options</label>
                    <textarea
                      value={form.customisationOptions}
                      onChange={(e) => update({ customisationOptions: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Delivery timeline</label>
                    <input
                      value={form.deliveryTimeline}
                      onChange={(e) => update({ deliveryTimeline: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Delivery coverage cities</label>
                    <textarea
                      value={form.deliveryCoverageCities}
                      onChange={(e) => update({ deliveryCoverageCities: e.target.value })}
                      className={textareaClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[16px]">Stock availability</label>
                    <input
                      value={form.stockAvailability}
                      onChange={(e) => update({ stockAvailability: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {showHeyGenie && currentStepId === 'hey' && (
              <div
                id="partner-listing-hey"
                className="mb-10 space-y-4 border-t border-[#ececec] pt-8"
              >
                <h5 className="text-[18px] font-semibold text-[#0e1e3f]">Hey Genie offer</h5>
                <textarea
                  value={form.couponOfferSummary}
                  onChange={(e) => update({ couponOfferSummary: e.target.value })}
                  placeholder="Coupon / deal summary, validity, redemption rules"
                  className={textareaClass}
                />
              </div>
            )}

            {(currentStepId === 'profile' || currentStepId === 'review') && (
              <>
            <h5 id="partner-listing-portfolio" className="mb-4 text-[16px] font-semibold text-[#0e1e3f]">
              Vendor profile image
            </h5>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) mergeLogoFileName(f);
                e.target.value = '';
              }}
            />
            <div className="w-full md:w-[296px]">
              <p className="mb-2 text-[15px] font-medium text-[#0e1e3f]">Profile picture / logo</p>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setLogoDrag(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setLogoDrag(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setLogoDrag(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) mergeLogoFileName(f);
                }}
                className={`flex h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 transition-colors ${
                  logoDrag ? 'border-[#2563eb] bg-blue-50/50' : 'border-slate-300 hover:border-[#2563eb]/50 hover:bg-slate-50'
                }`}
              >
                <img src={imgImage24855} alt="" className="mb-2 h-9 w-9 object-contain opacity-25" />
                <p className="max-w-[200px] text-center text-[15px] leading-snug text-[#64748b]">
                  <span className="font-semibold text-[#2563eb]">Choose logo</span>
                  <span className="hidden sm:inline"> or drop one file</span>
                </p>
              </button>
            </div>
              </>
            )}

            {isReviewStep && (
            <div
              id="partner-listing-submit"
              className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-[14px] text-[#64748b]">
                Next step: verify your work email. You can still edit this listing later in the dashboard.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#2563eb] px-10 py-3.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
              >
                {isSubmitting ? 'Saving…' : 'Save listing & verify email'}
              </button>
            </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleBackStep}
                disabled={currentStepIndex === 0}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              {!isReviewStep ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
                >
                  Continue
                </button>
              ) : null}
            </div>
          </form>

          <div className="mb-8 mt-14 pl-1">
            <h3 className="mb-3 text-[24px] font-semibold text-[#0e1e3f]">Your partner profile</h3>
            <p className="max-w-[591px] text-[16px] leading-relaxed text-[#475569]">
              {businessDisplayName ? (
                <>
                  You&apos;re signing up as{' '}
                  <span className="font-semibold text-[#0e1e3f]">{businessDisplayName}</span>. After email
                  verification you&apos;ll land in your vendor dashboard to add or edit listings anytime.
                </>
              ) : (
                <>
                  After email verification you&apos;ll land in your vendor dashboard to add or edit listings
                  anytime.
                </>
              )}
            </p>
          </div>

          <CorporateOnboardingFooterLinks className="mt-10 border-t border-slate-100 pt-8" />
        </div>

      </div>

      {isReviewStep ? (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:hidden">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <button
            type="submit"
            form="vendor-listing-form"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#2563eb] py-3.5 text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving…' : 'Save listing & verify email'}
          </button>
          <button
            type="button"
            onClick={handleSkipListing}
            className="w-full py-1.5 text-[14px] font-medium text-[#2563eb] hover:underline"
          >
            Skip listing — verify email only
          </button>
        </div>
      </div>
      ) : null}
    </div>
    </CorporateOnboardingPageShell>
  );
}
