import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Product } from '@/types';
import { createElement } from 'react';
import { CartProvider } from '@/context/cartContext';
import { FilterProvider } from '@/context/filterContext';
import { SearchProvider } from '@/context/searchContext';
import { PricingModeProvider } from '@/context/pricingModeContext';

const relatedProducts: Product[] = [
  {
    id: 'rel-1', name: 'Related Product 1', description: 'Desc', slug: 'related-1',
    categoryId: 'cat-brakes', price: { amount: 45, currency: 'EUR' },
    images: [{ url: 'https://example.com/r1.jpg', alt: 'R1' }],
    availability: 'in_stock', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rel-2', name: 'Related Product 2', description: 'Desc', slug: 'related-2',
    categoryId: 'cat-brakes', price: { amount: 65, currency: 'EUR' },
    images: [{ url: 'https://example.com/r2.jpg', alt: 'R2' }],
    availability: 'in_stock', createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
  },
];

vi.mock('@/services/productService', () => ({
  ProductService: {
    getByCategory: vi.fn().mockResolvedValue(relatedProducts),
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

describe('RelatedProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render related products', async () => {
    const { RelatedProducts } = await import('./RelatedProducts');
    renderWithProviders(createElement(RelatedProducts, { categoryId: 'cat-brakes', currentProductId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText('Related Products')).toBeInTheDocument();
    });
    expect(screen.getByText('Related Product 1')).toBeInTheDocument();
  });

  it('should render nothing when no related products', async () => {
    const { ProductService } = await import('@/services/productService');
    vi.mocked(ProductService.getByCategory).mockResolvedValueOnce([]);

    const { RelatedProducts } = await import('./RelatedProducts');
    const { container } = renderWithProviders(
      createElement(RelatedProducts, { categoryId: 'cat-empty', currentProductId: 'prod-1' })
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
