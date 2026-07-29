"use client";

import { useState } from "react";
import { encounterApi } from "../services/encounterApi";
import type { Encounter } from "../types/encounter";

const SAMPLE_NOTE =
  "Paciente con cefalea, nausea y fotofobia. Se indica analgesia y control en 48 horas.";

export function EncounterForm({
  patientId,
  onCreated,
}: {
  patientId: string;
  onCreated?: (encounter: Encounter) => void;
}) {
  const [date, setDate] = useState("2026-06-12");
  const [type, setType] = useState("consulta");
  const [noteText, setNoteText] = useState(SAMPLE_NOTE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const encounter = await encounterApi.create({
        patientId,
        date,
        type,
        noteText,
      });
      onCreated?.(encounter);
      setNoteText(SAMPLE_NOTE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear encuentro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>Nuevo encuentro</h3>
      <div className="row">
        <label>
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Tipo
          <input value={type} onChange={(e) => setType(e.target.value)} />
        </label>
      </div>
      <label>
        Nota clínica
        <textarea
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? "Guardando…" : "Registrar encuentro"}
      </button>
    </form>
  );
}
