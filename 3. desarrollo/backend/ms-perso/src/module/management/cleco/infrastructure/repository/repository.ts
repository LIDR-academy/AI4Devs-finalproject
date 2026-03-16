import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClecoEntity, ClecoParams } from "../../domain/entity";
import { ClecoPort } from "../../domain/port";
import { ClecoValue } from "../../domain/value";
import { ClecoEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClecoDBRepository implements ClecoPort {
  private readonly table = ClecoEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClecoParams): Promise<{ data: ClecoEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`cleco_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.sector) {
        whereConditions.push(`cleco_cod_sebce = $${queryParams.length + 1}`);
        queryParams.push(params.sector);
      }

      if (params?.actividad) {
        whereConditions.push(`cleco_cod_aebce = $${queryParams.length + 1}`);
        queryParams.push(params.actividad);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const sql = `
        SELECT * FROM ${this.table} 
        ${whereClause} 
        ORDER BY cleco_cod_cleco ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClecoEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClecoValue(item).toJson()),
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

  async findById(id: number): Promise<ClecoEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cleco_cod_cleco = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClecoEntity>(sql, [id]);
      return result ? new ClecoValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClecoEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cleco_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClecoEntity>(sql, [clienId]);
      return result ? new ClecoValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClecoEntity, client?: any): Promise<ClecoEntity | null> {
    try {
      const clecoValue = new ClecoValue(data);
      const normalizedData = clecoValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          cleco_cod_clien, cleco_cod_aebce, cleco_cod_saebc, cleco_cod_dtfin,
          cleco_cod_sebce, cleco_cod_ssgbc, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `;

      const params = [
        normalizedData.cleco_cod_clien,
        normalizedData.cleco_cod_aebce,
        normalizedData.cleco_cod_saebc,
        normalizedData.cleco_cod_dtfin,
        normalizedData.cleco_cod_sebce,
        normalizedData.cleco_cod_ssgbc,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClecoEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClecoValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClecoEntity): Promise<ClecoEntity | null> {
    try {
      const clecoValue = new ClecoValue(data, id);
      const normalizedData = clecoValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          cleco_cod_aebce = $1,
          cleco_cod_saebc = $2,
          cleco_cod_dtfin = $3,
          cleco_cod_sebce = $4,
          cleco_cod_ssgbc = $5,
          updated_by = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE cleco_cod_cleco = $7 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.cleco_cod_aebce,
        normalizedData.cleco_cod_saebc,
        normalizedData.cleco_cod_dtfin,
        normalizedData.cleco_cod_sebce,
        normalizedData.cleco_cod_ssgbc,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClecoEntity>(sql, params);
      return result ? new ClecoValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClecoEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE cleco_cod_cleco = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClecoEntity>(sql, [id]);
      return result ? new ClecoValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

