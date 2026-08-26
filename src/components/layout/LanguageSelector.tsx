'use client';

import React from 'react';
import { LANGUAGES, LanguageId } from '@/lib/i18n/languages';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

type LanguageSelectorProps = {
  variant?: 'select' | 'compact' | 'pill';
  className?: string;
};

export default function LanguageSelector({ variant = 'select', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'pill') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <Globe className="w-4 h-4 text-[#4a7c59] absolute left-3 pointer-events-none" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageId)}
          className="bg-white/90 border border-[#c4c8bc]/60 rounded-full pl-9 pr-7 py-1.5 font-label text-xs font-bold text-[#2e3230] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59] soft-shadow cursor-pointer"
          aria-label={t('accessibility.changeLang')}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.nameNative} ({lang.nameEnglish})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageId)}
        className="w-full bg-[#f5f1ea] border border-[#c4c8bc]/60 rounded-xl px-4 py-2.5 font-label text-sm font-semibold text-[#2e3230] focus:ring-2 focus:ring-[#4a7c59] focus:outline-none cursor-pointer"
        aria-label={t('accessibility.changeLang')}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.nameNative} — {lang.nameEnglish}
          </option>
        ))}
      </select>
    </div>
  );
}