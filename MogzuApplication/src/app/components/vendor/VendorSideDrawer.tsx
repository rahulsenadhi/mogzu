import { useEffect } from 'react';
import { X } from 'lucide-react';

type VendorSideDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Desktop width in px (480 or 520 per spec). */
  desktopWidthPx: 480 | 520;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Unique key to re-run body scroll lock when swapping drawers */
  panelId?: string;
};

export function VendorSideDrawer({
  open,
  onClose,
  desktopWidthPx,
  title,
  subtitle,
  headerRight,
  children,
  footer,
  panelId = 'vendor-drawer',
}: VendorSideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const w = desktopWidthPx;

  return (
    <div className="fixed inset-0 z-[100] font-['Inter']" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end md:items-stretch">
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${panelId}-title`}
          className="pointer-events-auto flex h-full max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 md:max-h-none md:rounded-none md:shadow-[-8px_0_30px_rgba(15,23,42,0.12)] md:animate-in md:slide-in-from-right md:duration-300"
          style={{ maxWidth: `min(100vw, ${w}px)` }}
        >
          <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1">
              <h2 id={`${panelId}-title`} className="text-base font-semibold leading-tight text-slate-900">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="Close feedback panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer ? <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">{footer}</footer> : null}
        </div>
      </div>
    </div>
  );
}
