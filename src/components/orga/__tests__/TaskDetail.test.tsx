import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskDetail } from '../TaskDetail'
import type { Tache } from '@/types'

const fakeTache: Tache = {
  id: 'task-1',
  titre: 'Deco tables',
  heure_debut: '10:00',
  heure_fin: '11:00',
  zone: 'Orangerie',
  assignes: ['Ronan'],
  statut: 'En cours',
  note: 'Attention nappes',
  jour: 'samedi',
  parente: null,
}

describe('TaskDetail', () => {
  it('ne rend rien si tache est null', () => {
    const { container } = render(
      <TaskDetail tache={null} onClose={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('affiche le titre de la tache', () => {
    render(<TaskDetail tache={fakeTache} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Deco tables')).toBeInTheDocument()
  })

  it('affiche le bouton Supprimer cette tache', () => {
    render(<TaskDetail tache={fakeTache} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Supprimer cette tache')).toBeInTheDocument()
  })

  it('affiche la confirmation apres tap supprimer', () => {
    render(<TaskDetail tache={fakeTache} onClose={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Supprimer cette tache'))
    expect(screen.getByText('Supprimer cette tache ?')).toBeInTheDocument()
  })

  it('appelle onDelete au tap Oui supprimer', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    render(<TaskDetail tache={fakeTache} onClose={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Supprimer cette tache'))
    fireEvent.click(screen.getByRole('button', { name: 'Oui, supprimer' }))
    expect(onDelete).toHaveBeenCalledWith('task-1')
  })

  it('annuler la suppression cache la confirmation', () => {
    render(<TaskDetail tache={fakeTache} onClose={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Supprimer cette tache'))
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(screen.queryByText('Supprimer cette tache ?')).toBeNull()
    expect(screen.getByText('Supprimer cette tache')).toBeInTheDocument()
  })
})
