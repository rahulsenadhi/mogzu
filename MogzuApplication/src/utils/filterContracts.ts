import { formatCurrencyByLocale } from '@/lib/i18n/useCurrency'

export type CatalogueSourceFilter = 'all' | 'mogzu' | 'vendor';

export function formatInr(amount: number): string {
  return formatCurrencyByLocale(Math.max(0, amount));
}

export function parsePriceLike(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const stripped = value.replace(/[^\d.]/g, '');
  if (!stripped) return null;
  const parsed = Number(stripped);
  return Number.isFinite(parsed) ? parsed : null;
}

export function matchesPriceRange(price: number | null, min?: number, max?: number): boolean {
  if (price == null) return true;
  if (typeof min === 'number' && price < min) return false;
  if (typeof max === 'number' && price > max) return false;
  return true;
}

export function matchesSourceFilter(
  source: CatalogueSourceFilter,
  isMogzuDirect: boolean,
): boolean {
  if (source === 'all') return true;
  if (source === 'mogzu') return isMogzuDirect;
  return !isMogzuDirect;
}
