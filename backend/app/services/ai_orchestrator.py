import json
import uuid

from pydantic import ValidationError

from app.exceptions import AIResponseParsingError, PatientNotFoundError
from app.repositories.interfaces import IHealthRepository
from app.schemas.ai_contracts import AIStructuredResult, Routing
from app.services.openai_client import IOpenAIClient
from app.services.prompt_templates import (
    build_image_classification_prompt,
    build_text_classification_prompt,
)


class AIOrchestratorService:
    def __init__(self, ai_client: IOpenAIClient, repository: IHealthRepository):
        self._ai_client = ai_client
        self._repository = repository

    def process_voice(self, patient_id: uuid.UUID, audio_bytes: bytes, filename: str) -> dict:
        self._require_patient(patient_id)
        transcript = self._ai_client.transcribe_audio(audio_bytes, filename)
        context = self._repository.get_patient_context_summary(patient_id)
        raw = self._ai_client.classify_clinical_text(
            transcript, build_text_classification_prompt(context)
        )
        result = self._parse(raw)
        return self._persist(patient_id, result, original_notes=transcript)

    def process_document(self, patient_id: uuid.UUID, image_base64: str) -> dict:
        self._require_patient(patient_id)
        context = self._repository.get_patient_context_summary(patient_id)
        raw = self._ai_client.classify_clinical_image(
            image_base64, build_image_classification_prompt(context)
        )
        result = self._parse(raw)
        return self._persist(patient_id, result, original_notes=None)

    def _require_patient(self, patient_id: uuid.UUID) -> None:
        if self._repository.get_patient(patient_id) is None:
            raise PatientNotFoundError(f"Patient {patient_id} not found")

    def _parse(self, raw: str) -> AIStructuredResult:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise AIResponseParsingError(f"AI response is not valid JSON: {exc}") from exc
        try:
            return AIStructuredResult.model_validate(payload)
        except ValidationError as exc:
            raise AIResponseParsingError(f"AI response failed schema validation: {exc}") from exc

    def _persist(
        self, patient_id: uuid.UUID, result: AIStructuredResult, original_notes: str | None
    ) -> dict:
        if result.routing == Routing.BASELINE:
            assert result.baseline is not None
            item = self._repository.add_baseline_item(
                patient_id=patient_id,
                type=result.baseline.type,
                concept=result.baseline.concept,
                start_date=result.baseline.start_date,
                details=result.baseline.details,
            )
            return {
                "status": "success",
                "routing": Routing.BASELINE.value,
                "data": {
                    "type": item.type,
                    "concept": item.concept,
                    "start_date": item.start_date,
                    "details": item.details,
                },
            }

        assert result.event is not None
        event = self._repository.add_medical_event(
            patient_id=patient_id,
            title=result.event.title,
            date=result.event.date,
            type=result.event.type,
            clinical_summary=result.event.clinical_summary,
            original_notes=original_notes,
            severity=result.event.severity,
            doctor=result.event.doctor,
            medical_center=result.event.medical_center,
            department=result.event.department,
            red_flag=result.red_flag.active,
            alert_justification=result.red_flag.justification,
        )
        return {
            "status": "success",
            "routing": Routing.TIMELINE.value,
            "data": {
                "title": event.title,
                "date": event.date,
                "type": event.type,
                "clinical_summary": event.clinical_summary,
                "severity": event.severity,
                "red_flag": event.red_flag,
                "alert_justification": event.alert_justification,
            },
        }
