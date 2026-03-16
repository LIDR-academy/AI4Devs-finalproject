import { EmpreEntity, EmpreParams } from "../../domain/entity";
import { EmprePort } from "../../domain/port";
import { EmpreValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { EmpreEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";


@Injectable()
export class EmpreDBRepository implements EmprePort {

    private readonly table = EmpreEnum.table;

    constructor(private readonly pgRepository: PgService) { }


    public async findAll(): Promise<EmpreEntity | null> {
        try {
            const geted = await this.pgRepository.queryGet<EmpreEntity>(`SELECT * FROM ${this.table} ORDER BY empre_cod_empre`);
            if (!geted) return null;
            return new EmpreValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }), 500, error);
        }
    }


    public async findById(id: number): Promise<EmpreEntity | null> {
        try {
            const geted = await this.pgRepository.findOne<EmpreEntity>(this.table, { where: { empre_cod_empre: id } });
            if (!geted) return null;
            return new EmpreValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }), 500, error);
        }
    }

    public async create(data: EmpreEntity): Promise<EmpreEntity | null> {
        try {
            const created = await this.pgRepository.create<EmpreEntity>(this.table, data);
            if (!created) return null;
            return new EmpreValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }), 500, error);
        }
    }

    public async update(id: number, data: EmpreEntity): Promise<EmpreEntity | null> {
        try {
            const updated = await this.pgRepository.update<EmpreEntity>(this.table, data, { empre_cod_empre: id });
            if (!updated) return null;
            return new EmpreValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<EmpreEntity | null> {
        try {
            const deleted = await this.pgRepository.delete<EmpreEntity>(this.table, { empre_cod_empre: id });
            if (!deleted) return null;
            return new EmpreValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}