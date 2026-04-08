import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme, type ThemeMode } from './themeContext';

// Helper component to consume theme context
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-btn">
        Toggle Theme
      </button>
    </div>
  );
}

function renderWithContext() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset matchMedia mock
    vi.restoreAllMocks();
  });

  it('defaults to dark mode when no preference is set and no localStorage value', () => {
    // No matchMedia mock, no localStorage value → defaults to dark
    const { getByTestId } = renderWithContext();
    expect(getByTestId('theme-value').textContent).toBe('dark');
  });

  it('respects prefers-color-scheme: light on initial load', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { getByTestId } = renderWithContext();
    expect(getByTestId('theme-value').textContent).toBe('light');
  });

  it('respects prefers-color-scheme: dark on initial load', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { getByTestId } = renderWithContext();
    expect(getByTestId('theme-value').textContent).toBe('dark');
  });

  it('uses localStorage value over prefers-color-scheme when set', () => {
    localStorage.setItem('theme', 'light');

    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { getByTestId } = renderWithContext();
    // localStorage should override system preference
    expect(getByTestId('theme-value').textContent).toBe('light');
  });

  it('toggles theme from dark to light', () => {
    const { getByTestId } = renderWithContext();
    expect(getByTestId('theme-value').textContent).toBe('dark');

    act(() => {
      getByTestId('toggle-btn').click();
    });

    expect(getByTestId('theme-value').textContent).toBe('light');
  });

  it('toggles theme from light to dark', () => {
    localStorage.setItem('theme', 'light');

    const { getByTestId } = renderWithContext();
    expect(getByTestId('theme-value').textContent).toBe('light');

    act(() => {
      getByTestId('toggle-btn').click();
    });

    expect(getByTestId('theme-value').textContent).toBe('dark');
  });

  it('persists theme selection to localStorage', () => {
    const { getByTestId } = renderWithContext();
    // Initial render sets localStorage via useEffect
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      getByTestId('toggle-btn').click();
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('applies dark class to document.documentElement when theme is dark', () => {
    renderWithContext();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document.documentElement when theme is light', () => {
    localStorage.setItem('theme', 'light');
    renderWithContext();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates document.documentElement class when toggled', () => {
    const { getByTestId } = renderWithContext();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      getByTestId('toggle-btn').click();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
