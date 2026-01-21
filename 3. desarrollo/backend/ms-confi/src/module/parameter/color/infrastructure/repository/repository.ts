import { ColorEntity, ColorParams } from "../../domain/entity";
import { ColorPort } from "../../domain/port";
import { ColorValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { ColorEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class ColorDBRepository implements ColorPort {

    private readonly table = ColorEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: ColorParams): Promise<{ data: ColorEntity[]; total: number }> {
        try {
            const { page, pageSize, all } = params;
            const shouldPaginate = !all;
            const take = shouldPaginate ? pageSize : undefined;
            const skip = shouldPaginate ? (page - 1) * pageSize : undefined;
            const [data, total] = await this.pgRepository.findAndCount<ColorEntity>(this.table, {
                where: {},
                order: { color_cod_color: 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });
            return {
                data: data.map(item => new ColorValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }), 500, error);
        }
    }

    public async findById(id: number): Promise<ColorEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<ColorEntity>(this.table, { where: { color_cod_color: id } });
            if (!geted) return null;
            return new ColorValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: ColorEntity): Promise<ColorEntity | null> {
        try {
            const created = await this.pgRepository.create<ColorEntity>(this.table, data);
            if (!created) return null;
            return new ColorValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: ColorEntity): Promise<ColorEntity | null> {
        try {
            const updated = await this.pgRepository.update<ColorEntity>(this.table, data, { color_cod_color: id });
            if (!updated) return null;
            return new ColorValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<ColorEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<ColorEntity>(this.table, { color_cod_color: id });
            if (!deleted) return null;
            return new ColorValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}