import { Injectable } from "@nestjs/common";
import { TpersEnum } from "../enum/enum";
import { TpersUseCase } from "../../application/usecase";
import { TpersParams, TpersEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { TpersDBRepository } from "../repository/repository";

@Injectable()
export class TpersService {
  public usecase: TpersUseCase;

  constructor(private readonly repository: TpersDBRepository) {
    this.usecase = new TpersUseCase(this.repository);
  }

  public async findAll(params: TpersParams): Promise<ApiResponses<TpersEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: TpersEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<TpersEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<TpersEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: TpersEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TpersEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TpersEntity): Promise<ApiResponse<TpersEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: TpersEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<TpersEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: TpersEntity): Promise<ApiResponse<TpersEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: TpersEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TpersEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<TpersEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: TpersEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<TpersEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

