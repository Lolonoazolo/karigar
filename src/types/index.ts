export type Language = {
  id: string;
  nameNative: string;
  nameEnglish: string;
  available: boolean;
};

export type ArtisanUser = {
  mobile: string;
  name: string;
  shop: string;
  lang: string;
  bio?: string;
};

export type ProductCategory = 'Textiles' | 'Pottery' | 'Woodwork' | 'Jewelry' | 'Painting' | 'Handmade' | 'Other';

export type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  sku: string;
  stock: number;
  category: ProductCategory;
  description?: string;
  tags?: string[];
  status: 'published' | 'draft';
  photo?: string | null;
  enhancedPhoto?: string | null;
  createdAt: number;
};

export type ProductDraft = {
  photo?: string | null;
  enhancedPhoto?: string | null;
  story?: string;
  category?: ProductCategory;
  name?: string;
  cost?: number;
  desiredProfit?: number;
  recommendedPrice?: number;
  price?: number;
  sku?: string;
  stock?: number;
  tags?: string[];
  description?: string;
};

export type SalesMetric = {
  totalSales: number;
  ordersCount: number;
  productsSoldCount: number;
  growthPercentage: number;
};

export type CategoryValue = {
  category: string;
  totalValue: number;
};

export type RecentSaleItem = {
  id: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  amount: number;
  date: string;
  photo?: string | null;
};
