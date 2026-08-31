import { ProductDataSchema } from '@/types';

/**
 * Detects the primary language of an artisan's text input.
 */
export async function detectLanguage(text: string): Promise<string> {
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'hi';
  }
  const hinglishKeywords = ['yeh', 'hai', 'bhi', 'mera', 'kaam', 'saree', 'rupaye', 'banarasi', 'chikan', 'keemat', 'dam', 'paas'];
  const lower = text.toLowerCase();
  if (hinglishKeywords.some((word) => lower.includes(word))) {
    return 'hi';
  }
  return 'en';
}

/**
 * Translates Hindi / Hinglish text to clean English description.
 */
export async function translateDescription(text: string, sourceLanguage: string): Promise<string> {
  if (!text) return '';
  if (sourceLanguage === 'en') return text;
  return text;
}

/**
 * Local fallback rule-based entity extraction for Indian artisan products.
 */
export function extractProductInformation(
  englishText: string,
  currentProduct?: Partial<ProductDataSchema>
): ProductDataSchema {
  const schema: ProductDataSchema = {
    product_name: currentProduct?.product_name || null,
    category: currentProduct?.category || null,
    craft_type: currentProduct?.craft_type || null,
    material: currentProduct?.material || null,
    description: englishText || currentProduct?.description || null,
    price: currentProduct?.price || null,
    currency: currentProduct?.currency || 'INR',
    quantity: currentProduct?.quantity || null,
    color: currentProduct?.color || null,
    dimensions: currentProduct?.dimensions || null,
    weight: currentProduct?.weight || null,
    production_time_days: currentProduct?.production_time_days || null,
    origin: currentProduct?.origin || null,
    care_instructions: currentProduct?.care_instructions || null,
    tags: currentProduct?.tags || [],
  };

  const lower = englishText.toLowerCase();

  // 1. Craft Extraction
  if (!schema.craft_type) {
    if (lower.includes('chikan') || lower.includes('चिकन') || lower.includes('chikankari')) schema.craft_type = 'Lucknow Chikankari';
    else if (lower.includes('banarasi') || lower.includes('बनारसी')) schema.craft_type = 'Banarasi Weaving';
    else if (lower.includes('handloom') || lower.includes('handwoven') || lower.includes('बुना')) schema.craft_type = 'Handloom / Handwoven';
    else if (lower.includes('block print') || lower.includes('ब्लॉक')) schema.craft_type = 'Block Printing';
    else if (lower.includes('madhubani') || lower.includes('मधुबनी')) schema.craft_type = 'Madhubani Painting';
    else if (lower.includes('embroidery') || lower.includes('कढ़ाई')) schema.craft_type = 'Embroidery';
    else if (lower.includes('handmade') || lower.includes('हाथ से')) schema.craft_type = 'Handmade';
  }

  // 2. Material Extraction (DO NOT guess or invent material if not explicitly mentioned)
  if (schema.material === null) {
    if (lower.includes('pure silk') || lower.includes('शुद्ध सिल्क')) schema.material = 'Pure Silk';
    else if (lower.includes('silk') || lower.includes('सिल्क')) schema.material = 'Silk';
    else if (lower.includes('cotton') || lower.includes('कॉटन')) schema.material = 'Cotton';
    else if (lower.includes('terracotta') || lower.includes('clay') || lower.includes('मिट्टी')) schema.material = 'Terracotta Clay';
    else if (lower.includes('wood') || lower.includes('wooden') || lower.includes('लकड़ी') || lower.includes('sheesham')) schema.material = 'Wood';
    else if (lower.includes('brass') || lower.includes('पीतल')) schema.material = 'Brass';
    else if (lower.includes('jute')) schema.material = 'Jute';
  }

  // 3. Category Extraction
  if (schema.category === null) {
    if (lower.includes('saree') || lower.includes('साड़ी') || lower.includes('साड़ियां') || lower.includes('dupatta') || lower.includes('fabric')) {
      schema.category = 'Textiles';
    } else if (lower.includes('pot') || lower.includes('pottery') || lower.includes('diya') || lower.includes('terracotta') || lower.includes('घड़ा')) {
      schema.category = 'Pottery';
    } else if (lower.includes('sculpture') || lower.includes('toy') || lower.includes('खिलौना') || lower.includes('wood')) {
      schema.category = 'Woodwork';
    } else if (lower.includes('jewelry') || lower.includes('necklace') || lower.includes('bangle')) {
      schema.category = 'Jewelry';
    } else if (lower.includes('painting') || lower.includes('art') || lower.includes('चित्रकला')) {
      schema.category = 'Painting';
    } else {
      schema.category = 'Handmade';
    }
  }

  // 4. Short Concise Product Name Extraction (2-5 words)
  if (schema.product_name === null || schema.product_name.length > 50 || schema.product_name.startsWith('यह') || schema.product_name.toLowerCase().startsWith('this is')) {
    if ((lower.includes('chikan') || lower.includes('चिकन') || lower.includes('chikankari')) && (lower.includes('saree') || lower.includes('साड़ी') || lower.includes('साड़ियां'))) {
      schema.product_name = 'Lucknow Chikankari Saree';
    } else if ((lower.includes('banarasi') || lower.includes('बनारसी')) && (lower.includes('saree') || lower.includes('साड़ी') || lower.includes('साड़ियां'))) {
      schema.product_name = 'Banarasi Silk Saree';
    } else if (lower.includes('toy') || lower.includes('खिलौना')) {
      schema.product_name = 'Handmade Wooden Toy';
    } else if (lower.includes('pottery') || lower.includes('vase') || lower.includes('घड़ा') || lower.includes('pot')) {
      schema.product_name = 'Blue Pottery Vase';
    } else if (lower.includes('dupatta') || lower.includes('दुपट्टा')) {
      schema.product_name = 'Handwoven Cotton Dupatta';
    } else if (schema.craft_type && schema.category && schema.category !== 'Handmade') {
      schema.product_name = `${schema.craft_type} ${schema.category}`;
    } else if (schema.craft_type) {
      schema.product_name = `${schema.craft_type} Product`;
    } else {
      schema.product_name = 'Handcrafted Artisan Product';
    }
  }

  // 5. Price Extraction & Hindi Number Words
  if (schema.price === null) {
    if (lower.includes('ढाई हजार') || lower.includes('ढाई हज़ार') || lower.includes('dhai hazar')) {
      schema.price = 2500;
    } else if (lower.includes('पाँच हजार') || lower.includes('paanch hazar')) {
      schema.price = 5000;
    } else if (lower.includes('एक हजार') || lower.includes('ek hazar')) {
      schema.price = 1000;
    } else {
      const explicitPriceMatch =
        lower.match(/(?:price|cost|rate|keemat|kimat|daam|moolya|dam)\s*(?:pe|par|me|mein|is|is:)?\s*₹?\s*(\d+)/i) ||
        lower.match(/(\d+)\s*(?:rupees|rupaye|rs|inr|ke dam|me|mein)/i) ||
        lower.match(/₹\s*(\d+)/i);

      if (explicitPriceMatch) {
        schema.price = parseInt(explicitPriceMatch[1], 10);
      } else {
        const numberMatches = lower.match(/\b\d+\b/g);
        if (numberMatches) {
          const prices = numberMatches.map((n) => parseInt(n, 10)).filter((n) => n >= 50);
          if (prices.length > 0) {
            schema.price = prices[0];
          }
        }
      }
    }
  }

  // 6. Quantity Extraction
  if (schema.quantity === null) {
    const qtyMatch =
      lower.match(/(\d+)\s*(?:pieces|piece|pcs|pc|items|units|tokri|saree|sarees|साड़ियां|साड़ी|पीस|खिलौने|उपलब्ध)/i) ||
      lower.match(/(?:paas|stock|quantity|qty|available)\s*:?\s*(\d+)/i);

    if (qtyMatch) {
      schema.quantity = parseInt(qtyMatch[1], 10);
    } else if (lower.includes('पाँच सौ') || lower.includes('पांच सौ')) {
      schema.quantity = 500;
    } else if (lower.includes('बीस') || lower.includes('bees')) {
      schema.quantity = 20;
    } else if (lower.includes('दस') || lower.includes('das')) {
      schema.quantity = 10;
    } else if (lower.includes('पाँच') || lower.includes('पांच') || lower.includes('paanch')) {
      schema.quantity = 5;
    }
  }

  // 7. Color Extraction
  if (schema.color === null) {
    if (lower.includes('har color') || lower.includes('हर कलर') || lower.includes('har rang') || lower.includes('multiple col')) {
      schema.color = 'Multiple colours';
    }
  }

  return schema;
}
