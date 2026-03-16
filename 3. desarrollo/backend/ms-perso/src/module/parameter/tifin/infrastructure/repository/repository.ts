import { TifinEntity, TifinParams } from "../../domain/entity";
import { TifinPort } from "../../domain/port";
import { TifinValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { TifinEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class TifinDBRepository implements TifinPort {
  private readonly table = TifinEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: TifinParams): Promise<{ data: TifinEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo, tipo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`tifin_est_tifin = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      if (tipo !== undefined) {
        whereConditions.push(`tifin_tip_tifin = $${queryParams.length + 1}`);
        queryParams.push(tipo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY tifin_cod_tifin ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<TifinEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new TifinValue(item).toJson()),
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

  public async findById(id: number): Promise<TifinEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE tifin_cod_tifin = $1`;
      const geted = await this.pgRepository.queryGet<TifinEntity>(sql, [id]);
      if (!geted) return null;
      return new TifinValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: TifinEntity): Promise<TifinEntity | null> {
    try {
      const normalizedData = new TifinValue(data);
      const sql = `INSERT INTO ${this.table} (tifin_nom_tifin, tifin_tip_tifin, tifin_est_tifin) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.tifin_nom_tifin,
        normalizedData.tifin_tip_tifin,
        normalizedData.tifin_est_tifin,
      ];
      const created = await this.pgRepository.queryGet<TifinEntity>(sql, params);
      if (!created) return null;
      return new TifinValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: TifinEntity): Promise<TifinEntity | null> {
    try {
      const normalizedData = new TifinValue(data);
      const sql = `UPDATE ${this.table} SET 
                   tifin_nom_tifin = $1,
                   tifin_tip_tifin = $2,
                   tifin_est_tifin = $3
                   WHERE tifin_cod_tifin = $4 RETURNING *`;
      const params = [
        normalizedData.tifin_nom_tifin,
        normalizedData.tifin_tip_tifin,
        normalizedData.tifin_est_tifin,
        id,
      ];
      const updated = await this.pgRepository.queryGet<TifinEntity>(sql, params);
      if (!updated) return null;
      return new TifinValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<TifinEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET tifin_est_tifin = false WHERE tifin_cod_tifin = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<TifinEntity>(sql, [id]);
      if (!deleted) return null;
      return new TifinValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

