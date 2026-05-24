import { useEffect, useState } from 'react'
import { getLocale, subscribeLocale } from './index'

function toLocaleTag(code: string): string {
  if (code === 'hi') return 'hi-IN'
  return 'en-IN'
}

export function formatCurrencyByLocale(
  value: number | null | undefined,
  localeCode?: string,
  currency = 'INR',
): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const localeTag = toLocaleTag(localeCode ?? getLocale())
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function useCurrency() {
  const [locale, setLocaleState] = useState(getLocale())

  useEffect(() => subscribeLocale(setLocaleState), [])

  function formatCurrency(value: number | null | undefined, currency = 'INR'): string {
    return formatCurrencyByLocale(value, locale, currency)
  }

  return { locale, formatCurrency }
}
