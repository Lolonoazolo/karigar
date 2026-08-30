export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'artisan' | 'customer' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type AIGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          preferred_language?: string;
          updated_at?: string;
        };
      };
      artisans: {
        Row: {
          id: string;
          profile_id: string;
          craft_type: string | null;
          bio: string | null;
          location: string | null;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          craft_type?: string | null;
          bio?: string | null;
          location?: string | null;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          craft_type?: string | null;
          bio?: string | null;
          location?: string | null;
          verification_status?: VerificationStatus;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          artisan_id: string;
          name: string;
          description: string | null;
          price: number;
          cost: number;
          profit: number;
          sku: string | null;
          category: string | null;
          stock_quantity: number;
          status: ProductStatus;
          cover_image_url: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artisan_id: string;
          name: string;
          description?: string | null;
          price: number;
          cost?: number;
          profit?: number;
          sku?: string | null;
          category?: string | null;
          stock_quantity?: number;
          status?: ProductStatus;
          cover_image_url?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          cost?: number;
          profit?: number;
          sku?: string | null;
          category?: string | null;
          stock_quantity?: number;
          status?: ProductStatus;
          cover_image_url?: string | null;
          tags?: string[];
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          public_url?: string;
          sort_order?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          product_id?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          status: OrderStatus;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          status?: OrderStatus;
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          total_amount?: number;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          artisan_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          artisan_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          review_text?: string | null;
          updated_at?: string;
        };
      };
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          generation_type: string;
          input_reference: string | null;
          output_reference: string | null;
          status: AIGenerationStatus;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id?: string | null;
          generation_type: string;
          input_reference?: string | null;
          output_reference?: string | null;
          status?: AIGenerationStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          output_reference?: string | null;
          status?: AIGenerationStatus;
          error_message?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
