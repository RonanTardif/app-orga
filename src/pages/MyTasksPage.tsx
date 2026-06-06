import { useState, useCallback, useEffect } from 'react'
import { useIdentity } from '@/hooks/useIdentity'
import { useTasks } from '@/hooks/useTasks'
import { TaskList } from '@/components/tasks/TaskList'
import { Toast } from '@/components/ui/Toast'
import { nextStatut, prevStatut } from '@/lib/utils'
import type { ToastData } from '@/components/ui/Toast'
import type { Tache } from '@/types'

export function MyTasksPage() {
  const { identity } = useIdentity()
  const { tasks: firestoreTasks, loading, error, updateStatut } = useTasks(identity)
  const [localTasks, setLocalTasks] = useState<Tache[] | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])

  // Quand Firestore émet un snapshot frais, on abandonne l'état optimiste
  useEffect(() => {
    setLocalTasks(null)
  }, [firestoreTasks])

  const tasks = localTasks ?? firestoreTasks

  function showToast(message: string, variant: 'error' | 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleStatusForward = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newStatut = nextStatut(task.statut)
    if (newStatut === task.statut) return

    setLocalTasks(tasks.map((t) => t.id === id ? { ...t, statut: newStatut } : t))

    try {
      await updateStatut(id, newStatut)
    } catch {
      // P-09 : form fonctionnelle pour éviter la closure stale sur `tasks`
      const originalStatut = task.statut
      setLocalTasks((prev) =>
        (prev ?? firestoreTasks).map((t) => t.id === id ? { ...t, statut: originalStatut } : t)
      )
      showToast('Erreur de mise à jour', 'error')
    }
  }, [tasks, firestoreTasks, updateStatut])

  const handleStatusBack = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newStatut = prevStatut(task.statut)
    if (newStatut === task.statut) return

    setLocalTasks(tasks.map((t) => t.id === id ? { ...t, statut: newStatut } : t))

    try {
      await updateStatut(id, newStatut)
    } catch {
      const originalStatut = task.statut
      setLocalTasks((prev) =>
        (prev ?? firestoreTasks).map((t) => t.id === id ? { ...t, statut: originalStatut } : t)
      )
      showToast('Erreur de mise à jour', 'error')
    }
  }, [tasks, firestoreTasks, updateStatut])

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-sage-dark mb-1">Mes taches</h1>
      {identity && (
        <p className="text-gray-500 text-sm mb-4">{identity}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose/10 border border-rose/20 rounded-xl text-rose-dark text-sm">
          Erreur de chargement : {error}
        </div>
      )}

      <TaskList
        tasks={tasks}
        loading={loading}
        onStatusForward={handleStatusForward}
        onStatusBack={handleStatusBack}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
