from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

from api.upload import router as upload_router
from api.validation import router as validation_router

app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(validation_router)

