from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AuditCare Timeline API",
    description="Backend API for the AI4Devs final project.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "auditcare-timeline-api",
        "version": "0.1.0",
    }


@app.get("/")
def root():
    return {
        "message": "AuditCare Timeline API",
        "docs": "/docs",
    }
