import type { UserProfile } from '@/lib/database.types'

export type AnnouncementTarget = {
  targetType: 'all' | 'team' | 'members'
  selectedTeam: string
  selectedMembers: string[]
}

export function resolveCorporateAnnouncementRecipients(
  profiles: UserProfile[],
  publisherId: string | undefined,
  target: AnnouncementTarget,
): string[] {
  const eligible = profiles.filter((p) => p.status === 'active' || p.status === 'invited')

  const excludeSelf = (ids: string[]) =>
    publisherId ? ids.filter((id) => id !== publisherId) : ids

  if (target.targetType === 'all') {
    return excludeSelf(eligible.map((p) => p.id))
  }

  if (target.targetType === 'members') {
    const allowed = new Set(eligible.map((p) => p.id))
    return excludeSelf(target.selectedMembers.filter((id) => allowed.has(id)))
  }

  if (target.targetType === 'team') {
    const team = target.selectedTeam.trim()
    return excludeSelf(
      eligible.filter((p) => (p.department ?? '').trim() === team).map((p) => p.id),
    )
  }

  return []
}

export function announcementAudienceLabel(target: AnnouncementTarget): string {
  if (target.targetType === 'all') return 'All company'
  if (target.targetType === 'team') return target.selectedTeam
  return `${target.selectedMembers.length} selected member(s)`
}
