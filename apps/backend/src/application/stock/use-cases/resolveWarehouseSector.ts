import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation } from '../../../domain/stock/entities/StorageLocation.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

/**
 * US-025: valida que `storageLocationId` corresponda a un sub-sector de bodega
 * (`type = WAREHOUSE`) activo y lo devuelve. Si no se inyecta un repositorio de
 * ubicaciones (casos de uso legados / tests de unidad puros) devuelve un sector
 * sintético sin validar, de forma que el par `(insumo, sector)` siga siendo
 * consistente aunque la validación viva en la capa HTTP.
 */
export async function resolveWarehouseSector(
  locationRepository: IStorageLocationRepository | undefined,
  storageLocationId: string
): Promise<{ id: string; name: string }> {
  if (!locationRepository) {
    return { id: storageLocationId, name: storageLocationId };
  }

  const location: StorageLocation | null = await locationRepository.findLocationById(storageLocationId);
  if (!location || location.type !== 'WAREHOUSE') {
    throw new EntityNotFoundException('Sub-sector de bodega', storageLocationId);
  }

  return { id: location.id, name: location.name };
}
