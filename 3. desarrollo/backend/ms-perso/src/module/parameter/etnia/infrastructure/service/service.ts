import { Injectable } from "@nestjs/common";
import { EtniaEnum } from "../enum/enum";
import { EtniaUseCase } from "../../application/usecase";
import { EtniaParams, EtniaEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { EtniaDBRepository } from "../repository/repository";

@Injectable()
export class EtniaService {
  public usecase: EtniaUseCase;

  constructor(private readonly repository: EtniaDBRepository) {
    this.usecase = new EtniaUseCase(this.repository);
  }

  public async findAll(params: EtniaParams): Promise<ApiResponses<EtniaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: EtniaEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<EtniaEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<EtniaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: EtniaEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EtniaEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: EtniaEntity): Promise<ApiResponse<EtniaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: EtniaEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<EtniaEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: EtniaEntity): Promise<ApiResponse<EtniaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: EtniaEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EtniaEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<EtniaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: EtniaEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EtniaEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

