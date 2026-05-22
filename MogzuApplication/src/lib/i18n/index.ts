// Phase 3 Feature 7 — minimal i18n. English only at launch; the loader
// shape is locale-pluggable so additional locales can drop in without
// touching call sites.

import en from './en.json'
import hi from './hi.json'

const BUNDLES: Record<string, Record<string, Record<string, string>>> = {
  en,
  hi,
}

export const SUPPORTED_LOCALES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
]

const STORAGE_KEY = 'mogzu.locale'

let activeLocale =
  (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) || 'en'
if (!BUNDLES[activeLocale]) activeLocale = 'en'

const listeners = new Set<(locale: string) => void>()

export function getLocale(): string {
  return activeLocale
}

export function setLocale(locale: string): void {
  const base = locale.split('-')[0]
  if (!BUNDLES[base]) return
  activeLocale = base
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, base)
  listeners.forEach((fn) => fn(base))
}

export function subscribeLocale(fn: (locale: string) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// dot-path lookup, e.g. t('catalogue.request_quote').
export function t(key: string, fallback?: string): string {
  const bundle = BUNDLES[activeLocale]
  const [ns, leaf] = key.split('.')
  const v = bundle?.[ns]?.[leaf]
  return v ?? fallback ?? key
}
