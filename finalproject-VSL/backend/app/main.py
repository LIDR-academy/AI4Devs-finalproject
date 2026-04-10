from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import os

from app.shared.database import engine, Base
from app.modules.chatbot.router import router as chatbot_router
from app.modules.feedback.router import router as feedback_router
from app.modules.meta_agent.router import router as meta_agent_router
from app.modules.prompts.router import router as prompts_router

# Create tables (for development; use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChatBot Self-Improvement System",
    description="AI4Devs Final Project — Human-in-the-loop chatbot improvement",
    version="1.0.0"
)

# Static files and templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Include API routers
app.include_router(chatbot_router)
app.include_router(feedback_router)
app.include_router(meta_agent_router)
app.include_router(prompts_router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "ChatBot Self-Improvement System"}


# Frontend routes (Jinja2)
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/chat", response_class=HTMLResponse)
def chat_page(request: Request):
    return templates.TemplateResponse("chat/index.html", {"request": request})


@app.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    return templates.TemplateResponse("admin/index.html", {"request": request})


@app.get("/admin/conversations", response_class=HTMLResponse)
def admin_conversations(request: Request):
    return templates.TemplateResponse("admin/conversations.html", {"request": request})


@app.get("/admin/conversations/{conversation_id}", response_class=HTMLResponse)
def admin_conversation_detail(request: Request, conversation_id: str):
    return templates.TemplateResponse(
        "admin/conversation_detail.html",
        {"request": request, "conversation_id": conversation_id}
    )


@app.get("/admin/feedback", response_class=HTMLResponse)
def admin_feedback(request: Request):
    return templates.TemplateResponse("admin/feedback.html", {"request": request})


@app.get("/admin/prompts", response_class=HTMLResponse)
def admin_prompts(request: Request):
    return templates.TemplateResponse("admin/prompts.html", {"request": request})
