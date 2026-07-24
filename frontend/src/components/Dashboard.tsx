import { useCallback, useEffect, useMemo, useState } from "react";
import { dashboardRefreshIntervalMs, fetchOperationalDashboard, resetOperationalDashboard } from "../api/dashboard";
import { edgeVisionRefreshIntervalMs, fetchEdgeVisionPanel, resetEdgeOperation } from "../api/edgeVision";
import type { CloseActiveSessionAs, OperationalDashboard, OperationalResetMode, RobotAction } from "../types/dashboard";
import type { EdgeDropZonesResetResult, EdgeMultiCubeAction, EdgeVisionPanelData } from "../types/edgeVision";
import { ActionsTable } from "./ActionsTable";
import { PhysicalUnloadPanel } from "./PhysicalUnloadPanel";
import { VisionSnapshotPanel } from "./VisionSnapshotPanel";
import { buildExecutionResultRows, type ExecutionResultRow } from "./executionRows";

type LoadState = "loading" | "ready" | "empty" | "error";
type DetailTab = "plan" | "actions" | "trace" | "vision" | "reset";

const colorSummary = [
  { key: "red", label: "Rojo" },
  { key: "blue", label: "Azul" },
  { key: "green", label: "Verde" },
  { key: "yellow", label: "Amarillo" },
] as const;

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "plan", label: "Plan de descarga" },
  { id: "actions", label: "Acciones robot" },
  { id: "trace", label: "Trazabilidad Edge" },
  { id: "vision", label: "Diagnostico vision" },
  { id: "reset", label: "Reset / configuracion" },
];

const value = (input: string | number | null | undefined) => input ?? "-";
const coordinate = (input: number | null | undefined) => (typeof input === "number" ? input.toFixed(1) : "-");
const booleanValue = (input: boolean | null | undefined) => {
  if (input === true) return "Si";
  if (input === false) return "No";
  return "-";
};

const formatPoseValue = (input: number) => {
  const rounded = Math.round(input);
  return Object.is(rounded, -0) ? "0" : String(rounded);
};

const formatPickupTarget = (values?: number[]) => {
  if (!values || values.length === 0) return "-";
  return values.map(formatPoseValue).join(", ");
};

function formatDate(valueToFormat: string | null | undefined) {
  if (!valueToFormat) return "-";
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(valueToFormat));
}

function formatTime(valueToFormat: string | null | undefined) {
  if (!valueToFormat) return "-";
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(valueToFormat));
}

function syncStatus(input: Record<string, unknown> | null | undefined) {
  if (!input) return "-";
  const status = typeof input.status === "string" ? input.status : "-";
  const synced = typeof input.synced === "boolean" ? (input.synced ? "sincronizado" : "no sincronizado") : null;
  return synced ? `${status} (${synced})` : status;
}

function dryRunStatus(input: Record<string, unknown> | null | undefined) {
  if (!input) return "Sin plan dry-run generado";
  const status = typeof input.status === "string" ? input.status : "-";
  const planned = typeof input.planned === "boolean" ? (input.planned ? "planificado" : "no planificado") : null;
  return planned ? `${status} (${planned})` : status;
}

function dryRunDropZone(input: Record<string, unknown> | null | undefined) {
  if (!input) return "-";
  return typeof input.dropZoneCode === "string" ? input.dropZoneCode : "-";
}

const roiValue = (roi: { x: number; y: number; w: number; h: number } | null | undefined) =>
  roi ? `${roi.x},${roi.y},${roi.w},${roi.h}` : "-";

function statusTone(status: string | null | undefined) {
  const normalized = status?.toLowerCase();
  if (!normalized) return "planned";
  if (["success", "ok", "in_progress", "idle"].includes(normalized)) return "success";
  if (normalized.includes("error") || normalized.includes("failed")) return "error";
  return "planned";
}

function latestAction(result: EdgeVisionPanelData["multiCubeStatus"]) {
  const actions = result?.lastResult?.executedActions ?? [];
  return actions.length > 0 ? actions[actions.length - 1] : null;
}

function numberGreaterThanZero(input: unknown) {
  return typeof input === "number" && input > 0;
}

function hasConfirmedPhysicalAction(actions: EdgeMultiCubeAction[]) {
  return actions.some((action) => action.physicalConfirmation?.status === "CONFIRMED");
}

function hasPhysicalConfirmation(status: EdgeVisionPanelData["multiCubeStatus"]) {
  const result = status?.lastResult;
  const resultRecord = result as (Record<string, unknown> & { physicalConfirmed?: unknown }) | null | undefined;
  const actions = status?.executedActions ?? result?.executedActions ?? [];

  return (
    numberGreaterThanZero(result?.totalPhysicalConfirmedCubes) ||
    numberGreaterThanZero(status?.progress?.physicalConfirmed) ||
    numberGreaterThanZero(resultRecord?.physicalConfirmed) ||
    hasConfirmedPhysicalAction(actions)
  );
}

function hasExecutionData(status: EdgeVisionPanelData["multiCubeStatus"]) {
  return Boolean(
    status?.lastResult ||
      (status?.executedActions?.length ?? 0) > 0 ||
      (status?.lastResult?.executedActions?.length ?? 0) > 0,
  );
}

function getPhysicalExecutionNote({
  hasActiveSession,
  mode,
  dryRun,
  status,
}: {
  hasActiveSession: boolean;
  mode: string | null | undefined;
  dryRun: boolean | null | undefined;
  status: EdgeVisionPanelData["multiCubeStatus"];
}) {
  if (!hasActiveSession || !hasExecutionData(status)) {
    return null;
  }

  const normalizedMode = mode?.toLowerCase() ?? "";
  if (dryRun || normalizedMode.includes("dry-run") || normalizedMode === "simulation") {
    return "Ejecución simulada / dry-run. No hubo movimiento físico.";
  }

  if (normalizedMode === "hardware") {
    return hasPhysicalConfirmation(status)
      ? "Confirmación física reportada por Edge Vision. El dashboard refleja el estado informado por Edge."
      : "Modo hardware reportado por Edge. No hay confirmación física disponible para esta ejecución.";
  }

  return null;
}

function getTraceRows(dashboard: OperationalDashboard): Array<[string, string | number]> {
  if (!dashboard.activeSession) {
    return [
      ["Estado operacional", "IDLE"],
      ["Operacion actual", "Sin sesion activa"],
      ["Trazabilidad", "Sin acciones para la operacion actual"],
      ["Historial", "Conservado en backend"],
    ];
  }
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

  return [
    ["Perfil", value(profile)],
    ["Fuente vision", value(visionSource)],
    ["Ejecucion", dryRun ? "Dry-run (sin movimiento)" : action?.mode ?? "-"],
    ["Firma snapshot", value(trace?.snapshotSignature)],
    ["Cubo seleccionado", cube ? `${cube.color} - (${value(cube.x)}, ${value(cube.y)})` : "Sin plan dry-run generado"],
    ["Centro cubo", center ? `${coordinate(center.x)}, ${coordinate(center.y)}` : "-"],
    ["Bounding box", bbox ? `${value(bbox.x)},${value(bbox.y)},${value(bbox.w)},${value(bbox.h)}` : "-"],
    ["Drop zone planificada", value(dropZone)],
    ["Pasos planificados", value(trace?.sequencePreview?.length)],
    ["Ultimo error", lastError ? `${value(lastError.code)}: ${value(lastError.message)}` : "Sin errores reportados"],
  ];
}

function SystemStatusStrip({
  state,
  dashboard,
  visionData,
}: {
  state: LoadState;
  dashboard: OperationalDashboard | null;
  visionData: EdgeVisionPanelData;
}) {
  const backendOk = state === "ready" || state === "empty";
  const edgeOk = visionData.enabled && !visionData.error && Boolean(visionData.status);
  const visionOk = edgeOk && Boolean(visionData.snapshot);
  const robotStatus = visionData.multiCubeStatus?.status ?? "idle";
  const syncWarning =
    Boolean(visionData.error) ||
    Boolean(visionData.snapshot?.lastError) ||
    Boolean(dashboard?.lastVisionError) ||
    (visionData.multiCubeStatus?.lastResult?.totalBackendSyncFailedActions ?? 0) > 0;

  return (
    <section className="system-status-strip" aria-label="Estado global del sistema">
      <StatusPill label="Backend" value={backendOk ? "OK" : "Error"} tone={backendOk ? "success" : "error"} />
      <StatusPill label="Edge" value={edgeOk ? "OK" : "No disponible"} tone={edgeOk ? "success" : "error"} />
      <StatusPill label="Vision" value={visionOk ? "OK" : "No disponible"} tone={visionOk ? "success" : "error"} />
      <StatusPill label="Robot" value={robotStatus} tone={statusTone(robotStatus)} />
      <StatusPill label="Sync" value={syncWarning ? "Warning" : "OK"} tone={syncWarning ? "planned" : "success"} />
    </section>
  );
}

function StatusPill({ label, value: pillValue, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`system-pill system-pill-${tone}`}>
      <span>{label}</span>
      <strong>{pillValue}</strong>
    </div>
  );
}

function SummaryCards({ dashboard, visionData }: { dashboard: OperationalDashboard; visionData: EdgeVisionPanelData }) {
  const action = dashboard.lastActions[0];
  const status = visionData.multiCubeStatus;
  const plan = status?.lastPlan;
  const result = status?.lastResult;
  const hasActiveSession = Boolean(dashboard.activeSession);
  const mode = action?.execution?.dryRun
    ? `${action.execution.profile ?? "simulation"} - dry-run`
    : action?.mode ?? "simulation";

  return (
    <section className="summary-cards" aria-label="Resumen operacional">
      <article className="summary-card">
        <p className="eyebrow">Sesion</p>
        <h2>{dashboard.activeSession?.code ?? "Sin sesion activa"}</h2>
        <div className="summary-line"><span>Camion</span><strong>{dashboard.activeSession?.truckCode ?? "-"}</strong></div>
        <div className="summary-line"><span>Modo</span><strong>{hasActiveSession ? mode : "-"}</strong></div>
        <div className="summary-line"><span>Estado</span><strong>{hasActiveSession ? dashboard.activeSession?.status : "IDLE"}</strong></div>
      </article>
      <article className="summary-card">
        <p className="eyebrow">Cubos</p>
        <h2>{dashboard.counts.total}</h2>
        <div className="metric-chip-row">
          {colorSummary.map((color) => (
            <span className="metric-chip" key={color.key}>
              <span className={`swatch swatch-${color.key}`} aria-hidden="true" />
              {color.label}: <strong>{dashboard.counts[color.key]}</strong>
            </span>
          ))}
        </div>
      </article>
      <article className="summary-card">
        <p className="eyebrow">Progreso</p>
        <h2>{hasActiveSession ? value(result?.status ?? status?.status) : "Sin descarga"}</h2>
        <div className="summary-line"><span>Planificados</span><strong>{hasActiveSession ? value(plan?.totalPlannedCubes) : 0}</strong></div>
        <div className="summary-line"><span>Fisicos OK</span><strong>{hasActiveSession ? value(result?.totalPhysicalConfirmedCubes ?? result?.totalExecutedCubes) : 0}</strong></div>
        <div className="summary-line"><span>Sync backend</span><strong>{hasActiveSession ? value(result?.totalBackendSyncedActions) : 0}</strong></div>
      </article>
    </section>
  );
}

function PlanTable({ actions }: { actions: EdgeMultiCubeAction[] }) {
  if (actions.length === 0) {
    return <div className="table-empty">Sin plan de descarga generado todavía.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Color</th>
            <th>Drop zone</th>
            <th>Posición en zona</th>
            <th>Pickup target</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr key={`${action.sequenceNumber}-${action.dropZoneCode ?? "zone"}`}>
              <td>{action.sequenceNumber}</td>
              <td>{value(action.selectedCubeColor)}</td>
              <td>{value(action.dropZoneCode)}</td>
              <td>{value(action.positionOrder)}</td>
              <td>
                {action.pickupTarget
                  ? formatPickupTarget([action.pickupTarget.x, action.pickupTarget.y, action.pickupTarget.z])
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecutedActionsTable({ rows }: { rows: ExecutionResultRow[] }) {
  if (rows.length === 0) {
    return <div className="table-empty">Sin plan de descarga generado todavía.</div>;
  }

  return (
    <div className="table-wrap physical-plan-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Color</th>
            <th>Drop zone</th>
            <th>Fisico</th>
            <th>Backend</th>
            <th>Intentos</th>
            <th>Pick Z</th>
            <th>Action</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`executed-${row.sequenceNumber}-${row.dropZoneCode ?? "zone"}`}>
              <td>{row.sequenceNumber}</td>
              <td>{value(row.selectedCubeColor)}</td>
              <td>{value(row.dropZoneCode)}</td>
              <td>{row.physicalStatus}</td>
              <td>{row.backendStatus}</td>
              <td>{row.attempts}</td>
              <td>{row.pickZ}</td>
              <td>{row.actionCode}</td>
              <td>{row.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanSectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div className="plan-section-header">
      <h3 className="plan-section-title" id={id}>{title}</h3>
      <p className="plan-section-subtitle">{subtitle}</p>
    </div>
  );
}

function CompactKvTable({ rows }: { rows: Array<[string, string | number]> }) {
  return (
    <table className="compact-kv-table">
      <tbody>
        {rows.map(([label, rowValue]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{rowValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailTabs({
  dashboard,
  visionData,
  resetResult,
}: {
  dashboard: OperationalDashboard;
  visionData: EdgeVisionPanelData;
  resetResult: EdgeDropZonesResetResult | null;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("plan");
  const hasActiveSession = Boolean(dashboard.activeSession);
  const plan = visionData.multiCubeStatus?.lastPlan;
  const result = visionData.multiCubeStatus?.lastResult;
  const planActions = hasActiveSession ? (plan?.plannedActions ?? []) : [];
  const executedActions = hasActiveSession
    ? (visionData.multiCubeStatus?.executedActions ?? result?.executedActions ?? [])
    : [];
  const executionRows = buildExecutionResultRows({
    planRows: planActions,
    executedActions,
    currentSequenceNumber: visionData.multiCubeStatus?.currentSequenceNumber,
  });

  const visionRows: Array<[string, string | number]> = [
    ["Servicio", visionData.enabled ? value(visionData.status?.status) : "No configurado"],
    ["Estado", visionData.error ? "No disponible" : visionData.status ? "Conectado" : "Desconectado"],
    ["Fuente", value(visionData.status?.source ?? visionData.snapshot?.source)],
    ["Camara configurada", value(visionData.status?.configuredCameraIndex)],
    ["Camara activa", value(visionData.status?.activeCameraIndex)],
    ["Camara snapshot", value(visionData.snapshot?.snapshotCameraIndex ?? visionData.status?.snapshotCameraIndex)],
    ["Timestamp", formatDate(visionData.snapshot?.timestamp ?? visionData.status?.lastSnapshotAt)],
    ["Truck code QR", value(visionData.snapshot?.truckCode)],
    ["QR detectado", booleanValue(visionData.snapshot?.qrDetected)],
    ["QR valido", booleanValue(visionData.snapshot?.qrValid)],
    ["Estado QR", value(visionData.snapshot?.qrStatus)],
    ["Firma snapshot", value(visionData.snapshot?.snapshotSignature)],
    ["Firma sincronizada", value(visionData.status?.lastSyncedSnapshotSignature)],
    ["Ultimo sync Backend", syncStatus(visionData.snapshot?.lastVisionSync ?? visionData.status?.lastVisionSync)],
    ["Ultimo plan dry-run", dryRunStatus(visionData.status?.lastDryRunPlan)],
    ["Drop zone dry-run", dryRunDropZone(visionData.status?.lastDryRunPlan)],
    ["QR ROI", roiValue(visionData.snapshot?.qrRoi)],
    ["Cargo ROI", roiValue(visionData.snapshot?.cargoRoi)],
    ["Cubos detectados por vision", visionData.snapshot?.detections.length ?? 0],
    ["Estado seguro", visionData.error ?? visionData.status?.lastError ?? visionData.snapshot?.lastError ?? "Sin errores reportados"],
  ];

  const resetRows: Array<[string, string | number]> = [
    ["Reset status", value(resetResult?.status)],
    ["Reset archivo", value(resetResult?.dropZonesPath)],
    ["Reset slots", resetResult ? `${resetResult.resetSlots} de ${resetResult.totalSlots}` : "-"],
    ["Reset backup", value(resetResult?.backupPath)],
    ["Reset colores", resetResult?.affectedColors.length ? resetResult.affectedColors.join(", ") : "-"],
  ];

  return (
    <section className="panel detail-tabs">
      <div className="tab-list" role="tablist" aria-label="Detalles operacionales">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-panel" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "plan" && (
          <>
            <section className="plan-section" aria-labelledby="plan-generated-title">
              <PlanSectionHeader
                id="plan-generated-title"
                title="Plan generado"
                subtitle="Secuencia planificada de cubos, zonas de descarga y coordenadas pickup."
              />
              <PlanTable actions={planActions} />
            </section>
            <section className="plan-section" aria-labelledby="execution-result-title">
              <PlanSectionHeader
                id="execution-result-title"
                title="Resultado de ejecución"
                subtitle="Confirmación física, sincronización backend e intentos realizados."
              />
              <ExecutedActionsTable rows={executionRows} />
            </section>
          </>
        )}
        {activeTab === "actions" && <ActionsTable actions={hasActiveSession ? dashboard.lastActions.slice(0, 10) : []} compact />}
        {activeTab === "trace" && <CompactKvTable rows={getTraceRows(dashboard)} />}
        {activeTab === "vision" && <CompactKvTable rows={visionRows} />}
        {activeTab === "reset" && <CompactKvTable rows={resetRows} />}
      </div>
    </section>
  );
}

export function Dashboard() {
  const [data, setData] = useState<OperationalDashboard | null>(null);
  const [visionData, setVisionData] = useState<EdgeVisionPanelData>({
    enabled: false,
    status: null,
    snapshot: null,
    multiCubeStatus: null,
    error: null,
    baseUrl: null,
    refreshMs: edgeVisionRefreshIntervalMs(),
    lastUpdatedAt: null,
  });
  const [state, setState] = useState<LoadState>("loading");
  const [visionLoading, setVisionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDashboardUpdatedAt, setLastDashboardUpdatedAt] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<EdgeDropZonesResetResult | null>(null);
  const [operationalMessage, setOperationalMessage] = useState<string | null>(null);
  const [operationalBusy, setOperationalBusy] = useState<OperationalResetMode | null>(null);

  const dashboardRefreshMs = dashboardRefreshIntervalMs();

  const loadDashboard = useCallback(async (options?: { quiet?: boolean; signal?: AbortSignal }) => {
    if (!options?.quiet) {
      setState("loading");
    }
    setError(null);

    try {
      const dashboard = await fetchOperationalDashboard(options?.signal);
      setData(dashboard);
      setState(dashboard.activeSession ? "ready" : "empty");
      setLastDashboardUpdatedAt(new Date().toISOString());
    } catch (unknownError) {
      if (unknownError instanceof DOMException && unknownError.name === "AbortError") {
        return;
      }
      setData(null);
      setError(unknownError instanceof Error ? unknownError.message : "No se pudo consultar el backend");
      setState("error");
    }
  }, []);

  const loadVision = useCallback(async (signal?: AbortSignal) => {
    setVisionLoading(true);
    try {
      const vision = await fetchEdgeVisionPanel(signal);
      setVisionData(vision);
    } catch (unknownError) {
      if (!(unknownError instanceof DOMException && unknownError.name === "AbortError")) {
        setVisionData({
          enabled: true,
          status: null,
          snapshot: null,
          multiCubeStatus: null,
          error: unknownError instanceof Error ? unknownError.message : "Servicio de vision no disponible",
          baseUrl: null,
          refreshMs: edgeVisionRefreshIntervalMs(),
          lastUpdatedAt: new Date().toISOString(),
        });
      }
    } finally {
      if (!signal?.aborted) {
        setVisionLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard({ signal: controller.signal });
    const intervalId = window.setInterval(() => {
      void loadDashboard({ quiet: true, signal: controller.signal });
    }, dashboardRefreshMs);

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [dashboardRefreshMs, loadDashboard]);

  useEffect(() => {
    const controller = new AbortController();
    void loadVision(controller.signal);
    const intervalId = window.setInterval(() => {
      void loadVision(controller.signal);
    }, edgeVisionRefreshIntervalMs());

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [loadVision]);

  const refreshAll = useCallback(() => {
    void loadDashboard();
    void loadVision();
  }, [loadDashboard, loadVision]);

  const runOperationalReset = useCallback(
    async (mode: OperationalResetMode) => {
      const closeActiveSessionAs: CloseActiveSessionAs =
        mode === "next-truck" && visionData.multiCubeStatus?.status === "success" ? "completed" : "cancelled";
      const confirmation =
        mode === "start-day"
          ? "Esto cerrara sesiones abiertas antiguas, limpiara el estado operacional del dashboard y reseteara zonas de descarga si Edge esta disponible. No se borrara el historial."
          : closeActiveSessionAs === "completed"
            ? "Esto cerrara la operacion actual como COMPLETED, limpiara el dashboard y reseteara zonas de descarga si Edge esta disponible. No se borrara el historial."
            : "Esto cerrara la operacion actual como descartada, limpiara el dashboard y reseteara zonas de descarga si Edge esta disponible. No se borrara el historial.";

      if (!window.confirm(confirmation)) {
        return;
      }

      setOperationalBusy(mode);
      setOperationalMessage(null);
      try {
        const backendReset = await resetOperationalDashboard({ mode, closeActiveSessionAs });
        let edgeMessage = "Edge reset OK; drop zones occupied=false.";
        try {
          const edgeReset = await resetEdgeOperation();
          setResetResult(edgeReset.dropZonesReset);
          if (edgeReset.warning) {
            edgeMessage = `Backend limpio; Edge respondio con warning: ${edgeReset.warning}`;
          }
        } catch (edgeError) {
          setResetResult(null);
          edgeMessage = `Backend limpio; Edge no disponible para reset fisico/drop zones: ${
            edgeError instanceof Error ? edgeError.message : "error desconocido"
          }`;
        }
        await Promise.all([loadDashboard(), loadVision()]);
        setOperationalMessage(
          `${mode === "start-day" ? "Jornada limpia iniciada" : "Nuevo camion preparado"}. ` +
            `Sesiones cerradas: ${backendReset.closedSessions}. ${edgeMessage} No borra historial.`,
        );
      } catch (unknownError) {
        setOperationalMessage(
          unknownError instanceof Error ? `No se pudo limpiar operacion: ${unknownError.message}` : "No se pudo limpiar operacion",
        );
      } finally {
        setOperationalBusy(null);
      }
    },
    [loadDashboard, loadVision, visionData.multiCubeStatus?.status],
  );

  const lastAction: RobotAction | undefined = data?.lastActions[0];
  const physicalExecutionNote = getPhysicalExecutionNote({
    hasActiveSession: Boolean(data?.activeSession),
    mode: lastAction?.mode ?? (visionData.status?.hardwareMovement ? "hardware" : "simulation"),
    dryRun: data?.dryRun ?? lastAction?.execution?.dryRun,
    status: visionData.multiCubeStatus,
  });
  const autoRefreshText = useMemo(
    () =>
      `Auto-refresh ${Math.round(dashboardRefreshMs / 1000)}s` +
      (lastDashboardUpdatedAt ? ` - Ultima actualizacion ${formatTime(lastDashboardUpdatedAt)}` : ""),
    [dashboardRefreshMs, lastDashboardUpdatedAt],
  );

  return (
    <main className="app-shell">
      <header className="topbar compact-topbar">
        <div>
          <p className="eyebrow">RoboDock AI</p>
          <h1>Dashboard Operacional</h1>
          <p className="refresh-meta">{autoRefreshText}</p>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => void runOperationalReset("start-day")}
            disabled={Boolean(operationalBusy)}
          >
            <span>{operationalBusy === "start-day" ? "Limpiando" : "Iniciar jornada"}</span>
          </button>
          {data?.activeSession && (
            <button
              className="icon-button"
              type="button"
              onClick={() => void runOperationalReset("next-truck")}
              disabled={Boolean(operationalBusy)}
            >
              <span>{operationalBusy === "next-truck" ? "Preparando" : "Preparar nuevo camion"}</span>
            </button>
          )}
          <button className="icon-button" type="button" aria-label="Actualizar dashboard" onClick={refreshAll}>
            <span aria-hidden="true">Actualizar</span>
          </button>
        </div>
      </header>

      <SystemStatusStrip state={state} dashboard={data} visionData={visionData} />

      {state === "loading" && <section className="state-panel">Cargando estado operacional...</section>}

      {state === "error" && (
        <section className="state-panel state-panel-error" role="alert">
          <strong>Error de conexion</strong>
          <span>{error}</span>
        </section>
      )}

      {state === "empty" && (
        <section className="state-panel">
          <strong>Sin sesion activa</strong>
          <span>Esperando camion / QR. Limpia solo la operacion actual; no borra historial.</span>
        </section>
      )}

      {operationalMessage && (
        <section className="state-panel operational-message" role="status">
          <span>{operationalMessage}</span>
        </section>
      )}

      {(state === "ready" || state === "empty") && data && (
        <>
          {data.activeSession && data.activeSession.status === "IN_PROGRESS" && (
            <section className="state-panel stale-session-warning">
              <strong>Hay una sesion previa abierta</strong>
              <span>Puedes continuar la sesion actual o iniciar jornada limpia. No se ocultaran datos activos sin tu accion.</span>
            </section>
          )}
          <section className="operations-workspace" aria-label="Workspace principal">
            <VisionSnapshotPanel data={visionData} loading={visionLoading} />
            <PhysicalUnloadPanel
              dashboard={data}
              visionData={visionData}
              onRefresh={refreshAll}
              onResetResult={setResetResult}
            />
          </section>
          <SummaryCards dashboard={data} visionData={visionData} />
          <DetailTabs dashboard={data} visionData={visionData} resetResult={resetResult} />
          {physicalExecutionNote && <p className="trace-note">{physicalExecutionNote}</p>}
        </>
      )}
    </main>
  );
}
