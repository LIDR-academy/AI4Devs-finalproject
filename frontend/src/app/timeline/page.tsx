"use client";

import { useEffect, useState } from "react";
import { TimelineView } from "../../components/TimelineView";
import { patientApi } from "../../services/patientApi";
import { timelineApi } from "../../services/timelineApi";
import type { Patient } from "../../types/patient";
import type { ClinicalEvent } from "../../types/event";

export default function TimelinePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState("");
  const [events, setEvents] = useState<ClinicalEvent[]>([]);

  useEffect(() => {
    patientApi.list().then(setPatients).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selected) {
      setEvents([]);
      return;
    }
    timelineApi
      .getByPatientId(selected)
      .then((t) => setEvents(t.events))
      .catch(() => setEvents([]));
  }, [selected]);

  return (
    <main className="page">
      <h1>Timeline clínico</h1>
      <label>
        Paciente
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">— Selecciona —</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </label>
      <div className="timeline-wrap">
        {selected ? (
          <TimelineView events={events} />
        ) : (
          <p className="muted">Selecciona un paciente para ver su timeline.</p>
        )}
      </div>
    </main>
  );
}
