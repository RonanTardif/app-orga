import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskForm } from '../TaskForm'

describe('TaskForm', () => {
  it('ne rend rien si open est false', () => {
    const { container } = render(
      <TaskForm open={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('affiche le formulaire quand open est true', () => {
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Nom de la tache')).toBeInTheDocument()
  })

  it('le bouton Creer est desactive si titre vide', () => {
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Creer la tache' })).toBeDisabled()
  })

  it('affiche une erreur si submit sans titre', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Creer la tache' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('appelle onSubmit avec les bonnes donnees si titre present', async () => {
    const onSubmit = vi.fn().mockResolvedValue('new-id')
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('Nom de la tache'), {
      target: { value: 'Ranger les chaises' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Creer la tache' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ titre: 'Ranger les chaises', statut: 'À faire' })
    )
  })

  it("affiche les 4 options de jour", () => {
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Avant le 12')).toBeInTheDocument()
    expect(screen.getByText('Vendredi 12 juin')).toBeInTheDocument()
    expect(screen.getByText('Samedi 13 juin')).toBeInTheDocument()
    expect(screen.getByText('Dimanche 14 juin')).toBeInTheDocument()
  })

  it("soumet avec jour 'avant' par défaut", async () => {
    const onSubmit = vi.fn().mockResolvedValue('new-id')
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByPlaceholderText('Nom de la tache'), {
      target: { value: 'Ma tâche' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Creer la tache' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ jour: 'avant' }))
  })

  it("soumet avec le jour sélectionné", async () => {
    const onSubmit = vi.fn().mockResolvedValue('new-id')
    render(<TaskForm open={true} onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByPlaceholderText('Nom de la tache'), {
      target: { value: 'Ma tâche' },
    })
    fireEvent.click(screen.getByText('Samedi 13 juin'))
    fireEvent.click(screen.getByRole('button', { name: 'Creer la tache' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ jour: 'samedi' }))
  })

  it('appelle onClose au tap sur X', () => {
    const onClose = vi.fn()
    render(<TaskForm open={true} onClose={onClose} onSubmit={vi.fn()} />)
    const closeBtn = document.querySelector('button svg.lucide-x')?.parentElement
    fireEvent.click(closeBtn!)
    expect(onClose).toHaveBeenCalled()
  })
})
