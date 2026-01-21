import { OficiEntity, OficiParams } from "../../domain/entity";
import { OficiPort } from "../../domain/port";
import { OficiValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { OficiEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";


@Injectable()
export class OficiDBRepository implements OficiPort {

    private readonly table = OficiEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: OficiParams): Promise<{ data: OficiEntity[]; total: number }> {
        const { page, pageSize, all } = params;
        const { shouldPaginate, skip, take } = this.pgRepository.resolvePagination(all, page, pageSize);
        try {
            const [data, total] = await this.pgRepository.findAndCountJoin<OficiEntity>(`${this.table} AS ofici`, {
                joins: [
                    {
                        table: 'rrfempre',
                        alias: 'empre',
                        on: 'ofici.ofici_cod_empre = empre.empre_cod_empre',
                    },
                    {
                        table: 'rrftofic',
                        alias: 'tofic',
                        on: 'ofici.ofici_cod_tofic = tofic.tofic_cod_tofic',
                    }
                ],
                select: ['ofici.*', 'empre.empre_nom_empre', 'tofic.tofic_des_tofic'],
                order: { 'ofici.ofici_cod_ofici': 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });

            return {
                data: data.map(item => new OficiValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll', }), 500, error);
        }
    }


    public async findById(id: number): Promise<OficiEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<OficiEntity>(this.table, { where: { ofici_cod_ofici: id } });
            if (!geted) return null;
            return new OficiValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: OficiEntity): Promise<OficiEntity | null> {
        try {
            console.log("*******************************************CREATE ", data)
            const created = await this.pgRepository.create<OficiEntity>(this.table, data);
            if (!created) return null;
            return new OficiValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: OficiEntity): Promise<OficiEntity | null> {
        try {
            const updated = await this.pgRepository.update<OficiEntity>(this.table, data, { ofici_cod_ofici: id });
            if (!updated) return null;
            return new OficiValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<OficiEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<OficiEntity>(this.table, { ofici_cod_ofici: id });
            if (!deleted) return null;
            return new OficiValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}