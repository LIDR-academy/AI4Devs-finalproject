import type { OperationalDashboard } from "../types/dashboard";

type Props = {
  dashboard: OperationalDashboard;
};

const value = (input: string | number | null | undefined) => input ?? "-";

export function ExecutionPanel({ dashboard }: Props) {
  const action = dashboard.lastActions[0];
  const trace = action?.execution;
  const cube = dashboard.selectedCube ?? trace?.selectedCube;
  const profile = dashboard.profile ?? trace?.profile;
  const dryRun = dashboard.dryRun ?? trace?.dryRun;
  const visionSource = dashboard.visionSource ?? trace?.visionSource;
  const dropZone = dashboard.dropZoneCode ?? trace?.dropZoneCode;
  const lastError = dashboard.lastError;

  return (
    <section className="panel panel-span-3">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Trazabilidad Edge</p>
          <h2>Ultimo plan operacional</h2>
        </div>
        <span className={`status-badge status-${action?.status.toLowerCase() ?? "planned"}`}>
          {action?.status ?? "SIN ACCION"}
        </span>
      </div>
      <div className="trace-grid">
        <div><span className="metric-label">Perfil</span><strong>{value(profile)}</strong></div>
        <div><span className="metric-label">Fuente vision</span><strong>{value(visionSource)}</strong></div>
        <div><span className="metric-label">Ejecucion</span><strong>{dryRun ? "Dry-run (sin movimiento)" : action?.mode ?? "-"}</strong></div>
        <div><span className="metric-label">Cubo seleccionado</span><strong>{cube ? `${cube.color} · (${value(cube.x)}, ${value(cube.y)})` : "-"}</strong></div>
        <div><span className="metric-label">Drop zone planificada</span><strong>{value(dropZone)}</strong></div>
        <div className={lastError ? "trace-error" : ""}>
          <span className="metric-label">Ultimo error</span>
          <strong>{lastError ? `${value(lastError.code)}: ${value(lastError.message)}` : "Sin errores reportados"}</strong>
        </div>
      </div>
      {action?.mode === "hardware" && (
        <p className="trace-note">Modo hardware reportado por Edge; el dashboard no confirma movimiento fisico.</p>
      )}
    </section>
  );
}
