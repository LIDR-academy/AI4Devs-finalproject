from datetime import date

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class EventRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, populate_by_name=True, alias_generator=to_camel
    )

    id: str
    encounter_id: str
    patient_id: str
    category: str
    title: str
    description: str
    event_date: date | None = None
    source_quote: str
    confidence: float
    extraction_source: str
