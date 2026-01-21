import { RasamEntity, RasamParams } from "../../domain/entity";
import { RasamPort } from "../../domain/port";
import { RasamValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { RasamEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class RasamDBRepository implements RasamPort {
  private readonly table = RasamEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: RasamParams): Promise<{ data: RasamEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`rasam_est_rasam = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY rasam_cod_rasam ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<RasamEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new RasamValue(item).toJson()),
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

  public async findById(id: number): Promise<RasamEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE rasam_cod_rasam = $1`;
      const geted = await this.pgRepository.queryGet<RasamEntity>(sql, [id]);
      if (!geted) return null;
      return new RasamValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: RasamEntity): Promise<RasamEntity | null> {
    try {
      const normalizedData = new RasamValue(data);
      const sql = `INSERT INTO ${this.table} (rasam_nom_rasam, rasam_est_rasam) 
                   VALUES ($1, $2) RETURNING *`;
      const params = [
        normalizedData.rasam_nom_rasam,
        normalizedData.rasam_est_rasam,
      ];
      const created = await this.pgRepository.queryGet<RasamEntity>(sql, params);
      if (!created) return null;
      return new RasamValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: RasamEntity): Promise<RasamEntity | null> {
    try {
      const normalizedData = new RasamValue(data);
      const sql = `UPDATE ${this.table} SET 
                   rasam_nom_rasam = $1,
                   rasam_est_rasam = $2
                   WHERE rasam_cod_rasam = $3 RETURNING *`;
      const params = [
        normalizedData.rasam_nom_rasam,
        normalizedData.rasam_est_rasam,
        id,
      ];
      const updated = await this.pgRepository.queryGet<RasamEntity>(sql, params);
      if (!updated) return null;
      return new RasamValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<RasamEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET rasam_est_rasam = false WHERE rasam_cod_rasam = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<RasamEntity>(sql, [id]);
      if (!deleted) return null;
      return new RasamValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

