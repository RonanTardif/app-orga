import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionBanner } from '../ConnectionBanner'

describe('ConnectionBanner', () => {
  it('est masque quand isOnline est true', () => {
    render(<ConnectionBanner isOnline={true} />)
    expect(screen.queryByText(/Connexion perdue/)).toBeNull()
  })

  it('est visible quand isOnline est false', () => {
    render(<ConnectionBanner isOnline={false} />)
    expect(screen.getByText(/Connexion perdue/)).toBeInTheDocument()
  })
})
