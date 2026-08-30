'use client';

import React, { useState, useEffect } from 'react';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { MetricCard } from '@/components/sales/MetricCard';
import { SalesChart } from '@/components/sales/SalesChart';
import { RecentSales } from '@/components/sales/RecentSales';
import { getArtisanSalesMetrics, getArtisanRecentSales } from '@/services/salesService';
import { SalesMetric, RecentSaleItem } from '@/types';
import { Wallet, Truck, Shirt } from 'lucide-react';

export default function SalesDashboardPage() {
  const { user } = useArtisan();
  const { t, formatCurr, formatNum } = useLanguage();

  const [metrics, setMetrics] = useState<SalesMetric>({
    totalSales: 0,
    ordersCount: 0,
    productsSoldCount: 0,
    growthPercentage: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSaleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadSalesData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [m, sales] = await Promise.all([
          getArtisanSalesMetrics(user.id),
          getArtisanRecentSales(user.id),
        ]);

        if (isMounted) {
          setMetrics(m);
          setRecentSales(sales);
        }
      } catch (err) {
        console.error('Failed to load sales data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSalesData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const totalSalesFormatted = formatCurr(metrics.totalSales);

  // Sales chart based on real sales or 0 baseline
  const chartData = [
    { label: 'W1', value: 0 },
    { label: 'W2', value: 0 },
    { label: 'W3', value: 0 },
    { label: 'W4', value: metrics.totalSales },
  ];

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-2">
          <span className="font-label text-xs text-[#6b6358]">Loading sales metrics from database...</span>
        </div>
      )}

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <MetricCard
          title={t('sales.totalSales')}
          value={totalSalesFormatted}
          subtitle={t('sales.totalSalesSub')}
          trend={metrics.growthPercentage > 0 ? `+${metrics.growthPercentage}%` : undefined}
          icon={<Wallet className="w-4 h-4 text-[#4a7c59]" />}
          highlight={true}
        />

        <MetricCard
          title={t('sales.totalOrders')}
          value={formatNum(metrics.ordersCount)}
          subtitle={t('sales.totalOrdersSub')}
          icon={<Truck className="w-4 h-4 text-[#705c30]" />}
        />

        <MetricCard
          title={t('sales.productsSold')}
          value={formatNum(metrics.productsSoldCount)}
          subtitle={t('sales.productsSoldSub')}
          icon={<Shirt className="w-4 h-4 text-[#4a7c59]" />}
        />
      </div>

      {/* Sales Performance Chart */}
      <SalesChart data={chartData} />

      {/* Recent Sales List */}
      <RecentSales sales={recentSales} />
    </div>
  );
}
