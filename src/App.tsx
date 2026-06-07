import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { ChefOrgaPage } from '@/pages/ChefOrgaPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { IdentityPage } from '@/pages/IdentityPage'
import { KellyPage } from '@/pages/KellyPage'

function RequireIdentity({ children }: { children: React.ReactNode }) {
  const identity = localStorage.getItem('orga_identity')
  if (!identity) return <Navigate to="/identity" replace />
  return <>{children}</>
}

function RedirectIfIdentified() {
  const identity = localStorage.getItem('orga_identity')
  if (identity) return <Navigate to="/" replace />
  return <IdentityPage />
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/identity" element={<RedirectIfIdentified />} />
        <Route path="/planner" element={<Navigate to="/kelly" replace />} />
        <Route
          element={
            <RequireIdentity>
              <Layout />
            </RequireIdentity>
          }
        >
          <Route path="/" element={<MyTasksPage />} />
          <Route path="/chef" element={<ChefOrgaPage />} />
          <Route path="/kelly" element={<KellyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
