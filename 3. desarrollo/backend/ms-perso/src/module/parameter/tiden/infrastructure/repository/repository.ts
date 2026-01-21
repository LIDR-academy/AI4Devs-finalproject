import { TidenEntity, TidenParams } from "../../domain/entity";
import { TidenPort } from "../../domain/port";
import { TidenValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TidenEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TidenDBRepository implements TidenPort {

    private readonly table = TidenEnum.table;

    constructor(private readonly pgRepository: PgService) { }


    public async findAll(params: TidenParams): Promise<{ data: TidenEntity[]; total: number; }> {
        try {
            const { page, pageSize, activo } = params;
            const skip = (page - 1) * pageSize;
            
            const whereConditions: string[] = [];
            const queryParams: any[] = [];
            
            if (activo !== undefined) {
                whereConditions.push(`tiden_est_tiden = $${queryParams.length + 1}`);
                queryParams.push(activo);
            }
            
            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}` 
                : '';
            
            const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY tiden_cod_tiden ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
            queryParams.push(pageSize, skip);
            
            const result = await this.pgRepository.queryList<TidenEntity>(sql, queryParams);
            
            const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
            const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
            const total = countResult?.total || 0;
            
            return {
                data: result.map(item => new TidenValue(item).toJson()),
                total,
            };
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'list', resource: this.table, method: 'findAll' }),
                500,
                error
            );
        }
    }

    public async findById(id: number): Promise<TidenEntity | null> {
        try {
            const sql = `SELECT * FROM ${this.table} WHERE tiden_cod_tiden = $1`;
            const geted = await this.pgRepository.queryGet<TidenEntity>(sql, [id]);
            if (!geted) return null;
            return new TidenValue(geted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
                500,
                error
            );
        }
    }



    public async create(data: TidenEntity): Promise<TidenEntity | null> {
        try {
            const normalizedData = new TidenValue(data);
            const sql = `INSERT INTO ${this.table} (tiden_nom_tiden, tiden_lon_minim, tiden_lon_maxim, tiden_est_tiden) 
                         VALUES ($1, $2, $3, $4) RETURNING *`;
            const params = [
                normalizedData.tiden_nom_tiden,
                normalizedData.tiden_lon_minim,
                normalizedData.tiden_lon_maxim,
                normalizedData.tiden_est_tiden,
            ];
            const created = await this.pgRepository.queryGet<TidenEntity>(sql, params);
            if (!created) return null;
            return new TidenValue(created).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
                500,
                error,
            );
        }
    }



    public async update(id: number, data: TidenEntity): Promise<TidenEntity | null> {
        try {
            const normalizedData = new TidenValue(data);
            const sql = `UPDATE ${this.table} SET 
                         tiden_nom_tiden = $1,
                         tiden_lon_minim = $2,
                         tiden_lon_maxim = $3,
                         tiden_est_tiden = $4
                         WHERE tiden_cod_tiden = $5 RETURNING *`;
            const params = [
                normalizedData.tiden_nom_tiden,
                normalizedData.tiden_lon_minim,
                normalizedData.tiden_lon_maxim,
                normalizedData.tiden_est_tiden,
                id,
            ];
            const updated = await this.pgRepository.queryGet<TidenEntity>(sql, params);
            if (!updated) return null;
            return new TidenValue(updated).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
        }
    }

    public async delete(id: number): Promise<TidenEntity | null> {
        try {
            // Soft delete: actualizar estado a false
            const sql = `UPDATE ${this.table} SET tiden_est_tiden = false WHERE tiden_cod_tiden = $1 RETURNING *`;
            const deleted = await this.pgRepository.queryGet<TidenEntity>(sql, [id]);
            if (!deleted) return null;
            return new TidenValue(deleted).toJson();
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
        }
    }

}