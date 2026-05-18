// Phase 3 Feature 7 — locale + currency picker card.
//
// Drop-in for MyProfilePage / CompanySettingsPage. Reads the
// signed-in profile, writes preferred_currency + locale through the
// currencies service.

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { listCurrencies, setUserLocale, type Currency } from '@/lib/currencies'
import { setLocale as setI18nLocale, t } from '@/lib/i18n'

const LOCALES: { value: string; label: string }[] = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-SG', label: 'English (Singapore)' },
  { value: 'en-AE', label: 'English (UAE)' },
]

export default function LocalePickerCard() {
  const { profile } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [locale, setLocale] = useState(profile?.locale ?? 'en-IN')
  const [currency, setCurrency] = useState(profile?.preferred_currency ?? 'INR')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listCurrencies().then(setCurrencies)
  }, [])

  useEffect(() => {
    if (profile) {
      setLocale(profile.locale ?? 'en-IN')
      setCurrency(profile.preferred_currency ?? 'INR')
    }
  }, [profile])

  if (!profile) return null

  const onSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    const { error: err } = await setUserLocale(profile.id, locale, currency)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    setI18nLocale(locale)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{t('profile.lang_currency_title')}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {t('profile.lang_currency_hint')}
      </p>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t('profile.locale_label')}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t('profile.display_currency_label')}</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t('profile.save_preferences')}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Check className="size-4" /> {t('profile.saved')}
          </span>
        )}
      </div>
    </section>
  )
}
