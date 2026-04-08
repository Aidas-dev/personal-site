import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import {
  FilterProvider,
  useFilter,
  type ProductFilterState,
} from './filterContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(FilterProvider, null, children);
}

describe('Filter Context', () => {
  const defaultFilter: ProductFilterState = {
    minPrice: undefined,
    maxPrice: undefined,
    categoryIds: [],
    availability: undefined,
    sortBy: undefined,
  };

  it('should provide default empty filter', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    expect(result.current.filter).toEqual(defaultFilter);
  });

  it('should set price range', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setPriceRange(10, 100);
    });
    expect(result.current.filter.minPrice).toBe(10);
    expect(result.current.filter.maxPrice).toBe(100);
  });

  it('should clear price range', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setPriceRange(10, 100);
    });
    act(() => {
      result.current.clearPriceRange();
    });
    expect(result.current.filter.minPrice).toBeUndefined();
    expect(result.current.filter.maxPrice).toBeUndefined();
  });

  it('should set category', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setCategory('cat-1');
    });
    expect(result.current.filter.categoryIds).toEqual(['cat-1']);
  });

  it('should set multiple categories', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setCategories(['cat-1', 'cat-2']);
    });
    expect(result.current.filter.categoryIds).toEqual(['cat-1', 'cat-2']);
  });

  it('should set availability', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setAvailability('in_stock');
    });
    expect(result.current.filter.availability).toBe('in_stock');
  });

  it('should set sort option', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setSortBy('price_asc');
    });
    expect(result.current.filter.sortBy).toBe('price_asc');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    act(() => {
      result.current.setPriceRange(10, 100);
      result.current.setCategory('cat-1');
      result.current.setAvailability('in_stock');
      result.current.setSortBy('price_asc');
    });
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.filter).toEqual(defaultFilter);
  });

  it('should have active filters when any filter is set', () => {
    const { result } = renderHook(() => useFilter(), { wrapper });
    expect(result.current.hasActiveFilters).toBe(false);
    act(() => {
      result.current.setCategory('cat-1');
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });
});
