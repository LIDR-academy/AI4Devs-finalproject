from app.services.llm_service import LLMService

NOTE = (
    "Paciente con cefalea, nausea y fotofobia. "
    "Se indica analgesia y control en 48 horas."
)


def test_rule_based_extractor_finds_events():
    events, source = LLMService().extract_events(NOTE)

    assert source == "rule-based"
    assert len(events) > 0
    categories = {event["category"] for event in events}
    assert "symptom" in categories
    for event in events:
        assert event["source_quote"]
        assert 0.0 <= event["confidence"] <= 1.0


def test_extract_events_endpoint_and_timeline(client):
    patient = client.post(
        "/patients", json={"name": "Flujo E2E", "birth_date": "1985-05-20", "sex": "M"}
    ).json()

    encounter = client.post(
        "/encounters",
        json={
            "patient_id": patient["id"],
            "date": "2026-06-12",
            "type": "consulta",
            "note_text": NOTE,
        },
    ).json()

    extracted = client.post(f"/encounters/{encounter['id']}/extract-events")
    assert extracted.status_code == 200
    events = extracted.json()
    assert len(events) > 0

    timeline = client.get(f"/patients/{patient['id']}/timeline")
    assert timeline.status_code == 200
    assert len(timeline.json()["events"]) >= len(events)
