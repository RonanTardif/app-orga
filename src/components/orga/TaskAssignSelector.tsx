import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { MEMBRES } from '@/lib/constants'
import { computeDisponibilite } from '@/lib/utils'
import type { Tache } from '@/types'

interface Props {
  tache: Tache | null
  allTasks: Tache[]
  onAssign: (taskId: string, membre: string) => void
  onClose: () => void
}

export function TaskAssignSelector({ tache, allTasks, onAssign, onClose }: Props) {
  const dispo = computeDisponibilite(allTasks)

  return (
    <AnimatePresence>
      {tache && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-cream-card rounded-t-3xl z-50 px-4 pt-4 pb-8 max-h-[80vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Reassigner</p>
                <p className="font-semibold text-gray-800 truncate">{tache.titre}</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1 flex-1">
              {MEMBRES.map((membre) => {
                const d = dispo[membre] ?? { aFaire: 0, enCours: 0 }
                const actives = d.aFaire + d.enCours
                const isCurrent = tache.assignes.includes(membre)
                return (
                  <button
                    key={membre}
                    onClick={() => onAssign(tache.id, membre)}
                    className={`w-full min-h-[44px] flex items-center justify-between px-4 py-3 rounded-xl border transition-colors
                      ${isCurrent
                        ? 'bg-sage/10 border-sage/30 text-sage-dark'
                        : 'bg-cream border-border-card hover:bg-cream-card'}`}
                  >
                    <span className="font-medium">{membre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${actives === 0 ? 'bg-green-100 text-green-700' : actives <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-rose/20 text-rose-dark'}`}>
                      {actives === 0 ? 'Dispo' : `${actives} actif${actives > 1 ? 's' : ''}`}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
