import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClcygEntity, ClcygParams } from "../../domain/entity";
import { ClcygPort } from "../../domain/port";
import { ClcygValue } from "../../domain/value";
import { ClcygEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClcygDBRepository implements ClcygPort {
  private readonly table = ClcygEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClcygParams): Promise<{ data: ClcygEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clcyg_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.personaId) {
        whereConditions.push(`clcyg_cod_perso = $${queryParams.length + 1}`);
        queryParams.push(params.personaId);
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
        ORDER BY clcyg_cod_clcyg ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClcygEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClcygValue(item).toJson()),
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

  async findById(id: number): Promise<ClcygEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clcyg_cod_clcyg = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClcygEntity>(sql, [id]);
      return result ? new ClcygValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClcygEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clcyg_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClcygEntity>(sql, [clienId]);
      return result ? new ClcygValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClcygEntity, client?: any): Promise<ClcygEntity | null> {
    try {
      const clcygValue = new ClcygValue(data);
      const normalizedData = clcygValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clcyg_cod_clien, clcyg_cod_perso, clcyg_nom_empre,
          clcyg_des_cargo, clcyg_val_ingre, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `;

      const params = [
        normalizedData.clcyg_cod_clien,
        normalizedData.clcyg_cod_perso,
        normalizedData.clcyg_nom_empre ?? null,
        normalizedData.clcyg_des_cargo ?? null,
        normalizedData.clcyg_val_ingre ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClcygEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClcygValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClcygEntity): Promise<ClcygEntity | null> {
    try {
      const clcygValue = new ClcygValue(data, id);
      const normalizedData = clcygValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clcyg_cod_perso = $1,
          clcyg_nom_empre = $2,
          clcyg_des_cargo = $3,
          clcyg_val_ingre = $4,
          updated_by = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE clcyg_cod_clcyg = $6 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clcyg_cod_perso,
        normalizedData.clcyg_nom_empre ?? null,
        normalizedData.clcyg_des_cargo ?? null,
        normalizedData.clcyg_val_ingre ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClcygEntity>(sql, params);
      return result ? new ClcygValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClcygEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clcyg_cod_clcyg = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClcygEntity>(sql, [id]);
      return result ? new ClcygValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

