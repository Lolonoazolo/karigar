import os
import json
import logging
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from supabase import create_client

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("karigarai_backend")

load_dotenv()

app = FastAPI(
    title="KarigarAI Dual-Supabase AI Backend",
    description="FastAPI AI backend for processing artisan speech audio and connecting to both Friend's Supabase and KarigarAI Supabase.",
    version="2.0.0"
)

# Enable CORS for Next.js web frontend & mobile development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Dual Supabase Configuration
# -------------------------------------------------------------
FRIEND_SUPABASE_URL = os.getenv("FRIEND_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
FRIEND_SUPABASE_KEY = os.getenv("FRIEND_SUPABASE_KEY") or os.getenv("SUPABASE_KEY", "")

KARIGARAI_SUPABASE_URL = (
    os.getenv("KARIGARAI_SUPABASE_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    or os.getenv("SUPABASE_URL", "")
)
KARIGARAI_SUPABASE_KEY = (
    os.getenv("KARIGARAI_SUPABASE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY", "")
)

friend_supabase = create_client(FRIEND_SUPABASE_URL, FRIEND_SUPABASE_KEY) if FRIEND_SUPABASE_URL and FRIEND_SUPABASE_KEY else None
karigarai_supabase = create_client(KARIGARAI_SUPABASE_URL, KARIGARAI_SUPABASE_KEY) if KARIGARAI_SUPABASE_URL and KARIGARAI_SUPABASE_KEY else None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class SaveProductRequest(BaseModel):
    artisan_id: Optional[str] = None
    product: Dict[str, Any]
    original_description: Optional[str] = ""
    language_code: Optional[str] = "hi"
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = None


@app.get("/")
@app.get("/health")
def health_check():
    friend_status = "connected" if friend_supabase else "not_configured"
    karigarai_status = "connected" if karigarai_supabase else "not_configured"

    return {
        "status": "online",
        "service": "KarigarAI Dual-Supabase AI Backend",
        "version": "2.0.0",
        "friend_supabase": friend_status,
        "karigarai_supabase": karigarai_status,
        "gemini_configured": gemini_client is not None
    }


@app.post("/api/product-ai/process")
async def process_product_ai(
    audio: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    artisan_id: Optional[str] = Form(None),
    language: Optional[str] = Form("hi")
):
    logger.info("[AI] Processing started")
    input_desc = description or ""
    temp_file = None

    try:
        if audio:
            contents = await audio.read()
            temp_file = f"temp_{audio.filename}"
            with open(temp_file, "wb") as f:
                f.write(contents)

            if gemini_client:
                audio_file = gemini_client.files.upload(file=temp_file)
                transcription_response = gemini_client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=[
                        audio_file,
                        "Transcribe exactly what the artisan says in Hindi. Do not translate. Return only transcription text."
                    ]
                )
                input_desc = transcription_response.text.strip()
            else:
                input_desc = "Yeh Banarasi silk ki saree hai. Iska price 2500 rupaye hai aur mere paas 5 pieces hain."

        if not input_desc:
            raise HTTPException(status_code=400, detail="Please record audio or provide a text description.")

        # Entity Extraction via Gemini if client is available
        product_info = {}
        if gemini_client:
            prompt = f"""
You are an AI marketplace assistant for Indian artisans.
Extract product information ONLY from what the artisan said.
Return ONLY valid JSON format:
{{
    "product_name": null,
    "category": null,
    "craft_type": null,
    "material": null,
    "description": null,
    "price": null,
    "quantity": null
}}
ARTISAN DESCRIPTION:
{input_desc}
"""
            res = gemini_client.models.generate_content(model="gemini-3.6-flash", contents=prompt)
            text = res.text.strip()
            if text.startswith("```"):
                text = text.replace("```json", "").replace("```", "").strip()
            product_info = json.loads(text)
        else:
            product_info = {
                "product_name": "Banarasi Silk Saree",
                "category": "Saree",
                "craft_type": "Handloom Weaving",
                "material": "Silk",
                "description": input_desc,
                "price": 2500,
                "quantity": 5
            }

        sku = f"SKU-ART-{(hash(input_desc) % 100000):05d}"
        product_info["sku"] = sku

        logger.info("[AI] Processing completed")

        # Step 1: Save to FRIEND SUPABASE (Preserve existing logic)
        friend_saved = False
        friend_error = None
        if friend_supabase:
            try:
                friend_payload = {
                    "product_name": product_info.get("product_name"),
                    "category": product_info.get("category"),
                    "craft_type": product_info.get("craft_type"),
                    "material": product_info.get("material"),
                    "description": product_info.get("description"),
                    "price": product_info.get("price"),
                    "quantity": product_info.get("quantity"),
                    "currency": "INR",
                    "sku": sku
                }
                friend_supabase.table("products").insert(friend_payload).execute()
                friend_saved = True
                logger.info("[FRIEND DB] Existing operation completed")
            except Exception as e:
                friend_error = str(e)
                logger.error(f"[FRIEND DB] Save failed: {e}")

        # Step 2: Save to KARIGARAI SUPABASE if artisan_id provided
        karigarai_saved = False
        karigarai_product_id = None
        karigarai_error = None

        if karigarai_supabase and artisan_id:
            logger.info("[KARIGARAI DB] Product synchronization started")
            try:
                karigarai_payload = {
                    "artisan_id": artisan_id,
                    "name": product_info.get("product_name") or "Handcrafted Product",
                    "product_name": product_info.get("product_name"),
                    "description": product_info.get("description") or "",
                    "category": product_info.get("category"),
                    "craft_type": product_info.get("craft_type"),
                    "material": product_info.get("material"),
                    "price": float(product_info.get("price") or 0),
                    "quantity": int(product_info.get("quantity") or 1),
                    "stock_quantity": int(product_info.get("quantity") or 1),
                    "currency": "INR",
                    "sku": sku,
                    "status": "published"
                }
                k_res = karigarai_supabase.table("products").insert(karigarai_payload).execute()
                if k_res.data and len(k_res.data) > 0:
                    karigarai_product_id = k_res.data[0]["id"]
                    karigarai_saved = True
                    # Translation insert
                    karigarai_supabase.table("product_translations").insert({
                        "product_id": karigarai_product_id,
                        "language_code": language or "hi",
                        "original_description": input_desc,
                        "english_description": product_info.get("description")
                    }).execute()
                logger.info("[KARIGARAI DB] Product synchronization completed")
            except Exception as e:
                karigarai_error = str(e)
                logger.error(f"[KARIGARAI DB] Sync failed: {e}")

        return {
            "success": True,
            "transcription": input_desc,
            "product": product_info,
            "sku": sku,
            "friend_supabase_saved": friend_saved,
            "friend_error": friend_error,
            "karigarai_supabase_saved": karigarai_saved,
            "karigarai_product_id": karigarai_product_id,
            "karigarai_error": karigarai_error
        }

    except Exception as e:
        logger.error(f"[AI] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/api/products/save")
async def save_karigarai_product(payload: SaveProductRequest):
    logger.info("[KARIGARAI DB] Manual product save started")
    if not karigarai_supabase:
        raise HTTPException(status_code=500, detail="KarigarAI Supabase client not configured.")

    try:
        p_data = payload.product
        sku = p_data.get("sku") or f"SKU-MAN-{(hash(str(p_data)) % 100000):05d}"
        
        karigarai_payload = {
            "name": p_data.get("product_name") or p_data.get("name") or "Handcrafted Product",
            "product_name": p_data.get("product_name"),
            "description": p_data.get("description") or "",
            "category": p_data.get("category"),
            "craft_type": p_data.get("craft_type"),
            "material": p_data.get("material"),
            "price": float(p_data.get("price") or 0),
            "quantity": int(p_data.get("quantity") or 1),
            "stock_quantity": int(p_data.get("quantity") or 1),
            "currency": "INR",
            "sku": sku,
            "status": "published"
        }
        if payload.artisan_id:
            karigarai_payload["artisan_id"] = payload.artisan_id
        if payload.cover_image_url:
            karigarai_payload["cover_image_url"] = payload.cover_image_url

        res = karigarai_supabase.table("products").insert(karigarai_payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Insertion failed")

        created = res.data[0]
        p_id = created["id"]

        if payload.original_description:
            karigarai_supabase.table("product_translations").insert({
                "product_id": p_id,
                "language_code": payload.language_code or "hi",
                "original_description": payload.original_description,
                "english_description": p_data.get("description")
            }).execute()

        logger.info("[KARIGARAI DB] Manual product save completed")
        return {
            "success": True,
            "product_id": p_id,
            "product": created
        }
    except Exception as e:
        logger.error(f"[KARIGARAI DB] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
