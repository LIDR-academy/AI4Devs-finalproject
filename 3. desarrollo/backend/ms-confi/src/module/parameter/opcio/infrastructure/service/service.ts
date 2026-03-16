import { Injectable } from "@nestjs/common";
import { OpcioEnum } from "../enum/enum";
import { OpcioUseCase } from "../../application/usecase";
import { OpcioParams, OpcioEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { OpcioDBRepository } from "../repository/repository";

@Injectable()
export class OpcioService {
    public usecase: OpcioUseCase;

    constructor(private readonly repository: OpcioDBRepository) {
        this.usecase = new OpcioUseCase(this.repository)
    }

    public async findAll(params: OpcioParams): Promise<ApiResponses<OpcioEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: OpcioEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<OpcioEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: string): Promise<ApiResponse<OpcioEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: OpcioEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OpcioEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: OpcioEntity): Promise<ApiResponse<OpcioEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: OpcioEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<OpcioEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: string, data: OpcioEntity): Promise<ApiResponse<OpcioEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: OpcioEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OpcioEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: string): Promise<ApiResponse<OpcioEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: OpcioEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<OpcioEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







