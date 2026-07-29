from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.event import EventRead


class TimelineResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    patient_id: str
    events: list[EventRead]
    # Longitudinal context assembled by Statewave (empty string if unavailable).
    context: str = ""
