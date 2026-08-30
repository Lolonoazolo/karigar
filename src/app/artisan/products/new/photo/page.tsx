'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { Camera, Image as ImageIcon, ArrowRight, Box } from 'lucide-react';
import { useArtisan } from '@/context/ArtisanContext';

export default function ProductPhotoPage() {
  const router = useRouter();
  const { draft, updateDraft } = useProductDraft();
  const { showToast } = useArtisan();
  const { t } = useLanguage();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateDraft({ photo: dataUrl, enhancedPhoto: dataUrl });
      showToast(t('addPhoto.photoUploaded'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleNext = () => {
    if (!draft.photo) {
      showToast('Kripya product ki photo khinchein ya gallery se chunein.');
      return;
    }
    router.push('/artisan/products/new/story');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span>{t('addPhoto.step')}</span>
          <span>{t('addPhoto.title')}</span>
        </div>
        <ProgressIndicator currentStep={1} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
          {t('addPhoto.heading')}
        </h2>
        <p className="font-label text-sm text-[#4a4e4a]">
          {t('addPhoto.subheading')}
        </p>
      </div>

      {/* Dashed Camera Preview Area */}
      <div
        onClick={() => cameraInputRef.current?.click()}
        className="w-full aspect-[4/5] bg-[#f5f1ea] rounded-2xl relative overflow-hidden border-2 border-dashed border-[#c4c8bc] flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0ece4] transition-colors soft-shadow group"
      >
        {/* Corner Markers */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#4a7c59] rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#4a7c59] rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#4a7c59] rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#4a7c59] rounded-br-lg" />

        {draft.photo ? (
          <img
            src={draft.photo}
            alt="Product Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box className="w-8 h-8" />
            </div>
            <p className="font-label text-sm font-semibold text-[#4a4e4a]">
              {t('addPhoto.centerNotice')}
            </p>
            <span className="font-label text-xs text-[#6b6358] bg-white px-3 py-1 rounded-full border border-[#c4c8bc]/40">
              {t('addPhoto.tapToCapture')}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Actions */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="bg-[#4a7c59] hover:bg-[#3d6849] text-[#002110] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 soft-shadow group"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="font-label font-bold text-sm text-center leading-tight text-white">
            {t('addPhoto.clickPhoto')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="bg-white border border-[#c4c8bc] text-[#4a7c59] hover:bg-[#f5f1ea] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 soft-shadow group"
        >
          <div className="w-10 h-10 rounded-full bg-[#d8f0de] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ImageIcon className="w-5 h-5 text-[#4a7c59]" />
          </div>
          <span className="font-label font-bold text-sm text-center leading-tight">
            {t('addPhoto.fromGallery')}
          </span>
        </button>
      </div>

      {/* Next CTA */}
      <div className="pt-2">
        <Button
          onClick={handleNext}
          fullWidth
          size="lg"
          icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
        >
          {t('addPhoto.nextBtn')}
        </Button>
      </div>
    </div>
  );
}
