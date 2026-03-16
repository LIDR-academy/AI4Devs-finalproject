import { Injectable } from "@nestjs/common";
import { CllabEnum } from "../enum/enum";
import { CllabUseCase } from "../../application/usecase";
import { CllabParams, CllabEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { CllabDBRepository } from "../repository/repository";

@Injectable()
export class CllabService {
  public usecase: CllabUseCase;

  constructor(private readonly repository: CllabDBRepository) {
    this.usecase = new CllabUseCase(this.repository);
  }

  async findAll(params?: CllabParams): Promise<ApiResponses<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: CllabEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<CllabEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CllabEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CllabEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: CllabEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Información laboral no encontrada para este cliente' }, 404);
      }
      return ResponseUtil.response<CllabEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: CllabEntity): Promise<ApiResponse<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: CllabEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<CllabEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: CllabEntity): Promise<ApiResponse<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: CllabEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CllabEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: CllabEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<CllabEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

