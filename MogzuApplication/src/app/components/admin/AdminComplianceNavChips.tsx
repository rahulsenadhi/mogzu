import { useNavigate } from 'react-router'
import {
  MOGZU_CHIP_ACTIVE_GRADIENT,
  MOGZU_NAV_SCROLLER,
  moduleNavChipClass,
} from '@/app/components/ui/mogzuGiftingStyles'

type ComplianceTab = 'access-review' | 'soc2'

type AdminComplianceNavChipsProps = {
  active: ComplianceTab
}

export function AdminComplianceNavChips({ active }: AdminComplianceNavChipsProps) {
  const navigate = useNavigate()

  const tabs: { id: ComplianceTab; label: string; path: string }[] = [
    { id: 'access-review', label: 'Access reviews', path: '/admin/compliance/access-review' },
    { id: 'soc2', label: 'SOC2 evidence', path: '/admin/compliance/soc2' },
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
