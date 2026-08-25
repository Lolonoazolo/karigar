'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { LANGUAGES } from '@/data/languages';
import { useArtisan } from '@/context/ArtisanContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const { selectedLang, setSelectedLang, toast } = useArtisan();

  const handleNext = () => {
    router.push('/onboarding/profile');
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message={toast.message} visible={toast.visible} />

      <main className="flex-1 flex flex-col px-5 pt-8 pb-6">
        {/* Branding Header */}
        <header className="text-center mb-8">
          <h1 className="font-headline text-3xl font-extrabold text-[#4a7c59] tracking-tight mb-1">
            KarigarAI
          </h1>
          <p className="font-label text-base font-medium text-[#6b6358]">
            Aap banayein, AI sambhale.
          </p>
        </header>

        {/* Section Title */}
        <div className="mb-6 text-center">
          <h2 className="font-headline text-2xl font-bold text-[#2e3230] mb-1">
            Apni bhasha chuniye
          </h2>
          <p className="font-label text-sm text-[#4a4e4a]">
            Choose your preferred language to continue
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.nameEnglish;

            if (!lang.available) {
              return (
                <div
                  key={lang.id}
                  className="bg-[#e4e0d8]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center opacity-60 relative border border-[#c4c8bc]/40 select-none cursor-not-allowed min-h-[96px]"
                >
                  <div className="absolute top-2 right-2">
                    <Badge variant="coming">Coming Soon</Badge>
                  </div>
                  <span className="font-headline text-2xl text-[#6b6358] font-bold mb-0.5">
                    {lang.nameNative}
                  </span>
                  <span className="font-label text-xs text-[#6b6358]">
                    {lang.nameEnglish}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.nameEnglish)}
                className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 soft-shadow relative min-h-[96px] ${
                  isSelected
                    ? 'bg-[#d8f0de] border-2 border-[#4a7c59] text-[#002110]'
                    : 'bg-white border border-[#c4c8bc]/30 hover:bg-[#f5f1ea] text-[#2e3230]'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2.5 right-2.5 w-5 h-5 text-[#4a7c59] fill-[#4a7c59]/20" />
                )}
                <span className="font-headline text-2xl font-bold mb-0.5">
                  {lang.nameNative}
                </span>
                <span className="font-label text-xs font-semibold text-[#4a4e4a]">
                  {lang.nameEnglish}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indian Craft Heritage Banner */}
        <div className="w-full h-28 rounded-2xl mb-6 overflow-hidden relative soft-shadow bg-[#eae6de] flex items-center justify-center border border-[#c4c8bc]/30">
          <div className="absolute inset-0 bg-gradient-to-r from-[#c8e8d0] to-[#f8e0a8] opacity-70" />
          <div className="relative z-10 flex flex-col items-center text-center p-3">
            <span className="text-3xl mb-1">🏺🧵🎨🪵</span>
            <span className="font-headline text-xs font-bold text-[#4a7c59]">
              Bharatiya Kalakari Ka Digital Saathi
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
            Aage Badhein
          </Button>
        </div>
      </main>
    </MobilePage>
  );
}
