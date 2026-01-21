import { Injectable } from "@nestjs/common";
import { IfinaEnum } from "../enum/enum";
import { IfinaUseCase } from "../../application/usecase";
import { IfinaParams, IfinaEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { IfinaDBRepository } from "../repository/repository";

@Injectable()
export class IfinaService {
  public usecase: IfinaUseCase;

  constructor(private readonly repository: IfinaDBRepository) {
    this.usecase = new IfinaUseCase(this.repository);
  }

  public async findAll(params: IfinaParams): Promise<ApiResponses<IfinaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: IfinaEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<IfinaEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<IfinaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: IfinaEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<IfinaEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: IfinaEntity): Promise<ApiResponse<IfinaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: IfinaEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<IfinaEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: IfinaEntity): Promise<ApiResponse<IfinaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: IfinaEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<IfinaEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<IfinaEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: IfinaEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<IfinaEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

