import type { ActiveSession, RobotAction } from "../types/dashboard";

type Props = {
  session: ActiveSession | null;
  lastAction?: RobotAction;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
};

export function StatusPanel({ session, lastAction }: Props) {
  if (!session) {
    return null;
  }

  const mode = lastAction?.execution?.dryRun
    ? `${lastAction.execution.profile ?? "simulation"} · dry-run`
    : lastAction?.mode ?? "simulation";

  return (
    <section className="panel panel-span-2">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sesion activa</p>
          <h2>{session.code}</h2>
        </div>
        <span className={`status-badge status-${session.status.toLowerCase()}`}>{session.status}</span>
      </div>

      <div className="status-grid">
        <div>
          <span className="metric-label">Camion</span>
          <strong>{session.truckCode}</strong>
        </div>
        <div>
          <span className="metric-label">Modo</span>
          <strong>{mode}</strong>
        </div>
        <div>
          <span className="metric-label">Inicio</span>
          <strong>{formatDate(session.startedAt)}</strong>
        </div>
        <div>
          <span className="metric-label">Ultima accion</span>
          <strong>{lastAction?.code ?? "Sin acciones"}</strong>
        </div>
      </div>
    </section>
  );
}
