import { Injectable } from "@nestjs/common";
import { ToficEnum } from "../enum/enum";
import { ToficUseCase } from "../../application/usecase";
import { ToficParams, ToficEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ToficDBRepository } from "../repository/repository";

@Injectable()
export class ToficService {
    public usecase: ToficUseCase;

    constructor(private readonly repository: ToficDBRepository) {
        this.usecase = new ToficUseCase(this.repository)
    }

    public async findAll(params: ToficParams): Promise<ApiResponses<ToficEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: ToficEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<ToficEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<ToficEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: ToficEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ToficEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: ToficEntity): Promise<ApiResponse<ToficEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: ToficEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<ToficEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: ToficEntity): Promise<ApiResponse<ToficEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: ToficEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ToficEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<ToficEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: ToficEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ToficEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







