import { describe, it, expect } from 'vitest';

describe('Order History Route', () => {
  it('should be importable without errors', async () => {
    const routeModule = await import('@/routes/account/orders');
    expect(routeModule).toHaveProperty('Route');
  });
});
