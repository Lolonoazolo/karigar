import { ProductCategory, ProductDraft } from '@/types';

export type ExtractedEntities = {
  name?: string;
  category?: ProductCategory;
  material?: string;
  stock?: number;
  cost?: number;
  price?: number;
  story?: string;
};

// Hindi & Indic word to number mapping
const wordToNumberMap: { [key: string]: number } = {
  ek: 1,
  do: 2,
  tin: 3,
  teen: 4,
  char: 4,
  paanch: 5,
  panch: 5,
  chhe: 6,
  che: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  pandra: 15,
  bees: 20,
  pachis: 25,
  tees: 30,
  pachas: 50,
  sau: 100,
  hazaar: 1000,
  hazar: 1000,
};

export function parseNaturalSpeech(input: string): ExtractedEntities {
  if (!input || !input.trim()) return {};

  const text = input.trim();
  const lowerText = text.toLowerCase();
  const result: ExtractedEntities = {};

  // 1. Extract Quantity / Stock (e.g., "25 pieces", "das tokriyan", "5 items")
  const stockMatch =
    lowerText.match(/(\d+)\s*(piece|pieces|pc|pcs|tokri|item|items|nug)?/i) ||
    lowerText.match(/(ek|do|teen|tin|char|paanch|panch|das|pandra|bees|pachis|tees|pachas)\s*(piece|pieces|pc|pcs|tokri|item)?/i);

  if (stockMatch) {
    const rawVal = stockMatch[1];
    if (/^\d+$/.test(rawVal)) {
      result.stock = parseInt(rawVal, 10);
    } else if (wordToNumberMap[rawVal]) {
      result.stock = wordToNumberMap[rawVal];
    }
  }

  // 2. Extract Price & Cost (e.g. "kharcha 100 rupaye", "250 mein bechna", "100 rupaye", "₹500")
  const costMatch = lowerText.match(/(kharcha|banane|making|cost)\s*(mein|ka|ke)?\s*₹?\s*(\d+)/i) ||
    lowerText.match(/₹?\s*(\d+)\s*(ka kharcha|kharcha)/i);
  if (costMatch) {
    result.cost = parseInt(costMatch[3] || costMatch[1], 10);
  }

  const priceMatch = lowerText.match(/(bechna|price|keemat|rate|sale|sell)\s*(mein|ka|ke)?\s*₹?\s*(\d+)/i) ||
    lowerText.match(/₹?\s*(\d+)\s*(mein bechna|mein sell)/i);
  if (priceMatch) {
    result.price = parseInt(priceMatch[3] || priceMatch[1], 10);
  }

  // If lone currency number exists (e.g. "250 rupaye") and cost/price not set
  if (!result.price && !result.cost) {
    const rupeeMatch = lowerText.match(/₹?\s*(\d+)\s*(rupaye|rs|inr)?/i);
    if (rupeeMatch && parseInt(rupeeMatch[1], 10) > 20) {
      const val = parseInt(rupeeMatch[1], 10);
      result.price = val;
    }
  }

  // 3. Extract Material / Category
  if (lowerText.includes('cotton') || lowerText.includes('fabric') || lowerText.includes('dupatta') || lowerText.includes('saree') || lowerText.includes('kapda')) {
    result.material = 'Cotton / Fabric';
    result.category = 'Textiles';
  } else if (lowerText.includes('clay') || lowerText.includes('pottery') || lowerText.includes('terracotta') || lowerText.includes('mitti') || lowerText.includes('diya') || lowerText.includes('matka')) {
    result.material = 'Terracotta Clay';
    result.category = 'Pottery';
  } else if (lowerText.includes('wood') || lowerText.includes('lakdi') || lowerText.includes('carving') || lowerText.includes('sheesham') || lowerText.includes('tray')) {
    result.material = 'Sheesham Wood';
    result.category = 'Woodwork';
  } else if (lowerText.includes('brass') || lowerText.includes('metal') || lowerText.includes('pital') || lowerText.includes('jewel') || lowerText.includes('haard')) {
    result.material = 'Brass Metal';
    result.category = 'Jewelry';
  } else if (lowerText.includes('paint') || lowerText.includes('art') || lowerText.includes('chitra') || lowerText.includes('canvas')) {
    result.material = 'Canvas Paint';
    result.category = 'Painting';
  } else if (lowerText.includes('bamboo') || lowerText.includes('baans') || lowerText.includes('tokri') || lowerText.includes('basket') || lowerText.includes('jute')) {
    result.material = 'Bamboo Fiber';
    result.category = 'Handmade';
  }

  // 4. Extract Product Name
  if (lowerText.includes('tokri') || lowerText.includes('basket')) {
    result.name = 'Bamboo Basket';
  } else if (lowerText.includes('dupatta')) {
    result.name = 'Handcrafted Cotton Dupatta';
  } else if (lowerText.includes('bowl') || lowerText.includes('katori')) {
    result.name = 'Ceramic Bowl';
  } else if (lowerText.includes('tray')) {
    result.name = 'Wooden Serving Tray';
  } else if (lowerText.includes('diya')) {
    result.name = 'Terracotta Diya Set';
  } else if (text.length > 3 && !result.name) {
    // Clean text as name candidate
    result.name = text.split('.')[0].substring(0, 40);
  }

  // 5. Extract Story / Description
  if (lowerText.includes('gaon') || lowerText.includes('haath se') || lowerText.includes('parampara') || lowerText.includes('story')) {
    result.story = text;
  }

  return result;
}
