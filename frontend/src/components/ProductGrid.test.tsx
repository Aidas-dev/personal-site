import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from './ProductGrid';
import type { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Test Product 1',
    description: 'A test product',
    slug: 'test-product-1',
    categoryId: 'cat-1',
    price: { amount: 29.99, currency: 'EUR' },
    images: [{ url: 'https://example.com/img1.jpg', alt: 'Product 1' }],
    availability: 'in_stock',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Test Product 2',
    description: 'Another test product',
    slug: 'test-product-2',
    categoryId: 'cat-1',
    price: { amount: 49.99, currency: 'EUR', saleAmount: 39.99 },
    images: [{ url: 'https://example.com/img2.jpg', alt: 'Product 2' }],
    availability: 'in_stock',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

describe('ProductGrid', () => {
  it('should render products in a grid layout', () => {
    render(<ProductGrid products={mockProducts} />);
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('should display product prices', () => {
    render(<ProductGrid products={mockProducts} />);
    expect(screen.getByText(/\u20ac29\.99/)).toBeInTheDocument();
    expect(screen.getByText(/\u20ac49\.99/)).toBeInTheDocument();
  });

  it('should show sale price when available', () => {
    render(<ProductGrid products={mockProducts} />);
    // Should show the sale price (39.99) for product 2
    expect(screen.getByText(/\u20ac39\.99/)).toBeInTheDocument();
  });

  it('should render loading skeleton when loading is true', () => {
    render(<ProductGrid products={[]} isLoading />);
    // Loading skeleton should have status "Loading" or spinner
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render empty state when no products', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('should render responsive grid with correct classes', () => {
    const { container } = render(<ProductGrid products={mockProducts} />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('xl:grid-cols-4');
  });

  it('should display product availability status', () => {
    render(<ProductGrid products={mockProducts} />);
    const availabilityTexts = screen.getAllByText('In Stock');
    expect(availabilityTexts.length).toBe(2);
  });

  it('should render product images with alt text', () => {
    render(<ProductGrid products={mockProducts} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images[0].getAttribute('alt')).toBe('Product 1');
  });
});
