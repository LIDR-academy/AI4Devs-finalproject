import { PerfiEntity, PerfiParams } from "../../domain/entity";
import { PerfiPort } from "../../domain/port";
import { PerfiValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { PerfiEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class PerfiDBRepository implements PerfiPort {

    private readonly table = PerfiEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: PerfiParams): Promise<{ data: PerfiEntity[]; total: number }> {
        try {
            const { page, pageSize, all } = params;
            const shouldPaginate = !all;
            const take = shouldPaginate ? pageSize : undefined;
            const skip = shouldPaginate ? (page - 1) * pageSize : undefined;
            const [data, total] = await this.pgRepository.findAndCount<PerfiEntity>(this.table, {
                where: {},
                order: { perfi_cod_perfi: 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });
            return {
                data: data.map(item => new PerfiValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }), 500, error);
        }
    }

    public async findById(id: number): Promise<PerfiEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<PerfiEntity>(this.table, { where: { perfi_cod_perfi: id } });
            if (!geted) return null;
            return new PerfiValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: PerfiEntity): Promise<PerfiEntity | null> {
        try {
            const created = await this.pgRepository.create<PerfiEntity>(this.table, data);
            if (!created) return null;
            return new PerfiValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: PerfiEntity): Promise<PerfiEntity | null> {
        try {
            const updated = await this.pgRepository.update<PerfiEntity>(this.table, data, { perfi_cod_perfi: id });
            if (!updated) return null;
            return new PerfiValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<PerfiEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<PerfiEntity>(this.table, { perfi_cod_perfi: id });
            if (!deleted) return null;
            return new PerfiValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}