import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('should render a single item', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should render multiple items with separators', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Detail', current: true },
        ]}
      />,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    // Links should be clickable
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should mark current item with aria-current', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Current', current: true },
        ]}
      />,
    );
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
  });

  it('should render navigation separator', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Page', current: true },
        ]}
      />,
    );
    expect(screen.getByText('/')).toBeInTheDocument();
  });
});
