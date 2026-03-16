import { Injectable } from "@nestjs/common";
import { ClrepEnum } from "../enum/enum";
import { ClrepUseCase } from "../../application/usecase";
import { ClrepParams, ClrepEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClrepDBRepository } from "../repository/repository";

@Injectable()
export class ClrepService {
  public usecase: ClrepUseCase;

  constructor(private readonly repository: ClrepDBRepository) {
    this.usecase = new ClrepUseCase(this.repository);
  }

  async findAll(params?: ClrepParams): Promise<ApiResponses<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClrepEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClrepEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClrepEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrepEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClrepEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Representante no encontrado para este cliente' }, 404);
      }
      return ResponseUtil.response<ClrepEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClrepEntity): Promise<ApiResponse<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClrepEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClrepEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClrepEntity): Promise<ApiResponse<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClrepEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrepEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClrepEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrepEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

