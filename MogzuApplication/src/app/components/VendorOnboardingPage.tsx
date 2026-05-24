import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, X, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import {
  VENDOR_SERVICE_MODULES,
  type VendorModuleId,
} from '@/app/data/vendorServiceCatalog';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { enqueuePendingVendorForAdmin } from '@/app/lib/adminVendorQueueStorage';
import type { VendorOnboardingSubmitPayload } from '@/app/lib/vendorOnboardingApi';
import { submitVendorOnboarding } from '@/app/lib/vendorOnboardingApi';
import {
  LISTING_SUBMITTED_KEY,
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_DRAFT_KEY,
  getVendorSignupRedirectPath,
} from '@/app/lib/vendorOnboardingStorage';
import { authActions } from '@/lib/authActions';
import { db } from '@/lib/db';
import type { ModuleId as DbModuleId } from '@/lib/database.types';
import {
  CorporateOnboardingPageShell,
  CorporateOnboardingHeader,
  CorporateOnboardingFooterLinks,
  PartnerOnboardingStepper,
} from '@/app/components/corporate/CorporateOnboardingChrome';
import {
  CorporateOnboardingStepFooter,
  CorporateOnboardingBackButton,
  CorporateOnboardingPrimaryButton,
} from '@/app/components/corporate/CorporateOnboardingStepFooter';

type SelectionMap = Record<VendorModuleId, Set<string>>;

function emptySelection(): SelectionMap {
  const m = {} as SelectionMap;
  for (const mod of VENDOR_SERVICE_MODULES) {
    m[mod.id] = new Set();
  }
  return m;
}

// vendor_modules.module accepts only the 4 DB ModuleIds. Catalog has
// finer-grained categories; collapse them here.
function mapVendorModuleToDbModule(id: VendorModuleId): DbModuleId | null {
  switch (id) {
    case 'spacex_meeting':
    case 'spacex_promotions':
      return 'spacex_coworking';
    case 'spacex_stay':
      return 'spacex_stay';
    case 'spacex_activities':
    case 'giev_events_activity':
    case 'giev_events_services':
      return 'events';
    case 'giev_gifting':
    case 'hey_genie':
      return 'gifting';
    default:
      return null;
  }
}

const fieldClass =
  'mt-1 w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

const textareaClass =
  'mt-1 w-full min-h-[100px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20';

export default function VendorOnboardingPage() {
  const navigate = useNavigate();
  const entryTarget = useMemo(() => getVendorSignupRedirectPath(), []);

  useLayoutEffect(() => {
    if (entryTarget !== '/signup/vendor') {
      navigate(entryTarget, { replace: true });
    }
  }, [entryTarget, navigate]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<VendorModuleId | null>(
    VENDOR_SERVICE_MODULES[0].id
  );

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [gstOptional, setGstOptional] = useState('');
  const [pitch, setPitch] = useState('');

  const [selection, setSelection] = useState<SelectionMap>(() => emptySelection());

  const stepCopy = useMemo(() => {
    const rows: { stepOfTotal: string; title: string; description: string }[] = [
      {
        stepOfTotal: 'Step 1 of 4',
        title: 'Account & contact',
        description:
          'Create your partner credentials and work contact details. You’ll continue to services and your business profile next.',
      },
      {
        stepOfTotal: 'Step 2 of 4',
        title: 'Services & categories',
        description:
          'Select every module and category you can deliver across D Space, GiEv, and Hey Genie. You can refine listings after approval.',
      },
      {
        stepOfTotal: 'Step 3 of 4',
        title: 'Business profile',
        description:
          'Tell us where you operate and optionally add tax details and a short pitch for corporate buyers.',
      },
      {
        stepOfTotal: 'Step 4 of 4',
        title: 'Review & submit',
        description:
          'Confirm your details. On submit we’ll save onboarding and take you to listing setup.',
      },
    ];
    return rows[step - 1];
  }, [step]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<VendorOnboardingSubmitPayload> & { step?: number };
      if (draft.fullName) setFullName(draft.fullName);
      if (draft.businessName) setBusinessName(draft.businessName);
      if (draft.email) setEmail(draft.email);
      if (draft.phone) setPhone(draft.phone);
      if (draft.city) setCity(draft.city);
      if (draft.stateRegion) setStateRegion(draft.stateRegion);
      if (draft.gstOptional) setGstOptional(draft.gstOptional);
      if (draft.pitch) setPitch(draft.pitch);
      if (typeof draft.step === 'number' && draft.step >= 1 && draft.step <= 4) {
        setStep(draft.step);
      }
      if (Array.isArray(draft.selection)) {
        const next = emptySelection();
        for (const item of draft.selection) {
          if (!item?.module || !Array.isArray(item.categories) || !next[item.module]) continue;
          next[item.module] = new Set(item.categories);
        }
        setSelection(next);
      }
    } catch {
      /* ignore bad draft */
    }
  }, []);

  useEffect(() => {
    const payload = {
      fullName,
      businessName,
      email,
      phone,
      city,
      stateRegion,
      gstOptional,
      pitch,
      step,
      selection: VENDOR_SERVICE_MODULES.map((m) => ({ module: m.id, categories: [...selection[m.id]] })).filter(
        (x) => x.categories.length > 0
      ),
    };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(payload));
  }, [fullName, businessName, email, phone, city, stateRegion, gstOptional, pitch, step, selection]);

  const toggleCategory = (moduleId: VendorModuleId, category: string) => {
    setSelection((prev) => {
      const next = { ...prev, [moduleId]: new Set(prev[moduleId]) };
      if (next[moduleId].has(category)) next[moduleId].delete(category);
      else next[moduleId].add(category);
      return next;
    });
  };

  const toggleModuleAll = (moduleId: VendorModuleId, categories: string[]) => {
    setSelection((prev) => {
      const cur = prev[moduleId];
      const allOn = categories.every((c) => cur.has(c));
      const nextSet = new Set<string>();
      if (!allOn) categories.forEach((c) => nextSet.add(c));
      return { ...prev, [moduleId]: nextSet };
    });
  };

  const selectedCount = useMemo(() => {
    let n = 0;
    for (const mod of VENDOR_SERVICE_MODULES) n += selection[mod.id].size;
    return n;
  }, [selection]);

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!businessName.trim()) return 'Please enter your business or brand name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid work email.';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) return 'Enter a valid mobile number.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!agreeTerms) return 'Please accept the terms to continue.';
    return null;
  };

  const validateStep2 = () => {
    if (selectedCount === 0) return 'Select at least one service category you can fulfil.';
    return null;
  };

  const validateStep3 = () => {
    if (!city.trim()) return 'Please enter your primary city.';
    if (!stateRegion.trim()) return 'Please enter state / region.';
    return null;
  };

  const submitFinal = async () => {
    const selectionItems = VENDOR_SERVICE_MODULES
      .map((m) => ({ module: m.id, categories: [...selection[m.id]] }))
      .filter((x) => x.categories.length > 0);

    const servicesSummary = selectionItems
      .map((s) => {
        const mod = VENDOR_SERVICE_MODULES.find((m) => m.id === s.module);
        return `${mod?.label ?? s.module} (${s.categories.join(', ')})`;
      })
      .join(' · ');

    setIsSubmitting(true);
    setError(null);

    const onboardingPayload: VendorOnboardingSubmitPayload = {
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city.trim(),
      stateRegion: stateRegion.trim(),
      gstOptional: gstOptional.trim() || undefined,
      pitch: pitch.trim() || undefined,
      selection: selectionItems,
    };

    // If VITE_VENDOR_API_BASE_URL is configured this calls the backend onboarding
    // endpoint; otherwise it safely falls back to local generated ids.
    let onboardingId = `onb-${Date.now()}`;
    try {
      const onboardingRes = await submitVendorOnboarding(onboardingPayload);
      onboardingId = onboardingRes.onboardingId || onboardingId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit onboarding payload.');
      setIsSubmitting(false);
      return;
    }

    // 1. Create Supabase auth user
    const { data: authData, error: signUpError } = await authActions.signUp(
      email.trim(),
      password,
      { full_name: fullName.trim() },
    );

    if (signUpError) {
      setError(signUpError);
      setIsSubmitting(false);
      return;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      setError('Signup succeeded but no user was returned. Please retry.');
      setIsSubmitting(false);
      return;
    }

    // 2. Create vendor row
    const { data: vendorRow, error: vendorCreateError } = await db.vendors.create({
      user_id: userId,
      business_name: businessName.trim(),
      city: city.trim(),
      state: stateRegion.trim(),
      gst_number: gstOptional.trim() || null,
      description: pitch.trim() || null,
      status: 'pending',
      bank_account_verified: false,
      rejection_reasons: null,
      logo_url: null,
    });
    if (vendorCreateError || !vendorRow?.id) {
      setError(vendorCreateError?.message ?? 'Could not create vendor profile.');
      setIsSubmitting(false);
      return;
    }

    // 3. Persist module selection -> vendor_modules
    const dbModules = Array.from(
      new Set(
        selectionItems
          .map((s) => mapVendorModuleToDbModule(s.module))
          .filter((m): m is DbModuleId => m !== null),
      ),
    );
    if (dbModules.length > 0) {
      const { error: setModulesError } = await db.vendors.setModules(vendorRow.id, dbModules);
      if (setModulesError) {
        setError(setModulesError.message);
        setIsSubmitting(false);
        return;
      }
    }

    // 4. Create user_profiles row
    const { error: profileError } = await db.userProfiles.upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: 'vendor',
      status: 'active',
      corporate_id: null,
      vendor_id: vendorRow.id,
      phone: phone.trim(),
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (profileError) {
      setError(profileError.message);
      setIsSubmitting(false);
      return;
    }

    // 5. Keep localStorage for admin queue (legacy admin helpers still read this)
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify({ fullName, businessName, email, phone, city, stateRegion, step: 4 }));
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify({
      onboardingId,
      vendorId: vendorRow.id,
      submittedAt: Date.now(),
      fullName,
      email,
      businessName,
      phone,
      city,
      stateRegion,
      servicesSummary: servicesSummary || undefined,
    }));
    localStorage.removeItem(LISTING_SUBMITTED_KEY);
    enqueuePendingVendorForAdmin({ onboardingId, businessName, email, fullName, phone, city, stateRegion, servicesSummary: servicesSummary || undefined });

    setIsSubmitting(false);
    navigate('/vendor/verification-pending', { replace: true });
  };

  const goNext = async () => {
    if (isSubmitting) return;
    setError(null);
    if (step === 1) {
      const e = validateStep1();
      if (e) return setError(e);
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) return setError(e);
    }
    if (step === 3) {
      const e = validateStep3();
      if (e) return setError(e);
    }
    if (step === 4) return submitFinal();
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    if (isSubmitting) return;
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFooterBack = () => {
    if (step > 1) goBack();
    else navigate('/');
  };

  const handleStepperClick = (index: number) => {
    if (isSubmitting) return;
    setError(null);
    setStep(index + 1);
  };

  const currentStepIndex = (step - 1) as 0 | 1 | 2 | 3;

  if (entryTarget !== '/signup/vendor') {
    return (
      <CorporateOnboardingPageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
          <p className="text-sm font-medium text-slate-600">Taking you to the right step…</p>
        </div>
      </CorporateOnboardingPageShell>
    );
  }

  return (
    <CorporateOnboardingPageShell>
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/88 p-6 shadow-md shadow-slate-900/5 backdrop-blur-md ring-1 ring-slate-200/40 sm:p-8 md:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Link
              to="/"
              className="inline-flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
              aria-label="Mogzu home"
            >
              <MogzuLogo className="h-10 w-auto max-w-[200px] sm:max-w-[240px]" />
            </Link>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Partner onboarding</p>
              <Link
                to="/login"
                className="text-sm font-medium text-[#2563eb] transition-colors duration-200 hover:text-[#1d4ed8]"
              >
                Already registered? Sign in
              </Link>
            </div>
          </div>

          <CorporateOnboardingHeader
            flowLabel="Partner signup"
            stepOfTotal={stepCopy.stepOfTotal}
            title={stepCopy.title}
            description={stepCopy.description}
            className="mb-8"
          />

          <PartnerOnboardingStepper
            currentStep={currentStepIndex}
            onStepClick={handleStepperClick}
            className="mb-10"
          />

          {error && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 relative pr-10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
              <button
                type="button"
                onClick={() => setError(null)}
                className="absolute right-2 top-2 text-destructive hover:opacity-70"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Account details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-fullName">
                    Full name
                  </label>
                  <input
                    id="vo-fullName"
                    className={fieldClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="As on ID / bank"
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-businessName">
                    Business / brand name
                  </label>
                  <input
                    id="vo-businessName"
                    className={fieldClass}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Shown on listings"
                    autoComplete="organization"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-email">
                    Work email
                  </label>
                  <input
                    id="vo-email"
                    type="email"
                    className={fieldClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-phone">
                    Mobile
                  </label>
                  <input
                    id="vo-phone"
                    type="tel"
                    className={fieldClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 …"
                    autoComplete="tel"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-password">
                    Password
                  </label>
                  <input
                    id="vo-password"
                    type="password"
                    className={fieldClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="vo-confirmPassword"
                    type="password"
                    className={fieldClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v === true)}
                  className="mt-0.5 size-4 shrink-0 border-slate-300 data-[state=checked]:border-[#2563eb] data-[state=checked]:bg-[#2563eb] data-[state=checked]:text-white"
                />
                <span className="text-sm leading-relaxed text-slate-600">
                  I agree to the Mogzu partner terms, privacy policy, and marketplace rules.
                </span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-blue-100/60">
                <strong className="font-semibold text-slate-900">Select everything you can deliver.</strong> You can refine
                listings after approval. At least one category is required.
              </div>
              {VENDOR_SERVICE_MODULES.map((mod) => {
                const open = expandedModule === mod.id;
                const count = selection[mod.id].size;
                const allSelected =
                  mod.categories.length > 0 && mod.categories.every((c) => selection[mod.id].has(c));
                return (
                  <div
                    key={mod.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/40"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedModule(open ? null : mod.id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50/80"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{mod.label}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{mod.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {count > 0 && (
                          <span className="rounded-full bg-[#2563eb]/15 px-2 py-0.5 text-xs font-semibold text-[#1d4ed8] ring-1 ring-[#2563eb]/25">
                            {count}
                          </span>
                        )}
                        <ChevronDown
                          className={`size-5 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </div>
                    </button>
                    {open && (
                      <div className="border-t border-slate-200 bg-slate-50/40 px-4 pb-4 pt-3">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleModuleAll(mod.id, mod.categories)}
                            className="text-xs font-medium text-[#2563eb] underline-offset-2 hover:underline"
                          >
                            {allSelected ? 'Clear all' : 'Select all in this module'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {mod.categories.map((cat) => {
                            const on = selection[mod.id].has(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(mod.id, cat)}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                  on
                                    ? 'border-[#2563eb] bg-[#2563eb]/10 text-[#1d4ed8] ring-1 ring-[#2563eb]/30'
                                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="text-center text-sm font-medium text-slate-600">
                {selectedCount} categor{selectedCount === 1 ? 'y' : 'ies'} selected across modules
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Location &amp; extras</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-city">
                    Primary city
                  </label>
                  <input
                    id="vo-city"
                    className={fieldClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-state">
                    State / region
                  </label>
                  <input
                    id="vo-state"
                    className={fieldClass}
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-gst">
                    GSTIN <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="vo-gst"
                    className={fieldClass}
                    value={gstOptional}
                    onChange={(e) => setGstOptional(e.target.value)}
                    placeholder="If registered"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="vo-pitch">
                    Short pitch <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id="vo-pitch"
                    className={textareaClass}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="What should corporate buyers know about you?"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
                  <p className="mt-1 font-medium text-slate-900">{fullName}</p>
                  <p className="text-slate-600">{businessName}</p>
                  <p className="text-slate-600">{email}</p>
                  <p className="text-slate-600">{phone}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                  <p className="mt-1 text-slate-700">
                    {city}, {stateRegion}
                  </p>
                  {gstOptional ? <p className="text-slate-600">GST: {gstOptional}</p> : null}
                  {pitch ? <p className="mt-1 text-slate-600">{pitch}</p> : null}
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected services</p>
                  <ul className="space-y-2">
                    {VENDOR_SERVICE_MODULES.filter((m) => selection[m.id].size > 0).map((m) => (
                      <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm ring-1 ring-slate-200/40">
                        <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                        <p className="mt-1 text-xs text-slate-600">{[...selection[m.id]].join(' · ')}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                On submit, we save your onboarding and continue to{' '}
                <span className="font-semibold text-slate-800">listing setup</span> so you can add your first space or
                service.
              </p>
            </div>
          )}

          <CorporateOnboardingFooterLinks className="mt-12 border-t border-slate-100 pt-8" />
        </div>
      </div>

      <CorporateOnboardingStepFooter>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <CorporateOnboardingBackButton onClick={handleFooterBack}>
            {step === 1 ? 'Back to home' : 'Back'}
          </CorporateOnboardingBackButton>
          <CorporateOnboardingPrimaryButton
            onClick={goNext}
            disabled={isSubmitting}
            className="whitespace-nowrap sm:min-w-[7.5rem]"
          >
            {step === 4 ? (isSubmitting ? 'Submitting…' : 'Submit & continue') : 'Continue'}
          </CorporateOnboardingPrimaryButton>
        </div>
      </CorporateOnboardingStepFooter>
    </CorporateOnboardingPageShell>
  );
}
