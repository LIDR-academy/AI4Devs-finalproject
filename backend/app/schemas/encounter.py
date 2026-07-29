from datetime import date as date_type

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class EncounterBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    patient_id: str
    date: date_type | None = None
    type: str | None = None
    note_text: str = Field(default="", max_length=20000)


class EncounterCreate(EncounterBase):
    pass


class EncounterRead(EncounterBase):
    model_config = ConfigDict(
        from_attributes=True, populate_by_name=True, alias_generator=to_camel
    )

    id: str
