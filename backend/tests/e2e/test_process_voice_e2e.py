import io
import os
from pathlib import Path

import pytest

from app.core.deps import get_openai_client
from app.main import app
from app.services.openai_client import OpenAIClientWrapper

FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "sample_audio.wav"

pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY not set — skipping real Whisper/GPT-4o-mini call",
)


def test_process_voice_real_whisper_and_classification(client):
    def override_real_openai_client():
        return OpenAIClientWrapper(api_key=os.environ["OPENAI_API_KEY"])

    app.dependency_overrides[get_openai_client] = override_real_openai_client

    patient_response = client.post(
        "/api/v1/patients",
        json={"full_name": "Paciente E2E", "sex": "Hombre", "date_of_birth": "1990-01-01"},
    )
    patient_id = patient_response.json()["id"]

    with open(FIXTURE_PATH, "rb") as audio_file:
        files = {"file": ("sample_audio.wav", io.BytesIO(audio_file.read()), "audio/wav")}
        response = client.post(f"/api/v1/patients/{patient_id}/process-voice", files=files)

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "success"
    assert body["routing"] in ("BASELINE", "TIMELINE")

    passport = client.get(f"/api/v1/patients/{patient_id}/passport")
    assert passport.status_code == 200
    passport_body = passport.json()
    assert len(passport_body["baseline"]) + len(passport_body["timeline"]) == 1
