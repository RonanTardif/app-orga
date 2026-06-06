import { useState } from 'react'
import type { Membre } from '@/types'

const STORAGE_KEY = 'orga_identity'

export function useIdentity() {
  const [identity, setIdentityState] = useState<Membre | null>(() => {
    return (localStorage.getItem(STORAGE_KEY) as Membre | null)
  })

  function setIdentity(name: Membre) {
    localStorage.setItem(STORAGE_KEY, name)
    setIdentityState(name)
  }

  function clearIdentity() {
    localStorage.removeItem(STORAGE_KEY)
    setIdentityState(null)
  }

  return { identity, setIdentity, clearIdentity }
}
