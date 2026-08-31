'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, User, Store, Lock, Phone, MapPin, Key, Sparkles, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { signUpWithEmail, normalizePhoneNumber, isValidIndianPhone } from '@/services/authService';
import { updateArtisanFullProfile } from '@/services/profileService';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, login, updateProfile, logout, toast, showToast } = useArtisan();
  const { t, language } = useLanguage();

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
      setShop(user.shop || user.craft || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!user?.id) {
      if (!email.trim() || !email.includes('@')) {
        errs.email = 'कृपया सही ईमेल दर्ज करें।';
      }

      if (!password || password.length < 6) {
        errs.password = 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।';
      }

      if (password !== confirmPassword) {
        errs.confirmPassword = 'दोनों पासवर्ड एक जैसे होने चाहिए।';
      }
    }

    if (!name.trim()) {
      errs.name = 'नाम भरना आवश्यक है।';
    }

    if (!shop.trim()) {
      errs.shop = 'दुकान या बिज़नेस का नाम भरना आवश्यक है।';
    }

    if (mobile.trim() && !isValidIndianPhone(mobile.trim())) {
      errs.mobile = 'कृपया 10-अंकों का सही भारतीय मोबाइल नंबर भरें।';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('कृपया सभी आवश्यक फ़ील्ड सही भरें।');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // CASE 1: ALREADY AUTHENTICATED USER UPDATING PROFILE
      if (user?.id) {
        await updateProfile({
          name: name.trim(),
          shop: shop.trim(),
          craft: shop.trim(),
          location: location.trim(),
          mobile: mobile.trim() || user.mobile || '',
        });

        showToast('प्रोफ़ाइल सफलतापूर्वक सेट हो गई!');
        router.push('/artisan/products');
        return;
      }

      // CASE 2: NEW ARTISAN SIGNUP WITH SUPABASE AUTH EMAIL + PASSWORD
      const signUpRes = await signUpWithEmail(email, password, { full_name: name.trim() });
      const sbUser = signUpRes.user;

      if (!sbUser) {
        throw new Error('Supabase authentication failed. User not created.');
      }

      // Check if Supabase requires email verification link before creating active session
      if (!signUpRes.session && sbUser.identities && sbUser.identities.length > 0) {
        setVerificationSent(true);
        showToast('आपके ईमेल पर verification link भेजा गया है। कृपया ईमेल verify करके लॉग इन करें।');
        return;
      }

      // Create/Update Profile in public.artisans using sbUser.id
      await updateArtisanFullProfile(sbUser.id, {
        name: name.trim(),
        craft: shop.trim(),
        location: location.trim(),
        mobile: mobile.trim() ? normalizePhoneNumber(mobile) : '',
      });

      // Update ArtisanContext Session
      await login({
        id: sbUser.id,
        email: sbUser.email || email.trim(),
        mobile: mobile.trim() ? normalizePhoneNumber(mobile) : '',
        name: name.trim(),
        shop: shop.trim(),
        craft: shop.trim(),
        location: location.trim(),
        lang: language,
        artisanId: sbUser.id,
      });

      showToast('खाता एवं प्रोफ़ाइल सफलतापूर्वक बन गया!');
      router.replace('/artisan/products');
    } catch (err: any) {
      showToast(err.message || 'खाता बनाने में समस्या आई। कृपया फिर कोशिश करें।');
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
          KarigarAI प्रोफ़ाइल सेटअप
        </span>
        <Sparkles className="w-5 h-5 text-[#4a7c59]" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 space-y-5">
        {/* TWO PATH SWITCHER TABS */}
        <div className="flex items-center p-1.5 bg-[#eae6de] rounded-2xl border border-[#c4c8bc]/40">
          <button
            type="button"
            className="flex-1 py-2.5 px-3 text-xs font-headline font-bold rounded-xl transition-all bg-[#4a7c59] text-white soft-shadow flex items-center justify-center gap-1.5"
          >
            <span>✨ नया खाता बनाएँ</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex-1 py-2.5 px-3 text-xs font-headline font-semibold rounded-xl transition-all text-[#6b6358] hover:text-[#2e3230] hover:bg-[#faf6f0]/60 flex items-center justify-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>लॉग इन करें</span>
          </button>
        </div>

        {/* Banner */}
        <div className="w-full h-32 rounded-2xl overflow-hidden soft-shadow relative bg-[#eae6de] flex items-center justify-center border border-[#c4c8bc]/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8e8d0] to-[#f8e0a8] opacity-80" />
          <div className="absolute bottom-3 left-4 flex items-center gap-3 relative z-10">
            <span className="text-4xl">🏺</span>
            <div>
              <h2 className="font-headline font-bold text-xl text-[#2e3230]">
                स्वागत है 👋
              </h2>
              <p className="font-label text-xs text-[#4a4e4a]">
                अपना KarigarAI खाता बनाएँ
              </p>
            </div>
          </div>
        </div>

        {/* EMAIL VERIFICATION NOTICE IF REQUIRED BY SUPABASE */}
        {verificationSent ? (
          <div className="bg-white p-6 rounded-2xl border border-[#4a7c59]/40 soft-shadow text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-3xl">
              <CheckCircle className="w-10 h-10 text-[#4a7c59]" />
            </div>
            <h3 className="font-headline font-extrabold text-lg text-[#2e3230]">
              ईमेल सत्यापन लिंक भेजा गया!
            </h3>
            <p className="font-label text-xs text-[#6b6358] leading-relaxed">
              आपके ईमेल <strong>{email}</strong> पर verification link भेजा गया है। कृपया अपना ईमेल खोलकर लिंक पर क्लिक करें और फिर लॉग इन करें।
            </p>
            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => router.push('/login')}
            >
              लॉग इन पेज पर जाएँ →
            </Button>
          </div>
        ) : (
          /* NEW ARTISAN SIGNUP & PROFILE FORM */
          <form onSubmit={handleProfileSubmit} className="space-y-5 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
            
            {/* SECTION 1: ACCOUNT DETAILS (Only shown for unauthenticated visitors) */}
            {!user?.id && (
              <div className="space-y-3 border-b border-[#c4c8bc]/20 pb-4">
                <h3 className="font-headline font-bold text-sm text-[#4a7c59] flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>खाता विवरण (ACCOUNT DETAILS)</span>
                </h3>

                <Input
                  label="ईमेल *"
                  type="email"
                  placeholder="अपना ईमेल दर्ज करें (jaise: artisan@gmail.com)"
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
                    placeholder="कम से कम 6 अक्षर"
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

                <div className="relative">
                  <Input
                    label="पासवर्ड दोबारा डालें *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                    leftIcon={<Lock className="w-5 h-5 text-[#74796e]" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-[#74796e] hover:text-[#2e3230]"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 2: PROFILE DETAILS */}
            <div className="space-y-3">
              <h3 className="font-headline font-bold text-sm text-[#4a7c59] flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>प्रोफ़ाइल विवरण (PROFILE DETAILS)</span>
              </h3>

              <Input
                label="नाम *"
                type="text"
                placeholder="आपका नाम दर्ज करें"
                leftIcon={<User className="w-5 h-5 text-[#74796e]" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />

              <Input
                label="दुकान / बिज़नेस का नाम *"
                type="text"
                placeholder="अपनी दुकान या craft का नाम दर्ज करें"
                leftIcon={<Store className="w-5 h-5 text-[#74796e]" />}
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                error={errors.shop}
                required
              />

              <Input
                label="मोबाइल नंबर"
                type="tel"
                placeholder="98765 43210 (वैकल्पिक)"
                prefixText="🇮🇳 +91"
                leftIcon={<Phone className="w-5 h-5 text-[#74796e]" />}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                error={errors.mobile}
                maxLength={10}
              />

              <Input
                label="स्थान"
                type="text"
                placeholder="जैसे: Varanasi, Uttar Pradesh"
                leftIcon={<MapPin className="w-5 h-5 text-[#74796e]" />}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Submit CTA Button */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting}
                icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
              >
                {isSubmitting
                  ? 'खाता बनाया जा रहा है...'
                  : user?.id
                  ? 'प्रोफ़ाइल अपडेट करें →'
                  : 'खाता बनाएँ और प्रोफ़ाइल पूरा करें →'}
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
        )}

        {/* PATH 2: EXISTING ARTISAN ALTERNATIVE LOGIN CARD */}
        <div className="bg-white p-4 rounded-2xl border border-[#c4c8bc]/40 text-center space-y-3 soft-shadow">
          <div className="space-y-1">
            <p className="font-headline font-bold text-sm text-[#2e3230]">
              पहले से खाता है?
            </p>
            <p className="font-label text-xs text-[#6b6358]">
              यदि आप पहले से पंजीकृत हैं, तो सीधे अपने ईमेल एवं पासवर्ड से लॉग इन करें।
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="md"
            icon={<Key className="w-4 h-4" />}
            onClick={() => router.push('/login')}
          >
            पहले से खाता है? लॉग इन करें 🔑
          </Button>
        </div>

        {/* Security Reassurance */}
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
