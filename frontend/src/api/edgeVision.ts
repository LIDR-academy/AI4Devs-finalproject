import type { EdgeVisionPanelData, EdgeVisionSnapshot, EdgeVisionStatus } from "../types/edgeVision";

const edgeVisionUrl = import.meta.env.VITE_EDGE_VISION_URL as string | undefined;

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/\/+$/, "");
}

const baseUrl = normalizeBaseUrl(edgeVisionUrl);

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Edge Vision returned HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function edgeVisionImageUrl(path: string | null | undefined): string | null {
  if (!baseUrl || !path) {
    return null;
  }
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchEdgeVisionPanel(signal?: AbortSignal): Promise<EdgeVisionPanelData> {
  if (!baseUrl) {
    return {
      enabled: false,
      status: null,
      snapshot: null,
      error: "Servicio de vision no disponible (VITE_EDGE_VISION_URL no configurada)",
      baseUrl: null,
    };
  }

  try {
    const [status, snapshot] = await Promise.all([
      fetchJson<EdgeVisionStatus>(`${baseUrl}/vision/status`, signal),
      fetchJson<EdgeVisionSnapshot>(`${baseUrl}/vision/snapshot`, signal),
    ]);
    return { enabled: true, status, snapshot, error: null, baseUrl };
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
    };
  }
}
