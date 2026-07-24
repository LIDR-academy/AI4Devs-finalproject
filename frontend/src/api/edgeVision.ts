import type {
  EdgeMultiCubePlan,
  EdgeMultiCubeResult,
  EdgeMultiCubeSafety,
  EdgeMultiCubeStatus,
  EdgeDropZonesResetResult,
  EdgeOperationResetResult,
  EdgeVisionPanelData,
  EdgeVisionSnapshot,
  EdgeVisionStatus,
} from "../types/edgeVision";

const edgeVisionUrl = import.meta.env.VITE_EDGE_VISION_URL as string | undefined;
const edgeVisionRefreshMs = import.meta.env.VITE_EDGE_VISION_REFRESH_MS as string | undefined;
const DEFAULT_REFRESH_MS = 2000;
const MIN_REFRESH_MS = 1000;
const MAX_REFRESH_MS = 3000;

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/\/+$/, "");
}

const baseUrl = normalizeBaseUrl(edgeVisionUrl);

export function edgeVisionRefreshIntervalMs(): number {
  const parsed = Number(edgeVisionRefreshMs);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_REFRESH_MS;
  }
  return Math.min(MAX_REFRESH_MS, Math.max(MIN_REFRESH_MS, Math.round(parsed)));
}

const refreshMs = edgeVisionRefreshIntervalMs();

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Edge Vision returned HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!baseUrl) {
    throw new Error("VITE_EDGE_VISION_URL no configurada");
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = `Edge Vision returned HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: unknown };
      if (typeof payload.detail === "string") {
        detail = payload.detail;
      } else if (
        payload.detail &&
        typeof payload.detail === "object" &&
        "code" in payload.detail &&
        (payload.detail as { code?: unknown }).code === "MISSING_HARDWARE_PORT"
      ) {
        detail = "Falta configurar hardware.port en single-cube-pick-drop.local.json";
      } else if (
        payload.detail &&
        typeof payload.detail === "object" &&
        "message" in payload.detail &&
        typeof (payload.detail as { message?: unknown }).message === "string"
      ) {
        detail = (payload.detail as { message: string }).message;
      } else if (payload.detail) {
        detail = JSON.stringify(payload.detail);
      }
    } catch {
      // Keep the HTTP detail when the body is not JSON.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export function edgeVisionImageUrl(path: string | null | undefined, cacheKey?: string | null): string | null {
  if (!baseUrl || !path) {
    return null;
  }
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!cacheKey) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}ts=${encodeURIComponent(cacheKey)}`;
}

export async function fetchEdgeVisionPanel(signal?: AbortSignal): Promise<EdgeVisionPanelData> {
  if (!baseUrl) {
    return {
      enabled: false,
      status: null,
      snapshot: null,
      multiCubeStatus: null,
      error: "Servicio de vision no disponible (VITE_EDGE_VISION_URL no configurada)",
      baseUrl: null,
      refreshMs,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  try {
    const [status, snapshot, multiCubeStatus] = await Promise.all([
      fetchJson<EdgeVisionStatus>(`${baseUrl}/vision/status`, signal),
      fetchJson<EdgeVisionSnapshot>(`${baseUrl}/vision/snapshot`, signal),
      fetchJson<EdgeMultiCubeStatus>(`${baseUrl}/robot/multi-cube/status`, signal),
    ]);
    return {
      enabled: true,
      status,
      snapshot,
      multiCubeStatus,
      error: null,
      baseUrl,
      refreshMs,
      lastUpdatedAt: new Date().toISOString(),
    };
  } catch (unknownError) {
    return {
      enabled: true,
      status: null,
      snapshot: null,
      multiCubeStatus: null,
      error:
        unknownError instanceof Error
          ? `Servicio de vision no disponible: ${unknownError.message}`
          : "Servicio de vision no disponible",
      baseUrl,
      refreshMs,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export async function resetDropZones(): Promise<EdgeDropZonesResetResult> {
  return postJson<EdgeDropZonesResetResult>("/drop-zones/reset", { scope: "all" });
}

export async function resetEdgeOperation(): Promise<EdgeOperationResetResult> {
  try {
    return await postJson<EdgeOperationResetResult>("/operation/reset", { resetDropZones: true });
  } catch (error) {
    const dropZonesReset = await resetDropZones();
    return {
      status: "SUCCESS",
      multiCubeStatus: {
        status: "idle",
        runId: null,
        lastPlan: null,
        lastResult: null,
        lastError: error instanceof Error ? error.message : null,
        updatedAt: new Date().toISOString(),
      },
      dropZonesReset,
      warning: error instanceof Error ? error.message : "Endpoint /operation/reset no disponible; se reseteo drop zones.",
    };
  }
}

export async function planMultiCubeUnload(maxCubes: number): Promise<EdgeMultiCubePlan> {
  return postJson<EdgeMultiCubePlan>("/robot/multi-cube/plan", { maxCubes });
}

export async function executeMultiCubeUnload(input: {
  runId: string;
  maxCubes: number;
  safety: EdgeMultiCubeSafety;
}): Promise<EdgeMultiCubeResult> {
  return postJson<EdgeMultiCubeResult>("/robot/multi-cube/execute", input);
}
