// Plan Batch 10 — locale picker.
// Compact dropdown sitting in SharedHeader. Reads + writes via the i18n
// module which persists to localStorage and broadcasts to subscribers.

import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'
import { SUPPORTED_LOCALES, getLocale, setLocale, subscribeLocale } from '@/lib/i18n'

export function LocalePicker() {
  const [locale, setLocaleState] = useState<string>(getLocale())

  useEffect(() => subscribeLocale(setLocaleState), [])

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value)
    // The current i18n implementation reads the bundle at call time, so a
    // soft reload makes already-rendered strings pick up the new locale
    // without rewiring every component to subscribe.
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <label className="hidden md:inline-flex items-center gap-1 text-xs text-slate-600">
      <Globe className="size-3.5" />
      <span className="sr-only">Locale</span>
      <select
        value={locale}
        onChange={onChange}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-[#2563EB] focus:outline-none"
        aria-label="Locale"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
