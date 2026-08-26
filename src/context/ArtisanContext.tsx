'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ArtisanUser, Product } from '@/types';
import { INITIAL_MOCK_PRODUCTS } from '@/data/mockProducts';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageId } from '@/lib/i18n/languages';

type ToastState = {
  message: string;
  visible: boolean;
};

type ArtisanContextType = {
  user: ArtisanUser | null;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  products: Product[];
  login: (user: ArtisanUser) => void;
  demoLogin: () => void;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toast: ToastState;
  showToast: (msg: string) => void;
  currentFilter: 'all' | 'published' | 'draft';
  setCurrentFilter: (filter: 'all' | 'published' | 'draft') => void;
};

const ArtisanContext = createContext<ArtisanContextType | undefined>(undefined);

const STORAGE_KEY = 'karigarai_artisan_data_v1';

export const ArtisanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<ArtisanUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        } else {
          setProducts(INITIAL_MOCK_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_MOCK_PRODUCTS);
      }
    } catch (e) {
      console.error('Failed to load artisan state from storage', e);
      setProducts(INITIAL_MOCK_PRODUCTS);
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user,
            selectedLang: language,
            products,
          })
        );
      } catch (e) {
        console.error('Failed to save artisan state to storage', e);
      }
    }
  }, [user, language, products]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const login = (newUser: ArtisanUser) => {
    setUser(newUser);
    showToast(t('onboarding.welcomeToast', { name: newUser.name }));
  };

  const demoLogin = () => {
    const demoUser: ArtisanUser = {
      mobile: '98765 43210',
      name: t('common.karigar'),
      shop: 'Karigar Crafts',
      lang: language,
      bio: 'Main pichhle 10 saal se haath se traditional craft banata hoon.',
    };
    setUser(demoUser);
    if (products.length === 0) {
      setProducts(INITIAL_MOCK_PRODUCTS);
    }
    showToast(t('onboarding.demoToast'));
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out');
  };

  const addProduct = (newProductData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod_${Date.now()}`,
      createdAt: Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(t('addSku.saveSuccessToast'));
    return newProduct;
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(t('productCard.deleteToast'));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast(t('productCard.shareToast'));
  };

  return (
    <ArtisanContext.Provider
      value={{
        user,
        selectedLang: language,
        setSelectedLang: (lang: string) => setLanguage(lang as LanguageId),
        products,
        login,
        demoLogin,
        logout,
        addProduct,
        deleteProduct,
        updateProduct,
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
