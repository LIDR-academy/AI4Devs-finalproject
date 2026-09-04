import { apiRequest } from '../../../shared/http/apiClient.js';

export interface ExtractionRequest {
  insumoId: string;
  quantity: number | string;
  /** US-025: sub-sector de bodega de origen — obligatorio. */
  fromStorageLocationId: string;
  /** US-026: id del área de cocina de destino (StorageLocation type=KITCHEN) o literal legado. */
  toStorageLocationId?: string;
  purpose?: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  reason?: string;
  recipeId?: string;
  /** US-027: modo RECIPE — porciones planificadas y preparación en curso opcional. */
  plannedPortions?: number;
  recipePreparationId?: string;
}

/* jscpd:ignore-start — espejo deliberado del contrato de respuesta (ExtractionResponseDTO en
   el backend). openapi.yaml es la SSoT; front y back son paquetes separados sin tipo compartido. */
export interface ExtractionResult {
  /** `null` en DIRECT_DISCARD — el descarte no crea remanente (AUDIT-DEV-006 F-9). */
  remanenteId: string | null;
  /** US-027: id de la preparación de receta abierta/reutilizada (solo modo RECIPE). */
  recipePreparationId?: string;
  insumoId: string;
  insumoName: string;
  quantityExtracted: string;
  fromStorageLocationId: string;
  remainingSectorStock: string;
  remainingWarehouseStock: string;
  location: string;
  expirationDate: string;
  status: string;
}
/* jscpd:ignore-end */

export interface StockMovementHistoryItem {
  id: string;
  insumoId: string;
  insumoName: string;
  type: string;
  quantity: string;
  fromLoc: string;
  toLoc: string;
  createdAt: string;
}

export interface MovementHistoryFilters {
  insumoId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StockByLocationEntry {
  storageLocationId: string;
  storageLocationName: string;
  quantity: string;
}

export interface InsumoItem {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
  stockByLocation?: StockByLocationEntry[];
  unitCost?: string | null;
}

export interface CreateInsumoDTO {
  name: string;
  unitOfMeasure: string;
  initialWarehouseStock?: string;
  unitCost?: string;
  /** US-025: sub-sector de bodega donde queda depositado el stock inicial. */
  storageLocationId: string;
}

export interface RestockInsumoDTO {
  quantity: number | string;
  /** US-025: sub-sector de bodega al que se suma la cantidad recibida. */
  storageLocationId: string;
}

export interface RestockInsumoResult {
  insumoId: string;
  insumoName: string;
  storageLocationId: string;
  quantityAdded: string;
  newSectorStock: string;
  newWarehouseStock: string;
}

export class StockService {
  public static async createInsumo(data: CreateInsumoDTO): Promise<InsumoItem> {
    return apiRequest<InsumoItem>('/stock/insumos', { method: 'POST', body: data });
  }

  public static async restockInsumo(insumoId: string, data: RestockInsumoDTO): Promise<RestockInsumoResult> {
    return apiRequest<RestockInsumoResult>(`/stock/insumos/${insumoId}/restock`, { method: 'PATCH', body: data });
  }

  // AUDIT-DEV-006 F-5: sin fallback silencioso a datos mock. Un error del backend
  // se propaga al componente para su traducción vía errorMessageMapper (Guard 38 /
  // frontend_rules.md §9.5) — el llamador maneja loading/error/vacío explícitamente.
  public static async getInsumos(): Promise<InsumoItem[]> {
    return apiRequest<InsumoItem[]>('/stock/insumos');
  }

  // AUDIT-DEV-006 F-5: sin modo demo. Un 422 (stock insuficiente) o un 500 NUNCA se
  // presenta como una extracción exitosa fabricada — el error se propaga y el modal lo
  // muestra en su ErrorBanner (frontend_rules.md §9.5).
  public static async recordExtraction(data: ExtractionRequest): Promise<ExtractionResult> {
    return apiRequest<ExtractionResult>('/stock/extraction', { method: 'POST', body: data });
  }

  public static async getMovementHistory(filters: MovementHistoryFilters = {}): Promise<StockMovementHistoryItem[]> {
    const params = new URLSearchParams();
    if (filters.insumoId) params.set('insumoId', filters.insumoId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    const query = params.toString();

    return apiRequest<StockMovementHistoryItem[]>(`/stock/movements${query ? `?${query}` : ''}`);
  }
}
