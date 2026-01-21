import { Injectable } from "@nestjs/common";
import { NacioEnum } from "../enum/enum";
import { NacioUseCase } from "../../application/usecase";
import { NacioParams, NacioEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { NacioDBRepository } from "../repository/repository";

@Injectable()
export class NacioService {
  public usecase: NacioUseCase;

  constructor(private readonly repository: NacioDBRepository) {
    this.usecase = new NacioUseCase(this.repository);
  }

  public async findAll(params: NacioParams): Promise<ApiResponses<NacioEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: NacioEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<NacioEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<NacioEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: NacioEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<NacioEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: NacioEntity): Promise<ApiResponse<NacioEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: NacioEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<NacioEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: NacioEntity): Promise<ApiResponse<NacioEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: NacioEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<NacioEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<NacioEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: NacioEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<NacioEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

