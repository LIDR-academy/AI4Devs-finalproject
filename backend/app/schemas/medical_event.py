import uuid

from pydantic import BaseModel, ConfigDict


class MedicalEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    date: str
    type: str
    clinical_summary: str
    original_notes: str | None = None
    severity: str
    doctor: str | None = None
    medical_center: str | None = None
    department: str | None = None
    red_flag: bool = False
    alert_justification: str | None = None
