import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.clinical_baseline import ClinicalBaseline
from app.models.medical_event import MedicalEvent
from app.models.patient import Patient
from app.repositories.interfaces import IHealthRepository


class SQLAlchemyHealthRepository(IHealthRepository):
    def __init__(self, db: Session):
        self.db = db

    def create_patient(
        self, full_name: str, sex: str, date_of_birth: date, email: str | None = None
    ) -> Patient:
        patient = Patient(full_name=full_name, sex=sex, date_of_birth=date_of_birth, email=email)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def get_patient(self, patient_id: uuid.UUID) -> Patient | None:
        return self.db.get(Patient, patient_id)

    def add_baseline_item(
        self,
        patient_id: uuid.UUID,
        type: str,
        concept: str,
        start_date: str | None,
        details: str | None,
    ) -> ClinicalBaseline:
        item = ClinicalBaseline(
            patient_id=patient_id,
            type=type,
            concept=concept,
            start_date=start_date,
            details=details,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def add_medical_event(
        self,
        patient_id: uuid.UUID,
        title: str,
        date: str,
        type: str,
        clinical_summary: str,
        original_notes: str | None,
        severity: str,
        doctor: str | None,
        medical_center: str | None,
        department: str | None,
        red_flag: bool = False,
        alert_justification: str | None = None,
    ) -> MedicalEvent:
        event = MedicalEvent(
            patient_id=patient_id,
            title=title,
            date=date,
            type=type,
            clinical_summary=clinical_summary,
            original_notes=original_notes,
            severity=severity,
            doctor=doctor,
            medical_center=medical_center,
            department=department,
            red_flag=red_flag,
            alert_justification=alert_justification,
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_baseline(self, patient_id: uuid.UUID) -> list[ClinicalBaseline]:
        stmt = select(ClinicalBaseline).where(ClinicalBaseline.patient_id == patient_id)
        return list(self.db.scalars(stmt).all())

    def get_events(self, patient_id: uuid.UUID) -> list[MedicalEvent]:
        stmt = (
            select(MedicalEvent)
            .where(MedicalEvent.patient_id == patient_id)
            .order_by(MedicalEvent.date.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_patient_context_summary(self, patient_id: uuid.UUID) -> str:
        baseline = self.get_baseline(patient_id)
        events = self.get_events(patient_id)

        if not baseline and not events:
            return "El paciente no tiene antecedentes registrados todavía."

        lines: list[str] = []
        if baseline:
            lines.append("Perfil crónico (baseline):")
            for item in baseline:
                lines.append(f"- [{item.type}] {item.concept} ({item.details or 'sin detalles'})")
        if events:
            lines.append("Historial cronológico de episodios (timeline):")
            for event in events:
                lines.append(
                    f"- {event.date} [{event.type}] {event.title}: {event.clinical_summary}"
                )
        return "\n".join(lines)
