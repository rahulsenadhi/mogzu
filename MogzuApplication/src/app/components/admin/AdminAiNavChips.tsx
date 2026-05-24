import { useNavigate } from 'react-router'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_NAV_SCROLLER,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'

type AiAdminTab = 'agents' | 'conversations' | 'policy'

type AdminAiNavChipsProps = {
  active: AiAdminTab
}

export function AdminAiNavChips({ active }: AdminAiNavChipsProps) {
  const navigate = useNavigate()

  const tabs: { id: AiAdminTab; label: string; path: string }[] = [
    { id: 'agents', label: 'AI agents', path: '/admin/ai-agents' },
    { id: 'conversations', label: 'Conversations', path: '/admin/ai-conversations' },
    { id: 'policy', label: 'Spend policy', path: '/admin/ai-policy' },
  ]

  return (
    <div className={MOGZU_NAV_SCROLLER}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={moduleNavChipClass(isActive)}
            style={isActive ? MOGZU_CHIP_ACTIVE_GRADIENT : undefined}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
