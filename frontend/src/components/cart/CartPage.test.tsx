import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { CartProvider } from '@/context/cartContext';
import { CartService } from '@/services/cartService';
import { CartPage } from '@/components/cart/CartPage';

// Mock the router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, onClick }: { children: React.ReactNode; to: string; className?: string; onClick?: () => void }) => (
    <a href={to} className={className} onClick={onClick} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
  createFileRoute: () => ({ component: () => null }),
}));

describe('Cart Components', () => {
  beforeEach(() => {
    CartService.__resetMock();
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  });

  describe('CartPage', () => {
    it('should show empty state when cart is empty', async () => {
      render(<CartPage />, { wrapper: CartProvider });

      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      });
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('should render cart items when cart has items', async () => {
      // 1. Create cart and pre-populate it
      const cart = await CartService.createCart();
      await act(async () => {
        await CartService.addLineItem(cart.id, {
          variantId: 'prod-hydraulic-disc-brake',
          quantity: 2,
          productId: 'prod-hydraulic-disc-brake',
          title: 'Hydraulic Disc Brake Set',
          unitPrice: 89.99,
          thumbnail: 'https://placehold.co/600x400/2d5a3d/ffffff?text=Brake',
        });
      });

      // 2. Store the cart ID in localStorage so CartProvider fetches it
      localStorage.setItem('medusa_cart_id', cart.id);

      // 3. Now render — CartProvider will fetch the pre-populated cart
      render(<CartPage />, { wrapper: CartProvider });

      await waitFor(() => {
        expect(screen.getByText(/Hydraulic Disc Brake/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });
  });
});
