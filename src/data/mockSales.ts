import { SalesMetric, RecentSaleItem } from '@/types';

export const INITIAL_SALES_METRICS: SalesMetric = {
  totalSales: 42500,
  ordersCount: 38,
  productsSoldCount: 61,
  growthPercentage: 12,
};

export const WEEKLY_SALES_DATA = [
  { week: 'W1', sales: 8500 },
  { week: 'W2', sales: 11200 },
  { week: 'W3', sales: 9800 },
  { week: 'W4', sales: 13000 },
];

export const INITIAL_RECENT_SALES: RecentSaleItem[] = [
  {
    id: 'sale_1',
    productName: 'Cotton Dupatta',
    category: 'Textiles',
    quantity: 2,
    amount: 2198,
    date: 'Aaj',
    photo: null,
  },
  {
    id: 'sale_2',
    productName: 'Terracotta Vase',
    category: 'Pottery',
    quantity: 1,
    amount: 850,
    date: 'Kal',
    photo: null,
  },
  {
    id: 'sale_3',
    productName: 'Handwoven Rug',
    category: 'Textiles',
    quantity: 1,
    amount: 4500,
    date: '2 din pehle',
    photo: null,
  },
  {
    id: 'sale_4',
    productName: 'Walnut Serving Tray',
    category: 'Woodwork',
    quantity: 1,
    amount: 2100,
    date: '3 din pehle',
    photo: null,
  },
];
