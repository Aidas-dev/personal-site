import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Navigation, type NavItem } from './Navigation';

const navItems: NavItem[] = [
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Security', path: '/security' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md bg-neutral-50/80 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded hexagon" />
            <span className="text-xl font-bold">Aidas Kriščiūnas</span>
          </Link>

          {/* Desktop Navigation + Theme Toggle */}
          <div className="hidden md:flex items-center gap-6">
            <Navigation items={navItems} variant="desktop" />
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-800">
            <Navigation
              items={navItems}
              variant="mobile"
              onLinkClick={handleLinkClick}
            />
          </div>
        )}
      </div>
    </header>
  );
}
