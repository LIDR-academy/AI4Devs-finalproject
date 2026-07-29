from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.patient import Patient


class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **data) -> Patient:
        patient = Patient(**data)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def get(self, patient_id: str) -> Patient | None:
        return self.db.get(Patient, patient_id)

    def list(self) -> list[Patient]:
        return list(self.db.scalars(select(Patient).order_by(Patient.created_at.desc())))
