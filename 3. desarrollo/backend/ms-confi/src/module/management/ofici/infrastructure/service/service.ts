import { Injectable } from "@nestjs/common";
import { OficiEnum } from "../enum/enum";
import { OficiUseCase } from "../../application/usecase";
import { OficiEntity, OficiParams } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { OficiDBRepository } from "../repository/repository";

@Injectable()
export class OficiService {
    public usecase: OficiUseCase;

    constructor(private readonly repository: OficiDBRepository) {
        this.usecase = new OficiUseCase(this.repository)
    }

    public async findAll(params: OficiParams): Promise<ApiResponses<OficiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: OficiEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<OficiEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<OficiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: OficiEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OficiEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: OficiEntity): Promise<ApiResponse<OficiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: OficiEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<OficiEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: OficiEntity): Promise<ApiResponse<OficiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: OficiEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OficiEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<OficiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: OficiEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OficiEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







