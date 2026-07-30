import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_repository
from app.repositories.interfaces import IHealthRepository
from app.schemas.patient import PatientCreate, PatientRead

router = APIRouter(tags=["patients"])


@router.post("/patients", response_model=PatientRead, status_code=201)
def create_patient(
    payload: PatientCreate,
    repository: IHealthRepository = Depends(get_repository),
) -> PatientRead:
    patient = repository.create_patient(
        full_name=payload.full_name,
        sex=payload.sex.value,
        date_of_birth=payload.date_of_birth,
        email=payload.email,
    )
    return PatientRead.model_validate(patient)


@router.get("/patients/{patient_id}", response_model=PatientRead)
def get_patient(
    patient_id: uuid.UUID,
    repository: IHealthRepository = Depends(get_repository),
) -> PatientRead:
    patient = repository.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return PatientRead.model_validate(patient)
