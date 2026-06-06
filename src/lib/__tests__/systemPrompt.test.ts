import { describe, it, expect } from 'vitest'
import { SYSTEM_PROMPT } from '../systemPrompt'
import { MEMBRES, ZONES } from '../constants'

describe('systemPrompt', () => {
  it('contient les 17 membres', () => {
    expect(MEMBRES).toHaveLength(17)
    for (const m of MEMBRES) {
      expect(SYSTEM_PROMPT).toContain(m)
    }
  })

  it('contient les 8 zones', () => {
    expect(ZONES).toHaveLength(8)
    for (const z of ZONES) {
      expect(SYSTEM_PROMPT).toContain(z)
    }
  })

  it('mentionne le mariage de Ronan et Lorie', () => {
    expect(SYSTEM_PROMPT).toContain('Ronan')
    expect(SYSTEM_PROMPT).toContain('Lorie')
    expect(SYSTEM_PROMPT).toContain('mariage')
  })

  it('contient les regles de non-invention de donnees', () => {
    expect(SYSTEM_PROMPT).toContain('inventer')
  })
})
