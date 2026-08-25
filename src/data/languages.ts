import { Language } from '@/types';

export const LANGUAGES: Language[] = [
  { id: 'hindi', nameNative: 'हिंदी', nameEnglish: 'Hindi', available: true },
  { id: 'english', nameNative: 'English', nameEnglish: 'English', available: true },
  { id: 'marathi', nameNative: 'मराठी', nameEnglish: 'Marathi', available: true },
  { id: 'bengali', nameNative: 'বাংলা', nameEnglish: 'Bengali', available: true },
  { id: 'gujarati', nameNative: 'ગુજરાતી', nameEnglish: 'Gujarati', available: true },
  { id: 'tamil', nameNative: 'தமிழ்', nameEnglish: 'Tamil', available: false },
  { id: 'telugu', nameNative: 'తెలుగు', nameEnglish: 'Telugu', available: false },
  { id: 'kannada', nameNative: 'ಕನ್ನಡ', nameEnglish: 'Kannada', available: false },
];
