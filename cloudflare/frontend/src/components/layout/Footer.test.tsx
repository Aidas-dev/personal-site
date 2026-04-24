import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Footer } from './Footer';

function renderFooter() {
  return render(<Footer />);
}

describe('Footer', () => {
  it('renders a GitHub link to https://github.com/Aidas-dev', () => {
    renderFooter();

    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Aidas-dev');
  });

  it('displays "Open-source under MIT" badge text', () => {
    renderFooter();

    expect(screen.getByText(/open-source under mit/i)).toBeInTheDocument();
  });

  it('displays "Built with TanStack Start + Hono + Kubernetes" text', () => {
    renderFooter();

    expect(
      screen.getByText(/built with tanstack start \+ hono \+ kubernetes/i)
    ).toBeInTheDocument();
  });

  it('renders with contentinfo role for accessibility', () => {
    renderFooter();

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('has minimal, clean styling with border-top', () => {
    renderFooter();

    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('border-t');
  });
});
