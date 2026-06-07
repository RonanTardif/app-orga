import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { Tache } from '@/types'

interface Props {
  label: string
  tasks: Tache[]
  defaultOpen: boolean
  onCardTap: (tache: Tache) => void
}

export function DaySection({ label, tasks, defaultOpen, onCardTap }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (tasks.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex justify-between items-center w-full py-3 cursor-pointer select-none"
      >
        <span className="text-sm font-semibold text-sage-dark uppercase tracking-wide">
          {label} ({tasks.length})
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 pb-2">
          {tasks.map((t) => (
            <TaskCard key={t.id} tache={t} onCardTap={onCardTap} />
          ))}
        </div>
      )}
    </div>
  )
}
