import { describe, it, expect } from 'vitest'
import { AI_AGENT_CHANNELS } from './aiAgents'

describe('AI_AGENT_CHANNELS', () => {
  it('matches the DB CHECK constraint values exactly', () => {
    const values = AI_AGENT_CHANNELS.map((c) => c.value).sort()
    expect(values).toEqual(['email', 'telegram', 'web_chat', 'whatsapp'].sort())
  })

  it('every channel has a display label', () => {
    for (const c of AI_AGENT_CHANNELS) {
      expect(c.label.length).toBeGreaterThan(0)
    }
  })
})
