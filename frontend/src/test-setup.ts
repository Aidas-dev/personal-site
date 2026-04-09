import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// localStorage polyfill for jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// matchMedia polyfill for jsdom — returns matches based on query
const matchMediaMock = vi.fn((query: string) => {
  const isDark = query.includes('prefers-color-scheme: dark');
  const isReducedMotion = query.includes('prefers-reduced-motion: reduce');
  return {
    matches: isDark, // default to dark mode
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
});
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});
