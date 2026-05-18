// Phase 3 Feature 7 — currency + locale service.

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export type Currency = {
  code: string
  symbol: string
  decimal_places: number
  fx_rate: number // 1 unit of code = fx_rate INR
  is_active: boolean
  fx_updated_at: string
  display_order: number
}

let currencyCache: Currency[] | null = null

export async function listCurrencies(force = false): Promise<Currency[]> {
  if (currencyCache && !force) return currencyCache
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) return []
  currencyCache = (data ?? []) as Currency[]
  return currencyCache
}

// Convert amount in base (INR) to target currency.
export function convertFromInr(amountInInr: number, target: Currency): number {
  if (target.code === 'INR' || !target.fx_rate) return amountInInr
  return amountInInr / target.fx_rate
}

export function formatPrice(amountInInr: number, target: Currency): string {
  const converted = convertFromInr(amountInInr, target)
  const fmt = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: target.decimal_places,
    maximumFractionDigits: target.decimal_places,
  })
  return `${target.symbol}${fmt.format(converted)}`
}

export async function setUserLocale(
  userId: string,
  locale: string,
  preferredCurrency: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ locale, preferred_currency: preferredCurrency })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

const INR_FALLBACK: Currency = {
  code: 'INR',
  symbol: '₹',
  decimal_places: 2,
  fx_rate: 1,
  is_active: true,
  fx_updated_at: new Date(0).toISOString(),
  display_order: 1,
}

// React hook returning a bound formatter that respects the signed-in
// user's preferred_currency. Components call format(amountInInr) and
// get the right symbol + conversion without each one re-fetching the
// currency table.
export function useCurrency(): {
  currency: Currency
  currencies: Currency[]
  format: (amountInInr: number) => string
  loading: boolean
} {
  const { profile } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listCurrencies()
      .then((list) => {
        if (!cancelled) {
          setCurrencies(list)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const code = profile?.preferred_currency ?? 'INR'
  const currency =
    currencies.find((c) => c.code === code) ??
    currencies.find((c) => c.code === 'INR') ??
    INR_FALLBACK

  return {
    currency,
    currencies,
    loading,
    format: (amountInInr: number) => formatPrice(amountInInr, currency),
  }
}
