import type { ClinicalEvent } from "../types/event";

const CATEGORY_LABELS: Record<string, string> = {
  diagnosis: "Diagnóstico",
  medication: "Medicación",
  lab: "Laboratorio",
  procedure: "Procedimiento",
  symptom: "Síntoma",
  allergy: "Alergia",
  other: "Otro",
};

export function EventCard({ event }: { event: ClinicalEvent }) {
  return (
    <article className="event-card">
      <div className="event-head">
        <span className={`badge badge-${event.category}`}>
          {CATEGORY_LABELS[event.category] ?? event.category}
        </span>
        <span className="muted">
          {(event.confidence * 100).toFixed(0)}% · {event.extractionSource}
        </span>
      </div>
      <h4>{event.title}</h4>
      {event.description && <p>{event.description}</p>}
      {event.sourceQuote && (
        <blockquote className="source-quote">“{event.sourceQuote}”</blockquote>
      )}
    </article>
  );
}
