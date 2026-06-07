import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DaySection } from '../DaySection'
import type { Tache } from '@/types'

const makeTache = (id: string, titre: string): Tache => ({
  id,
  titre,
  heure_debut: null,
  heure_fin: null,
  zone: null,
  assignes: [],
  statut: 'À faire',
  note: null,
  jour: 'samedi',
  parente: null,
})

describe('DaySection', () => {
  it('ne rend rien si tasks est vide', () => {
    const { container } = render(
      <DaySection label="Samedi 13 juin" tasks={[]} defaultOpen onCardTap={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('affiche le label et le compteur', () => {
    const tasks = [makeTache('1', 'Tâche A'), makeTache('2', 'Tâche B')]
    render(<DaySection label="Samedi 13 juin" tasks={tasks} defaultOpen onCardTap={vi.fn()} />)
    expect(screen.getByText('Samedi 13 juin (2)')).toBeInTheDocument()
  })

  it('affiche les tâches quand defaultOpen=true', () => {
    const tasks = [makeTache('1', 'Rangement salle')]
    render(<DaySection label="Samedi 13 juin" tasks={tasks} defaultOpen onCardTap={vi.fn()} />)
    expect(screen.getByText('Rangement salle')).toBeInTheDocument()
  })

  it('masque les tâches quand defaultOpen=false', () => {
    const tasks = [makeTache('1', 'Rangement salle')]
    render(<DaySection label="Samedi 13 juin" tasks={tasks} defaultOpen={false} onCardTap={vi.fn()} />)
    expect(screen.queryByText('Rangement salle')).toBeNull()
  })

  it('toggle la section au clic sur le header', () => {
    const tasks = [makeTache('1', 'Rangement salle')]
    render(<DaySection label="Samedi 13 juin" tasks={tasks} defaultOpen onCardTap={vi.fn()} />)

    const header = screen.getByText('Samedi 13 juin (1)').closest('button')!
    fireEvent.click(header)
    expect(screen.queryByText('Rangement salle')).toBeNull()

    fireEvent.click(header)
    expect(screen.getByText('Rangement salle')).toBeInTheDocument()
  })

  it('appelle onCardTap au tap sur une carte', () => {
    const onCardTap = vi.fn()
    const tache = makeTache('1', 'Rangement salle')
    render(<DaySection label="Samedi 13 juin" tasks={[tache]} defaultOpen onCardTap={onCardTap} />)
    fireEvent.click(screen.getByText('Rangement salle'))
    expect(onCardTap).toHaveBeenCalledWith(tache)
  })
})
