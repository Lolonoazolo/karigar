import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Product, ProductCategory } from '@/types';

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }

  return (data || []).map(mapProductFromDB);
}

export async function getArtisanProducts(artisanId: string): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artisan products:', error.message);
    throw error;
  }

  return (data || []).map(mapProductFromDB);
}

/**
 * Uploads product image file to Supabase Storage at:
 * `product-images/{userId}/{productId}/image1.{ext}`
 */
export async function uploadProductImageForProduct(
  userId: string,
  productId: string,
  imageInput: string | Blob | File
): Promise<{ storagePath: string; publicUrl: string }> {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase client is not configured.');
  }

  let blob: Blob;
  let fileExt = 'jpg';

  if (typeof imageInput === 'string') {
    if (imageInput.startsWith('data:image/png')) fileExt = 'png';
    else if (imageInput.startsWith('data:image/webp')) fileExt = 'webp';
    else fileExt = 'jpg';

    const res = await fetch(imageInput);
    blob = await res.blob();
  } else if (imageInput instanceof File) {
    fileExt = imageInput.name.split('.').pop() || 'jpg';
    blob = imageInput;
  } else {
    blob = imageInput;
  }

  const storagePath = `${userId}/${productId}/image1.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('product-images')
    .upload(storagePath, blob, {
      contentType: blob.type || `image/${fileExt}`,
      upsert: true,
    });

  if (uploadError) {
    console.error('Failed to upload product image to Supabase Storage:', uploadError.message);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabaseClient.storage.from('product-images').getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  return { storagePath, publicUrl };
}

export async function createProductWithTranslations(
  providedArtisanId: string,
  productData: {
    productName: string;
    category: string;
    craftType?: string;
    material?: string;
    description: string;
    price: number;
    currency?: string;
    quantity: number;
    productionTimeDays?: number;
    photoUrl?: string | null;
    tags?: string[];
    originalLanguage?: string;
    originalDescription?: string;
    englishDescription?: string;
  }
): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase client is not configured.');
  }

  // Enforce session user ID
  const { data: authData } = await supabaseClient.auth.getUser();
  const userId = authData.user?.id || providedArtisanId;

  if (!userId || userId === 'anonymous') {
    throw new Error('No authenticated user session found. Please login first.');
  }

  const generatedSku = `SKU-${Date.now().toString().slice(-6)}`;

  // Step 1: Insert Database Product Record to obtain product ID
  const { data: productRow, error: productError } = await supabaseClient
    .from('products')
    .insert({
      artisan_id: userId,
      name: productData.productName,
      product_name: productData.productName,
      category: productData.category,
      craft_type: productData.craftType || productData.category,
      material: productData.material || '',
      description: productData.englishDescription || productData.description || '',
      price: productData.price,
      currency: productData.currency || 'INR',
      stock_quantity: productData.quantity,
      quantity: productData.quantity,
      production_time_days: productData.productionTimeDays || null,
      cost: Math.round(productData.price * 0.6),
      profit: Math.round(productData.price * 0.4),
      sku: generatedSku,
      status: 'published',
      tags: productData.tags || [],
    })
    .select()
    .single();

  if (productError || !productRow) {
    console.error('Failed to create product row in database:', productError?.message);
    throw new Error(`Database insert error: ${productError?.message || 'Failed to create product.'}`);
  }

  const productId = productRow.id;
  let finalCoverUrl: string | null = null;

  // Step 2: Storage Upload with Rollback on Error
  if (productData.photoUrl) {
    try {
      if (productData.photoUrl.startsWith('data:') || productData.photoUrl.startsWith('blob:')) {
        const { storagePath, publicUrl } = await uploadProductImageForProduct(
          userId,
          productId,
          productData.photoUrl
        );
        finalCoverUrl = publicUrl;

        // Insert into product_images table
        await supabaseClient.from('product_images').insert({
          product_id: productId,
          storage_path: storagePath,
          public_url: publicUrl,
          is_primary: true,
          sort_order: 1,
        });
      } else {
        finalCoverUrl = productData.photoUrl;
      }

      // Update product record with cover_image_url
      if (finalCoverUrl) {
        await supabaseClient
          .from('products')
          .update({ cover_image_url: finalCoverUrl })
          .eq('id', productId);
        productRow.cover_image_url = finalCoverUrl;
      }
    } catch (uploadErr: any) {
      console.error('Rollback triggered: Image upload failed, deleting created product row.', uploadErr);
      await supabaseClient.from('products').delete().eq('id', productId);
      throw new Error(`We couldn't upload your product image. Product creation was rolled back. Details: ${uploadErr.message}`);
    }
  }

  // Step 3: Insert Translations
  if (productData.originalDescription || productData.englishDescription) {
    try {
      await supabaseClient.from('product_translations').insert({
        product_id: productId,
        language_code: productData.originalLanguage || 'hi',
        original_description: productData.originalDescription || productData.description || '',
        english_description: productData.englishDescription || productData.description || '',
      });
    } catch (transErr) {
      console.warn('Failed to insert product translation record:', transErr);
    }
  }

  return mapProductFromDB(productRow);
}

export async function createProduct(artisanId: string, product: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
  return createProductWithTranslations(artisanId, {
    productName: product.name,
    category: product.category,
    craftType: product.category,
    description: product.description || '',
    price: product.price,
    quantity: product.stock,
    photoUrl: product.enhancedPhoto || product.photo || null,
    tags: product.tags,
  });
}

export async function updateProductInDB(id: string, updates: Partial<Product>, artisanId?: string): Promise<void> {
  if (!isSupabaseConfigured || !supabaseClient) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
  if (updates.profit !== undefined) dbUpdates.profit = updates.profit;
  if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.stock !== undefined) dbUpdates.stock_quantity = updates.stock;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.photo !== undefined) dbUpdates.cover_image_url = updates.photo;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

  let query = supabaseClient.from('products').update(dbUpdates).eq('id', id);
  if (artisanId) {
    query = query.eq('artisan_id', artisanId);
  }

  const { error } = await query;

  if (error) {
    console.error('Failed to update product in database:', error.message);
    throw error;
  }
}

export async function deleteProductFromDB(id: string, artisanId?: string): Promise<void> {
  if (!isSupabaseConfigured || !supabaseClient) return;

  let query = supabaseClient.from('products').delete().eq('id', id);
  if (artisanId) {
    query = query.eq('artisan_id', artisanId);
  }

  const { error } = await query;

  if (error) {
    console.error('Failed to delete product from database:', error.message);
    throw error;
  }
}

export async function uploadProductImage(
  userId: string,
  file: File | Blob,
  productId?: string
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  const targetProductId = productId || `temp-${Date.now()}`;
  const res = await uploadProductImageForProduct(userId, targetProductId, file);
  return res.publicUrl;
}

function mapProductFromDB(row: any): Product {
  return {
    id: row.id,
    artisanId: row.artisan_id,
    name: row.name || row.product_name || 'Handcrafted Product',
    price: Number(row.price || 0),
    cost: Number(row.cost || 0),
    profit: Number(row.profit || 0),
    sku: row.sku || '',
    stock: Number(row.stock_quantity || row.quantity || 0),
    category: (row.category as ProductCategory) || 'Other',
    description: row.description || '',
    tags: row.tags || [],
    status: row.status || 'published',
    photo: row.cover_image_url || null,
    enhancedPhoto: row.cover_image_url || null,
    createdAt: new Date(row.created_at || Date.now()).getTime(),
  };
}
