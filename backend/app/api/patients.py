from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientCreate, PatientRead

router = APIRouter(tags=["patients"])


@router.post("/patients", response_model=PatientRead, status_code=201)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    repo = PatientRepository(db)
    patient = repo.create(
        name=payload.name, birth_date=payload.birth_date, sex=payload.sex
    )
    return patient


@router.get("/patients", response_model=list[PatientRead])
def list_patients(db: Session = Depends(get_db)):
    return PatientRepository(db).list()
