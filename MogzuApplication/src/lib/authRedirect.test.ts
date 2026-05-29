import { describe, it, expect } from 'vitest'
import {
  getCorporateLoginRedirectPath,
  getPostLoginPath,
  sanitizeCorporateReturnPath,
} from './authRedirect'

describe('getPostLoginPath', () => {
  it('routes Mogzu admin roles to /admin', () => {
    expect(getPostLoginPath('mogzu_admin')).toBe('/admin')
    expect(getPostLoginPath('account_manager')).toBe('/admin')
    expect(getPostLoginPath('support')).toBe('/admin')
    expect(getPostLoginPath('sales_agent')).toBe('/admin')
  })

  it('routes field_agent, vendor, partner to their own dashboards', () => {
    expect(getPostLoginPath('field_agent')).toBe('/agent/dashboard')
    expect(getPostLoginPath('vendor')).toBe('/vendor/dashboard')
    expect(getPostLoginPath('partner')).toBe('/partner/dashboard')
  })

  it('defaults corporate roles and null to /dashboard', () => {
    expect(getPostLoginPath('l1_employee')).toBe('/dashboard')
    expect(getPostLoginPath('l2_manager')).toBe('/dashboard')
    expect(getPostLoginPath('l3_admin')).toBe('/dashboard')
    expect(getPostLoginPath(null)).toBe('/dashboard')
  })
})

describe('getCorporateLoginRedirectPath', () => {
  it('sends corporate primary roles to dashboard even when fallback is admin', () => {
    expect(
      getCorporateLoginRedirectPath(
        { role: 'l3_admin', corporate_id: 'corp-1' } as never,
        'mogzu_admin',
      ),
    ).toBe('/dashboard')
  })

  it('still sends true admin primary roles to /admin', () => {
    expect(getCorporateLoginRedirectPath({ role: 'mogzu_admin' } as never, null)).toBe('/admin')
  })
})

describe('sanitizeCorporateReturnPath', () => {
  it('blocks admin and vendor return paths', () => {
    expect(sanitizeCorporateReturnPath('/admin')).toBeUndefined()
    expect(sanitizeCorporateReturnPath('/vendor/dashboard')).toBeUndefined()
    expect(sanitizeCorporateReturnPath('/events')).toBe('/events')
  })
})
