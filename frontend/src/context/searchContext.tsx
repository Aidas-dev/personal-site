import { createContext, useContext, useState, type ReactNode } from 'react';

interface SearchContextValue {
  query: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        isSearching,
        setQuery,
        setIsSearching,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
