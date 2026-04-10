import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.shared.database import Base
import enum


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"


class FeedbackStatus(str, enum.Enum):
    PENDING = "PENDING"
    ANALYSED = "ANALYSED"
    APPLIED = "APPLIED"
    REJECTED = "REJECTED"


class RootCause(str, enum.Enum):
    PROMPT = "PROMPT"
    EXTERNAL_DATA = "EXTERNAL_DATA"
    WORKFLOW = "WORKFLOW"
    UNKNOWN = "UNKNOWN"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    workflow_id = Column(String(255), nullable=True)
    execution_id = Column(String(255), nullable=True)
    user_identifier = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(SAEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", uselist=False)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=False, unique=True)
    admin_comment = Column(Text, nullable=False)
    expected_response = Column(Text, nullable=True)
    status = Column(SAEnum(FeedbackStatus), default=FeedbackStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="feedback")
    analysis = relationship("FeedbackAnalysis", back_populates="feedback", uselist=False)


class FeedbackAnalysis(Base):
    __tablename__ = "feedback_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feedback_id = Column(UUID(as_uuid=True), ForeignKey("feedback.id"), nullable=False, unique=True)
    root_cause = Column(SAEnum(RootCause), nullable=False)
    analysis = Column(Text, nullable=False)
    proposed_prompt = Column(Text, nullable=True)
    accepted = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedback = relationship("Feedback", back_populates="analysis")
    prompt_version = relationship("PromptVersion", back_populates="feedback_analysis", uselist=False)


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    feedback_analysis_id = Column(UUID(as_uuid=True), ForeignKey("feedback_analysis.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(50), default="system")

    feedback_analysis = relationship("FeedbackAnalysis", back_populates="prompt_version")
