import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { KellyMemoryNote } from '@/types'

export function useKellyMemory() {
  const [kellyMemory, setKellyMemory] = useState<KellyMemoryNote[]>([])

  useEffect(() => {
    const q = query(collection(db, 'kelly_memory'), orderBy('cree_a', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setKellyMemory(snap.docs.map((d) => ({ id: d.id, ...d.data() } as KellyMemoryNote)))
    })
    return unsub
  }, [])

  return { kellyMemory }
}
