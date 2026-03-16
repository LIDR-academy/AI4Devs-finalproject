import { Injectable } from "@nestjs/common";
import { CldomEnum } from "../enum/enum";
import { CldomUseCase } from "../../application/usecase";
import { CldomParams, CldomEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { CldomDBRepository } from "../repository/repository";

@Injectable()
export class CldomService {
  public usecase: CldomUseCase;

  constructor(private readonly repository: CldomDBRepository) {
    this.usecase = new CldomUseCase(this.repository);
  }

  async findAll(params?: CldomParams): Promise<ApiResponses<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CldomEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<CldomEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CldomEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CldomEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CldomEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Domicilio no encontrado para este cliente' }, 404);
      }
      return ResponseUtil.response<CldomEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: CldomEntity): Promise<ApiResponse<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CldomEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<CldomEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: CldomEntity): Promise<ApiResponse<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CldomEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CldomEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CldomEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CldomEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

