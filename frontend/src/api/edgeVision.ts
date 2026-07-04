import type { EdgeVisionPanelData, EdgeVisionSnapshot, EdgeVisionStatus } from "../types/edgeVision";

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
      error: "Servicio de vision no disponible (VITE_EDGE_VISION_URL no configurada)",
      baseUrl: null,
      refreshMs,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  try {
    const [status, snapshot] = await Promise.all([
      fetchJson<EdgeVisionStatus>(`${baseUrl}/vision/status`, signal),
      fetchJson<EdgeVisionSnapshot>(`${baseUrl}/vision/snapshot`, signal),
    ]);
    return { enabled: true, status, snapshot, error: null, baseUrl, refreshMs, lastUpdatedAt: new Date().toISOString() };
  } catch (unknownError) {
    return {
      enabled: true,
      status: null,
      snapshot: null,
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
