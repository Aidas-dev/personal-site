import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { OrderService } from '@/services/orderService';
import { CartProvider } from '@/context/cartContext';
import { OrderDetail } from '@/components/order/OrderDetail';
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
  useParams: ({ from: _from }: { from: string }) => ({ id: 'order-detail-1' }),
}));

// Mock CartProvider's useCart
const mockAddItem = vi.fn().mockResolvedValue(undefined);
vi.mock('@/context/cartContext', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    CartProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useCart: () => ({
      addItem: mockAddItem,
    }),
  };
});

describe('OrderDetail', () => {
  beforeEach(() => {
    OrderService.__resetMock();
    mockAddItem.mockClear();
  });

  function createMockOrder(overrides?: Partial<Order>): Order {
    return {
      id: 'order-detail-1',
      displayId: 4567,
      email: 'test@example.com',
      items: [
        {
          id: 'line-1',
          productId: 'prod-1',
          variantId: 'variant-1',
          title: 'Hydraulic Disc Brake Set',
          thumbnail: 'https://placehold.co/600x400/2d5a3d/ffffff?text=Brake',
          sku: 'HDB-001',
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
          sku: 'BC-002',
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
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'billing@example.com',
        address1: '456 Billing Ave',
        city: 'Kaunas',
        postalCode: '44001',
        country: 'Lithuania',
      },
      shippingMethods: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          price: 4.99,
          estimatedDelivery: '3-5 business days',
        },
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

  it('should show loading state initially', () => {
    render(<OrderDetail orderId="order-detail-1" />);
    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
  });

  it('should render order details when order exists', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Hydraulic Disc Brake Set')).toBeInTheDocument();
    expect(screen.getByText('Bicycle Chain')).toBeInTheDocument();
    expect(screen.getByText(/15 June 2024/)).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should render items table with SKU', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByText('HDB-001')).toBeInTheDocument();
    });
    expect(screen.getByText('BC-002')).toBeInTheDocument();
  });

  it('should render item quantities and prices', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    // Quantities
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Prices exist somewhere in the document
    expect(screen.getAllByText(/€89\.99/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/€24\.99/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/€179\.98/).length).toBeGreaterThan(0);
  });

  it('should render shipping address', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Test Street')).toBeInTheDocument();
    expect(screen.getByText('Apt 4B')).toBeInTheDocument();
    expect(screen.getByText('Vilnius 01101')).toBeInTheDocument();
  });

  it('should render billing address', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('456 Billing Ave')).toBeInTheDocument();
    expect(screen.getByText('Kaunas 44001')).toBeInTheDocument();
  });

  it('should render shipping method with estimated delivery', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Standard Shipping')).toBeInTheDocument();
    expect(screen.getByText(/Est\. delivery:/)).toBeInTheDocument();
  });

  it('should render payment method and amount', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Credit/Debit Card (Stripe)')).toBeInTheDocument();
    expect(screen.getAllByText(/€253\.00/).length).toBeGreaterThan(0);
  });

  it('should render cost breakdown', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('€204.97')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText('€4.99')).toBeInTheDocument(); // Shipping
    expect(screen.getByText('€43.04')).toBeInTheDocument(); // Tax
  });

  it('should show free shipping when shippingTotal is 0', async () => {
    const order = createMockOrder({
      shippingTotal: 0,
      shippingMethods: [],
    });
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should show error state when order not found', async () => {
    render(<OrderDetail orderId="non-existent-order" />);

    await waitFor(() => {
      expect(screen.getAllByText(/Order Not Found/).length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Back to Orders')).toBeInTheDocument();
  });

  it('should show reorder button', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    expect(screen.getByText('Reorder All Items')).toBeInTheDocument();
  });

  it('should call addItem for each item when reorder is clicked', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText('Reorder All Items').click();
    });

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledTimes(2);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        productName: 'Hydraulic Disc Brake Set',
        quantity: 2,
        price: 89.99,
      }),
    );
  });

  it('should show success message after reorder', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText('Reorder All Items').click();
    });

    await waitFor(() => {
      expect(screen.getByText(/All items have been added to your cart/)).toBeInTheDocument();
    });
  });

  it('should render breadcrumb navigation', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      // Check that the order heading is rendered (confirms order is loaded)
      expect(screen.getAllByText(/Order #4567/).length).toBeGreaterThan(0);
    });
  });

  it('should render Back to Orders link', async () => {
    const order = createMockOrder();
    OrderService.storeOrderInMock(order);

    render(<OrderDetail orderId="order-detail-1" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #4567/ })).toBeInTheDocument();
    });

    const backLink = screen.getByTestId('link-/account/orders');
    expect(backLink).toBeInTheDocument();
  });
});
