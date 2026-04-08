import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock @tanstack/react-router
vi.mock('@tanstack/react-router', () => {
  const LinkMock = ({
    to,
    children,
    className,
    'data-testid': testId,
    ...rest
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <a href={to} className={className} data-testid={testId} {...rest}>
      {children}
    </a>
  );

  const useLocationMock = () => ({ pathname: '/' });

  return {
    Link: LinkMock,
    useLocation: useLocationMock,
  };
});

// Mock ThemeToggle
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => (
    <button data-testid="theme-toggle" type="button">
      Theme Toggle
    </button>
  ),
}));

// Mock Navigation
vi.mock('./Navigation', () => ({
  Navigation: ({
    items,
    variant,
    onLinkClick,
  }: {
    items: { label: string; path: string }[];
    variant: 'desktop' | 'mobile';
    onLinkClick?: () => void;
  }) => (
    <nav data-testid={`nav-${variant}`} aria-label={variant === 'desktop' ? 'Main navigation' : 'Mobile navigation'}>
      {items.map((item) => (
        <a key={item.path} href={item.path} onClick={onLinkClick}>
          {item.label}
        </a>
      ))}
    </nav>
  ),
}));

import { Header } from './Header';

function renderHeader() {
  return render(<Header />);
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the brand name "Aidas Kriščiūnas"', () => {
    renderHeader();

    const brand = screen.getByText('Aidas Kriščiūnas');
    expect(brand).toBeInTheDocument();
  });

  it('renders desktop navigation with correct links', () => {
    renderHeader();

    const nav = screen.getByTestId('nav-desktop');
    expect(nav).toBeInTheDocument();

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    renderHeader();

    const toggles = screen.getAllByTestId('theme-toggle');
    expect(toggles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a mobile hamburger menu button', () => {
    renderHeader();

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('shows mobile navigation when hamburger is clicked', async () => {
    const user = userEvent.setup();
    renderHeader();

    // Mobile nav should not be visible initially
    expect(screen.queryByTestId('nav-mobile')).not.toBeInTheDocument();

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    expect(screen.getByTestId('nav-mobile')).toBeInTheDocument();
  });

  it('hides mobile navigation when hamburger is clicked again', async () => {
    const user = userEvent.setup();
    renderHeader();

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);
    expect(screen.getByTestId('nav-mobile')).toBeInTheDocument();

    await user.click(menuButton);
    expect(screen.queryByTestId('nav-mobile')).not.toBeInTheDocument();
  });

  it('closes mobile nav when a link is clicked', async () => {
    const user = userEvent.setup();
    renderHeader();

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);
    expect(screen.getByTestId('nav-mobile')).toBeInTheDocument();

    // Scope query to mobile nav only
    const mobileNav = screen.getByTestId('nav-mobile');
    const aboutLink = mobileNav.querySelector('a[href="/about"]');
    expect(aboutLink).toBeInTheDocument();
    await user.click(aboutLink!);

    expect(screen.queryByTestId('nav-mobile')).not.toBeInTheDocument();
  });

  it('has sticky positioning with backdrop blur styling', () => {
    renderHeader();

    const header = screen.getByRole('banner');
    // Check that the header has the sticky class
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('backdrop-blur');
  });

  it('hides hamburger button on desktop (md:hidden)', () => {
    renderHeader();

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton.className).toContain('md:hidden');
  });

  it('hides desktop navigation on mobile (hidden md:flex)', () => {
    renderHeader();

    const desktopNav = screen.getByTestId('nav-desktop');
    // The parent wrapper should have the hidden md:flex class
    const wrapper = desktopNav.parentElement;
    expect(wrapper?.className).toContain('hidden md:flex');
  });
});
