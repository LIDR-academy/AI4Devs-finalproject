import type { OperationalDashboard } from "../types/dashboard";

type Props = {
  dashboard: OperationalDashboard;
};

const value = (input: string | number | null | undefined) => input ?? "-";
const coordinate = (input: number | null | undefined) => (typeof input === "number" ? input.toFixed(1) : "-");

export function ExecutionPanel({ dashboard }: Props) {
  const action = dashboard.lastActions[0];
  const trace = action?.execution;
  const cube = dashboard.selectedCube ?? trace?.selectedCube;
  const center = trace?.selectedCubeCenter;
  const bbox = trace?.selectedCubeBoundingBox ?? cube;
  const profile = dashboard.profile ?? trace?.profile;
  const dryRun = dashboard.dryRun ?? trace?.dryRun;
  const visionSource = dashboard.visionSource ?? trace?.visionSource;
  const dropZone = dashboard.dropZoneCode ?? trace?.dropZoneCode;
  const lastError =
    dashboard.lastError ??
    (action?.status === "ERROR"
      ? { code: trace?.errorCode ?? "ERROR", message: trace?.errorMessage ?? "Plan no generado" }
      : null);
  const planStatus = action ? action.status : "SIN PLAN";
  const sequenceCount = trace?.sequencePreview?.length ?? 0;

  return (
    <section className="panel panel-span-3">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Trazabilidad Edge</p>
          <h2>Ultimo plan operacional</h2>
        </div>
        <span className={`status-badge status-${action?.status.toLowerCase() ?? "planned"}`}>
          {planStatus}
        </span>
      </div>
      <div className="trace-grid">
        <div><span className="metric-label">Perfil</span><strong>{value(profile)}</strong></div>
        <div><span className="metric-label">Fuente vision</span><strong>{value(visionSource)}</strong></div>
        <div><span className="metric-label">Ejecucion</span><strong>{dryRun ? "Dry-run (sin movimiento)" : action?.mode ?? "-"}</strong></div>
        <div><span className="metric-label">Firma snapshot</span><strong>{value(trace?.snapshotSignature)}</strong></div>
        <div><span className="metric-label">Cubo seleccionado</span><strong>{cube ? `${cube.color} - (${value(cube.x)}, ${value(cube.y)})` : "Sin plan dry-run generado"}</strong></div>
        <div><span className="metric-label">Centro cubo</span><strong>{center ? `${coordinate(center.x)}, ${coordinate(center.y)}` : "-"}</strong></div>
        <div><span className="metric-label">Bounding box</span><strong>{bbox ? `${value(bbox.x)},${value(bbox.y)},${value(bbox.w)},${value(bbox.h)}` : "-"}</strong></div>
        <div><span className="metric-label">Drop zone planificada</span><strong>{value(dropZone)}</strong></div>
        <div><span className="metric-label">Pasos planificados</span><strong>{sequenceCount || "-"}</strong></div>
        <div className={lastError ? "trace-error" : ""}>
          <span className="metric-label">Ultimo error</span>
          <strong>{lastError ? `${value(lastError.code)}: ${value(lastError.message)}` : "Sin errores reportados"}</strong>
        </div>
      </div>
      {action?.mode === "hardware" && (
        <p className="trace-note">Modo hardware reportado por Edge. No hay confirmación física disponible para esta ejecución.</p>
      )}
    </section>
  );
}
