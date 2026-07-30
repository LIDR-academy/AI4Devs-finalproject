from datetime import date

from app.models.medical_event import MedicalEvent


def test_create_and_get_patient(repository):
    patient = repository.create_patient(
        full_name="Ana García", sex="Mujer", date_of_birth=date(1985, 5, 20)
    )

    fetched = repository.get_patient(patient.id)

    assert fetched is not None
    assert fetched.full_name == "Ana García"
    assert fetched.sex == "Mujer"


def test_get_unknown_patient_returns_none(repository):
    import uuid

    assert repository.get_patient(uuid.uuid4()) is None


def test_cascade_delete_removes_baseline_and_events(repository, db_session):
    patient = repository.create_patient(
        full_name="Paciente Cascade", sex="Otro", date_of_birth=date(1970, 1, 1)
    )
    repository.add_baseline_item(
        patient_id=patient.id,
        type="Condición Crónica",
        concept="Talasemia Minor",
        start_date="Infancia",
        details=None,
    )
    repository.add_medical_event(
        patient_id=patient.id,
        title="Cirugía",
        date="2010",
        type="Cirugía",
        clinical_summary="Mastoidectomía.",
        original_notes=None,
        severity="Alta",
        doctor=None,
        medical_center=None,
        department=None,
    )

    db_session.delete(patient)
    db_session.commit()

    assert repository.get_baseline(patient.id) == []
    assert repository.get_events(patient.id) == []
    assert db_session.query(MedicalEvent).count() == 0
