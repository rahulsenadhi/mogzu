import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CorporateOnboardingStepFooter,
  CorporateOnboardingBackButton,
  CorporateOnboardingPrimaryButton,
} from '@/app/components/corporate/CorporateOnboardingStepFooter';
import {
  CorporateOnboardingPageShell,
  CorporateOnboardingHeader,
  CorporateOnboardingStepper,
  CorporateOnboardingFooterLinks,
} from '@/app/components/corporate/CorporateOnboardingChrome';
import {
  finalizeCorporateOnboarding,
  getCorporateOnboardingDraft,
  saveCorporateOnboardingDraft,
} from '@/app/lib/corporateOnboarding';
import { useAuth } from '@/lib/auth';

interface Package {
  id: string;
  name: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: 'free-trial',
    name: 'Starter Trial',
    tagline: 'Try first. Decide later.',
    color: '#FA8D40',
    bgColor: '#FFF7F2',
    borderColor: '#FA8D40',
    features: [
      'First booking FREE',
      'Explore all modules',
      'No charges, no lock-in',
      'Limited support',
      'Basic access only',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Maximum value from Day One',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#2563EB',
    features: [
      'Dedicated Account Manager',
      'Special corporate discount',
      'Full access to all selected modules',
      'Priority support',
      'Unlimited bookings',
      'Vendor marketplace access',
    ],
    popular: true,
  },
  {
    id: 'business-plus',
    name: 'Business+',
    tagline: 'Built for teams that scale',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#7C3AED',
    features: [
      'Everything in Professional',
      'Team access (5–20 members)',
      'Monthly budget controls',
      'Advanced analytics',
      'Approval workflows',
      'Branded experience',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Suite',
    tagline: 'Complete power for large organisations',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#F59E0B',
    features: [
      'Everything in Business+',
      'Custom SLA',
      'Custom integrations (HRMS/ERP)',
      'Bulk bookings & gifting automation',
      'Multi-location management',
      'Dedicated Success Manager',
      'Corporate negotiation on pricing',
    ],
  },
];

export default function ChooseAccess() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [accessError, setAccessError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSelectPackage = (packageId: string) => {
    setAccessError('');
    setSelectedPackage(packageId);
  };

  const handleNext = async () => {
    setAccessError('');
    if (!selectedPackage) {
      setAccessError('Please select a package to continue.');
      return;
    }
    if (!user?.id) {
      setAccessError('Sign in to complete setup.');
      navigate('/login');
      return;
    }

    setSaving(true);
    localStorage.setItem('selectedPlan', selectedPackage);
    saveCorporateOnboardingDraft({ step: 'complete', accessLevel: selectedPackage });

    const { error } = await finalizeCorporateOnboarding({
      userId: user.id,
      corporateId: profile?.corporate_id,
      accessLevel: selectedPackage,
      draft: getCorporateOnboardingDraft(),
    });
    setSaving(false);

    if (error) {
      setAccessError(error);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const handleBack = () => {
    navigate('/signup/corporate/interests');
  };

  return (
    <CorporateOnboardingPageShell>
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 sm:py-10">
        <CorporateOnboardingHeader
          stepOfTotal="Step 3 of 3"
          title="Choose how you want to start"
          description="Try the platform on a free trial, or pick a paid plan for deeper features and support. You can upgrade whenever you are ready."
          className="mb-8 max-w-3xl"
        />
        <CorporateOnboardingStepper currentStep={2} className="mb-12 max-w-xl" />

        {accessError && (
          <div
            className="mb-8 max-w-6xl rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm"
            role="alert"
          >
            {accessError}
          </div>
        )}

        {/* Package Cards Grid */}
        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg.id)}
              className={`relative flex flex-col rounded-2xl border border-white/60 bg-white/90 text-left shadow-sm backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                selectedPackage === pkg.id ? 'ring-2' : 'border-slate-200/90 hover:border-slate-300'
              }`}
              style={{
                borderColor: selectedPackage === pkg.id ? pkg.borderColor : undefined,
                outlineColor: selectedPackage === pkg.id ? pkg.borderColor : undefined,
              }}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: pkg.color }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Header with color */}
              <div
                className="flex h-[88px] flex-col justify-end rounded-t-2xl px-4 pb-3 pt-4"
                style={{ backgroundColor: pkg.bgColor }}
              >
                <h3 className="mb-1 text-base font-bold tracking-tight" style={{ color: pkg.color }}>
                  {pkg.name}
                </h3>
                <p className="text-xs leading-snug text-slate-600">{pkg.tagline}</p>
              </div>

              {/* Features */}
              <div className="px-4 py-4 flex-1 flex flex-col">
                <ul className="space-y-2 mb-4 flex-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" fill={pkg.color} opacity="0.2" />
                        <path
                          d="M8 12l2.5 2.5L16 9"
                          stroke={pkg.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                      <span className="text-[12px] leading-snug text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Button - Changed from button to div to avoid nesting buttons */}
                <div
                  className={`flex h-9 w-full items-center justify-center rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${
                    selectedPackage === pkg.id ? 'border-transparent text-white shadow-sm' : 'bg-white hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: selectedPackage === pkg.id ? pkg.color : 'transparent',
                    borderColor: pkg.color,
                    color: selectedPackage === pkg.id ? 'white' : pkg.color,
                  }}
                >
                  {selectedPackage === pkg.id ? 'Selected' : 'Select plan'}
                </div>
              </div>

              {/* Checkmark for selected */}
              {selectedPackage === pkg.id && (
                <div className="absolute top-2 right-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={pkg.color} />
                    <path
                      d="M8 12l2.5 2.5L16 9"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <CorporateOnboardingFooterLinks className="border-t border-slate-200/80 pt-10" />
      </div>

      <CorporateOnboardingStepFooter>
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <CorporateOnboardingBackButton onClick={handleBack} />
          <CorporateOnboardingPrimaryButton onClick={() => void handleNext()} disabled={saving} className="sm:min-w-[10rem]">
            {saving ? 'Saving…' : 'Complete Setup'}
          </CorporateOnboardingPrimaryButton>
        </div>
      </CorporateOnboardingStepFooter>
    </CorporateOnboardingPageShell>
  );
}