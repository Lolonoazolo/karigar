export type Language = {
  id: string;
  nameNative: string;
  nameEnglish: string;
  available: boolean;
  code?: string;
  locale?: string;
  dir?: 'ltr' | 'rtl';
};

export type ArtisanUser = {
  id?: string;
  email?: string;
  mobile: string;
  name: string;
  shop: string;
  craft?: string;
  location?: string;
  lang: string;
  bio?: string;
  role?: 'artisan' | 'customer' | 'admin';
  artisanId?: string;
  avatarUrl?: string;
};

export type ProductCategory = 'Textiles' | 'Pottery' | 'Woodwork' | 'Jewelry' | 'Painting' | 'Handmade' | 'Other';

export type Product = {
  id: string;
  artisanId?: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  sku: string;
  stock: number;
  category: ProductCategory;
  description?: string;
  tags?: string[];
  status: 'published' | 'draft' | 'archived';
  photo?: string | null;
  enhancedPhoto?: string | null;
  createdAt: number;
};

export type ProductDataSchema = {
  product_name: string | null;
  category: string | null;
  craft_type: string | null;
  material: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  quantity: number | null;
  color?: string | null;
  dimensions?: string | null;
  weight?: string | null;
  production_time_days?: number | null;
  origin?: string | null;
  care_instructions?: string | null;
  tags?: string[];
};

export type ProductTranslation = {
  id?: string;
  productId: string;
  languageCode: string;
  originalDescription: string;
  englishDescription: string;
  createdAt?: number;
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
  craftType?: string;
  material?: string;
  productionTimeDays?: number;
  color?: string;
  origin?: string;
  originalLanguage?: string;
  originalDescription?: string;
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
