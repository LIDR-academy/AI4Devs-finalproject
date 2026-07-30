import uuid
from abc import ABC, abstractmethod
from datetime import date

from app.models.clinical_baseline import ClinicalBaseline
from app.models.medical_event import MedicalEvent
from app.models.patient import Patient


class IHealthRepository(ABC):
    """Repository port isolating persistence from the API/service layer.

    A single SQLAlchemy-backed implementation satisfies this against either
    Postgres (dev/prod) or an in-memory SQLite DB (tests), per the project's
    documented storage-agnosticism goal.
    """

    @abstractmethod
    def create_patient(
        self, full_name: str, sex: str, date_of_birth: date, email: str | None = None
    ) -> Patient: ...

    @abstractmethod
    def get_patient(self, patient_id: uuid.UUID) -> Patient | None: ...

    @abstractmethod
    def add_baseline_item(
        self,
        patient_id: uuid.UUID,
        type: str,
        concept: str,
        start_date: str | None,
        details: str | None,
    ) -> ClinicalBaseline: ...

    @abstractmethod
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
    ) -> MedicalEvent: ...

    @abstractmethod
    def get_baseline(self, patient_id: uuid.UUID) -> list[ClinicalBaseline]: ...

    @abstractmethod
    def get_events(self, patient_id: uuid.UUID) -> list[MedicalEvent]: ...

    @abstractmethod
    def get_patient_context_summary(self, patient_id: uuid.UUID) -> str:
        """A compact textual summary of the patient's history, fed to the LLM
        as context so it can cross-reference new symptoms against past
        conditions and raise red flags (US-05)."""
        ...
