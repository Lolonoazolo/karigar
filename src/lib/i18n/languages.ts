import { Language } from '@/types';

export const LANGUAGES: Language[] = [
  { id: 'english', code: 'en', locale: 'en-IN', nameNative: 'English', nameEnglish: 'English', available: true, dir: 'ltr' },
  { id: 'hindi', code: 'hi', locale: 'hi-IN', nameNative: 'हिन्दी', nameEnglish: 'Hindi', available: true, dir: 'ltr' },
  { id: 'bengali', code: 'bn', locale: 'bn-IN', nameNative: 'বাংলা', nameEnglish: 'Bengali', available: true, dir: 'ltr' },
  { id: 'marathi', code: 'mr', locale: 'mr-IN', nameNative: 'मराठी', nameEnglish: 'Marathi', available: true, dir: 'ltr' },
  { id: 'gujarati', code: 'gu', locale: 'gu-IN', nameNative: 'ગુજરાતી', nameEnglish: 'Gujarati', available: true, dir: 'ltr' },
  { id: 'tamil', code: 'ta', locale: 'ta-IN', nameNative: 'தமிழ்', nameEnglish: 'Tamil', available: true, dir: 'ltr' },
  { id: 'telugu', code: 'te', locale: 'te-IN', nameNative: 'తెలుగు', nameEnglish: 'Telugu', available: true, dir: 'ltr' },
  { id: 'kannada', code: 'kn', locale: 'kn-IN', nameNative: 'ಕನ್ನಡ', nameEnglish: 'Kannada', available: true, dir: 'ltr' },
  { id: 'malayalam', code: 'ml', locale: 'ml-IN', nameNative: 'മലയാളം', nameEnglish: 'Malayalam', available: true, dir: 'ltr' },
  { id: 'punjabi', code: 'pa', locale: 'pa-IN', nameNative: 'ਪੰਜਾਬੀ', nameEnglish: 'Punjabi', available: true, dir: 'ltr' },
];

export type LanguageId = 'english' | 'hindi' | 'bengali' | 'marathi' | 'gujarati' | 'tamil' | 'telugu' | 'kannada' | 'malayalam' | 'punjabi';
