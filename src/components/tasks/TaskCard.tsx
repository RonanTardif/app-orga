import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, GitBranch, FileText, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { TaskStatusBadge } from './TaskStatusBadge'
import { nextStatut, prevStatut } from '@/lib/utils'
import type { Tache } from '@/types'

interface Props {
  tache: Tache
  onStatusForward?: (id: string) => void
  onStatusBack?: (id: string) => void
  onCardTap?: (tache: Tache) => void
  onInfoTap?: (tache: Tache) => void
  showAssigne?: boolean
  chefMode?: boolean
}

export function TaskCard({
  tache,
  onStatusForward,
  onStatusBack,
  onCardTap,
  onInfoTap,
  showAssigne,
  chefMode,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const longPressTriggered = useRef(false)
  const [showStatusControls, setShowStatusControls] = useState(false)

  // --- Member mode: tap forward, long-press backward ---
  function handlePointerDown() {
    if (chefMode) return
    longPressTriggered.current = false
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true
      if (navigator.vibrate) navigator.vibrate(50)
      onStatusBack?.(tache.id)
    }, 500)
  }

  function handlePointerUp() {
    if (chefMode) return
    clearTimeout(timerRef.current)
    if (!longPressTriggered.current) {
      onStatusForward?.(tache.id)
    }
  }

  function handlePointerLeave() {
    if (chefMode) return
    clearTimeout(timerRef.current)
    longPressTriggered.current = true
  }

  // --- Chef mode: card tap = reassign, info button = detail, badge tap = status controls ---
  function handleChefCardClick() {
    if (!chefMode) return
    setShowStatusControls(false)
    onCardTap?.(tache)
  }

  function handleBadgeTap(e: React.MouseEvent) {
    if (!chefMode) return
    e.stopPropagation()
    setShowStatusControls((v) => !v)
  }

  function handleStatusNext(e: React.MouseEvent) {
    e.stopPropagation()
    onStatusForward?.(tache.id)
    setShowStatusControls(false)
  }

  function handleStatusPrev(e: React.MouseEvent) {
    e.stopPropagation()
    onStatusBack?.(tache.id)
    setShowStatusControls(false)
  }

  const isDone = tache.statut === 'Fait'

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={chefMode ? handleChefCardClick : undefined}
      className={`bg-cream-card border border-border-card rounded-2xl p-4 shadow-sm select-none touch-manipulation
        ${isDone ? 'opacity-50' : ''}
        ${chefMode ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-gray-800 flex-1">{tache.titre}</p>
        <div className="flex items-center gap-1">
          <motion.div
            key={tache.statut}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <TaskStatusBadge
              statut={tache.statut}
              onClick={chefMode ? handleBadgeTap : undefined}
            />
          </motion.div>
          {chefMode && onInfoTap && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowStatusControls(false); onInfoTap(tache) }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showStatusControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleStatusPrev}
              disabled={tache.statut === 'À faire'}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              {prevStatut(tache.statut)}
            </button>
            <button
              onClick={handleStatusNext}
              disabled={tache.statut === 'Fait'}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sage/20 text-sage-dark text-xs
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {nextStatut(tache.statut)}
              <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
