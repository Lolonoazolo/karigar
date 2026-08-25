'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, PlusCircle, CreditCard, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/artisan/products',
      icon: Home,
      isActive: pathname === '/artisan/products' || pathname === '/artisan/home',
    },
    {
      label: 'Products',
      href: '/artisan/products',
      icon: Package,
      isActive: pathname === '/artisan/products',
    },
    {
      label: 'Add',
      href: '/artisan/products/new/photo',
      icon: PlusCircle,
      isPrimaryAdd: true,
      isActive: pathname?.startsWith('/artisan/products/new'),
    },
    {
      label: 'Sales',
      href: '/artisan/sales',
      icon: CreditCard,
      isActive: pathname === '/artisan/sales',
    },
    {
      label: 'Profile',
      href: '/onboarding/profile',
      icon: User,
      isActive: pathname === '/onboarding/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex justify-around items-center px-3 py-2 bg-[#faf6f0] soft-shadow rounded-t-2xl border-t border-[#c4c8bc]/40">
      {navItems.map((item) => {
        const Icon = item.icon;

        if (item.isPrimaryAdd) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center relative -top-4 group"
            >
              <div className="bg-[#4a7c59] text-white rounded-full p-3 shadow-lg group-hover:scale-105 group-active:scale-95 transition-transform duration-200 border-4 border-[#faf6f0]">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-label text-[11px] font-bold text-[#4a7c59] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
              item.isActive
                ? 'bg-[#c4a66a] text-[#554020]'
                : 'text-[#6b6358] hover:text-[#2e3230]'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="font-label text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
