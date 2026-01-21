import { TirefEntity, TirefParams } from "../../domain/entity";
import { TirefPort } from "../../domain/port";
import { TirefValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TirefEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TirefDBRepository implements TirefPort {
  private readonly table = TirefEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: TirefParams): Promise<{ data: TirefEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`tiref_est_tiref = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY tiref_cod_tiref ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<TirefEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new TirefValue(item).toJson()),
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

  public async findById(id: number): Promise<TirefEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE tiref_cod_tiref = $1`;
      const geted = await this.pgRepository.queryGet<TirefEntity>(sql, [id]);
      if (!geted) return null;
      return new TirefValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: TirefEntity): Promise<TirefEntity | null> {
    try {
      const normalizedData = new TirefValue(data);
      const sql = `INSERT INTO ${this.table} (tiref_nom_tiref, tiref_req_finan, tiref_est_tiref) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.tiref_nom_tiref,
        normalizedData.tiref_req_finan,
        normalizedData.tiref_est_tiref,
      ];
      const created = await this.pgRepository.queryGet<TirefEntity>(sql, params);
      if (!created) return null;
      return new TirefValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: TirefEntity): Promise<TirefEntity | null> {
    try {
      const normalizedData = new TirefValue(data);
      const sql = `UPDATE ${this.table} SET 
                   tiref_nom_tiref = $1,
                   tiref_req_finan = $2,
                   tiref_est_tiref = $3
                   WHERE tiref_cod_tiref = $4 RETURNING *`;
      const params = [
        normalizedData.tiref_nom_tiref,
        normalizedData.tiref_req_finan,
        normalizedData.tiref_est_tiref,
        id,
      ];
      const updated = await this.pgRepository.queryGet<TirefEntity>(sql, params);
      if (!updated) return null;
      return new TirefValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<TirefEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET tiref_est_tiref = false WHERE tiref_cod_tiref = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<TirefEntity>(sql, [id]);
      if (!deleted) return null;
      return new TirefValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

