import { Injectable } from "@nestjs/common";
import { TcontEnum } from "../enum/enum";
import { TcontUseCase } from "../../application/usecase";
import { TcontParams, TcontEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { TcontDBRepository } from "../repository/repository";

@Injectable()
export class TcontService {
  public usecase: TcontUseCase;

  constructor(private readonly repository: TcontDBRepository) {
    this.usecase = new TcontUseCase(this.repository);
  }

  public async findAll(params: TcontParams): Promise<ApiResponses<TcontEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: TcontEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<TcontEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<TcontEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: TcontEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TcontEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TcontEntity): Promise<ApiResponse<TcontEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: TcontEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<TcontEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: TcontEntity): Promise<ApiResponse<TcontEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: TcontEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TcontEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<TcontEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: TcontEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TcontEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

