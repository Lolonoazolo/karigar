'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDraft } from '@/types';

type ProductDraftContextType = {
  draft: ProductDraft;
  updateDraft: (updates: Partial<ProductDraft>) => void;
  resetDraft: () => void;
  lastSavedProduct: ProductDraft | null;
  setLastSavedProduct: (product: ProductDraft) => void;
};

const DRAFT_STORAGE_KEY = 'karigarai_product_draft_v1';

const initialDraft: ProductDraft = {
  photo: null,
  enhancedPhoto: null,
  story: '',
  category: 'Textiles',
  name: '',
  cost: 700,
  desiredProfit: 250,
  recommendedPrice: 1099,
  price: 1099,
  sku: 'KD-001',
  stock: 24,
  tags: ['Handmade', 'Cotton', 'Banarasi Craft'],
  description: 'Handcrafted premium craft item made by skilled artisans.',
};

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

export const ProductDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [lastSavedProduct, setLastSavedProductState] = useState<ProductDraft | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setDraft(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage', e);
    }
  }, []);

  const updateDraft = (updates: Partial<ProductDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save draft to localStorage', e);
      }
      return next;
    });
  };

  const resetDraft = () => {
    setDraft(initialDraft);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const setLastSavedProduct = (product: ProductDraft) => {
    setLastSavedProductState(product);
  };

  return (
    <ProductDraftContext.Provider
      value={{
        draft,
        updateDraft,
        resetDraft,
        lastSavedProduct,
        setLastSavedProduct,
      }}
    >
      {children}
    </ProductDraftContext.Provider>
  );
};

export const useProductDraft = () => {
  const context = useContext(ProductDraftContext);
  if (!context) {
    throw new Error('useProductDraft must be used within a ProductDraftProvider');
  }
  return context;
};
