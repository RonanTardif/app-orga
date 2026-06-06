import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock complet du module claude
vi.mock('../claude', () => ({
  callClaude: vi.fn(),
}))

// Mock firebase (toolExecutor en dépend)
vi.mock('@/lib/firebase', () => ({
  db: {},
}))

import { callClaude } from '../claude'
import { runAgent } from '../agent'
import type { Tache } from '@/types'

const callClaudeMock = vi.mocked(callClaude)

function makeTache(overrides: Partial<Tache> = {}): Tache {
  return {
    id: 't1',
    titre: 'Test tache',
    heure_debut: '10:00',
    heure_fin: '11:00',
    zone: 'Chapelle',
    assignes: ['Ronan'],
    statut: 'À faire',
    note: null,
    jour: 'samedi',
    parente: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('runAgent — réponse directe', () => {
  it('retourne type response quand end_turn', async () => {
    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Tout va bien.' }],
    } as any)

    const result = await runAgent('Test ?', [], [])
    expect(result.type).toBe('response')
    expect((result as any).content).toBe('Tout va bien.')
  })
})

describe('runAgent — write tool → PendingAction', () => {
  it('retourne pending pour modifier_statut', async () => {
    const tache = makeTache({ id: 'abc123', titre: 'Décoration salle' })

    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool_1',
          name: 'modifier_statut',
          input: { task_id: 'abc123', nouveau_statut: 'En cours' },
        },
      ],
    } as any)

    const result = await runAgent('Passe la deco en cours', [], [tache])
    expect(result.type).toBe('pending')
    const pending = result as Extract<typeof result, { type: 'pending' }>
    expect(pending.action.toolName).toBe('modifier_statut')
    expect(pending.action.summary).toContain('Décoration salle')
    expect(pending.action.summary).toContain('En cours')
  })

  it('retourne pending pour reassigner_tache', async () => {
    const tache = makeTache({ id: 't99', titre: 'Rangement' })

    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool_2',
          name: 'reassigner_tache',
          input: { task_id: 't99', nouveau_membre: 'Lorie' },
        },
      ],
    } as any)

    const result = await runAgent('Réassigne rangement à Lorie', [], [tache])
    expect(result.type).toBe('pending')
    const pending = result as Extract<typeof result, { type: 'pending' }>
    expect(pending.action.summary).toContain('Lorie')
  })
})

describe('runAgent — rescheduler_cascade', () => {
  it('retourne pending avec summary de cascade quand tâches dépendantes trouvées', async () => {
    const parente = makeTache({ id: 'p1', titre: 'Fleuriste chapelle', parente: null })
    const dep = makeTache({ id: 'd1', titre: 'Deco', parente: 'p1', heure_debut: '16:00', heure_fin: '17:00' })

    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool_3',
          name: 'rescheduler_cascade',
          input: { parente_titre: 'fleuriste', decalage_minutes: 30 },
        },
      ],
    } as any)

    const result = await runAgent('Repousse de 30 min', [], [parente, dep])
    expect(result.type).toBe('pending')
    const pending = result as Extract<typeof result, { type: 'pending' }>
    expect(pending.action.toolName).toBe('rescheduler_cascade')
    expect(pending.action.summary).toContain('Deco')
    expect(pending.action.toolInput).toHaveProperty('previews')
  })

  it('retourne response si aucune tâche dépendante', async () => {
    const parente = makeTache({ id: 'p1', titre: 'Fleuriste' })

    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool_4',
          name: 'rescheduler_cascade',
          input: { parente_titre: 'fleuriste', decalage_minutes: 30 },
        },
      ],
    } as any)

    const result = await runAgent('Repousse de 30 min', [], [parente])
    expect(result.type).toBe('response')
    expect((result as any).content).toContain('Aucune tâche dépendante')
  })

  it('retourne response si parente introuvable', async () => {
    callClaudeMock.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tool_5',
          name: 'rescheduler_cascade',
          input: { parente_titre: 'inexistant', decalage_minutes: 30 },
        },
      ],
    } as any)

    const result = await runAgent('Repousse', [], [])
    expect(result.type).toBe('response')
    expect((result as any).content).toContain('Aucune tâche parente trouvée')
  })
})
