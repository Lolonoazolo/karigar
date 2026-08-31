'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Sparkles, Lock } from 'lucide-react';
import { resetPasswordForEmail } from '@/services/authService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [error, setError] = useState('');

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया सही ईमेल दर्ज करें।');
      showToast('कृपया सही ईमेल दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(cleanEmail);
      setEmailSent(true);
      showToast('पासवर्ड रीसेट लिंक भेज दिया गया है!');
    } catch (err: any) {
      showToast(err.message || 'ईमेल भेजने में समस्या आई।');
      setError(err.message || 'ईमेल भेजने में समस्या आई।');
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
          aria-label="Back to login"
        >
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </button>
        <span className="font-headline font-bold text-[#4a7c59] text-base">
          पासवर्ड रीसेट
        </span>
        <Sparkles className="w-5 h-5 text-[#4a7c59]" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 space-y-6">
        {/* Header Graphic & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-3xl soft-shadow border border-[#4a7c59]/20">
            🔑
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-[#2e3230]">
            पासवर्ड भूल गए?
          </h1>
          <p className="font-label text-xs text-[#6b6358] max-w-xs mx-auto">
            अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट लिंक भेजेंगे।
          </p>
        </div>

        {emailSent ? (
          <div className="bg-white p-6 rounded-2xl border border-[#4a7c59]/40 soft-shadow text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-[#4a7c59] mx-auto" />
            <h3 className="font-headline font-bold text-base text-[#2e3230]">
              ईमेल भेज दिया गया है!
            </h3>
            <p className="font-label text-xs text-[#6b6358] leading-relaxed">
              हमने <strong>{email}</strong> पर पासवर्ड रीसेट लिंक भेज दिया है। कृपया अपना ईमेल चेक करें और दिए गए लिंक से नया पासवर्ड सेट करें।
            </p>
            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => router.push('/login')}
            >
              लॉग इन पेज पर वापस जाएँ →
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 bg-white p-5 rounded-2xl soft-shadow border border-[#c4c8bc]/30">
            <Input
              label="पंजीकृत ईमेल *"
              type="email"
              placeholder="अपना ईमेल दर्ज करें"
              leftIcon={<Mail className="w-5 h-5 text-[#74796e]" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting || !email.trim()}
                icon={<ArrowRight className="w-5 h-5 rtl-flip" />}
              >
                {isSubmitting ? 'ईमेल भेजा जा रहा है...' : 'रीसेट लिंक भेजें →'}
              </Button>
            </div>
          </form>
        )}

        {/* Security Reassurance */}
        <div className="text-center pt-2">
          <p className="font-label text-xs text-[#6b6358] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4a7c59]" />
            <span>सुरक्षित एवं निजी | Supabase Auth Password Reset</span>
          </p>
        </div>
      </main>
    </MobilePage>
  );
}
