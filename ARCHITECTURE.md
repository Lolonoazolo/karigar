# KarigarAI / ArtSathi — Technical Architecture Documentation

> **Document Version**: 2.0.0  
> **Last Updated**: August 2026  
> **Target Audience**: Software Architects, Senior Developers, Full-Stack Engineers, AI Pipeline Engineers  
> **Status Legend**:
> - ✅ **Implemented**: Fully built, connected, and functioning in the codebase.
> - 🟡 **Partially Implemented**: UI/Interface built with partial backend wiring or fallback logic.
> - 🔴 **Planned / Not Implemented**: Architected design target not yet integrated into source code.
> - ⚠️ **Requires Configuration**: Requires active API keys, external service endpoints, or provider setup.

---

## 1. PROJECT OVERVIEW

**KarigarAI** (also known as **ArtSathi**) is a mobile-first digital assistant and catalog management platform designed for rural and semi-urban artisans across India.

### Core Concept
> An artisan should be able to use voice, images, and simple interactions to digitize their products and manage their digital presence without requiring advanced digital literacy.

---

## 2. HIGH-LEVEL ARCHITECTURE & SERVER-TO-SERVER BRIDGE

```
                    ARTISAN
                       │
                       ▼
             KARIGARAI FRONTEND (Next.js 16)
                       │
                 🎙️ REAL AUDIO (MediaRecorder Blob)
                       │
                       ▼
             NEXT.JS API ROUTE BRIDGE
             /api/product-ai/process
                       │
                       │ server-to-server fetch (PYTHON_AI_API_URL)
                       ▼
              PYTHON FASTAPI (api.py)
                       │
                       ▼
                    GEMINI
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        TRANSCRIPTION       PRODUCT DATA
             │                   │
             └─────────┬─────────┘
                       ▼
              FRIEND SUPABASE (Legacy AI)
                       │
                       ▼
                JSON RESPONSE
                       │
                       ▼
                NEXT.JS API
                       │
                       ▼
             KARIGARAI PRODUCT
                 PREVIEW
                       │
                 Artisan edits
                       │
                       ▼
                CONFIRM & SAVE
                       │
                       ▼
             KARIGARAI SUPABASE (App Master)
                       │
                       ▼
                PRODUCT CREATED
```

---

## 3. DUAL SUPABASE PROJECTS & PURPOSE

| Database Project | Purpose & Usage | Credentials & Scope |
| :--- | :--- | :--- |
| **Friend Supabase** | Existing AI backend database used by Python pipeline (`product_ai.py`, `save_product.py`). Keeps friend's AI processing ecosystem intact. | `FRIEND_SUPABASE_URL`<br>`FRIEND_SUPABASE_KEY`<br>*(Configured in Python backend environment)* |
| **KarigarAI Supabase** | Master application database for KarigarAI mobile app. Stores verified products, artisans, translations, images, and orders. | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`<br>*(Configured in Next.js frontend & backend)* |

---

## 4. VOICE / AUDIO PIPELINE

- **Client Microphone Recording**: Browser `MediaRecorder` API (`VoiceRecorder.tsx`) records real audio chunks and creates a real `Blob` (`audio/webm`, `audio/ogg`, or `audio/mp4`).
- **Frontend Service Layer**: `src/services/ai/productProcessor.ts` constructs `FormData` and sends `multipart/form-data` to Next.js API route `/api/product-ai/process`.
- **Server Bridge**: Next.js route `/api/product-ai/process` acts as a server-side proxy forwarding the audio file to Python FastAPI backend (`${PYTHON_AI_API_URL}/api/product-ai/process`).
- **Python Processing**: `api.py` uploads audio to Gemini, transcribes Hindi speech, extracts structured product fields (`product_name`, `category`, `craft_type`, `material`, `price`, `quantity`, `sku`), inserts record into Friend Supabase, and returns JSON response to Next.js.
- **Preview & Edit**: Next.js normalizes response into `ProductDataSchema` and populates editable preview form.
- **Confirmation**: Artisan edits fields and clicks "Confirm & Save", calling `createProductWithTranslations()` in `productService.ts` to upload photo to `product-images` bucket and insert product into **KarigarAI Supabase**.

---

## 5. ENVIRONMENT VARIABLES SPECIFICATION

### Next.js Frontend & Server (`.env.local`)
```env
# Master KarigarAI Application Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ewrmwcjradgvzvkwhcyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rhGwY9jXFVAHnq28oYAz-A_DE2BxJ95
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_rhGwY9jXFVAHnq28oYAz-A_DE2BxJ95

# Internal Server Bridge to Python FastAPI Backend
PYTHON_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

### Python FastAPI Backend (`.env`)
```env
# Friend / Existing AI Supabase Credentials
FRIEND_SUPABASE_URL=https://your-friend-project.supabase.co
FRIEND_SUPABASE_KEY=your-friend-anon-or-service-key

# KarigarAI Application Supabase Credentials
KARIGARAI_SUPABASE_URL=https://ewrmwcjradgvzvkwhcyh.supabase.co
KARIGARAI_SUPABASE_KEY=your-karigarai-service-role-key

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 6. LOCAL DEVELOPMENT INSTRUCTIONS

1. **Terminal 1 — Python FastAPI Backend**:
   ```bash
   pip install -r requirements.txt
   uvicorn api:app --reload --port 8000
   ```

2. **Terminal 2 — KarigarAI Next.js App**:
   ```bash
   npm run dev
   ```

3. **Browser Execution**:
   - Open `http://localhost:3000/artisan/products/new`.
   - Browser calls Next.js API `http://localhost:3000/api/product-ai/process`.
   - Next.js server proxies call to Python API `http://localhost:8000/api/product-ai/process`.
   - Browser does **NOT** call port 8000 directly, preserving security and CORS compliance!

---

## 7. ARCHITECTURE STATUS MATRIX

| Area | Status | Implementation Details |
| :--- | :---: | :--- |
| **Mobile Frontend** | 🟢 Implemented | Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide React |
| **Real Audio Recording** | 🟢 Implemented | `VoiceRecorder.tsx` MediaRecorder API creating real audio Blobs |
| **Frontend AI Service** | 🟢 Implemented | `productProcessor.ts` service abstraction sending multipart FormData |
| **Next.js Server Proxy** | 🟢 Implemented | `/api/product-ai/process` route forwarding audio to Python backend |
| **Python FastAPI AI Backend** | 🟢 Implemented | `api.py` running on port 8000 with Gemini speech & entity extraction |
| **Dual Supabase Integration** | 🟢 Implemented | Friend Supabase (AI pipeline) + KarigarAI Supabase (App master) |
| **Product Preview & Edit** | 🟢 Implemented | Product Wizard Step 4 with inline editing form |
| **Confirm & Save** | 🟢 Implemented | Atomic insertion to KarigarAI Supabase + `product-images` storage bucket |
| **Production Build** | 🟢 Implemented | Zero TypeScript / build errors (`npm run build`) |
