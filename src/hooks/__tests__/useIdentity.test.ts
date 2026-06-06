import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIdentity } from '../useIdentity'

const STORAGE_KEY = 'orga_identity'

describe('useIdentity', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('retourne null si localStorage est vide', () => {
    const { result } = renderHook(() => useIdentity())
    expect(result.current.identity).toBeNull()
  })

  it('setIdentity persiste en localStorage et met a jour identity', () => {
    const { result } = renderHook(() => useIdentity())

    act(() => {
      result.current.setIdentity('Ronan')
    })

    expect(result.current.identity).toBe('Ronan')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('Ronan')
  })

  it('clearIdentity efface localStorage et remet identity a null', () => {
    localStorage.setItem(STORAGE_KEY, 'Lorie')
    const { result } = renderHook(() => useIdentity())
    expect(result.current.identity).toBe('Lorie')

    act(() => {
      result.current.clearIdentity()
    })

    expect(result.current.identity).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('lit identite existante au montage', () => {
    localStorage.setItem(STORAGE_KEY, 'Guillaume')
    const { result } = renderHook(() => useIdentity())
    expect(result.current.identity).toBe('Guillaume')
  })
})
