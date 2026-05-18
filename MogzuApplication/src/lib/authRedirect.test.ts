import { describe, it, expect } from 'vitest'
import { getPostLoginPath } from './authRedirect'

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
