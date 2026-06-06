/** Bundled logo paths served from /public/client-logos (Vite root). */
export const CLIENT_LOGO_BUNDLED: Record<string, string> = {
  'client-icici-securities': '/client-logos/icici-securities.png',
  'client-tesseract-apps': '/client-logos/tesseract-apps.png',
  'client-design-democracy': '/client-logos/design-democracy.png',
  'client-xdlinx-labs': '/client-logos/xdlinx-labs.png',
  'client-nift': '/client-logos/nift.png',
  'client-chilis': '/client-logos/chilis.png',
  'client-alpha-circle': '/client-logos/alpha-circle.png',
  'client-factset': '/client-logos/factset.png',
  'client-tapadia-diagnostics': '/client-logos/tapadia-diagnostics.svg',
  'client-jk-tourism': '/client-logos/jk-tourism.png',
  'client-adanet-next': '/client-logos/adanet-next.png',
  'client-keerthi-constructions': '/client-logos/keerthi-constructions.png',
  'client-radio-bar': '/client-logos/radio-bar.png',
}

/** Per-logo display bounds — tune wordmarks vs icon marks for visual balance. */
export const CLIENT_LOGO_SIZES: Record<string, { maxHeight: string; maxWidth: string }> = {
  'client-factset': { maxHeight: 'max-h-[80px]', maxWidth: 'max-w-[250px]' },
  'client-tapadia-diagnostics': { maxHeight: 'max-h-[72px]', maxWidth: 'max-w-[260px]' },
}

const DEFAULT_LOGO_SIZE = { maxHeight: 'max-h-[80px]', maxWidth: 'max-w-[220px]' }

export function logoSizeClassesForSlug(slug: string): string {
  const size = CLIENT_LOGO_SIZES[slug] ?? DEFAULT_LOGO_SIZE
  return `${size.maxHeight} ${size.maxWidth}`
}

export function bundledLogoUrlForSlug(slug: string): string | undefined {
  return CLIENT_LOGO_BUNDLED[slug]
}
