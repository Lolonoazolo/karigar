'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { LANGUAGES, LanguageId } from '@/lib/i18n/languages';
import { useLanguage } from '@/context/LanguageContext';
import { useArtisan } from '@/context/ArtisanContext';
import { CheckCircle2, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, toast } = useArtisan();

  const handleSelectLanguage = (langId: LanguageId) => {
    setLanguage(langId);
  };

  const handleNext = () => {
    if (user) {
      router.push('/artisan/products');
    } else {
      router.push('/onboarding/profile');
    }
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message={toast.message} visible={toast.visible} />

      <main className="flex-1 flex flex-col px-5 pt-8 pb-6 space-y-6">
        {/* Branding Header */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d8f0de] text-[#4a7c59] mb-3 soft-shadow">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-[#4a7c59] tracking-tight mb-1">
            ArtSaathi / KarigarAI
          </h1>
          <p className="font-label text-sm font-semibold text-[#6b6358]">
            {t('onboarding.brandTagline')}
          </p>
        </header>

        {/* Section Title */}
        <div className="text-center space-y-1">
          <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
            {t('onboarding.langTitle')}
          </h2>
          <p className="font-label text-xs font-semibold text-[#4a4e4a]">
            {t('onboarding.langSubtitle')}
          </p>
        </div>

        {/* Language Grid (10 Indian Languages) */}
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.id;

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleSelectLanguage(lang.id as LanguageId)}
                className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 soft-shadow relative min-h-[100px] border ${
                  isSelected
                    ? 'bg-[#d8f0de] border-2 border-[#4a7c59] text-[#002110] shadow-md'
                    : 'bg-white border-[#c4c8bc]/40 hover:bg-[#f5f1ea] text-[#2e3230]'
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2.5 right-2.5 w-5 h-5 text-[#4a7c59] fill-[#4a7c59]/20" />
                )}
                <span className="font-headline text-2xl font-bold mb-0.5 leading-tight">
                  {lang.nameNative}
                </span>
                <span className="font-label text-xs font-semibold text-[#6b6358]">
                  {lang.nameEnglish}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indian Craft Heritage Banner */}
        <div className="w-full rounded-2xl p-4 soft-shadow bg-gradient-to-r from-[#c8e8d0] to-[#f8e0a8] flex items-center justify-center border border-[#c4c8bc]/30 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🏺 🧵 🎨 🪵 💍</span>
            <span className="font-headline text-xs font-bold text-[#4a7c59]">
              {t('onboarding.heritageTagline')}
            </span>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="mt-auto pt-4">
          <Button
            onClick={handleNext}
            fullWidth
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            {t('onboarding.continueBtn')}
          </Button>
        </div>
      </main>
    </MobilePage>
  );
}
