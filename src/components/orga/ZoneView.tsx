import { ArrowLeft } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import type { Tache, Statut } from '@/types'

const SECTIONS: Statut[] = ['À faire', 'En cours', 'Fait']

interface Props {
  zone: string
  tasks: Tache[]
  onBack: () => void
  onStatusForward: (id: string) => void
  onStatusBack: (id: string) => void
  onInfoTap: (tache: Tache) => void
}

export function ZoneView({ zone, tasks, onBack, onStatusForward, onStatusBack, onInfoTap }: Props) {
  const zoneTasks = tasks.filter((t) => t.zone === zone)

  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sage-dark mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Retour</span>
      </button>

      <h2 className="text-xl font-semibold text-sage-dark mb-4">{zone}</h2>

      {SECTIONS.map((statut) => {
        const section = zoneTasks.filter((t) => t.statut === statut)
        if (section.length === 0) return null
        return (
          <div key={statut} className="mb-5">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{statut}</h3>
            <div className="space-y-3">
              {section.map((t) => (
                <TaskCard
                  key={t.id}
                  tache={t}
                  chefMode
                  showAssigne
                  onStatusForward={onStatusForward}
                  onStatusBack={onStatusBack}
                  onInfoTap={onInfoTap}
                />
              ))}
            </div>
          </div>
        )
      })}

      {zoneTasks.length === 0 && (
        <p className="text-gray-400 text-center py-8">Aucune tache pour cette zone</p>
      )}
    </div>
  )
}
