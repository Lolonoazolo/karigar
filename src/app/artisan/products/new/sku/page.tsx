'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useArtisan } from '@/context/ArtisanContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ArrowRight, Package, Tag, Folder, Edit3 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { ProductCategory } from '@/types';

export default function SKUAndStockPage() {
  const router = useRouter();
  const { draft, updateDraft, setLastSavedProduct, resetDraft } = useProductDraft();
  const { addProduct, showToast } = useArtisan();

  const [sku] = useState<string>(draft.sku || `KD-00${Math.floor(Math.random() * 90 + 10)}`);
  const [productName, setProductName] = useState<string>(draft.name || 'Handcrafted Cotton Dupatta');
  const [category, setCategory] = useState<ProductCategory>(draft.category || 'Textiles');
  const [stock, setStock] = useState<number>(draft.stock || 24);
  const [error, setError] = useState<string>('');

  const handleSaveProduct = () => {
    if (stock < 0 || isNaN(stock)) {
      setError('Kripya valid stock quantity daalein (e.g. 24).');
      showToast('Stock quantity likhein!');
      return;
    }

    const finalProduct = {
      name: productName,
      price: draft.price || 1099,
      cost: draft.cost || 700,
      profit: draft.desiredProfit || 250,
      sku: sku,
      stock: stock,
      category: category,
      description: draft.description || 'Exquisite handcrafted artisan product.',
      tags: draft.tags || ['Handmade', 'Cotton', 'Banarasi Craft'],
      status: 'published' as const,
      photo: draft.enhancedPhoto || draft.photo || null,
    };

    const saved = addProduct(finalProduct);
    setLastSavedProduct(saved);
    resetDraft();
    router.push('/artisan/products/success');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span>Step 4 of 4</span>
          <span>SKU & Stock</span>
        </div>
        <ProgressIndicator currentStep={4} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
          Product ka SKU banayein
        </h2>
        <p className="font-label text-sm text-[#4a4e4a] leading-relaxed">
          SKU aapke product ka unique number hai. Isse aap apne products ko aasani se track kar sakte hain.
        </p>
      </div>

      {/* SKU Form Container */}
      <div className="bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 space-y-4">
        {/* SKU Auto-generated */}
        <div className="space-y-1.5">
          <label className="font-label text-xs font-semibold text-[#6b6358]">
            SKU (Auto-generated)
          </label>
          <div className="bg-[#f5f1ea] px-4 py-3 rounded-xl border border-[#c4c8bc]/50 flex justify-between items-center">
            <span className="font-body text-[#2e3230] font-bold tracking-wide text-base">
              {sku}
            </span>
            <CheckCircle2 className="w-5 h-5 text-[#705c30]" />
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="font-label text-xs font-semibold text-[#6b6358]">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-[#f5f1ea] border border-[#c4c8bc]/50 rounded-xl py-3 px-4 text-[#2e3230] font-body text-sm appearance-none focus:ring-2 focus:ring-[#4a7c59] focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Folder className="w-4 h-4 text-[#74796e] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Product Name */}
        <Input
          label="Product Name"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          leftIcon={<Edit3 className="w-4 h-4 text-[#74796e]" />}
          required
        />

        {/* Price Display */}
        <div className="space-y-1.5">
          <label className="font-label text-xs font-semibold text-[#6b6358]">
            Final Confirmed Price
          </label>
          <div className="bg-[#f5f1ea] px-4 py-3 rounded-xl border border-[#c4c8bc]/50 flex justify-between items-center font-bold text-[#4a7c59]">
            <span>₹{(draft.price || 1099).toLocaleString('en-IN')}</span>
            <Tag className="w-4 h-4 text-[#74796e]" />
          </div>
        </div>

        {/* Stock Quantity */}
        <Input
          label="Stock Quantity"
          type="number"
          placeholder="e.g. 50"
          value={stock || ''}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          leftIcon={<Package className="w-4 h-4 text-[#74796e]" />}
          helperText="Kitne piece abhi bechne ke liye taiyaar hain?"
          error={error}
          required
        />
      </div>

      {/* Decorative Tag Emoji */}
      <div className="flex justify-center py-2">
        <div className="w-16 h-16 rounded-full bg-[#c8e8d0] flex items-center justify-center text-3xl soft-shadow border border-[#4a7c59]/20">
          🏷️
        </div>
      </div>

      {/* Primary Save CTA */}
      <div className="mt-auto pt-2">
        <Button
          onClick={handleSaveProduct}
          fullWidth
          size="lg"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Save Product
        </Button>
      </div>
    </div>
  );
}
