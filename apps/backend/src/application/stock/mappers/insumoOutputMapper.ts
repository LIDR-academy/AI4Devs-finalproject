import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';

// No exportado a propósito: nada fuera de este archivo la importa por nombre — solo se usa
// como el tipo del array InsumoOutputDTO.stockByLocation (esa sí exportada, esta no lo necesita).
interface StockByLocationDTO {
  storageLocationId: string;
  storageLocationName: string;
  quantity: string;
}

export interface InsumoOutputDTO {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
  stockByLocation: StockByLocationDTO[];
  unitCost: string | null;
  barcode: string | null;
}

/**
 * Mapeo compartido `Insumo` (dominio) -> `InsumoOutputDTO` (respuesta HTTP), usado por
 * CreateInsumoUseCase, ListInsumosUseCase y FindInsumoByBarcodeUseCase (TK-119) — evita
 * repetir el ensamblado de campos en cada caso de uso que expone un insumo.
 */
export function mapInsumoToOutputDTO(
  insumo: Insumo,
  resolveLocationName: (storageLocationId: string) => string
): InsumoOutputDTO {
  const stockByLocation: StockByLocationDTO[] = insumo.stockLines.map((line) => ({
    storageLocationId: line.storageLocationId,
    storageLocationName: resolveLocationName(line.storageLocationId),
    quantity: line.quantity.toString(),
  }));

  return {
    id: insumo.id,
    name: insumo.name,
    unitOfMeasure: insumo.unitOfMeasure,
    warehouseStock: insumo.warehouseStock.toString(),
    stockByLocation,
    unitCost: insumo.unitCost ? insumo.unitCost.toDecimal().toFixed(2) : null,
    barcode: insumo.barcode ?? null,
  };
}

/**
 * Mapa id -> nombre de sub-sector, para resolver `storageLocationName` en
 * `mapInsumoToOutputDTO`. Compartido entre ListInsumosUseCase y
 * FindInsumoByBarcodeUseCase (TK-119) — sin repositorio inyectado, devuelve un mapa
 * vacío y el llamador cae al id crudo (mismo criterio ya usado en ambos casos de uso).
 */
export async function buildLocationNameMap(
  locationRepository?: IStorageLocationRepository
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!locationRepository) {
    return map;
  }
  const locations = await locationRepository.findAllLocations();
  for (const loc of locations) {
    map.set(loc.id, loc.name);
  }
  return map;
}
