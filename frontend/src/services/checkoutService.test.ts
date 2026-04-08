import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService } from '@/services/checkoutService';

describe('CheckoutService', () => {
  beforeEach(() => {
    CheckoutService.__resetMock();
  });

  describe('createPaymentSession', () => {
    it('should create mock payment sessions', async () => {
      const sessions = await CheckoutService.createPaymentSession('cart-1');

      expect(sessions).toBeDefined();
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].id).toContain('cart-1');
    });
  });

  describe('selectPaymentSession', () => {
    it('should select a payment session and return authorized status', async () => {
      const sessions = await CheckoutService.createPaymentSession('cart-1');
      const selected = await CheckoutService.selectPaymentSession(
        'cart-1',
        sessions[0].id,
      );

      expect(selected).toBeDefined();
      expect(selected.status).toBe('authorized');
      expect(selected.id).toBe(sessions[0].id);
    });

    it('should throw error for non-existent session', async () => {
      await CheckoutService.createPaymentSession('cart-1');

      await expect(
        CheckoutService.selectPaymentSession('cart-1', 'non-existent'),
      ).rejects.toThrow('Payment session not found');
    });
  });

  describe('addShippingMethod', () => {
    it('should return standard shipping method', async () => {
      const method = await CheckoutService.addShippingMethod('cart-1', 'standard');

      expect(method).toBeDefined();
      expect(method.name).toBe('Standard Shipping');
      expect(method.price).toBe(4.99);
      expect(method.estimatedDelivery).toBe('3-5 business days');
    });

    it('should return express shipping method', async () => {
      const method = await CheckoutService.addShippingMethod('cart-1', 'express');

      expect(method.name).toBe('Express Shipping');
      expect(method.price).toBe(9.99);
      expect(method.estimatedDelivery).toBe('1-2 business days');
    });

    it('should return free pickup method', async () => {
      const method = await CheckoutService.addShippingMethod('cart-1', 'pickup');

      expect(method.name).toBe('Free Pickup');
      expect(method.price).toBe(0);
      expect(method.estimatedDelivery).toBe('Same day');
    });

    it('should throw error for invalid shipping option', async () => {
      await expect(
        CheckoutService.addShippingMethod('cart-1', 'invalid'),
      ).rejects.toThrow('Shipping option not found');
    });
  });

  describe('updateCart', () => {
    it('should complete without error in mock mode', async () => {
      await expect(
        CheckoutService.updateCart('cart-1', {
          email: 'test@example.com',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('completeCart', () => {
    it('should create a mock order with correct totals', async () => {
      const order = await CheckoutService.completeCart('cart-1', {
        email: 'test@example.com',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          address1: '123 Main St',
          city: 'Vilnius',
          postalCode: '01101',
          country: 'LT',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          address1: '123 Main St',
          city: 'Vilnius',
          postalCode: '01101',
          country: 'LT',
        },
        shippingMethod: {
          id: 'standard',
          name: 'Standard Shipping',
          price: 4.99,
        },
        paymentMethod: 'stripe_card',
        subtotal: 100,
        taxTotal: 21,
        itemCount: 2,
      });

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.displayId).toBeGreaterThan(0);
      expect(order.email).toBe('test@example.com');
      expect(order.status).toBe('completed');
      expect(order.shippingAddress.firstName).toBe('John');
      expect(order.billingAddress.lastName).toBe('Doe');
      expect(order.paymentMethod).toBe('stripe_card');
    });

    it('should calculate correct total with shipping and tax', async () => {
      const order = await CheckoutService.completeCart('cart-1', {
        email: 'test@example.com',
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          address1: 'Test St',
          city: 'Test',
          postalCode: '00000',
          country: 'LT',
        },
        billingAddress: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          address1: 'Test St',
          city: 'Test',
          postalCode: '00000',
          country: 'LT',
        },
        shippingMethod: {
          id: 'standard',
          name: 'Standard Shipping',
          price: 4.99,
        },
        paymentMethod: 'stripe_card',
        subtotal: 100,
        taxTotal: 21,
        itemCount: 1,
      });

      // subtotal: 100, shipping: 4.99, tax: 21 + (4.99 * 0.21) = 21 + 1.05 = 22.05
      // total: 100 + 4.99 + 22.05 = 127.04
      expect(order.subtotal).toBe(100);
      expect(order.shippingTotal).toBe(4.99);
      expect(order.taxTotal).toBe(22.05);
      expect(order.total).toBe(127.04);
    });
  });
});
