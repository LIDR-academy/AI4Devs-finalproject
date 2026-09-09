import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation } from '../../../domain/stock/entities/StorageLocation.js';

export class InMemoryLocationRepository implements IStorageLocationRepository {
  private locations: Map<string, StorageLocation> = new Map();

  constructor() {
    // Seed default locations
    const locs: StorageLocation[] = [
      // US-025: sector por defecto para existencias migradas desde MAIN_WAREHOUSE
      new StorageLocation({ id: 'loc-seed-unclassified', name: 'Bodega Principal – Sin clasificar', type: 'WAREHOUSE', description: 'Sector por defecto para existencias sin sub-sector asignado', isActive: true }),
      new StorageLocation({ id: 'loc-1', name: 'MAIN_WAREHOUSE', type: 'WAREHOUSE', description: 'Bodega Principal Secos', isActive: true }),
      new StorageLocation({ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', description: 'Estantería de secos y no perecederos', isActive: true }),
      new StorageLocation({ id: 'loc-seed-meat-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', description: 'Refrigerador dedicado a proteínas', isActive: true }),
      new StorageLocation({ id: 'loc-seed-freezer', name: 'Cámara de Congelados', type: 'WAREHOUSE', description: 'Cámara de congelación', isActive: true }),
      new StorageLocation({ id: 'loc-2', name: 'KITCHEN_FRIDGE', type: 'KITCHEN', description: 'Refrigerador Principal Cocina', isActive: true }),
      new StorageLocation({ id: 'loc-3', name: 'KITCHEN_PREP', type: 'KITCHEN', description: 'Mesa de Preparación', isActive: true }),
      new StorageLocation({ id: 'loc-4', name: 'KITCHEN_LINE', type: 'KITCHEN', description: 'Línea de Servicio', isActive: true }),
      new StorageLocation({ id: 'loc-5', name: 'WASTE_BIN', type: 'KITCHEN', description: 'Contenedor de Mermas/Descarte', isActive: true }),
      // US-026: áreas de cocina del catálogo (mismos id/name que prisma/seed.ts + la migración)
      new StorageLocation({ id: 'loc-seed-kitchen-fridge', name: 'Refrigerador Principal Cocina', type: 'KITCHEN', description: 'Destino de remanentes en línea de fríos', isActive: true }),
      new StorageLocation({ id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', description: 'Mesa de trabajo / mise en place', isActive: true }),
      new StorageLocation({ id: 'loc-seed-kitchen-line', name: 'Línea de Servicio', type: 'KITCHEN', description: 'Línea de emplatado y despacho', isActive: true }),
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
