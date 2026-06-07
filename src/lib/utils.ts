import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Tache, Statut } from '@/types'
import { MEMBRES } from '@/lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getJourActuel(): 'vendredi' | 'samedi' | 'dimanche' | null {
  const today = new Date()
  const vendredi = new Date(2026, 5, 12)
  const samedi = new Date(2026, 5, 13)
  const dimanche = new Date(2026, 5, 14)
  const td = today.toDateString()
  if (td === vendredi.toDateString()) return 'vendredi'
  if (td === samedi.toDateString()) return 'samedi'
  if (td === dimanche.toDateString()) return 'dimanche'
  return null
}

export function sortTachesByHeure(taches: Tache[]): Tache[] {
  return [...taches].sort((a, b) => {
    // P-07 : utiliser == null pour couvrir undefined (champ absent de Firestore) et null
    const aNull = a.heure_debut == null
    const bNull = b.heure_debut == null
    if (aNull && bNull) return 0
    if (aNull) return 1
    if (bNull) return -1
    return a.heure_debut!.localeCompare(b.heure_debut!)
  })
}

export function computeDisponibilite(tasks: Tache[]): Record<string, { aFaire: number; enCours: number }> {
  // P-03 : initialiser tous les membres (y compris ceux sans tâche) pour AC 3.2.3
  const result: Record<string, { aFaire: number; enCours: number }> = {}
  for (const m of MEMBRES) {
    result[m] = { aFaire: 0, enCours: 0 }
  }
  for (const task of tasks) {
    for (const membre of task.assignes) {
      if (!result[membre]) result[membre] = { aFaire: 0, enCours: 0 }
      if (task.statut === 'À faire') result[membre].aFaire++
      else if (task.statut === 'En cours') result[membre].enCours++
    }
  }
  return result
}

const STATUT_ORDER: Statut[] = ['À faire', 'En cours', 'Fait']

export function nextStatut(current: Statut): Statut {
  const idx = STATUT_ORDER.indexOf(current)
  if (idx === -1) return current  // P-10 : garde contre statut corrompu
  return idx < STATUT_ORDER.length - 1 ? STATUT_ORDER[idx + 1] : current
}

export function prevStatut(current: Statut): Statut {
  const idx = STATUT_ORDER.indexOf(current)
  if (idx === -1) return current  // P-18 : garde symétrique
  return idx > 0 ? STATUT_ORDER[idx - 1] : current
}

// ─── Cascade rescheduling ─────────────────────────────────────────────────────

export interface CascadePreview {
  tache: Tache
  ancienDebut: string | null
  ancienFin: string | null
  nouveauDebut: string | null
  nouveauFin: string | null
}

export function addMinutes(heure: string | null, minutes: number): string | null {
  if (!heure) return null
  const [h, m] = heure.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  const newH = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60)
  const newM = ((totalMinutes % 60) + 60) % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function computeCascade(
  parenteId: string,
  decalageMinutes: number,
  allTasks: Tache[]
): CascadePreview[] {
  return allTasks
    .filter((t) => t.parente === parenteId)
    .map((t) => ({
      tache: t,
      ancienDebut: t.heure_debut,
      ancienFin: t.heure_fin,
      nouveauDebut: addMinutes(t.heure_debut, decalageMinutes),
      nouveauFin: addMinutes(t.heure_fin, decalageMinutes),
    }))
}
