import { useState } from 'react'
import { PIN_CHEF } from '@/lib/constants'

export function useChefOrga() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  function authenticate(pin: string): boolean {
    if (pin === PIN_CHEF) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  function logout() {
    setIsAuthenticated(false)
  }

  return { isAuthenticated, authenticate, logout }
}
