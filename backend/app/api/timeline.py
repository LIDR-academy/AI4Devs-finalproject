from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.patient_repository import PatientRepository
from app.schemas.event import EventRead
from app.schemas.timeline import TimelineResponse
from app.services.timeline_service import TimelineService

router = APIRouter(tags=["timeline"])


@router.get("/patients/{patient_id}/timeline", response_model=TimelineResponse)
def get_timeline(patient_id: str, db: Session = Depends(get_db)):
    if PatientRepository(db).get(patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    events, context = TimelineService(db).get_patient_timeline(patient_id)
    return TimelineResponse(
        patient_id=patient_id,
        events=[EventRead.model_validate(e) for e in events],
        context=context,
    )
