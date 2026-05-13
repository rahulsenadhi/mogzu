import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import type React from 'react';

type CommonProps = {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

function withBaseClass(disabled?: boolean, extra?: string): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-[0.3px] transition-all duration-180 ease-out h-12 md:h-12 max-md:h-[52px]';
  const states = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]';
  return `${base} ${states} ${extra ?? ''}`;
}

export function PrimaryCTAButton({ children, loading, disabled, className = '', ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={withBaseClass(
        isDisabled,
        `bg-[#2563EB] text-white hover:scale-[1.02] hover:shadow-md hover:bg-[#1f55c8] ${className}`,
      )}
    >
      <span>{children}</span>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform duration-180 group-hover:translate-x-1" />}
    </button>
  );
}

export function SecondaryCTAButton({ children, loading, disabled, className = '', ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={withBaseClass(
        isDisabled,
        `border-[1.5px] border-[#2563EB] text-[#2563EB] bg-transparent hover:bg-blue-50/80 hover:scale-[1.02] ${className}`,
      )}
    >
      <span>{children}</span>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform duration-180 group-hover:translate-x-1" />}
    </button>
  );
}

export function GhostCTAButton({ children, loading, disabled, className = '', ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-1.5 text-[15px] font-semibold tracking-[0.3px] text-slate-500 transition-colors duration-180 ${
        isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:text-slate-800 hover:underline'
      } ${className}`}
    >
      <span>{children}</span>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    </button>
  );
}

export function DestructiveCTAButton({ children, loading, disabled, className = '', ...props }: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={withBaseClass(
        isDisabled,
        `bg-red-600 text-white hover:scale-[1.02] hover:shadow-md hover:bg-red-700 ${className}`,
      )}
    >
      <span>{children}</span>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

type IconOnlyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: React.ReactNode;
  tone?: 'default' | 'green' | 'red';
};

export function IconOnlyButtonWithTooltip({
  label,
  icon,
  tone = 'default',
  className = '',
  ...props
}: IconOnlyButtonProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => timerRef.current && window.clearTimeout(timerRef.current), []);

  const toneClass =
    tone === 'green'
      ? 'text-emerald-700'
      : tone === 'red'
        ? 'text-red-600'
        : 'text-slate-600';

  return (
    <div className="relative inline-flex">
      <button
        {...props}
        aria-label={label}
        onMouseEnter={(e) => {
          props.onMouseEnter?.(e);
          timerRef.current = window.setTimeout(() => setOpen(true), 400);
        }}
        onMouseLeave={(e) => {
          props.onMouseLeave?.(e);
          if (timerRef.current) window.clearTimeout(timerRef.current);
          setOpen(false);
        }}
        className={`h-9 w-9 min-h-9 min-w-9 rounded-full p-2 hover:bg-slate-100 transition-colors ${toneClass} ${className}`}
      >
        {icon}
      </button>
      {open ? (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white shadow">
          {label}
        </span>
      ) : null}
    </div>
  );
}
