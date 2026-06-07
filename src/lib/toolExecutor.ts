import { doc, updateDoc, deleteDoc, writeBatch, addDoc, collection, getDoc, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getMariageKnowledge } from '@/lib/mariageKnowledge'
import type { Tache, Statut, KellyMemoryNote } from '@/types'
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

// ─── Analyse optimisation ─────────────────────────────────────────────────────

function parseHeureEnMinutes(heure: string | undefined | null): number | null {
  if (!heure) return null
  const match = heure.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

function analyserOptimisation(tasks: Tache[]): string {
  const SEUIL_SURCHARGE = 5
  const SEUIL_SOUS_UTILISATION = 1
  const DUREE_MIN_MINUTES = 15
  const DUREE_MAX_MINUTES = 240

  const tachesActives = tasks.filter((t) => t.statut === 'À faire' || t.statut === 'En cours')

  const chargeParMembre: Record<string, number> = {}
  for (const tache of tachesActives) {
    for (const membre of tache.assignes ?? []) {
      chargeParMembre[membre] = (chargeParMembre[membre] ?? 0) + 1
    }
  }

  const tousMembres = new Set<string>()
  for (const tache of tasks) {
    for (const membre of tache.assignes ?? []) tousMembres.add(membre)
  }

  const surchargés: string[] = []
  const sousUtilisés: string[] = []
  for (const membre of tousMembres) {
    const charge = chargeParMembre[membre] ?? 0
    if (charge > SEUIL_SURCHARGE) surchargés.push(`${membre} (${charge} tâches)`)
    else if (charge <= SEUIL_SOUS_UTILISATION) sousUtilisés.push(`${membre} (${charge} tâche${charge !== 1 ? 's' : ''})`)
  }

  const tachesTropCourtes: string[] = []
  const tachesTropLongues: string[] = []
  for (const tache of tachesActives) {
    const debut = parseHeureEnMinutes(tache.heure_debut)
    const fin = parseHeureEnMinutes(tache.heure_fin)
    if (debut !== null && fin !== null && fin > debut) {
      const duree = fin - debut
      if (duree < DUREE_MIN_MINUTES) {
        tachesTropCourtes.push(`"${tache.titre}" (${duree} min — ${tache.heure_debut}→${tache.heure_fin})`)
      } else if (duree > DUREE_MAX_MINUTES) {
        const heures = Math.round((duree / 60) * 10) / 10
        tachesTropLongues.push(`"${tache.titre}" (${heures}h — ${tache.heure_debut}→${tache.heure_fin})`)
      }
    }
  }

  const lignes: string[] = []
  lignes.push(`## Rapport d'optimisation — ${tachesActives.length} tâches actives sur ${tasks.length} au total`)
  lignes.push('')
  lignes.push('### Charge par membre')
  if (Object.keys(chargeParMembre).length === 0) {
    lignes.push('Aucune tâche active assignée.')
  } else {
    const sorted = Object.entries(chargeParMembre).sort((a, b) => b[1] - a[1])
    for (const [membre, nb] of sorted) {
      const flag = nb > SEUIL_SURCHARGE ? ' ⚠️ SURCHARGÉ' : nb <= SEUIL_SOUS_UTILISATION ? ' 💤 sous-utilisé' : ''
      lignes.push(`- ${membre} : ${nb} tâche${nb > 1 ? 's' : ''}${flag}`)
    }
    for (const membre of tousMembres) {
      if (!(membre in chargeParMembre)) lignes.push(`- ${membre} : 0 tâche 💤 sous-utilisé`)
    }
  }
  lignes.push('')
  lignes.push('### Alertes surcharge')
  if (surchargés.length === 0) lignes.push('Aucun membre surchargé. 👍')
  else for (const m of surchargés) lignes.push(`- ⚠️ ${m}`)
  lignes.push('')
  lignes.push('### Membres sous-utilisés')
  if (sousUtilisés.length === 0) lignes.push('Tous les membres ont au moins 2 tâches actives. 👍')
  else for (const m of sousUtilisés) lignes.push(`- 💤 ${m}`)
  lignes.push('')
  lignes.push('### Durées suspectes')
  if (tachesTropCourtes.length === 0 && tachesTropLongues.length === 0) {
    lignes.push('Toutes les durées semblent raisonnables (15 min – 4 h). 👍')
  } else {
    if (tachesTropCourtes.length > 0) {
      lignes.push('**Trop courtes (< 15 min) — à vérifier si intentionnel :**')
      for (const t of tachesTropCourtes) lignes.push(`  - ${t}`)
    }
    if (tachesTropLongues.length > 0) {
      lignes.push('**Trop longues (> 4 h) — envisager de découper :**')
      for (const t of tachesTropLongues) lignes.push(`  - ${t}`)
    }
  }

  lignes.push('')
  lignes.push('### Suggestions de rééquilibrage')
  const surchargésNoms = surchargés.map((s) => s.split(' ')[0])
  const sousUtilisésNoms = sousUtilisés.map((s) => s.split(' ')[0])
  if (surchargésNoms.length === 0 || sousUtilisésNoms.length === 0) {
    lignes.push('Aucun rééquilibrage nécessaire. 👍')
  } else {
    let count = 0
    for (const surcharge of surchargésNoms) {
      const deplacables = tachesActives.filter(
        (t) => t.statut === 'À faire' && t.assignes.length === 1 && t.assignes[0] === surcharge
      )
      for (const tache of deplacables.slice(0, 2)) {
        const cible = sousUtilisésNoms[count % sousUtilisésNoms.length]
        lignes.push(`- 📋 Transférer **"${tache.titre}"** de ${surcharge} → ${cible}`)
        count++
      }
    }
    if (count === 0) {
      lignes.push('Les tâches des membres surchargés ont plusieurs assignés — rééquilibrage manuel requis.')
    }
  }

  return lignes.join('\n')
}

// ─── Outils de lecture ────────────────────────────────────────────────────────

function lectureTaches(input: LectureTachesInput, allTasks: Tache[]): string {
  let taches = allTasks

  if (input.filtre_assignes) {
    const nom = input.filtre_assignes.toLowerCase()
    taches = taches.filter((t) => t.assignes.some((a) => a.toLowerCase().includes(nom)))
  }
  if (input.filtre_zone) {
    const zone = input.filtre_zone.toLowerCase()
    taches = taches.filter((t) => t.zone?.toLowerCase().includes(zone))
  }
  if (input.filtre_statut) {
    taches = taches.filter((t) => t.statut === input.filtre_statut)
  }
  if (input.filtre_titre) {
    const STOP_WORDS = new Set(['de', 'du', 'le', 'la', 'les', 'un', 'une', 'des', 'au', 'aux', 'et', 'en', 'à', 'a', 'l', 'je', 'tu', 'il', 'sa', 'son', 'ses'])
    const mots = input.filtre_titre
      .toLowerCase()
      .split(/\s+/)
      .filter((m) => m.length > 1 && !STOP_WORDS.has(m))
    if (mots.length > 0) {
      taches = taches.filter((t) => {
        const titre = t.titre.toLowerCase()
        return mots.some((mot) => titre.includes(mot))
      })
    } else {
      const mot = input.filtre_titre.toLowerCase()
      taches = taches.filter((t) => t.titre.toLowerCase().includes(mot))
    }
  }

  if (taches.length === 0) return 'Aucune tâche trouvée avec ces critères.'

  const lignes = taches.map((t) => {
    const heure = t.heure_debut ? `${t.heure_debut}${t.heure_fin ? '-' + t.heure_fin : ''}` : "Pas d'heure"
    const assignes = t.assignes.join(', ') || 'Non assigné'
    return `- [${t.statut}] ${t.titre} | ID:${t.id} | ${heure} | Zone: ${t.zone ?? 'N/A'} | Assigné: ${assignes}`
  })

  return `${taches.length} tâche(s) trouvée(s) :\n${lignes.join('\n')}`
}

function lectureDisponibilite(allTasks: Tache[]): string {
  const actives = allTasks.filter((t) => t.statut === 'À faire' || t.statut === 'En cours')

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
  allTasks: Tache[],
  kellyMemory: KellyMemoryNote[] = []
): string {
  if (name === 'lecture_taches') return lectureTaches(input as LectureTachesInput, allTasks)
  if (name === 'lecture_disponibilite') return lectureDisponibilite(allTasks)
  if (name === 'analyser_optimisation') return analyserOptimisation(allTasks)
  if (name === 'lire_dossier_mariage') {
    const knowledge = getMariageKnowledge()
    if (!knowledge) return "Le dossier docs/mariage/ est vide ou n'a pas encore été alimenté. Invite Ronan ou Lorie à y ajouter des fichiers Markdown."
    return knowledge
  }
  if (name === 'consulter_memoire') {
    if (kellyMemory.length === 0) {
      return "Je n'ai encore rien mémorisé — n'hésite pas à me dire des informations importantes !"
    }
    const lignes = kellyMemory.map((note) => `- ${note.contenu}`)
    return `${kellyMemory.length} info(s) mémorisée(s) :\n${lignes.join('\n')}`
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
  jour?: 'avant' | 'vendredi' | 'samedi' | 'dimanche'
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
    const { task_id, nouveau_statut } = input as unknown as ModifierStatutInput
    const refStatut = doc(db, 'taches', task_id)
    if (!(await getDoc(refStatut)).exists()) throw new Error(`Tâche introuvable : ${task_id}`)
    await updateDoc(refStatut, { statut: nouveau_statut })
    return `Statut mis à jour : "${nouveau_statut}"`
  }

  if (name === 'reassigner_tache') {
    const { task_id, nouveau_membre } = input as unknown as ReassignerTacheInput
    const refReassign = doc(db, 'taches', task_id)
    if (!(await getDoc(refReassign)).exists()) throw new Error(`Tâche introuvable : ${task_id}`)
    await updateDoc(refReassign, { assignes: [nouveau_membre] })
    return `Tâche réassignée à ${nouveau_membre}`
  }

  if (name === 'ajouter_tache') {
    const i = input as unknown as AjouterTacheInput
    const ref = await addDoc(collection(db, 'taches'), {
      titre: i.titre,
      assignes: i.assignes ?? [],
      zone: i.zone ?? null,
      heure_debut: i.heure_debut ?? null,
      heure_fin: i.heure_fin ?? null,
      note: i.note ?? null,
      statut: 'À faire',
      jour: i.jour ?? 'avant',
      parente: null,
    })
    return `Tâche "${i.titre}" créée (ID: ${ref.id})`
  }

  if (name === 'ajouter_note') {
    const { task_id, note } = input as unknown as AjouterNoteInput
    const refNote = doc(db, 'taches', task_id)
    if (!(await getDoc(refNote)).exists()) throw new Error(`Tâche introuvable : ${task_id}`)
    await updateDoc(refNote, { note })
    return `Note ajoutée`
  }

  if (name === 'modifier_tache') {
    const { task_id, champs } = input as { task_id: string; champs: Record<string, unknown> }
    const taskRef = doc(db, 'taches', task_id)
    const snap = await getDoc(taskRef)
    if (!snap.exists()) throw new Error(`Tâche introuvable : ${task_id}`)
    const updateData: Record<string, unknown> = {}
    if (champs.titre !== undefined) updateData.titre = champs.titre
    if (champs.zone !== undefined) updateData.zone = champs.zone
    if (champs.heure_debut !== undefined) updateData.heure_debut = champs.heure_debut
    if (champs.heure_fin !== undefined) updateData.heure_fin = champs.heure_fin
    if (champs.note !== undefined) updateData.note = champs.note
    if (champs.assignes !== undefined) updateData.assignes = champs.assignes
    if (champs.parente !== undefined) updateData.parente = champs.parente === null ? deleteField() : champs.parente
    if (champs.jour !== undefined) updateData.jour = champs.jour
    if (champs.statut !== undefined) updateData.statut = champs.statut
    if (Object.keys(updateData).length === 0) return 'Aucun champ à modifier fourni.'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(taskRef, updateData as any)
    return `Tâche modifiée avec succès.`
  }

  if (name === 'supprimer_tache') {
    const { task_id } = input as { task_id: string; titre_confirme: string }
    const taskRef = doc(db, 'taches', task_id)
    const snap = await getDoc(taskRef)
    if (!snap.exists()) throw new Error(`Tâche introuvable : ${task_id}`)
    await deleteDoc(taskRef)
    return `Tâche supprimée avec succès.`
  }

  if (name === 'sauvegarder_info') {
    const { contenu } = input as { contenu: string }
    await addDoc(collection(db, 'kelly_memory'), {
      contenu,
      cree_a: serverTimestamp(),
    })
    return `Information mémorisée : "${contenu}"`
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
