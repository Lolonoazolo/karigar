'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArtisan } from '@/context/ArtisanContext';

export default function Home() {
  const router = useRouter();
  const { user } = useArtisan();

  useEffect(() => {
    if (user) {
      router.replace('/artisan/products');
    } else {
      router.replace('/onboarding/language');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-[#4a7c59] border-t-transparent rounded-full spinner mb-4" />
      <h1 className="font-headline text-2xl font-bold text-[#4a7c59]">KarigarAI</h1>
      <p className="font-label text-sm text-[#6b6358] mt-1">Aap banayein, AI sambhale.</p>
    </div>
  );
}
