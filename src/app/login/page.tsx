'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Mail, Lock, Key, ArrowRight, Sparkles, ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { signInWithEmail } from '@/services/authService';
import { getProfile, getArtisanProfile } from '@/services/profileService';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, toast, showToast } = useArtisan();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      router.replace('/artisan/products');
    }
  }, [user, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrors({ email: 'कृपया सही ईमेल दर्ज करें।' });
      showToast('कृपया सही ईमेल दर्ज करें।');
      return;
    }

    if (!password) {
      setErrors({ password: 'कृपया अपना पासवर्ड दर्ज करें।' });
      showToast('कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Authenticate against REAL Supabase Auth
      const res = await signInWithEmail(cleanEmail, password);
      const sbUser = res.user;

      if (!sbUser) {
        throw new Error('Authentication failed. User not returned.');
      }

      // 2. Query public.artisans using sbUser.id
      const artisan = await getArtisanProfile(sbUser.id);

      const hasExistingProfile = Boolean(artisan?.craft_type || artisan?.location || artisan?.bio || sbUser.user_metadata?.full_name);

      // 3. Sync ArtisanContext Session
      await login({
        id: sbUser.id,
        email: sbUser.email || cleanEmail,
        mobile: artisan?.phone || sbUser.user_metadata?.mobile || '',
        name: artisan?.name || artisan?.nam || sbUser.user_metadata?.full_name || '',
        shop: artisan?.craft_type || artisan?.shop || '',
        craft: artisan?.craft_type || artisan?.craft || '',
        location: artisan?.location || '',
        lang: artisan?.language || language,
        bio: artisan?.bio || '',
        artisanId: sbUser.id,
      });

      if (hasExistingProfile) {
        showToast('लॉग इन सफल रहा!');
        router.replace('/artisan/products');
      } else {
        showToast('नया खाता! कृपया अपना प्रोफ़ाइल सेटअप करें।');
        router.replace('/onboarding/profile');
      }
    } catch (err: any) {
      showToast(err.message || 'लॉग इन करने में समस्या आई।');
      setErrors({ email: err.message || 'ईमेल या पासवर्ड सही नहीं है।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#c4c8bc]/30 sticky top-0 bg-[#faf6f0] z-20">
        <button
          onClick={() => router.push('/onboarding/profile')}
          className="p-2 -ml-2 rounded-full hover:bg-[#f0ece4] transition-colors text-[#2e3230]"
          aria-label={t('accessibility.back')}
        >
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </button>
        <span className="font-headline font-bold text-[#4a7c59] text-base">
          KarigarAI लॉग इन
        </span>
        <Sparkles className="w-5 h-5 text-[#4a7c59]" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 space-y-5">
        {/* TWO PATH SWITCHER TABS */}
        <div className="flex items-center p-1.5 bg-[#eae6de] rounded-2xl border border-[#c4c8bc]/40">
          <button
            type="button"
            onClick={() => router.push('/onboarding/profile')}
            className="flex-1 py-2.5 px-3 text-xs font-headline font-semibold rounded-xl transition-all text-[#6b6358] hover:text-[#2e3230] hover:bg-[#faf6f0]/60 flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>नया खाता बनाएँ</span>
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 px-3 text-xs font-headline font-bold rounded-xl transition-all bg-[#4a7c59] text-white soft-shadow flex items-center justify-center gap-1.5"
          >
            <span>🔑 लॉग इन करें</span>
          </button>
        </div>

        {/* Header Graphic & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-16 h-16 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-3xl soft-shadow border border-[#4a7c59]/20">
            🏺
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-[#2e3230]">
            फिर से स्वागत है 👋
          </h1>
          <p className="font-label text-xs text-[#6b6358] max-w-xs mx-auto">
            अपने KarigarAI खाते में लॉग इन करें
          </p>
        </div>

        {/* EMAIL & PASSWORD LOGIN FORM */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
          <Input
            label="ईमेल *"
            type="email"
            placeholder="अपना ईमेल दर्ज करें"
            leftIcon={<Mail className="w-5 h-5 text-[#74796e]" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <div className="relative">
            <Input
              label="पासवर्ड *"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5 text-[#74796e]" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[#74796e] hover:text-[#2e3230]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-xs font-label font-bold text-[#4a7c59] hover:underline"
            >
              पासवर्ड भूल गए?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSubmitting || !email.trim() || !password}
              icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
            >
              {isSubmitting ? 'लॉग इन हो रहा है...' : 'लॉग इन करें →'}
            </Button>
          </div>
        </form>

        {/* PATH 1 ALTERNATIVE CARD: NEW ACCOUNT */}
        <div className="bg-white p-4 rounded-2xl border border-[#c4c8bc]/40 text-center space-y-3 soft-shadow">
          <div className="space-y-1">
            <p className="font-headline font-bold text-sm text-[#2e3230]">
              नया खाता बनाना है?
            </p>
            <p className="font-label text-xs text-[#6b6358]">
              यदि आपका खाता नहीं बना है, तो नया खाता बनाएँ।
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => router.push('/onboarding/profile')}
          >
            ✨ नया खाता बनाएँ
          </Button>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center pt-1 pb-4">
          <p className="font-label text-xs text-[#6b6358] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>सुरक्षित एवं निजी | Supabase Auth Email Encryption</span>
          </p>
        </div>
      </main>
    </MobilePage>
  );
}
