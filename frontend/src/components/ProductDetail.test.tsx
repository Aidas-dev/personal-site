import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Product } from '@/types';
import { createElement } from 'react';
import { CartProvider } from '@/context/cartContext';
import { PricingModeProvider } from '@/context/pricingModeContext';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Hydraulic Disc Brake Set',
  description: 'High-performance hydraulic disc brake set for mountain bikes.',
  slug: 'hydraulic-disc-brake',
  categoryId: 'cat-brakes',
  price: { amount: 89.99, currency: 'EUR', b2bAmount: 72.0 },
  images: [
    { url: 'https://example.com/1.jpg', alt: 'Front view' },
    { url: 'https://example.com/2.jpg', alt: 'Detail view' },
  ],
  availability: 'in_stock',
  sku: 'HDB-2024',
  specs: [
    { key: 'Type', value: 'Hydraulic' },
    { key: 'Weight', value: '350g' },
  ],
  tags: ['mountain', 'hydraulic'],
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-03-20T14:30:00Z',
};

vi.mock('@/services/productService', () => ({
  ProductService: {
    getById: vi.fn().mockResolvedValue(mockProduct),
    getByCategory: vi.fn().mockResolvedValue([mockProduct]),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    createElement(CartProvider, null,
      createElement(PricingModeProvider, null, ui)
    )
  );
}

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product name and description', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText('Hydraulic Disc Brake Set')).toBeInTheDocument();
    });
    expect(screen.getByText(/High-performance hydraulic/)).toBeInTheDocument();
  });

  it('should display B2C price by default', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText(/\u20ac89\.99/)).toBeInTheDocument();
    });
  });

  it('should display B2B price when toggled', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText(/\u20ac89\.99/)).toBeInTheDocument();
    });

    const toggle = screen.getByRole('button', { name: /Switch to B2B/ });
    fireEvent.click(toggle);

    expect(screen.getByText(/\u20ac72\.00/)).toBeInTheDocument();
  });

  it('should render specs table', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Hydraulic')).toBeInTheDocument();
    });
  });

  it('should render image gallery', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show loading state', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show add to cart button with quantity selector', async () => {
    const { ProductDetail } = await import('./ProductDetail');
    renderWithProviders(createElement(ProductDetail, { productId: 'prod-1' }));

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });
});
