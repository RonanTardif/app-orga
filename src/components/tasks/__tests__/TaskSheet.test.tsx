import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskSheet } from '../TaskSheet'
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

describe('TaskSheet', () => {
  it("n'affiche rien si tache est null", () => {
    const { container } = render(
      <TaskSheet tache={null} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('affiche la fiche quand tache est fournie', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Rangement salle')).toBeInTheDocument()
  })

  it('affiche les 3 segments du segmented control', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('À faire')).toBeInTheDocument()
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('Fait')).toBeInTheDocument()
  })

  it('appelle onSave avec le nouveau statut au tap sur un segment', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByText('À faire'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('1', { statut: 'À faire' })
    })
  })

  it('affiche le bouton Modifier en mode lecture', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Modifier')).toBeInTheDocument()
  })

  it('passe en mode édition au clic sur Modifier', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Modifier'))
    expect(screen.getByText('Enregistrer')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('appelle onSave avec les données du formulaire au clic Enregistrer', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByText('Modifier'))

    const titreInput = screen.getByDisplayValue('Rangement salle')
    fireEvent.change(titreInput, { target: { value: 'Nouveau titre' } })

    fireEvent.click(screen.getByText('Enregistrer'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('1', expect.objectContaining({ titre: 'Nouveau titre' }))
    })
  })

  it('annule l\'édition sans appeler onSave', () => {
    const onSave = vi.fn()
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Modifier'))
    fireEvent.click(screen.getByText('Annuler'))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Modifier')).toBeInTheDocument()
  })

  it('affiche la confirmation de suppression au clic sur Supprimer', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Supprimer cette tâche'))
    expect(screen.getByText('Supprimer cette tâche ?')).toBeInTheDocument()
    expect(screen.getByText('Oui, supprimer')).toBeInTheDocument()
  })

  it('appelle onDelete au clic sur Oui, supprimer', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<TaskSheet tache={baseTache} onClose={onClose} onSave={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByText('Supprimer cette tâche'))
    fireEvent.click(screen.getByText('Oui, supprimer'))

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1')
    })
  })

  it('ferme la fiche au clic sur le backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <TaskSheet tache={baseTache} onClose={onClose} onSave={vi.fn()} onDelete={vi.fn()} />
    )
    const backdrop = container.querySelector('.fixed.inset-0')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('affiche le label lisible du jour en mode lecture', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Samedi 13 juin')).toBeInTheDocument()
  })

  it('affiche les 4 options de jour en mode édition', () => {
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Modifier'))
    expect(screen.getByText('Avant le 12')).toBeInTheDocument()
    expect(screen.getByText('Vendredi 12 juin')).toBeInTheDocument()
    expect(screen.getAllByText('Samedi 13 juin').length).toBeGreaterThan(0)
    expect(screen.getByText('Dimanche 14 juin')).toBeInTheDocument()
  })

  it('inclut le jour dans onSave lors de l\'enregistrement', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<TaskSheet tache={baseTache} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Modifier'))
    fireEvent.click(screen.getByText('Vendredi 12 juin'))
    fireEvent.click(screen.getByText('Enregistrer'))
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('1', expect.objectContaining({ jour: 'vendredi' }))
    })
  })
})
