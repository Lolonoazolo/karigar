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
import { uploadProductImage, createProductWithTranslations } from '@/services/productService';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Edit3,
  Trash2,
  ArrowRight,
  Check,
  Globe,
  HelpCircle,
} from 'lucide-react';

export default function AIProductListingPage() {
  const router = useRouter();
  const { draft, updateDraft, setLastSavedProduct, resetDraft } = useProductDraft();
  const { user, showToast, refreshProducts } = useArtisan();
  const { t, language } = useLanguage();

  // Wizard Steps: 1 = Photo, 2 = Description, 3 = Missing Questions, 4 = Preview & Edit
  const [step, setStep] = useState<number>(1);

  const [photoUrl, setPhotoUrl] = useState<string | null>(draft.photo || null);
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

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [currentNextQuestion, setCurrentNextQuestion] = useState<string | null>(null);
  const [missingAnswerInput, setMissingAnswerInput] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 1. Photo Upload Handler
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
      showToast('Product photo add ho gayi!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    updateDraft({ photo: null, enhancedPhoto: null });
  };

  // 2. Submit Artisan Description to /api/product-ai/process
  const handleDescriptionSubmit = async (descText: string) => {
    if (!descText.trim()) {
      showToast('Kripya product ke baare mein kuch likhein ya bolein.');
      return;
    }

    setIsLoading(true);
    setOriginalDescription(descText.trim());

    try {
      const res = await fetch('/api/product-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_description',
          description: descText.trim(),
          language,
          imageUrl: photoUrl || undefined,
          currentProduct: productSchema,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process AI listing.');
      }

      const data = await res.json();

      setDetectedLanguage(data.detected_language || language);
      setEnglishDescription(data.english_description || descText);
      setProductSchema(data.product);
      setMissingFields(data.missing_required_fields || []);
      setCurrentNextQuestion(data.next_question || null);

      updateDraft({
        name: data.product.product_name || undefined,
        category: (data.product.category as ProductCategory) || undefined,
        craftType: data.product.craft_type || undefined,
        material: data.product.material || undefined,
        description: data.english_description || undefined,
        price: data.product.price || undefined,
        stock: data.product.quantity || undefined,
        originalLanguage: data.detected_language,
        originalDescription: descText.trim(),
      });

      if (data.missing_required_fields && data.missing_required_fields.length > 0) {
        setStep(3);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      showToast(err.message || 'AI processing error. Kripya punah prayas karein.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Missing Field Answer to /api/product-ai/process
  const handleMissingAnswerSubmit = async (answerText: string) => {
    if (!answerText.trim() || missingFields.length === 0) return;

    setIsLoading(true);
    const targetField = missingFields[0];

    try {
      const res = await fetch('/api/product-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer_missing',
          description: originalDescription,
          language: detectedLanguage,
          currentProduct: productSchema,
          missingFieldAnswer: { field: targetField, answer: answerText.trim() },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update missing information.');
      }

      const data = await res.json();

      setProductSchema(data.product);
      setMissingFields(data.missing_required_fields || []);
      setCurrentNextQuestion(data.next_question || null);
      setMissingAnswerInput('');

      if (data.missing_required_fields && data.missing_required_fields.length > 0) {
        setStep(3);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      showToast(err.message || 'Information update error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm & Save to Supabase Database & Storage
  const handleConfirmAndSave = async () => {
    if (!productSchema.product_name || !productSchema.price || !productSchema.quantity) {
      showToast('Kripya sabhi zaroori jankari puri karein.');
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
        description: englishDescription || productSchema.description || '',
        price: Number(productSchema.price),
        currency: productSchema.currency || 'INR',
        quantity: Number(productSchema.quantity),
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
        showToast('Product added successfully!');
        router.push('/artisan/products/success');
      } else {
        showToast('Product save karne mein samasya aayi.');
      }
    } catch (err: any) {
      showToast(err.message || 'Product save karne mein truti aayi.');
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
          onClick={() => router.push('/artisan/products')}
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
              AI Product Listing
            </h1>
            <span className="font-label text-[10px] font-semibold text-[#6b6358]">
              Step {step} of 4
            </span>
          </div>
        </div>

        <div className="w-8" />
      </header>

      {/* Main Flow Content */}
      <main className="flex-1 flex flex-col px-5 py-5 space-y-5 overflow-y-auto pb-12">
        {/* STEP 1: Add Product Photo */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1 text-center">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230]">
                Let&apos;s add your product
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                Sabse pehle apne product ki photo lein ya gallery se chunein.
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
                    📸 Take a photo
                  </span>
                  <span className="font-label text-xs text-[#6b6358]">Tap camera to capture</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    fullWidth
                    size="md"
                    icon={<Camera className="w-4 h-4" />}
                  >
                    Camera
                  </Button>
                  <Button
                    onClick={() => galleryInputRef.current?.click()}
                    variant="secondary"
                    fullWidth
                    size="md"
                    icon={<ImageIcon className="w-4 h-4 text-[#4a7c59]" />}
                  >
                    Gallery
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
                    <span>Replace Photo</span>
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    size="md"
                    className="flex-1"
                    icon={<ArrowRight className="w-4 h-4 rtl-flip" />}
                  >
                    Next: Description
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

        {/* STEP 2: Ask Artisan for Description */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1 text-center">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230]">
                Tell me about this product
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                You can speak or type in your own language.
              </p>
            </div>

            {/* Photo Thumbnail */}
            {photoUrl && (
              <div className="h-32 rounded-2xl overflow-hidden bg-[#f0ece4] soft-shadow border border-[#c4c8bc]/30">
                <img src={photoUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Description Form */}
            <div className="bg-white p-5 rounded-3xl border border-[#c4c8bc]/40 soft-shadow space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-label font-bold text-[#4a7c59] bg-[#d8f0de] px-3 py-1 rounded-full w-fit">
                <Globe className="w-3.5 h-3.5" />
                <span>Regional Language Supported</span>
              </div>

              <textarea
                value={originalDescription}
                onChange={(e) => setOriginalDescription(e.target.value)}
                placeholder="Jaise: Yeh banarasi silk ki saree hai. Iski keemat 2500 rupaye hai..."
                rows={4}
                className="w-full bg-[#faf6f0] border border-[#c4c8bc]/50 rounded-2xl p-4 text-sm text-[#2e3230] font-body focus:ring-2 focus:ring-[#4a7c59] focus:outline-none"
              />

              <VoiceRecorder
                onTranscriptComplete={(text) => {
                  setOriginalDescription(text);
                }}
                promptText="Product ka naam, material, kitne pieces aur keemat boliye..."
              />

              <Button
                onClick={() => handleDescriptionSubmit(originalDescription)}
                disabled={isLoading || !originalDescription.trim()}
                fullWidth
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
              >
                {isLoading ? 'Processing AI Extraction...' : 'Process Product Info ✨'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Missing Information Questions */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1 text-center">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230]">
                Additional Details Needed
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                AI requires a few more missing required fields.
              </p>
            </div>

            {/* Current Extraction Card */}
            <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#c4c8bc]/30 space-y-2 text-xs font-body">
              <span className="font-label font-bold text-[#4a7c59] uppercase tracking-wider text-[10px] block">
                Extracted Information
              </span>
              <div className="flex flex-wrap gap-1.5">
                {productSchema.product_name && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-[#c4c8bc]/30">
                    Name: <strong>{productSchema.product_name}</strong>
                  </span>
                )}
                {productSchema.category && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-[#c4c8bc]/30">
                    Category: <strong>{productSchema.category}</strong>
                  </span>
                )}
                {productSchema.price && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-[#c4c8bc]/30">
                    Price: <strong>₹{productSchema.price}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Single Missing Question Box */}
            {currentNextQuestion && (
              <div className="bg-white p-5 rounded-3xl border border-[#4a7c59]/40 soft-shadow space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center text-xl shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-label text-[10px] font-bold text-[#6b6358] uppercase">
                      Missing Question
                    </span>
                    <h3 className="font-headline font-bold text-base text-[#2e3230] leading-snug">
                      {currentNextQuestion}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <Input
                    placeholder="Apna jawab yahan likhein..."
                    value={missingAnswerInput}
                    onChange={(e) => setMissingAnswerInput(e.target.value)}
                  />

                  <Button
                    onClick={() => handleMissingAnswerSubmit(missingAnswerInput)}
                    disabled={isLoading || !missingAnswerInput.trim()}
                    fullWidth
                    size="md"
                    icon={<Check className="w-4 h-4" />}
                  >
                    {isLoading ? 'Updating...' : 'Submit Answer'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Product Preview & Editing */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center mx-auto text-xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-headline font-extrabold text-2xl text-[#2e3230]">
                Your Product Listing
              </h2>
              <p className="font-label text-xs text-[#6b6358]">
                Please review details before saving to database.
              </p>
            </div>

            {/* Confirmation & Editing Card */}
            <div className="bg-white rounded-3xl p-5 soft-shadow border border-[#c4c8bc]/40 space-y-4">
              {photoUrl && (
                <div className="h-48 rounded-2xl overflow-hidden bg-[#f0ece4]">
                  <img src={photoUrl} alt="Product" className="w-full h-full object-cover" />
                </div>
              )}

              {!isEditing ? (
                /* Static Readonly Preview */
                <div className="bg-[#faf6f0] rounded-2xl p-4 border border-[#c4c8bc]/30 space-y-3 text-sm font-body">
                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Product Name:</span>
                    <span className="font-headline font-bold text-[#2e3230]">{productSchema.product_name}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Category:</span>
                    <span className="font-semibold text-[#2e3230]">{productSchema.category}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Craft Type:</span>
                    <span className="font-semibold text-[#2e3230]">{productSchema.craft_type}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Material:</span>
                    <span className="font-semibold text-[#2e3230]">{productSchema.material}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Price:</span>
                    <span className="font-headline font-extrabold text-[#4a7c59] text-base">₹{productSchema.price}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                    <span className="font-label text-xs text-[#6b6358]">Available Quantity:</span>
                    <span className="font-semibold text-[#2e3230]">{productSchema.quantity} pieces</span>
                  </div>

                  {productSchema.production_time_days && (
                    <div className="flex justify-between border-b border-[#c4c8bc]/20 pb-2">
                      <span className="font-label text-xs text-[#6b6358]">Production Time:</span>
                      <span className="font-semibold text-[#2e3230]">{productSchema.production_time_days} days</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="font-label text-xs text-[#6b6358] block mb-1">Description:</span>
                    <p className="text-xs text-[#4a4e4a] bg-white p-3 rounded-xl border border-[#c4c8bc]/30 leading-relaxed">
                      {englishDescription || productSchema.description}
                    </p>
                  </div>
                </div>
              ) : (
                /* Inline Editing Form */
                <div className="space-y-3 bg-[#faf6f0] p-4 rounded-2xl border border-[#4a7c59]/40 text-xs font-body">
                  <Input
                    label="Product Name"
                    value={productSchema.product_name || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, product_name: e.target.value })}
                  />

                  <Input
                    label="Category"
                    value={productSchema.category || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, category: e.target.value })}
                  />

                  <Input
                    label="Craft Type"
                    value={productSchema.craft_type || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, craft_type: e.target.value })}
                  />

                  <Input
                    label="Material"
                    value={productSchema.material || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, material: e.target.value })}
                  />

                  <Input
                    label="Price (₹)"
                    type="number"
                    value={productSchema.price || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, price: parseInt(e.target.value, 10) || 0 })}
                  />

                  <Input
                    label="Available Quantity"
                    type="number"
                    value={productSchema.quantity || ''}
                    onChange={(e) => setProductSchema({ ...productSchema, quantity: parseInt(e.target.value, 10) || 0 })}
                  />

                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    fullWidth
                    size="sm"
                    icon={<Check className="w-4 h-4" />}
                  >
                    Done Editing
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={handleConfirmAndSave}
                  disabled={isLoading}
                  fullWidth
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {isLoading ? 'Saving to Database...' : 'Confirm & Save'}
                </Button>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full text-center font-label text-xs font-bold text-[#6b6358] hover:text-[#4a7c59] py-2 flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Information</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </MobilePage>
  );
}
