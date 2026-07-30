import json
import uuid

import pytest

from app.exceptions import AIProviderError, AIResponseParsingError, PatientNotFoundError
from app.services.ai_orchestrator import AIOrchestratorService


@pytest.fixture()
def patient_id(repository):
    from datetime import date

    patient = repository.create_patient(
        full_name="Paciente de Prueba", sex="Hombre", date_of_birth=date(1990, 1, 1)
    )
    return patient.id


@pytest.fixture()
def orchestrator(fake_openai_client, repository):
    return AIOrchestratorService(ai_client=fake_openai_client, repository=repository)


def test_process_voice_persists_timeline_event(orchestrator, patient_id, repository):
    result = orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")

    assert result["status"] == "success"
    assert result["routing"] == "TIMELINE"
    events = repository.get_events(patient_id)
    assert len(events) == 1
    assert events[0].title == "Evento de prueba"
    assert events[0].original_notes == "Transcripción de prueba."


def test_process_voice_persists_baseline_item(orchestrator, patient_id, repository, fake_openai_client):
    fake_openai_client.classification_response = json.dumps(
        {
            "routing": "BASELINE",
            "baseline": {
                "type": "Tratamiento Prolongado",
                "concept": "Lansoprazol 20mg",
                "start_date": "Hace varios años",
                "details": "Uso continuo diario",
            },
            "event": None,
            "red_flag": {"active": False, "justification": None},
        }
    )

    result = orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")

    assert result["routing"] == "BASELINE"
    baseline = repository.get_baseline(patient_id)
    assert len(baseline) == 1
    assert baseline[0].concept == "Lansoprazol 20mg"


def test_process_voice_persists_red_flag(orchestrator, patient_id, repository, fake_openai_client):
    fake_openai_client.classification_response = json.dumps(
        {
            "routing": "TIMELINE",
            "baseline": None,
            "event": {
                "title": "Cefalea Aguda",
                "date": "2026-06-10",
                "type": "Urgencias",
                "clinical_summary": "Cefalea intensa y fiebre.",
                "severity": "Alta",
                "doctor": "Dr. Torres",
                "medical_center": "Hospital Reina Sofía",
                "department": "Urgencias",
            },
            "red_flag": {
                "active": True,
                "justification": "Antecedente de colesteatoma requiere descartar meningitis.",
            },
        }
    )

    orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")

    events = repository.get_events(patient_id)
    assert events[0].red_flag is True
    assert "meningitis" in events[0].alert_justification


def test_process_voice_ignores_irrelevant_content(orchestrator, patient_id, repository, fake_openai_client):
    fake_openai_client.classification_response = json.dumps(
        {
            "routing": "IRRELEVANT",
            "baseline": None,
            "event": None,
            "red_flag": {"active": False, "justification": None},
        }
    )

    result = orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")

    assert result["status"] == "ignored"
    assert result["routing"] == "IRRELEVANT"
    assert repository.get_baseline(patient_id) == []
    assert repository.get_events(patient_id) == []


def test_malformed_json_raises_parsing_error(orchestrator, patient_id, fake_openai_client):
    fake_openai_client.classification_response = "this is not json"

    with pytest.raises(AIResponseParsingError):
        orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")


def test_incomplete_schema_raises_parsing_error(orchestrator, patient_id, fake_openai_client):
    # routing=TIMELINE but no `event` payload — violates the AIStructuredResult contract
    fake_openai_client.classification_response = json.dumps(
        {"routing": "TIMELINE", "baseline": None, "event": None, "red_flag": {"active": False}}
    )

    with pytest.raises(AIResponseParsingError):
        orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")


def test_network_error_propagates_as_ai_provider_error(orchestrator, patient_id, fake_openai_client):
    fake_openai_client.raise_error = AIProviderError("simulated network failure")

    with pytest.raises(AIProviderError):
        orchestrator.process_voice(patient_id, b"fake-audio-bytes", "note.wav")


def test_unknown_patient_raises_patient_not_found(orchestrator):
    with pytest.raises(PatientNotFoundError):
        orchestrator.process_voice(uuid.uuid4(), b"fake-audio-bytes", "note.wav")


def test_process_document_uses_vision_path(orchestrator, patient_id, repository):
    result = orchestrator.process_document(patient_id, "ZmFrZS1pbWFnZS1ieXRlcw==")

    assert result["status"] == "success"
    events = repository.get_events(patient_id)
    assert len(events) == 1
    assert events[0].original_notes is None
