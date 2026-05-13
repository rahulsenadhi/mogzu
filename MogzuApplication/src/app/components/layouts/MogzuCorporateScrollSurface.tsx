import type { ReactNode } from 'react';
import { MogzuAmbientBackdrop } from './MogzuAmbientBackdrop';

type MogzuCorporateScrollSurfaceProps = {
  children: ReactNode;
  /** Applied to the inner content wrapper (relative z-[1]) */
  className?: string;
};

/**
 * Primary scroll column for corporate workspace: cream ambient backdrop + scrollable content.
 * Use inside the flex column next to SharedSidebar (below SharedHeader).
 *
 * Inner flow wrapper ensures the backdrop’s absolute inset-0 covers the full scrollable
 * document height (not only the scrollport), so gradients don’t stop mid-page.
 */
export function MogzuCorporateScrollSurface({ children, className = '' }: MogzuCorporateScrollSurfaceProps) {
  return (
    <div className="relative isolate min-h-0 flex-1 overflow-y-auto bg-transparent">
      <div className="relative min-h-full w-full">
        <div className="pointer-events-none absolute inset-0">
          <MogzuAmbientBackdrop variant="corporate" density="full" />
        </div>
        <div className={`relative z-[1] min-h-full ${className}`.trim()}>{children}</div>
      </div>
    </div>
  );
}
