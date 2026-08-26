import type { Metadata, Viewport } from 'next';
import { Literata, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
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
    <html lang="hi" dir="ltr" className={`${literata.variable} ${nunitoSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700;800&family=Noto+Sans+Gujarati:wght@400;600;700;800&family=Noto+Sans+Gurmukhi:wght@400;600;700;800&family=Noto+Sans+Kannada:wght@400;600;700;800&family=Noto+Sans+Malayalam:wght@400;600;700;800&family=Noto+Sans+Tamil:wght@400;600;700;800&family=Noto+Sans+Telugu:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#faf6f0] text-[#2e3230] font-body antialiased min-h-screen">
        <LanguageProvider>
          <ArtisanProvider>
            <ProductDraftProvider>{children}</ProductDraftProvider>
          </ArtisanProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
