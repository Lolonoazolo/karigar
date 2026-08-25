'use client';

import React from 'react';
import { MobilePage } from '@/components/layout/MobilePage';
import { ArtisanHeader } from '@/components/layout/ArtisanHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Toast } from '@/components/ui/Toast';
import { useArtisan } from '@/context/ArtisanContext';

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useArtisan();

  return (
    <MobilePage hasBottomNav={true}>
      <Toast message={toast.message} visible={toast.visible} />
      <ArtisanHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <BottomNavigation />
    </MobilePage>
  );
}
