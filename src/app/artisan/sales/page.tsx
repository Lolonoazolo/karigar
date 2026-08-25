'use client';

import React from 'react';
import { useArtisan } from '@/context/ArtisanContext';
import { MetricCard } from '@/components/sales/MetricCard';
import { SalesChart } from '@/components/sales/SalesChart';
import { RecentSales } from '@/components/sales/RecentSales';
import { INITIAL_SALES_METRICS, WEEKLY_SALES_DATA, INITIAL_RECENT_SALES } from '@/data/mockSales';
import { Wallet, Truck, Shirt } from 'lucide-react';

export default function SalesDashboardPage() {
  const { products } = useArtisan();

  // Dynamic total inventory value or sales
  const inventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalSalesFormatted = `₹${(INITIAL_SALES_METRICS.totalSales + Math.min(inventoryValue, 15000)).toLocaleString('en-IN')}`;

  const chartData = WEEKLY_SALES_DATA.map((item) => ({
    label: item.week,
    value: item.sales,
  }));

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <MetricCard
          title="Total Sales"
          value={totalSalesFormatted}
          subtitle="Aapki collection aur sales se"
          trend="+12% from last month"
          icon={<Wallet className="w-4 h-4 text-[#4a7c59]" />}
          highlight={true}
        />

        <MetricCard
          title="Total Orders"
          value={INITIAL_SALES_METRICS.ordersCount}
          subtitle="Fulfilled orders"
          icon={<Truck className="w-4 h-4 text-[#705c30]" />}
        />

        <MetricCard
          title="Products Sold"
          value={INITIAL_SALES_METRICS.productsSoldCount}
          subtitle="Total pieces sold"
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
