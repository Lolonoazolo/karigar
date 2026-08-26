'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { ArrowRight, Edit3 } from 'lucide-react';

export default function ArtisanStoryPage() {
  const router = useRouter();
  const { draft, updateDraft } = useProductDraft();
  const { t } = useLanguage();

  const [showText, setShowText] = useState(false);
  const [storyText, setStoryText] = useState(draft.story || '');

  const handleNext = () => {
    updateDraft({ story: storyText });
    router.push('/artisan/products/new/enhance');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span>{t('addStory.step')}</span>
          <span>{t('addStory.title')}</span>
        </div>
        <ProgressIndicator currentStep={1.5} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
          {t('addStory.heading')}
        </h2>
        <p className="font-label text-sm text-[#4a4e4a]">
          {t('addStory.subheading')}
        </p>
      </div>

      {/* Voice Assistant */}
      <VoiceRecorder
        onTranscriptComplete={(text) => setStoryText(text)}
        promptText={t('addStory.voicePrompt')}
      />

      {/* Text fallback toggle */}
      <div className="text-center">
        {!showText ? (
          <button
            type="button"
            onClick={() => setShowText(true)}
            className="font-label text-xs font-semibold text-[#6b6358] hover:text-[#4a7c59] flex items-center justify-center gap-1.5 mx-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('addStory.writeToggle')}</span>
          </button>
        ) : (
          <div className="text-left space-y-2 fade-in">
            <label className="block font-label text-xs font-semibold text-[#4a4e4a]">
              {t('addStory.detailsLabel')}
            </label>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              rows={4}
              placeholder={t('addStory.placeholder')}
              className="w-full bg-[#f5f1ea] border border-[#c4c8bc]/60 rounded-xl p-3.5 text-sm text-[#2e3230] focus:ring-2 focus:ring-[#4a7c59] focus:outline-none font-body resize-none"
            />
          </div>
        )}
      </div>

      {/* Next CTA */}
      <div className="mt-auto pt-4">
        <Button
          onClick={handleNext}
          fullWidth
          size="lg"
          icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
        >
          {t('addStory.nextBtn')}
        </Button>
      </div>
    </div>
  );
}
