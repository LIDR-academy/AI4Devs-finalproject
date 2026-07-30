import uuid
from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict


class Sex(str, Enum):
    MALE = "Hombre"
    FEMALE = "Mujer"
    OTHER = "Otro"


class PatientCreate(BaseModel):
    full_name: str
    sex: Sex
    date_of_birth: date
    email: str | None = None


class PatientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    sex: str
    date_of_birth: date
    email: str | None = None
