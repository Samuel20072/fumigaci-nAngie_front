import { ExpirationStatus } from '../../core/models/service.model.js';

export function calculateExpirationStatus(expirationDateStr?: string | null): ExpirationStatus {
  if (!expirationDateStr) return ExpirationStatus.NO_DATE;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const exp = new Date(expirationDateStr);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpirationStatus.EXPIRED;
  if (diffDays <= 7) return ExpirationStatus.EXPIRING_SOON;
  return ExpirationStatus.ACTIVE;
}

export function formatFriendlyDate(dateStr?: string | null): string {
  if (!dateStr) return 'Sin fecha';
  
  try {
    // Handle both YYYY-MM-DD strings and ISO strings
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
