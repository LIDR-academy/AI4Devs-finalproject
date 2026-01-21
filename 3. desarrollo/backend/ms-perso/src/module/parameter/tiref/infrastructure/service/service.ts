import { Injectable } from "@nestjs/common";
import { TirefEnum } from "../enum/enum";
import { TirefUseCase } from "../../application/usecase";
import { TirefParams, TirefEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { TirefDBRepository } from "../repository/repository";

@Injectable()
export class TirefService {
  public usecase: TirefUseCase;

  constructor(private readonly repository: TirefDBRepository) {
    this.usecase = new TirefUseCase(this.repository);
  }

  public async findAll(params: TirefParams): Promise<ApiResponses<TirefEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: TirefEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<TirefEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<TirefEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: TirefEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TirefEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TirefEntity): Promise<ApiResponse<TirefEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: TirefEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<TirefEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: TirefEntity): Promise<ApiResponse<TirefEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: TirefEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TirefEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<TirefEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: TirefEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TirefEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

