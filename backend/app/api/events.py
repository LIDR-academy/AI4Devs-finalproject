from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.encounter_repository import EncounterRepository
from app.schemas.event import EventRead
from app.services.extraction_service import ExtractionService

router = APIRouter(tags=["events"])


@router.post(
    "/encounters/{encounter_id}/extract-events", response_model=list[EventRead]
)
def extract_events(encounter_id: str, db: Session = Depends(get_db)):
    encounter = EncounterRepository(db).get(encounter_id)
    if encounter is None:
        raise HTTPException(status_code=404, detail="Encounter not found")

    return ExtractionService(db).extract_for_encounter(encounter)
