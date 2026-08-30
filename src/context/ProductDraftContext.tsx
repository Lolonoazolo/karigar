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

const emptyDraft: ProductDraft = {
  photo: null,
  enhancedPhoto: null,
  story: '',
  category: 'Textiles',
  name: '',
  cost: 0,
  desiredProfit: 0,
  recommendedPrice: 0,
  price: 0,
  sku: '',
  stock: 0,
  tags: [],
  description: '',
};

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

export const ProductDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
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
    setDraft(emptyDraft);
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
