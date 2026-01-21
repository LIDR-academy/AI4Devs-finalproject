import { Injectable } from "@nestjs/common";
import { ClbenEnum } from "../enum/enum";
import { ClbenUseCase } from "../../application/usecase";
import { ClbenParams, ClbenEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClbenDBRepository } from "../repository/repository";

@Injectable()
export class ClbenService {
  public usecase: ClbenUseCase;

  constructor(private readonly repository: ClbenDBRepository) {
    this.usecase = new ClbenUseCase(this.repository);
  }

  async findAll(params?: ClbenParams): Promise<ApiResponses<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClbenEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClbenEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClbenEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbenEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClbncId(clbncId: number): Promise<ApiResponses<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClbenEnum.title, 
        method: 'findByClbncId' 
      });
      const found = await this.usecase.findByClbncId(clbncId);
      if (found.length === 0) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontraron beneficiarios para este usuario de banca digital' }, 404);
      }
      return ResponseUtil.responses<ClbenEntity>(found, found.length, { page: 1, pageSize: found.length }, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClbenEntity): Promise<ApiResponse<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClbenEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClbenEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClbenEntity): Promise<ApiResponse<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbenEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbenEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClbenEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClbenEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbenEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

