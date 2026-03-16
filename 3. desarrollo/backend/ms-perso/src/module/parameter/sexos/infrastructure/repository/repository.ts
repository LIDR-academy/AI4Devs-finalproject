import { SexosEntity, SexosParams } from "../../domain/entity";
import { SexosPort } from "../../domain/port";
import { SexosValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { SexosEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class SexosDBRepository implements SexosPort {
  private readonly table = SexosEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: SexosParams): Promise<{ data: SexosEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`sexos_est_sexos = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY sexos_cod_sexos ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<SexosEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new SexosValue(item).toJson()),
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

  public async findById(id: number): Promise<SexosEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE sexos_cod_sexos = $1`;
      const geted = await this.pgRepository.queryGet<SexosEntity>(sql, [id]);
      if (!geted) return null;
      return new SexosValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: SexosEntity): Promise<SexosEntity | null> {
    try {
      const normalizedData = new SexosValue(data);
      const sql = `INSERT INTO ${this.table} (sexos_nom_sexos, sexos_cod_seps, sexos_est_sexos) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.sexos_nom_sexos,
        normalizedData.sexos_cod_seps,
        normalizedData.sexos_est_sexos,
      ];
      const created = await this.pgRepository.queryGet<SexosEntity>(sql, params);
      if (!created) return null;
      return new SexosValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: SexosEntity): Promise<SexosEntity | null> {
    try {
      const normalizedData = new SexosValue(data);
      const sql = `UPDATE ${this.table} SET 
                   sexos_nom_sexos = $1,
                   sexos_cod_seps = $2,
                   sexos_est_sexos = $3
                   WHERE sexos_cod_sexos = $4 RETURNING *`;
      const params = [
        normalizedData.sexos_nom_sexos,
        normalizedData.sexos_cod_seps,
        normalizedData.sexos_est_sexos,
        id,
      ];
      const updated = await this.pgRepository.queryGet<SexosEntity>(sql, params);
      if (!updated) return null;
      return new SexosValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<SexosEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET sexos_est_sexos = false WHERE sexos_cod_sexos = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<SexosEntity>(sql, [id]);
      if (!deleted) return null;
      return new SexosValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

