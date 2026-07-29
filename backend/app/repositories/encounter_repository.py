from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.encounter import Encounter


class EncounterRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **data) -> Encounter:
        encounter = Encounter(**data)
        self.db.add(encounter)
        self.db.commit()
        self.db.refresh(encounter)
        return encounter

    def get(self, encounter_id: str) -> Encounter | None:
        return self.db.get(Encounter, encounter_id)

    def list_by_patient(self, patient_id: str) -> list[Encounter]:
        stmt = (
            select(Encounter)
            .where(Encounter.patient_id == patient_id)
            .order_by(Encounter.date.asc())
        )
        return list(self.db.scalars(stmt))
