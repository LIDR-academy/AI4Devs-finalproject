import { Injectable } from "@nestjs/common";
import { GeoEnum } from "../enum/enum";
import { GeoUseCase } from "../../application/usecase";
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { GeoDBRepository } from "../repository/repository";

@Injectable()
export class GeoService {
  public usecase: GeoUseCase;

  constructor(private readonly repository: GeoDBRepository) {
    this.usecase = new GeoUseCase(this.repository);
  }

  // ========== PROVINCIAS ==========

  async findAllProvincias(active?: boolean): Promise<ApiResponses<ProvinciaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: GeoEnum.title.provi, 
        method: 'findAllProvincias' 
      });
      const listed = await this.usecase.findAllProvincias(active);
      // Devolver array vacío en lugar de 404 cuando no hay datos
      return ResponseUtil.responses<ProvinciaEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async createProvincia(data: ProvinciaEntity): Promise<ApiResponse<ProvinciaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: GeoEnum.title.provi, 
        method: 'createProvincia' 
      });
      const created = await this.usecase.createProvincia(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<ProvinciaEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateProvincia(id: number, data: ProvinciaEntity): Promise<ApiResponse<ProvinciaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: GeoEnum.title.provi, 
        method: 'updateProvincia' 
      });
      const updated = await this.usecase.updateProvincia(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ProvinciaEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteProvincia(id: number): Promise<ApiResponse<ProvinciaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: GeoEnum.title.provi, 
        method: 'deleteProvincia' 
      });
      const deleted = await this.usecase.deleteProvincia(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ProvinciaEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ========== CANTONES ==========

  async findCantonesByProvincia(proviCodProv: string, active?: boolean): Promise<ApiResponses<CantonEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: GeoEnum.title.canto, 
        method: 'findCantonesByProvincia' 
      });
      const listed = await this.usecase.findCantonesByProvincia(proviCodProv, active);
      // Devolver array vacío en lugar de 404 cuando no hay datos
      return ResponseUtil.responses<CantonEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async createCanton(data: CantonEntity): Promise<ApiResponse<CantonEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: GeoEnum.title.canto, 
        method: 'createCanton' 
      });
      const created = await this.usecase.createCanton(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<CantonEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateCanton(id: number, data: CantonEntity): Promise<ApiResponse<CantonEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: GeoEnum.title.canto, 
        method: 'updateCanton' 
      });
      const updated = await this.usecase.updateCanton(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<CantonEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCanton(id: number): Promise<ApiResponse<CantonEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: GeoEnum.title.canto, 
        method: 'deleteCanton' 
      });
      const deleted = await this.usecase.deleteCanton(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<CantonEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ========== PARROQUIAS ==========

  async findParroquiasByCanton(proviCodProv: string, cantoCodCant: string, active?: boolean): Promise<ApiResponses<ParroquiaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: GeoEnum.title.parro, 
        method: 'findParroquiasByCanton' 
      });
      const listed = await this.usecase.findParroquiasByCanton(proviCodProv, cantoCodCant, active);
      // Devolver array vacío en lugar de 404 cuando no hay datos
      return ResponseUtil.responses<ParroquiaEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async searchParroquias(query: string, limit: number): Promise<ApiResponses<ParroquiaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: GeoEnum.title.parro, 
        method: 'searchParroquias' 
      });
      const listed = await this.usecase.searchParroquias(query, limit);
      // Devolver array vacío en lugar de 404 cuando no hay datos
      return ResponseUtil.responses<ParroquiaEntity>(listed, listed.length, { page: 1, pageSize: listed.length || 1, all: '*' }, detail);
    } catch (error) {
      throw error;
    }
  }

  async createParroquia(data: ParroquiaEntity): Promise<ApiResponse<ParroquiaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: GeoEnum.title.parro, 
        method: 'createParroquia' 
      });
      const created = await this.usecase.createParroquia(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<ParroquiaEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updateParroquia(id: number, data: ParroquiaEntity): Promise<ApiResponse<ParroquiaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: GeoEnum.title.parro, 
        method: 'updateParroquia' 
      });
      const updated = await this.usecase.updateParroquia(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ParroquiaEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteParroquia(id: number): Promise<ApiResponse<ParroquiaEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: GeoEnum.title.parro, 
        method: 'deleteParroquia' 
      });
      const deleted = await this.usecase.deleteParroquia(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<ParroquiaEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

