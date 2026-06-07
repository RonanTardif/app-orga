import { describe, it, expect, vi } from 'vitest'

vi.mock('../mariageKnowledge', () => ({
  getMariageKnowledge: vi.fn(() =>
    '--- programme.md ---\n\nCérémonie à 14h00\n\n--- prestataires.md ---\n\nTrépas traiteur : 06 12 34 56 78'
  ),
}))

import { getMariageKnowledge } from '../mariageKnowledge'

describe('getMariageKnowledge', () => {
  it('retourne le contenu concaténé des fichiers', () => {
    const result = getMariageKnowledge()
    expect(result).toContain('programme.md')
    expect(result).toContain('Cérémonie à 14h00')
    expect(result).toContain('prestataires.md')
  })

  it('inclut les séparateurs entre fichiers', () => {
    const result = getMariageKnowledge()
    expect(result).toContain('---')
  })
})
