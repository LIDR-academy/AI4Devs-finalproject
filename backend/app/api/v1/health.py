import base64
import binascii
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.deps import get_ai_orchestrator, get_repository
from app.exceptions import AIProviderError, AIResponseParsingError, PatientNotFoundError
from app.repositories.interfaces import IHealthRepository
from app.schemas.clinical_baseline import ClinicalBaselineRead
from app.schemas.medical_event import MedicalEventRead
from app.schemas.passport import PassportResponse
from app.services.ai_orchestrator import AIOrchestratorService

router = APIRouter(prefix="/patients/{patient_id}", tags=["health"])


class DocumentPayload(BaseModel):
    image_base64: str


def _handle_orchestrator_errors(exc: PatientNotFoundError | AIProviderError | AIResponseParsingError):
    if isinstance(exc, PatientNotFoundError):
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/process-voice", status_code=201)
async def process_voice(
    patient_id: uuid.UUID,
    file: UploadFile,
    orchestrator: AIOrchestratorService = Depends(get_ai_orchestrator),
) -> dict:
    audio_bytes = await file.read()
    try:
        return orchestrator.process_voice(patient_id, audio_bytes, file.filename or "audio.wav")
    except (PatientNotFoundError, AIProviderError, AIResponseParsingError) as exc:
        _handle_orchestrator_errors(exc)


@router.post("/process-document", status_code=201)
def process_document(
    patient_id: uuid.UUID,
    payload: DocumentPayload,
    orchestrator: AIOrchestratorService = Depends(get_ai_orchestrator),
) -> dict:
    try:
        base64.b64decode(payload.image_base64, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise HTTPException(status_code=422, detail="image_base64 is not valid base64") from exc

    try:
        return orchestrator.process_document(patient_id, payload.image_base64)
    except (PatientNotFoundError, AIProviderError, AIResponseParsingError) as exc:
        _handle_orchestrator_errors(exc)


@router.get("/passport", response_model=PassportResponse)
def get_passport(
    patient_id: uuid.UUID,
    repository: IHealthRepository = Depends(get_repository),
) -> PassportResponse:
    patient = repository.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    baseline = repository.get_baseline(patient_id)
    events = repository.get_events(patient_id)
    return PassportResponse(
        patient_id=patient_id,
        baseline=[ClinicalBaselineRead.model_validate(item) for item in baseline],
        timeline=[MedicalEventRead.model_validate(event) for event in events],
    )
