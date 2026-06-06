import { useNavigate } from 'react-router-dom'
import { useIdentity } from '@/hooks/useIdentity'
import { LogOut } from 'lucide-react'

export function SettingsPage() {
  const { identity, clearIdentity } = useIdentity()
  const navigate = useNavigate()

  function handleChangeIdentity() {
    clearIdentity()
    // P-08 : replace évite qu'un "Retour" depuis /identity ramène sur /settings
    navigate('/identity', { replace: true })
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold text-sage-dark mb-6">Paramètres</h1>

      <div className="bg-cream-card rounded-2xl border border-border-card p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Connecté en tant que</p>
        <p className="font-semibold text-gray-800 text-lg">{identity}</p>
      </div>

      <button
        onClick={handleChangeIdentity}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-cream-card border border-border-card
          text-sage-dark font-medium rounded-xl hover:bg-cream transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Changer d'identité
      </button>
    </div>
  )
}
