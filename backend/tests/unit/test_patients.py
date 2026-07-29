def test_create_and_list_patient(client):
    payload = {"name": "Paciente Test", "birth_date": "1990-01-01", "sex": "F"}
    response = client.post("/patients", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["name"] == "Paciente Test"

    listed = client.get("/patients")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_create_encounter_requires_existing_patient(client):
    response = client.post(
        "/encounters",
        json={"patient_id": "does-not-exist", "date": "2026-06-12", "note_text": "x"},
    )
    assert response.status_code == 404
