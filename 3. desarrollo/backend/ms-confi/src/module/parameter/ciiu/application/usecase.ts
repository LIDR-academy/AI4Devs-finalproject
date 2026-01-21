import { Injectable, Inject } from '@nestjs/common';
import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from "../domain/entity";
import { CiiuPort, CIIU_REPOSITORY } from "../domain/port";
import {
  SeccionValue, DivisionValue, GrupoValue,
  ClaseValue, SubclaseValue, ActividadValue
} from "../domain/value";

/**
 * UseCase para el módulo de catálogo CIIU
 * Implementa toda la lógica de negocio del módulo
 */
@Injectable()
export class CiiuUseCase implements CiiuPort {

  constructor(
    @Inject(CIIU_REPOSITORY)
    private readonly repository: CiiuPort
  ) {}

  // ==================== SECCIÓN (Nivel 1) ====================

  async createSeccion(data: SeccionEntity): Promise<SeccionEntity | null> {
    try {
      const value = new SeccionValue(data).toJson();
      const created = await this.repository.createSeccion(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllSecciones(): Promise<SeccionEntity[]> {
    try {
      return await this.repository.findAllSecciones();
    } catch (error) {
      throw error;
    }
  }

  async findSeccionById(id: number): Promise<SeccionEntity | null> {
    try {
      return await this.repository.findSeccionById(id);
    } catch (error) {
      throw error;
    }
  }

  async findSeccionByAbr(abr: string): Promise<SeccionEntity | null> {
    try {
      return await this.repository.findSeccionByAbr(abr);
    } catch (error) {
      throw error;
    }
  }

  async updateSeccion(id: number, data: SeccionEntity): Promise<SeccionEntity | null> {
    try {
      const existing = await this.repository.findSeccionById(id);
      if (!existing) {
        throw new Error(`Sección con id ${id} no encontrada`);
      }
      const value = new SeccionValue(data, id).toJson();
      const updated = await this.repository.updateSeccion(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteSeccion(id: number): Promise<SeccionEntity | null> {
    try {
      const existing = await this.repository.findSeccionById(id);
      if (!existing) {
        throw new Error(`Sección con id ${id} no encontrada`);
      }
      const deleted = await this.repository.deleteSeccion(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== DIVISIÓN (Nivel 2) ====================

  async createDivision(data: DivisionEntity): Promise<DivisionEntity | null> {
    try {
      const value = new DivisionValue(data).toJson();
      const created = await this.repository.createDivision(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllDivisiones(): Promise<DivisionEntity[]> {
    try {
      return await this.repository.findAllDivisiones();
    } catch (error) {
      throw error;
    }
  }

  async findDivisionesBySeccion(cisecId: number): Promise<DivisionEntity[]> {
    try {
      return await this.repository.findDivisionesBySeccion(cisecId);
    } catch (error) {
      throw error;
    }
  }

  async findDivisionById(id: number): Promise<DivisionEntity | null> {
    try {
      return await this.repository.findDivisionById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateDivision(id: number, data: DivisionEntity): Promise<DivisionEntity | null> {
    try {
      const existing = await this.repository.findDivisionById(id);
      if (!existing) {
        throw new Error(`División con id ${id} no encontrada`);
      }
      const value = new DivisionValue(data, id).toJson();
      const updated = await this.repository.updateDivision(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteDivision(id: number): Promise<DivisionEntity | null> {
    try {
      const existing = await this.repository.findDivisionById(id);
      if (!existing) {
        throw new Error(`División con id ${id} no encontrada`);
      }
      const deleted = await this.repository.deleteDivision(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== GRUPO (Nivel 3) ====================

  async createGrupo(data: GrupoEntity): Promise<GrupoEntity | null> {
    try {
      const value = new GrupoValue(data).toJson();
      const created = await this.repository.createGrupo(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllGrupos(): Promise<GrupoEntity[]> {
    try {
      return await this.repository.findAllGrupos();
    } catch (error) {
      throw error;
    }
  }

  async findGruposByDivision(cidivId: number): Promise<GrupoEntity[]> {
    try {
      return await this.repository.findGruposByDivision(cidivId);
    } catch (error) {
      throw error;
    }
  }

  async findGrupoById(id: number): Promise<GrupoEntity | null> {
    try {
      return await this.repository.findGrupoById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateGrupo(id: number, data: GrupoEntity): Promise<GrupoEntity | null> {
    try {
      const existing = await this.repository.findGrupoById(id);
      if (!existing) {
        throw new Error(`Grupo con id ${id} no encontrado`);
      }
      const value = new GrupoValue(data, id).toJson();
      const updated = await this.repository.updateGrupo(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteGrupo(id: number): Promise<GrupoEntity | null> {
    try {
      const existing = await this.repository.findGrupoById(id);
      if (!existing) {
        throw new Error(`Grupo con id ${id} no encontrado`);
      }
      const deleted = await this.repository.deleteGrupo(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== CLASE (Nivel 4) ====================

  async createClase(data: ClaseEntity): Promise<ClaseEntity | null> {
    try {
      const value = new ClaseValue(data).toJson();
      const created = await this.repository.createClase(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllClases(): Promise<ClaseEntity[]> {
    try {
      return await this.repository.findAllClases();
    } catch (error) {
      throw error;
    }
  }

  async findClasesByGrupo(cigruId: number): Promise<ClaseEntity[]> {
    try {
      return await this.repository.findClasesByGrupo(cigruId);
    } catch (error) {
      throw error;
    }
  }

  async findClaseById(id: number): Promise<ClaseEntity | null> {
    try {
      return await this.repository.findClaseById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateClase(id: number, data: ClaseEntity): Promise<ClaseEntity | null> {
    try {
      const existing = await this.repository.findClaseById(id);
      if (!existing) {
        throw new Error(`Clase con id ${id} no encontrada`);
      }
      const value = new ClaseValue(data, id).toJson();
      const updated = await this.repository.updateClase(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteClase(id: number): Promise<ClaseEntity | null> {
    try {
      const existing = await this.repository.findClaseById(id);
      if (!existing) {
        throw new Error(`Clase con id ${id} no encontrada`);
      }
      const deleted = await this.repository.deleteClase(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== SUBCLASE (Nivel 5) ====================

  async createSubclase(data: SubclaseEntity): Promise<SubclaseEntity | null> {
    try {
      const value = new SubclaseValue(data).toJson();
      const created = await this.repository.createSubclase(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllSubclases(): Promise<SubclaseEntity[]> {
    try {
      return await this.repository.findAllSubclases();
    } catch (error) {
      throw error;
    }
  }

  async findSubclasesByClase(ciclaId: number): Promise<SubclaseEntity[]> {
    try {
      return await this.repository.findSubclasesByClase(ciclaId);
    } catch (error) {
      throw error;
    }
  }

  async findSubclaseById(id: number): Promise<SubclaseEntity | null> {
    try {
      return await this.repository.findSubclaseById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateSubclase(id: number, data: SubclaseEntity): Promise<SubclaseEntity | null> {
    try {
      const existing = await this.repository.findSubclaseById(id);
      if (!existing) {
        throw new Error(`Subclase con id ${id} no encontrada`);
      }
      const value = new SubclaseValue(data, id).toJson();
      const updated = await this.repository.updateSubclase(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteSubclase(id: number): Promise<SubclaseEntity | null> {
    try {
      const existing = await this.repository.findSubclaseById(id);
      if (!existing) {
        throw new Error(`Subclase con id ${id} no encontrada`);
      }
      const deleted = await this.repository.deleteSubclase(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ACTIVIDAD (Nivel 6) ====================

  async createActividad(data: ActividadEntity): Promise<ActividadEntity | null> {
    try {
      const value = new ActividadValue(data).toJson();
      const created = await this.repository.createActividad(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  async findAllActividades(): Promise<ActividadEntity[]> {
    try {
      return await this.repository.findAllActividades();
    } catch (error) {
      throw error;
    }
  }

  async findActividadesBySubclase(cisubId: number): Promise<ActividadEntity[]> {
    try {
      return await this.repository.findActividadesBySubclase(cisubId);
    } catch (error) {
      throw error;
    }
  }

  async findActividadById(id: number): Promise<ActividadEntity | null> {
    try {
      return await this.repository.findActividadById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateActividad(id: number, data: ActividadEntity): Promise<ActividadEntity | null> {
    try {
      const existing = await this.repository.findActividadById(id);
      if (!existing) {
        throw new Error(`Actividad con id ${id} no encontrada`);
      }
      const value = new ActividadValue(data, id).toJson();
      const updated = await this.repository.updateActividad(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteActividad(id: number): Promise<ActividadEntity | null> {
    try {
      const existing = await this.repository.findActividadById(id);
      if (!existing) {
        throw new Error(`Actividad con id ${id} no encontrada`);
      }
      const deleted = await this.repository.deleteActividad(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // ==================== BÚSQUEDA Y SELECTOR ====================

  async searchActividades(query: string, limit?: number): Promise<ActividadCompletaEntity[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      const limitValue = limit && limit > 0 ? Math.min(limit, 50) : 20; // Máximo 50, por defecto 20
      return await this.repository.searchActividades(query.trim(), limitValue);
    } catch (error) {
      throw error;
    }
  }

  async findActividadCompleta(ciactId: number): Promise<ActividadCompletaEntity | null> {
    try {
      return await this.repository.findActividadCompleta(ciactId);
    } catch (error) {
      throw error;
    }
  }

  async findActividadCompletaByAbr(abr: string): Promise<ActividadCompletaEntity | null> {
    try {
      return await this.repository.findActividadCompletaByAbr(abr);
    } catch (error) {
      throw error;
    }
  }

  // ==================== ÁRBOL JERÁRQUICO ====================

  async findArbolCompleto(): Promise<ArbolCiiuEntity[]> {
    try {
      return await this.repository.findArbolCompleto();
    } catch (error) {
      throw error;
    }
  }

  async findHijosByNivel(nivel: number, parentId: number): Promise<ArbolCiiuEntity[]> {
    try {
      return await this.repository.findHijosByNivel(nivel, parentId);
    } catch (error) {
      throw error;
    }
  }
}

