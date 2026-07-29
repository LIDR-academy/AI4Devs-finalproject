from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.clinical_event import ClinicalEvent


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def bulk_create(self, events: list[ClinicalEvent]) -> list[ClinicalEvent]:
        self.db.add_all(events)
        self.db.commit()
        for event in events:
            self.db.refresh(event)
        return events

    def list_by_encounter(self, encounter_id: str) -> list[ClinicalEvent]:
        stmt = select(ClinicalEvent).where(ClinicalEvent.encounter_id == encounter_id)
        return list(self.db.scalars(stmt))

    def list_by_patient(self, patient_id: str) -> list[ClinicalEvent]:
        stmt = (
            select(ClinicalEvent)
            .where(ClinicalEvent.patient_id == patient_id)
            .order_by(
                ClinicalEvent.event_date.is_(None),
                ClinicalEvent.event_date.asc(),
                ClinicalEvent.created_at.asc(),
            )
        )
        return list(self.db.scalars(stmt))
