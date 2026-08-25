import type { Metadata, Viewport } from 'next';
import { Literata, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { ArtisanProvider } from '@/context/ArtisanContext';
import { ProductDraftProvider } from '@/context/ProductDraftContext';

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KarigarAI — Aap banayein, AI sambhale.',
  description:
    'AI-powered mobile application designed for Indian artisans and micro-entrepreneurs.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${literata.variable} ${nunitoSans.variable}`}>
      <body className="bg-[#faf6f0] text-[#2e3230] font-body antialiased min-h-screen">
        <ArtisanProvider>
          <ProductDraftProvider>{children}</ProductDraftProvider>
        </ArtisanProvider>
      </body>
    </html>
  );
}
