import type { ClinicalEvent } from "../types/event";
import { EventCard } from "./EventCard";

export function TimelineView({ events }: { events: ClinicalEvent[] }) {
  if (events.length === 0) {
    return <p className="muted">Sin eventos clínicos todavía.</p>;
  }

  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id} className="timeline-item">
          <span className="timeline-date">{event.eventDate ?? "s/f"}</span>
          <EventCard event={event} />
        </li>
      ))}
    </ol>
  );
}
