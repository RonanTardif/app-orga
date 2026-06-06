import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { ConnectionBanner } from './ConnectionBanner'
import { useFirestoreStatus } from '@/hooks/useFirestoreStatus'

export function Layout() {
  const { isOnline } = useFirestoreStatus()

  return (
    <div className="min-h-screen bg-cream">
      <ConnectionBanner isOnline={isOnline} />
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
