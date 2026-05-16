import type { LucideIcon } from 'lucide-react'

type CategoryPillIconProps = {
  icon: LucideIcon
  color: string
}

/** Colored outline icon for main category pills — no background shape. */
export const CategoryPillIcon = ({ icon: Icon, color }: CategoryPillIconProps) => (
  <Icon className="h-4 w-4 shrink-0" style={{ color }} strokeWidth={2.2} />
)
