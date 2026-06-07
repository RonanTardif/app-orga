import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, addDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sortTachesByHeure } from '@/lib/utils'
import type { Tache, Statut } from '@/types'

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

    const unsub = onSnapshot(
      q,
      (snap) => {
        const taches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tache))
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

  async function updateTache(id: string, data: Partial<Omit<Tache, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'taches', id), data)
  }

  async function supprimerTache(id: string): Promise<void> {
    await deleteDoc(doc(db, 'taches', id))
  }

  return { tasks, loading, error, updateStatut, updateTache, supprimerTache }
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

  async function updateTache(id: string, data: Partial<Omit<Tache, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'taches', id), data)
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

  return { allTasks, loading, updateStatut, updateTache, reassignerTache, creerTache, supprimerTache, ajouterNote }
}
