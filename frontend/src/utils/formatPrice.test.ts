import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats Euro amounts correctly', () => {
    expect(formatPrice(19.99, 'EUR')).toBe('€19.99');
    expect(formatPrice(100, 'EUR')).toBe('€100.00');
    expect(formatPrice(0, 'EUR')).toBe('€0.00');
  });

  it('formats other currencies correctly', () => {
    // en-IE locale uses locale-specific currency display
    expect(formatPrice(19.99, 'USD')).toContain('19.99');
    expect(formatPrice(100, 'GBP')).toContain('100.00');
  });

  it('supports custom locale', () => {
    const result = formatPrice(19.99, 'EUR', 'de-DE');
    expect(result).toContain('19,99');
  });
});
