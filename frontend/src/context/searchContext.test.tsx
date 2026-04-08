import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { SearchProvider, useSearch } from './searchContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(SearchProvider, null, children);
}

describe('Search Context', () => {
  it('should provide empty query initially', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    expect(result.current.query).toBe('');
    expect(result.current.isSearching).toBe(false);
  });

  it('should update query', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => {
      result.current.setQuery('brake');
    });
    expect(result.current.query).toBe('brake');
  });

  it('should set searching state', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => {
      result.current.setIsSearching(true);
    });
    expect(result.current.isSearching).toBe(true);
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => {
      result.current.setQuery('brake');
      result.current.setIsSearching(true);
    });
    act(() => {
      result.current.clearSearch();
    });
    expect(result.current.query).toBe('');
    expect(result.current.isSearching).toBe(false);
  });
});
