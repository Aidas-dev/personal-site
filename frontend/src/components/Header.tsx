import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Container } from './Container';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-primary-500 hover:text-primary-600 transition-colors">
            <div className="w-8 h-8 bg-primary-500 rounded" />
            <span className="text-xl font-bold text-primary-900">Portfolio</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link
              to="/about"
              className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              to="/projects"
              className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
            >
              Projects
            </Link>
            <Link
              to="/dashboard"
              className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
            >
              Dashboard
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-primary-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-neutral-200" aria-label="Mobile navigation">
            <div className="flex flex-col gap-3">
              <Link
                to="/about"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/projects"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/dashboard"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
