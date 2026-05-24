// Phase 5 Feature 4 — mobile install prompt.

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { MOGZU_CTA_GRADIENT, MOGZU_PRODUCT_CARD } from '@/app/components/ui/mogzuGiftingStyles'

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

function InstallShell({
  icon,
  title,
  body,
  children,
  onClose,
}: {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(420px,calc(100%-2rem))] -translate-x-1/2">
      <div className={`${MOGZU_PRODUCT_CARD} p-4 shadow-[0_18px_40px_rgba(37,99,235,0.22)]`}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0e1e3f]">{title}</p>
            <div className="mt-0.5 text-xs text-slate-600">{body}</div>
            <div className="mt-3 flex flex-wrap gap-2">{children}</div>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/80 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
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
      <InstallShell
        icon={<Download className="size-5" />}
        title="Install Mogzu"
        body="Faster access, push notifications, and offline workspace."
        onClose={close}
      >
        <button type="button" onClick={() => void install()} className={MOGZU_CTA_GRADIENT}>
          Install app
        </button>
        <button
          type="button"
          onClick={close}
          className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm hover:border-[#93c5fd]"
        >
          Not now
        </button>
      </InstallShell>
    )
  }

  if (showIosHint) {
    return (
      <InstallShell
        icon={<Smartphone className="size-5" />}
        title="Add Mogzu to your Home Screen"
        body={
          <>
            Tap Share, then <span className="font-semibold">Add to Home Screen</span> to install.
          </>
        }
        onClose={close}
      >
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Open App Store
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm hover:border-[#93c5fd]"
        >
          Open Play Store
        </a>
      </InstallShell>
    )
  }

  return null
}
