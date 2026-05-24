import { useNavigate } from 'react-router'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_NAV_SCROLLER,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'

type FinanceAdminTab = 'reconciliation' | 'fx'

type AdminFinanceNavChipsProps = {
  active: FinanceAdminTab
}

export function AdminFinanceNavChips({ active }: AdminFinanceNavChipsProps) {
  const navigate = useNavigate()

  const tabs: { id: FinanceAdminTab; label: string; path: string }[] = [
    { id: 'reconciliation', label: 'Reconciliation', path: '/admin/finance/reconciliation' },
    { id: 'fx', label: 'FX rates', path: '/admin/finance/fx' },
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
