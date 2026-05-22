// Phase 5 Feature 4 — mobile install prompt.
//
// Captures the beforeinstallprompt event so we can display a custom
// "Install Mogzu" button. Falls back to an App Store / Play Store
// deep link placeholder when the browser doesn't fire the event
// (Safari iOS). Dismissed state persists in localStorage so we don't
// nag every page load.

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'mogzu_pwa_install_dismissed'
const APP_STORE_URL = 'https://apps.apple.com/app/mogzu'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.mogzu'

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function isAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1',
  )

  useEffect(() => {
    if (dismissed || isAlreadyInstalled()) return

    const onBefore = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBefore as EventListener)

    if (isIOS()) {
      const t = setTimeout(() => setShowIosHint(true), 2000)
      return () => {
        clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', onBefore as EventListener)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore as EventListener)
    }
  }, [dismissed])

  const close = () => {
    setDismissed(true)
    setDeferred(null)
    setShowIosHint(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') close()
  }

  if (dismissed) return null

  if (deferred) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2563eb]">
            <Download className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Install Mogzu</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Faster access, push notifications, and offline workspace.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void install()}
                className="rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Install app
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={close}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  if (showIosHint) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2563eb]">
            <Smartphone className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Add Mogzu to your Home Screen</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Tap Share, then <span className="font-semibold">Add to Home Screen</span> to install.
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Open App Store
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Play Store
              </a>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={close}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
