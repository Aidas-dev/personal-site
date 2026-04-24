import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, type ThemeMode } from '@/context/themeContext';
import { ThemeToggle } from './ThemeToggle';

function renderToggle(initialTheme?: ThemeMode) {
  if (initialTheme) {
    localStorage.setItem('theme', initialTheme);
  }
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a button with aria-label indicating current theme', () => {
    renderToggle('dark');
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('shows sun icon when in dark mode', () => {
    renderToggle('dark');
    const button = screen.getByRole('button');
    const sunIcon = button.querySelector('[data-testid="sun-icon"]');
    expect(sunIcon).not.toBeNull();
  });

  it('shows moon icon when in light mode', () => {
    renderToggle('light');
    const button = screen.getByRole('button');
    const moonIcon = button.querySelector('[data-testid="moon-icon"]');
    expect(moonIcon).not.toBeNull();
  });

  it('calls toggleTheme when clicked', () => {
    renderToggle('dark');
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // After click, theme should be light, so sun icon should be gone and moon should appear
    const moonIcon = button.querySelector('[data-testid="moon-icon"]');
    expect(moonIcon).not.toBeNull();
  });

  it('has smooth transition class for visual animation', () => {
    renderToggle('dark');
    const button = screen.getByRole('button');
    // Check for transition class
    expect(button.className).toMatch(/transition/);
  });
});
