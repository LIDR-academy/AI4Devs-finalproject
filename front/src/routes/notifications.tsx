import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  clearNotificationEvents,
  evaluateExpiringNotifications,
  listNotificationEvents,
  type NotificationEvent,
} from "@/features/notifications/notifications.api";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireAuthBeforeLoad,
  component: NotificationsPage,
});

function NotificationsPage() {
  const authed = useRequireAuthRedirect();
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshEvents() {
    setLoading(true);
    setError(null);
    try {
      const result = await listNotificationEvents();
      setEvents(result.events);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshEvents();
  }, []);

  async function runEvaluation() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const result = await evaluateExpiringNotifications();
      setMessage(
        `Generated ${result.generated} events. Suppressed: preference=${result.suppressedByPreference}, duplicate=${result.suppressedByDuplicate}.`,
      );
      await refreshEvents();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not evaluate notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function clearEvents() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await clearNotificationEvents();
      setEvents([]);
      setMessage("Notification events cleared.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not clear events.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return null;
  }

  return (
    <AppShell title="Notifications">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          data-testid="run-notification-evaluation"
          className="rounded-xl bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            void runEvaluation();
          }}
        >
          Evaluate now
        </button>
        <button
          type="button"
          data-testid="clear-notification-events"
          className="rounded-xl border border-border px-3 py-2 text-[13px] font-semibold disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            void clearEvents();
          }}
        >
          Clear
        </button>
      </div>

      {message && (
        <p data-testid="notification-eval-message" className="mb-3 text-[12px] text-success">
          {message}
        </p>
      )}
      {error && (
        <p data-testid="notification-eval-error" className="mb-3 text-[12px] text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[13px] text-muted-foreground">Loading notifications...</p>
      ) : events.length === 0 ? (
        <p data-testid="notification-events-empty" className="text-[13px] text-muted-foreground">
          No notification events yet.
        </p>
      ) : (
        <ul data-testid="notification-events-list" className="space-y-2">
          {events.map((event) => (
            <li
              key={`${event.pantryItemId}-${event.emittedAt}`}
              data-testid="notification-event-item"
              className="rounded-xl border border-border bg-secondary/30 p-3"
            >
              <p className="text-[13px] font-semibold">{event.itemName}</p>
              <p className="text-[12px] text-muted-foreground">
                Expires in {event.daysUntilExpiration} days ({new Date(event.expirationDate).toLocaleDateString()})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Event: {event.type} at {new Date(event.emittedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
