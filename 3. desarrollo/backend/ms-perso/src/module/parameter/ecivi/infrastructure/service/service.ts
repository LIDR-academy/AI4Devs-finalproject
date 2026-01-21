import { Injectable } from "@nestjs/common";
import { EciviEnum } from "../enum/enum";
import { EciviUseCase } from "../../application/usecase";
import { EciviParams, EciviEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { EciviDBRepository } from "../repository/repository";

@Injectable()
export class EciviService {
  public usecase: EciviUseCase;

  constructor(private readonly repository: EciviDBRepository) {
    this.usecase = new EciviUseCase(this.repository);
  }

  public async findAll(params: EciviParams): Promise<ApiResponses<EciviEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'list', resource: EciviEnum.title, method: 'findAll' });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      return ResponseUtil.responses<EciviEntity>(listed.data, listed.total, params, detail);
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<ApiResponse<EciviEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'get', resource: EciviEnum.title, method: 'findById' });
      const geted = await this.usecase.findById(id);
      if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EciviEntity>(geted, detail);
    } catch (error) {
      throw error;
    }
  }

  public async create(data: EciviEntity): Promise<ApiResponse<EciviEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'create', resource: EciviEnum.title, method: 'create' });
      const created = await this.usecase.create(data);
      if (created === null) return ResponseUtil.error(detail, 500);
      return ResponseUtil.response<EciviEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async update(id: number, data: EciviEntity): Promise<ApiResponse<EciviEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'update', resource: EciviEnum.title, method: 'update' });
      const updated = await this.usecase.update(id, data);
      if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EciviEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  public async delete(id: number): Promise<ApiResponse<EciviEntity>> {
    try {
      const detail = InformationMessage.detail({ action: 'delete', resource: EciviEnum.title, method: 'delete' });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      return ResponseUtil.response<EciviEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

