'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { useArtisan } from '@/context/ArtisanContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { ArrowLeft, ArrowRight, User, Store, Lock, Sparkles } from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { login, demoLogin, toast, showToast, selectedLang } = useArtisan();

  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [bio, setBio] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!mobile.trim()) {
      errs.mobile = 'Kripya apna mobile number enter karein.';
    } else if (mobile.replace(/\D/g, '').length < 10) {
      errs.mobile = 'Mobile number 10 digits ka hona chahiye.';
    }

    if (!name.trim()) {
      errs.name = 'Kripya apna naam enter karein.';
    }

    if (!shop.trim()) {
      errs.shop = 'Kripya apni dukaan ya business ka naam enter karein.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Kripya sabhi zaroori jaankari bharein.');
      return;
    }

    login({
      mobile: mobile.trim(),
      name: name.trim(),
      shop: shop.trim(),
      lang: selectedLang || 'Hindi',
      bio: bio.trim(),
    });

    router.push('/artisan/products');
  };

  const handleDemoClick = () => {
    demoLogin();
    router.push('/artisan/products');
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#c4c8bc]/30 sticky top-0 bg-[#faf6f0] z-20">
        <button
          onClick={() => router.push('/onboarding/language')}
          className="p-2 -ml-2 rounded-full hover:bg-[#f0ece4] transition-colors text-[#2e3230]"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-headline font-bold text-[#4a7c59] text-base">
          KarigarAI Profile Setup
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
              <h2 className="font-headline font-bold text-xl text-[#2e3230]">Swagat hai 👋</h2>
              <p className="font-label text-xs text-[#4a4e4a]">Apne account ki details bharein</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSubmit} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="98765 43210"
            prefixText="🇮🇳 +91"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={errors.mobile}
            required
          />

          <Input
            label="Name"
            type="text"
            placeholder="Aapka naam"
            leftIcon={<User className="w-5 h-5 text-[#74796e]" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="Shop / Business Name"
            type="text"
            placeholder="Dukaan ka naam"
            leftIcon={<Store className="w-5 h-5 text-[#74796e]" />}
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            error={errors.shop}
            required
          />

          {/* Voice Story Section */}
          <div className="pt-4 border-t border-[#f0ece4] space-y-3">
            <div className="text-center">
              <h3 className="font-headline font-bold text-lg text-[#2e3230]">
                Apne baare mein batayein
              </h3>
              <p className="font-label text-xs text-[#6b6358]">
                Aap bolkar apni kahani bata sakti hain.
              </p>
            </div>

            <VoiceRecorder
              onTranscriptComplete={(text) => setBio(text)}
              promptText="Apna naam, kitne saal se ye kaam kar rahe hain aur apne craft ke baare mein batayein."
            />

            {/* Alternative text bio button */}
            <div className="text-center">
              {!showTextInput ? (
                <button
                  type="button"
                  onClick={() => setShowTextInput(true)}
                  className="font-label text-xs font-semibold text-[#6b6358] hover:text-[#4a7c59] underline underline-offset-4"
                >
                  Nahi, likhna chahti hu
                </button>
              ) : (
                <div className="space-y-2 text-left">
                  <label className="block font-label text-xs font-semibold text-[#4a4e4a]">
                    Apni kahani likhein
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Apne craft aur अनुभव ke baare mein likho..."
                    className="w-full bg-[#f5f1ea] border border-[#c4c8bc]/60 rounded-xl p-3 text-sm text-[#2e3230] focus:ring-2 focus:ring-[#4a7c59] focus:outline-none font-body resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              fullWidth
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Profile Setup karein
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="md"
              onClick={handleDemoClick}
              icon={<Sparkles className="w-4 h-4 text-[#4a7c59]" />}
              iconPosition="left"
            >
              Demo Artisan ke roop mein dekhein
            </Button>
          </div>
        </form>

        {/* Security Reassurance */}
        <div className="text-center pt-2 pb-4">
          <p className="font-label text-xs text-[#6b6358] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>Aapki jaankari surakshit hai</span>
          </p>
        </div>
      </main>
    </MobilePage>
  );
}
