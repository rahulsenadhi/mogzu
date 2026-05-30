/**
 * Wordmark: colorful PNG from `public/branding/mogzu-wordmark.png`.
 * Mark: single-letter “m” monogram (no figma:asset).
 */
import { useWhiteLabel } from '@/app/lib/whiteLabelTheme';

const WORDMARK_SRC = '/branding/mogzu-wordmark.png';
const MARK_SRC = '/branding/mogzu-mark-m.png';

export type MogzuLogoVariant = 'mark' | 'wordmark';

export interface MogzuLogoProps {
  variant?: MogzuLogoVariant;
  /** Applied to wrapper; for mark use square e.g. `h-7 w-7`; for wordmark use height + max-w */
  className?: string;
  /**
   * When true (default), wordmark uses mix-blend-multiply for white matte on light backgrounds.
   * Ignored for `variant="mark"`.
   */
  blendWhite?: boolean;
  /**
   * Wordmark image alignment inside its box. Use `center` on frosted/glass panels so the mark
   * does not sit on the left edge of a wide hit target. Default `center`.
   */
  wordmarkAlign?: 'left' | 'center';
  /** Extra classes on the wordmark `<img>` */
  imgClassName?: string;
}

/**
 * Collapsed-rail monogram uses the exact provided "m" reference asset.
 * mix-blend-multiply helps the white matte blend into light surfaces.
 */
function MogzuMarkMonogram({ className = '' }: { className?: string }) {
  const outer = `inline-flex shrink-0 items-center justify-center bg-transparent ${className}`.trim();
  return (
    <span className={outer} role="img" aria-label="Mogzu">
      <img
        src={MARK_SRC}
        alt="Mogzu"
        className="h-full w-auto max-w-full object-contain object-center mix-blend-multiply"
        draggable={false}
        decoding="async"
      />
    </span>
  );
}

export function MogzuLogo({
  variant = 'wordmark',
  className = '',
  blendWhite = true,
  wordmarkAlign = 'center',
  imgClassName = '',
}: MogzuLogoProps) {
  const { isWhiteLabel, logoUrl, partner } = useWhiteLabel();

  // White-label partner logo replaces the Mogzu mark/wordmark when configured.
  if (isWhiteLabel && logoUrl) {
    const wrapper = `inline-flex items-center justify-center shrink-0 ${className}`.trim();
    return (
      <span className={wrapper}>
        <img
          src={logoUrl}
          alt={partner?.business_name ?? 'Partner'}
          className={`h-full w-auto max-w-full object-contain ${imgClassName}`.trim()}
          draggable={false}
          decoding="async"
        />
      </span>
    );
  }

  if (variant === 'mark') {
    return <MogzuMarkMonogram className={className} />;
  }

  const wrapper = `inline-flex items-center justify-center shrink-0 ${className}`.trim();
  const userSetsBlend = /\bmix-blend-[^\s]+/.test(imgClassName);
  const blendClass = blendWhite
    ? 'mix-blend-multiply'
    : userSetsBlend
      ? ''
      : 'mix-blend-normal';
  const objectPositionClass = wordmarkAlign === 'left' ? 'object-left' : 'object-center';

  return (
    <span className={wrapper}>
      <img
        src={WORDMARK_SRC}
        alt="Mogzu"
        className={`h-full w-auto max-w-full object-contain ${objectPositionClass} ${blendClass} ${imgClassName}`.trim()}
        draggable={false}
        decoding="async"
      />
    </span>
  );
}
