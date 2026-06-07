import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../systemPrompt'
import { MEMBRES, ZONES } from '../constants'

const PROMPT = buildSystemPrompt([])

describe('systemPrompt', () => {
  it('contient les 17 membres', () => {
    expect(MEMBRES).toHaveLength(17)
    for (const m of MEMBRES) {
      expect(PROMPT).toContain(m)
    }
  })

  it('contient les 8 zones', () => {
    expect(ZONES).toHaveLength(8)
    for (const z of ZONES) {
      expect(PROMPT).toContain(z)
    }
  })

  it('mentionne le mariage de Ronan et Lorie', () => {
    expect(PROMPT).toContain('Ronan')
    expect(PROMPT).toContain('Lorie')
    expect(PROMPT).toContain('mariage')
  })

  it('contient les regles de non-invention de donnees', () => {
    expect(PROMPT).toContain('inventer')
  })

  it('inclut les titres des tâches dans le prompt', () => {
    const prompt = buildSystemPrompt([
      { id: 'abc123', titre: 'Lancer du bouquet', statut: 'À faire', assignes: ['Léa'], zone: 'Jardin', heure_debut: '17:00', heure_fin: '17:15', note: null, jour: 'samedi', parente: null },
    ])
    expect(prompt).toContain('abc123')
    expect(prompt).toContain('Lancer du bouquet')
  })
})
