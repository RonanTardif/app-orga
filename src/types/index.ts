import type { Timestamp } from 'firebase/firestore'

export type Statut = 'À faire' | 'En cours' | 'Fait'

export interface KellyMemoryNote {
  id: string
  contenu: string
  cree_a?: Timestamp
}

export interface Tache {
  id: string
  titre: string
  heure_debut: string | null
  heure_fin: string | null
  zone: string | null
  assignes: string[]
  statut: Statut
  note: string | null
  jour: 'vendredi' | 'samedi' | 'dimanche' | 'avant'
  parente: string | null
}

export type Membre =
  | 'Ronan' | 'Lorie' | 'Guillaume' | 'Clément' | 'Thaïs' | 'Léa'
  | 'Tristan' | 'Pierre' | 'Quentin' | 'Pablo' | 'Frédéric'
  | 'Maryline' | 'Nolwenn' | 'Jean-Paul' | 'Sophie' | 'Alilé' | 'Alix'

export type Zone =
  | 'Château' | 'Orangerie' | 'Jardin à la française' | 'Chapelle'
  | 'Vin d\'honneur' | 'Saloon' | 'Piscine' | 'Coin chill'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
