import { doc, updateDoc, writeBatch, addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Tache, Statut } from '@/types'
import { MEMBRES } from '@/lib/constants'
import type { CascadePreview } from '@/lib/utils'

// ─── Types internes ───────────────────────────────────────────────────────────

interface LectureTachesInput {
  filtre_assignes?: string
  filtre_zone?: string
  filtre_statut?: Statut
  filtre_titre?: string
}

interface DisponibiliteMembre {
  membre: string
  aFaire: number
  enCours: number
}

// ─── Outils de lecture ────────────────────────────────────────────────────────

function lectureTaches(input: LectureTachesInput, allTasks: Tache[]): string {
  let taches = allTasks

  if (input.filtre_assignes) {
    const nom = input.filtre_assignes.toLowerCase()
    taches = taches.filter((t) =>
      t.assignes.some((a) => a.toLowerCase().includes(nom))
    )
  }

  if (input.filtre_zone) {
    const zone = input.filtre_zone.toLowerCase()
    taches = taches.filter((t) => t.zone?.toLowerCase().includes(zone))
  }

  if (input.filtre_statut) {
    taches = taches.filter((t) => t.statut === input.filtre_statut)
  }

  if (input.filtre_titre) {
    const mot = input.filtre_titre.toLowerCase()
    taches = taches.filter((t) => t.titre.toLowerCase().includes(mot))
  }

  if (taches.length === 0) {
    return 'Aucune tâche trouvée avec ces critères.'
  }

  const lignes = taches.map((t) => {
    const heure = t.heure_debut
      ? `${t.heure_debut}${t.heure_fin ? '-' + t.heure_fin : ''}`
      : "Pas d'heure"
    const assignes = t.assignes.join(', ') || 'Non assigné'
    return `- [${t.statut}] ${t.titre} | ID:${t.id} | ${heure} | Zone: ${t.zone ?? 'N/A'} | Assigné: ${assignes}`
  })

  return `${taches.length} tâche(s) trouvée(s) :\n${lignes.join('\n')}`
}

function lectureDisponibilite(allTasks: Tache[]): string {
  const actives = allTasks.filter(
    (t) => t.statut === 'À faire' || t.statut === 'En cours'
  )

  const compteurs: Record<string, DisponibiliteMembre> = {}
  for (const m of MEMBRES) {
    compteurs[m] = { membre: m, aFaire: 0, enCours: 0 }
  }

  for (const t of actives) {
    for (const a of t.assignes) {
      if (compteurs[a]) {
        if (t.statut === 'À faire') compteurs[a].aFaire++
        else if (t.statut === 'En cours') compteurs[a].enCours++
      }
    }
  }

  const lignes = Object.values(compteurs)
    .sort((a, b) => a.aFaire + a.enCours - (b.aFaire + b.enCours))
    .map((d) => {
      const total = d.aFaire + d.enCours
      const dispo = total === 0 ? '✅ libre' : `⏳ ${total} active(s)`
      return `- ${d.membre}: ${dispo} (${d.aFaire} à faire, ${d.enCours} en cours)`
    })

  return `Disponibilité de l'équipe :\n${lignes.join('\n')}`
}

export function executeTool(
  name: string,
  input: Record<string, unknown>,
  allTasks: Tache[]
): string {
  if (name === 'lecture_taches') {
    return lectureTaches(input as LectureTachesInput, allTasks)
  }
  if (name === 'lecture_disponibilite') {
    return lectureDisponibilite(allTasks)
  }
  return `Outil inconnu : ${name}`
}

// ─── Outils d'écriture ────────────────────────────────────────────────────────

interface ModifierStatutInput {
  task_id: string
  nouveau_statut: Statut
}

interface ReassignerTacheInput {
  task_id: string
  nouveau_membre: string
}

interface AjouterTacheInput {
  titre: string
  assignes?: string[]
  zone?: string
  heure_debut?: string
  heure_fin?: string
  note?: string
  jour?: 'vendredi' | 'samedi'
}

interface AjouterNoteInput {
  task_id: string
  note: string
}

export async function executeWriteTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  if (name === 'modifier_statut') {
    const { task_id, nouveau_statut } = input as ModifierStatutInput
    await updateDoc(doc(db, 'taches', task_id), { statut: nouveau_statut })
    return `Statut mis à jour : "${nouveau_statut}"`
  }

  if (name === 'reassigner_tache') {
    const { task_id, nouveau_membre } = input as ReassignerTacheInput
    await updateDoc(doc(db, 'taches', task_id), { assignes: [nouveau_membre] })
    return `Tâche réassignée à ${nouveau_membre}`
  }

  if (name === 'ajouter_tache') {
    // P-17 : addDoc/collection importés statiquement en haut du fichier
    // P-13 : jour passé comme paramètre (défaut 'samedi' = jour du mariage)
    const i = input as AjouterTacheInput
    const ref = await addDoc(collection(db, 'taches'), {
      titre: i.titre,
      assignes: i.assignes ?? [],
      zone: i.zone ?? null,
      heure_debut: i.heure_debut ?? null,
      heure_fin: i.heure_fin ?? null,
      note: i.note ?? null,
      statut: 'À faire',
      jour: i.jour ?? 'samedi',
      parente: null,
    })
    return `Tâche "${i.titre}" créée (ID: ${ref.id})`
  }

  if (name === 'ajouter_note') {
    const { task_id, note } = input as AjouterNoteInput
    await updateDoc(doc(db, 'taches', task_id), { note })
    return `Note ajoutée`
  }

  // P-16 : lever une erreur plutôt que retourner une string (évite l'affichage d'un faux ✅)
  throw new Error(`Outil d'écriture inconnu : ${name}`)
}

// ─── Batch write cascade ──────────────────────────────────────────────────────

export async function executeReschedulerCascade(
  previews: CascadePreview[]
): Promise<string> {
  const batch = writeBatch(db)
  for (const p of previews) {
    batch.update(doc(db, 'taches', p.tache.id), {
      heure_debut: p.nouveauDebut,
      heure_fin: p.nouveauFin,
    })
  }
  await batch.commit()
  return `${previews.length} tâche(s) mise(s) à jour avec succès`
}
