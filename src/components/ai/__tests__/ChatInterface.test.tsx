import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInterface } from '../ChatInterface'
import type { ChatMessage } from '@/types'

const msg = (role: 'user' | 'assistant', content: string): ChatMessage => ({
  role,
  content,
  timestamp: new Date('2026-06-12T10:00:00'),
})

describe('ChatInterface', () => {
  it('affiche un message vide initial', () => {
    render(<ChatInterface messages={[]} loading={false} onSend={vi.fn()} />)
    expect(screen.getByText(/Pose une question/)).toBeInTheDocument()
  })

  it('affiche les messages', () => {
    const messages = [
      msg('user', 'Qui est dispo ?'),
      msg('assistant', 'Lorie est disponible.'),
    ]
    render(<ChatInterface messages={messages} loading={false} onSend={vi.fn()} />)
    expect(screen.getByText('Qui est dispo ?')).toBeInTheDocument()
    expect(screen.getByText('Lorie est disponible.')).toBeInTheDocument()
  })

  it('affiche le loading state (dots)', () => {
    render(<ChatInterface messages={[]} loading={true} onSend={vi.fn()} />)
    const dots = document.querySelectorAll('.animate-bounce')
    expect(dots.length).toBeGreaterThanOrEqual(3)
  })

  it('appelle onSend avec le texte saisi', () => {
    const onSend = vi.fn()
    render(<ChatInterface messages={[]} loading={false} onSend={onSend} />)
    const input = screen.getByPlaceholderText(/Qui est dispo/)
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.submit(input.closest('form')!)
    expect(onSend).toHaveBeenCalledWith('Test message')
  })

  it('ne soumet pas un message vide', () => {
    const onSend = vi.fn()
    render(<ChatInterface messages={[]} loading={false} onSend={onSend} />)
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    expect(onSend).not.toHaveBeenCalled()
  })

  it('desactive le bouton envoi en loading', () => {
    render(<ChatInterface messages={[]} loading={true} onSend={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /Envoyer/ })
    expect(btn).toBeDisabled()
  })
})
