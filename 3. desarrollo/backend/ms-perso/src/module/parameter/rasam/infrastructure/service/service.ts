import { Injectable } from "@nestjs/common";
import { RasamEnum } from "../enum/enum";
import { RasamUseCase } from "../../application/usecase";
import { RasamParams, RasamEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { RasamDBRepository } from "../repository/repository";

@Injectable()
export class RasamService {
  public usecase: RasamUseCase;

  constructor(private readonly repository: RasamDBRepository) {
    this.usecase = new RasamUseCase(this.repository);
  }

  public async findAll(params: RasamParams): Promise<ApiResponses<RasamEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: RasamEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<RasamEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<RasamEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: RasamEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<RasamEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: RasamEntity): Promise<ApiResponse<RasamEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: RasamEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<RasamEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: RasamEntity): Promise<ApiResponse<RasamEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: RasamEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<RasamEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<RasamEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: RasamEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<RasamEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

