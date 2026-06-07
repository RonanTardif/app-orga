import { useState, useMemo } from 'react'
import { useIdentity } from '@/hooks/useIdentity'
import { useTasks } from '@/hooks/useTasks'
import { DaySection } from '@/components/tasks/DaySection'
import { TaskSheet } from '@/components/tasks/TaskSheet'
import { EmptyState } from '@/components/tasks/EmptyState'
import { Toast } from '@/components/ui/Toast'
import { getJourActuel, sortTachesByHeure, normaliserJour } from '@/lib/utils'
import { JOURS_ORDONNES, JOUR_SECTION_LABELS, JOUR_CHIP_LABELS } from '@/lib/constants'
import type { ToastData } from '@/components/ui/Toast'
import type { Tache, Jour } from '@/types'

type FilterJour = Jour | 'tous'

const getJourTache = (t: Tache): Jour => normaliserJour(t.jour)

export function MyTasksPage() {
  const { identity } = useIdentity()
  const { tasks, loading, error, updateTache, supprimerTache } = useTasks(identity)
  const [selectedTask, setSelectedTask] = useState<Tache | null>(null)
  const [filterJour, setFilterJour] = useState<FilterJour>('tous')
  const [toasts, setToasts] = useState<ToastData[]>([])

  const jourActuel = getJourActuel()

  const joursAvecTaches = useMemo(() => {
    const set = new Set(tasks.map((t) => getJourTache(t)))
    return JOURS_ORDONNES.filter((j) => set.has(j))
  }, [tasks])

  function showToast(message: string, variant: 'error' | 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  function handleChipClick(key: FilterJour) {
    setFilterJour((prev) => prev === key ? 'tous' : key)
  }

  async function handleSave(id: string, data: Partial<Omit<Tache, 'id'>>) {
    try {
      await updateTache(id, data)
    } catch {
      showToast('Erreur de mise à jour', 'error')
    }
  }

  async function handleDelete(id: string) {
    try {
      await supprimerTache(id)
      setSelectedTask(null)
    } catch {
      showToast('Erreur de suppression', 'error')
    }
  }

  const filteredTasks = sortTachesByHeure(
    filterJour === 'tous'
      ? tasks
      : tasks.filter((t) => getJourTache(t) === filterJour)
  )

  const tasksByJour = joursAvecTaches.map((jour) => ({
    key: jour,
    label: JOUR_SECTION_LABELS[jour],
    tasks: filteredTasks.filter((t) => getJourTache(t) === jour),
    defaultOpen: filterJour !== 'tous' || jourActuel === null || jourActuel === jour,
  }))

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-sage-dark mb-1">Mes taches</h1>
      {identity && (
        <p className="text-gray-500 text-sm mb-3">{identity}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose/10 border border-rose/20 rounded-xl text-rose-dark text-sm">
          Erreur de chargement : {error}
        </div>
      )}

      {/* Chips filtre jour — uniquement les jours où l'utilisateur a des tâches */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        <button
          onClick={() => handleChipClick('tous')}
          className={`flex-shrink-0 min-h-[36px] px-3 rounded-full text-sm border transition-colors
            ${filterJour === 'tous'
              ? 'bg-sage text-white border-sage-dark'
              : 'bg-cream-card border-border-card text-gray-600'}`}
        >
          Tous
        </button>
        {joursAvecTaches.map((jour) => (
          <button
            key={jour}
            onClick={() => handleChipClick(jour)}
            className={`flex-shrink-0 min-h-[36px] px-3 rounded-full text-sm border transition-colors
              ${filterJour === jour
                ? 'bg-sage text-white border-sage-dark'
                : 'bg-cream-card border-border-card text-gray-600'}`}
          >
            {JOUR_CHIP_LABELS[jour]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cream-card border border-border-card rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        tasksByJour.map((section) => (
          <DaySection
            key={`${section.key}-${filterJour}`}
            label={section.label}
            tasks={section.tasks}
            defaultOpen={section.defaultOpen}
            onCardTap={setSelectedTask}
          />
        ))
      )}

      <TaskSheet
        tache={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
