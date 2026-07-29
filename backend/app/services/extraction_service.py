"""Orchestrates the AI extraction flow for a clinical encounter.

Flow (matches README section 1.3):
  1. Pull longitudinal context for the patient from Statewave.
  2. Extract structured clinical events from the note (LLM or fallback).
  3. Persist events with provenance.
  4. Ingest the encounter as a Statewave episode and (re)compile memories.
  5. Record an audit-log entry.
"""

import logging
from datetime import date, datetime

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.clinical_event import ClinicalEvent
from app.models.encounter import Encounter
from app.repositories.event_repository import EventRepository
from app.services.llm_service import LLMService
from app.services.statewave_service import StatewaveService

logger = logging.getLogger(__name__)


def _parse_date(value) -> date | None:
    if value is None or value == "":
        return None
    if isinstance(value, date):
        return value
    try:
        return datetime.fromisoformat(str(value)).date()
    except ValueError:
        return None


class ExtractionService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)
        self.llm = LLMService()
        self.statewave = StatewaveService()

    def extract_for_encounter(self, encounter: Encounter) -> list[ClinicalEvent]:
        # 1. Longitudinal context from Statewave (empty if unreachable).
        context = self.statewave.get_context(
            encounter.patient_id,
            task="Extract clinical events for this encounter",
        )

        # 2. Extract events.
        raw_events, source = self.llm.extract_events(encounter.note_text, context)

        # 3. Persist with provenance.
        models = [
            ClinicalEvent(
                encounter_id=encounter.id,
                patient_id=encounter.patient_id,
                category=item["category"],
                title=item["title"],
                description=item.get("description", ""),
                event_date=_parse_date(item.get("event_date")) or encounter.date,
                source_quote=item.get("source_quote", ""),
                confidence=item.get("confidence", 0.0),
                extraction_source=source,
            )
            for item in raw_events
        ]
        if models:
            self.events.bulk_create(models)

        # 4. Feed Statewave: ingest episode + recompile patient memories.
        self.statewave.ingest_encounter(
            patient_id=encounter.patient_id,
            encounter_id=encounter.id,
            note_text=encounter.note_text,
            metadata={
                "type": encounter.type,
                "date": encounter.date.isoformat() if encounter.date else None,
                "events_extracted": len(models),
                "extraction_source": source,
            },
        )
        self.statewave.compile_patient(encounter.patient_id)

        # 5. Audit trail.
        self.db.add(
            AuditLog(
                entity_type="encounter",
                entity_id=encounter.id,
                action="extract_events",
                actor="system",
                details={"count": len(models), "extraction_source": source},
            )
        )
        self.db.commit()

        return models
