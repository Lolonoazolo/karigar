'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ArrowRight, Package, Tag, Folder, Edit3 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { ProductCategory } from '@/types';
import { uploadProductImage } from '@/services/productService';

export default function SKUAndStockPage() {
  const router = useRouter();
  const { draft, setLastSavedProduct, resetDraft } = useProductDraft();
  const { user, addProduct, showToast } = useArtisan();
  const { t, formatCurr } = useLanguage();

  const generatedSku = `SKU-${Date.now().toString().slice(-6)}`;
  const [sku] = useState<string>(draft.sku || generatedSku);
  const [productName, setProductName] = useState<string>(draft.name || '');
  const [category, setCategory] = useState<ProductCategory>(draft.category || 'Textiles');
  const [stock, setStock] = useState<number>(draft.stock || 1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      setError('Kripya product ka naam bharein.');
      showToast('Product ka naam avashyak hai.');
      return;
    }

    if (stock < 0 || isNaN(stock)) {
      setError(t('addSku.stockError'));
      showToast(t('addSku.stockToast'));
      return;
    }

    setIsSaving(true);
    try {
      let finalPhotoUrl: string | null = draft.enhancedPhoto || draft.photo || null;

      // If photo is a base64 Data URL and user is logged in, upload to Supabase Storage
      if (finalPhotoUrl && finalPhotoUrl.startsWith('data:') && user?.id) {
        try {
          const res = await fetch(finalPhotoUrl);
          const blob = await res.blob();
          const uploadedUrl = await uploadProductImage(user.id, blob);
          if (uploadedUrl) {
            finalPhotoUrl = uploadedUrl;
          }
        } catch (uploadErr) {
          console.warn('Failed to upload image blob to storage, using staged reference:', uploadErr);
        }
      }

      const finalProductData = {
        name: productName.trim(),
        price: draft.price || 0,
        cost: draft.cost || 0,
        profit: draft.desiredProfit || 0,
        sku: sku,
        stock: stock,
        category: category,
        description: draft.description || draft.story || '',
        tags: draft.tags || [category],
        status: 'published' as const,
        photo: finalPhotoUrl,
        enhancedPhoto: finalPhotoUrl,
      };

      const saved = await addProduct(finalProductData);
      if (saved) {
        setLastSavedProduct(saved);
        resetDraft();
        router.push('/artisan/products/success');
      } else {
        showToast('Product create karne mein samasya aayi.');
      }
    } catch (err: any) {
      showToast(err.message || 'Product save karne mein truti aayi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span>{t('addSku.step')}</span>
          <span>{t('addSku.title')}</span>
        </div>
        <ProgressIndicator currentStep={4} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
          {t('addSku.heading')}
        </h2>
        <p className="font-label text-sm text-[#4a4e4a] leading-relaxed">
          {t('addSku.subheading')}
        </p>
      </div>

      {/* SKU Form Container */}
      <div className="bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 space-y-4">
        {/* SKU Auto-generated */}
        <div className="space-y-1.5">
          <label className="font-label text-xs font-semibold text-[#6b6358]">
            {t('addSku.skuAutoLabel')}
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
            {t('addSku.categoryLabel')}
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-[#f5f1ea] border border-[#c4c8bc]/50 rounded-xl py-3 px-4 text-[#2e3230] font-body text-sm appearance-none focus:ring-2 focus:ring-[#4a7c59] focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(`categories.${cat.id}` as any) || cat.label}
                </option>
              ))}
            </select>
            <Folder className="w-4 h-4 text-[#74796e] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Product Name */}
        <Input
          label={t('addSku.nameLabel')}
          type="text"
          placeholder="Product Ka Naam"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          leftIcon={<Edit3 className="w-4 h-4 text-[#74796e]" />}
          required
        />

        {/* Price Display */}
        <div className="space-y-1.5">
          <label className="font-label text-xs font-semibold text-[#6b6358]">
            {t('addSku.priceLabel')}
          </label>
          <div className="bg-[#f5f1ea] px-4 py-3 rounded-xl border border-[#c4c8bc]/50 flex justify-between items-center font-bold text-[#4a7c59]">
            <span>{formatCurr(draft.price || 0)}</span>
            <Tag className="w-4 h-4 text-[#74796e]" />
          </div>
        </div>

        {/* Stock Quantity */}
        <Input
          label={t('addSku.stockLabel')}
          type="number"
          placeholder={t('addSku.stockPlaceholder')}
          value={stock || ''}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          leftIcon={<Package className="w-4 h-4 text-[#74796e]" />}
          helperText={t('addSku.stockHelper')}
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
          disabled={isSaving}
          icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
        >
          {isSaving ? 'Saving to Database...' : t('addSku.saveBtn')}
        </Button>
      </div>
    </div>
  );
}
