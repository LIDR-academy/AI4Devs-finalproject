from datetime import date


def _make_patient(repository):
    return repository.create_patient(
        full_name="Paciente Timeline", sex="Hombre", date_of_birth=date(1980, 1, 1)
    )


def test_get_events_ordered_reverse_chronologically(repository):
    patient = _make_patient(repository)
    repository.add_medical_event(
        patient_id=patient.id,
        title="Evento antiguo",
        date="2010-01-01",
        type="Cirugía",
        clinical_summary="Resumen antiguo.",
        original_notes=None,
        severity="Alta",
        doctor=None,
        medical_center=None,
        department=None,
    )
    repository.add_medical_event(
        patient_id=patient.id,
        title="Evento reciente",
        date="2026-06-10",
        type="Urgencias",
        clinical_summary="Resumen reciente.",
        original_notes=None,
        severity="Alta",
        doctor=None,
        medical_center=None,
        department=None,
    )

    events = repository.get_events(patient.id)

    assert [event.title for event in events] == ["Evento reciente", "Evento antiguo"]


def test_get_patient_context_summary_empty(repository):
    patient = _make_patient(repository)

    summary = repository.get_patient_context_summary(patient.id)

    assert "no tiene antecedentes" in summary


def test_get_patient_context_summary_includes_baseline_and_events(repository):
    patient = _make_patient(repository)
    repository.add_baseline_item(
        patient_id=patient.id,
        type="Condición Crónica",
        concept="Talasemia Minor",
        start_date="Infancia",
        details=None,
    )
    repository.add_medical_event(
        patient_id=patient.id,
        title="Mastoidectomía por Colesteatoma",
        date="2010",
        type="Cirugía",
        clinical_summary="Intervención por colesteatoma izquierdo.",
        original_notes=None,
        severity="Alta",
        doctor=None,
        medical_center=None,
        department=None,
    )

    summary = repository.get_patient_context_summary(patient.id)

    assert "Talasemia Minor" in summary
    assert "Colesteatoma" in summary
