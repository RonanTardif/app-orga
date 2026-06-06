import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { ZONES, STATUTS } from '@/lib/constants'
import { computeDisponibilite, sortTachesByHeure, nextStatut, prevStatut } from '@/lib/utils'
import { TaskCard } from '@/components/tasks/TaskCard'
import { MemberAvailability } from './MemberAvailability'
import { MemberView } from './MemberView'
import { ZoneView } from './ZoneView'
import { TaskAssignSelector } from './TaskAssignSelector'
import { TaskDetail } from './TaskDetail'
import { TaskForm } from './TaskForm'
import type { Tache, Statut } from '@/types'

type SubView =
  | { type: 'global' }
  | { type: 'member'; membre: string }
  | { type: 'zone'; zone: string }

interface Props {
  allTasks: Tache[]
  updateStatut: (id: string, statut: Statut) => Promise<void>
  reassignerTache: (id: string, membre: string) => Promise<void>
  creerTache: (data: Omit<Tache, 'id'>) => Promise<string>
  supprimerTache: (id: string) => Promise<void>
}

export function GlobalView({ allTasks, updateStatut, reassignerTache, creerTache, supprimerTache }: Props) {
  const [subView, setSubView] = useState<SubView>({ type: 'global' })
  const [filterZones, setFilterZones] = useState<string[]>([])
  const [filterStatuts, setFilterStatuts] = useState<Statut[]>([])
  const [selectedForAssign, setSelectedForAssign] = useState<Tache | null>(null)
  const [selectedForDetail, setSelectedForDetail] = useState<Tache | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  const dispo = computeDisponibilite(allTasks)

  const handleStatusForward = useCallback(async (id: string) => {
    const task = allTasks.find((t) => t.id === id)
    if (!task) return
    await updateStatut(id, nextStatut(task.statut))
  }, [allTasks, updateStatut])

  const handleStatusBack = useCallback(async (id: string) => {
    const task = allTasks.find((t) => t.id === id)
    if (!task) return
    await updateStatut(id, prevStatut(task.statut))
  }, [allTasks, updateStatut])

  function toggleZone(zone: string) {
    setFilterZones((z) => z.includes(zone) ? z.filter((x) => x !== zone) : [...z, zone])
  }

  function toggleStatut(s: Statut) {
    setFilterStatuts((st) => st.includes(s) ? st.filter((x) => x !== s) : [...st, s])
  }

  const filteredTasks = sortTachesByHeure(
    allTasks.filter((t) => {
      const zoneOk = filterZones.length === 0 || (t.zone !== null && filterZones.includes(t.zone))
      const statutOk = filterStatuts.length === 0 || filterStatuts.includes(t.statut)
      return zoneOk && statutOk
    })
  )

  const handleAssign = useCallback(async (taskId: string, membre: string) => {
    await reassignerTache(taskId, membre)
    setSelectedForAssign(null)
  }, [reassignerTache])

  if (subView.type === 'member') {
    return (
      <MemberView
        membre={subView.membre}
        tasks={allTasks}
        onBack={() => setSubView({ type: 'global' })}
        onStatusForward={handleStatusForward}
        onStatusBack={handleStatusBack}
        onInfoTap={setSelectedForDetail}
      />
    )
  }

  if (subView.type === 'zone') {
    return (
      <ZoneView
        zone={subView.zone}
        tasks={allTasks}
        onBack={() => setSubView({ type: 'global' })}
        onStatusForward={handleStatusForward}
        onStatusBack={handleStatusBack}
        onInfoTap={setSelectedForDetail}
      />
    )
  }

  return (
    <div className="p-4 pb-32">
      {/* Disponibilite membres */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Disponibilite</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {Object.entries(dispo).map(([membre, d]) => (
          <MemberAvailability
            key={membre}
            membre={membre}
            dispo={d}
            onMemberClick={(m) => setSubView({ type: 'member', membre: m })}
          />
        ))}
      </div>

      {/* Filtres zones */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Zones</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => toggleZone(z)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm border transition-colors
              ${filterZones.includes(z)
                ? 'bg-sage text-white border-sage-dark'
                : 'bg-cream-card border-border-card text-gray-600'}`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Filtres statuts */}
      <div className="flex gap-2 mb-4">
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => toggleStatut(s)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
              ${filterStatuts.includes(s)
                ? 'bg-sage text-white border-sage-dark'
                : 'bg-cream-card border-border-card text-gray-600'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Liste taches */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Aucun resultat</p>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <TaskCard
              key={t.id}
              tache={t}
              chefMode
              showAssigne
              onStatusForward={handleStatusForward}
              onStatusBack={handleStatusBack}
              onCardTap={setSelectedForAssign}
              onInfoTap={setSelectedForDetail}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-sage rounded-full shadow-lg
          flex items-center justify-center z-30"
      >
        <Plus className="text-white" size={24} />
      </button>

      {/* Bottom sheets */}
      <TaskAssignSelector
        tache={selectedForAssign}
        allTasks={allTasks}
        onAssign={handleAssign}
        onClose={() => setSelectedForAssign(null)}
      />

      <TaskDetail
        tache={selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
        onDelete={supprimerTache}
      />

      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={creerTache}
      />
    </div>
  )
}
