/**
 * Chips de operario reciente (TK-113-FE, US-031): recuerda hasta 3 ids de
 * operario que ya iniciaron sesion en ESTE dispositivo (localStorage,
 * client-only). Nunca sincronizado con el backend ni con el PIN — solo
 * evita retipear el id en cada turno. No es (ni reemplaza) una lista de
 * usuarios del sistema: el backend no expone ningun endpoint que la liste
 * (ver nota historica en PinLoginModal.tsx sobre por que se retiro el
 * <select> de operarios de fixtures).
 */
const RECENT_OPERATORS_STORAGE_KEY = 'fefo-recent-operators';
const MAX_RECENT_OPERATORS = 3;

export function getRecentOperatorIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_OPERATORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_RECENT_OPERATORS);
  } catch (err) {
    console.error('[PinLoginModal] No se pudo leer el historial de operarios recientes:', err);
    return [];
  }
}

export function rememberOperatorId(id: string): void {
  const trimmed = id.trim();
  if (!trimmed) return;

  try {
    const existing = getRecentOperatorIds().filter((existingId) => existingId !== trimmed);
    const next = [trimmed, ...existing].slice(0, MAX_RECENT_OPERATORS);
    localStorage.setItem(RECENT_OPERATORS_STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('[PinLoginModal] No se pudo persistir el historial de operarios recientes:', err);
  }
}
