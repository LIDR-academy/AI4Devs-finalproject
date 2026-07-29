"use client";

import { useEffect, useState } from "react";
import { PatientCard } from "../../components/PatientCard";
import { patientApi } from "../../services/patientApi";
import type { Patient } from "../../types/patient";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("F");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setPatients(await patientApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await patientApi.create({
        name,
        birthDate: birthDate || null,
        sex: sex || null,
      });
      setName("");
      setBirthDate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear paciente");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <h1>Pacientes</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Nuevo paciente (sintético)</h3>
        <div className="row">
          <label>
            Nombre
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Fecha nacimiento
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
          <label>
            Sexo
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="F">F</option>
              <option value="M">M</option>
              <option value="X">X</option>
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Crear paciente"}
        </button>
      </form>

      <div className="patient-grid">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
        {patients.length === 0 && (
          <p className="muted">No hay pacientes todavía.</p>
        )}
      </div>
    </main>
  );
}
