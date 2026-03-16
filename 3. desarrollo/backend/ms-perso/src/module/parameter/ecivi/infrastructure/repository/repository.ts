import { EciviEntity, EciviParams } from "../../domain/entity";
import { EciviPort } from "../../domain/port";
import { EciviValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { EciviEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class EciviDBRepository implements EciviPort {
  private readonly table = EciviEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: EciviParams): Promise<{ data: EciviEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`ecivi_est_ecivi = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY ecivi_cod_ecivi ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<EciviEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new EciviValue(item).toJson()),
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

  public async findById(id: number): Promise<EciviEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE ecivi_cod_ecivi = $1`;
      const geted = await this.pgRepository.queryGet<EciviEntity>(sql, [id]);
      if (!geted) return null;
      return new EciviValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: EciviEntity): Promise<EciviEntity | null> {
    try {
      const normalizedData = new EciviValue(data);
      const sql = `INSERT INTO ${this.table} (ecivi_nom_ecivi, ecivi_req_conyu, ecivi_est_ecivi) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.ecivi_nom_ecivi,
        normalizedData.ecivi_req_conyu,
        normalizedData.ecivi_est_ecivi,
      ];
      const created = await this.pgRepository.queryGet<EciviEntity>(sql, params);
      if (!created) return null;
      return new EciviValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: EciviEntity): Promise<EciviEntity | null> {
    try {
      const normalizedData = new EciviValue(data);
      const sql = `UPDATE ${this.table} SET 
                   ecivi_nom_ecivi = $1,
                   ecivi_req_conyu = $2,
                   ecivi_est_ecivi = $3
                   WHERE ecivi_cod_ecivi = $4 RETURNING *`;
      const params = [
        normalizedData.ecivi_nom_ecivi,
        normalizedData.ecivi_req_conyu,
        normalizedData.ecivi_est_ecivi,
        id,
      ];
      const updated = await this.pgRepository.queryGet<EciviEntity>(sql, params);
      if (!updated) return null;
      return new EciviValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<EciviEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET ecivi_est_ecivi = false WHERE ecivi_cod_ecivi = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<EciviEntity>(sql, [id]);
      if (!deleted) return null;
      return new EciviValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

