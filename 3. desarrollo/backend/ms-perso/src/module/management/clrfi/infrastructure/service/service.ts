import { Injectable } from "@nestjs/common";
import { ClrfiEnum } from "../enum/enum";
import { ClrfiUseCase } from "../../application/usecase";
import { ClrfiParams, ClrfiEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClrfiDBRepository } from "../repository/repository";

@Injectable()
export class ClrfiService {
  public usecase: ClrfiUseCase;

  constructor(private readonly repository: ClrfiDBRepository) {
    this.usecase = new ClrfiUseCase(this.repository);
  }

  async findAll(params?: ClrfiParams): Promise<ApiResponses<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClrfiEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClrfiEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClrfiEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrfiEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClrfiEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró residencia fiscal para este cliente' }, 404);
      }
      return ResponseUtil.response<ClrfiEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClrfiEntity): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClrfiEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClrfiEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClrfiEntity): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClrfiEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrfiEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClrfiEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClrfiEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

