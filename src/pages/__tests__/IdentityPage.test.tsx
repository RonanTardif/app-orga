import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { IdentityPage } from '../IdentityPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <IdentityPage />
    </MemoryRouter>
  )
}

describe('IdentityPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('affiche le titre Je suis', () => {
    renderPage()
    expect(screen.getByText('Je suis…')).toBeInTheDocument()
  })

  it('affiche les 17 membres', () => {
    renderPage()
    expect(screen.getByText('Ronan')).toBeInTheDocument()
    expect(screen.getByText('Lorie')).toBeInTheDocument()
    expect(screen.getByText('Alix')).toBeInTheDocument()
  })

  it('le bouton Confirmer est desactive si rien est selectionne', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Confirmer' })).toBeDisabled()
  })

  it('selection puis confirm puis navigate vers /', () => {
    renderPage()
    fireEvent.click(screen.getByText('Ronan'))
    expect(screen.getByRole('button', { name: 'Confirmer' })).not.toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    expect(localStorage.getItem('orga_identity')).toBe('Ronan')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('chaque item a la classe min-h-[44px]', () => {
    renderPage()
    const ronanBtn = screen.getByText('Ronan').closest('button')
    expect(ronanBtn?.className).toContain('min-h-[44px]')
  })
})
