import { Injectable } from "@nestjs/common";
import { SexosEnum } from "../enum/enum";
import { SexosUseCase } from "../../application/usecase";
import { SexosParams, SexosEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { SexosDBRepository } from "../repository/repository";

@Injectable()
export class SexosService {
  public usecase: SexosUseCase;

  constructor(private readonly repository: SexosDBRepository) {
    this.usecase = new SexosUseCase(this.repository);
  }

  public async findAll(params: SexosParams): Promise<ApiResponses<SexosEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: SexosEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<SexosEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<SexosEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: SexosEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SexosEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: SexosEntity): Promise<ApiResponse<SexosEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: SexosEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<SexosEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: SexosEntity): Promise<ApiResponse<SexosEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: SexosEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SexosEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<SexosEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: SexosEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<SexosEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

