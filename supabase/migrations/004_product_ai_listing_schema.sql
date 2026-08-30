-- 004_product_ai_listing_schema.sql
-- ArtSathi AI Product Listing System Schema Extensions

-- 1. EXTEND PRODUCTS TABLE
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS craft_type TEXT,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS production_time_days INTEGER CHECK (production_time_days >= 0),
  ADD COLUMN IF NOT EXISTS origin TEXT,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT;

-- 2. EXTEND PRODUCT IMAGES TABLE
ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;

-- 3. CREATE PRODUCT TRANSLATIONS TABLE
CREATE TABLE IF NOT EXISTS public.product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'hi',
  original_description TEXT,
  english_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON public.product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- ENABLE ROW LEVEL SECURITY FOR PRODUCT TRANSLATIONS
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PRODUCT TRANSLATIONS
CREATE POLICY "Product translations are viewable by everyone"
  ON public.product_translations FOR SELECT
  USING (true);

CREATE POLICY "Artisans can insert translations for their own products"
  ON public.product_translations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND artisan_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can update translations for their own products"
  ON public.product_translations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND artisan_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can delete translations for their own products"
  ON public.product_translations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND artisan_id = auth.uid()
    )
  );
