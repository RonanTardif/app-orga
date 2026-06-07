import { motion } from 'framer-motion'
import { MapPin, Clock, GitBranch, FileText } from 'lucide-react'
import { TaskStatusBadge } from './TaskStatusBadge'
import type { Tache } from '@/types'

interface Props {
  tache: Tache
  onCardTap?: (tache: Tache) => void
  showAssigne?: boolean
}

export function TaskCard({ tache, onCardTap, showAssigne }: Props) {
  const isDone = tache.statut === 'Fait'

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onCardTap?.(tache)}
      className={`bg-cream-card border border-border-card rounded-2xl p-4 shadow-sm select-none touch-manipulation
        ${isDone ? 'opacity-50' : ''}
        ${onCardTap ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-gray-800 flex-1">{tache.titre}</p>
        <motion.div
          key={tache.statut}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <TaskStatusBadge statut={tache.statut} />
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {tache.zone && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {tache.zone}
          </span>
        )}
        {(tache.heure_debut || tache.heure_fin) && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tache.heure_debut && tache.heure_fin
              ? `${tache.heure_debut} -> ${tache.heure_fin}`
              : tache.heure_debut ?? tache.heure_fin}
          </span>
        )}
        {showAssigne && tache.assignes.length > 0 && (
          <span className="text-sage font-medium">{tache.assignes.join(', ')}</span>
        )}
      </div>

      {tache.parente && (
        <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          {tache.parente}
        </p>
      )}
      {tache.note && (
        <p className="mt-1.5 text-xs text-gray-400 italic flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {tache.note}
        </p>
      )}
    </motion.div>
  )
}
