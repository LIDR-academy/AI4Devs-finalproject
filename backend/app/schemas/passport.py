import uuid

from pydantic import BaseModel

from app.schemas.clinical_baseline import ClinicalBaselineRead
from app.schemas.medical_event import MedicalEventRead


class PassportResponse(BaseModel):
    patient_id: uuid.UUID
    baseline: list[ClinicalBaselineRead]
    timeline: list[MedicalEventRead]
