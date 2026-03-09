from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.shared.database import get_db
from app.shared.models import PromptVersion

router = APIRouter(prefix="/api/v1", tags=["prompts"])


class PromptOut(BaseModel):
    id: str
    version_number: int
    content: str
    is_active: bool
    created_at: datetime
    created_by: str
    feedback_analysis_id: Optional[str]


@router.get("/prompts", response_model=List[PromptOut])
def list_prompts(db: Session = Depends(get_db)):
    prompts = db.query(PromptVersion).order_by(PromptVersion.version_number.desc()).all()
    return [
        PromptOut(
            id=str(p.id),
            version_number=p.version_number,
            content=p.content,
            is_active=p.is_active,
            created_at=p.created_at,
            created_by=p.created_by,
            feedback_analysis_id=str(p.feedback_analysis_id) if p.feedback_analysis_id else None
        ) for p in prompts
    ]


@router.get("/prompts/active", response_model=PromptOut)
def get_active_prompt(db: Session = Depends(get_db)):
    prompt = db.query(PromptVersion).filter(PromptVersion.is_active == True).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="No active prompt found")
    return PromptOut(
        id=str(prompt.id),
        version_number=prompt.version_number,
        content=prompt.content,
        is_active=prompt.is_active,
        created_at=prompt.created_at,
        created_by=prompt.created_by,
        feedback_analysis_id=str(prompt.feedback_analysis_id) if prompt.feedback_analysis_id else None
    )


@router.post("/prompts/{prompt_id}/activate")
def activate_prompt(prompt_id: str, db: Session = Depends(get_db)):
    prompt = db.query(PromptVersion).filter(
        PromptVersion.id == uuid.UUID(prompt_id)
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt version not found")

    # Deactivate all, activate selected
    db.query(PromptVersion).filter(PromptVersion.is_active == True).update({"is_active": False})
    prompt.is_active = True
    db.commit()

    return {"message": f"Prompt version {prompt.version_number} is now active"}
