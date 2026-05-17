import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import HeyGenieAssistant from '@/app/components/HeyGenieAssistant'

const ELIGIBLE_ROLES = new Set(['l1_employee', 'l2_manager', 'l3_admin'])

export function HeyGenieLauncher() {
  const { role, profile } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setEnabled(false)
    if (!role || !ELIGIBLE_ROLES.has(role) || !profile?.corporate_id) return
    db.heyGenie
      .getConfig(profile.corporate_id)
      .then(({ data }) => {
        if (cancelled) return
        setEnabled(Boolean(data?.enabled))
      })
      .catch((err) => {
        console.error('[HeyGenie] config fetch failed', err)
      })
    return () => {
      cancelled = true
    }
  }, [role, profile?.corporate_id])

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl"
        aria-label="Open Hey Genie assistant"
      >
        <Sparkles className="size-4" />
        Hey Genie
      </button>
      <HeyGenieAssistant open={open} onClose={() => setOpen(false)} />
    </>
  )
}
