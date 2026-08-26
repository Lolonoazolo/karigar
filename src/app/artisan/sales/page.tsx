'use client';

import React from 'react';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { MetricCard } from '@/components/sales/MetricCard';
import { SalesChart } from '@/components/sales/SalesChart';
import { RecentSales } from '@/components/sales/RecentSales';
import { INITIAL_SALES_METRICS, WEEKLY_SALES_DATA, INITIAL_RECENT_SALES } from '@/data/mockSales';
import { Wallet, Truck, Shirt } from 'lucide-react';

export default function SalesDashboardPage() {
  const { products } = useArtisan();
  const { t, formatCurr, formatNum } = useLanguage();

  // Dynamic total inventory value or sales
  const inventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalSalesRaw = INITIAL_SALES_METRICS.totalSales + Math.min(inventoryValue, 15000);
  const totalSalesFormatted = formatCurr(totalSalesRaw);

  const chartData = WEEKLY_SALES_DATA.map((item) => ({
    label: item.week,
    value: item.sales,
  }));

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <MetricCard
          title={t('sales.totalSales')}
          value={totalSalesFormatted}
          subtitle={t('sales.totalSalesSub')}
          trend={t('sales.trend')}
          icon={<Wallet className="w-4 h-4 text-[#4a7c59]" />}
          highlight={true}
        />

        <MetricCard
          title={t('sales.totalOrders')}
          value={formatNum(INITIAL_SALES_METRICS.ordersCount)}
          subtitle={t('sales.totalOrdersSub')}
          icon={<Truck className="w-4 h-4 text-[#705c30]" />}
        />

        <MetricCard
          title={t('sales.productsSold')}
          value={formatNum(INITIAL_SALES_METRICS.productsSoldCount)}
          subtitle={t('sales.productsSoldSub')}
          icon={<Shirt className="w-4 h-4 text-[#4a7c59]" />}
        />
      </div>

      {/* Sales Performance Chart */}
      <SalesChart data={chartData} />

      {/* Recent Sales List */}
      <RecentSales sales={INITIAL_RECENT_SALES} />
    </div>
  );
}
