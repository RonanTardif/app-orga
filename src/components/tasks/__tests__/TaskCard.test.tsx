import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('affiche la tache parente avec préfixe ↳', () => {
    render(<TaskCard tache={baseTache} />)
    expect(screen.getByText('↳ Grande mise en place')).toBeInTheDocument()
  })

  it('applique l\'indentation si tache.parente non nul', () => {
    const { container } = render(<TaskCard tache={baseTache} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('ml-3')
  })

  it('n\'applique pas l\'indentation si tache.parente est null', () => {
    const { container } = render(<TaskCard tache={{ ...baseTache, parente: null }} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('ml-3')
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

  it('appelle onCardTap au tap sur la carte', () => {
    const onCardTap = vi.fn()
    const { container } = render(<TaskCard tache={baseTache} onCardTap={onCardTap} />)
    const card = container.firstChild as HTMLElement
    fireEvent.click(card)
    expect(onCardTap).toHaveBeenCalledWith(baseTache)
  })

  it("n'appelle rien si onCardTap non fourni", () => {
    const { container } = render(<TaskCard tache={baseTache} />)
    const card = container.firstChild as HTMLElement
    expect(() => fireEvent.click(card)).not.toThrow()
  })

  it('masque la note si null', () => {
    render(<TaskCard tache={{ ...baseTache, note: null }} />)
    expect(screen.queryByText('Penser aux tables')).toBeNull()
  })

  it('masque les horaires si null', () => {
    render(<TaskCard tache={{ ...baseTache, heure_debut: null, heure_fin: null }} />)
    expect(screen.queryByText('10:00')).toBeNull()
  })

  it('affiche les assignes avec showAssigne', () => {
    render(<TaskCard tache={baseTache} showAssigne />)
    expect(screen.getByText('Ronan')).toBeInTheDocument()
  })
})
