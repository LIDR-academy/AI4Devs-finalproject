import uuid

from pydantic import BaseModel, ConfigDict


class ClinicalBaselineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    concept: str
    start_date: str | None = None
    details: str | None = None
