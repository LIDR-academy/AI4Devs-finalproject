import { Injectable } from "@nestjs/common";
import { ColorEnum } from "../enum/enum";
import { ColorUseCase } from "../../application/usecase";
import { ColorParams, ColorEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ColorDBRepository } from "../repository/repository";

@Injectable()
export class ColorService {
    public usecase: ColorUseCase;

    constructor(private readonly repository: ColorDBRepository) {
        this.usecase = new ColorUseCase(this.repository)
    }

    public async findAll(params: ColorParams): Promise<ApiResponses<ColorEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'list', resource: ColorEnum.title, method: 'findAll' });
            const listed = await this.usecase.findAll(params);
            if (listed.data.length === 0) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
            return ResponseUtil.responses<ColorEntity>(listed.data, listed.total, params, detail);
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ApiResponse<ColorEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: ColorEnum.title, method: 'findById' });
            const geted = await this.usecase.findById(id);
            if (geted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ColorEntity>(geted, detail);
        } catch (error) {
            throw error;
        }
    }


    public async create(data: ColorEntity): Promise<ApiResponse<ColorEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'create', resource: ColorEnum.title, method: 'create' });
            const created = await this.usecase.create(data);
            if (created === null) return ResponseUtil.error(detail, 500);
            return ResponseUtil.response<ColorEntity>(created, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async update(id: number, data: ColorEntity): Promise<ApiResponse<ColorEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'update', resource: ColorEnum.title, method: 'update' });
            const updated = await this.usecase.update(id, data);
            if (updated === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ColorEntity>(updated, detail);
        } catch (error: any) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ApiResponse<ColorEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'delete', resource: ColorEnum.title, method: 'delete' });
            const deleted = await this.usecase.delete(id);
            if (deleted === null) return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
            return ResponseUtil.response<ColorEntity>(deleted, detail);
        } catch (error: any) {
            throw error;
        }
    }

}







