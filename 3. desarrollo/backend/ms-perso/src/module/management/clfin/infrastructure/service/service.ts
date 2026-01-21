import { Injectable } from "@nestjs/common";
import { ClfinEnum } from "../enum/enum";
import { ClfinUseCase } from "../../application/usecase";
import { ClfinParams, ClfinEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClfinDBRepository } from "../repository/repository";

@Injectable()
export class ClfinService {
  public usecase: ClfinUseCase;

  constructor(private readonly repository: ClfinDBRepository) {
    this.usecase = new ClfinUseCase(this.repository);
  }

  async findAll(params?: ClfinParams): Promise<ApiResponses<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClfinEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClfinEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClfinEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClfinEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponses<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClfinEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found.length === 0) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró información financiera para este cliente' }, 404);
      }
      return ResponseUtil.responses<ClfinEntity>(found, found.length, { page: 1, pageSize: found.length }, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienIdAndTipo(clienId: number, tipoFinanciero: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClfinEnum.title, 
        method: 'findByClienIdAndTipo' 
      });
      const found = await this.usecase.findByClienIdAndTipo(clienId, tipoFinanciero);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró información financiera de este tipo para el cliente' }, 404);
      }
      return ResponseUtil.response<ClfinEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClfinEntity): Promise<ApiResponse<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClfinEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClfinEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClfinEntity): Promise<ApiResponse<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClfinEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClfinEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClfinEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClfinEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

