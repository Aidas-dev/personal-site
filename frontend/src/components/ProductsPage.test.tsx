import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Product, Category } from '@/types';
import { createElement } from 'react';
import { CartProvider } from '@/context/cartContext';
import { FilterProvider } from '@/context/filterContext';
import { SearchProvider } from '@/context/searchContext';
import { PricingModeProvider } from '@/context/pricingModeContext';

const mockProducts: Product[] = [
  {
    id: 'prod-1', name: 'Hydraulic Disc Brake', description: 'Brake', slug: 'hydraulic-disc-brake',
    categoryId: 'cat-brakes', price: { amount: 89.99, currency: 'EUR' },
    images: [{ url: 'https://example.com/1.jpg', alt: 'Brake' }],
    availability: 'in_stock', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-2', name: 'Bike Stand', description: 'Stand', slug: 'bike-stand',
    categoryId: 'cat-stands', price: { amount: 49.99, currency: 'EUR' },
    images: [{ url: 'https://example.com/2.jpg', alt: 'Stand' }],
    availability: 'low_stock', createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
  },
];

const mockCategories: Category[] = [
  { id: 'cat-bike-parts', name: 'Bike Parts', slug: 'bike-parts', productCount: 1 },
  { id: 'cat-brakes', name: 'Brakes', slug: 'brakes', parentId: 'cat-bike-parts', productCount: 1 },
  { id: 'cat-stands', name: 'Stands', slug: 'stands', parentId: 'cat-bike-parts', productCount: 1 },
];

// Mock services before importing ProductsPage
vi.mock('@/services/productService', () => ({
  ProductService: {
    filter: vi.fn().mockResolvedValue(mockProducts),
  },
}));

vi.mock('@/services/categoryService', () => ({
  CategoryService: {
    getAll: vi.fn().mockResolvedValue(mockCategories),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    createElement(CartProvider, null,
      createElement(FilterProvider, null,
        createElement(SearchProvider, null,
          createElement(PricingModeProvider, null, ui)
        )
      )
    )
  );
}

describe('ProductsPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    const { ProductsPage } = await import('./ProductsPage');
    renderWithProviders(createElement(ProductsPage));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render products after loading', async () => {
    const { ProductsPage } = await import('./ProductsPage');
    renderWithProviders(createElement(ProductsPage));

    await waitFor(() => {
      expect(screen.getByText('Hydraulic Disc Brake')).toBeInTheDocument();
    });
    expect(screen.getByText('Bike Stand')).toBeInTheDocument();
  });

  it('should show search input', async () => {
    const { ProductsPage } = await import('./ProductsPage');
    renderWithProviders(createElement(ProductsPage));

    await waitFor(() => {
      expect(screen.getByLabelText('Search products')).toBeInTheDocument();
    });
  });

  it('should show categories in sidebar', async () => {
    const { ProductsPage } = await import('./ProductsPage');
    renderWithProviders(createElement(ProductsPage));

    await waitFor(() => {
      expect(screen.getByText('Bike Parts')).toBeInTheDocument();
    });
  });

  it('should show error state on failure', async () => {
    const { ProductService } = await import('@/services/productService');
    vi.mocked(ProductService.filter).mockRejectedValueOnce(new Error('API error'));

    const { ProductsPage } = await import('./ProductsPage');
    renderWithProviders(createElement(ProductsPage));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load products/)).toBeInTheDocument();
    });
  });
});
