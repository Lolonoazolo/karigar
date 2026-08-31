'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ArtisanUser, Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageId } from '@/lib/i18n/languages';
import { getCurrentUser, signOut, subscribeToAuthChanges } from '@/services/authService';
import { getProfile, getArtisanProfile, updateArtisanFullProfile, upsertArtisanProfileData } from '@/services/profileService';
import { getArtisanProducts, createProduct, updateProductInDB, deleteProductFromDB } from '@/services/productService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

type ToastState = {
  message: string;
  visible: boolean;
};

type ArtisanContextType = {
  user: ArtisanUser | null;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  products: Product[];
  isLoading: boolean;
  login: (user: ArtisanUser) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<ArtisanUser>) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  refreshProducts: () => Promise<void>;
  toast: ToastState;
  showToast: (msg: string) => void;
  currentFilter: 'all' | 'published' | 'draft';
  setCurrentFilter: (filter: 'all' | 'published' | 'draft') => void;
};

const ArtisanContext = createContext<ArtisanContextType | undefined>(undefined);

export const ArtisanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<ArtisanUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const loadUserData = useCallback(async (sbUser: any) => {
    if (!sbUser) {
      setUser(null);
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const artisan = await getArtisanProfile(sbUser.id);

      const artisanUser: ArtisanUser = {
        id: sbUser.id,
        email: sbUser.email || '',
        mobile: artisan?.phone || sbUser.phone || sbUser.user_metadata?.mobile || '',
        name: artisan?.name || artisan?.nam || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || t('common.karigar'),
        shop: artisan?.craft_type || artisan?.shop || 'Artisan Shop',
        craft: artisan?.craft_type || artisan?.craft || 'Handicrafts',
        location: artisan?.location || 'India',
        lang: artisan?.language || language,
        bio: artisan?.bio || '',
        role: 'artisan',
        artisanId: sbUser.id,
        avatarUrl: artisan?.avatar_url || undefined,
      };

      setUser(artisanUser);

      // Load artisan products from database
      const dbProducts = await getArtisanProducts(sbUser.id);
      setProducts(dbProducts);
    } catch (err) {
      console.error('Error loading artisan data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  // Auth Listener
  useEffect(() => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check existing session
    getCurrentUser().then((sbUser) => {
      loadUserData(sbUser);
    });

    // Subscribe to auth state changes
    const subscription = subscribeToAuthChanges((sbUser) => {
      loadUserData(sbUser);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [loadUserData]);

  const refreshProducts = async () => {
    if (user?.id) {
      const updatedList = await getArtisanProducts(user.id);
      setProducts(updatedList);
    }
  };

  const login = async (newUser: ArtisanUser) => {
    if (!user && !newUser.id) {
      setUser(newUser);
      showToast(t('onboarding.welcomeToast', { name: newUser.name }));
      return;
    }

    const userId = newUser.id || user?.id;
    if (userId) {
      const updatedUser = { ...newUser, id: userId };
      setUser(updatedUser);
      await upsertArtisanProfileData(updatedUser);
      showToast(t('onboarding.welcomeToast', { name: newUser.name }));
    }
  };

  const updateProfile = async (updates: Partial<ArtisanUser>) => {
    if (!user?.id) return;
    const mergedUser = { ...user, ...updates };
    setUser(mergedUser);

    try {
      await updateArtisanFullProfile(user.id, {
        name: updates.name,
        craft: updates.craft || updates.shop,
        location: updates.location,
        bio: updates.bio,
        avatarUrl: updates.avatarUrl,
        mobile: updates.mobile,
      });
      showToast('Profile safalta purvak update ho gaya!');
    } catch (err: any) {
      showToast(`Profile update failed: ${err.message || 'Error'}`);
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Signout exception:', e);
    }
    setUser(null);
    setProducts([]);
    showToast('Logged out');
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> => {
    if (!user?.id) {
      showToast('Please sign in to add products.');
      return null;
    }

    try {
      const newProd = await createProduct(user.id, productData);
      if (newProd) {
        setProducts((prev) => [newProd, ...prev]);
        showToast(t('addSku.saveSuccessToast'));
        return newProd;
      }
    } catch (err: any) {
      showToast(`Error adding product: ${err.message || 'Failed'}`);
    }
    return null;
  };

  const deleteProduct = async (id: string) => {
    if (!user?.id) return;
    try {
      await deleteProductFromDB(id, user.id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(t('productCard.deleteToast'));
    } catch (err: any) {
      showToast(`Delete failed: ${err.message || 'Error'}`);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user?.id) return;
    try {
      await updateProductInDB(id, updates, user.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      showToast(t('productCard.shareToast'));
    } catch (err: any) {
      showToast(`Update failed: ${err.message || 'Error'}`);
    }
  };

  return (
    <ArtisanContext.Provider
      value={{
        user,
        selectedLang: language,
        setSelectedLang: (lang: string) => setLanguage(lang as LanguageId),
        products,
        isLoading,
        login,
        logout,
        updateProfile,
        addProduct,
        deleteProduct,
        updateProduct,
        refreshProducts,
        toast,
        showToast,
        currentFilter,
        setCurrentFilter,
      }}
    >
      {children}
    </ArtisanContext.Provider>
  );
};

export const useArtisan = () => {
  const context = useContext(ArtisanContext);
  if (!context) {
    throw new Error('useArtisan must be used within an ArtisanProvider');
  }
  return context;
};
