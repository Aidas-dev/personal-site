import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Availability, ProductSortOption } from '@/types';

export interface ProductFilterState {
  minPrice?: number;
  maxPrice?: number;
  categoryIds: string[];
  availability?: Availability;
  sortBy?: ProductSortOption;
}

interface FilterContextValue {
  filter: ProductFilterState;
  setPriceRange: (min?: number, max?: number) => void;
  clearPriceRange: () => void;
  setCategory: (categoryId: string) => void;
  setCategories: (categoryIds: string[]) => void;
  setAvailability: (availability?: Availability) => void;
  setSortBy: (sortBy?: ProductSortOption) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

const defaultFilter: ProductFilterState = {
  minPrice: undefined,
  maxPrice: undefined,
  categoryIds: [],
  availability: undefined,
  sortBy: undefined,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<ProductFilterState>(defaultFilter);

  const setPriceRange = (min?: number, max?: number) => {
    setFilter((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const clearPriceRange = () => {
    setFilter((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }));
  };

  const setCategory = (categoryId: string) => {
    setFilter((prev) => ({ ...prev, categoryIds: [categoryId] }));
  };

  const setCategories = (categoryIds: string[]) => {
    setFilter((prev) => ({ ...prev, categoryIds }));
  };

  const setAvailability = (availability?: Availability) => {
    setFilter((prev) => ({ ...prev, availability }));
  };

  const setSortBy = (sortBy?: ProductSortOption) => {
    setFilter((prev) => ({ ...prev, sortBy }));
  };

  const resetFilters = () => {
    setFilter(defaultFilter);
  };

  const hasActiveFilters =
    filter.minPrice !== undefined ||
    filter.maxPrice !== undefined ||
    filter.categoryIds.length > 0 ||
    filter.availability !== undefined ||
    filter.sortBy !== undefined;

  return (
    <FilterContext.Provider
      value={{
        filter,
        setPriceRange,
        clearPriceRange,
        setCategory,
        setCategories,
        setAvailability,
        setSortBy,
        resetFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
