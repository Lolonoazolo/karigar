import { SalesMetric, RecentSaleItem } from '@/types';

/**
 * DEPRECATED: Mock sales metrics have been removed in favor of Supabase PostgreSQL orders/order_items source of truth.
 * These zero baseline values ensure zero production reliance on fake sales math.
 */
export const INITIAL_SALES_METRICS: SalesMetric = {
  totalSales: 0,
  ordersCount: 0,
  productsSoldCount: 0,
  growthPercentage: 0,
};

export const WEEKLY_SALES_DATA = [
  { week: 'W1', sales: 0 },
  { week: 'W2', sales: 0 },
  { week: 'W3', sales: 0 },
  { week: 'W4', sales: 0 },
];

export const INITIAL_RECENT_SALES: RecentSaleItem[] = [];
