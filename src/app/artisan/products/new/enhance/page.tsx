'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { BeforeAfterSlider } from '@/components/ai/BeforeAfterSlider';
import { CheckCircle2, Sparkles, Wand2, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { enhanceProductPhoto } from '@/lib/ai/photoEnhancement';

export default function AIStudioEnhancePage() {
  const router = useRouter();
  const { draft, updateDraft } = useProductDraft();
  const { user } = useArtisan();
  const { t, language } = useLanguage();

  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [aiConfigured, setAiConfigured] = useState<boolean>(true);
  const [aiMessage, setAiMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const runEnhance = async () => {
      setIsProcessing(true);
      const res = await enhanceProductPhoto(draft.photo, language, user?.id);

      if (isMounted) {
        setIsProcessing(false);
        setAiConfigured(res.configured);
        setAiMessage(res.message);

        if (res.configured) {
          updateDraft({
            name: res.suggestedTitle || draft.name,
            description: res.suggestedDescription || draft.description,
            tags: res.tags && res.tags.length > 0 ? res.tags : draft.tags,
            enhancedPhoto: res.enhancedImage || draft.photo,
          });
        } else {
          updateDraft({ enhancedPhoto: draft.photo });
        }
      }
    };
    runEnhance();

    return () => {
      isMounted = false;
    };
  }, [language, user?.id]);

  const handleUseEnhanced = () => {
    router.push('/artisan/products/new/price');
  };

  const handleUseOriginal = () => {
    updateDraft({ enhancedPhoto: draft.photo });
    router.push('/artisan/products/new/price');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Header & Step */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span className="flex items-center gap-1 text-[#705c30] font-bold">
            <Sparkles className="w-3.5 h-3.5" /> {t('addEnhance.studioBadge')}
          </span>
          <span>{t('addEnhance.step')}</span>
        </div>
        <ProgressIndicator currentStep={2} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#4a7c59]">
          {t('addEnhance.heading')} <span className="inline-block animate-pulse">✨</span>
        </h2>
        <p className="font-label text-sm text-[#6b6358]">
          {t('addEnhance.subheading')}
        </p>
      </div>

      {/* AI Configuration Status Alert */}
      {!aiConfigured && (
        <div className="bg-[#fff8e1] border border-[#ffe082] rounded-xl p-3.5 text-xs text-[#7f6000] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#f57f17] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">AI Photo Model Pending Configuration</span>
            <p className="text-[11px] mt-0.5">{aiMessage}</p>
          </div>
        </div>
      )}

      {/* Before / After Interactive Touch Slider */}
      <BeforeAfterSlider
        beforeImage={draft.photo}
        afterImage={draft.enhancedPhoto || draft.photo}
      />

      {/* AI Processing Status Card */}
      <div className="bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 space-y-3">
        <h3 className="font-headline text-sm font-bold text-[#2e3230] flex items-center gap-1.5">
          <Wand2 className="w-4 h-4 text-[#4a7c59]" /> {t('addEnhance.statusTitle')}
        </h3>

        <div className="space-y-2.5 font-label text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#2e3230]">
              Photo uploaded successfully
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                aiConfigured ? 'bg-[#d8f0de] text-[#4a7c59]' : 'bg-[#eae6de] text-[#6b6358]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#2e3230]">
              {aiConfigured ? 'AI Vision enhancement active' : 'Original photo staged'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleUseEnhanced}
          fullWidth
          size="lg"
          disabled={isProcessing}
          icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
        >
          {t('addEnhance.useEnhancedBtn')}
        </Button>

        <Button
          onClick={handleUseOriginal}
          variant="secondary"
          fullWidth
          size="md"
          icon={<RefreshCw className="w-4 h-4 text-[#6b6358]" />}
          iconPosition="left"
        >
          {t('addEnhance.useOriginalBtn')}
        </Button>
      </div>
    </div>
  );
}
