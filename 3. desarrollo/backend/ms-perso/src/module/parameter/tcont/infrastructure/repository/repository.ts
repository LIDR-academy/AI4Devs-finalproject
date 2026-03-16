import { TcontEntity, TcontParams } from "../../domain/entity";
import { TcontPort } from "../../domain/port";
import { TcontValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TcontEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TcontDBRepository implements TcontPort {
  private readonly table = TcontEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: TcontParams): Promise<{ data: TcontEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`tcont_est_tcont = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY tcont_cod_tcont ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<TcontEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new TcontValue(item).toJson()),
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

  public async findById(id: number): Promise<TcontEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE tcont_cod_tcont = $1`;
      const geted = await this.pgRepository.queryGet<TcontEntity>(sql, [id]);
      if (!geted) return null;
      return new TcontValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: TcontEntity): Promise<TcontEntity | null> {
    try {
      const normalizedData = new TcontValue(data);
      const sql = `INSERT INTO ${this.table} (tcont_nom_tcont, tcont_est_tcont) 
                   VALUES ($1, $2) RETURNING *`;
      const params = [
        normalizedData.tcont_nom_tcont,
        normalizedData.tcont_est_tcont,
      ];
      const created = await this.pgRepository.queryGet<TcontEntity>(sql, params);
      if (!created) return null;
      return new TcontValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: TcontEntity): Promise<TcontEntity | null> {
    try {
      const normalizedData = new TcontValue(data);
      const sql = `UPDATE ${this.table} SET 
                   tcont_nom_tcont = $1,
                   tcont_est_tcont = $2
                   WHERE tcont_cod_tcont = $3 RETURNING *`;
      const params = [
        normalizedData.tcont_nom_tcont,
        normalizedData.tcont_est_tcont,
        id,
      ];
      const updated = await this.pgRepository.queryGet<TcontEntity>(sql, params);
      if (!updated) return null;
      return new TcontValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<TcontEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET tcont_est_tcont = false WHERE tcont_cod_tcont = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<TcontEntity>(sql, [id]);
      if (!deleted) return null;
      return new TcontValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

