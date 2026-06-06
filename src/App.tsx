import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { ChefOrgaPage } from '@/pages/ChefOrgaPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { IdentityPage } from '@/pages/IdentityPage'
import { PlannerPage } from '@/pages/PlannerPage'

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
    <BrowserRouter>
      <Routes>
        <Route path="/identity" element={<RedirectIfIdentified />} />
        <Route
          element={
            <RequireIdentity>
              <Layout />
            </RequireIdentity>
          }
        >
          <Route path="/" element={<MyTasksPage />} />
          <Route path="/chef" element={<ChefOrgaPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
