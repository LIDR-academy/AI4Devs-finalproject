import { InstrEntity, InstrParams } from "../../domain/entity";
import { InstrPort } from "../../domain/port";
import { InstrValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { InstrEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class InstrDBRepository implements InstrPort {
  private readonly table = InstrEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: InstrParams): Promise<{ data: InstrEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`instr_est_instr = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY instr_cod_instr ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<InstrEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new InstrValue(item).toJson()),
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

  public async findById(id: number): Promise<InstrEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE instr_cod_instr = $1`;
      const geted = await this.pgRepository.queryGet<InstrEntity>(sql, [id]);
      if (!geted) return null;
      return new InstrValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: InstrEntity): Promise<InstrEntity | null> {
    try {
      const normalizedData = new InstrValue(data);
      const sql = `INSERT INTO ${this.table} (instr_nom_instr, instr_cod_seps, instr_est_instr) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.instr_nom_instr,
        normalizedData.instr_cod_seps,
        normalizedData.instr_est_instr,
      ];
      const created = await this.pgRepository.queryGet<InstrEntity>(sql, params);
      if (!created) return null;
      return new InstrValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: InstrEntity): Promise<InstrEntity | null> {
    try {
      const normalizedData = new InstrValue(data);
      const sql = `UPDATE ${this.table} SET 
                   instr_nom_instr = $1,
                   instr_cod_seps = $2,
                   instr_est_instr = $3
                   WHERE instr_cod_instr = $4 RETURNING *`;
      const params = [
        normalizedData.instr_nom_instr,
        normalizedData.instr_cod_seps,
        normalizedData.instr_est_instr,
        id,
      ];
      const updated = await this.pgRepository.queryGet<InstrEntity>(sql, params);
      if (!updated) return null;
      return new InstrValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<InstrEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET instr_est_instr = false WHERE instr_cod_instr = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<InstrEntity>(sql, [id]);
      if (!deleted) return null;
      return new InstrValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

