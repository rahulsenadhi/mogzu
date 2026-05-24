// Phase 5 Feature 4 — push notification opt-in banner.

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { MOGZU_CTA_GRADIENT, MOGZU_PRODUCT_CARD } from '@/app/components/ui/mogzuGiftingStyles'
import { useAuth } from '@/lib/auth'
import {
  getOptInState,
  persistDecline,
  persistOptIn,
  requestPermission,
} from '@/lib/pushNotifications'

const SESSION_KEY = 'mogzu_push_prompt_seen'

export function PushOptInBanner() {
  const { user, profile } = useAuth()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user?.id || !profile) return
    if (profile.push_opt_in_at) return
    if (profile.push_declined_at) return
    if (sessionStorage.getItem(SESSION_KEY) === '1') return
    if (getOptInState() !== 'unknown') return
    const t = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(t)
  }, [user?.id, profile])

  const close = () => {
    setVisible(false)
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  const enable = async () => {
    if (!user?.id) return
    setBusy(true)
    const state = await requestPermission()
    if (state === 'granted') {
      let payload: PushSubscriptionJSON | null = null
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) {
            const existing = await reg.pushManager.getSubscription()
            payload = existing ? existing.toJSON() : null
          }
        }
      } catch {
        payload = null
      }
      if (!payload) {
        payload = {
          endpoint: null,
          expirationTime: null,
          keys: undefined,
        } as PushSubscriptionJSON
      }
      await persistOptIn(user.id, payload)
    } else if (state === 'denied') {
      await persistDecline(user.id)
    }
    setBusy(false)
    close()
  }

  const decline = async () => {
    if (!user?.id) return
    setBusy(true)
    await persistDecline(user.id)
    setBusy(false)
    close()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100%-2rem))]">
      <div className={`${MOGZU_PRODUCT_CARD} p-4 shadow-[0_18px_40px_rgba(37,99,235,0.22)]`}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Bell className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0e1e3f]">Stay in the loop</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Push notifications for approvals, booking confirmations and payout updates.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void enable()}
                className={`${MOGZU_CTA_GRADIENT} disabled:opacity-50`}
              >
                Enable notifications
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void decline()}
                className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm hover:border-[#93c5fd] disabled:opacity-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification prompt"
            onClick={close}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/80 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
