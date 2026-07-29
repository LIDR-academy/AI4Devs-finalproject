from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import encounters, events, patients, timeline
from app.core.database import prepare_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    prepare_database()
    yield


app = FastAPI(
    title="AuditCare Timeline API",
    description="Backend API for the AI4Devs final project.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(encounters.router)
app.include_router(events.router)
app.include_router(timeline.router)


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
