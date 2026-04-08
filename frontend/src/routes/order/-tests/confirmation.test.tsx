import { describe, it, expect } from 'vitest';

describe('Order Confirmation Route', () => {
  it('should be importable without errors', async () => {
    const routeModule = await import('@/routes/order/confirmation');
    expect(routeModule).toHaveProperty('Route');
  });
});
