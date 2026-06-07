import type { Membre, Zone, Statut, Jour } from '@/types'

export const MEMBRES: Membre[] = [
  'Ronan', 'Lorie', 'Guillaume', 'Clément', 'Thaïs', 'Léa',
  'Tristan', 'Pierre', 'Quentin', 'Pablo', 'Frédéric',
  'Maryline', 'Nolwenn', 'Jean-Paul', 'Sophie', 'Alilé', 'Alix',
  'Yasmine', 'Amaya', 'Étienne', 'Clélia', 'Diane', 'Marion', 'Guillaume Le Meudec', 'Sarah',
]

export const ZONES: Zone[] = [
  'Château', 'Orangerie', 'Jardin à la française', 'Chapelle',
  'Vin d\'honneur', 'Saloon', 'Piscine', 'Coin chill',
]

export const STATUTS: Statut[] = ['À faire', 'En cours', 'Fait']

export const PIN_CHEF = '1994'

export const JOURS_ORDONNES: Jour[] = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'lundi_apres',
]

export const JOUR_ORDRE: Record<string, number> = {
  lundi: 0, mardi: 1, mercredi: 2, jeudi: 3,
  vendredi: 4, samedi: 5, dimanche: 6, lundi_apres: 7,
}

export const JOUR_SECTION_LABELS: Record<Jour, string> = {
  lundi: 'Lundi 8 juin',
  mardi: 'Mardi 9 juin',
  mercredi: 'Mercredi 10 juin',
  jeudi: 'Jeudi 11 juin',
  vendredi: 'Vendredi 12 juin',
  samedi: 'Samedi 13 juin',
  dimanche: 'Dimanche 14 juin',
  lundi_apres: 'Lundi 15 juin',
}

export const JOUR_CHIP_LABELS: Record<Jour, string> = {
  lundi: 'Lun. 8',
  mardi: 'Mar. 9',
  mercredi: 'Mer. 10',
  jeudi: 'Jeu. 11',
  vendredi: 'Ven. 12',
  samedi: 'Sam. 13',
  dimanche: 'Dim. 14',
  lundi_apres: 'Lun. 15',
}
