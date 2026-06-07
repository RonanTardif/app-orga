import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ZONES } from '@/lib/constants'
import { computeDisponibilite, sortTachesByHeure } from '@/lib/utils'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskSheet } from '@/components/tasks/TaskSheet'
import { MemberAvailability } from './MemberAvailability'
import { MemberView } from './MemberView'
import { ZoneView } from './ZoneView'
import { TaskForm } from './TaskForm'
import type { Tache, Statut } from '@/types'

// TaskDetail et TaskAssignSelector sont conservés mais non utilisés ici (@deprecated — cleanup prévu)

type SubView =
  | { type: 'global' }
  | { type: 'member'; membre: string }
  | { type: 'zone'; zone: string }

const SECTIONS: Statut[] = ['À faire', 'En cours', 'Fait']

interface Props {
  allTasks: Tache[]
  updateTache: (id: string, data: Partial<Omit<Tache, 'id'>>) => Promise<void>
  creerTache: (data: Omit<Tache, 'id'>) => Promise<string>
  supprimerTache: (id: string) => Promise<void>
}

export function GlobalView({ allTasks, updateTache, creerTache, supprimerTache }: Props) {
  const [subView, setSubView] = useState<SubView>({ type: 'global' })
  const [filterZones, setFilterZones] = useState<string[]>([])
  const [filterMembre, setFilterMembre] = useState<string | null>(null)
  const [filterStatuts, setFilterStatuts] = useState<Statut[]>([])
  const [selectedTask, setSelectedTask] = useState<Tache | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  const dispo = computeDisponibilite(allTasks)

  function toggleZone(zone: string) {
    setFilterZones((z) => z.includes(zone) ? z.filter((x) => x !== zone) : [...z, zone])
  }

  function toggleMembre(membre: string) {
    setFilterMembre((m) => m === membre ? null : membre)
  }

  function toggleStatut(statut: Statut) {
    setFilterStatuts((s) => s.includes(statut) ? s.filter((x) => x !== statut) : [...s, statut])
  }

  const filteredTasks = sortTachesByHeure(
    allTasks.filter((t) => {
      const zoneOk = filterZones.length === 0 || (t.zone !== null && filterZones.includes(t.zone))
      const membreOk = filterMembre === null || t.assignes.includes(filterMembre)
      const statutOk = filterStatuts.length === 0 || filterStatuts.includes(t.statut)
      return zoneOk && membreOk && statutOk
    })
  )

  if (subView.type === 'member') {
    return (
      <>
        <MemberView
          membre={subView.membre}
          tasks={allTasks}
          onBack={() => { setSubView({ type: 'global' }); setSelectedTask(null) }}
          onCardTap={setSelectedTask}
        />
        <TaskSheet
          tache={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updateTache}
          onDelete={async (id) => { await supprimerTache(id); setSelectedTask(null) }}
        />
      </>
    )
  }

  if (subView.type === 'zone') {
    return (
      <>
        <ZoneView
          zone={subView.zone}
          tasks={allTasks}
          onBack={() => { setSubView({ type: 'global' }); setSelectedTask(null) }}
          onCardTap={setSelectedTask}
        />
        <TaskSheet
          tache={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updateTache}
          onDelete={async (id) => { await supprimerTache(id); setSelectedTask(null) }}
        />
      </>
    )
  }

  return (
    <div className="p-4 pb-32">
      {/* Bande membres — filtre au tap */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Disponibilité</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {Object.entries(dispo).map(([membre, d]) => (
          <div
            key={membre}
            onClick={() => { toggleMembre(membre); setSelectedTask(null); setSubView({ type: 'member', membre }) }}
            className={`cursor-pointer transition-opacity ${filterMembre && filterMembre !== membre ? 'opacity-40' : ''}`}
          >
            <MemberAvailability
              membre={membre}
              dispo={d}
              onMemberClick={() => {}}
            />
          </div>
        ))}
      </div>

      {/* Filtres zones */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Zones</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
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

      {/* Filtres statut */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Statut</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {SECTIONS.map((statut) => (
          <button
            key={statut}
            onClick={() => toggleStatut(statut)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm border transition-colors
              ${filterStatuts.includes(statut)
                ? 'bg-sage text-white border-sage-dark'
                : 'bg-cream-card border-border-card text-gray-600'}`}
          >
            {statut}
          </button>
        ))}
      </div>

      {/* Tâches groupées par statut */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Aucun résultat</p>
      ) : (
        SECTIONS.map((statut) => {
          const section = filteredTasks.filter((t) => t.statut === statut)
          if (section.length === 0) return null
          return (
            <div key={statut} className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                {statut} ({section.length})
              </h3>
              <div className="space-y-3">
                {section.map((t) => (
                  <TaskCard key={t.id} tache={t} showAssigne onCardTap={setSelectedTask} />
                ))}
              </div>
            </div>
          )
        })
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
      <TaskSheet
        tache={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={updateTache}
        onDelete={async (id) => { await supprimerTache(id); setSelectedTask(null) }}
      />

      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={creerTache}
      />
    </div>
  )
}
