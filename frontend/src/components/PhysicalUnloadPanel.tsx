import { useMemo, useState } from "react";
import { executeMultiCubeUnload, planMultiCubeUnload, resetDropZones } from "../api/edgeVision";
import type { OperationalDashboard } from "../types/dashboard";
import type { EdgeDropZonesResetResult, EdgeMultiCubeSafety, EdgeVisionPanelData } from "../types/edgeVision";

type Props = {
  dashboard: OperationalDashboard;
  visionData: EdgeVisionPanelData;
  onRefresh: () => void;
  onResetResult?: (result: EdgeDropZonesResetResult | null) => void;
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

export function PhysicalUnloadPanel({ dashboard, visionData, onRefresh, onResetResult }: Props) {
  const [maxCubes, setMaxCubes] = useState("all");
  const [safety, setSafety] = useState<EdgeMultiCubeSafety>(emptySafety);
  const [busyAction, setBusyAction] = useState<"reset" | "plan" | "execute" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const status = visionData.multiCubeStatus;
  const backendOnline = Boolean(dashboard.activeSession);
  const plan = backendOnline ? (status?.lastPlan ?? null) : null;
  const result = backendOnline ? (status?.lastResult ?? null) : null;
  const lastAction = backendOnline ? latestAction(status) : null;
  const selectedMaxCubes = maxCubes === "all" ? Math.min(visionData.snapshot?.detections.length || 6, 6) : Number(maxCubes);
  const allSafetyChecked = safetyLabels.every((item) => safety[item.key]);
  const edgeOnline = visionData.enabled && !visionData.error && Boolean(visionData.status);
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
    if (!backendOnline) return "Sin sesion activa; esperando camion / QR";
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
      onResetResult?.(response);
      onRefresh();
    } catch (error) {
      onResetResult?.(null);
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
    <section className="panel unload-control-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Descarga fisica</p>
          <h2>Control MaxArm</h2>
          <p className="panel-subtitle">
            Estado: {formatStatus(status?.status)} - Ultima actualizacion:{" "}
            {status?.updatedAt ? new Date(status.updatedAt).toLocaleTimeString() : "-"}
          </p>
        </div>
        <span className={`status-badge status-${resultStatusClass}`}>{status?.status ?? "idle"}</span>
      </div>

      {!edgeOnline && (
        <div className="executive-state" role="alert">
          <strong>Edge Vision no disponible</strong>
          <span>No se puede planificar ni ejecutar descarga fisica hasta levantar el servicio Edge.</span>
          <span>Levanta vision_api.py con la configuracion correspondiente.</span>
        </div>
      )}

      <div className="physical-toolbar compact">
        <label>
          Max cubos
          <select value={maxCubes} onChange={(event) => setMaxCubes(event.target.value)} disabled={executing}>
            <option value="all">Todos</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </label>
        <button type="button" className="icon-button" onClick={runReset} disabled={Boolean(busyAction)}>
          <span>{busyAction === "reset" ? "Reseteando" : "Reset zonas"}</span>
        </button>
        <button type="button" className="icon-button" onClick={runPlan} disabled={!edgeOnline || !qrValid || executing || busyAction === "plan"}>
          <span>{busyAction === "plan" ? "Planificando" : "Planificar"}</span>
        </button>
        <button type="button" className="danger-button" onClick={runExecute} disabled={Boolean(executeDisabledReason)}>
          Ejecutar fisica
        </button>
      </div>

      {executeDisabledReason && <p className="trace-note">Ejecucion bloqueada: {executeDisabledReason}</p>}
      {(localError || visibleStatusError) && (
        <p className="physical-error" role="alert">
          {localError ??
            (visibleStatusError?.includes("MISSING_HARDWARE_PORT")
              ? "Falta configurar hardware.port en single-cube-pick-drop.local.json"
              : visibleStatusError)}
        </p>
      )}

      <div className="safety-checklist compact">
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

      <div className="control-progress">
        <div><span>Planificados</span><strong>{value(plan?.totalPlannedCubes)}</strong></div>
        <div><span>Fisicos OK</span><strong>{value(result?.totalPhysicalConfirmedCubes ?? result?.totalExecutedCubes)}</strong></div>
        <div><span>Restantes</span><strong>{value(result?.totalRemainingCubes)}</strong></div>
        <div><span>Sync OK</span><strong>{value(result?.totalBackendSyncedActions)}</strong></div>
        <div><span>Resultado</span><strong>{backendOnline ? value(result?.status ?? status?.status) : "Sin descarga en curso"}</strong></div>
        <div><span>Ultimo cubo</span><strong>{lastAction ? `${value(lastAction.selectedCubeColor)} -> ${value(lastAction.dropZoneCode)}` : "-"}</strong></div>
      </div>
    </section>
  );
}
