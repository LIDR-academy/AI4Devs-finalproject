"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { patientApi } from "../../services/patientApi";
import type { Patient } from "../../types/patient";

export default function EncountersPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    patientApi.list().then(setPatients).catch(() => undefined);
  }, []);

  return (
    <main className="page">
      <h1>Encuentros clínicos</h1>
      <p className="muted">
        Selecciona un paciente para registrar un encuentro y extraer eventos con
        IA.
      </p>
      <div className="patient-grid">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="patient-card"
          >
            <h3>{patient.name}</h3>
            <span className="link-hint">Registrar encuentro →</span>
          </Link>
        ))}
        {patients.length === 0 && (
          <p className="muted">
            No hay pacientes. Crea uno en la sección Pacientes.
          </p>
        )}
      </div>
    </main>
  );
}
