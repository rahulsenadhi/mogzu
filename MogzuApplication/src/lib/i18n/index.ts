// Phase 3 Feature 7 — minimal i18n. English only at launch; the loader
// shape is locale-pluggable so additional locales can drop in without
// touching call sites.

import en from './en.json'

const BUNDLES: Record<string, Record<string, Record<string, string>>> = {
  en,
}

let activeLocale = 'en'

export function setLocale(locale: string): void {
  const base = locale.split('-')[0]
  if (BUNDLES[base]) activeLocale = base
}

// dot-path lookup, e.g. t('catalogue.request_quote').
export function t(key: string, fallback?: string): string {
  const bundle = BUNDLES[activeLocale]
  const [ns, leaf] = key.split('.')
  const v = bundle?.[ns]?.[leaf]
  return v ?? fallback ?? key
}
