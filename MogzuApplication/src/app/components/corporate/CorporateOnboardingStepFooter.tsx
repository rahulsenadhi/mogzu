import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

const shellClass =
  'sticky bottom-0 z-20 border-t border-white/40 bg-white/65 backdrop-blur-lg supports-[backdrop-filter]:bg-white/55 pb-[max(0.75rem,env(safe-area-inset-bottom))]';

const innerClass =
  'mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 pt-3.5 sm:px-8 sm:pt-4 md:px-12 lg:px-16';

export function CorporateOnboardingStepFooter({ children }: { children: ReactNode }) {
  return (
    <footer className={shellClass}>
      <div className={innerClass}>{children}</div>
    </footer>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function CorporateOnboardingBackButton({ children, className = '', ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${className}`}
      {...props}
    >
      <ChevronLeft className="size-4 shrink-0 opacity-70" aria-hidden />
      {children ?? 'Back'}
    </button>
  );
}

export function CorporateOnboardingSecondaryButton({ className = '', ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={`rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${className}`}
      {...props}
    />
  );
}

export function CorporateOnboardingPrimaryButton({ className = '', ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={`rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${className}`}
      {...props}
    />
  );
}
