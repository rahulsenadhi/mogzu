const DEFAULT_MESSAGE = "Hi Mogzu! I'd like help planning an event or gifting campaign."

export function getMogzuWhatsAppNumber(): string | null {
  const raw = import.meta.env.VITE_MOGZU_WHATSAPP?.trim()
  if (!raw) return null
  return raw.replace(/\D/g, '')
}

export function getMogzuWhatsAppUrl(message = DEFAULT_MESSAGE): string | null {
  const number = getMogzuWhatsAppNumber()
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function scrollToServiceEnquiry(behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById('service-enquiry')
  if (el) {
    el.scrollIntoView({ behavior, block: 'start' })
    return true
  }
  return false
}
