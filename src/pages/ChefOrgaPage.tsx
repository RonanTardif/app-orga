import { useChefOrga } from '@/hooks/useChefOrga'
import { useAllTasks } from '@/hooks/useTasks'
import { PinEntry } from '@/components/orga/PinEntry'
import { GlobalView } from '@/components/orga/GlobalView'

export function ChefOrgaPage() {
  const { isAuthenticated, authenticate } = useChefOrga()
  const { allTasks, loading, updateTache, creerTache, supprimerTache } = useAllTasks()

  if (!isAuthenticated) {
    return <PinEntry authenticate={authenticate} onSuccess={() => {}} />
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cream-card border border-border-card rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <GlobalView
      allTasks={allTasks}
      updateTache={updateTache}
      creerTache={creerTache}
      supprimerTache={supprimerTache}
    />
  )
}
