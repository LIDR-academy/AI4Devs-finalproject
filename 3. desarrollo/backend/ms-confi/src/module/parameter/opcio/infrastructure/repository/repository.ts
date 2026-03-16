import { OpcioEntity, OpcioParams } from "../../domain/entity";
import { OpcioPort } from "../../domain/port";
import { OpcioValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { OpcioEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";


@Injectable()
export class OpcioDBRepository implements OpcioPort {

    private readonly table = OpcioEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async findAll(params: OpcioParams): Promise<{ data: OpcioEntity[]; total: number }> {
        const { page, pageSize, all } = params;
        const { shouldPaginate, skip, take } = this.pgRepository.resolvePagination(all, page, pageSize);
        try {
            const [data, total] = await this.pgRepository.findAndCountJoin<OpcioEntity>(`${this.table} AS opc`, {
                joins: [
                    {
                        table: 'rrficons',
                        alias: 'icon',
                        on: 'opc.opcio_cod_icons = icon.icons_cod_icons or opc.opcio_cod_icons is null',
                        type: 'LEFT'
                    }
                ],
                select: ['opc.*', 'icon.icons_cod_html'],
                order: { 'opc.opcio_cod_icons': 'ASC' },
                ...(shouldPaginate && { skip, take }),
            });
    
            return {
                data: data.map(item => new OpcioValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll', }), 500, error);
        }
    }


    public async findById(id: string): Promise<OpcioEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<OpcioEntity>(this.table, { where: { opcio_cod_opcio: id } });
            if (!geted) return null;
            return new OpcioValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: OpcioEntity): Promise<OpcioEntity | null> {
        try {
            const created = await this.pgRepository.create<OpcioEntity>(this.table, data);
            if (!created) return null;
            return new OpcioValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: string, data: OpcioEntity): Promise<OpcioEntity | null> {
        try {
            const updated = await this.pgRepository.update<OpcioEntity>(this.table, data, { opcio_cod_opcio: id });
            if (!updated) return null;
            return new OpcioValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: string): Promise<OpcioEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<OpcioEntity>(this.table, { opcio_cod_opcio: id });
            if (!deleted) return null;
            return new OpcioValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}