from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from app.shared.database import get_db
from app.shared.models import Conversation, Message, MessageRole, PromptVersion
from app.shared.config import get_settings
from openai import OpenAI

router = APIRouter(prefix="/api/v1", tags=["chatbot"])
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_identifier: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    message_id: str
    conversation_id: str


def get_active_prompt(db: Session) -> str:
    prompt = db.query(PromptVersion).filter(PromptVersion.is_active == True).first()
    if not prompt:
        return "You are a helpful customer service assistant. Be concise and friendly."
    return prompt.content


def get_or_create_conversation(db: Session, session_id: str, user_identifier: Optional[str]) -> Conversation:
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.created_at.desc()).first()

    if not conversation:
        conversation = Conversation(
            session_id=session_id,
            user_identifier=user_identifier
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return conversation


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Get or create conversation
    conversation = get_or_create_conversation(db, request.session_id, request.user_identifier)

    # Get active prompt
    system_prompt = get_active_prompt(db)

    # Build message history for context
    history = []
    for msg in conversation.messages[-10:]:  # last 10 messages for context
        history.append({"role": msg.role.value, "content": msg.content})

    # Add current user message
    history.append({"role": "user", "content": request.message})

    # Save user message to DB
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=request.message
    )
    db.add(user_message)
    db.commit()

    # Call OpenAI
    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "system", "content": system_prompt}] + history,
            max_tokens=500,
            temperature=0.7
        )
        assistant_content = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    # Save assistant message to DB
    assistant_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=assistant_content
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return ChatResponse(
        response=assistant_content,
        message_id=str(assistant_message.id),
        conversation_id=str(conversation.id)
    )
