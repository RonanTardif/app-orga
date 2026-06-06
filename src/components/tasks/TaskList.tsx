import { TaskCard } from './TaskCard'
import { EmptyState } from './EmptyState'
import type { Tache } from '@/types'

interface Props {
  tasks: Tache[]
  loading: boolean
  onStatusForward: (id: string) => void
  onStatusBack: (id: string) => void
}

function SkeletonCard() {
  return (
    <div className="bg-cream-card border border-border-card rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  )
}

export function TaskList({ tasks, loading, onStatusForward, onStatusBack }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-3">
      {tasks.map((tache) => (
        <TaskCard
          key={tache.id}
          tache={tache}
          onStatusForward={onStatusForward}
          onStatusBack={onStatusBack}
        />
      ))}
    </div>
  )
}
