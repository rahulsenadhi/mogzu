/**
 * Subtle portal background: Mogzu landing palette (warm cream + brand accents)
 * with Snappy-like soft gradients and sparse “confetti” texture — corporate, not playful.
 */
type MogzuAmbientBackdropProps = {
  className?: string;
  /** compact = fewer shapes (e.g. split signup panel) */
  density?: 'full' | 'compact';
  /** default = lightest; onboarding = legacy wizard wash (more saturation); corporate = workspace / landing-aligned, less magenta */
  variant?: 'default' | 'onboarding' | 'corporate';
};

const DOTS_DEFAULT = `
            radial-gradient(circle at 20% 30%, rgba(67,121,238,0.1) 0 2px, transparent 3px),
            radial-gradient(circle at 82% 22%, rgba(238,42,123,0.06) 0 2px, transparent 3px),
            radial-gradient(circle at 58% 76%, rgba(250,141,64,0.1) 0 2px, transparent 3px),
            radial-gradient(circle at 14% 68%, rgba(21,211,157,0.08) 0 1.5px, transparent 2.5px),
            radial-gradient(circle at 92% 58%, rgba(155,81,224,0.07) 0 2px, transparent 3px),
            radial-gradient(circle at 38% 90%, rgba(255,209,0,0.08) 0 2px, transparent 3px),
            radial-gradient(circle at 50% 14%, rgba(67,121,238,0.08) 0 1.5px, transparent 2.5px)
          `;

const DOTS_ONBOARDING = `
            radial-gradient(circle at 20% 30%, rgba(67,121,238,0.12) 0 2px, transparent 3px),
            radial-gradient(circle at 82% 22%, rgba(238,42,123,0.09) 0 2px, transparent 3px),
            radial-gradient(circle at 58% 76%, rgba(250,141,64,0.1) 0 2px, transparent 3px),
            radial-gradient(circle at 14% 68%, rgba(21,211,157,0.08) 0 1.5px, transparent 2.5px),
            radial-gradient(circle at 92% 58%, rgba(155,81,224,0.07) 0 2px, transparent 3px),
            radial-gradient(circle at 38% 90%, rgba(255,209,0,0.08) 0 2px, transparent 3px),
            radial-gradient(circle at 50% 14%, rgba(67,121,238,0.07) 0 1.5px, transparent 2.5px)
          `;

/** Landing-aligned workspace: cream-first, very subtle accents */
const DOTS_CORPORATE = `
            radial-gradient(circle at 20% 30%, rgba(67,121,238,0.07) 0 2px, transparent 3px),
            radial-gradient(circle at 82% 22%, rgba(250,141,64,0.05) 0 2px, transparent 3px),
            radial-gradient(circle at 58% 76%, rgba(67,121,238,0.04) 0 2px, transparent 3px),
            radial-gradient(circle at 14% 68%, rgba(21,211,157,0.05) 0 1.5px, transparent 2.5px),
            radial-gradient(circle at 92% 58%, rgba(155,81,224,0.04) 0 2px, transparent 3px),
            radial-gradient(circle at 38% 90%, rgba(255,209,0,0.05) 0 2px, transparent 3px),
            radial-gradient(circle at 50% 14%, rgba(67,121,238,0.05) 0 1.5px, transparent 2.5px)
          `;

export function MogzuAmbientBackdrop({
  className = '',
  density = 'full',
  variant = 'default',
}: MogzuAmbientBackdropProps) {
  const compact = density === 'compact';
  const onboarding = variant === 'onboarding';
  const corporate = variant === 'corporate';
  const rich = onboarding || corporate;

  const dotsStyle =
    corporate ? DOTS_CORPORATE : onboarding ? DOTS_ONBOARDING : DOTS_DEFAULT;

  const dotOpacity = compact
    ? 'opacity-[0.28]'
    : corporate
      ? 'opacity-[0.3]'
      : onboarding
        ? 'opacity-[0.52]'
        : 'opacity-[0.38]';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Mogzu landing base + airy blue (Snappy-style depth) */}
      <div className="absolute inset-0 bg-[#FFFDF9]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF9] via-[#fafaf9] to-[#f7f7f5]" />

      {onboarding && (
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 15% 25%, rgba(67,121,238,0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 20%, rgba(238,42,123,0.08), transparent 50%), radial-gradient(ellipse 65% 45% at 50% 85%, rgba(250,141,64,0.12), transparent 55%)',
          }}
        />
      )}

      {corporate && (
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 15% 25%, rgba(67,121,238,0.035), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 18%, rgba(250,141,64,0.04), transparent 50%), radial-gradient(ellipse 65% 45% at 50% 88%, rgba(67,121,238,0.02), transparent 55%)',
          }}
        />
      )}

      {/* Large soft blooms — Mogzu blue + warm accents; corporate avoids magenta wash */}
      <div
        className={`absolute -left-[28%] -top-[22%] h-[min(88vh,920px)] w-[min(88vw,920px)] rounded-full blur-[128px] ${
          rich ? (corporate ? 'bg-[#4379ee]/[0.04]' : 'bg-[#4379ee]/[0.11]') : 'bg-[#4379ee]/[0.065]'
        }`}
      />
      <div
        className={`absolute -right-[18%] top-[0%] h-[min(62vh,680px)] w-[min(62vw,680px)] rounded-full blur-[108px] ${
          corporate
            ? 'bg-[#4379ee]/[0.025]'
            : onboarding
              ? 'bg-[#EE2A7B]/[0.065]'
              : 'bg-[#EE2A7B]/[0.045]'
        }`}
      />
      <div
        className={`absolute bottom-[-12%] left-[15%] h-[min(58vh,600px)] w-[min(58vw,600px)] rounded-full blur-[102px] ${
          rich ? 'bg-[#FA8D40]/[0.1]' : 'bg-[#FA8D40]/[0.055]'
        }`}
      />

      {!compact && (
        <>
          <div
            className={`absolute bottom-[18%] right-[3%] h-[min(48vh,520px)] w-[min(48vw,520px)] rounded-full blur-[96px] ${
              rich ? 'bg-[#15D39D]/[0.08]' : 'bg-[#15D39D]/[0.045]'
            }`}
          />
          <div
            className={`absolute left-[42%] top-[32%] h-44 w-72 -translate-x-1/2 rotate-[-11deg] rounded-[2rem] blur-3xl ${
              rich ? 'bg-[#FFD100]/[0.09]' : 'bg-[#FFD100]/[0.055]'
            }`}
          />
          <div
            className={`absolute top-[12%] right-[22%] size-[5.5rem] rotate-12 rounded-2xl ${
              rich ? 'bg-[#9B51E0]/[0.06]' : 'bg-[#9B51E0]/[0.035]'
            }`}
          />
          <div
            className={`absolute bottom-[28%] left-[6%] size-[4.5rem] -rotate-6 rounded-full ${
              rich ? 'bg-[#15D39D]/[0.07]' : 'bg-[#15D39D]/[0.04]'
            }`}
          />
          <div
            className={`absolute top-[48%] right-[12%] size-16 rotate-[-8deg] rounded-full ${
              rich ? 'bg-[#4379ee]/[0.09]' : 'bg-[#4379ee]/[0.05]'
            }`}
          />
        </>
      )}

      {/* Sparse dot texture */}
      <div
        className={`absolute inset-0 ${dotOpacity}`}
        style={{
          backgroundImage: dotsStyle,
          backgroundSize:
            '260px 260px, 300px 300px, 280px 280px, 220px 220px, 310px 310px, 270px 270px, 240px 240px',
        }}
      />

      {/* Light vignette */}
      <div
        className={
          rich
            ? 'absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-200/25'
            : 'absolute inset-0 bg-gradient-to-b from-white/[0.25] via-transparent to-slate-200/[0.2]'
        }
      />
    </div>
  );
}
