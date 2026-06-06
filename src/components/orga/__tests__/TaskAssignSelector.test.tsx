import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskAssignSelector } from '../TaskAssignSelector'
import type { Tache } from '@/types'

const fakeTache: Tache = {
  id: 'task-1',
  titre: 'Deco tables',
  heure_debut: null,
  heure_fin: null,
  zone: null,
  assignes: ['Ronan'],
  statut: 'À faire',
  note: null,
  jour: 'samedi',
  parente: null,
}

describe('TaskAssignSelector', () => {
  it('ne rend rien si tache est null', () => {
    const { container } = render(
      <TaskAssignSelector tache={null} allTasks={[]} onAssign={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('affiche les 17 membres quand une tache est selectionnee', () => {
    render(
      <TaskAssignSelector tache={fakeTache} allTasks={[]} onAssign={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('Ronan')).toBeInTheDocument()
    expect(screen.getByText('Lorie')).toBeInTheDocument()
    expect(screen.getByText('Alix')).toBeInTheDocument()
  })

  it('affiche le titre de la tache', () => {
    render(
      <TaskAssignSelector tache={fakeTache} allTasks={[]} onAssign={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('Deco tables')).toBeInTheDocument()
  })

  it('appelle onAssign avec le bon membre au tap', () => {
    const onAssign = vi.fn()
    render(
      <TaskAssignSelector tache={fakeTache} allTasks={[]} onAssign={onAssign} onClose={vi.fn()} />
    )
    fireEvent.click(screen.getByText('Lorie'))
    expect(onAssign).toHaveBeenCalledWith('task-1', 'Lorie')
  })

  it('appelle onClose au tap sur Annuler (icone X)', () => {
    const onClose = vi.fn()
    render(
      <TaskAssignSelector tache={fakeTache} allTasks={[]} onAssign={vi.fn()} onClose={onClose} />
    )
    fireEvent.click(document.querySelector('button svg')!.parentElement!)
    expect(onClose).toHaveBeenCalled()
  })
})
