'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Share2, PlusCircle, QrCode, Package, Layers } from 'lucide-react';

export default function ProductSuccessPage() {
  const router = useRouter();
  const { lastSavedProduct } = useProductDraft();
  const { showToast } = useArtisan();
  const { t, formatCurr, formatNum } = useLanguage();

  const product = lastSavedProduct || {
    name: 'Handcrafted Cotton Dupatta',
    price: 1099,
    sku: 'KD-001',
    stock: 24,
    tags: ['Handmade', 'Cotton', 'Banarasi Craft'],
    photo: null,
  };

  const handleShare = () => {
    showToast(t('success.linkCopied'));
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-8 space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#c8e8d0] text-[#4a7c59] soft-shadow border border-[#4a7c59]/20 animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-[#2e3230] leading-tight">
          {t('success.heading')}
        </h2>
        <p className="font-body text-sm text-[#4a4e4a] leading-relaxed">
          {t('success.subheading')}
        </p>
      </div>

      {/* Product Summary Card */}
      <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-[#c4c8bc]/30 space-y-0 fade-in">
        <div className="h-52 relative overflow-hidden bg-[#f0ece4] flex items-center justify-center">
          {product.photo ? (
            <img
              src={product.photo}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#c8e8d0]/50 to-[#f8e0a8]/50 text-5xl">
              🎨
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-headline text-xl font-bold text-[#2e3230]">
              {product.name}
            </h3>
            <span className="font-headline text-xl font-extrabold text-[#4a7c59]">
              {formatCurr(product.price || 1099)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(product.tags || ['Handmade', 'Cotton', 'Banarasi Craft']).map((tag) => (
              <Badge key={tag} variant="primary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Details Bar */}
          <div className="flex items-center text-xs text-[#4a4e4a] bg-[#f5f1ea] rounded-xl p-3 gap-3 border border-[#c4c8bc]/30">
            <div className="flex-1 flex items-center gap-1.5 font-label">
              <QrCode className="w-4 h-4 text-[#4a7c59] shrink-0" />
              <span>SKU: <strong className="text-[#2e3230]">{product.sku}</strong></span>
            </div>
            <div className="h-4 w-px bg-[#c4c8bc]/60 shrink-0" />
            <div className="flex-1 flex items-center gap-1.5 font-label">
              <Package className="w-4 h-4 text-[#705c30] shrink-0" />
              <span>Stock: <strong className="text-[#2e3230]">{formatNum(product.stock || 0)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={() => router.push('/artisan/products')}
          fullWidth
          size="lg"
          icon={<Layers className="w-5 h-5" />}
          iconPosition="left"
        >
          {t('success.viewCollection')}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            variant="secondary"
            fullWidth
            size="md"
            icon={<Share2 className="w-4 h-4 text-[#4a7c59]" />}
            iconPosition="left"
          >
            {t('success.shareProduct')}
          </Button>

          <Button
            onClick={() => router.push('/artisan/products/new')}
            variant="secondary"
            fullWidth
            size="md"
            icon={<PlusCircle className="w-4 h-4 text-[#4a7c59]" />}
            iconPosition="left"
          >
            {t('success.addAnother')}
          </Button>
        </div>
      </div>
    </div>
  );
}
