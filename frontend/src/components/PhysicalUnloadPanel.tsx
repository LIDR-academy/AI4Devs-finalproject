import { useMemo, useState } from "react";
import { executeMultiCubeUnload, planMultiCubeUnload, resetDropZones } from "../api/edgeVision";
import type { OperationalDashboard } from "../types/dashboard";
import type { EdgeDropZonesResetResult, EdgeMultiCubeSafety, EdgeVisionPanelData } from "../types/edgeVision";

type Props = {
  dashboard: OperationalDashboard;
  visionData: EdgeVisionPanelData;
  onRefresh: () => void;
};

const safetyLabels: Array<{ key: keyof EdgeMultiCubeSafety; label: string }> = [
  { key: "zoneClear", label: "Zona despejada" },
  { key: "operatorPresent", label: "Operador presente" },
  { key: "emergencyStopReady", label: "Parada de emergencia lista" },
  { key: "suctionReady", label: "Succion conectada" },
  { key: "physicalExecutionConfirmed", label: "Confirmo ejecucion fisica" },
];

const emptySafety: EdgeMultiCubeSafety = {
  zoneClear: false,
  operatorPresent: false,
  emergencyStopReady: false,
  suctionReady: false,
  physicalExecutionConfirmed: false,
};

function value(input: string | number | null | undefined) {
  return input ?? "-";
}

function formatStatus(status: string | null | undefined) {
  if (!status) return "idle";
  return status.replace(/_/g, " ");
}

function latestAction(result: Props["visionData"]["multiCubeStatus"]) {
  const actions = result?.lastResult?.executedActions ?? [];
  return actions.length > 0 ? actions[actions.length - 1] : null;
}

function physicalStatus(action: { physicalConfirmation?: Record<string, unknown> | null }) {
  const status = action.physicalConfirmation?.status;
  return typeof status === "string" ? status : "-";
}

function attemptsCount(action: { physicalConfirmation?: Record<string, unknown> | null }) {
  const attempts = action.physicalConfirmation?.attempts;
  return Array.isArray(attempts) ? attempts.length : "-";
}

export function PhysicalUnloadPanel({ dashboard, visionData, onRefresh }: Props) {
  const [maxCubes, setMaxCubes] = useState("all");
  const [safety, setSafety] = useState<EdgeMultiCubeSafety>(emptySafety);
  const [busyAction, setBusyAction] = useState<"reset" | "plan" | "execute" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<EdgeDropZonesResetResult | null>(null);

  const status = visionData.multiCubeStatus;
  const plan = status?.lastPlan ?? null;
  const result = status?.lastResult ?? null;
  const lastAction = latestAction(status);
  const selectedMaxCubes = maxCubes === "all" ? Math.min(visionData.snapshot?.detections.length || 6, 6) : Number(maxCubes);
  const allSafetyChecked = safetyLabels.every((item) => safety[item.key]);
  const edgeOnline = visionData.enabled && !visionData.error && Boolean(visionData.status);
  const backendOnline = Boolean(dashboard.activeSession);
  const qrValid = visionData.snapshot?.qrValid === true && Boolean(visionData.snapshot?.truckCode);
  const hasPlannedCubes = (plan?.totalPlannedCubes ?? 0) > 0;
  const executing = status?.status === "executing" || busyAction === "execute";
  const missingHardwarePort =
    status?.hardwarePortConfigured === false ||
    (status?.hardwarePortConfigured !== true && status?.lastError?.includes("MISSING_HARDWARE_PORT") === true);
  const visibleStatusError =
    status?.lastError?.includes("MISSING_HARDWARE_PORT") === true && status.hardwarePortConfigured === true
      ? null
      : status?.lastError;
  const resultStatusClass =
    status?.status === "failed"
      ? "error"
      : status?.status === "partial_success" || status?.status === "success_with_backend_sync_warnings"
        ? "planned"
        : status?.status ?? "planned";

  const executeDisabledReason = useMemo(() => {
    if (!edgeOnline) return "Edge Vision no disponible";
    if (!backendOnline) return "Backend sin sesion activa";
    if (!plan || status?.status !== "planned") return "Planificacion requerida";
    if (!qrValid) return "QR valido requerido";
    if (!hasPlannedCubes) return "Sin cubos planificados";
    if (missingHardwarePort) return "Falta configurar hardware.port en single-cube-pick-drop.local.json";
    if (!allSafetyChecked) return "Completar checklist de seguridad";
    if (executing) return "Ejecucion en curso";
    return null;
  }, [allSafetyChecked, backendOnline, edgeOnline, executing, hasPlannedCubes, missingHardwarePort, plan, qrValid, status?.status]);

  const runReset = async () => {
    if (!window.confirm("Resetear ocupacion de todas las drop zones? No cambia active ni coordenadas.")) {
      return;
    }
    setBusyAction("reset");
    setLocalError(null);
    try {
      const response = await resetDropZones();
      setResetResult(response);
      onRefresh();
    } catch (error) {
      setResetResult(null);
      setLocalError(error instanceof Error ? error.message : "No se pudo resetear drop zones");
    } finally {
      setBusyAction(null);
    }
  };

  const runPlan = async () => {
    setBusyAction("plan");
    setLocalError(null);
    try {
      await planMultiCubeUnload(selectedMaxCubes);
      onRefresh();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No se pudo planificar descarga");
    } finally {
      setBusyAction(null);
    }
  };

  const runExecute = async () => {
    if (!plan?.runId || executeDisabledReason) return;
    setBusyAction("execute");
    setLocalError(null);
    try {
      await executeMultiCubeUnload({ runId: plan.runId, maxCubes: selectedMaxCubes, safety });
      onRefresh();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No se pudo ejecutar descarga fisica");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <section className="panel panel-span-3 physical-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Descarga fisica del camion</p>
          <h2>Control MaxArm multi-cubo</h2>
          <p className="panel-subtitle">
            Estado: {formatStatus(status?.status)} - Ultima actualizacion:{" "}
            {status?.updatedAt ? new Date(status.updatedAt).toLocaleTimeString() : "-"}
          </p>
        </div>
        <span className={`status-badge status-${resultStatusClass}`}>
          {status?.status ?? "idle"}
        </span>
      </div>

      <div className="physical-toolbar">
        <label>
          Max cubos
          <select value={maxCubes} onChange={(event) => setMaxCubes(event.target.value)} disabled={executing}>
            <option value="all">Descargar todos</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </label>
        <button type="button" className="icon-button" onClick={runReset} disabled={Boolean(busyAction)}>
          <span>{busyAction === "reset" ? "Reseteando" : "Reset drop zones"}</span>
        </button>
        <button type="button" className="icon-button" onClick={runPlan} disabled={!edgeOnline || !qrValid || executing || busyAction === "plan"}>
          <span>{busyAction === "plan" ? "Planificando" : "Planificar descarga"}</span>
        </button>
        <button type="button" className="danger-button" onClick={runExecute} disabled={Boolean(executeDisabledReason)}>
          Ejecutar descarga fisica
        </button>
      </div>

      {executeDisabledReason && <p className="trace-note">Ejecucion bloqueada: {executeDisabledReason}</p>}
      {(localError || visibleStatusError) && (
        <p className="physical-error">
          {localError ??
            (visibleStatusError?.includes("MISSING_HARDWARE_PORT")
              ? "Falta configurar hardware.port en single-cube-pick-drop.local.json"
              : visibleStatusError)}
        </p>
      )}

      <div className="safety-checklist">
        {safetyLabels.map((item) => (
          <label key={item.key}>
            <input
              type="checkbox"
              checked={safety[item.key]}
              onChange={(event) => setSafety((current) => ({ ...current, [item.key]: event.target.checked }))}
              disabled={executing}
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="trace-grid">
        <div><span className="metric-label">QR / Camion</span><strong>{value(plan?.truckCode ?? visionData.snapshot?.truckCode)}</strong></div>
        <div><span className="metric-label">Cubos detectados</span><strong>{value(plan?.totalDetectedCubes ?? visionData.snapshot?.detections.length)}</strong></div>
        <div><span className="metric-label">Cubos planificados</span><strong>{value(plan?.totalPlannedCubes)}</strong></div>
        <div><span className="metric-label">Cubos fisicos OK</span><strong>{value(result?.totalPhysicalConfirmedCubes ?? result?.totalExecutedCubes)}</strong></div>
        <div><span className="metric-label">Cubos intentados</span><strong>{value(result?.totalAttemptedCubes)}</strong></div>
        <div><span className="metric-label">Cubos restantes</span><strong>{value(result?.totalRemainingCubes)}</strong></div>
        <div><span className="metric-label">Sync backend OK</span><strong>{value(result?.totalBackendSyncedActions)}</strong></div>
        <div><span className="metric-label">Sync backend fallido</span><strong>{value(result?.totalBackendSyncFailedActions)}</strong></div>
        <div><span className="metric-label">Error backend</span><strong>{value(result?.lastBackendSyncError)}</strong></div>
        <div><span className="metric-label">Error fisico</span><strong>{value(result?.lastPhysicalError)}</strong></div>
        <div><span className="metric-label">Confirmacion fisica</span><strong>{value(lastAction?.physicalConfirmation?.status as string | undefined)}</strong></div>
        <div><span className="metric-label">Ultimo cubo</span><strong>{lastAction ? `${value(lastAction.selectedCubeColor)} -> ${value(lastAction.dropZoneCode)}` : "-"}</strong></div>
        <div><span className="metric-label">Retry Z</span><strong>{value(lastAction?.finalPickZUsed)}</strong></div>
        <div><span className="metric-label">Resultado general</span><strong>{value(result?.status)}</strong></div>
        <div><span className="metric-label">Reset status</span><strong>{value(resetResult?.status)}</strong></div>
        <div><span className="metric-label">Reset archivo</span><strong>{value(resetResult?.dropZonesPath)}</strong></div>
        <div><span className="metric-label">Reset slots</span><strong>{resetResult ? `${resetResult.resetSlots} de ${resetResult.totalSlots}` : "-"}</strong></div>
        <div><span className="metric-label">Reset backup</span><strong>{value(resetResult?.backupPath)}</strong></div>
        <div><span className="metric-label">Reset colores</span><strong>{resetResult?.affectedColors.length ? resetResult.affectedColors.join(", ") : "-"}</strong></div>
      </div>

      {plan?.plannedActions && plan.plannedActions.length > 0 && (
        <div className="table-wrap physical-plan-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Color</th>
                <th>Drop zone</th>
                <th>Orden</th>
                <th>Pickup target</th>
                <th>Offset</th>
              </tr>
            </thead>
            <tbody>
              {plan.plannedActions.map((action) => (
                <tr key={`${action.sequenceNumber}-${action.dropZoneCode}`}>
                  <td>{action.sequenceNumber}</td>
                  <td>{value(action.selectedCubeColor)}</td>
                  <td>{value(action.dropZoneCode)}</td>
                  <td>{value(action.positionOrder)}</td>
                  <td>{action.pickupTarget ? `${value(action.pickupTarget.x)}, ${value(action.pickupTarget.y)}, ${value(action.pickupTarget.z)}` : "-"}</td>
                  <td>{action.pickupOffset ? `${value(action.pickupOffset.x)}, ${value(action.pickupOffset.y)}, ${value(action.pickupOffset.z)}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result?.executedActions && result.executedActions.length > 0 && (
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
              {result.executedActions.map((action) => (
                <tr key={`executed-${action.sequenceNumber}-${action.dropZoneCode ?? "zone"}`}>
                  <td>{action.sequenceNumber}</td>
                  <td>{value(action.selectedCubeColor)}</td>
                  <td>{value(action.dropZoneCode)}</td>
                  <td>{physicalStatus(action)}</td>
                  <td>{value(action.backendSyncStatus)}</td>
                  <td>{attemptsCount(action)}</td>
                  <td>{value(action.finalPickZUsed)}</td>
                  <td>{value(action.backendActionCode)}</td>
                  <td>{value(action.backendSyncError)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
