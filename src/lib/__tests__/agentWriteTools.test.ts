import { describe, it, expect } from 'vitest'
import { isWriteTool, WRITE_TOOLS, READ_TOOLS } from '../agentTools'

describe('isWriteTool', () => {
  it('identifie les write tools', () => {
    for (const name of WRITE_TOOLS) {
      expect(isWriteTool(name)).toBe(true)
    }
  })

  it('rejette les read tools', () => {
    for (const name of READ_TOOLS) {
      expect(isWriteTool(name)).toBe(false)
    }
  })

  it('rejette un nom inconnu', () => {
    expect(isWriteTool('outil_inexistant')).toBe(false)
  })
})
