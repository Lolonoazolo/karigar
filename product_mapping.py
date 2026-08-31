"""
Data Mapping Layer for KarigarAI Backend
Converts extracted AI product data and friend's database structures into KarigarAI schema format.
"""

from typing import Dict, Any, Optional, List

import re

def map_to_karigarai_product(
    ai_result: Dict[str, Any],
    artisan_id: Optional[str] = None,
    cover_image_url: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Maps product dictionary produced by AI pipeline to KarigarAI database schema.
    """
    raw_name = ai_result.get("product_name") or ai_result.get("name") or "Handcrafted Product"

    # Robust numeric price parsing (strips currency symbols e.g. "₹2500" -> 2500.0)
    raw_price = ai_result.get("price")
    price = 0.0
    if raw_price is not None:
        try:
            if isinstance(raw_price, (int, float)):
                price = float(raw_price)
            else:
                clean_p = re.sub(r'[^\d.]', '', str(raw_price))
                price = float(clean_p) if clean_p else 0.0
        except (ValueError, TypeError):
            price = 0.0

    # Robust numeric quantity parsing
    raw_qty = ai_result.get("quantity") or ai_result.get("stock_quantity") or ai_result.get("stock")
    quantity = 1
    if raw_qty is not None:
        try:
            if isinstance(raw_qty, (int, float)):
                quantity = int(raw_qty)
            else:
                clean_q = re.sub(r'[^\d]', '', str(raw_qty))
                quantity = int(clean_q) if clean_q else 1
        except (ValueError, TypeError):
            quantity = 1

    mapped = {
        "name": raw_name,
        "product_name": raw_name,
        "description": ai_result.get("description") or "",
        "category": ai_result.get("category"),
        "craft_type": ai_result.get("craft_type") or ai_result.get("craft"),
        "material": ai_result.get("material"),
        "price": price,
        "quantity": quantity,
        "stock_quantity": quantity,
        "color": ai_result.get("color"),
        "currency": ai_result.get("currency") or "INR",
        "sku": ai_result.get("sku"),
        "status": ai_result.get("status") or "published",
    }

    if artisan_id:
        mapped["artisan_id"] = artisan_id

    if cover_image_url:
        mapped["cover_image_url"] = cover_image_url

    if tags is not None:
        mapped["tags"] = tags

    return mapped


def map_to_karigarai_translation(
    product_id: str,
    original_description: str,
    english_description: Optional[str] = None,
    language_code: str = "hi"
) -> Dict[str, Any]:
    """
    Maps translation data to KarigarAI product_translations schema.
    """
    return {
        "product_id": product_id,
        "language_code": language_code or "hi",
        "original_description": original_description or "",
        "english_description": english_description or ""
    }
