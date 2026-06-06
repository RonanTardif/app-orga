import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChefOrga } from '../useChefOrga'

describe('useChefOrga', () => {
  it('isAuthenticated est false par defaut', () => {
    const { result } = renderHook(() => useChefOrga())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('authenticate avec le bon PIN retourne true et passe isAuthenticated a true', () => {
    const { result } = renderHook(() => useChefOrga())
    let success = false
    act(() => { success = result.current.authenticate('1994') })
    expect(success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('authenticate avec un mauvais PIN retourne false', () => {
    const { result } = renderHook(() => useChefOrga())
    let success = false
    act(() => { success = result.current.authenticate('0000') })
    expect(success).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logout remet isAuthenticated a false', () => {
    const { result } = renderHook(() => useChefOrga())
    act(() => { result.current.authenticate('1994') })
    expect(result.current.isAuthenticated).toBe(true)
    act(() => { result.current.logout() })
    expect(result.current.isAuthenticated).toBe(false)
  })
})
