import { useState, useEffect, useRef } from 'react'

export function useFirestoreStatus() {
  const [isOnline, setIsOnline] = useState(true)
  // P-06 : le délai de 3s ne s'applique qu'au démarrage (AC 2.2.5),
  // pas aux coupures ultérieures qui doivent déclencher le bandeau immédiatement (AC 2.2.3)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const gracePeriod = setTimeout(() => {
      isFirstLoad.current = false
    }, 3000)

    let timer: ReturnType<typeof setTimeout>

    const handleOffline = () => {
      const delay = isFirstLoad.current ? 3000 : 0
      timer = setTimeout(() => setIsOnline(false), delay)
    }

    const handleOnline = () => {
      clearTimeout(timer)
      setIsOnline(true)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      clearTimeout(timer)
      clearTimeout(gracePeriod)
    }
  }, [])

  return { isOnline }
}
