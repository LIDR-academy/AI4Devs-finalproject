import { Injectable } from "@nestjs/common";
import { IconsEnum } from "../enum/enum";
import { IconsUseCase } from "../../application/usecase";
import { IconsParams, IconsEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { IconsDBRepository } from "../repository/repository";

@Injectable()
export class IconsService {
    public usecase: IconsUseCase;

    constructor(private readonly repository: IconsDBRepository) {
        this.usecase = new IconsUseCase(this.repository)
    }

    public async findAll(params: IconsParams): Promise<ApiResponses<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: IconsEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<IconsEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findAllByColor(params: IconsParams, id: number): Promise<ApiResponses<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: IconsEnum.title, method: 'findAllByColor' });
            const listed = await this.usecase.findAllByColor(params, id);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<IconsEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: IconsEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<IconsEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: IconsEntity): Promise<ApiResponse<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: IconsEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<IconsEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: IconsEntity): Promise<ApiResponse<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: IconsEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<IconsEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<IconsEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: IconsEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<IconsEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







