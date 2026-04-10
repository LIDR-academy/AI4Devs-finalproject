from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
from pydantic import BaseModel
from typing import Optional
import uuid
import json

from app.shared.database import get_db
from app.shared.models import (
    Feedback, FeedbackStatus, FeedbackAnalysis, RootCause,
    PromptVersion, Message
)
from app.shared.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["meta-agent"])
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

META_AGENT_SYSTEM_PROMPT = """You are a meta-agent specialized in analyzing chatbot failures and proposing prompt improvements.

You will receive:
1. The current system prompt of the chatbot
2. A full conversation where a problem occurred
3. The admin's feedback describing what went wrong and optionally what the correct response should have been

Your task is to:
1. Analyze the conversation and identify the root cause of the problem
2. Classify it as one of: PROMPT (the issue is in the system prompt), EXTERNAL_DATA (the bot lacked real data), WORKFLOW (the issue is in a process/workflow), UNKNOWN (cannot determine)
3. If the root cause is PROMPT, propose a specific improvement to the system prompt
4. Provide a clear explanation of your reasoning

IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "root_cause": "PROMPT" | "EXTERNAL_DATA" | "WORKFLOW" | "UNKNOWN",
  "analysis": "Your detailed reasoning here",
  "proposed_prompt": "Full improved system prompt here (only if root_cause is PROMPT, otherwise null)"
}"""


def build_meta_agent_prompt(
    current_prompt: str,
    conversation_messages: list,
    admin_comment: str,
    expected_response: Optional[str]
) -> str:
    convo_text = "\n".join([
        f"[{msg['role'].upper()}]: {msg['content']}"
        for msg in conversation_messages
    ])

    expected_text = f"\nExpected correct response: {expected_response}" if expected_response else ""

    return f"""## Current Chatbot System Prompt:
{current_prompt}

## Conversation where the problem occurred:
{convo_text}

## Admin Feedback:
Problem description: {admin_comment}{expected_text}

Analyze this and provide your response as JSON."""


@router.post("/feedback/{feedback_id}/analyse")
def analyse_feedback(feedback_id: str, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(
        Feedback.id == uuid.UUID(feedback_id)
    ).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    # Idempotency: return existing analysis if already done
    if feedback.analysis:
        return {
            "feedback_id": str(feedback.id),
            "root_cause": feedback.analysis.root_cause.value,
            "analysis": feedback.analysis.analysis,
            "proposed_prompt": feedback.analysis.proposed_prompt,
        }

    if feedback.status not in [FeedbackStatus.PENDING]:
        raise HTTPException(
            status_code=400,
            detail=f"Feedback in status {feedback.status.value} cannot be analysed"
        )

    # Get the problematic message and its conversation
    message = feedback.message
    conversation = message.conversation
    conv_messages = [
        {"role": msg.role.value, "content": msg.content}
        for msg in conversation.messages
    ]

    # Get current active prompt
    active_prompt = db.query(PromptVersion).filter(
        PromptVersion.is_active == True
    ).first()
    current_prompt = active_prompt.content if active_prompt else "No system prompt defined."

    # Build and send meta-agent prompt
    user_prompt = build_meta_agent_prompt(
        current_prompt=current_prompt,
        conversation_messages=conv_messages,
        admin_comment=feedback.admin_comment,
        expected_response=feedback.expected_response
    )

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": META_AGENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        result_text = response.choices[0].message.content
        result = json.loads(result_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Meta-agent returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Meta-agent error: {str(e)}")

    # Validate root_cause
    try:
        root_cause = RootCause(result["root_cause"])
    except (KeyError, ValueError):
        root_cause = RootCause.UNKNOWN

    # Save analysis
    analysis = FeedbackAnalysis(
        feedback_id=feedback.id,
        root_cause=root_cause,
        analysis=result.get("analysis", ""),
        proposed_prompt=result.get("proposed_prompt") if root_cause == RootCause.PROMPT else None
    )
    db.add(analysis)

    # Update feedback status
    feedback.status = FeedbackStatus.ANALYSED
    db.commit()
    db.refresh(analysis)

    return {
        "feedback_id": str(feedback.id),
        "root_cause": analysis.root_cause.value,
        "analysis": analysis.analysis,
        "proposed_prompt": analysis.proposed_prompt,
    }


@router.post("/feedback/{feedback_id}/apply")
def apply_proposal(feedback_id: str, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(
        Feedback.id == uuid.UUID(feedback_id)
    ).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.status != FeedbackStatus.ANALYSED:
        raise HTTPException(status_code=400, detail="Feedback must be in ANALYSED status to apply")
    if not feedback.analysis or not feedback.analysis.proposed_prompt:
        raise HTTPException(status_code=400, detail="No proposed prompt to apply")

    # Deactivate current active prompt
    db.query(PromptVersion).filter(PromptVersion.is_active == True).update({"is_active": False})

    # Get next version number
    last_version = db.query(PromptVersion).order_by(
        PromptVersion.version_number.desc()
    ).first()
    next_version = (last_version.version_number + 1) if last_version else 1

    # Create new active prompt version
    new_prompt = PromptVersion(
        version_number=next_version,
        content=feedback.analysis.proposed_prompt,
        is_active=True,
        feedback_analysis_id=feedback.analysis.id,
        created_by="admin"
    )
    db.add(new_prompt)

    # Update analysis and feedback status
    feedback.analysis.accepted = True
    feedback.status = FeedbackStatus.APPLIED

    db.commit()
    db.refresh(new_prompt)

    return {
        "message": "Proposal applied successfully",
        "new_version": new_prompt.version_number,
        "prompt_id": str(new_prompt.id)
    }


@router.post("/feedback/{feedback_id}/reject")
def reject_proposal(feedback_id: str, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(
        Feedback.id == uuid.UUID(feedback_id)
    ).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.status != FeedbackStatus.ANALYSED:
        raise HTTPException(status_code=400, detail="Feedback must be in ANALYSED status to reject")

    feedback.analysis.accepted = False
    feedback.status = FeedbackStatus.REJECTED

    db.commit()

    return {"message": "Proposal rejected. Prompt remains unchanged."}
