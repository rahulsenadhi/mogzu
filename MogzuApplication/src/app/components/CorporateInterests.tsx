import { useState } from 'react';
import { useNavigate } from 'react-router';
import svgPaths from '@/imports/svg-dypu56cwko';
import imgRectangle34624823 from 'figma:asset/e4376d3bf07c31107a0f40e6c153eb25875890af.png';
import imgImage24906 from 'figma:asset/aeabcf92bfa4ca44ce0d27c0a5a2dbe7c70541ee.png';
import imgImage24905 from 'figma:asset/f5bb6796f2924fa9cbe501e16a7b647e5d103b18.png';
import imgImage24904 from 'figma:asset/b3315586981696905fa2dac88bfbd8b2652397d0.png';
import imgImage24902 from 'figma:asset/45776e0c462ab6330cfcda3b234a2ee63feab640.png';
import {
  CorporateOnboardingStepFooter,
  CorporateOnboardingBackButton,
  CorporateOnboardingSecondaryButton,
  CorporateOnboardingPrimaryButton,
} from '@/app/components/corporate/CorporateOnboardingStepFooter';
import {
  CorporateOnboardingPageShell,
  CorporateOnboardingHeader,
  CorporateOnboardingStepper,
  CorporateOnboardingFooterLinks,
} from '@/app/components/corporate/CorporateOnboardingChrome';

interface Interest {
  id: string;
  title: string;
  description: string;
  image: string;
  maskImage?: string;
  disabled?: boolean;
}

const interests: Interest[] = [
  {
    id: 'spacex',
    title: 'D Space',
    description: 'Book venues, meeting rooms, and activity spaces. Find trusted locations for events, offsites, and corporate gatherings.',
    image: imgImage24906,
    maskImage: imgRectangle34624823,
  },
  {
    id: 'event',
    title: 'Events',
    description: 'Book artists and corporate activities. From performers to fun team experiences everything in one place.',
    image: imgImage24902,
  },
  {
    id: 'gifting',
    title: 'Gifting',
    description: 'Premium personalized corporate gifting. Choose hampers, branded merchandise, and Make-in-India options.',
    image: imgImage24905,
  },
  {
    id: 'heygenie',
    title: 'Hey Genie',
    description: 'Unlock exclusive coupons and savings for your team. Enjoy discounts across dining, shopping, travel, and more.',
    image: imgImage24904,
    disabled: true, // Disabled for now - will be enabled in admin flow
  },
];

export default function CorporateInterests() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState('');

  const toggleInterest = (id: string) => {
    const interest = interests.find(i => i.id === id);
    if (interest?.disabled) return; // Don't allow selection of disabled interests

    setSelectionError('');
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(interestId => interestId !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    setSelectionError('');
    if (selectedInterests.length === 0) {
      setSelectionError('Select at least one interest or use "I\'ll add it later".');
      return;
    }
    console.log('Selected interests:', selectedInterests);
    // Navigate to next step (choose your access)
    navigate('/signup/corporate/access');
  };

  const handleSkip = () => {
    setSelectionError('');
    console.log('Skipped interests selection');
    // Navigate to next step
    navigate('/signup/corporate/access');
  };

  const handleBack = () => {
    navigate('/signup/corporate/company-details');
  };

  return (
    <CorporateOnboardingPageShell>
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 sm:py-10">
        <CorporateOnboardingHeader
          stepOfTotal="Step 2 of 3"
          title="What will your team use first?"
          description="Pick one or more modules. You can change this anytime—we use it to prioritise your home screen and recommendations."
          className="mb-8 max-w-3xl"
        />
        <CorporateOnboardingStepper currentStep={1} className="mb-12 max-w-xl" />

        {/* Interest Cards Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              disabled={interest.disabled}
              className={`group relative flex h-[min(298px,100%)] min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 text-left shadow-sm backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
                selectedInterests.includes(interest.id)
                  ? 'border-[#2563eb] ring-2 ring-[#2563eb]/25'
                  : 'border-slate-200/90 hover:border-slate-300'
              } ${interest.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {/* Image Section */}
              <div className="relative h-[120px] overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-50 to-white">
                {interest.id === 'spacex' && interest.maskImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={interest.image}
                      alt={interest.title}
                      className="w-[82px] h-[82px] object-contain"
                    />
                    <div
                      className="absolute top-[7.08px] left-1/2 -translate-x-1/2 w-[123.82px] h-[91.84px] bg-[#fa8d40] mix-blend-color"
                      style={{
                        maskImage: `url('${interest.maskImage}')`,
                        maskSize: '82px 82px',
                        maskPosition: '21px 7.921px',
                        maskRepeat: 'no-repeat',
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={interest.image}
                      alt={interest.title}
                      className="w-[92px] h-[92px] object-contain"
                    />
                  </div>
                )}

                {/* Checkbox */}
                <div className="absolute top-2 right-2">
                  {selectedInterests.includes(interest.id) ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#2563eb" />
                      <path
                        d="M8 12l2.5 2.5L16 9"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#E3E3E5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-1 flex-col items-center justify-center px-4 pb-5 pt-3 text-center">
                <p className="mb-2 text-[15px] font-semibold tracking-tight text-slate-900">{interest.title}</p>
                <p className="text-[13px] leading-snug text-slate-600">{interest.description}</p>
              </div>

              {/* Disabled overlay for Hey Genie */}
              {interest.disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[2px]">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                    Coming soon
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {selectionError && (
          <div
            className="mx-auto mt-6 max-w-6xl rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm"
            role="alert"
          >
            {selectionError}
          </div>
        )}

        <CorporateOnboardingFooterLinks className="mx-auto mt-16 max-w-6xl border-t border-slate-200/80 pt-10" />
      </div>

      <CorporateOnboardingStepFooter>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <CorporateOnboardingBackButton onClick={handleBack} />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:flex-initial">
            <CorporateOnboardingSecondaryButton onClick={handleSkip} className="whitespace-nowrap">
              I&apos;ll add it later
            </CorporateOnboardingSecondaryButton>
            <CorporateOnboardingPrimaryButton onClick={handleNext} className="whitespace-nowrap sm:min-w-[7.5rem]">
              Next
            </CorporateOnboardingPrimaryButton>
          </div>
        </div>
      </CorporateOnboardingStepFooter>
    </CorporateOnboardingPageShell>
  );
}