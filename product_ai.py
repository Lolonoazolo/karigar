import os
import json
import time
import logging
from typing import Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai import errors

load_dotenv()

logger = logging.getLogger("karigarai_backend")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


def rule_based_extraction(artisan_description: str) -> Dict[str, Any]:
    text = artisan_description.lower()

    # Product Name
    name = "Handcrafted Artisan Product"
    if "chikankari" in text or "चिकन" in text:
        if "saree" in text or "साड़ी" in text or "साड़ियां" in text:
            name = "Lucknow Chikankari Saree"
        else:
            name = "Lucknow Chikankari Craft"
    elif "banarasi" in text or "बनारसी" in text:
        if "saree" in text or "साड़ी" in text:
            name = "Banarasi Silk Saree"
    elif "खिलौना" in text or "toy" in text:
        name = "Handmade Wooden Toy"
    elif "pottery" in text or "घड़ा" in text or "pot" in text:
        name = "Blue Pottery Vase"

    # Craft
    craft = None
    if "chikan" in text or "चिकन" in text:
        craft = "Lucknow Chikankari"
    elif "banarasi" in text or "बनारसी" in text:
        craft = "Banarasi Weaving"
    elif "बुना" in text or "handwoven" in text or "handloom" in text:
        craft = "Handloom / Handwoven"
    elif "ब्लॉक" in text or "block print" in text:
        craft = "Block Printing"
    elif "मधुबनी" in text or "madhubani" in text:
        craft = "Madhubani Painting"
    elif "कढ़ाई" in text or "embroidery" in text:
        craft = "Embroidery"
    elif "हाथ से" in text or "handmade" in text:
        craft = "Handmade"

    # Material
    material = None
    if "शुद्ध सिल्क" in text or "pure silk" in text:
        material = "Pure Silk"
    elif "सिल्क" in text or "silk" in text:
        material = "Silk"
    elif "कॉटन" in text or "cotton" in text:
        material = "Cotton"
    elif "लकड़ी" in text or "wood" in text or "wooden" in text:
        material = "Wood"
    elif "मिट्टी" in text or "terracotta" in text or "clay" in text:
        material = "Terracotta Clay"

    # Category
    category = "Handmade"
    if "saree" in text or "साड़ी" in text or "साड़ियां" in text or "dupatta" in text:
        category = "Textiles"
    elif "toy" in text or "खिलौना" in text or "wood" in text:
        category = "Woodwork"
    elif "pot" in text or "pottery" in text or "घड़ा" in text:
        category = "Pottery"
    elif "jewelry" in text or "necklace" in text:
        category = "Jewelry"
    elif "painting" in text or "चित्र" in text:
        category = "Painting"

    # Price
    price = None
    if "ढाई हजार" in text or "ढाई हज़ार" in text or "dhai hazar" in text:
        price = 2500
    elif "पांच सौ" in text or "पाँच सौ" in text:
        price = 500
    else:
        import re
        p_match = re.search(r'(\d+)\s*(?:के दाम|के भाव|में|रुपये|रूपये|रु|rs|inr|price|cost|rate)', text, re.I) or \
                  re.search(r'(?:price|cost|rate|keemat|kimat|daam|moolya|dam)\s*(?:pe|par|me|mein|is|is:)?\s*₹?\s*(\d+)', text, re.I) or \
                  re.search(r'₹\s*(\d+)', text)
        if p_match:
            price = int(p_match.group(1))
        else:
            digits = [int(n) for n in re.findall(r'\b\d+\b', text) if int(n) >= 50]
            if digits:
                price = max(digits)

    # Quantity
    quantity = None
    import re
    q_match = re.search(r'(\d+)\s*(?:pieces|piece|pcs|pc|items|units|tokri|saree|sarees|साड़ियां|साड़ी|पीस|खिलौने|उपलब्ध)', text, re.I) or \
              re.search(r'(?:paas|stock|quantity|qty|available)\s*:?\s*(\d+)', text, re.I)
    if q_match:
        quantity = int(q_match.group(1))
    elif "पाँच सौ" in text or "पांच सौ" in text:
        quantity = 500
    elif "बीस" in text or "bees" in text:
        quantity = 20
    elif "दस" in text or "das" in text:
        quantity = 10
    elif "पाँच" in text or "पांच" in text or "paanch" in text:
        quantity = 5

    # Color
    color = None
    if "har color" in text or "हर कलर" in text or "har rang" in text or "multiple col" in text:
        color = "Multiple colours"

    return {
        "product_name": name,
        "category": category,
        "craft_type": craft,
        "material": material,
        "description": artisan_description,
        "price": price,
        "quantity": quantity,
        "color": color
    }


def extract_product_information(artisan_description: str) -> Dict[str, Any]:
    """
    Extracts structured product information from natural spoken or written Hindi/Hinglish/English artisan descriptions.
    Uses Gemini AI with semantic understanding rules and fallback retry across models.
    """
    if not client:
        logger.warning("Gemini client is not initialized. Using rule-based fallback extraction.")
        return rule_based_extraction(artisan_description)

    prompt = f"""
You are an expert AI marketplace assistant for Indian artisans. Your task is to semantically analyze natural spoken or written descriptions provided by artisans (in Hindi, Hinglish, English, or regional languages) and extract structured product details into valid JSON.

CORE INSTRUCTIONS:
1. DO NOT require explicit field keywords (like "Name:", "Price:", "Material:"). Artisans speak naturally in full sentences.
2. product_name MUST BE SHORT AND DESCRIPTIVE (2-5 words). It should consist of: [distinguishing characteristic/origin/craft] + [product type].
   - GOOD EXAMPLES: "Lucknow Chikankari Saree", "Banarasi Silk Saree", "Handmade Wooden Toy", "Blue Pottery Vase", "Handwoven Cotton Dupatta".
   - BAD EXAMPLE (NEVER DO THIS): "यह लखनऊ चिकन करी का काम है। हमारे पास इसकी 500 साड़ियां उपलब्ध हैं..." (Do NOT use the whole input sentence as product_name!).
3. craft_type: Extract traditional craft technique from natural phrases.
   - "लखनऊ चिकन करी का काम" -> "Lucknow Chikankari"
   - "हाथ से बुना हुआ" -> "Handloom / Handwoven"
   - "ब्लॉक प्रिंट" -> "Block Printing"
   - "मधुबनी पेंटिंग" -> "Madhubani Painting"
   - "कढ़ाई का काम" -> "Embroidery"
   - "हाथ से बनाया हुआ" -> "Handmade"
4. category: Infer appropriate broad product category (e.g., "Textiles", "Woodwork", "Pottery", "Jewelry", "Painting", "Handicrafts").
5. material: Extract ONLY if explicitly mentioned (e.g., "शुद्ध सिल्क" -> "Pure Silk", "कॉटन" -> "Cotton", "लकड़ी" -> "Wood").
   - CRITICAL: If material is NOT explicitly mentioned, set "material": null. DO NOT guess or invent material!
6. price: Numeric value only (integer/float). Parse natural Indian price expressions and Hindi number words:
   - "2500 रुपये" -> 2500
   - "2500 के दाम पे" -> 2500
   - "2500 में बेचेंगे" -> 2500
   - "कीमत ढाई हजार है" -> 2500
   - "₹2500" or "रुपये 2500" -> 2500
   - Do NOT include symbols or text in price. Must be pure numeric integer (e.g. 2500).
7. quantity: Numeric integer only. Parse natural quantity expressions and Hindi numbers:
   - "500 साड़ियां उपलब्ध हैं" -> 500
   - "मेरे पास 20 पीस हैं" -> 20
   - "दस जोड़े उपलब्ध हैं" -> 10
   - "पाँच पीस" -> 5
   - Do NOT confuse quantity with price.
8. number normalization (Hindi words to numbers):
   - एक -> 1, दो -> 2, तीन -> 3, चार -> 4, पाँच/पांच -> 5, दस -> 10, बीस -> 20, पचास -> 50, सौ -> 100, पाँच सौ -> 500, एक हजार -> 1000, ढाई हजार -> 2500.
9. color: Extract color availability.
   - "हर कलर में मिल जाएंगी" / "विभिन्न रंगों में उपलब्ध" -> "Multiple colours"
   - "लाल, हरा और नीला" -> "Red, Green, Blue"
   - If not mentioned -> null.
10. description: Provide a clean, polite version preserving the complete artisan information in full detail.
11. If any field is not mentioned or absent in input, return null for that field. DO NOT invent fake data or ask follow-up questions.

Return ONLY a JSON object matching this schema:
{{
    "product_name": "string (Short 2-5 words)",
    "category": "string or null",
    "craft_type": "string or null",
    "material": "string or null",
    "description": "string preserving complete artisan context",
    "price": integer or null,
    "quantity": integer or null,
    "color": "string or null"
}}

ARTISAN DESCRIPTION:
{artisan_description}
"""

    last_err = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.replace("```json", "").replace("```", "").strip()

            parsed = json.loads(text)

            # Clean numeric types if returned as string
            if parsed.get("price") is not None:
                try:
                    import re
                    raw_p = str(parsed["price"])
                    clean_p = re.sub(r"[^\d.]", "", raw_p)
                    parsed["price"] = float(clean_p) if clean_p else None
                except (ValueError, TypeError):
                    pass

            if parsed.get("quantity") is not None:
                try:
                    import re
                    raw_q = str(parsed["quantity"])
                    clean_q = re.sub(r"[^\d]", "", raw_q)
                    parsed["quantity"] = int(clean_q) if clean_q else None
                except (ValueError, TypeError):
                    pass

            return parsed
        except errors.ClientError as e:
            last_err = e
            if e.code == 429:
                logger.warning("Rate limit reached on Gemini Free Tier. Falling back to rule-based semantic extraction.")
                return rule_based_extraction(artisan_description)
            else:
                logger.error(f"Client error with Gemini: {e}")
                break
        except Exception as e:
            last_err = e
            logger.warning(f"Unexpected error with Gemini: {e}")

    logger.warning("Gemini API call unsuccessful. Utilizing rule-based fallback extraction.")
    return rule_based_extraction(artisan_description)


if __name__ == "__main__":
    test_description = """
    यह लखनऊ चिकन करी का काम है। हमारे पास इसकी 500 साड़ियां उपलब्ध हैं।
    हर कलर में मिल जाएंगी और हम इसे 2500 के दाम पे बेचना चाहते हैं।
    """

    product = extract_product_information(test_description)

    print("\n--- STRUCTURED PRODUCT ---")
    print(json.dumps(product, indent=4, ensure_ascii=False))