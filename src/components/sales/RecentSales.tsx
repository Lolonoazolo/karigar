'use client';

import React from 'react';
import { RecentSaleItem } from '@/types';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

type RecentSalesProps = {
  sales: RecentSaleItem[];
};

export const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-base font-bold text-[#2e3230]">
          Recent Sales
        </h3>
        <button className="font-label text-xs font-bold text-[#4a7c59] hover:underline flex items-center gap-0.5">
          View All Transactions <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl soft-shadow border border-[#c4c8bc]/30 overflow-hidden divide-y divide-[#f0ece4]">
        {sales.length === 0 ? (
          <div className="p-6 text-center text-[#6b6358] font-body text-sm">
            Abhi tak koi sale nahi hui hai.
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
                    {sale.quantity} piece{sale.quantity > 1 ? 's' : ''} • {sale.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-headline font-bold text-base text-[#4a7c59]">
                  +₹{sale.amount.toLocaleString('en-IN')}
                </span>
                <p className="font-label text-[10px] font-semibold text-[#705c30]">
                  UPI / Paid
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
