import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import type { Tache } from '@/types'

const baseTache: Tache = {
  id: '1',
  titre: 'Rangement salle',
  heure_debut: '10:00',
  heure_fin: '11:00',
  zone: 'Chateau',
  assignes: ['Ronan'],
  statut: 'En cours',
  note: 'Penser aux tables',
  jour: 'samedi',
  parente: 'Grande mise en place',
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche le titre', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('Rangement salle')).toBeInTheDocument()
  })

  it('affiche le badge statut', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('affiche la zone', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('Chateau')).toBeInTheDocument()
  })

  it('affiche la tache parente', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('Grande mise en place')).toBeInTheDocument()
  })

  it('affiche la note', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('Penser aux tables')).toBeInTheDocument()
  })

  it('applique opacity-50 si statut Fait', () => {
    const { container } = render(<TaskCard tache={{ ...baseTache, statut: 'Fait' }} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-50')
  })

  it('pas de opacity-50 si statut autre que Fait', () => {
    const { container } = render(<TaskCard tache={baseTache} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('opacity-50')
  })

  it('appelle onStatusForward au tap court', () => {
    const onForward = vi.fn()
    const { container } = render(<TaskCard tache={baseTache} onStatusForward={onForward} />)
    const card = container.firstChild as HTMLElement

    fireEvent.pointerDown(card)
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.pointerUp(card)

    expect(onForward).toHaveBeenCalledWith('1')
  })

  it('appelle onStatusBack au tap long >= 500ms', () => {
    const onBack = vi.fn()
    const { container } = render(<TaskCard tache={baseTache} onStatusBack={onBack} />)
    const card = container.firstChild as HTMLElement

    fireEvent.pointerDown(card)
    act(() => { vi.advanceTimersByTime(600) })
    fireEvent.pointerUp(card)

    expect(onBack).toHaveBeenCalledWith('1')
  })

  it('masque la note si null', () => {
    render(<TaskCard tache={{ ...baseTache, note: null }} />)
    expect(screen.queryByText('Penser aux tables')).toBeNull()
  })

  it('masque les horaires si null', () => {
    render(<TaskCard tache={{ ...baseTache, heure_debut: null, heure_fin: null }} />)
    expect(screen.queryByText('10:00')).toBeNull()
  })
})
