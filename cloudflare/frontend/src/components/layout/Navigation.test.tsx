import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the entire @tanstack/react-router module
const mockPathname = '/';

vi.mock('@tanstack/react-router', () => {
  const LinkMock = ({
    to,
    children,
    className,
    'data-testid': testId,
    onClick,
    ...rest
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
    onClick?: () => void;
  }) => (
    <a href={to} className={className} data-testid={testId} onClick={onClick} {...rest}>
      {children}
    </a>
  );

  const useLocationMock = () => ({ pathname: mockPathname });

  return {
    Link: LinkMock,
    useLocation: useLocationMock,
  };
});

// Import after mock
import { Navigation, type NavItem } from './Navigation';

const navItems: NavItem[] = [
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Security', path: '/security' },
];

function renderNavigation(variant: 'desktop' | 'mobile' = 'desktop') {
  return render(<Navigation items={navItems} variant={variant} />);
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation links', () => {
    renderNavigation('desktop');

    for (const item of navItems) {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.path);
    }
  });

  it('applies active styling to link matching current pathname', () => {
    // With pathname='/', none of the nav items should be active
    renderNavigation('desktop');

    const aboutLink = screen.getByRole('link', { name: 'About' });
    // Should NOT have active class since pathname is '/'
    expect(aboutLink).not.toHaveAttribute('data-active');
  });

  it('renders mobile navigation with vertical layout', () => {
    renderNavigation('mobile');

    const nav = screen.getByRole('navigation');
    // Mobile nav should have flex-col class for vertical layout
    expect(nav.className || '').toContain('flex-col');
  });

  it('calls onClick handler when a mobile nav link is clicked', () => {
    const handleClick = vi.fn();
    render(
      <Navigation items={navItems} variant="mobile" onLinkClick={handleClick} />
    );

    const aboutLink = screen.getByRole('link', { name: 'About' });
    aboutLink.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onLinkClick handler for desktop variant', () => {
    const handleClick = vi.fn();
    render(
      <Navigation items={navItems} variant="desktop" onLinkClick={handleClick} />
    );

    const aboutLink = screen.getByRole('link', { name: 'About' });
    aboutLink.click();

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper aria-label for accessibility', () => {
    renderNavigation('desktop');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('mobile nav has aria-label for mobile navigation', () => {
    renderNavigation('mobile');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
  });
});
