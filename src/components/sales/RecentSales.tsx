'use client';

import React from 'react';
import { RecentSaleItem } from '@/types';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type RecentSalesProps = {
  sales: RecentSaleItem[];
};

export const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
  const { t, formatCurr, formatNum } = useLanguage();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-base font-bold text-[#2e3230]">
          {t('sales.recentTitle')}
        </h3>
        <button className="font-label text-xs font-bold text-[#4a7c59] hover:underline flex items-center gap-0.5">
          <span>{t('sales.viewAll')}</span>
          <ArrowUpRight className="w-3.5 h-3.5 rtl-flip" />
        </button>
      </div>

      <div className="bg-white rounded-2xl soft-shadow border border-[#c4c8bc]/30 overflow-hidden divide-y divide-[#f0ece4]">
        {sales.length === 0 ? (
          <div className="p-6 text-center text-[#6b6358] font-body text-sm">
            {t('sales.noSales')}
          </div>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-4 hover:bg-[#faf6f0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-[#2e3230]">
                    {sale.productName}
                  </h4>
                  <p className="font-label text-xs text-[#6b6358]">
                    {formatNum(sale.quantity)} {sale.quantity > 1 ? t('sales.pieces') : t('sales.piece')} • {sale.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-headline font-bold text-base text-[#4a7c59]">
                  +{formatCurr(sale.amount)}
                </span>
                <p className="font-label text-[10px] font-semibold text-[#705c30]">
                  {t('sales.paidBadge')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
