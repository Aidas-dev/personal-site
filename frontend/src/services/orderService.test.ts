import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '@/services/orderService';
import type { Order } from '@/types';

describe('OrderService', () => {
  beforeEach(() => {
    OrderService.__resetMock();
  });

  function createMockOrder(overrides?: Partial<Order>): Order {
    return {
      id: `order_${Date.now()}`,
      displayId: Math.floor(1000 + Math.random() * 9000),
      email: 'test@example.com',
      items: [
        {
          id: 'line-1',
          productId: 'prod-1',
          variantId: 'variant-1',
          title: 'Test Product',
          quantity: 2,
          unitPrice: 29.99,
          total: 59.98,
        },
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address1: '123 Test St',
        city: 'Vilnius',
        postalCode: '01101',
        country: 'Lithuania',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address1: '123 Test St',
        city: 'Vilnius',
        postalCode: '01101',
        country: 'Lithuania',
      },
      shippingMethods: [
        { id: 'standard', name: 'Standard Shipping', price: 4.99 },
      ],
      paymentMethod: 'pp_stripe_stripe',
      subtotal: 59.98,
      taxTotal: 12.6,
      shippingTotal: 4.99,
      total: 77.57,
      status: 'completed',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  describe('storeOrderInMock', () => {
    it('should store an order in localStorage', () => {
      const order = createMockOrder();
      OrderService.storeOrderInMock(order);

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(order.id);
    });

    it('should update an existing order with the same ID', () => {
      const order1 = createMockOrder({ id: 'order-1' });
      const order2 = createMockOrder({ id: 'order-1', status: 'shipped' });

      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(1);
      expect(stored[0].status).toBe('shipped');
    });

    it('should store multiple orders', () => {
      const order1 = createMockOrder({ id: 'order-1' });
      const order2 = createMockOrder({ id: 'order-2' });
      const order3 = createMockOrder({ id: 'order-3' });

      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);
      OrderService.storeOrderInMock(order3);

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(3);
    });
  });

  describe('removeOrderFromMock', () => {
    it('should remove an order by ID', () => {
      const order = createMockOrder({ id: 'order-1' });
      OrderService.storeOrderInMock(order);
      OrderService.removeOrderFromMock('order-1');

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(0);
    });

    it('should not affect other orders when removing', () => {
      const order1 = createMockOrder({ id: 'order-1' });
      const order2 = createMockOrder({ id: 'order-2' });
      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);

      OrderService.removeOrderFromMock('order-1');

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('order-2');
    });
  });

  describe('getOrder', () => {
    it('should return null for non-existent order', async () => {
      const order = await OrderService.getOrder('non-existent-id');
      expect(order).toBeNull();
    });

    it('should return a stored order by ID', async () => {
      const order = createMockOrder({ id: 'order-123' });
      OrderService.storeOrderInMock(order);

      const fetched = await OrderService.getOrder('order-123');
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe('order-123');
      expect(fetched?.email).toBe('test@example.com');
      expect(fetched?.items).toHaveLength(1);
    });

    it('should return full order details', async () => {
      const order = createMockOrder({
        id: 'order-full',
        displayId: 5678,
        email: 'full@test.com',
        status: 'completed',
        items: [
          {
            id: 'line-1',
            productId: 'prod-1',
            variantId: 'variant-1',
            title: 'Product 1',
            quantity: 1,
            unitPrice: 100,
            total: 100,
          },
          {
            id: 'line-2',
            productId: 'prod-2',
            variantId: 'variant-2',
            title: 'Product 2',
            quantity: 3,
            unitPrice: 25,
            total: 75,
          },
        ],
      });
      OrderService.storeOrderInMock(order);

      const fetched = await OrderService.getOrder('order-full');
      expect(fetched).not.toBeNull();
      expect(fetched?.displayId).toBe(5678);
      expect(fetched?.email).toBe('full@test.com');
      expect(fetched?.items).toHaveLength(2);
      expect(fetched?.status).toBe('completed');
    });
  });

  describe('listOrders', () => {
    it('should return empty list when no orders exist', async () => {
      const result = await OrderService.listOrders();
      expect(result.orders).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should return all orders sorted by createdAt descending', async () => {
      const order1 = createMockOrder({
        id: 'order-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      const order2 = createMockOrder({
        id: 'order-2',
        createdAt: '2024-06-01T00:00:00.000Z',
      });
      const order3 = createMockOrder({
        id: 'order-3',
        createdAt: '2024-03-01T00:00:00.000Z',
      });
      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);
      OrderService.storeOrderInMock(order3);

      const result = await OrderService.listOrders();
      expect(result.orders).toHaveLength(3);
      expect(result.count).toBe(3);
      // Sorted by createdAt descending
      expect(result.orders[0].id).toBe('order-2');
      expect(result.orders[1].id).toBe('order-3');
      expect(result.orders[2].id).toBe('order-1');
    });

    it('should filter orders by email', async () => {
      const order1 = createMockOrder({ id: 'order-1', email: 'user1@test.com' });
      const order2 = createMockOrder({ id: 'order-2', email: 'user2@test.com' });
      const order3 = createMockOrder({ id: 'order-3', email: 'user1@test.com' });
      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);
      OrderService.storeOrderInMock(order3);

      const result = await OrderService.listOrders({ email: 'user1@test.com' });
      expect(result.orders).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.orders.every((o) => o.email === 'user1@test.com')).toBe(true);
    });

    it('should paginate results with offset and limit', async () => {
      for (let i = 1; i <= 15; i++) {
        const order = createMockOrder({
          id: `order-${i}`,
          createdAt: `2024-01-${String(i).padStart(2, '0')}T00:00:00.000Z`,
        });
        OrderService.storeOrderInMock(order);
      }

      // First page
      const page1 = await OrderService.listOrders({ offset: 0, limit: 10 });
      expect(page1.orders).toHaveLength(10);
      expect(page1.count).toBe(15);

      // Second page
      const page2 = await OrderService.listOrders({ offset: 10, limit: 10 });
      expect(page2.orders).toHaveLength(5);
      expect(page2.count).toBe(15);
    });
  });

  describe('__resetMock', () => {
    it('should clear all stored orders', () => {
      const order1 = createMockOrder({ id: 'order-1' });
      const order2 = createMockOrder({ id: 'order-2' });
      OrderService.storeOrderInMock(order1);
      OrderService.storeOrderInMock(order2);

      OrderService.__resetMock();

      const stored = OrderService.__getMockOrders();
      expect(stored).toHaveLength(0);
    });
  });
});
