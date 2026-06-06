import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, MapPin, Clock, GitBranch, FileText, Users } from 'lucide-react'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import type { Tache } from '@/types'

interface Props {
  tache: Tache | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export function TaskDetail({ tache, onClose, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!tache) return
    setDeleting(true)
    try {
      await onDelete(tache.id)
      onClose()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleClose() {
    setConfirmDelete(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {tache && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-cream-card rounded-t-3xl z-50 px-4 pt-4 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-2">
                <h2 className="text-lg font-semibold text-gray-800">{tache.titre}</h2>
                <div className="mt-1">
                  <TaskStatusBadge statut={tache.statut} />
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
              {tache.assignes.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{tache.assignes.join(', ')}</span>
                </div>
              )}
              {tache.zone && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{tache.zone}</span>
                </div>
              )}
              {(tache.heure_debut || tache.heure_fin) && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {tache.heure_debut && tache.heure_fin
                      ? `${tache.heure_debut} -> ${tache.heure_fin}`
                      : tache.heure_debut ?? tache.heure_fin}
                  </span>
                </div>
              )}
              {tache.parente && (
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{tache.parente}</span>
                </div>
              )}
              {tache.note && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="italic">{tache.note}</span>
                </div>
              )}
            </div>

            {confirmDelete ? (
              <div className="space-y-2">
                <p className="text-center text-gray-700 font-medium text-sm">Supprimer cette tache ?</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 min-h-[44px] bg-rose text-white font-semibold rounded-xl disabled:opacity-40"
                  >
                    {deleting ? 'Suppression...' : 'Oui, supprimer'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 min-h-[44px] bg-cream border border-border-card rounded-xl font-medium text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-rose-dark text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer cette tache
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
