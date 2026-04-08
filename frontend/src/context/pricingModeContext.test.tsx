import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import {
  PricingModeProvider,
  usePricingMode,
} from './pricingModeContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(PricingModeProvider, null, children);
}

describe('Pricing Mode Context', () => {
  it('should default to B2C mode', () => {
    const { result } = renderHook(() => usePricingMode(), { wrapper });
    expect(result.current.mode).toBe('b2c');
    expect(result.current.isB2B).toBe(false);
  });

  it('should toggle to B2B', () => {
    const { result } = renderHook(() => usePricingMode(), { wrapper });
    act(() => {
      result.current.toggleMode();
    });
    expect(result.current.mode).toBe('b2b');
    expect(result.current.isB2B).toBe(true);
  });

  it('should toggle back to B2C', () => {
    const { result } = renderHook(() => usePricingMode(), { wrapper });
    act(() => {
      result.current.toggleMode();
      result.current.toggleMode();
    });
    expect(result.current.mode).toBe('b2c');
    expect(result.current.isB2B).toBe(false);
  });

  it('should set mode explicitly', () => {
    const { result } = renderHook(() => usePricingMode(), { wrapper });
    act(() => {
      result.current.setMode('b2b');
    });
    expect(result.current.mode).toBe('b2b');
    act(() => {
      result.current.setMode('b2c');
    });
    expect(result.current.mode).toBe('b2c');
  });
});
