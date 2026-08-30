import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { SalesMetric, RecentSaleItem, ProductCategory } from '@/types';

export async function getArtisanSalesMetrics(artisanId: string): Promise<SalesMetric> {
  if (!isSupabaseConfigured || !supabaseClient || !artisanId) {
    return {
      totalSales: 0,
      ordersCount: 0,
      productsSoldCount: 0,
      growthPercentage: 0,
    };
  }

  const { data, error } = await supabaseClient
    .from('order_items')
    .select('quantity, unit_price, order_id')
    .eq('artisan_id', artisanId);

  if (error) {
    console.error('Error fetching artisan sales metrics:', error.message);
    return {
      totalSales: 0,
      ordersCount: 0,
      productsSoldCount: 0,
      growthPercentage: 0,
    };
  }

  if (!data || data.length === 0) {
    return {
      totalSales: 0,
      ordersCount: 0,
      productsSoldCount: 0,
      growthPercentage: 0,
    };
  }

  const totalSales = data.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
  const productsSoldCount = data.reduce((sum, item) => sum + Number(item.quantity), 0);
  const uniqueOrders = new Set(data.map((item) => item.order_id));

  return {
    totalSales,
    ordersCount: uniqueOrders.size,
    productsSoldCount,
    growthPercentage: 0,
  };
}

export async function getArtisanRecentSales(artisanId: string): Promise<RecentSaleItem[]> {
  if (!isSupabaseConfigured || !supabaseClient || !artisanId) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('order_items')
    .select(`
      id,
      quantity,
      unit_price,
      created_at,
      products (
        name,
        category,
        cover_image_url
      )
    `)
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching recent sales:', error.message);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    id: item.id,
    productName: item.products?.name || 'Handicraft Item',
    category: (item.products?.category as ProductCategory) || 'Other',
    quantity: Number(item.quantity),
    amount: Number(item.unit_price) * Number(item.quantity),
    date: new Date(item.created_at).toLocaleDateString('hi-IN'),
    photo: item.products?.cover_image_url || null,
  }));
}
