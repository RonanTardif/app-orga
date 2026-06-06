import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, addDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sortTachesByHeure } from '@/lib/utils'
import type { Tache, Statut } from '@/types'

// D-01 : filtre les tâches par jour courant (vendredi = 12 juin, samedi = 13 juin)
// Hors des jours de l'événement, toutes les tâches sont affichées (usage en dev/test)
function getJourActuel(): 'vendredi' | 'samedi' | null {
  const today = new Date()
  const vendredi = new Date(2026, 5, 12) // 12 juin 2026
  const samedi = new Date(2026, 5, 13)   // 13 juin 2026
  const td = today.toDateString()
  if (td === vendredi.toDateString()) return 'vendredi'
  if (td === samedi.toDateString()) return 'samedi'
  return null
}

export function useTasks(identity: string | null) {
  const [tasks, setTasks] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!identity) {
      setTasks([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'taches'),
      where('assignes', 'array-contains', identity)
    )

    const jourActuel = getJourActuel()

    const unsub = onSnapshot(
      q,
      (snap) => {
        let taches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tache))
        if (jourActuel) {
          taches = taches.filter((t) => t.jour === jourActuel)
        }
        setTasks(sortTachesByHeure(taches))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsub
  }, [identity])

  async function updateStatut(id: string, statut: Statut): Promise<void> {
    await updateDoc(doc(db, 'taches', id), { statut })
  }

  return { tasks, loading, error, updateStatut }
}

export function useAllTasks() {
  const [allTasks, setAllTasks] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'taches'),
      (snap) => {
        const taches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tache))
        setAllTasks(sortTachesByHeure(taches))
        setLoading(false)
      },
      (err) => {
        // P-02 : sans ce handler, une erreur Firestore laisse loading=true indéfiniment
        console.error('useAllTasks onSnapshot error:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function updateStatut(id: string, statut: Statut): Promise<void> {
    await updateDoc(doc(db, 'taches', id), { statut })
  }

  async function reassignerTache(id: string, nouveauMembre: string): Promise<void> {
    await updateDoc(doc(db, 'taches', id), { assignes: [nouveauMembre] })
  }

  async function creerTache(data: Omit<Tache, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'taches'), data)
    return ref.id
  }

  async function supprimerTache(id: string): Promise<void> {
    await deleteDoc(doc(db, 'taches', id))
  }

  async function ajouterNote(id: string, note: string): Promise<void> {
    await updateDoc(doc(db, 'taches', id), { note })
  }

  return { allTasks, loading, updateStatut, reassignerTache, creerTache, supprimerTache, ajouterNote }
}
