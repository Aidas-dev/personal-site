import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryList } from './CategoryList';
import type { Category } from '@/types';

const mockCategories: Category[] = [
  { id: 'cat-bike-parts', name: 'Bike Parts', slug: 'bike-parts', description: 'Bike components', productCount: 10 },
  { id: 'cat-parking', name: 'Parking Solutions', slug: 'parking-solutions', description: 'Parking', productCount: 9 },
  { id: 'cat-brakes', name: 'Brakes', slug: 'brakes', parentId: 'cat-bike-parts', description: 'Brake systems', productCount: 2 },
  { id: 'cat-gears', name: 'Gears', slug: 'gears', parentId: 'cat-bike-parts', description: 'Gears', productCount: 2 },
  { id: 'cat-stands', name: 'Bike Stands', slug: 'bike-stands', parentId: 'cat-parking', description: 'Stands', productCount: 3 },
];

describe('CategoryList', () => {
  it('should render root categories', () => {
    render(<CategoryList categories={mockCategories} />);
    expect(screen.getByText('Bike Parts')).toBeInTheDocument();
    expect(screen.getByText('Parking Solutions')).toBeInTheDocument();
  });

  it('should render child categories under their parent', () => {
    render(<CategoryList categories={mockCategories} />);
    expect(screen.getByText('Brakes')).toBeInTheDocument();
    expect(screen.getByText('Gears')).toBeInTheDocument();
    expect(screen.getByText('Bike Stands')).toBeInTheDocument();
  });

  it('should highlight the active category', () => {
    render(<CategoryList categories={mockCategories} activeCategoryId="cat-brakes" />);
    const activeItem = screen.getByText('Brakes').closest('[role="button"]');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('should display product counts for root categories', () => {
    render(<CategoryList categories={mockCategories} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('should call onCategoryClick when a category is clicked', () => {
    const onCategoryClick = vi.fn();
    render(<CategoryList categories={mockCategories} onCategoryClick={onCategoryClick} />);
    const brakeButton = screen.getByText('Brakes').closest('[role="button"]');
    brakeButton?.click();
    expect(onCategoryClick).toHaveBeenCalledWith('cat-brakes');
  });

  it('should expand/collapse parent categories on click', () => {
    render(<CategoryList categories={mockCategories} />);
    const parentButton = screen.getByText('Bike Parts').closest('button');
    // Initially children should be visible (expanded by default)
    expect(screen.getByText('Brakes')).toBeInTheDocument();
  });

  it('should not show child counts for root categories without children', () => {
    const singleCategory: Category[] = [
      { id: 'cat-1', name: 'Single', slug: 'single', description: 'No children', productCount: 5 },
    ];
    render(<CategoryList categories={singleCategory} />);
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should be empty when no categories provided', () => {
    const { container } = render(<CategoryList categories={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
