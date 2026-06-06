import { listLiveBlocks, type CmsBlockLive } from '@/lib/cms'
import { bundledLogoUrlForSlug, CLIENT_LOGO_BUNDLED } from '@/app/lib/clientLogoAssets'

export type ClientLogoItem = {
  id: string
  name: string
  logoUrl?: string
  href?: string
}

const CLIENT_META: { id: string; name: string; href?: string }[] = [
  { id: 'client-icici-securities', name: 'ICICI Securities', href: 'https://www.icicisecurities.com' },
  { id: 'client-tesseract-apps', name: 'TesseractApps', href: 'https://www.tesseractsoftware.com' },
  { id: 'client-design-democracy', name: 'Design Democracy' },
  { id: 'client-xdlinx-labs', name: 'Xdlinx Space Labs' },
  { id: 'client-nift', name: 'NIFT', href: 'https://www.nift.ac.in' },
  { id: 'client-chilis', name: "Chili's Grill & Bar" },
  { id: 'client-alpha-circle', name: 'The Alpha Circle' },
  { id: 'client-factset', name: 'FactSet', href: 'https://www.factset.com' },
  { id: 'client-tapadia-diagnostics', name: 'Tapadia Diagnostic Centre' },
  { id: 'client-jk-tourism', name: 'J&K Tourism', href: 'https://www.jktourism.jk.gov.in' },
  { id: 'client-adanet-next', name: 'AdametNext' },
  { id: 'client-keerthi-constructions', name: 'Keerthi Constructions' },
  { id: 'client-radio-bar', name: 'Radio Bar' },
]

export const DEFAULT_CLIENT_LOGOS: ClientLogoItem[] = CLIENT_META.map((c) => ({
  ...c,
  logoUrl: CLIENT_LOGO_BUNDLED[c.id],
}))

export function resolveClientLogoUrl(slug: string, imageUrl?: string | null): string | undefined {
  const bundled = bundledLogoUrlForSlug(slug)
  if (bundled) return bundled

  const trimmed = imageUrl?.trim()
  if (trimmed) return trimmed
  return undefined
}

export function cmsBlockToClientLogo(block: CmsBlockLive): ClientLogoItem {
  return {
    id: block.id,
    name: block.title?.trim() || block.slug,
    logoUrl: resolveClientLogoUrl(block.slug, block.image_url),
    href: block.cta_href?.trim() || undefined,
  }
}

export async function listLiveClientLogos(): Promise<{
  data: ClientLogoItem[]
  error: string | null
}> {
  const { data, error } = await listLiveBlocks('client_logo')
  if (error) return { data: DEFAULT_CLIENT_LOGOS, error }
  if (data.length === 0) return { data: DEFAULT_CLIENT_LOGOS, error: null }

  const mapped = data.map((block) => {
    const item = cmsBlockToClientLogo(block)
    const fallback = DEFAULT_CLIENT_LOGOS.find((d) => d.id === block.slug || d.name === item.name)
    return {
      ...item,
      logoUrl: item.logoUrl ?? fallback?.logoUrl,
      href: item.href ?? fallback?.href,
    }
  })

  return { data: mapped, error: null }
}
