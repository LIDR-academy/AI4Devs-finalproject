import { Injectable } from "@nestjs/common";
import { CiiuEnum } from "../enum/enum";
import { CiiuUseCase } from "../../application/usecase";
import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { CiiuDBRepository } from "../repository/repository";

@Injectable()
export class CiiuService {
  public usecase: CiiuUseCase;

  constructor(private readonly repository: CiiuDBRepository) {
    this.usecase = new CiiuUseCase(this.repository);
  }

  // ==================== SECCIONES ====================

  async findAllSecciones(): Promise<ApiResponses<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cisec, 
        method: 'findAllSecciones' 
      });
      const listed = await this.usecase.findAllSecciones();
      return ResponseUtil.responses<SeccionEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findSeccionById(id: number): Promise<ApiResponse<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cisec, 
        method: 'findSeccionById' 
      });
      const found = await this.usecase.findSeccionById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SeccionEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async findSeccionByAbr(abr: string): Promise<ApiResponse<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cisec, 
        method: 'findSeccionByAbr' 
      });
      const found = await this.usecase.findSeccionByAbr(abr);
      if (found === null) return ResponseUtil.detail({ ...detail, message: 'Sección no encontrada' }, 404);
      return ResponseUtil.response<SeccionEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createSeccion(data: SeccionEntity): Promise<ApiResponse<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.cisec, 
        method: 'createSeccion' 
      });
      const created = await this.usecase.createSeccion(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<SeccionEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateSeccion(id: number, data: SeccionEntity): Promise<ApiResponse<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.cisec, 
        method: 'updateSeccion' 
      });
      const updated = await this.usecase.updateSeccion(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SeccionEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSeccion(id: number): Promise<ApiResponse<SeccionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.cisec, 
        method: 'deleteSeccion' 
      });
      const deleted = await this.usecase.deleteSeccion(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SeccionEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== DIVISIONES ====================

  async findAllDivisiones(): Promise<ApiResponses<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cidiv, 
        method: 'findAllDivisiones' 
      });
      const listed = await this.usecase.findAllDivisiones();
      return ResponseUtil.responses<DivisionEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findDivisionesBySeccion(cisecId: number): Promise<ApiResponses<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cidiv, 
        method: 'findDivisionesBySeccion' 
      });
      const listed = await this.usecase.findDivisionesBySeccion(cisecId);
      return ResponseUtil.responses<DivisionEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findDivisionById(id: number): Promise<ApiResponse<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cidiv, 
        method: 'findDivisionById' 
      });
      const found = await this.usecase.findDivisionById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<DivisionEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createDivision(data: DivisionEntity): Promise<ApiResponse<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.cidiv, 
        method: 'createDivision' 
      });
      const created = await this.usecase.createDivision(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<DivisionEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateDivision(id: number, data: DivisionEntity): Promise<ApiResponse<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.cidiv, 
        method: 'updateDivision' 
      });
      const updated = await this.usecase.updateDivision(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<DivisionEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteDivision(id: number): Promise<ApiResponse<DivisionEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.cidiv, 
        method: 'deleteDivision' 
      });
      const deleted = await this.usecase.deleteDivision(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<DivisionEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== GRUPOS ====================

  async findAllGrupos(): Promise<ApiResponses<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cigru, 
        method: 'findAllGrupos' 
      });
      const listed = await this.usecase.findAllGrupos();
      return ResponseUtil.responses<GrupoEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findGruposByDivision(cidivId: number): Promise<ApiResponses<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cigru, 
        method: 'findGruposByDivision' 
      });
      const listed = await this.usecase.findGruposByDivision(cidivId);
      return ResponseUtil.responses<GrupoEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findGrupoById(id: number): Promise<ApiResponse<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cigru, 
        method: 'findGrupoById' 
      });
      const found = await this.usecase.findGrupoById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<GrupoEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createGrupo(data: GrupoEntity): Promise<ApiResponse<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.cigru, 
        method: 'createGrupo' 
      });
      const created = await this.usecase.createGrupo(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<GrupoEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateGrupo(id: number, data: GrupoEntity): Promise<ApiResponse<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.cigru, 
        method: 'updateGrupo' 
      });
      const updated = await this.usecase.updateGrupo(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<GrupoEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteGrupo(id: number): Promise<ApiResponse<GrupoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.cigru, 
        method: 'deleteGrupo' 
      });
      const deleted = await this.usecase.deleteGrupo(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<GrupoEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== CLASES ====================

  async findAllClases(): Promise<ApiResponses<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cicla, 
        method: 'findAllClases' 
      });
      const listed = await this.usecase.findAllClases();
      return ResponseUtil.responses<ClaseEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findClasesByGrupo(cigruId: number): Promise<ApiResponses<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cicla, 
        method: 'findClasesByGrupo' 
      });
      const listed = await this.usecase.findClasesByGrupo(cigruId);
      return ResponseUtil.responses<ClaseEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findClaseById(id: number): Promise<ApiResponse<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cicla, 
        method: 'findClaseById' 
      });
      const found = await this.usecase.findClaseById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ClaseEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createClase(data: ClaseEntity): Promise<ApiResponse<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.cicla, 
        method: 'createClase' 
      });
      const created = await this.usecase.createClase(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<ClaseEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateClase(id: number, data: ClaseEntity): Promise<ApiResponse<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.cicla, 
        method: 'updateClase' 
      });
      const updated = await this.usecase.updateClase(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ClaseEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteClase(id: number): Promise<ApiResponse<ClaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.cicla, 
        method: 'deleteClase' 
      });
      const deleted = await this.usecase.deleteClase(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ClaseEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== SUBCLASES ====================

  async findAllSubclases(): Promise<ApiResponses<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cisub, 
        method: 'findAllSubclases' 
      });
      const listed = await this.usecase.findAllSubclases();
      return ResponseUtil.responses<SubclaseEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findSubclasesByClase(ciclaId: number): Promise<ApiResponses<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.cisub, 
        method: 'findSubclasesByClase' 
      });
      const listed = await this.usecase.findSubclasesByClase(ciclaId);
      return ResponseUtil.responses<SubclaseEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findSubclaseById(id: number): Promise<ApiResponse<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.cisub, 
        method: 'findSubclaseById' 
      });
      const found = await this.usecase.findSubclaseById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SubclaseEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createSubclase(data: SubclaseEntity): Promise<ApiResponse<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.cisub, 
        method: 'createSubclase' 
      });
      const created = await this.usecase.createSubclase(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<SubclaseEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateSubclase(id: number, data: SubclaseEntity): Promise<ApiResponse<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.cisub, 
        method: 'updateSubclase' 
      });
      const updated = await this.usecase.updateSubclase(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SubclaseEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSubclase(id: number): Promise<ApiResponse<SubclaseEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.cisub, 
        method: 'deleteSubclase' 
      });
      const deleted = await this.usecase.deleteSubclase(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SubclaseEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== ACTIVIDADES ====================

  async findAllActividades(): Promise<ApiResponses<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.ciact, 
        method: 'findAllActividades' 
      });
      const listed = await this.usecase.findAllActividades();
      return ResponseUtil.responses<ActividadEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findActividadesBySubclase(cisubId: number): Promise<ApiResponses<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.ciact, 
        method: 'findActividadesBySubclase' 
      });
      const listed = await this.usecase.findActividadesBySubclase(cisubId);
      return ResponseUtil.responses<ActividadEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findActividadById(id: number): Promise<ApiResponse<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.ciact, 
        method: 'findActividadById' 
      });
      const found = await this.usecase.findActividadById(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ActividadEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async createActividad(data: ActividadEntity): Promise<ApiResponse<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CiiuEnum.title.ciact, 
        method: 'createActividad' 
      });
      const created = await this.usecase.createActividad(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<ActividadEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateActividad(id: number, data: ActividadEntity): Promise<ApiResponse<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CiiuEnum.title.ciact, 
        method: 'updateActividad' 
      });
      const updated = await this.usecase.updateActividad(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ActividadEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteActividad(id: number): Promise<ApiResponse<ActividadEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CiiuEnum.title.ciact, 
        method: 'deleteActividad' 
      });
      const deleted = await this.usecase.deleteActividad(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ActividadEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== BÚSQUEDA Y SELECTOR ====================

  async searchActividades(query: string, limit?: number): Promise<ApiResponses<ActividadCompletaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CiiuEnum.title.ciact, 
        method: 'searchActividades' 
      });
      const results = await this.usecase.searchActividades(query, limit);
      return ResponseUtil.responses<ActividadCompletaEntity>(results, results.length, { page: 1, pageSize: results.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findActividadCompleta(id: number): Promise<ApiResponse<ActividadCompletaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.ciact, 
        method: 'findActividadCompleta' 
      });
      const found = await this.usecase.findActividadCompleta(id);
      if (found === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ActividadCompletaEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async findActividadCompletaByAbr(abr: string): Promise<ApiResponse<ActividadCompletaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CiiuEnum.title.ciact, 
        method: 'findActividadCompletaByAbr' 
      });
      const found = await this.usecase.findActividadCompletaByAbr(abr);
      if (found === null) return ResponseUtil.detail({ ...detail, message: 'Actividad no encontrada' }, 404);
      return ResponseUtil.response<ActividadCompletaEntity>(found, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ==================== ÁRBOL ====================

  async findArbolCompleto(): Promise<ApiResponses<ArbolCiiuEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: 'Árbol CIIU', 
        method: 'findArbolCompleto' 
      });
      const arbol = await this.usecase.findArbolCompleto();
      return ResponseUtil.responses<ArbolCiiuEntity>(arbol, arbol.length, { page: 1, pageSize: arbol.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findHijosByNivel(nivel: number, parentId: number): Promise<ApiResponses<ArbolCiiuEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: 'Hijos CIIU', 
        method: 'findHijosByNivel' 
      });
      const hijos = await this.usecase.findHijosByNivel(nivel, parentId);
      return ResponseUtil.responses<ArbolCiiuEntity>(hijos, hijos.length, { page: 1, pageSize: hijos.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }
}

