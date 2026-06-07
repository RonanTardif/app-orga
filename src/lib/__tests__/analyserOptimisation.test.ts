import { describe, it, expect, vi } from 'vitest'

vi.mock('../mariageKnowledge', () => ({ getMariageKnowledge: vi.fn(() => '') }))

import { executeTool } from '../toolExecutor'
import type { Tache } from '@/types'

function makeTache(overrides: Partial<Tache> & { id: string; titre: string; assignes: string[] }): Tache {
  return {
    heure_debut: null,
    heure_fin: null,
    zone: null,
    statut: 'À faire',
    note: null,
    jour: 'samedi',
    parente: null,
    ...overrides,
  }
}

describe('analyser_optimisation', () => {
  it('retourne un rapport non vide même sur liste vide', () => {
    const rapport = executeTool('analyser_optimisation', {}, [])
    expect(rapport).toContain("Rapport d'optimisation")
  })

  it('détecte un membre surchargé si > 5 tâches actives', () => {
    const taches: Tache[] = Array.from({ length: 6 }, (_, i) =>
      makeTache({ id: `t${i}`, titre: `Tâche ${i}`, assignes: ['Marc'], statut: 'À faire' })
    )
    const rapport = executeTool('analyser_optimisation', {}, taches)
    expect(rapport).toContain('SURCHARGÉ')
    expect(rapport).toContain('Marc')
  })

  it('détecte un membre sans tâche comme sous-utilisé', () => {
    const taches: Tache[] = [
      makeTache({ id: 't1', titre: 'Tâche', assignes: ['Sophie'], statut: 'À faire' }),
    ]
    const rapport = executeTool('analyser_optimisation', {}, taches)
    expect(rapport).toContain('Sophie')
  })

  it('détecte une tâche trop courte (< 15 min)', () => {
    const taches: Tache[] = [
      makeTache({
        id: 't1', titre: 'Brief rapide', assignes: ['Ronan'],
        heure_debut: '09:00', heure_fin: '09:10', statut: 'À faire',
      }),
    ]
    const rapport = executeTool('analyser_optimisation', {}, taches)
    expect(rapport).toContain('Brief rapide')
    expect(rapport).toContain('10 min')
  })

  it('détecte une tâche trop longue (> 4 h)', () => {
    const taches: Tache[] = [
      makeTache({
        id: 't1', titre: 'Marathon coordination', assignes: ['Lorie'],
        heure_debut: '08:00', heure_fin: '14:00', statut: 'En cours',
      }),
    ]
    const rapport = executeTool('analyser_optimisation', {}, taches)
    expect(rapport).toContain('Marathon coordination')
  })

  it('ignore les tâches Fait dans le calcul de charge', () => {
    const taches: Tache[] = Array.from({ length: 6 }, (_, i) =>
      makeTache({ id: `t${i}`, titre: `Tâche ${i}`, assignes: ['Marc'], statut: 'Fait' })
    )
    const rapport = executeTool('analyser_optimisation', {}, taches)
    expect(rapport).not.toContain('SURCHARGÉ')
  })
})
