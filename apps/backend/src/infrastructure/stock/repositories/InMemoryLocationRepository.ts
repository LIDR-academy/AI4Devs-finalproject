import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation } from '../../../domain/stock/entities/StorageLocation.js';

export class InMemoryLocationRepository implements IStorageLocationRepository {
  private locations: Map<string, StorageLocation> = new Map();

  constructor() {
    // Seed default locations
    const locs: StorageLocation[] = [
      new StorageLocation({ id: 'loc-1', name: 'MAIN_WAREHOUSE', type: 'WAREHOUSE', description: 'Bodega Principal Secos', isActive: true }),
      new StorageLocation({ id: 'loc-2', name: 'KITCHEN_FRIDGE', type: 'KITCHEN', description: 'Refrigerador Principal Cocina', isActive: true }),
      new StorageLocation({ id: 'loc-3', name: 'KITCHEN_PREP', type: 'KITCHEN', description: 'Mesa de Preparación', isActive: true }),
      new StorageLocation({ id: 'loc-4', name: 'KITCHEN_LINE', type: 'KITCHEN', description: 'Línea de Servicio', isActive: true }),
      new StorageLocation({ id: 'loc-5', name: 'WASTE_BIN', type: 'KITCHEN', description: 'Contenedor de Mermas/Descarte', isActive: true }),
    ];
    locs.forEach((l) => this.locations.set(l.id, l));
  }

  async findAllLocations(): Promise<StorageLocation[]> {
    return Array.from(this.locations.values());
  }

  async findLocationById(id: string): Promise<StorageLocation | null> {
    return this.locations.get(id) || null;
  }

  async saveLocation(location: StorageLocation): Promise<void> {
    this.locations.set(location.id, location);
  }

  async deleteLocation(id: string): Promise<void> {
    this.locations.delete(id);
  }
}
