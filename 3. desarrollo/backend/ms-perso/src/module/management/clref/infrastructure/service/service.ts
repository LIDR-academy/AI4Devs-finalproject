import { Injectable } from "@nestjs/common";
import { ClrefEnum } from "../enum/enum";
import { ClrefUseCase } from "../../application/usecase";
import { ClrefParams, ClrefEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClrefDBRepository } from "../repository/repository";

@Injectable()
export class ClrefService {
  public usecase: ClrefUseCase;

  constructor(private readonly repository: ClrefDBRepository) {
    this.usecase = new ClrefUseCase(this.repository);
  }

  async findAll(params?: ClrefParams): Promise<ApiResponses<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClrefEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClrefEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClrefEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrefEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponses<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClrefEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found.length === 0) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontraron referencias para este cliente' }, 404);
      }
      return ResponseUtil.responses<ClrefEntity>(found, found.length, { page: 1, pageSize: found.length }, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClrefEntity): Promise<ApiResponse<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClrefEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClrefEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClrefEntity): Promise<ApiResponse<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClrefEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrefEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClrefEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClrefEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrefEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

