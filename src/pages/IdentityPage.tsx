import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEMBRES } from '@/lib/constants'
import { useIdentity } from '@/hooks/useIdentity'
import type { Membre } from '@/types'

export function IdentityPage() {
  const [selected, setSelected] = useState<Membre | null>(null)
  const { setIdentity } = useIdentity()
  const navigate = useNavigate()

  function handleConfirm() {
    if (!selected) return
    setIdentity(selected)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-sage-dark mb-2 text-center">
          Je suis…
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Choisissez votre prénom pour accéder à vos tâches
        </p>

        <div className="bg-cream-card rounded-2xl border border-border-card p-3 mb-6 space-y-1 max-h-[60vh] overflow-y-auto">
          {MEMBRES.map((membre) => (
            <button
              key={membre}
              onClick={() => setSelected(membre)}
              className={`w-full min-h-[44px] px-4 py-3 text-left rounded-xl border transition-colors font-medium
                ${selected === membre
                  ? 'bg-sage text-white border-sage-dark'
                  : 'bg-cream border-border-card hover:bg-cream-card'
                }`}
            >
              {membre}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full min-h-[44px] bg-sage text-white font-semibold rounded-xl transition-opacity
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmer
        </button>
      </div>
    </div>
  )
}
