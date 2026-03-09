from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

from app.shared.database import get_db
from app.shared.models import (
    Feedback, FeedbackStatus, Message, MessageRole,
    Conversation, FeedbackAnalysis, PromptVersion
)

router = APIRouter(prefix="/api/v1", tags=["feedback"])


class FeedbackCreate(BaseModel):
    message_id: str
    admin_comment: str
    expected_response: Optional[str] = None


class FeedbackOut(BaseModel):
    id: str
    message_id: str
    admin_comment: str
    expected_response: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/feedback", response_model=FeedbackOut, status_code=201)
def create_feedback(request: FeedbackCreate, db: Session = Depends(get_db)):
    # Validate message exists and is from assistant
    message = db.query(Message).filter(Message.id == uuid.UUID(request.message_id)).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.role != MessageRole.assistant:
        raise HTTPException(status_code=400, detail="Can only report feedback on assistant messages")

    # Check no existing feedback for this message
    existing = db.query(Feedback).filter(Feedback.message_id == message.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Feedback already exists for this message")

    feedback = Feedback(
        message_id=message.id,
        admin_comment=request.admin_comment,
        expected_response=request.expected_response,
        status=FeedbackStatus.PENDING
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackOut(
        id=str(feedback.id),
        message_id=str(feedback.message_id),
        admin_comment=feedback.admin_comment,
        expected_response=feedback.expected_response,
        status=feedback.status.value,
        created_at=feedback.created_at
    )


@router.get("/feedback", response_model=List[FeedbackOut])
def list_feedback(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    return [
        FeedbackOut(
            id=str(f.id),
            message_id=str(f.message_id),
            admin_comment=f.admin_comment,
            expected_response=f.expected_response,
            status=f.status.value,
            created_at=f.created_at
        ) for f in feedbacks
    ]


@router.get("/conversations")
def list_conversations(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(
        Conversation.updated_at.desc()
    ).offset(offset).limit(limit).all()

    result = []
    for conv in conversations:
        result.append({
            "id": str(conv.id),
            "session_id": conv.session_id,
            "user_identifier": conv.user_identifier,
            "message_count": len(conv.messages),
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        })
    return result


@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(
        Conversation.id == uuid.UUID(conversation_id)
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = []
    for msg in conv.messages:
        msg_data = {
            "id": str(msg.id),
            "role": msg.role.value,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
            "has_feedback": msg.feedback is not None,
            "feedback_status": msg.feedback.status.value if msg.feedback else None,
        }
        messages.append(msg_data)

    return {
        "id": str(conv.id),
        "session_id": conv.session_id,
        "user_identifier": conv.user_identifier,
        "created_at": conv.created_at.isoformat(),
        "messages": messages
    }
