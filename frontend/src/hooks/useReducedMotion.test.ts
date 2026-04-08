import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  const originalMatchMedia = window.matchMedia

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })
  })

  afterAll(() => {
    window.matchMedia = originalMatchMedia
  })

  it('should return a boolean', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })

  it('should default to false when no preference is set', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('should return true when prefers-reduced-motion is set', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })
})
