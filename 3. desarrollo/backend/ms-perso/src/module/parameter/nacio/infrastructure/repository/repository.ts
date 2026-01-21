import { NacioEntity, NacioParams } from "../../domain/entity";
import { NacioPort } from "../../domain/port";
import { NacioValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { NacioEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class NacioDBRepository implements NacioPort {
  private readonly table = NacioEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: NacioParams): Promise<{ data: NacioEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`nacio_est_nacio = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY nacio_cod_nacio ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<NacioEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new NacioValue(item).toJson()),
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

  public async findById(id: number): Promise<NacioEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE nacio_cod_nacio = $1`;
      const geted = await this.pgRepository.queryGet<NacioEntity>(sql, [id]);
      if (!geted) return null;
      return new NacioValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: NacioEntity): Promise<NacioEntity | null> {
    try {
      const normalizedData = new NacioValue(data);
      const sql = `INSERT INTO ${this.table} (nacio_nom_nacio, nacio_cod_pais, nacio_est_nacio) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.nacio_nom_nacio,
        normalizedData.nacio_cod_pais,
        normalizedData.nacio_est_nacio,
      ];
      const created = await this.pgRepository.queryGet<NacioEntity>(sql, params);
      if (!created) return null;
      return new NacioValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: NacioEntity): Promise<NacioEntity | null> {
    try {
      const normalizedData = new NacioValue(data);
      const sql = `UPDATE ${this.table} SET 
                   nacio_nom_nacio = $1,
                   nacio_cod_pais = $2,
                   nacio_est_nacio = $3
                   WHERE nacio_cod_nacio = $4 RETURNING *`;
      const params = [
        normalizedData.nacio_nom_nacio,
        normalizedData.nacio_cod_pais,
        normalizedData.nacio_est_nacio,
        id,
      ];
      const updated = await this.pgRepository.queryGet<NacioEntity>(sql, params);
      if (!updated) return null;
      return new NacioValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<NacioEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET nacio_est_nacio = false WHERE nacio_cod_nacio = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<NacioEntity>(sql, [id]);
      if (!deleted) return null;
      return new NacioValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

