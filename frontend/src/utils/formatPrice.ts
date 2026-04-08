/**
 * Format a monetary amount using Intl.NumberFormat.
 * Defaults to Irish locale (en-IE) for Euro formatting.
 */
export function formatPrice(
  amount: number,
  currency: string,
  locale = 'en-IE',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
