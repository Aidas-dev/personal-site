import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from '@/services/cartService';

describe('CartService', () => {
  beforeEach(() => {
    CartService.__resetMock();
  });

  describe('createCart', () => {
    it('should create a new cart with empty items', async () => {
      const cart = await CartService.createCart();

      expect(cart).toBeDefined();
      expect(cart.id).toBeDefined();
      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(0);
      expect(cart.taxTotal).toBe(0);
      expect(cart.total).toBe(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.region.currencyCode).toBe('EUR');
    });
  });

  describe('getCart', () => {
    it('should return null for non-existent cart', async () => {
      const cart = await CartService.getCart('non-existent-id');
      expect(cart).toBeNull();
    });

    it('should return cart by ID', async () => {
      const created = await CartService.createCart();
      const fetched = await CartService.getCart(created.id);

      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
    });
  });

  describe('addLineItem', () => {
    it('should add a new line item to cart', async () => {
      const cart = await CartService.createCart();
      const updated = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0].variantId).toBe('variant-1');
      expect(updated.items[0].quantity).toBe(2);
      expect(updated.items[0].unitPrice).toBe(29.99);
      expect(updated.items[0].total).toBe(59.98);
      expect(updated.subtotal).toBe(59.98);
    });

    it('should increment quantity for existing variant', async () => {
      const cart = await CartService.createCart();
      let updated = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      updated = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 3,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0].quantity).toBe(5);
      expect(updated.items[0].total).toBe(149.95);
    });

    it('should throw error for non-existent cart', async () => {
      await expect(
        CartService.addLineItem('non-existent', {
          variantId: 'v1',
          quantity: 1,
          productId: 'p1',
          title: 'Test',
          unitPrice: 10,
        }),
      ).rejects.toThrow('Cart not found');
    });
  });

  describe('updateLineItem', () => {
    it('should update line item quantity', async () => {
      const cart = await CartService.createCart();
      const withItem = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      const lineId = withItem.items[0].id;
      const updated = await CartService.updateLineItem(cart.id, lineId, {
        quantity: 5,
      });

      expect(updated.items[0].quantity).toBe(5);
      expect(updated.items[0].total).toBe(149.95);
    });

    it('should remove item when quantity is 0 or less', async () => {
      const cart = await CartService.createCart();
      const withItem = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      const lineId = withItem.items[0].id;
      const updated = await CartService.updateLineItem(cart.id, lineId, {
        quantity: 0,
      });

      expect(updated.items).toHaveLength(0);
    });
  });

  describe('deleteLineItem', () => {
    it('should remove a line item from cart', async () => {
      const cart = await CartService.createCart();
      const withItem = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 29.99,
      });

      const lineId = withItem.items[0].id;
      const updated = await CartService.deleteLineItem(cart.id, lineId);

      expect(updated.items).toHaveLength(0);
      expect(updated.subtotal).toBe(0);
      expect(updated.total).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      const cart = await CartService.createCart();
      await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 1,
        productId: 'prod-1',
        title: 'Product 1',
        unitPrice: 10,
      });
      await CartService.addLineItem(cart.id, {
        variantId: 'variant-2',
        quantity: 2,
        productId: 'prod-2',
        title: 'Product 2',
        unitPrice: 20,
      });

      const cleared = await CartService.clearCart(cart.id);

      expect(cleared.items).toHaveLength(0);
      expect(cleared.subtotal).toBe(0);
      expect(cleared.total).toBe(0);
    });
  });

  describe('monetary calculations', () => {
    it('should calculate correct totals with tax', async () => {
      const cart = await CartService.createCart();
      const updated = await CartService.addLineItem(cart.id, {
        variantId: 'variant-1',
        quantity: 2,
        productId: 'prod-1',
        title: 'Test Product',
        unitPrice: 100,
      });

      // subtotal = 200, tax = 21% = 42, total = 242
      expect(updated.subtotal).toBe(200);
      expect(updated.taxTotal).toBe(42);
      expect(updated.total).toBe(242);
      expect(updated.itemCount).toBe(2);
    });
  });
});
