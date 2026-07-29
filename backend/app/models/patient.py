import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, Base

if TYPE_CHECKING:
    from app.models.clinical_baseline import ClinicalBaseline
    from app.models.medical_event import MedicalEvent


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    sex: Mapped[str] = mapped_column(String(20), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)

    baseline_items: Mapped[list["ClinicalBaseline"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    events: Mapped[list["MedicalEvent"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
