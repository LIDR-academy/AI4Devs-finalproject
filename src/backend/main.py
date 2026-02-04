from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SF-PM API",
    description="Sagrada Familia Parts Manager API",
    version="0.1.0"
)

# CORS Config
origins = ["*"]  # Valid command for MVP, restrict in prod

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "phase": "sprint-0"}
