import { Injectable } from "@nestjs/common";
import { ClcygEnum } from "../enum/enum";
import { ClcygUseCase } from "../../application/usecase";
import { ClcygParams, ClcygEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClcygDBRepository } from "../repository/repository";

@Injectable()
export class ClcygService {
  public usecase: ClcygUseCase;

  constructor(private readonly repository: ClcygDBRepository) {
    this.usecase = new ClcygUseCase(this.repository);
  }

  async findAll(params?: ClcygParams): Promise<ApiResponses<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClcygEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClcygEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClcygEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClcygEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClcygEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Cónyuge no encontrado para este cliente' }, 404);
      }
      return ResponseUtil.response<ClcygEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClcygEntity): Promise<ApiResponse<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClcygEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClcygEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClcygEntity): Promise<ApiResponse<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClcygEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClcygEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClcygEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClcygEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

