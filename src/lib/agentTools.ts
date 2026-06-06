import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const READ_TOOLS = ['lecture_taches', 'lecture_disponibilite'] as const
export const WRITE_TOOLS = [
  'modifier_statut',
  'reassigner_tache',
  'ajouter_tache',
  'ajouter_note',
  'rescheduler_cascade',
] as const

export type WriteToolName = (typeof WRITE_TOOLS)[number]

export function isWriteTool(name: string): name is WriteToolName {
  return (WRITE_TOOLS as readonly string[]).includes(name)
}

export const AGENT_TOOLS: Tool[] = [
  {
    name: 'lecture_taches',
    description: "Lire l'état courant d'une ou plusieurs tâches. Filtre par nom, zone, assigné, ou statut.",
    input_schema: {
      type: 'object',
      properties: {
        filtre_assignes: {
          type: 'string',
          description: 'Prénom du membre (ex: "Ronan")',
        },
        filtre_zone: {
          type: 'string',
          description: 'Nom de la zone (ex: "Chapelle")',
        },
        filtre_statut: {
          type: 'string',
          enum: ['À faire', 'En cours', 'Fait'],
          description: 'Statut de la tâche',
        },
        filtre_titre: {
          type: 'string',
          description: 'Mot-clé à rechercher dans le titre de la tâche',
        },
      },
    },
  },
  {
    name: 'lecture_disponibilite',
    description:
      'Agréger les tâches actives (À faire + En cours) par membre et retourner une synthèse de disponibilité.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'modifier_statut',
    description: "Changer le statut d'une tâche (À faire, En cours, Fait). Nécessite une confirmation.",
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: "ID de la tâche à modifier" },
        nouveau_statut: {
          type: 'string',
          enum: ['À faire', 'En cours', 'Fait'],
          description: 'Nouveau statut de la tâche',
        },
      },
      required: ['task_id', 'nouveau_statut'],
    },
  },
  {
    name: 'reassigner_tache',
    description: "Réassigner une tâche à un autre membre. Nécessite une confirmation.",
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: "ID de la tâche à réassigner" },
        nouveau_membre: { type: 'string', description: 'Prénom du nouveau membre assigné' },
      },
      required: ['task_id', 'nouveau_membre'],
    },
  },
  {
    name: 'ajouter_tache',
    description: "Créer une nouvelle tâche. Nécessite une confirmation.",
    input_schema: {
      type: 'object',
      properties: {
        titre: { type: 'string', description: 'Titre de la tâche' },
        assignes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des membres assignés',
        },
        zone: { type: 'string', description: 'Zone de la tâche (optionnel)' },
        heure_debut: { type: 'string', description: 'Heure de début HH:MM (optionnel)' },
        heure_fin: { type: 'string', description: 'Heure de fin HH:MM (optionnel)' },
        note: { type: 'string', description: 'Note (optionnel)' },
        jour: {
          type: 'string',
          enum: ['vendredi', 'samedi'],
          description: 'Jour de la tâche (optionnel, défaut: samedi = jour du mariage)',
        },
      },
      required: ['titre'],
    },
  },
  {
    name: 'ajouter_note',
    description: "Ajouter ou remplacer la note d'une tâche. Nécessite une confirmation.",
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: "ID de la tâche" },
        note: { type: 'string', description: 'Contenu de la note' },
      },
      required: ['task_id', 'note'],
    },
  },
  {
    name: 'rescheduler_cascade',
    description:
      "Recalculer les horaires de toutes les tâches dépendantes d'une tâche parente. Nécessite une confirmation.",
    input_schema: {
      type: 'object',
      properties: {
        parente_titre: {
          type: 'string',
          description: 'Titre ou mot-clé de la tâche parente',
        },
        decalage_minutes: {
          type: 'number',
          description: 'Décalage en minutes (positif = plus tard, négatif = plus tôt)',
        },
      },
      required: ['parente_titre', 'decalage_minutes'],
    },
  },
]
