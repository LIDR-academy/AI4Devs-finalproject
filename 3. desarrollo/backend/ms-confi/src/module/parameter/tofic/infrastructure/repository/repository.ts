import { ToficEntity, ToficParams } from "../../domain/entity";
import { ToficPort } from "../../domain/port";
import { ToficValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { ToficEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class ToficDBRepository implements ToficPort {

    private readonly table = ToficEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: ToficParams): Promise<{ data: ToficEntity[]; total: number }> {
        try {
            const { page, pageSize, all } = params;
            const shouldPaginate = !all;
            const take = shouldPaginate ? pageSize : undefined;
            const skip = shouldPaginate ? (page - 1) * pageSize : undefined;
            const [data, total] = await this.pgRepository.findAndCount<ToficEntity>(this.table, {
                where: {},
                order: { tofic_cod_tofic: 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });
            return {
                data: data.map(item => new ToficValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }), 500, error);
        }
    }

    public async findById(id: number): Promise<ToficEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<ToficEntity>(this.table, { where: { tofic_cod_tofic: id } });
            if (!geted) return null;
            return new ToficValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: ToficEntity): Promise<ToficEntity | null> {
        try {
            const created = await this.pgRepository.create<ToficEntity>(this.table, data);
            if (!created) return null;
            return new ToficValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: ToficEntity): Promise<ToficEntity | null> {
        try {
            const updated = await this.pgRepository.update<ToficEntity>(this.table, data, { tofic_cod_tofic: id });
            if (!updated) return null;
            return new ToficValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<ToficEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<ToficEntity>(this.table, { tofic_cod_tofic: id });
            if (!deleted) return null;
            return new ToficValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}