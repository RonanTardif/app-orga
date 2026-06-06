import { describe, it, expect } from 'vitest'
import { sortTachesByHeure, nextStatut, prevStatut, computeDisponibilite } from '../utils'
import type { Tache, Statut } from '@/types'

function makeTache(overrides: Partial<Tache> = {}): Tache {
  return {
    id: 'x',
    titre: 'Test',
    heure_debut: null,
    heure_fin: null,
    zone: null,
    assignes: [],
    statut: 'À faire' as Statut,
    note: null,
    jour: 'samedi',
    parente: null,
    ...overrides,
  } as Tache
}

describe('sortTachesByHeure', () => {
  it('trie par heure_debut croissante', () => {
    const result = sortTachesByHeure([
      makeTache({ id: 'b', heure_debut: '14:00' }),
      makeTache({ id: 'a', heure_debut: '09:00' }),
      makeTache({ id: 'c', heure_debut: '11:30' }),
    ])
    expect(result.map((t) => t.id)).toEqual(['a', 'c', 'b'])
  })

  it('place les taches sans horaire en fin de liste', () => {
    const result = sortTachesByHeure([
      makeTache({ id: 'no-time', heure_debut: null }),
      makeTache({ id: 'timed', heure_debut: '10:00' }),
    ])
    expect(result[0].id).toBe('timed')
    expect(result[1].id).toBe('no-time')
  })

  it('plusieurs taches sans horaire restent en ordre stable', () => {
    const result = sortTachesByHeure([
      makeTache({ id: 'a', heure_debut: null }),
      makeTache({ id: 'b', heure_debut: null }),
    ])
    expect(result.map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('ne mute pas le tableau original', () => {
    const original = [
      makeTache({ id: 'b', heure_debut: '14:00' }),
      makeTache({ id: 'a', heure_debut: '09:00' }),
    ]
    sortTachesByHeure(original)
    expect(original[0].id).toBe('b')
  })
})

const A_FAIRE = 'À faire' as Statut
const EN_COURS = 'En cours' as Statut
const FAIT = 'Fait' as Statut

describe('nextStatut', () => {
  it('A faire vers En cours', () => expect(nextStatut(A_FAIRE)).toBe(EN_COURS))
  it('En cours vers Fait', () => expect(nextStatut(EN_COURS)).toBe(FAIT))
  it('Fait reste Fait', () => expect(nextStatut(FAIT)).toBe(FAIT))
})

describe('prevStatut', () => {
  it('Fait vers En cours', () => expect(prevStatut(FAIT)).toBe(EN_COURS))
  it('En cours vers A faire', () => expect(prevStatut(EN_COURS)).toBe(A_FAIRE))
  it('A faire reste A faire', () => expect(prevStatut(A_FAIRE)).toBe(A_FAIRE))
})

describe('computeDisponibilite', () => {
  it('retourne tous les 17 membres à zéro si aucune tache', () => {
    const dispo = computeDisponibilite([])
    expect(Object.keys(dispo)).toHaveLength(17)
    for (const val of Object.values(dispo)) {
      expect(val).toEqual({ aFaire: 0, enCours: 0 })
    }
  })

  it('compte les taches A faire et En cours par membre', () => {
    const tasks: Tache[] = [
      makeTache({ statut: A_FAIRE, assignes: ['Ronan'] }),
      makeTache({ statut: EN_COURS, assignes: ['Ronan'] }),
      makeTache({ statut: FAIT, assignes: ['Ronan'] }),
      makeTache({ statut: A_FAIRE, assignes: ['Lorie'] }),
    ]
    const dispo = computeDisponibilite(tasks)
    expect(dispo['Ronan']).toEqual({ aFaire: 1, enCours: 1 })
    expect(dispo['Lorie']).toEqual({ aFaire: 1, enCours: 0 })
  })

  it('gere les taches assignees a plusieurs membres', () => {
    const tasks: Tache[] = [
      makeTache({ statut: A_FAIRE, assignes: ['Ronan', 'Lorie'] }),
    ]
    const dispo = computeDisponibilite(tasks)
    expect(dispo['Ronan']?.aFaire).toBe(1)
    expect(dispo['Lorie']?.aFaire).toBe(1)
  })

  it('ne compte pas les taches Fait dans aFaire ou enCours', () => {
    const tasks: Tache[] = [
      makeTache({ statut: FAIT, assignes: ['Ronan'] }),
    ]
    const dispo = computeDisponibilite(tasks)
    expect(dispo['Ronan']).toEqual({ aFaire: 0, enCours: 0 })
  })
})
