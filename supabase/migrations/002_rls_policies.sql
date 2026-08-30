-- 002_rls_policies.sql
-- Row Level Security (RLS) Policies for ArtSathi

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. ARTISANS POLICIES
CREATE POLICY "Public can read verified artisans"
  ON public.artisans FOR SELECT
  USING (verification_status = 'verified' OR auth.uid() = profile_id);

CREATE POLICY "Artisans can create their own artisan profile"
  ON public.artisans FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Artisans can update their own artisan profile"
  ON public.artisans FOR UPDATE
  USING (auth.uid() = profile_id);

-- 3. CATEGORIES POLICIES
CREATE POLICY "Categories are readable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- 4. PRODUCTS POLICIES
CREATE POLICY "Published products are readable by everyone"
  ON public.products FOR SELECT
  USING (status = 'published' OR auth.uid() = artisan_id);

CREATE POLICY "Artisans can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = artisan_id);

CREATE POLICY "Artisans can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = artisan_id);

-- 5. PRODUCT IMAGES POLICIES
CREATE POLICY "Product images readable if product readable"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND (products.status = 'published' OR products.artisan_id = auth.uid())
    )
  );

CREATE POLICY "Artisans can manage product images"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.artisan_id = auth.uid()
    )
  );

-- 6. FAVORITES POLICIES
CREATE POLICY "Users can read their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 7. ORDERS POLICIES
CREATE POLICY "Customers can read their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Artisans can read orders involving their products"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items
      WHERE order_items.order_id = orders.id
      AND order_items.artisan_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- 8. ORDER ITEMS POLICIES
CREATE POLICY "Customers and Artisans can read relevant order items"
  ON public.order_items FOR SELECT
  USING (
    auth.uid() = artisan_id OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- 9. REVIEWS POLICIES
CREATE POLICY "Reviews are readable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- 10. AI GENERATIONS POLICIES
CREATE POLICY "Users can manage their own AI generations"
  ON public.ai_generations FOR ALL
  USING (auth.uid() = user_id);
