'use client';

import React from 'react';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2, Share2, Package, Tag } from 'lucide-react';
import { useArtisan } from '@/context/ArtisanContext';

type ProductCardProps = {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onShare?: (product: Product) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onShare,
}) => {
  const { deleteProduct, showToast } = useArtisan();

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Pottery':
        return '🏺';
      case 'Textiles':
        return '🧵';
      case 'Woodwork':
        return '🪵';
      case 'Jewelry':
        return '💍';
      case 'Painting':
        return '🎨';
      default:
        return '🎨';
    }
  };

  const handleDelete = () => {
    if (confirm(`Kya aap "${product.name}" ko delete karna chahte hain?`)) {
      if (onDelete) {
        onDelete(product.id);
      } else {
        deleteProduct(product.id);
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(product);
    } else {
      showToast('Product link copy ho gaya!');
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 border border-[#c4c8bc]/30 group fade-in">
      {/* Image / Thumbnail Container */}
      <div className="aspect-square relative w-full overflow-hidden bg-[#f0ece4] flex items-center justify-center">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#c8e8d0]/40 to-[#f8e0a8]/40">
            <span className="text-5xl mb-1">{getCategoryEmoji(product.category)}</span>
            <span className="font-label text-xs text-[#6b6358] font-semibold">{product.category}</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge variant={product.status === 'published' ? 'published' : 'draft'}>
            {product.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="font-headline font-bold text-base text-[#2e3230] leading-snug line-clamp-2">
              {product.name}
            </h3>
            <span className="font-headline font-extrabold text-[#4a7c59] text-base shrink-0">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-label px-2 py-0.5 rounded-full bg-[#f5f1ea] text-[#6b6358] border border-[#c4c8bc]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#c4c8bc]/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6b6358] font-label">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#4a7c59]" />
              <span>Stock: <strong className="text-[#2e3230]">{product.stock} units</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#705c30]" />
              <span>SKU: <strong className="text-[#2e3230]">{product.sku}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-[#c4c8bc]/20 grid grid-cols-3 bg-[#faf6f0]/50 text-xs font-label">
        <button
          onClick={() => onEdit ? onEdit(product) : showToast('Edit coming soon!')}
          className="py-2.5 font-semibold text-[#4a4e4a] hover:bg-[#f0ece4] transition-colors flex items-center justify-center gap-1 border-r border-[#c4c8bc]/20 active:bg-[#eae6de]"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={handleShare}
          className="py-2.5 font-semibold text-[#4a7c59] hover:bg-[#f0ece4] transition-colors flex items-center justify-center gap-1 border-r border-[#c4c8bc]/20 active:bg-[#eae6de]"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button
          onClick={handleDelete}
          className="py-2.5 font-semibold text-[#b83230] hover:bg-[#ffdad8]/40 transition-colors flex items-center justify-center gap-1 active:bg-[#ffdad8]"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
};
