import { TpersEntity, TpersParams } from "../../domain/entity";
import { TpersPort } from "../../domain/port";
import { TpersValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TpersEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TpersDBRepository implements TpersPort {
  private readonly table = TpersEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: TpersParams): Promise<{ data: TpersEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`tpers_est_tpers = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY tpers_cod_tpers ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<TpersEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new TpersValue(item).toJson()),
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

  public async findById(id: number): Promise<TpersEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE tpers_cod_tpers = $1`;
      const geted = await this.pgRepository.queryGet<TpersEntity>(sql, [id]);
      if (!geted) return null;
      return new TpersValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: TpersEntity): Promise<TpersEntity | null> {
    try {
      const normalizedData = new TpersValue(data);
      const sql = `INSERT INTO ${this.table} (tpers_nom_tpers, tpers_est_tpers) 
                   VALUES ($1, $2) RETURNING *`;
      const params = [
        normalizedData.tpers_nom_tpers,
        normalizedData.tpers_est_tpers,
      ];
      const created = await this.pgRepository.queryGet<TpersEntity>(sql, params);
      if (!created) return null;
      return new TpersValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: TpersEntity): Promise<TpersEntity | null> {
    try {
      const normalizedData = new TpersValue(data);
      const sql = `UPDATE ${this.table} SET 
                   tpers_nom_tpers = $1,
                   tpers_est_tpers = $2
                   WHERE tpers_cod_tpers = $3 RETURNING *`;
      const params = [
        normalizedData.tpers_nom_tpers,
        normalizedData.tpers_est_tpers,
        id,
      ];
      const updated = await this.pgRepository.queryGet<TpersEntity>(sql, params);
      if (!updated) return null;
      return new TpersValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<TpersEntity | null> {
    try {
      // Soft delete: actualizar estado a false
      const sql = `UPDATE ${this.table} SET tpers_est_tpers = false WHERE tpers_cod_tpers = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<TpersEntity>(sql, [id]);
      if (!deleted) return null;
      return new TpersValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

