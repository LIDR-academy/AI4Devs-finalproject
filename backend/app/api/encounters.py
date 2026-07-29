from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.encounter_repository import EncounterRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.encounter import EncounterCreate, EncounterRead

router = APIRouter(tags=["encounters"])


@router.post("/encounters", response_model=EncounterRead, status_code=201)
def create_encounter(payload: EncounterCreate, db: Session = Depends(get_db)):
    if PatientRepository(db).get(payload.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    encounter = EncounterRepository(db).create(
        patient_id=payload.patient_id,
        date=payload.date,
        type=payload.type,
        note_text=payload.note_text,
    )
    return encounter
