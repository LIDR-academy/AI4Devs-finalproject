import { Injectable } from "@nestjs/common";
import { EmpreEnum } from "../enum/enum";
import { EmpreUseCase } from "../../application/usecase";
import { EmpreParams, EmpreEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { EmpreDBRepository } from "../repository/repository";

@Injectable()
export class EmpreService {
    public usecase: EmpreUseCase;

    constructor(private readonly repository: EmpreDBRepository) {
        this.usecase = new EmpreUseCase(this.repository)
    }

    public async findAll(): Promise<ApiResponse<EmpreEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: EmpreEnum.title, method: 'findAll' });
            const geted = await this.usecase.findAll();
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.response<EmpreEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<EmpreEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: EmpreEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<EmpreEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: EmpreEntity): Promise<ApiResponse<EmpreEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: EmpreEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<EmpreEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: EmpreEntity): Promise<ApiResponse<EmpreEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: EmpreEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<EmpreEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<EmpreEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: EmpreEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<EmpreEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







