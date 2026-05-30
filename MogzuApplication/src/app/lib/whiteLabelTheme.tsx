import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getBySlug, type WhiteLabelPartner } from '@/lib/whiteLabelPartners'

/**
 * Phase 5 Feature 4 — white-label runtime theming.
 *
 * Detects the active partner (by `?partner=` override, VITE_WHITE_LABEL_SLUG env,
 * or subdomain), fetches its branding from `white_label_partners` (anon-readable),
 * and applies the partner's colours to the app's CSS variables at runtime. Logo is
 * exposed via context so MogzuLogo can swap in the partner mark. Falls back silently
 * to the default Mogzu brand when no active partner resolves.
 */

type WhiteLabelContextValue = {
  partner: WhiteLabelPartner | null
  logoUrl: string | null
  isWhiteLabel: boolean
}

const WhiteLabelContext = createContext<WhiteLabelContextValue>({
  partner: null,
  logoUrl: null,
  isWhiteLabel: false,
})

const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'staging', 'dev', 'localhost'])

/** Resolve the partner slug from override → env → subdomain. Null = default Mogzu. */
function resolvePartnerSlug(): string | null {
  if (typeof window === 'undefined') return null
  const param = new URLSearchParams(window.location.search).get('partner')
  if (param) return param.trim() || null
  const envSlug = import.meta.env.VITE_WHITE_LABEL_SLUG as string | undefined
  if (envSlug) return envSlug.trim() || null
  const host = window.location.hostname
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return null
  const parts = host.split('.')
  if (parts.length < 3) return null // apex (mogzu.com) or localhost
  const sub = parts[0]
  return RESERVED_SUBDOMAINS.has(sub) ? null : sub
}

export function WhiteLabelThemeProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<WhiteLabelContextValue>({
    partner: null,
    logoUrl: null,
    isWhiteLabel: false,
  })

  useEffect(() => {
    const slug = resolvePartnerSlug()
    if (!slug) return
    let cancelled = false
    void getBySlug(slug)
      .then(({ data }) => {
        if (cancelled || !data) return
        const root = document.documentElement
        if (data.primary_color) {
          root.style.setProperty('--primary', data.primary_color)
          root.style.setProperty('--color-primary', data.primary_color)
        }
        if (data.secondary_color) {
          root.style.setProperty('--secondary', data.secondary_color)
          root.style.setProperty('--color-secondary', data.secondary_color)
        }
        setValue({ partner: data, logoUrl: data.logo_url, isWhiteLabel: true })
      })
      .catch(() => {
        /* network/RLS error → stay on the default Mogzu brand */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <WhiteLabelContext.Provider value={value}>{children}</WhiteLabelContext.Provider>
}

export function useWhiteLabel(): WhiteLabelContextValue {
  return useContext(WhiteLabelContext)
}
