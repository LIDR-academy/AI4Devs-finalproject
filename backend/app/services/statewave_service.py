"""Client for the Statewave contextual-memory layer.

Statewave is used as the longitudinal memory + provenance layer of AuditCare:
every clinical encounter is ingested as an *episode*, memories are *compiled*
per patient (subject), and prior context can be *assembled* to enrich future
AI extractions. See https://www.statewave.ai/developers and the v1 API contract.

The service degrades gracefully: if Statewave is unreachable the calls return
``None``/empty and log a warning, so the core MVP flow keeps working offline.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class StatewaveService:
    def __init__(self) -> None:
        self.base_url = settings.statewave_url.rstrip("/")
        self.timeout = settings.statewave_timeout_seconds

    # -- internals ---------------------------------------------------------
    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if settings.statewave_api_key:
            headers["X-API-Key"] = settings.statewave_api_key
        if settings.statewave_tenant_id:
            headers["X-Tenant-ID"] = settings.statewave_tenant_id
        return headers

    def subject_id(self, patient_id: str) -> str:
        return f"{settings.statewave_subject_prefix}:{patient_id}"

    def _post(self, path: str, payload: dict) -> dict | None:
        url = f"{self.base_url}{path}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload, headers=self._headers())
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Statewave call to %s failed: %s", path, exc)
            return None

    # -- public API --------------------------------------------------------
    def ingest_encounter(
        self, patient_id: str, encounter_id: str, note_text: str, metadata: dict
    ) -> dict | None:
        """Record a clinical encounter as an append-only episode."""
        payload = {
            "subject_id": self.subject_id(patient_id),
            "source": "auditcare",
            "type": "clinical_encounter",
            # Statewave surfaces `payload.text` when assembling context, so the
            # clinical note is stored there (plus encounter_id for provenance).
            "payload": {"encounter_id": encounter_id, "text": note_text},
            "metadata": metadata,
        }
        return self._post(settings.statewave_episode_path, payload)

    def compile_patient(self, patient_id: str) -> dict | None:
        """Distil episodes into durable memories for a patient."""
        payload = {"subject_id": self.subject_id(patient_id)}
        return self._post(settings.statewave_compile_path, payload)

    def get_context(self, patient_id: str, task: str) -> str:
        """Assemble a ranked, token-bounded longitudinal context bundle."""
        payload = {
            "subject_id": self.subject_id(patient_id),
            "task": task,
            "max_tokens": settings.statewave_context_max_tokens,
        }
        data = self._post(settings.statewave_context_path, payload)
        if not data:
            return ""
        return data.get("assembled_context", "") or ""
