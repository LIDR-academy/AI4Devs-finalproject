import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ClinicalEvent(Base):
    __tablename__ = "clinical_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    encounter_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("encounters.id", ondelete="CASCADE"), nullable=False
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(32), nullable=False, default="other")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Provenance / trazabilidad
    source_quote: Mapped[str] = mapped_column(Text, nullable=False, default="")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    # Origin of the extraction (e.g. "llm", "rule-based") for auditability.
    extraction_source: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    encounter: Mapped["Encounter"] = relationship(back_populates="events")  # noqa: F821
    patient: Mapped["Patient"] = relationship(back_populates="events")  # noqa: F821
