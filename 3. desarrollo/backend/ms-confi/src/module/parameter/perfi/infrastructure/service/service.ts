import { Injectable } from "@nestjs/common";
import { PerfiEnum } from "../enum/enum";
import { PerfiUseCase } from "../../application/usecase";
import { PerfiParams, PerfiEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { PerfiDBRepository } from "../repository/repository";

@Injectable()
export class PerfiService {
    public usecase: PerfiUseCase;

    constructor(private readonly repository: PerfiDBRepository) {
        this.usecase = new PerfiUseCase(this.repository)
    }

    public async findAll(params: PerfiParams): Promise<ApiResponses<PerfiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: PerfiEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<PerfiEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<PerfiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: PerfiEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<PerfiEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: PerfiEntity): Promise<ApiResponse<PerfiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: PerfiEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<PerfiEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: PerfiEntity): Promise<ApiResponse<PerfiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: PerfiEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<PerfiEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<PerfiEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: PerfiEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<PerfiEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







