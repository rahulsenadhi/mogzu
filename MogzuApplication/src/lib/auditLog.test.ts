import { describe, it, expect } from 'vitest'
import { toCsv, type AuditEvent } from './auditLog'

const row = (over: Partial<AuditEvent> = {}): AuditEvent => ({
  id: 'id-1',
  actor_id: 'user-1',
  action: 'login',
  resource_kind: null,
  resource_id: null,
  metadata: null,
  ip_address: null,
  user_agent: null,
  at: '2026-05-18T10:00:00.000Z',
  source: 'auth',
  ...over,
})

describe('toCsv', () => {
  it('emits the canonical header row', () => {
    const out = toCsv([])
    expect(out).toBe('at,actor_id,action,resource_kind,resource_id,source,ip_address,user_agent,metadata')
  })

  it('renders simple rows without quoting', () => {
    const out = toCsv([row()])
    const lines = out.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('2026-05-18T10:00:00.000Z,user-1,login,,,auth,,,')
  })

  it('quotes values containing commas, quotes, or newlines (RFC 4180)', () => {
    const out = toCsv([
      row({ user_agent: 'Mozilla, v5', action: 'say "hi"', resource_kind: 'a\nb' }),
    ])
    const line = out.split('\n').slice(1).join('\n')
    expect(line).toContain('"Mozilla, v5"')
    expect(line).toContain('"say ""hi"""')
    expect(line).toContain('"a\nb"')
  })

  it('serialises metadata objects as JSON', () => {
    const out = toCsv([row({ metadata: { ok: true, n: 42 } })])
    expect(out).toContain('"{""ok"":true,""n"":42}"')
  })

  it('renders null fields as empty string', () => {
    const out = toCsv([row({ actor_id: null })])
    expect(out.split('\n')[1].startsWith('2026-05-18T10:00:00.000Z,,')).toBe(true)
  })
})
