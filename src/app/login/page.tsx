'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Phone, Key, ArrowRight, Lock, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp, normalizePhoneNumber, isValidIndianPhone } from '@/services/authService';
import { getProfile, getArtisanProfile } from '@/services/profileService';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, toast, showToast } = useArtisan();
  const { t, language } = useLanguage();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      router.replace('/profile');
    }
  }, [user, router]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const normalized = normalizePhoneNumber(phone);
    if (!isValidIndianPhone(normalized)) {
      setErrors({ phone: 'Kripya 10-digit ka sahi Indian mobile number bharein.' });
      showToast('Kripya 10-digit ka sahi Indian mobile number bharein.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPhoneOtp(phone);
      setStep('otp');
      setResendTimer(30);
      showToast(`SMS OTP +91 ${phone.slice(-10)} par bhej diya gaya hai.`);
    } catch (err: any) {
      showToast(err.message || 'OTP bhejane mein samasya aayi.');
      setErrors({ phone: err.message || 'OTP bhejane mein samasya aayi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setErrors({});
    setIsSubmitting(true);
    try {
      await sendPhoneOtp(phone);
      setResendTimer(30);
      showToast('Naya OTP code bhej diya gaya hai.');
    } catch (err: any) {
      showToast(err.message || 'OTP resend karne mein samasya aayi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp.trim() || otp.trim().length < 6) {
      setErrors({ otp: 'Kripya 6-digit ka sahi OTP code bharein.' });
      showToast('Kripya 6-digit ka OTP code bharein.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyPhoneOtp(phone, otp.trim());
      const sbUser = res.user;

      if (!sbUser) {
        throw new Error('Authentication failed. User not returned.');
      }

      // Check if artisan profile exists in database
      const profile = await getProfile(sbUser.id);
      const artisan = await getArtisanProfile(sbUser.id);

      const hasExistingProfile = Boolean(profile?.full_name || artisan?.craft_type);

      await login({
        id: sbUser.id,
        email: sbUser.email || '',
        mobile: normalizePhoneNumber(phone),
        name: profile?.full_name || sbUser.user_metadata?.full_name || '',
        shop: profile?.craft || artisan?.craft_type || '',
        craft: profile?.craft || artisan?.craft_type || '',
        location: profile?.location || artisan?.location || '',
        lang: profile?.preferred_language || language,
        bio: profile?.bio || artisan?.bio || '',
      });

      if (hasExistingProfile) {
        showToast('Login safal raha!');
        router.replace('/profile');
      } else {
        showToast('Naya account detected! Kripya apna profile setup karein.');
        router.replace('/onboarding/profile');
      }
    } catch (err: any) {
      showToast(err.message || 'OTP verification fail ho gaya.');
      setErrors({ otp: err.message || 'OTP code galat hai.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message={toast.message} visible={toast.visible} />

      <header className="px-5 py-4 flex items-center justify-between border-b border-[#c4c8bc]/30 sticky top-0 bg-[#faf6f0] z-20">
        {step === 'otp' ? (
          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
              setErrors({});
            }}
            className="p-1.5 -ml-1 rounded-full hover:bg-[#f0ece4] transition-colors text-[#2e3230] flex items-center gap-1 font-label text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 rtl-flip" />
            <span>Change Number</span>
          </button>
        ) : (
          <span className="font-headline font-bold text-[#4a7c59] text-base">
            ArtSathi Phone Login
          </span>
        )}
        <Sparkles className="w-5 h-5 text-[#4a7c59]" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 space-y-6">
        {/* Header Graphic & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-3xl soft-shadow border border-[#4a7c59]/20">
            🏺
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-[#2e3230]">
            {step === 'phone' ? 'Namaste Karigar!' : 'Verify Mobile OTP'}
          </h1>
          <p className="font-label text-xs text-[#6b6358] max-w-xs mx-auto">
            {step === 'phone'
              ? 'Aapka mobile number hi aapka ArtSathi login hai.'
              : `Humne +91 ${phone.slice(-10)} par 6-digit SMS code bheja hai.`}
          </p>
        </div>

        {/* STEP 1: Phone Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="98765 43210"
              prefixText="🇮🇳 +91"
              leftIcon={<Phone className="w-5 h-5 text-[#74796e]" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              error={errors.phone}
              maxLength={10}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting || phone.length < 10}
                icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
              >
                {isSubmitting ? 'Sending OTP SMS...' : 'Send OTP Code'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
            <Input
              label="6-Digit OTP Code"
              type="text"
              placeholder="••••••"
              leftIcon={<Key className="w-5 h-5 text-[#74796e]" />}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
              error={errors.otp}
              maxLength={6}
              required
            />

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting || otp.length < 6}
                icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
              >
                {isSubmitting ? 'Verifying OTP...' : 'Verify & Sign In'}
              </Button>

              <div className="flex items-center justify-between text-xs font-label pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isSubmitting}
                  className={`flex items-center gap-1 font-bold ${
                    resendTimer > 0 ? 'text-[#6b6358] cursor-not-allowed' : 'text-[#4a7c59] hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setErrors({});
                  }}
                  className="text-[#6b6358] hover:text-[#2e3230] underline"
                >
                  Change Number
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="text-center pt-2">
          <p className="font-label text-xs text-[#6b6358] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>Supabase Phone SMS Authentication</span>
          </p>
        </div>
      </main>
    </MobilePage>
  );
}
