'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { LanguageId, LANGUAGES } from '@/lib/i18n/languages';
import {
  getTranslation,
  getLanguageMeta,
  formatNumber,
  formatCurrency,
  formatDate,
} from '@/lib/i18n';

interface LanguageContextType {
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  formatNum: (value: number) => string;
  formatCurr: (value: number) => string;
  formatDt: (date: number | Date | string) => string;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'karigar-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageId>('hindi');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load saved language on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as LanguageId | null;
      if (savedLanguage && LANGUAGES.some((l) => l.id === savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (e) {
      console.error('Failed to read language preference', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync HTML lang and dir attributes whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const meta = getLanguageMeta(language);
      document.documentElement.lang = meta.code || 'hi';
      document.documentElement.dir = meta.dir || 'ltr';
    }
  }, [language]);

  const setLanguage = useCallback((newLanguage: LanguageId) => {
    setLanguageState(newLanguage);
    try {
      localStorage.setItem(STORAGE_KEY, newLanguage);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getTranslation(language, key, params);
    },
    [language]
  );

  const meta = getLanguageMeta(language);
  const isRTL = meta.dir === 'rtl';
  const dir = meta.dir || 'ltr';

  const formatNum = useCallback(
    (value: number) => formatNumber(value, language),
    [language]
  );

  const formatCurr = useCallback(
    (value: number) => formatCurrency(value, language),
    [language]
  );

  const formatDt = useCallback(
    (date: number | Date | string) => formatDate(date, language),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        dir,
        formatNum,
        formatCurr,
        formatDt,
        isHydrated,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}