import { Injectable } from "@nestjs/common";
import { ClasmEnum } from "../enum/enum";
import { ClasmUseCase } from "../../application/usecase";
import { ClasmParams, ClasmEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClasmDBRepository } from "../repository/repository";

@Injectable()
export class ClasmService {
  public usecase: ClasmUseCase;

  constructor(private readonly repository: ClasmDBRepository) {
    this.usecase = new ClasmUseCase(this.repository);
  }

  async findAll(params?: ClasmParams): Promise<ApiResponses<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClasmEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClasmEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClasmEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClasmEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClasmEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró participación en asamblea para este cliente' }, 404);
      }
      return ResponseUtil.response<ClasmEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClasmEntity): Promise<ApiResponse<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClasmEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClasmEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClasmEntity): Promise<ApiResponse<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClasmEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClasmEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClasmEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClasmEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

