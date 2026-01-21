import { IconsEntity, IconsParams } from "../../domain/entity";
import { IconsPort } from "../../domain/port";
import { IconsValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { IconsEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class IconsDBRepository implements IconsPort {

    private readonly table = IconsEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: IconsParams): Promise<{ data: IconsEntity[]; total: number }> {
        try {
            const { page, pageSize, all } = params;
            const shouldPaginate = !all;
            const take = shouldPaginate ? pageSize : undefined;
            const skip = shouldPaginate ? (page - 1) * pageSize : undefined;

            const [data, total] = await this.pgRepository.findAndCountJoin<IconsEntity>(`${this.table} AS icon`, {
                joins: [
                    {
                        table: 'rrfcolor',
                        alias: 'col',
                        on: 'icon.icons_cod_color = col.color_cod_color'
                    }
                ],
                select: ['icon.*', 'col.color_des_color'],
                order: { 'icon.icons_cod_icons': 'ASC' },
                skip,
                take,
            });

            return {
                data: data.map(item => new IconsValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }), 500, error);
        }
    }

    public async findAllByColor(params: IconsParams, id: number): Promise<{ data: IconsEntity[]; total: number }> {
        try {
            const { page, pageSize, all } = params;
            const shouldPaginate = !all;
            const take = shouldPaginate ? pageSize : undefined;
            const skip = shouldPaginate ? (page - 1) * pageSize : undefined;
            const [data, total] = await this.pgRepository.findAndCount<IconsEntity>(this.table, {
                where: { icons_cod_color: id },
                order: { icons_cod_icons: 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });
            return {
                data: data.map(item => new IconsValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAllByColor' }), 500, error);
        }
    }

    public async findById(id: number): Promise<IconsEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<IconsEntity>(this.table, { where: { perfi_cod_perfi: id } });
            if (!geted) return null;
            return new IconsValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: IconsEntity): Promise<IconsEntity | null> {
        try {
            const created = await this.pgRepository.create<IconsEntity>(this.table, data);
            if (!created) return null;
            return new IconsValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: IconsEntity): Promise<IconsEntity | null> {
        try {
            const updated = await this.pgRepository.update<IconsEntity>(this.table, data, { perfi_cod_perfi: id });
            if (!updated) return null;
            return new IconsValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<IconsEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<IconsEntity>(this.table, { perfi_cod_perfi: id });
            if (!deleted) return null;
            return new IconsValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}