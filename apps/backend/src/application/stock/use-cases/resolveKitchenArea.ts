import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation } from '../../../domain/stock/entities/StorageLocation.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

const LEGACY_KITCHEN_LITERALS = new Set(['KITCHEN_FRIDGE', 'KITCHEN_PREP', 'KITCHEN_LINE']);

/**
 * US-026: valida que `value` corresponde a un área de cocina del catálogo
 * (`StorageLocation type = KITCHEN`) activa y devuelve `{ id, name }`.
 *
 * Compatibilidad: si no hay repositorio inyectado (tests de unidad puros) o si se
 * recibe uno de los literales legados (`KITCHEN_FRIDGE`…), se devuelve un área
 * sintética sin FK real — el `Remanente` guarda solo el literal en `location` y
 * `storageLocationId` queda indefinido, igual que un remanente histórico.
 */
export async function resolveKitchenArea(
  locationRepository: IStorageLocationRepository | undefined,
  value: string | undefined
): Promise<{ id?: string; name: string }> {
  const raw = value ?? 'KITCHEN_FRIDGE';

  if (!locationRepository || LEGACY_KITCHEN_LITERALS.has(raw)) {
    return { name: raw };
  }

  const area: StorageLocation | null = await locationRepository.findLocationById(raw);
  if (!area || area.type !== 'KITCHEN' || !area.isActive) {
    throw new EntityNotFoundException('Área de cocina', raw);
  }

  return { id: area.id, name: area.name };
}
