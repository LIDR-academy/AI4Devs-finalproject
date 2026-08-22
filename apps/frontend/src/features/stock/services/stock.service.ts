import { apiRequest } from '../../../shared/http/apiClient.js';
import { DecimalQuantity } from '../../../shared/domain/DecimalQuantity.js';

export interface ExtractionRequest {
  insumoId: string;
  quantity: number | string;
  toLocation?: string;
}

export interface ExtractionResult {
  remanenteId: string;
  insumoId: string;
  insumoName: string;
  quantityExtracted: string;
  remainingWarehouseStock: string;
  location: string;
  expirationDate: string;
  status: string;
}

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

export interface InsumoItem {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
}

export interface CreateInsumoDTO {
  name: string;
  unitOfMeasure: string;
  initialWarehouseStock?: string;
}

export class StockService {
  private static mockWarehouseStocks: Record<string, { name: string; stock: number; unit: string }> = {
    'ins-1': { name: 'Queso Mozzarella', stock: 15.5, unit: 'KG' },
    'ins-2': { name: 'Salsa Pomodoro', stock: 25.0, unit: 'L' },
    'ins-3': { name: 'Masa de Pizza', stock: 40.0, unit: 'UNITS' },
  };

  public static async createInsumo(data: CreateInsumoDTO): Promise<InsumoItem> {
    return apiRequest<InsumoItem>('/stock/insumos', { method: 'POST', body: data });
  }

  public static async getInsumos(): Promise<InsumoItem[]> {
    try {
      return await apiRequest<InsumoItem[]>('/stock/insumos');
    } catch {
      return this.getAvailableInsumos().map((item) => ({
        id: item.id,
        name: item.name,
        unitOfMeasure: item.unit,
        warehouseStock: item.stock.toString(),
      }));
    }
  }

  public static async recordExtraction(data: ExtractionRequest): Promise<ExtractionResult> {
    try {
      return await apiRequest<ExtractionResult>('/stock/extraction', { method: 'POST', body: data });
    } catch (err) {
      console.error('[StockService] Error en llamada HTTP recordExtraction, usando modo demo:', err);
    }

    const item = this.mockWarehouseStocks[data.insumoId] || {
      name: 'Insumo Cocina',
      stock: 10.0,
      unit: 'KG',
    };
    // Aritmetica Decimal de Alta Precision (Guard 17) via el VO compartido shared/domain/DecimalQuantity
    // — en vez de `Math.max(0, item.stock - qty)` con primitivos de punto flotante.
    const nextStock = new DecimalQuantity(item.stock).subtractClamped(data.quantity.toString());
    item.stock = Number(nextStock.toFixed(3));

    const now = new Date();
    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return {
      remanenteId: `rem-${Date.now()}`,
      insumoId: data.insumoId,
      insumoName: item.name,
      quantityExtracted: new DecimalQuantity(data.quantity.toString()).toFixed(3),
      remainingWarehouseStock: nextStock.toFixed(3),
      location: data.toLocation || 'KITCHEN_FRIDGE',
      expirationDate: expirationDate.toISOString(),
      status: 'ACTIVE',
    };
  }

  public static async getMovementHistory(filters: MovementHistoryFilters = {}): Promise<StockMovementHistoryItem[]> {
    const params = new URLSearchParams();
    if (filters.insumoId) params.set('insumoId', filters.insumoId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    const query = params.toString();

    return apiRequest<StockMovementHistoryItem[]>(`/stock/movements${query ? `?${query}` : ''}`);
  }

  public static getAvailableInsumos() {
    return [
      { id: 'ins-1', name: 'Queso Mozzarella', stock: 15.5, unit: 'KG' },
      { id: 'ins-2', name: 'Salsa Pomodoro', stock: 25.0, unit: 'L' },
      { id: 'ins-3', name: 'Masa de Pizza', stock: 40.0, unit: 'UNITS' },
    ];
  }
}
