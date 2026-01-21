import { Injectable } from "@nestjs/common";
import { ClecoEnum } from "../enum/enum";
import { ClecoUseCase } from "../../application/usecase";
import { ClecoParams, ClecoEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClecoDBRepository } from "../repository/repository";

@Injectable()
export class ClecoService {
  public usecase: ClecoUseCase;

  constructor(private readonly repository: ClecoDBRepository) {
    this.usecase = new ClecoUseCase(this.repository);
  }

  async findAll(params?: ClecoParams): Promise<ApiResponses<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClecoEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClecoEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClecoEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClecoEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClecoEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Actividad económica no encontrada para este cliente' }, 404);
      }
      return ResponseUtil.response<ClecoEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClecoEntity): Promise<ApiResponse<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClecoEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClecoEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClecoEntity): Promise<ApiResponse<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClecoEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClecoEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClecoEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClecoEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

