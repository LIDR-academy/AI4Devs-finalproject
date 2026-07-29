"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EncounterForm } from "../../../components/EncounterForm";
import { TimelineView } from "../../../components/TimelineView";
import { patientApi } from "../../../services/patientApi";
import { encounterApi } from "../../../services/encounterApi";
import { timelineApi } from "../../../services/timelineApi";
import type { Patient } from "../../../types/patient";
import type { ClinicalEvent } from "../../../types/event";
import type { Encounter } from "../../../types/encounter";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [events, setEvents] = useState<ClinicalEvent[]>([]);
  const [lastEncounter, setLastEncounter] = useState<Encounter | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    const timeline = await timelineApi.getByPatientId(patientId);
    setEvents(timeline.events);
  }, [patientId]);

  useEffect(() => {
    patientApi
      .list()
      .then((list) => setPatient(list.find((p) => p.id === patientId) ?? null))
      .catch(() => undefined);
    loadTimeline().catch((err) => setError(String(err)));
  }, [patientId, loadTimeline]);

  async function handleExtract(encounterId: string) {
    setError(null);
    setStatus("Extrayendo eventos con IA…");
    try {
      const extracted = await encounterApi.extractEvents(encounterId);
      setStatus(`${extracted.length} eventos extraídos.`);
      await loadTimeline();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al extraer eventos");
      setStatus(null);
    }
  }

  return (
    <main className="page">
      <Link href="/patients" className="back">
        ← Pacientes
      </Link>
      <h1>{patient?.name ?? "Paciente"}</h1>
      <p className="muted">ID: {patientId}</p>

      <div className="grid-2">
        <section>
          <EncounterForm
            patientId={patientId}
            onCreated={(encounter) => {
              setLastEncounter(encounter);
              setStatus("Encuentro creado. Ya puedes extraer eventos.");
            }}
          />
          {lastEncounter && (
            <button
              className="primary"
              onClick={() => handleExtract(lastEncounter.id)}
            >
              Extraer eventos del último encuentro (IA)
            </button>
          )}
          {status && <p className="status">{status}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <section>
          <h2>Timeline clínico</h2>
          <TimelineView events={events} />
        </section>
      </div>
    </main>
  );
}
