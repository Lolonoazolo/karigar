'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useArtisan } from '@/context/ArtisanContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Package, Layers } from 'lucide-react';

export default function MyCollectionPage() {
  const router = useRouter();
  const { products, currentFilter, setCurrentFilter, deleteProduct } = useArtisan();

  const filteredProducts = products.filter((product) => {
    if (currentFilter === 'published') return product.status === 'published';
    if (currentFilter === 'draft') return product.status === 'draft';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#2e3230]">
            Meri Collection
          </h2>
          <p className="font-label text-xs font-semibold text-[#6b6358] flex items-center gap-1.5 mt-0.5">
            <Package className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>{products.length} Products in Catalog</span>
          </p>
        </div>

        <Button
          onClick={() => router.push('/artisan/products/new/photo')}
          size="sm"
          icon={<PlusCircle className="w-4 h-4" />}
          iconPosition="left"
        >
          Add Product
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'published', 'draft'] as const).map((filter) => {
          const isActive = currentFilter === filter;
          const labels = {
            all: 'All Items',
            published: 'Published',
            draft: 'Drafts',
          };

          return (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`px-4 py-1.5 rounded-full font-label text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-[#d8f0de] text-[#002110] border border-[#4a7c59]/40 shadow-sm'
                  : 'bg-white text-[#6b6358] border border-[#c4c8bc]/30 hover:bg-[#f5f1ea]'
              }`}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 bg-white rounded-2xl border border-[#c4c8bc]/30 soft-shadow">
          <div className="w-20 h-20 rounded-full bg-[#f8e0a8]/40 flex items-center justify-center text-4xl">
            🎨
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="font-headline text-xl font-bold text-[#2e3230]">
              Abhi koi product nahi hai
            </h3>
            <p className="font-body text-xs text-[#6b6358]">
              Apna pehla product add karein aur apni collection shuru karein!
            </p>
          </div>
          <Button
            onClick={() => router.push('/artisan/products/new/photo')}
            size="md"
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Pehla Product Add Karein
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={deleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
