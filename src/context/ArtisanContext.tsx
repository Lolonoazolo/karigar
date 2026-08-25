'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ArtisanUser, Product, ProductCategory } from '@/types';
import { INITIAL_MOCK_PRODUCTS } from '@/data/mockProducts';

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
  const [user, setUser] = useState<ArtisanUser | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('Hindi');
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
        if (parsed.selectedLang) setSelectedLang(parsed.selectedLang);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        } else {
          setProducts(INITIAL_MOCK_PRODUCTS);
        }
      } else {
        // Initial setup
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
            selectedLang,
            products,
          })
        );
      } catch (e) {
        console.error('Failed to save artisan state to storage', e);
      }
    }
  }, [user, selectedLang, products]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const login = (newUser: ArtisanUser) => {
    setUser(newUser);
    showToast(`Swagat hai, ${newUser.name}!`);
  };

  const demoLogin = () => {
    const demoUser: ArtisanUser = {
      mobile: '98765 43210',
      name: 'Demo Karigar',
      shop: 'Karigar Crafts',
      lang: selectedLang || 'Hindi',
      bio: 'Main pichhle 10 saal se haath se traditional craft banata hoon.',
    };
    setUser(demoUser);
    if (products.length === 0) {
      setProducts(INITIAL_MOCK_PRODUCTS);
    }
    showToast('Demo Artisan login ho gaya!');
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
    showToast('Product successfully add ho gaya!');
    return newProduct;
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product delete ho gaya!');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product update ho gaya!');
  };

  return (
    <ArtisanContext.Provider
      value={{
        user,
        selectedLang,
        setSelectedLang,
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
