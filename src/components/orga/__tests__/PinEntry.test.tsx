import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PinEntry } from '../PinEntry'

describe('PinEntry', () => {
  it('affiche le bouton Valider desactive si rien saisi', () => {
    render(<PinEntry authenticate={() => false} onSuccess={() => {}} />)
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()
  })

  it('appelle onSuccess quand PIN correct', () => {
    const onSuccess = vi.fn()
    const authenticate = vi.fn().mockReturnValue(true)
    render(<PinEntry authenticate={authenticate} onSuccess={onSuccess} />)

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: '1994' } })

    expect(authenticate).toHaveBeenCalledWith('1994')
    expect(onSuccess).toHaveBeenCalled()
  })

  it('affiche message erreur si PIN incorrect', async () => {
    const authenticate = vi.fn().mockReturnValue(false)
    render(<PinEntry authenticate={authenticate} onSuccess={() => {}} />)

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: '0000' } })

    expect(screen.getByText('PIN incorrect')).toBeInTheDocument()
  })

  it('vide le champ apres PIN incorrect', () => {
    const authenticate = vi.fn().mockReturnValue(false)
    render(<PinEntry authenticate={authenticate} onSuccess={() => {}} />)

    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: '0000' } })

    expect(passwordInput.value).toBe('')
  })
})
