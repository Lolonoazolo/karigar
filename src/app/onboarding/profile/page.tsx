'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, User, Store, Lock, Phone, MapPin } from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateProfile, logout, toast, showToast } = useArtisan();
  const { t } = useLanguage();

  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setShop(user.shop || user.craft || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = t('onboarding.errNameRequired');
    }

    if (!shop.trim()) {
      errs.shop = t('onboarding.errShopRequired');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast(t('onboarding.errFillAll'));
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        shop: shop.trim(),
        craft: shop.trim(),
        location: location.trim(),
        mobile: mobile.trim() || user?.mobile || '',
      });

      showToast('Profile safalta purvak create ho gaya!');
      router.push('/artisan/products');
    } catch (err: any) {
      showToast(err.message || 'Profile setup karne mein samasya aayi.');
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
          onClick={() => router.push('/login')}
          className="p-2 -ml-2 rounded-full hover:bg-[#f0ece4] transition-colors text-[#2e3230]"
          aria-label={t('accessibility.back')}
        >
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </button>
        <span className="font-headline font-bold text-[#4a7c59] text-base">
          {t('onboarding.profileTitle')}
        </span>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 space-y-6">
        {/* Banner */}
        <div className="w-full h-32 rounded-2xl overflow-hidden soft-shadow relative bg-[#eae6de] flex items-center justify-center border border-[#c4c8bc]/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8e8d0] to-[#f8e0a8] opacity-80" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2 relative z-10">
            <span className="text-3xl">🏺</span>
            <div>
              <h2 className="font-headline font-bold text-xl text-[#2e3230]">
                {t('onboarding.welcomeTitle')}
              </h2>
              <p className="font-label text-xs text-[#4a4e4a]">
                {t('onboarding.welcomeSub')}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Setup Form */}
        <form onSubmit={handleProfileSubmit} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
          <Input
            label={t('onboarding.nameLabel')}
            type="text"
            placeholder={t('onboarding.namePlaceholder')}
            leftIcon={<User className="w-5 h-5 text-[#74796e]" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label={t('onboarding.shopLabel')}
            type="text"
            placeholder={t('onboarding.shopPlaceholder')}
            leftIcon={<Store className="w-5 h-5 text-[#74796e]" />}
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            error={errors.shop}
            required
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            leftIcon={<Phone className="w-5 h-5 text-[#74796e]" />}
            value={mobile || user?.mobile || ''}
            onChange={(e) => setMobile(e.target.value)}
            disabled={Boolean(user?.mobile)}
            helperText="Phone OTP dwara verified mobile number"
          />

          <Input
            label="Location / Sthan"
            type="text"
            placeholder="Jaise: Varanasi, Uttar Pradesh"
            leftIcon={<MapPin className="w-5 h-5 text-[#74796e]" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* Action CTAs */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSubmitting}
              icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
            >
              {isSubmitting ? 'Saving Profile...' : t('onboarding.submitProfile')}
            </Button>

            {user && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                size="md"
                onClick={logout}
              >
                Log Out Current Session
              </Button>
            )}
          </div>
        </form>

        {/* Security Reassurance */}
        <div className="text-center pt-2 pb-4">
          <p className="font-label text-xs text-[#6b6358] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>{t('onboarding.securityNote')}</span>
          </p>
        </div>
      </main>
    </MobilePage>
  );
}
