import { EtniaEntity, EtniaParams } from "../../domain/entity";
import { EtniaPort } from "../../domain/port";
import { EtniaValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { EtniaEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class EtniaDBRepository implements EtniaPort {
  private readonly table = EtniaEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: EtniaParams): Promise<{ data: EtniaEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`etnia_est_etnia = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY etnia_cod_etnia ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<EtniaEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new EtniaValue(item).toJson()),
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

  public async findById(id: number): Promise<EtniaEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE etnia_cod_etnia = $1`;
      const geted = await this.pgRepository.queryGet<EtniaEntity>(sql, [id]);
      if (!geted) return null;
      return new EtniaValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: EtniaEntity): Promise<EtniaEntity | null> {
    try {
      const normalizedData = new EtniaValue(data);
      const sql = `INSERT INTO ${this.table} (etnia_nom_etnia, etnia_cod_seps, etnia_est_etnia) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.etnia_nom_etnia,
        normalizedData.etnia_cod_seps,
        normalizedData.etnia_est_etnia,
      ];
      const created = await this.pgRepository.queryGet<EtniaEntity>(sql, params);
      if (!created) return null;
      return new EtniaValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: EtniaEntity): Promise<EtniaEntity | null> {
    try {
      const normalizedData = new EtniaValue(data);
      const sql = `UPDATE ${this.table} SET 
                   etnia_nom_etnia = $1,
                   etnia_cod_seps = $2,
                   etnia_est_etnia = $3
                   WHERE etnia_cod_etnia = $4 RETURNING *`;
      const params = [
        normalizedData.etnia_nom_etnia,
        normalizedData.etnia_cod_seps,
        normalizedData.etnia_est_etnia,
        id,
      ];
      const updated = await this.pgRepository.queryGet<EtniaEntity>(sql, params);
      if (!updated) return null;
      return new EtniaValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<EtniaEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET etnia_est_etnia = false WHERE etnia_cod_etnia = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<EtniaEntity>(sql, [id]);
      if (!deleted) return null;
      return new EtniaValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

