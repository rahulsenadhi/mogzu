import { Fragment, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { MogzuAmbientBackdrop } from '@/app/components/layouts/MogzuAmbientBackdrop';

const STEP_ROUTES = [
  '/signup/corporate/company-details',
  '/signup/corporate/interests',
  '/signup/corporate/access',
] as const;

const STEP_LABELS = ['Company', 'Interests', 'Plan'] as const;

type StepperProps = {
  /** 0 = Company, 1 = Interests, 2 = Plan */
  currentStep: 0 | 1 | 2;
  className?: string;
};

export function CorporateOnboardingStepper({ currentStep, className = '' }: StepperProps) {
  const navigate = useNavigate();

  const go = (index: number) => {
    if (index < currentStep) navigate(STEP_ROUTES[index]);
  };

  return (
    <nav aria-label="Onboarding progress" className={`w-full ${className}`}>
      <div className="flex w-full max-w-lg items-stretch gap-1 sm:max-w-xl sm:gap-2">
        {STEP_LABELS.map((label, i) => (
          <Fragment key={label}>
            <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-[5.25rem]">
              <button
                type="button"
                onClick={() => go(i)}
                disabled={i >= currentStep}
                aria-current={i === currentStep ? 'step' : undefined}
                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
                  i < currentStep
                    ? 'cursor-pointer bg-[#2563eb] text-white shadow-sm hover:bg-[#1d4ed8]'
                    : i === currentStep
                      ? 'cursor-default bg-white text-[#2563eb] ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#f4f7fc]'
                      : 'cursor-default bg-slate-200/90 text-slate-500'
                }`}
              >
                {i < currentStep ? <Check className="size-4 stroke-[2.5]" aria-hidden /> : <span>{i + 1}</span>}
              </button>
              <span
                className={`text-center text-[11px] font-medium leading-tight sm:text-xs ${
                  i === currentStep ? 'text-slate-900' : i < currentStep ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex min-w-[0.75rem] flex-1 items-center px-0 sm:min-w-[1.25rem] sm:px-1">
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-all duration-500 ease-out"
                    style={{ width: currentStep > i ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}

const PARTNER_STEP_LABELS = ['Account', 'Services', 'Business', 'Review'] as const;

export type PartnerOnboardingStepperProps = {
  /** 0 = Account … 3 = Review */
  currentStep: 0 | 1 | 2 | 3;
  className?: string;
  /** Jump to a completed step (index &lt; currentStep) */
  onStepClick?: (index: number) => void;
};

export function PartnerOnboardingStepper({ currentStep, className = '', onStepClick }: PartnerOnboardingStepperProps) {
  const go = (index: number) => {
    if (index < currentStep) onStepClick?.(index);
  };

  return (
    <nav aria-label="Partner onboarding progress" className={`w-full ${className}`}>
      <div className="flex w-full max-w-2xl items-stretch gap-0.5 overflow-x-auto pb-1 sm:max-w-none sm:gap-1">
        {PARTNER_STEP_LABELS.map((label, i) => (
          <Fragment key={label}>
            <div className="flex w-[3.5rem] shrink-0 flex-col items-center gap-1.5 sm:w-[4.25rem] sm:gap-2">
              <button
                type="button"
                onClick={() => go(i)}
                disabled={i > currentStep}
                aria-current={i === currentStep ? 'step' : undefined}
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] sm:size-9 sm:text-sm ${
                  i < currentStep
                    ? 'cursor-pointer bg-[#2563eb] text-white shadow-sm hover:bg-[#1d4ed8]'
                    : i === currentStep
                      ? 'cursor-default bg-white text-[#2563eb] ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#f4f7fc]'
                      : 'cursor-default bg-slate-200/90 text-slate-500'
                }`}
              >
                {i < currentStep ? <Check className="size-3.5 stroke-[2.5] sm:size-4" aria-hidden /> : <span>{i + 1}</span>}
              </button>
              <span
                className={`max-w-[3.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-[11px] md:text-xs ${
                  i === currentStep ? 'text-slate-900' : i < currentStep ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < PARTNER_STEP_LABELS.length - 1 && (
              <div className="flex min-w-[0.5rem] flex-1 items-center px-0 sm:min-w-[0.75rem] sm:px-0.5">
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-all duration-500 ease-out"
                    style={{ width: currentStep > i ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}

type HeaderProps = {
  stepOfTotal: string;
  title: string;
  description: string;
  className?: string;
  /** Eyebrow prefix before step (default: Corporate signup) */
  flowLabel?: string;
};

export function CorporateOnboardingHeader({
  stepOfTotal,
  title,
  description,
  className = '',
  flowLabel = 'Corporate signup',
}: HeaderProps) {
  return (
    <header className={`space-y-3 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {flowLabel} · {stepOfTotal}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem] sm:leading-snug">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">{description}</p>
    </header>
  );
}

export function CorporateOnboardingFooterLinks({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const linkCls =
    'text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 rounded-sm';

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 ${className}`}>
      <button type="button" onClick={() => navigate('/why-mogzu')} className={linkCls}>
        FAQ
      </button>
      <span className="hidden h-3 w-px bg-slate-200 sm:block" aria-hidden />
      <button type="button" onClick={() => navigate('/why-mogzu')} className={linkCls}>
        Features
      </button>
      <span className="hidden h-3 w-px bg-slate-200 sm:block" aria-hidden />
      <button type="button" onClick={() => navigate('/assistance')} className={linkCls}>
        Support
      </button>
    </div>
  );
}

export function CorporateOnboardingPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 min-h-full w-full">
        <MogzuAmbientBackdrop variant="corporate" />
      </div>
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
