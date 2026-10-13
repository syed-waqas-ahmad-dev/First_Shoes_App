/**
 * @file lib/formatters/date.ts
 * @description Format timestamps and delivery estimates for Pakistani customers.
 * Strict TypeScript: ZERO `any`.
 */

export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getEstimatedDeliveryRange(daysMin = 2, daysMax = 4): string {
  const now = new Date();
  const minDate = new Date(now.getTime() + daysMin * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + daysMax * 24 * 60 * 60 * 1000);

  const minStr = minDate.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  const maxStr = maxDate.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });

  return `${minStr} – ${maxStr}`;
}
