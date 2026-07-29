import io


def _create_patient(client) -> str:
    response = client.post(
        "/api/v1/patients",
        json={"full_name": "Nacho Álvarez", "sex": "Hombre", "date_of_birth": "1990-01-01"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_create_patient(client):
    response = client.post(
        "/api/v1/patients",
        json={"full_name": "Nacho Álvarez", "sex": "Hombre", "date_of_birth": "1990-01-01"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["full_name"] == "Nacho Álvarez"
    assert body["email"] is None


def test_get_patient_by_id(client):
    patient_id = _create_patient(client)

    response = client.get(f"/api/v1/patients/{patient_id}")

    assert response.status_code == 200
    assert response.json()["id"] == patient_id


def test_get_unknown_patient_returns_404(client):
    import uuid

    response = client.get(f"/api/v1/patients/{uuid.uuid4()}")

    assert response.status_code == 404


def test_process_voice_then_passport_reflects_it(client):
    patient_id = _create_patient(client)

    files = {"file": ("note.wav", io.BytesIO(b"fake-audio-bytes"), "audio/wav")}
    voice_response = client.post(f"/api/v1/patients/{patient_id}/process-voice", files=files)
    assert voice_response.status_code == 201
    assert voice_response.json()["routing"] == "TIMELINE"

    passport_response = client.get(f"/api/v1/patients/{patient_id}/passport")
    assert passport_response.status_code == 200
    body = passport_response.json()
    assert body["patient_id"] == patient_id
    assert len(body["timeline"]) == 1


def test_process_document(client):
    patient_id = _create_patient(client)

    response = client.post(
        f"/api/v1/patients/{patient_id}/process-document",
        json={"image_base64": "ZmFrZS1pbWFnZS1ieXRlcw=="},
    )

    assert response.status_code == 201


def test_process_document_rejects_invalid_base64(client):
    patient_id = _create_patient(client)

    response = client.post(
        f"/api/v1/patients/{patient_id}/process-document",
        json={"image_base64": "not-valid-base64!!"},
    )

    assert response.status_code == 422


def test_passport_for_unknown_patient_returns_404(client):
    import uuid

    response = client.get(f"/api/v1/patients/{uuid.uuid4()}/passport")

    assert response.status_code == 404
