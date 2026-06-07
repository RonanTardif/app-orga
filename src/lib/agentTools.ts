import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const READ_TOOLS = ['lecture_taches', 'lecture_disponibilite', 'analyser_optimisation', 'lire_dossier_mariage', 'consulter_memoire'] as const
export const WRITE_TOOLS = [
  'modifier_statut',
  'reassigner_tache',
  'ajouter_tache',
  'ajouter_note',
  'rescheduler_cascade',
  'modifier_tache',
  'supprimer_tache',
  'sauvegarder_info',
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
    name: 'analyser_optimisation',
    description: `Analyse l'ensemble des tâches du mariage et retourne un rapport d'optimisation structuré. Utilise ce tool quand l'utilisateur pose des questions sur la répartition de la charge de travail, les membres surchargés ou sous-utilisés, ou les durées de tâches mal calibrées. Exemples : "Est-ce que la charge est bien répartie ?", "Qui est surchargé ?", "Y a-t-il des tâches trop longues ?". Ne nécessite aucun paramètre.`,
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'lire_dossier_mariage',
    description: `Lit le dossier de connaissances du mariage (docs/mariage/) et retourne son contenu. Ce dossier contient des informations que Ronan a préparées : programme, contacts prestataires, décisions logistiques. Utilise ce tool quand un membre pose une question sur l'horaire de la cérémonie, les prestataires, les contacts d'urgence, les décisions, le programme détaillé. Ne nécessite aucun paramètre.`,
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
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
          enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'lundi_apres'],
          description: "Jour de la tâche (optionnel, défaut: 'vendredi'). 'lundi'-'jeudi' = semaine avant (8-11 juin), 'vendredi' = 12 juin (installation), 'samedi' = 13 juin (jour J), 'dimanche' = 14 juin, 'lundi_apres' = 15 juin (retours)",
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
    name: 'modifier_tache',
    description: "Modifie un ou plusieurs champs d'une tâche existante. Utiliser pour changer le titre, la zone, les horaires, les notes, les personnes assignées, le statut ou la tâche parente.",
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: "L'identifiant Firestore de la tâche à modifier" },
        champs: {
          type: 'object',
          description: 'Les champs à modifier. Fournir uniquement les champs à changer.',
          properties: {
            titre: { type: 'string', description: 'Nouveau titre de la tâche' },
            zone: { type: 'string', description: 'Nouvelle zone' },
            heure_debut: { type: 'string', description: 'Nouvelle heure de début HH:MM' },
            heure_fin: { type: 'string', description: 'Nouvelle heure de fin HH:MM' },
            note: { type: 'string', description: 'Nouvelle note' },
            assignes: { type: 'array', items: { type: 'string' }, description: 'Liste des membres assignés' },
            parente: { type: ['string', 'null'], description: 'ID Firestore de la tâche parente (null pour retirer la relation parente)' },
            jour: { type: 'string', enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'lundi_apres'], description: 'Jour de la tâche' },
            statut: { type: 'string', enum: ['À faire', 'En cours', 'Fait'], description: 'Nouveau statut' },
          },
          additionalProperties: false,
        },
      },
      required: ['task_id', 'champs'],
    },
  },
  {
    name: 'supprimer_tache',
    description: "Supprime définitivement une tâche de Firestore. Action irréversible — toujours demander confirmation explicite. Inclure titre_confirme pour un résumé lisible.",
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: "L'identifiant Firestore de la tâche à supprimer" },
        titre_confirme: { type: 'string', description: 'Le titre de la tâche pour afficher dans la confirmation' },
      },
      required: ['task_id', 'titre_confirme'],
    },
  },
  {
    name: 'consulter_memoire',
    description: `Lit toutes les informations mémorisées par Kelly pendant la journée.
Utilise ce tool quand quelqu'un demande ce que Kelly a mémorisé, cherche une info logistique
non présente dans les tâches Firestore (ex: "où sont les verres à shots ?", "tu te souviens de X ?").
Ne nécessite aucun paramètre.`,
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'sauvegarder_info',
    description: `Mémorise une information importante communiquée pendant la journée.
Utilise ce tool quand quelqu'un dit "mémorise que...", "note que...", "retiens que...".
L'information est persistée en Firestore et accessible depuis tous les appareils.
Nécessite une confirmation avant écriture.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        contenu: {
          type: 'string',
          description: "L'information à mémoriser, formulée de façon complète et autonome (ex: \"Les verres à shots ont été déposés dans l'orangerie\")",
        },
      },
      required: ['contenu'],
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
