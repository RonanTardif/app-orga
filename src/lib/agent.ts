import Anthropic from '@anthropic-ai/sdk'
import { callClaude, type Message } from '@/lib/claude'
import { AGENT_TOOLS, isWriteTool } from '@/lib/agentTools'
import { executeTool } from '@/lib/toolExecutor'
import { buildSystemPrompt } from '@/lib/systemPrompt'
import { computeCascade, type CascadePreview } from '@/lib/utils'
import type { Tache, KellyMemoryNote } from '@/types'

const TIMEOUT_MS = 10_000
const MAX_ITERATIONS = 5

export interface PendingAction {
  toolName: string
  toolInput: Record<string, unknown>
  summary: string
}

export type AgentResult =
  | { type: 'response'; content: string }
  | { type: 'pending'; action: PendingAction }

// ─── Helpers résumé lisible ───────────────────────────────────────────────────

function buildSummary(
  toolName: string,
  input: Record<string, unknown>,
  tasks: Tache[]
): string {
  switch (toolName) {
    case 'modifier_statut': {
      const task = tasks.find((t) => t.id === input.task_id)
      return `Passer "${task?.titre ?? input.task_id}" au statut "${input.nouveau_statut}"`
    }
    case 'reassigner_tache': {
      const task = tasks.find((t) => t.id === input.task_id)
      return `Réassigner "${task?.titre ?? input.task_id}" à ${input.nouveau_membre}`
    }
    case 'ajouter_tache': {
      const assignes = Array.isArray(input.assignes) ? input.assignes.join(', ') : null
      return `Créer la tâche "${input.titre}"${assignes ? ` assignée à ${assignes}` : ''}`
    }
    case 'ajouter_note': {
      const task = tasks.find((t) => t.id === input.task_id)
      return `Ajouter la note "${input.note}" à "${task?.titre ?? input.task_id}"`
    }
    case 'modifier_tache': {
      const { task_id, champs } = input as { task_id: string; champs: Record<string, unknown> }
      const tache = tasks.find((t) => t.id === task_id)
      const titreTache = tache?.titre ?? task_id
      const modifications: string[] = []
      if (champs.titre) modifications.push(`titre → "${champs.titre}"`)
      if (champs.zone) modifications.push(`zone → "${champs.zone}"`)
      if (champs.heure_debut) modifications.push(`heure de début → ${champs.heure_debut}`)
      if (champs.heure_fin) modifications.push(`heure de fin → ${champs.heure_fin}`)
      if (champs.note) modifications.push(`note → "${champs.note}"`)
      if (champs.assignes) modifications.push(`assignés → ${(champs.assignes as string[]).join(', ')}`)
      if (champs.statut) modifications.push(`statut → ${champs.statut}`)
      if (champs.jour) modifications.push(`jour → ${champs.jour}`)
      if (champs.parente !== undefined) modifications.push(`parente → ${champs.parente ?? 'aucune'}`)
      return `Je vais modifier la tâche **"${titreTache}"** :\n${modifications.map((m) => `• ${m}`).join('\n')}\n\nTu confirmes ?`
    }
    case 'supprimer_tache': {
      const { task_id, titre_confirme } = input as { task_id: string; titre_confirme: string }
      const tache = tasks.find((t) => t.id === task_id)
      const titreTache = titre_confirme ?? tache?.titre ?? task_id
      return `⚠️ Je vais **supprimer définitivement** la tâche **"${titreTache}"**.\n\nCette action est irréversible. Tu confirmes ?`
    }
    case 'sauvegarder_info': {
      const { contenu } = input as { contenu: string }
      return `Mémoriser : "${contenu}"`
    }
    default:
      return 'Action inconnue'
  }
}

function buildCascadeSummary(previews: CascadePreview[]): string {
  const lignes = previews.map((p) => {
    const avant = `${p.ancienDebut ?? '--'}→${p.ancienFin ?? '--'}`
    const apres = `${p.nouveauDebut ?? '--'}→${p.nouveauFin ?? '--'}`
    return `• "${p.tache.titre}" : ${avant} ➜ ${apres}`
  })
  return `Je vais modifier les horaires de ${previews.length} tâche(s) :\n${lignes.join('\n')}`
}

// ─── Résolution parente par titre ─────────────────────────────────────────────

// @ts-ignore — réservé pour usage futur
function findTaskByTitle(titre: string, tasks: Tache[]): Tache | null {
  const mot = titre.toLowerCase()
  const matches = tasks.filter((t) => t.titre.toLowerCase().includes(mot))
  if (matches.length === 1) return matches[0]
  return null
}

// ─── Boucle agent principale ──────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  history: Message[],
  allTasks: Tache[],
  kellyMemory: KellyMemoryNote[] = []
): Promise<AgentResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const messages: Message[] = [
      ...history,
      { role: 'user', content: userMessage },
    ]

    const systemPrompt = buildSystemPrompt(allTasks, kellyMemory)

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await callClaude(
        messages,
        AGENT_TOOLS,
        systemPrompt,
        controller.signal
      )

      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === 'text'
        )
        return { type: 'response', content: textBlock?.text ?? 'Je ne sais pas.' }
      }

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content })

        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue

          // Cas spécial : rescheduler_cascade (calcul avant confirmation)
          if (block.name === 'rescheduler_cascade') {
            const inp = block.input as { parente_titre: string; decalage_minutes: number }
            const mot = inp.parente_titre.toLowerCase()
            const matches = allTasks.filter((t) => t.titre.toLowerCase().includes(mot))
            const parente = matches.length === 1 ? matches[0] : null

            if (!parente) {
              const reason = matches.length === 0
                ? `aucune tâche ne correspond à "${inp.parente_titre}"`
                : `plusieurs tâches correspondent (${matches.map((t) => `"${t.titre}"`).join(', ')}) — précise le titre`
              return {
                type: 'response',
                content: `Impossible de lancer le rescheduling : ${reason}.`,
              }
            }

            const previews = computeCascade(parente.id, inp.decalage_minutes, allTasks)

            if (previews.length === 0) {
              return {
                type: 'response',
                content: `Aucune tâche dépendante trouvée pour "${parente.titre}".`,
              }
            }

            return {
              type: 'pending',
              action: {
                toolName: 'rescheduler_cascade',
                toolInput: { previews },
                summary: buildCascadeSummary(previews),
              },
            }
          }

          // Outil d'écriture standard → confirmation requise
          if (isWriteTool(block.name)) {
            return {
              type: 'pending',
              action: {
                toolName: block.name,
                toolInput: block.input as Record<string, unknown>,
                summary: buildSummary(block.name, block.input as Record<string, unknown>, allTasks),
              },
            }
          }

          // Outil de lecture → exécution directe
          const result = executeTool(block.name, block.input as Record<string, unknown>, allTasks, kellyMemory)
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          })
        }

        if (toolResults.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages.push({ role: 'user', content: toolResults as any })
        }
        continue
      }

      break
    }

    return { type: 'response', content: 'Je ne sais pas.' }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { type: 'response', content: 'Délai dépassé (10 s). Réessaie dans un moment.' }
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
