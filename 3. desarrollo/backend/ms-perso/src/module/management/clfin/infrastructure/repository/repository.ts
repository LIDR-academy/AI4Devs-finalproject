import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClfinEntity, ClfinParams } from "../../domain/entity";
import { ClfinPort } from "../../domain/port";
import { ClfinValue } from "../../domain/value";
import { ClfinEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClfinDBRepository implements ClfinPort {
  private readonly table = ClfinEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClfinParams): Promise<{ data: ClfinEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clfin_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.tipoFinanciero) {
        whereConditions.push(`clfin_cod_tifin = $${queryParams.length + 1}`);
        queryParams.push(params.tipoFinanciero);
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
        ORDER BY clfin_cod_clfin ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClfinEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClfinValue(item).toJson()),
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

  async findById(id: number): Promise<ClfinEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clfin_cod_clfin = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClfinEntity>(sql, [id]);
      return result ? new ClfinValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClfinEntity[]> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clfin_cod_clien = $1 AND deleted_at IS NULL 
        ORDER BY clfin_cod_tifin ASC, clfin_cod_clfin ASC
      `;
      const data = await this.pgRepository.queryList<ClfinEntity>(sql, [clienId]);
      return data.map(item => new ClfinValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async findByClienIdAndTipo(clienId: number, tipoFinanciero: number): Promise<ClfinEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clfin_cod_clien = $1 AND clfin_cod_tifin = $2 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClfinEntity>(sql, [clienId, tipoFinanciero]);
      return result ? new ClfinValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienIdAndTipo' }),
        500,
        error
      );
    }
  }

  async create(data: ClfinEntity, client?: any): Promise<ClfinEntity | null> {
    try {
      const clfinValue = new ClfinValue(data);
      const normalizedData = clfinValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clfin_cod_clien, clfin_cod_tifin, clfin_val_monto,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5
        ) RETURNING *
      `;

      const params = [
        normalizedData.clfin_cod_clien,
        normalizedData.clfin_cod_tifin,
        normalizedData.clfin_val_monto,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClfinEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClfinValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClfinEntity): Promise<ClfinEntity | null> {
    try {
      const clfinValue = new ClfinValue(data, id);
      const normalizedData = clfinValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clfin_cod_tifin = $1,
          clfin_val_monto = $2,
          updated_by = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE clfin_cod_clfin = $4 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clfin_cod_tifin,
        normalizedData.clfin_val_monto,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClfinEntity>(sql, params);
      return result ? new ClfinValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClfinEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clfin_cod_clfin = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClfinEntity>(sql, [id]);
      return result ? new ClfinValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

