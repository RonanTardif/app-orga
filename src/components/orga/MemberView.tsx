import { ArrowLeft } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { computeDisponibilite } from '@/lib/utils'
import type { Tache } from '@/types'

interface Props {
  membre: string
  tasks: Tache[]
  onBack: () => void
  onCardTap: (tache: Tache) => void
}

export function MemberView({ membre, tasks, onBack, onCardTap }: Props) {
  const memberTasks = tasks.filter((t) => t.assignes.includes(membre))
  const dispo = computeDisponibilite(memberTasks)[membre] ?? { aFaire: 0, enCours: 0 }
  const actives = dispo.aFaire + dispo.enCours

  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sage-dark mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Retour</span>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-sage-dark">{membre}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${actives === 0 ? 'bg-green-100 text-green-700' : actives <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-rose/20 text-rose-dark'}`}>
          {actives === 0 ? 'Disponible' : `${actives} actif${actives > 1 ? 's' : ''}`}
        </span>
      </div>

      {memberTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Aucune tache pour ce membre</p>
      ) : (
        <div className="space-y-3">
          {memberTasks.map((t) => (
            <TaskCard
              key={t.id}
              tache={t}
              onCardTap={onCardTap}
            />
          ))}
        </div>
      )}
    </div>
  )
}
