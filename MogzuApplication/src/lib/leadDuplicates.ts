import type { PublicLead } from '@/lib/publicLeads'

export function normalizeLeadPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)
  return digits
}

export function normalizeLeadEmail(email: string | null | undefined): string {
  if (!email) return ''
  const lower = email.trim().toLowerCase()
  if (lower.endsWith('@intake.mogzu.local')) return ''
  return lower
}

export function findDuplicateLeads(
  leads: PublicLead[],
  phone: string | null | undefined,
  email: string | null | undefined,
  excludeId?: string,
): PublicLead[] {
  const phoneKey = normalizeLeadPhone(phone)
  const emailKey = normalizeLeadEmail(email)
  if (!phoneKey && !emailKey) return []

  return leads.filter((lead) => {
    if (excludeId && lead.id === excludeId) return false
    const matchPhone =
      phoneKey.length >= 10 &&
      normalizeLeadPhone(lead.client_phone) === phoneKey
    const matchEmail =
      emailKey.length > 0 && normalizeLeadEmail(lead.client_email) === emailKey
    return matchPhone || matchEmail
  })
}
