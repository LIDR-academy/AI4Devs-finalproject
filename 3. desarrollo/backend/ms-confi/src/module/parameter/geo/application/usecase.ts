import { Injectable, Inject } from '@nestjs/common';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from "../domain/entity";
import { GeoPort, GEO_REPOSITORY } from "../domain/port";
import { ProvinciaValue, CantonValue, ParroquiaValue } from "../domain/value";

/**
 * UseCase para el módulo de catálogo geográfico
 * Implementa toda la lógica de negocio del módulo
 */
@Injectable()
export class GeoUseCase implements GeoPort {

  constructor(
    @Inject(GEO_REPOSITORY)
    private readonly repository: GeoPort
  ) {}

  // ========== LECTURAS - PROVINCIAS ==========

  async findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]> {
    try {
      return await this.repository.findAllProvincias(active);
    } catch (error) {
      throw error;
    }
  }

  // ========== LECTURAS - CANTONES ==========

  async findCantonesByProvincia(proviCodProv: string, active?: boolean): Promise<CantonEntity[]> {
    try {
      return await this.repository.findCantonesByProvincia(proviCodProv, active);
    } catch (error) {
      throw error;
    }
  }

  // ========== LECTURAS - PARROQUIAS ==========

  async findParroquiasByCanton(proviCodProv: string, cantoCodCant: string, active?: boolean): Promise<ParroquiaEntity[]> {
    try {
      return await this.repository.findParroquiasByCanton(proviCodProv, cantoCodCant, active);
    } catch (error) {
      throw error;
    }
  }

  async searchParroquias(query: string, limit: number): Promise<ParroquiaEntity[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      const limitValue = limit && limit > 0 ? Math.min(limit, 50) : 20; // Máximo 50, por defecto 20
      return await this.repository.searchParroquias(query.trim(), limitValue);
    } catch (error) {
      throw error;
    }
  }

  // ========== ADMIN - PROVINCIAS ==========

  async createProvincia(data: ProvinciaEntity): Promise<ProvinciaEntity | null> {
    try {
      const value = new ProvinciaValue(data).toJson();
      const created = await this.repository.createProvincia(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async updateProvincia(id: number, data: ProvinciaEntity): Promise<ProvinciaEntity | null> {
    try {
      // Verificar que existe
      const existing = await this.repository.findAllProvincias();
      const found = existing.find(p => p.provi_cod_provi === id);
      if (!found) {
        throw new Error(`Provincia con id ${id} no encontrada`);
      }

      const value = new ProvinciaValue(data, id).toJson();
      const updated = await this.repository.updateProvincia(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteProvincia(id: number): Promise<ProvinciaEntity | null> {
    try {
      // Verificar que existe
      const existing = await this.repository.findAllProvincias();
      const found = existing.find(p => p.provi_cod_provi === id);
      if (!found) {
        throw new Error(`Provincia con id ${id} no encontrada`);
      }

      const deleted = await this.repository.deleteProvincia(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ========== ADMIN - CANTONES ==========

  async createCanton(data: CantonEntity): Promise<CantonEntity | null> {
    try {
      const value = new CantonValue(data).toJson();
      const created = await this.repository.createCanton(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async updateCanton(id: number, data: CantonEntity): Promise<CantonEntity | null> {
    try {
      // Verificar que existe (buscar en todas las provincias)
      const provincias = await this.repository.findAllProvincias();
      let found = false;
      for (const prov of provincias) {
        const cantones = await this.repository.findCantonesByProvincia(prov.provi_cod_prov);
        if (cantones.find(c => c.canto_cod_canto === id)) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Cantón con id ${id} no encontrado`);
      }

      const value = new CantonValue(data, id).toJson();
      const updated = await this.repository.updateCanton(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteCanton(id: number): Promise<CantonEntity | null> {
    try {
      // Verificar que existe
      const provincias = await this.repository.findAllProvincias();
      let found = false;
      for (const prov of provincias) {
        const cantones = await this.repository.findCantonesByProvincia(prov.provi_cod_prov);
        if (cantones.find(c => c.canto_cod_canto === id)) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Cantón con id ${id} no encontrado`);
      }

      const deleted = await this.repository.deleteCanton(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ========== ADMIN - PARROQUIAS ==========

  async createParroquia(data: ParroquiaEntity): Promise<ParroquiaEntity | null> {
    try {
      const value = new ParroquiaValue(data).toJson();
      const created = await this.repository.createParroquia(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async updateParroquia(id: number, data: ParroquiaEntity): Promise<ParroquiaEntity | null> {
    try {
      // Verificar que existe (buscar en todas las provincias/cantones)
      const provincias = await this.repository.findAllProvincias();
      let found = false;
      for (const prov of provincias) {
        const cantones = await this.repository.findCantonesByProvincia(prov.provi_cod_prov);
        for (const cant of cantones) {
          const parroquias = await this.repository.findParroquiasByCanton(prov.provi_cod_prov, cant.canto_cod_cant);
          if (parroquias.find(p => p.parro_cod_parro === id)) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        throw new Error(`Parroquia con id ${id} no encontrada`);
      }

      const value = new ParroquiaValue(data, id).toJson();
      const updated = await this.repository.updateParroquia(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteParroquia(id: number): Promise<ParroquiaEntity | null> {
    try {
      // Verificar que existe
      const provincias = await this.repository.findAllProvincias();
      let found = false;
      for (const prov of provincias) {
        const cantones = await this.repository.findCantonesByProvincia(prov.provi_cod_prov);
        for (const cant of cantones) {
          const parroquias = await this.repository.findParroquiasByCanton(prov.provi_cod_prov, cant.canto_cod_cant);
          if (parroquias.find(p => p.parro_cod_parro === id)) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        throw new Error(`Parroquia con id ${id} no encontrada`);
      }

      const deleted = await this.repository.deleteParroquia(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

