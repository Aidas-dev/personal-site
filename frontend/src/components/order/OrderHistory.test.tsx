import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { OrderService } from '@/services/orderService';
import { OrderHistory } from '@/components/order/OrderHistory';
import type { Order } from '@/types';

// Mock the router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
    params?: Record<string, string>;
  }) => {
    const href = params
      ? to.replace(/\$([^/]+)/g, (_, key) => params[key] ?? key)
      : to;
    return (
      <a href={href} className={className} data-testid={`link-${href}`}>
        {children}
      </a>
    );
  },
}));

describe('OrderHistory', () => {
  beforeEach(() => {
    OrderService.__resetMock();
  });

  function createMockOrder(overrides?: Partial<Order>): Order {
    return {
      id: `order-${Date.now()}`,
      displayId: Math.floor(1000 + Math.random() * 9000),
      email: 'test@example.com',
      items: [
        {
          id: 'line-1',
          productId: 'prod-1',
          variantId: 'variant-1',
          title: 'Test Product',
          quantity: 1,
          unitPrice: 29.99,
          total: 29.99,
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
      subtotal: 29.99,
      taxTotal: 6.3,
      shippingTotal: 4.99,
      total: 41.28,
      status: 'completed',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  it('should show loading state initially', () => {
    render(<OrderHistory />);
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });

  it('should show empty state when no orders exist', async () => {
    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('should render a list of orders', async () => {
    const order1 = createMockOrder({
      id: 'order-1',
      displayId: 1001,
      createdAt: '2024-06-01T00:00:00.000Z',
      total: 50.0,
      items: [{ id: 'line-1', productId: 'p1', variantId: 'v1', title: 'Item 1', quantity: 1, unitPrice: 50, total: 50 }],
    });
    const order2 = createMockOrder({
      id: 'order-2',
      displayId: 1002,
      createdAt: '2024-06-02T00:00:00.000Z',
      total: 75.0,
      items: [
        { id: 'line-2', productId: 'p2', variantId: 'v2', title: 'Item 2', quantity: 2, unitPrice: 37.5, total: 75 },
      ],
    });
    OrderService.storeOrderInMock(order1);
    OrderService.storeOrderInMock(order2);

    render(<OrderHistory />);

    await waitFor(() => {
      // Wait for orders to load (400ms delay + rendering)
      expect(screen.getAllByTestId('link-/account/orders/order-1').length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    expect(screen.getAllByTestId('link-/account/orders/order-2').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/€50\.00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/€75\.00/).length).toBeGreaterThan(0);
  });

  it('should render status badges for orders', async () => {
    const order = createMockOrder({
      id: 'order-status',
      status: 'completed',
    });
    OrderService.storeOrderInMock(order);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getAllByText(/Processing/).length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should show correct item count', async () => {
    const order = createMockOrder({
      id: 'order-items',
      items: [
        { id: 'line-1', productId: 'p1', variantId: 'v1', title: 'Item 1', quantity: 1, unitPrice: 10, total: 10 },
        { id: 'line-2', productId: 'p2', variantId: 'v2', title: 'Item 2', quantity: 3, unitPrice: 20, total: 60 },
      ],
    });
    OrderService.storeOrderInMock(order);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  it('should render order date', async () => {
    const order = createMockOrder({
      id: 'order-date',
      createdAt: '2024-06-15T10:30:00.000Z',
    });
    OrderService.storeOrderInMock(order);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getAllByText(/15 Jun 2024/).length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should link to order detail page', async () => {
    const order = createMockOrder({ id: 'order-link-test', displayId: 9999 });
    OrderService.storeOrderInMock(order);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getAllByTestId('link-/account/orders/order-link-test').length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should filter orders by email', async () => {
    const order1 = createMockOrder({ id: 'order-email-1', email: 'user1@test.com' });
    const order2 = createMockOrder({ id: 'order-email-2', email: 'user2@test.com' });
    OrderService.storeOrderInMock(order1);
    OrderService.storeOrderInMock(order2);

    render(<OrderHistory email="user1@test.com" />);

    await waitFor(() => {
      const order1Links = screen.getAllByTestId('link-/account/orders/order-email-1');
      expect(order1Links.length).toBeGreaterThan(0);
    });
    // order2 should not appear
    expect(screen.queryByTestId('link-/account/orders/order-email-2')).not.toBeInTheDocument();
  });
});
