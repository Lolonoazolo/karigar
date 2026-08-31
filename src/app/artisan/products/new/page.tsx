'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { useProductDraft } from '@/context/ProductDraftContext';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProductDataSchema, ProductCategory } from '@/types';
import { createProductWithTranslations } from '@/services/productService';
import { processProductAI } from '@/services/ai/productProcessor';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Trash2,
  ArrowRight,
  Globe,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';

type GuidanceContent = {
  header: string;
  body: string;
  toggleBtn: string;
  example: string;
  placeholder: string;
  processBtn: string;
};

const GUIDANCE_DICTIONARY: Record<string, GuidanceContent> = {
  hindi: {
    header: '💡 ऐसे बोलें:',
    body: 'उत्पाद का नाम, इसे बनाने की कला और सामग्री, कीमत, कितने पीस हैं और इसकी खासियत बताएं।',
    toggleBtn: 'उदाहरण देखें',
    example: 'यह बनारसी सिल्क की साड़ी है, जिसे मैंने हाथ से बनाया है। यह शुद्ध सिल्क की है, इसकी कीमत 2500 रुपये है और मेरे पास 5 पीस हैं।',
    placeholder: 'जैसे: यह बनारसी सिल्क की साड़ी है, जिसकी कीमत 2500 रुपये है...',
    processBtn: 'जानकारी प्रोसेस करें ✨',
  },
  hi: {
    header: '💡 ऐसे बोलें:',
    body: 'उत्पाद का नाम, इसे बनाने की कला और सामग्री, कीमत, कितने पीस हैं और इसकी खासियत बताएं।',
    toggleBtn: 'उदाहरण देखें',
    example: 'यह बनारसी सिल्क की साड़ी है, जिसे मैंने हाथ से बनाया है। यह शुद्ध सिल्क की है, इसकी कीमत 2500 रुपये है और मेरे पास 5 पीस हैं।',
    placeholder: 'जैसे: यह बनारसी सिल्क की साड़ी है, जिसकी कीमत 2500 रुपये है...',
    processBtn: 'जानकारी प्रोसेस करें ✨',
  },
  english: {
    header: '💡 Try saying:',
    body: 'Tell us the product name, craft and material, price, quantity, and what makes it special.',
    toggleBtn: 'See example',
    example: 'This is a handmade Banarasi silk saree. It is made from pure silk, costs ₹2500, and I have 5 pieces available.',
    placeholder: 'Example: This is a handmade Banarasi silk saree priced at ₹2500...',
    processBtn: 'Process Information ✨',
  },
  en: {
    header: '💡 Try saying:',
    body: 'Tell us the product name, craft and material, price, quantity, and what makes it special.',
    toggleBtn: 'See example',
    example: 'This is a handmade Banarasi silk saree. It is made from pure silk, costs ₹2500, and I have 5 pieces available.',
    placeholder: 'Example: This is a handmade Banarasi silk saree priced at ₹2500...',
    processBtn: 'Process Information ✨',
  },
  hinglish: {
    header: '💡 Aise bol sakte hain:',
    body: 'Product ka naam, kis kala se bana hai, material, price, kitne pieces hain aur iski khasiyat bataiye.',
    toggleBtn: 'Example dekhein',
    example: 'Ye Banarasi silk ki saree hai, ise maine haath se banaya hai. Ye pure silk ki hai, iska price 2500 rupaye hai aur mere paas 5 pieces hain.',
    placeholder: 'Jaise: Ye Banarasi silk ki saree hai, iski keemat 2500 rupaye hai...',
    processBtn: 'Jankari Process Karein ✨',
  },
};

export default function AIProductListingPage() {
  const router = useRouter();
  const { draft, updateDraft, setLastSavedProduct, resetDraft } = useProductDraft();
  const { user, showToast, refreshProducts } = useArtisan();
  const { t, language } = useLanguage();

  // Active Guidance Dict
  const langKey = String(language);
  const guidance = GUIDANCE_DICTIONARY[langKey] || GUIDANCE_DICTIONARY.hindi;

  // Wizard Steps: 1 = Photo, 2 = Description, 3 = Review & Edit Form
  const [step, setStep] = useState<number>(1);
  const [showExample, setShowExample] = useState<boolean>(false);

  const [photoUrl, setPhotoUrl] = useState<string | null>(draft.photo || null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [originalDescription, setOriginalDescription] = useState<string>(draft.originalDescription || '');
  const [englishDescription, setEnglishDescription] = useState<string>(draft.description || '');
  const [detectedLanguage, setDetectedLanguage] = useState<string>(draft.originalLanguage || 'hi');

  const [productSchema, setProductSchema] = useState<ProductDataSchema>({
    product_name: draft.name || null,
    category: draft.category || null,
    craft_type: draft.craftType || null,
    material: draft.material || null,
    description: draft.description || null,
    price: draft.price || null,
    currency: 'INR',
    quantity: draft.stock || null,
    color: draft.color || null,
    dimensions: null,
    weight: null,
    production_time_days: draft.productionTimeDays || null,
    origin: draft.origin || null,
    care_instructions: null,
    tags: draft.tags || [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 1. Photo Selection Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPhotoUrl(url);
      updateDraft({ photo: url, enhancedPhoto: url });
      setIsLoading(false);
      showToast('Product photo select ho gayi!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    updateDraft({ photo: null, enhancedPhoto: null });
  };

  // 2. Submit Complete Description to AI Processing Pipeline
  const handleDescriptionSubmit = async (descText: string) => {
    const hasText = Boolean(descText && descText.trim());
    const hasAudio = Boolean(recordedAudioBlob && recordedAudioBlob.size > 0);

    if (!hasText && !hasAudio) {
      showToast('कृपया अपनी उत्पाद जानकारी बोलें या लिखें।');
      return;
    }

    setIsLoading(true);
    if (hasText) {
      setOriginalDescription(descText.trim());
    }

    try {
      const data = await processProductAI({
        action: 'process_description',
        description: descText.trim(),
        audioBlob: recordedAudioBlob,
        language: String(language),
        imageUrl: photoUrl || undefined,
        currentProduct: productSchema,
        artisanId: user?.id,
      });

      setDetectedLanguage(data.detected_language || String(language));
      setEnglishDescription(data.english_description || descText.trim());
      setProductSchema(data.product);

      if (data.original_description) {
        setOriginalDescription(data.original_description);
      }

      updateDraft({
        name: data.product.product_name || undefined,
        category: (data.product.category as ProductCategory) || undefined,
        craftType: data.product.craft_type || undefined,
        material: data.product.material || undefined,
        description: data.english_description || undefined,
        price: data.product.price || undefined,
        stock: data.product.quantity || undefined,
        color: data.product.color || undefined,
        originalLanguage: data.detected_language,
        originalDescription: data.original_description || descText.trim(),
      });

      // DIRECT ROUTE TO REVIEW & EDIT FORM (No question interview loop!)
      setStep(3);
    } catch (err: any) {
      showToast(err.message || 'AI processing error. Kripya punah prayas karein.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Confirm & Save Product to KarigarAI Supabase Database
  const handleConfirmAndSave = async () => {
    if (!productSchema.product_name || !productSchema.price) {
      showToast('कृपया कम से कम उत्पाद का नाम और कीमत भरें।');
      return;
    }

    if (!user?.id) {
      showToast('No active user session. Please log in first.');
      return;
    }

    setIsLoading(true);

    try {
      const savedProduct = await createProductWithTranslations(user.id, {
        productName: productSchema.product_name,
        category: productSchema.category || 'Handmade',
        craftType: productSchema.craft_type || productSchema.category || 'Craft',
        material: productSchema.material || 'Handmade Material',
        description: englishDescription || productSchema.description || originalDescription || '',
        price: Number(productSchema.price),
        currency: productSchema.currency || 'INR',
        quantity: productSchema.quantity ? Number(productSchema.quantity) : 1,
        productionTimeDays: productSchema.production_time_days || undefined,
        photoUrl: photoUrl,
        tags: productSchema.tags || [productSchema.material || 'Handmade'],
        originalLanguage: detectedLanguage,
        originalDescription,
        englishDescription,
      });

      if (savedProduct) {
        await refreshProducts();
        setLastSavedProduct(savedProduct as any);
        resetDraft();
        showToast('Product successfully saved!');
        router.push('/artisan/products/success');
      } else {
        showToast('Product save करने में समस्या आई।');
      }
    } catch (err: any) {
      showToast(err.message || 'Product save करने में त्रुटि आई।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobilePage hasBottomNav={false}>
      <Toast message="" visible={false} />

      {/* Header */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#c4c8bc]/30 sticky top-0 bg-[#faf6f0] z-20">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              router.push('/artisan/products');
            }
          }}
          className="p-2 -ml-2 rounded-full hover:bg-[#f0ece4] text-[#2e3230] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#d8f0de] border border-[#4a7c59]/30 text-lg flex items-center justify-center">
            🤖
          </div>
          <div>
            <h1 className="font-headline font-bold text-base text-[#4a7c59] leading-none">
              KarigarAI Product Wizard
            </h1>
            <span className="font-label text-[10px] font-semibold text-[#6b6358]">
              Step {step} of 3
            </span>
          </div>
        </div>

        <div className="w-8" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-5 py-5 space-y-5 overflow-y-auto pb-12">
        {/* STEP 1: Add Product Photo */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1 text-center">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230]">
                उत्पाद की फ़ोटो जोड़ें 📸
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                सबसे पहले अपने उत्पाद की फ़ोटो लें या गैलरी से चुनें।
              </p>
            </div>

            {/* Photo Upload Area */}
            {!photoUrl ? (
              <div className="bg-white p-6 rounded-3xl border border-[#c4c8bc]/40 soft-shadow space-y-4">
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-[#f5f1ea] rounded-2xl border-2 border-dashed border-[#c4c8bc] flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0ece4] transition-colors p-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="font-headline font-bold text-base text-[#2e3230]">
                    📸 फ़ोटो खींचें
                  </span>
                  <span className="font-label text-xs text-[#6b6358]">कैमरा से फ़ोटो लें</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    fullWidth
                    size="md"
                    icon={<Camera className="w-4 h-4" />}
                  >
                    कैमरा
                  </Button>
                  <Button
                    onClick={() => galleryInputRef.current?.click()}
                    variant="secondary"
                    fullWidth
                    size="md"
                    icon={<ImageIcon className="w-4 h-4 text-[#4a7c59]" />}
                  >
                    गैलरी
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-3xl border border-[#c4c8bc]/40 soft-shadow space-y-3">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f0ece4] relative">
                  <img src={photoUrl} alt="Product" className="w-full h-full object-cover" />
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 bg-[#f5f1ea] hover:bg-[#eae6de] text-[#4a4e4a] rounded-xl font-label text-xs font-bold border border-[#c4c8bc]/40 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>फ़ोटो बदलें</span>
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    size="md"
                    className="flex-1"
                    icon={<ArrowRight className="w-4 h-4 rtl-flip" />}
                  >
                    आगे बढ़ें: विवरण →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* STEP 2: Complete Description Input with Compact Guidance Card */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1 text-center">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230]">
                उत्पाद के बारे में बताएँ 🎙️
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                आप अपनी भाषा में बोलकर या लिखकर पूरी जानकारी दे सकते हैं।
              </p>
            </div>

            {/* Photo Thumbnail */}
            {photoUrl && (
              <div className="h-28 rounded-2xl overflow-hidden bg-[#f0ece4] soft-shadow border border-[#c4c8bc]/30">
                <img src={photoUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
            )}

            {/* COMPACT LANGUAGE-AWARE GUIDANCE CARD */}
            <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#c4c8bc]/40 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-headline font-bold text-[#4a7c59]">
                <Lightbulb className="w-4 h-4 text-[#e5a93c]" />
                <span>{guidance.header}</span>
              </div>
              <p className="font-body text-[#2e3230] leading-relaxed">
                {guidance.body}
              </p>

              {/* Expandable / Collapsible Example Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowExample(!showExample)}
                  className="text-[11px] font-headline font-bold text-[#4a7c59] hover:underline flex items-center gap-1"
                >
                  <span>{guidance.toggleBtn}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExample ? 'rotate-180' : ''}`} />
                </button>

                {showExample && (
                  <div className="mt-2 bg-white p-3 rounded-xl border border-[#c4c8bc]/30 text-xs text-[#4a4e4a] italic leading-relaxed animate-fade-in">
                    &quot;{guidance.example}&quot;
                  </div>
                )}
              </div>
            </div>

            {/* Description Input Card */}
            <div className="bg-white p-5 rounded-3xl border border-[#c4c8bc]/40 soft-shadow space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-label font-bold text-[#4a7c59] bg-[#d8f0de] px-3 py-1 rounded-full w-fit">
                <Globe className="w-3.5 h-3.5" />
                <span>हिंदी एवं क्षेत्रीय भाषा supported</span>
              </div>

              <textarea
                value={originalDescription}
                onChange={(e) => setOriginalDescription(e.target.value)}
                placeholder={guidance.placeholder}
                rows={4}
                className="w-full bg-[#faf6f0] border border-[#c4c8bc]/50 rounded-2xl p-4 text-sm text-[#2e3230] font-body focus:ring-2 focus:ring-[#4a7c59] focus:outline-none"
              />

              <VoiceRecorder
                onTranscriptComplete={(text) => {
                  setOriginalDescription(text);
                }}
                onAudioRecorded={(blob, text) => {
                  setRecordedAudioBlob(blob);
                  if (text) setOriginalDescription(text);
                }}
                promptText="माइक दबाकर बोलना शुरू करें..."
              />

              <Button
                onClick={() => handleDescriptionSubmit(originalDescription)}
                disabled={isLoading || (!originalDescription.trim() && !recordedAudioBlob)}
                fullWidth
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
              >
                {isLoading ? 'उत्पाद की जानकारी समझी जा रही है...' : guidance.processBtn}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete Review & Edit Form ("✨ जानकारी तैयार है") */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-xl soft-shadow">
                <CheckCircle2 className="w-7 h-7 text-[#4a7c59]" />
              </div>
              <h2 className="font-headline font-extrabold text-2xl text-[#2e3230]">
                ✨ जानकारी तैयार है
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                नीचे अपने उत्पाद की जानकारी जाँचें और ज़रूरत हो तो बदलाव करें।
              </p>
            </div>

            {/* Editable Form Card */}
            <div className="bg-white rounded-3xl p-5 soft-shadow border border-[#c4c8bc]/40 space-y-4">
              {photoUrl && (
                <div className="h-44 rounded-2xl overflow-hidden bg-[#f0ece4]">
                  <img src={photoUrl} alt="Product" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-3.5">
                <Input
                  label="नाम *"
                  placeholder="जैसे: Banarasi Silk Saree"
                  value={productSchema.product_name || ''}
                  onChange={(e) => setProductSchema({ ...productSchema, product_name: e.target.value })}
                />

                <Input
                  label="श्रेणी *"
                  placeholder="जैसे: Saree, Pottery, Woodwork"
                  value={productSchema.category || ''}
                  onChange={(e) => setProductSchema({ ...productSchema, category: e.target.value })}
                />

                <Input
                  label="शिल्प / कला"
                  placeholder="जैसे: Handloom Weaving (वैकल्पिक)"
                  value={productSchema.craft_type || ''}
                  onChange={(e) => setProductSchema({ ...productSchema, craft_type: e.target.value })}
                />

                <Input
                  label="सामग्री"
                  placeholder="जैसे: Pure Silk, Cotton, Wood (वैकल्पिक)"
                  value={productSchema.material || ''}
                  onChange={(e) => setProductSchema({ ...productSchema, material: e.target.value })}
                />

                <div className="space-y-1">
                  <label className="block font-label text-xs font-semibold text-[#4a4e4a]">
                    विवरण
                  </label>
                  <textarea
                    rows={3}
                    value={englishDescription || productSchema.description || originalDescription}
                    onChange={(e) => {
                      setEnglishDescription(e.target.value);
                      setProductSchema({ ...productSchema, description: e.target.value });
                    }}
                    placeholder="उत्पाद का पूरा विवरण..."
                    className="w-full bg-[#faf6f0] border border-[#c4c8bc]/50 rounded-2xl p-3.5 text-xs text-[#2e3230] font-body focus:ring-2 focus:ring-[#4a7c59] focus:outline-none"
                  />
                </div>

                <Input
                  label="रंग / Availability"
                  placeholder="जैसे: Multiple colours (वैकल्पिक)"
                  value={productSchema.color || ''}
                  onChange={(e) => setProductSchema({ ...productSchema, color: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="कीमत (₹) *"
                    type="number"
                    placeholder="2500"
                    value={productSchema.price !== null && productSchema.price !== undefined ? String(productSchema.price) : ''}
                    onChange={(e) => setProductSchema({ ...productSchema, price: e.target.value ? parseInt(e.target.value, 10) : null })}
                  />

                  <Input
                    label="मात्रा *"
                    type="number"
                    placeholder="5"
                    value={productSchema.quantity !== null && productSchema.quantity !== undefined ? String(productSchema.quantity) : ''}
                    onChange={(e) => setProductSchema({ ...productSchema, quantity: e.target.value ? parseInt(e.target.value, 10) : null })}
                  />
                </div>
              </div>

              {/* Confirm & Save Button */}
              <div className="pt-3">
                <Button
                  onClick={handleConfirmAndSave}
                  disabled={isLoading || !productSchema.product_name || productSchema.price === null}
                  fullWidth
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {isLoading ? 'डेटाबेस में सेव हो रहा है...' : 'Confirm & Save (सेव करें) ✨'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </MobilePage>
  );
}
