"""Builds the auditable clinical timeline for a patient.

Events come from PostgreSQL (source of truth for provenance); the assembled
longitudinal context is pulled from Statewave when available.
"""

from sqlalchemy.orm import Session

from app.models.clinical_event import ClinicalEvent
from app.repositories.event_repository import EventRepository
from app.services.statewave_service import StatewaveService


class TimelineService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)
        self.statewave = StatewaveService()

    def get_patient_timeline(self, patient_id: str) -> tuple[list[ClinicalEvent], str]:
        events = self.events.list_by_patient(patient_id)
        context = self.statewave.get_context(
            patient_id, task="Assemble the patient's clinical timeline context"
        )
        return events, context
