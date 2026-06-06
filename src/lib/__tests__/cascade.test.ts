import { describe, it, expect } from 'vitest'
import { addMinutes, computeCascade } from '../utils'
import type { Tache } from '@/types'

function makeTache(overrides: Partial<Tache> = {}): Tache {
  return {
    id: 'x',
    titre: 'Test',
    heure_debut: null,
    heure_fin: null,
    zone: null,
    assignes: [],
    statut: 'À faire',
    note: null,
    jour: 'samedi',
    parente: null,
    ...overrides,
  }
}

describe('addMinutes', () => {
  it('ajoute 30 min à 14:30 → 15:00', () => {
    expect(addMinutes('14:30', 30)).toBe('15:00')
  })

  it('gère le passage minuit : 23:45 + 30 → 00:15', () => {
    expect(addMinutes('23:45', 30)).toBe('00:15')
  })

  it('retourne null si heure null', () => {
    expect(addMinutes(null, 30)).toBeNull()
  })

  it('gère un décalage négatif : 10:00 - 45 → 09:15', () => {
    expect(addMinutes('10:00', -45)).toBe('09:15')
  })

  it('gère 0 min', () => {
    expect(addMinutes('08:00', 0)).toBe('08:00')
  })
})

describe('computeCascade', () => {
  const tasks: Tache[] = [
    makeTache({ id: 'parent1', titre: 'Fleuriste chapelle', parente: null }),
    makeTache({ id: 'dep1', titre: 'Décoration chapelle', parente: 'parent1', heure_debut: '16:00', heure_fin: '17:30' }),
    makeTache({ id: 'dep2', titre: 'Vérification glaçons', parente: 'parent1', heure_debut: '16:00', heure_fin: null }),
    makeTache({ id: 'other', titre: 'Autre tâche', parente: 'parent2' }),
  ]

  it('retourne les bonnes previews avec décalage correct', () => {
    const previews = computeCascade('parent1', 30, tasks)
    expect(previews).toHaveLength(2)

    const dep1 = previews.find((p) => p.tache.id === 'dep1')!
    expect(dep1.ancienDebut).toBe('16:00')
    expect(dep1.ancienFin).toBe('17:30')
    expect(dep1.nouveauDebut).toBe('16:30')
    expect(dep1.nouveauFin).toBe('18:00')

    const dep2 = previews.find((p) => p.tache.id === 'dep2')!
    expect(dep2.nouveauFin).toBeNull()
  })

  it('retourne [] si aucune tâche dépendante', () => {
    expect(computeCascade('inexistant', 30, tasks)).toHaveLength(0)
  })

  it("n'inclut pas les tâches d'un autre parent", () => {
    const previews = computeCascade('parent1', 30, tasks)
    expect(previews.every((p) => p.tache.id !== 'other')).toBe(true)
  })
})
