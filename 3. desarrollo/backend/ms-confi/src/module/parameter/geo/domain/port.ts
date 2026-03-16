import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from "./entity";

/**
 * Puerto (interfaz) para el repositorio de catálogo geográfico
 */
export interface GeoPort {
  // Lecturas - Provincias
  findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]>;
  
  // Lecturas - Cantones
  findCantonesByProvincia(proviCodProv: string, active?: boolean): Promise<CantonEntity[]>;
  
  // Lecturas - Parroquias
  findParroquiasByCanton(proviCodProv: string, cantoCodCant: string, active?: boolean): Promise<ParroquiaEntity[]>;
  searchParroquias(query: string, limit: number): Promise<ParroquiaEntity[]>;
  
  // Admin - Provincias
  createProvincia(data: ProvinciaEntity): Promise<ProvinciaEntity | null>;
  updateProvincia(id: number, data: ProvinciaEntity): Promise<ProvinciaEntity | null>;
  deleteProvincia(id: number): Promise<ProvinciaEntity | null>;  // Soft delete
  
  // Admin - Cantones
  createCanton(data: CantonEntity): Promise<CantonEntity | null>;
  updateCanton(id: number, data: CantonEntity): Promise<CantonEntity | null>;
  deleteCanton(id: number): Promise<CantonEntity | null>;  // Soft delete
  
  // Admin - Parroquias
  createParroquia(data: ParroquiaEntity): Promise<ParroquiaEntity | null>;
  updateParroquia(id: number, data: ParroquiaEntity): Promise<ParroquiaEntity | null>;
  deleteParroquia(id: number): Promise<ParroquiaEntity | null>;  // Soft delete
}

/**
 * Token para inyección de dependencias
 */
export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');

