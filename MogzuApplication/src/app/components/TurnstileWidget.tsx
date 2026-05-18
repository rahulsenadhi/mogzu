// Phase 3 Feature 3 — Cloudflare Turnstile widget.
//
// Loads turnstile.js once + renders an invisible-managed widget. Calls
// onToken with the captured token (or null on expiry/error). Caller
// must gate submission on a non-null token when a site key is set.

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          appearance?: 'always' | 'execute' | 'interaction-only'
        },
      ) => string
      remove: (widgetId: string) => void
      reset: (widgetId?: string) => void
    }
    __mogzuTurnstileLoaderPromise?: Promise<void>
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstile(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (window.__mogzuTurnstileLoaderPromise) return window.__mogzuTurnstileLoaderPromise
  window.__mogzuTurnstileLoaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(s)
  })
  return window.__mogzuTurnstileLoaderPromise
}

export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? ''

export default function TurnstileWidget({
  onToken,
  theme = 'light',
}: {
  onToken: (token: string | null) => void
  theme?: 'light' | 'dark' | 'auto'
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let cancelled = false
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        })
      })
      .catch(() => onToken(null))

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore — widget may already be torn down
        }
        widgetIdRef.current = null
      }
    }
  }, [onToken, theme])

  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={ref} className="mt-2" />
}
