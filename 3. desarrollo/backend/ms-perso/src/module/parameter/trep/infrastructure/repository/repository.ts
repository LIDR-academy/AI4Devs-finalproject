import { TrepEntity, TrepParams } from "../../domain/entity";
import { TrepPort } from "../../domain/port";
import { TrepValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TrepEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TrepDBRepository implements TrepPort {
  private readonly table = TrepEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: TrepParams): Promise<{ data: TrepEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`trep_est_trep = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY trep_cod_trep ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<TrepEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new TrepValue(item).toJson()),
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

  public async findById(id: number): Promise<TrepEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE trep_cod_trep = $1`;
      const geted = await this.pgRepository.queryGet<TrepEntity>(sql, [id]);
      if (!geted) return null;
      return new TrepValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: TrepEntity): Promise<TrepEntity | null> {
    try {
      const normalizedData = new TrepValue(data);
      const sql = `INSERT INTO ${this.table} (trep_nom_trep, trep_est_trep) 
                   VALUES ($1, $2) RETURNING *`;
      const params = [
        normalizedData.trep_nom_trep,
        normalizedData.trep_est_trep,
      ];
      const created = await this.pgRepository.queryGet<TrepEntity>(sql, params);
      if (!created) return null;
      return new TrepValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: TrepEntity): Promise<TrepEntity | null> {
    try {
      const normalizedData = new TrepValue(data);
      const sql = `UPDATE ${this.table} SET 
                   trep_nom_trep = $1,
                   trep_est_trep = $2
                   WHERE trep_cod_trep = $3 RETURNING *`;
      const params = [
        normalizedData.trep_nom_trep,
        normalizedData.trep_est_trep,
        id,
      ];
      const updated = await this.pgRepository.queryGet<TrepEntity>(sql, params);
      if (!updated) return null;
      return new TrepValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<TrepEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET trep_est_trep = false WHERE trep_cod_trep = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<TrepEntity>(sql, [id]);
      if (!deleted) return null;
      return new TrepValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

