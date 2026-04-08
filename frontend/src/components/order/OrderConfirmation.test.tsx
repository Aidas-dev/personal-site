import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import type { Order } from '@/types';
import { OrderConfirmation } from '@/components/order/OrderConfirmation';

// Mock the router Link component
const mockNavigate = vi.fn();
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
  useNavigate: () => mockNavigate,
}));

describe('OrderConfirmation', () => {
  function createMockOrder(overrides?: Partial<Order>): Order {
    return {
      id: 'order-123',
      displayId: 4567,
      email: 'test@example.com',
      items: [
        {
          id: 'line-1',
          productId: 'prod-1',
          variantId: 'variant-1',
          title: 'Hydraulic Disc Brake Set',
          thumbnail: 'https://placehold.co/600x400/2d5a3d/ffffff?text=Brake',
          quantity: 2,
          unitPrice: 89.99,
          total: 179.98,
        },
        {
          id: 'line-2',
          productId: 'prod-2',
          variantId: 'variant-2',
          title: 'Bicycle Chain',
          thumbnail: 'https://placehold.co/600x400/3d5a2d/ffffff?text=Chain',
          quantity: 1,
          unitPrice: 24.99,
          total: 24.99,
        },
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address1: '123 Test Street',
        address2: 'Apt 4B',
        city: 'Vilnius',
        postalCode: '01101',
        country: 'Lithuania',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        address1: '123 Test Street',
        city: 'Vilnius',
        postalCode: '01101',
        country: 'Lithuania',
      },
      shippingMethods: [
        { id: 'standard', name: 'Standard Shipping', price: 4.99 },
      ],
      paymentMethod: 'pp_stripe_stripe',
      subtotal: 204.97,
      taxTotal: 43.04,
      shippingTotal: 4.99,
      total: 253.0,
      status: 'completed',
      createdAt: '2024-06-15T10:30:00.000Z',
      ...overrides,
    };
  }

  it('should render success heading and order number', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('#4567')).toBeInTheDocument();
  });

  it('should render order date', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('15 June 2024')).toBeInTheDocument();
  });

  it('should render all order items with details', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Hydraulic Disc Brake Set')).toBeInTheDocument();
    expect(screen.getByText('Bicycle Chain')).toBeInTheDocument();
    expect(screen.getByText(/Qty: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Qty: 1/)).toBeInTheDocument();
    expect(screen.getAllByText('€179.98')).toHaveLength(1);
    expect(screen.getAllByText(/€24\.99/)).toHaveLength(2); // "Qty: 1 × €24.99" + total
  });

  it('should render shipping address', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getAllByText('John Doe')).toHaveLength(2); // shipping + billing
    expect(screen.getAllByText('123 Test Street')).toHaveLength(2);
    expect(screen.getByText('Apt 4B')).toBeInTheDocument();
    expect(screen.getAllByText('Vilnius 01101')).toHaveLength(2);
    expect(screen.getAllByText('Lithuania')).toHaveLength(2);
  });

  it('should render billing address', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    const addresses = screen.getAllByText('123 Test Street');
    expect(addresses).toHaveLength(2); // Both shipping and billing
  });

  it('should render shipping method with cost', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Standard Shipping')).toBeInTheDocument();
    expect(screen.getAllByText('€4.99')).toHaveLength(2); // shipping method + cost breakdown
  });

  it('should render payment method and amount charged', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Credit/Debit Card (Stripe)')).toBeInTheDocument();
    expect(screen.getByText('€253.00')).toBeInTheDocument();
  });

  it('should render cost breakdown', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getAllByText('€204.97')).toHaveLength(1); // Subtotal
    expect(screen.getAllByText('€4.99')).toHaveLength(2); // Shipping (method + breakdown)
    expect(screen.getAllByText('€43.04')).toHaveLength(1); // Tax
    expect(screen.getAllByText('€253.00')).toHaveLength(1); // Total in summary
  });

  it('should show free shipping when shippingTotal is 0', () => {
    const order = createMockOrder({ shippingTotal: 0, shippingMethods: [] });
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should show Processing status badge for completed orders', () => {
    const order = createMockOrder({ status: 'completed' });
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should show Continue Shopping link', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    const link = screen.getByTestId('link-/products');
    expect(link).toBeInTheDocument();
  });

  it('should show View Order Details link', () => {
    const order = createMockOrder();
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('View Order Details')).toBeInTheDocument();
    const link = screen.getByTestId('link-/account/orders/order-123');
    expect(link).toBeInTheDocument();
  });

  it('should render item placeholder when no thumbnail', () => {
    const order = createMockOrder({
      items: [
        {
          id: 'line-no-img',
          productId: 'prod-3',
          variantId: 'variant-3',
          title: 'No Image Product',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
    });
    render(<OrderConfirmation order={order} />);

    expect(screen.getByText('No Image Product')).toBeInTheDocument();
  });
});
