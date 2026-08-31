import os
import json
import logging
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

from sku import generate_sku
from product_ai import extract_product_information
from supabase_clients import friend_supabase, karigarai_supabase, check_supabase_health
from product_mapping import map_to_karigarai_product, map_to_karigarai_translation

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("karigarai_backend")

load_dotenv()

app = FastAPI(
    title="KarigarAI / ArtSathi AI Backend",
    description="Dual-Supabase Python FastAPI AI Backend for Audio Processing, Entity Extraction, and Multi-Database Sync.",
    version="2.0.0"
)

# Enable CORS for mobile app & web frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


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
    """
    Health check endpoint returning connection status for both Supabase projects.
    """
    db_health = check_supabase_health()
    return {
        "status": "online",
        "service": "KarigarAI / ArtSathi AI Backend",
        "gemini_configured": client is not None,
        "friend_supabase": db_health.get("friend_supabase"),
        "karigarai_supabase": db_health.get("karigarai_supabase"),
        "details": db_health.get("details")
    }


@app.post("/api/product-ai/process")
async def process_product(
    audio: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    artisan_id: Optional[str] = Form(None),
    language: Optional[str] = Form("hi")
):
    """
    Main AI Processing Pipeline:
    1. Transcribe audio (or use text description) via Gemini AI.
    2. Extract structured product information.
    3. Generate SKU.
    4. Save to FRIEND SUPABASE (Preserves existing AI processing pipeline).
    5. Synchronize to KARIGARAI SUPABASE (if artisan_id is provided).
    """
    logger.info("[AI] Processing started")

    if not client:
        logger.error("[AI] Gemini API Key missing or client not initialized")
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the backend.")

    artisan_description = ""
    temp_file = None

    try:
        # Handle Audio input if uploaded
        if audio:
            audio_data = await audio.read()
            temp_file = f"temp_{audio.filename}"
            with open(temp_file, "wb") as f:
                f.write(audio_data)

            # Upload audio to Gemini
            audio_file = client.files.upload(file=temp_file)

            # Transcribe audio using Gemini 3.6 Flash
            transcription_response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=[
                    audio_file,
                    """
                    Transcribe exactly what the artisan says.
                    The artisan is speaking in Hindi or regional Indian language.
                    Do not translate.
                    Return only the transcription text.
                    """
                ]
            )
            artisan_description = transcription_response.text.strip()
        elif description:
            artisan_description = description.strip()
        else:
            raise HTTPException(status_code=400, detail="Either audio file or text description must be provided.")

        # Extract structured product information using enhanced product_ai module
        product = extract_product_information(artisan_description)

        # Generate SKU
        category_for_sku = product.get("category") or "Handicraft"
        sku = generate_sku(category_for_sku)
        product["sku"] = sku

        logger.info("[AI] Processing completed successfully")

        # -------------------------------------------------------------
        # STEP A: Save to FRIEND SUPABASE (Preserves Existing Pipeline)
        # -------------------------------------------------------------
        friend_saved = False
        friend_db_data = None
        friend_error = None

        if friend_supabase:
            try:
                friend_payload = {
                    "product_name": product.get("product_name"),
                    "category": product.get("category"),
                    "craft_type": product.get("craft_type"),
                    "material": product.get("material"),
                    "description": product.get("description"),
                    "price": product.get("price"),
                    "quantity": product.get("quantity"),
                    "currency": "INR",
                    "sku": product.get("sku")
                }
                res = friend_supabase.table("products").insert(friend_payload).execute()
                friend_db_data = res.data
                friend_saved = True
                logger.info("[FRIEND DB] Existing operation completed")
            except Exception as e:
                friend_error = str(e)
                logger.error(f"[FRIEND DB] Save failed: {friend_error}")
        else:
            friend_error = "Friend Supabase client not configured"
            logger.warning("[FRIEND DB] Client not configured")

        # -------------------------------------------------------------
        # NOTE: Do NOT insert into KarigarAI Supabase during AI processing.
        # Final product insertion strictly occurs when artisan clicks "Confirm & Save"
        # in the Product Wizard via createProductWithTranslations().
        # -------------------------------------------------------------

        return {
            "success": True,
            "filename": audio.filename if audio else None,
            "transcription": artisan_description,
            "product": product,
            "sku": sku,
            "friend_supabase_saved": friend_saved,
            "friend_supabase_result": friend_db_data,
            "friend_supabase_error": friend_error
        }

    except Exception as e:
        logger.error(f"[AI] Error processing product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/api/products/save")
async def save_karigarai_product(payload: SaveProductRequest):
    """
    Explicit Product Confirmation & Save Endpoint for KarigarAI App.
    Saves confirmed/edited product details to KARIGARAI SUPABASE ONLY.
    """
    logger.info("[KARIGARAI DB] Manual product save initiated")

    if not karigarai_supabase:
        logger.error("[KARIGARAI DB] Client not configured")
        raise HTTPException(status_code=500, detail="KarigarAI Supabase is not configured on the backend.")

    try:
        artisan_id = payload.artisan_id
        product_data = payload.product

        # Verify SKU or generate if missing
        if not product_data.get("sku"):
            product_data["sku"] = generate_sku(product_data.get("category") or "Handicraft")

        # Check for duplication by SKU in KarigarAI DB if SKU is provided
        sku = product_data.get("sku")
        if sku:
            existing = karigarai_supabase.table("products").select("id").eq("sku", sku).execute()
            if existing.data and len(existing.data) > 0:
                logger.info(f"[KARIGARAI DB] Duplicate SKU detected: {sku}. Returning existing record.")
                return {
                    "success": True,
                    "duplicate": True,
                    "product_id": existing.data[0]["id"],
                    "message": "Product with this SKU already exists in KarigarAI DB."
                }

        # Map and insert to KarigarAI Supabase
        karigarai_payload = map_to_karigarai_product(
            product_data,
            artisan_id=artisan_id,
            cover_image_url=payload.cover_image_url,
            tags=payload.tags
        )

        res = karigarai_supabase.table("products").insert(karigarai_payload).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to insert product into KarigarAI database.")

        created_product = res.data[0]
        product_id = created_product["id"]

        # Insert Translation Record if original description provided
        translation_saved = False
        if payload.original_description:
            translation_payload = map_to_karigarai_translation(
                product_id=product_id,
                original_description=payload.original_description,
                english_description=product_data.get("description"),
                language_code=payload.language_code or "hi"
            )
            karigarai_supabase.table("product_translations").insert(translation_payload).execute()
            translation_saved = True

        logger.info("[KARIGARAI DB] Manual product save completed successfully")

        return {
            "success": True,
            "product_id": product_id,
            "product": created_product,
            "translation_saved": translation_saved
        }

    except Exception as e:
        logger.error(f"[KARIGARAI DB] Save failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)