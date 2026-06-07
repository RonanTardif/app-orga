import { describe, it, expect, vi } from 'vitest'

vi.mock('../mariageKnowledge', () => ({ getMariageKnowledge: vi.fn(() => '') }))

import { executeTool } from '../toolExecutor'
import type { Tache, Statut, KellyMemoryNote } from '@/types'

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
  }
}

describe('lecture_disponibilite', () => {
  it('retourne les bons comptes par membre', () => {
    const tasks: Tache[] = [
      makeTache({ statut: 'À faire', assignes: ['Ronan'] }),
      makeTache({ statut: 'En cours', assignes: ['Ronan'] }),
      makeTache({ statut: 'Fait', assignes: ['Ronan'] }),
      makeTache({ statut: 'À faire', assignes: ['Lorie'] }),
    ]
    const result = executeTool('lecture_disponibilite', {}, tasks)
    expect(result).toContain('Ronan')
    expect(result).toContain('2 active(s)')
    expect(result).toContain('Lorie')
    expect(result).toContain('1 active(s)')
  })

  it('affiche les membres sans taches comme libres', () => {
    const tasks: Tache[] = []
    const result = executeTool('lecture_disponibilite', {}, tasks)
    expect(result).toContain('✅ libre')
    expect(result).toContain('Ronan')
  })

  it('ne compte pas les taches Fait', () => {
    const tasks: Tache[] = [
      makeTache({ statut: 'Fait', assignes: ['Guillaume'] }),
    ]
    const result = executeTool('lecture_disponibilite', {}, tasks)
    expect(result).toMatch(/Guillaume:.*✅ libre/)
  })
})

describe('lecture_taches', () => {
  const tasks: Tache[] = [
    makeTache({ id: '1', titre: 'Décoration salle', zone: 'Chapelle', statut: 'À faire', assignes: ['Léa'] }),
    makeTache({ id: '2', titre: 'Accueil invités', zone: 'Château', statut: 'En cours', assignes: ['Tristan', 'Pierre'] }),
    makeTache({ id: '3', titre: 'Rangement tables', zone: 'Château', statut: 'Fait', assignes: ['Guillaume'] }),
  ]

  it('filtre par assigné', () => {
    const result = executeTool('lecture_taches', { filtre_assignes: 'Léa' }, tasks)
    expect(result).toContain('Décoration salle')
    expect(result).not.toContain('Accueil invités')
  })

  it('filtre par zone', () => {
    const result = executeTool('lecture_taches', { filtre_zone: 'Château' }, tasks)
    expect(result).toContain('Accueil invités')
    expect(result).toContain('Rangement tables')
    expect(result).not.toContain('Décoration salle')
  })

  it('filtre par statut', () => {
    const result = executeTool('lecture_taches', { filtre_statut: 'En cours' }, tasks)
    expect(result).toContain('Accueil invités')
    expect(result).not.toContain('Décoration salle')
  })

  it('filtre par mot-cle dans le titre', () => {
    const result = executeTool('lecture_taches', { filtre_titre: 'décoration' }, tasks)
    expect(result).toContain('Décoration salle')
    expect(result).not.toContain('Accueil invités')
  })

  it('retourne un message quand aucune tache trouvee', () => {
    const result = executeTool('lecture_taches', { filtre_assignes: 'Inconnu' }, tasks)
    expect(result).toContain('Aucune tâche trouvée')
  })

  it('retourne un message pour un outil inconnu', () => {
    const result = executeTool('outil_inexistant', {}, tasks)
    expect(result).toContain('Outil inconnu')
  })
})

describe('consulter_memoire', () => {
  it('retourne message vide si aucune note', () => {
    const result = executeTool('consulter_memoire', {}, [], [])
    expect(result).toContain('rien mémorisé')
  })

  it('liste les notes mémorisées', () => {
    const notes: KellyMemoryNote[] = [
      { id: '1', contenu: "Les verres à shots sont dans l'orangerie" },
      { id: '2', contenu: 'Le traiteur arrive à 11h' },
    ]
    const result = executeTool('consulter_memoire', {}, [], notes)
    expect(result).toContain('verres à shots')
    expect(result).toContain('traiteur')
    expect(result).toContain('2 info(s)')
  })

  it('fonctionne sans 4e paramètre (compat ascendante)', () => {
    const result = executeTool('consulter_memoire', {}, [])
    expect(result).toContain('rien mémorisé')
  })
})
