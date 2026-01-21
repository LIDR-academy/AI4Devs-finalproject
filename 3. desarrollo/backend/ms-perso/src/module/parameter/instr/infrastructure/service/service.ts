import { Injectable } from "@nestjs/common";
import { InstrEnum } from "../enum/enum";
import { InstrUseCase } from "../../application/usecase";
import { InstrParams, InstrEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { InstrDBRepository } from "../repository/repository";

@Injectable()
export class InstrService {
  public usecase: InstrUseCase;

  constructor(private readonly repository: InstrDBRepository) {
    this.usecase = new InstrUseCase(this.repository);
  }

  public async findAll(params: InstrParams): Promise<ApiResponses<InstrEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: InstrEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<InstrEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<InstrEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: InstrEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<InstrEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: InstrEntity): Promise<ApiResponse<InstrEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: InstrEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<InstrEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: InstrEntity): Promise<ApiResponse<InstrEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: InstrEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<InstrEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<InstrEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: InstrEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<InstrEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

