import Link from "next/link";
import type { Patient } from "../types/patient";

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link href={`/patients/${patient.id}`} className="patient-card">
      <h3>{patient.name}</h3>
      <p className="muted">
        {patient.sex ?? "—"} · {patient.birthDate ?? "sin fecha"}
      </p>
      <span className="link-hint">Ver timeline →</span>
    </Link>
  );
}
