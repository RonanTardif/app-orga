import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationCard } from '../ConfirmationCard'
import type { PendingAction } from '@/lib/agent'

const action: PendingAction = {
  toolName: 'modifier_statut',
  toolInput: { task_id: '1', nouveau_statut: 'En cours' },
  summary: 'Passer "Décoration salle" au statut "En cours"',
}

describe('ConfirmationCard', () => {
  it('affiche le summary de l\'action', () => {
    render(<ConfirmationCard action={action} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/Décoration salle/)).toBeInTheDocument()
    expect(screen.getByText(/En cours/)).toBeInTheDocument()
  })

  it('appelle onConfirm au clic Confirmer', () => {
    const onConfirm = vi.fn()
    render(<ConfirmationCard action={action} onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Confirmer'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('appelle onCancel au clic Annuler', () => {
    const onCancel = vi.fn()
    render(<ConfirmationCard action={action} onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('désactive les boutons en loading', () => {
    render(<ConfirmationCard action={action} onConfirm={vi.fn()} onCancel={vi.fn()} loading={true} />)
    expect(screen.getByText('Confirmer').closest('button')).toBeDisabled()
    expect(screen.getByText('Annuler').closest('button')).toBeDisabled()
  })

  it('affiche un summary multi-lignes (cascade)', () => {
    const cascadeAction: PendingAction = {
      toolName: 'rescheduler_cascade',
      toolInput: { previews: [] },
      summary: 'Je vais modifier les horaires de 2 tâches :\n• "Tâche A" : 16:00→17:30 ➜ 16:30→18:00\n• "Tâche B" : 16:00→null ➜ 16:30→null',
    }
    render(<ConfirmationCard action={cascadeAction} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/2 tâches/)).toBeInTheDocument()
    expect(screen.getByText(/Tâche A/)).toBeInTheDocument()
  })
})
