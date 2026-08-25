'use client';

import React from 'react';
import { useArtisan } from '@/context/ArtisanContext';
import { User, Languages } from 'lucide-react';
import Link from 'next/link';

type ArtisanHeaderProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  stepText?: string;
};

export const ArtisanHeader: React.FC<ArtisanHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  stepText,
}) => {
  const { user } = useArtisan();
  const artisanName = user?.name || 'Karigar';

  return (
    <header className="w-full sticky top-0 z-40 bg-[#faf6f0] soft-shadow border-b border-[#c4c8bc]/30">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f0ece4] transition-colors active:scale-95 text-[#4a7c59]"
              aria-label="Go back"
            >
              <span className="font-bold text-xl">←</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#c8e8d0] flex items-center justify-center border border-[#c4c8bc]/30 shrink-0">
              <User className="w-5 h-5 text-[#4a7c59]" />
            </div>
          )}
          <div>
            <h1 className="font-headline text-lg font-bold text-[#4a7c59] leading-tight tracking-tight">
              {title || `Namaste, ${artisanName}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stepText ? (
            <span className="font-label text-xs font-semibold text-[#6b6358] bg-[#f0ece4] px-2.5 py-1 rounded-full border border-[#c4c8bc]/40">
              {stepText}
            </span>
          ) : (
            <Link
              href="/onboarding/language"
              className="p-2 text-[#4a4e4a] hover:bg-[#f0ece4] transition-colors rounded-full active:scale-95 flex items-center justify-center"
              aria-label="Change language"
            >
              <Languages className="w-5 h-5 text-[#4a7c59]" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
