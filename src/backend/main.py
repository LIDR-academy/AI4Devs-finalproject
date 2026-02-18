from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import redis

app = FastAPI(
    title="SF-PM API",
    description="Sagrada Familia Parts Manager API",
    version="0.1.0"
)

# CORS Config
origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Alternative dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "phase": "sprint-0"}

@app.get("/ready")
async def readiness_check():
    """
    Readiness probe - checks if service can handle requests.
    
    Verifies:
    - Database connectivity (Supabase)
    - Redis connectivity (Celery broker)
    
    Returns 503 if any dependency is unavailable.
    """
    checks = {}
    all_ready = True
    
    # Check Supabase database connectivity
    try:
        from infra.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        # Simple query to verify connection
        result = supabase.table("blocks").select("id").limit(1).execute()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        all_ready = False
    
    # Check Redis connectivity (Celery broker)
    try:
        celery_broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
        r = redis.from_url(celery_broker_url)
        r.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
        all_ready = False
    
    if all_ready:
        return {
            "status": "ready",
            "checks": checks
        }
    else:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "checks": checks
            }
        )

from api.upload import router as upload_router
from api.validation import router as validation_router

app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(validation_router)

