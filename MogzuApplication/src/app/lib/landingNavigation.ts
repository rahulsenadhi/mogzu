/** Public marketing destinations — avoid corp-gated portal routes from the landing page. */

export type LandingExploreTab = 'venues' | 'gifting' | 'experiences'

const SERVICE_BY_TAB: Record<LandingExploreTab, string> = {
  venues: 'end-to-end-event',
  gifting: 'corporate-gifting',
  experiences: 'karaoke',
}

export function landingEnquiryPath(tab: LandingExploreTab, onHome = true): string {
  const service = SERVICE_BY_TAB[tab]
  const base = onHome ? '/' : '/services'
  return `${base}?service=${service}#service-enquiry`
}

export const LANDING_LINKS = {
  services: '/services',
  servicesEnquiry: '/#service-enquiry',
  gievMarketing: '/giev',
  dspaceEnquiry: '/services?service=event-rentals#service-enquiry',
  heyGenieEnquiry: '/services?service=karaoke#service-enquiry',
  giftingEnquiry: '/services?service=corporate-gifting#service-enquiry',
  eventsEnquiry: '/services?service=end-to-end-event#service-enquiry',
  signupCorporate: '/signup/corporate',
  signupVendor: '/signup/vendor',
  login: '/login',
} as const

export function isValidServiceId(id: string | null, validIds: readonly string[]): id is string {
  return !!id && validIds.includes(id)
}
