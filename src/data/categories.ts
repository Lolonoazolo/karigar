import { ProductCategory } from '@/types';

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string; iconName: string }[] = [
  { id: 'Textiles', label: 'Textiles & Weaving', iconName: 'Shirt' },
  { id: 'Pottery', label: 'Pottery & Ceramics', iconName: 'Container' },
  { id: 'Woodwork', label: 'Wood & Carving', iconName: 'Boxes' },
  { id: 'Jewelry', label: 'Jewelry & Ornaments', iconName: 'Sparkles' },
  { id: 'Painting', label: 'Art & Folk Paintings', iconName: 'Palette' },
  { id: 'Handmade', label: 'Handicraft & Decor', iconName: 'Sparkles' },
  { id: 'Other', label: 'Other Crafts', iconName: 'Package' },
];
