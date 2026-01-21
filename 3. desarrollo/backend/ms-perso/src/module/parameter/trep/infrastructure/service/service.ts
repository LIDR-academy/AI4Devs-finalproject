import { Injectable } from "@nestjs/common";
import { TrepEnum } from "../enum/enum";
import { TrepUseCase } from "../../application/usecase";
import { TrepParams, TrepEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { TrepDBRepository } from "../repository/repository";

@Injectable()
export class TrepService {
  public usecase: TrepUseCase;

  constructor(private readonly repository: TrepDBRepository) {
    this.usecase = new TrepUseCase(this.repository);
  }

  public async findAll(params: TrepParams): Promise<ApiResponses<TrepEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: TrepEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<TrepEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<TrepEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: TrepEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TrepEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TrepEntity): Promise<ApiResponse<TrepEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: TrepEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<TrepEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: TrepEntity): Promise<ApiResponse<TrepEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: TrepEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TrepEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<TrepEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: TrepEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TrepEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

