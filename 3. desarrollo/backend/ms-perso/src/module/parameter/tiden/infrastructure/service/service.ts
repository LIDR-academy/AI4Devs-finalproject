import { Injectable } from "@nestjs/common";
import { TidenEnum } from "../enum/enum";
import { TidenUseCase } from "../../application/usecase";
import { TidenParams, TidenEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { TidenDBRepository } from "../repository/repository";

@Injectable()
export class TidenService {
    public usecase: TidenUseCase;

    constructor(private readonly repository: TidenDBRepository) {
        this.usecase = new TidenUseCase(this.repository)
    }

    public async findAll(params: TidenParams): Promise<ApiResponses<TidenEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: TidenEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<TidenEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<TidenEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: TidenEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<TidenEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: TidenEntity): Promise<ApiResponse<TidenEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: TidenEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<TidenEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: TidenEntity): Promise<ApiResponse<TidenEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: TidenEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<TidenEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<TidenEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: TidenEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<TidenEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







