import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFirestoreStatus } from '../useFirestoreStatus'

describe('useFirestoreStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('isOnline est true par defaut', () => {
    const { result } = renderHook(() => useFirestoreStatus())
    expect(result.current.isOnline).toBe(true)
  })

  it('reste online si event offline suivi online avant 3s', () => {
    const { result } = renderHook(() => useFirestoreStatus())

    act(() => { window.dispatchEvent(new Event('offline')) })
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { window.dispatchEvent(new Event('online')) })

    expect(result.current.isOnline).toBe(true)
  })

  it('passe offline apres 3s de coupure reseau', () => {
    const { result } = renderHook(() => useFirestoreStatus())

    act(() => { window.dispatchEvent(new Event('offline')) })
    act(() => { vi.advanceTimersByTime(3001) })

    expect(result.current.isOnline).toBe(false)
  })

  it('revient online apres reconnexion', () => {
    const { result } = renderHook(() => useFirestoreStatus())

    act(() => { window.dispatchEvent(new Event('offline')) })
    act(() => { vi.advanceTimersByTime(3001) })
    expect(result.current.isOnline).toBe(false)

    act(() => { window.dispatchEvent(new Event('online')) })
    expect(result.current.isOnline).toBe(true)
  })
})
