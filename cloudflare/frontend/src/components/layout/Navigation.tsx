import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';

export interface NavItem {
  label: string;
  path: string;
}

interface NavigationProps {
  items: NavItem[];
  variant?: 'desktop' | 'mobile';
  onLinkClick?: () => void;
}

export function Navigation({
  items,
  variant = 'desktop',
  onLinkClick,
}: NavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isDesktop = variant === 'desktop';

  const linkBaseClasses = isDesktop
    ? 'font-medium transition-colors'
    : 'font-medium py-2 transition-colors';

  function getLinkClass(path: string): string {
    const isActive = currentPath === path;
    if (isDesktop) {
      return isActive
        ? `${linkBaseClasses} text-primary-500 dark:text-primary-400`
        : `${linkBaseClasses} text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400`;
    }
    return isActive
      ? `${linkBaseClasses} text-primary-500 dark:text-primary-400`
      : `${linkBaseClasses} text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400`;
  }

  const handleClick = () => {
    if (!isDesktop && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav
      className={
        isDesktop
          ? 'flex items-center gap-6'
          : 'flex flex-col gap-3'
      }
      aria-label={isDesktop ? 'Main navigation' : 'Mobile navigation'}
    >
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={getLinkClass(item.path)}
          data-active={currentPath === item.path ? 'true' : undefined}
          onClick={handleClick}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
