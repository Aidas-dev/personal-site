import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Hexagon } from './Hexagon';

describe('Hexagon', () => {
  it('renders with default medium size', () => {
    render(<Hexagon />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('hexagon');
    expect(hexagon).toHaveClass('w-16', 'h-16');
  });

  it('renders with small size variant', () => {
    render(<Hexagon size="sm" />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('w-8', 'h-8');
    expect(hexagon).not.toHaveClass('w-16');
  });

  it('renders with large size variant', () => {
    render(<Hexagon size="lg" />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('w-24', 'h-24');
    expect(hexagon).not.toHaveClass('w-16');
  });

  it('applies dark mode colors in dark context', () => {
    document.documentElement.classList.add('dark');
    render(<Hexagon />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon.className).toMatch(/dark:/);
    document.documentElement.classList.remove('dark');
  });

  it('uses clip-path hexagon shape', () => {
    render(<Hexagon />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('hexagon');
  });

  it('accepts custom className', () => {
    render(<Hexagon className="my-custom-class" />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('my-custom-class');
  });

  it('defaults to size "md" when not specified', () => {
    render(<Hexagon />);
    const hexagon = screen.getByRole('presentation');
    expect(hexagon).toHaveClass('w-16');
  });
});
