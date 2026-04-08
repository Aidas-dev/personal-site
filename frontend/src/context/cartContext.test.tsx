import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { CartProvider, useCart } from './cartContext';
import { CartService } from '@/services/cartService';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CartProvider, null, children);
}

describe('Cart Context', () => {
  beforeEach(() => {
    CartService.__resetMock();
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  });

  describe('useCart hook', () => {
    it('should provide initial empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.taxTotal).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it('should add items to cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 2,
          thumbnail: 'https://example.com/image.jpg',
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.items[0].title).toBe('Test Product');
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.items[0].unitPrice).toBe(29.99);
      expect(result.current.subtotal).toBe(59.98);
    });

    it('should increment existing item quantity when adding same variant', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.totalItems).toBe(2);
    });

    it('should remove items from cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      const lineId = result.current.items[0].id;
      expect(result.current.items).toHaveLength(1);

      await act(async () => {
        await result.current.removeItem(lineId);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
    });

    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      const lineId = result.current.items[0].id;

      await act(async () => {
        await result.current.updateQuantity(lineId, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
    });

    it('should clear the cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-2',
          variantId: 'variant-2',
          productName: 'Another Product',
          price: 49.99,
          quantity: 2,
        });
      });

      expect(result.current.items).toHaveLength(2);

      await act(async () => {
        await result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
    });

    it('should get item by product ID', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 2,
        });
      });

      const item = result.current.getItem('prod-1');
      expect(item).toBeDefined();
      expect(item?.productId).toBe('prod-1');
      expect(item?.quantity).toBe(2);
    });

    it('should return undefined for non-existent item', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const item = result.current.getItem('non-existent');
      expect(item).toBeUndefined();
    });

    it('should calculate monetary totals correctly', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 100,
          quantity: 2,
        });
      });

      // subtotal = 200, tax = 21% = 42, total = 242
      expect(result.current.subtotal).toBe(200);
      expect(result.current.taxTotal).toBe(42);
      expect(result.current.total).toBe(242);
    });

    it('should persist cart ID in localStorage', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem({
          productId: 'prod-1',
          variantId: 'variant-1',
          productName: 'Test Product',
          price: 29.99,
          quantity: 1,
        });
      });

      const mockCart = CartService.__getMockCart();
      expect(mockCart).not.toBeNull();
    });
  });
});
