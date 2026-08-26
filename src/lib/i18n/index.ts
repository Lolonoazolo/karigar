import { LANGUAGES, LanguageId } from './languages';
import { en } from './translations/en';
import { hi } from './translations/hi';
import { bn } from './translations/bn';
import { mr } from './translations/mr';
import { gu } from './translations/gu';
import { ta } from './translations/ta';
import { te } from './translations/te';
import { kn } from './translations/kn';
import { ml } from './translations/ml';
import { pa } from './translations/pa';

export const translations = {
  english: en,
  hindi: hi,
  bengali: bn,
  marathi: mr,
  gujarati: gu,
  tamil: ta,
  telugu: te,
  kannada: kn,
  malayalam: ml,
  punjabi: pa,
} as const;

export type TranslationTree = typeof en;

// Development-time completeness check
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  const getKeys = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
      } else {
        keys.push(`${prefix}${key}`);
      }
    }
    return keys;
  };

  const enKeys = getKeys(en);
  Object.entries(translations).forEach(([langName, langDict]) => {
    if (langName === 'english') return;
    const langKeys = getKeys(langDict);
    const missingKeys = enKeys.filter((k) => !langKeys.includes(k));
    if (missingKeys.length > 0) {
      console.warn(`[i18n Warning] Language "${langName}" is missing keys:`, missingKeys);
    }
  });
}

/**
 * Safely retrieve a translated string with nested key support and parameter replacement.
 * Example: t('common.welcomeToast', { name: 'Ramesh' })
 */
export function getTranslation(
  language: LanguageId,
  key: string,
  params?: Record<string, string | number>
): string {
  const selectedDict = translations[language] || translations.english;

  const getValue = (dict: any, k: string): string | undefined => {
    const val = k.split('.').reduce((obj: any, part: string) => obj?.[part], dict);
    return typeof val === 'string' ? val : undefined;
  };

  let result = getValue(selectedDict, key) ?? getValue(translations.english, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([pKey, pVal]) => {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    });
  }

  return result;
}

/**
 * Get language metadata by language ID
 */
export function getLanguageMeta(languageId: LanguageId) {
  return LANGUAGES.find((l) => l.id === languageId) || LANGUAGES[0];
}

/**
 * Locale-aware number formatter
 */
export function formatNumber(value: number, language: LanguageId): string {
  const meta = getLanguageMeta(language);
  try {
    return new Intl.NumberFormat(meta.locale || 'en-IN').format(value);
  } catch (e) {
    return new Intl.NumberFormat('en-IN').format(value);
  }
}

/**
 * Locale-aware currency formatter (INR)
 */
export function formatCurrency(value: number, language: LanguageId): string {
  const formattedNum = formatNumber(value, language);
  return `₹${formattedNum}`;
}

/**
 * Locale-aware date formatter
 */
export function formatDate(dateInput: number | Date | string, language: LanguageId): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const meta = getLanguageMeta(language);
  try {
    return new Intl.DateTimeFormat(meta.locale || 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
