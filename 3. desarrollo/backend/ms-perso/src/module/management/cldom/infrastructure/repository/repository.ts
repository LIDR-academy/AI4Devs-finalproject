import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { CldomEntity, CldomParams } from "../../domain/entity";
import { CldomPort } from "../../domain/port";
import { CldomValue } from "../../domain/value";
import { CldomEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class CldomDBRepository implements CldomPort {
  private readonly table = CldomEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: CldomParams): Promise<{ data: CldomEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`cldom_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.provincia) {
        whereConditions.push(`cldom_cod_provi = $${queryParams.length + 1}`);
        queryParams.push(params.provincia);
      }

      if (params?.canton) {
        whereConditions.push(`cldom_cod_canto = $${queryParams.length + 1}`);
        queryParams.push(params.canton);
      }

      if (params?.parroquia) {
        whereConditions.push(`cldom_cod_parro = $${queryParams.length + 1}`);
        queryParams.push(params.parroquia);
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
        ORDER BY cldom_cod_cldom ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<CldomEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new CldomValue(item).toJson()),
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

  async findById(id: number): Promise<CldomEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cldom_cod_cldom = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<CldomEntity>(sql, [id]);
      return result ? new CldomValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<CldomEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cldom_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<CldomEntity>(sql, [clienId]);
      return result ? new CldomValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: CldomEntity, client?: any): Promise<CldomEntity | null> {
    try {
      const cldomValue = new CldomValue(data);
      const normalizedData = cldomValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          cldom_cod_clien, cldom_cod_provi, cldom_cod_canto, cldom_cod_parro,
          cldom_dir_domic, cldom_tlf_domic, cldom_sit_refdo,
          cldom_lat_coord, cldom_lon_coord, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const params = [
        normalizedData.cldom_cod_clien,
        normalizedData.cldom_cod_provi,
        normalizedData.cldom_cod_canto,
        normalizedData.cldom_cod_parro,
        normalizedData.cldom_dir_domic,
        normalizedData.cldom_tlf_domic ?? null,
        normalizedData.cldom_sit_refdo ?? null,
        normalizedData.cldom_lat_coord ?? null,
        normalizedData.cldom_lon_coord ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<CldomEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new CldomValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: CldomEntity): Promise<CldomEntity | null> {
    try {
      const cldomValue = new CldomValue(data, id);
      const normalizedData = cldomValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          cldom_cod_provi = $1,
          cldom_cod_canto = $2,
          cldom_cod_parro = $3,
          cldom_dir_domic = $4,
          cldom_tlf_domic = $5,
          cldom_sit_refdo = $6,
          cldom_lat_coord = $7,
          cldom_lon_coord = $8,
          updated_by = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE cldom_cod_cldom = $10 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.cldom_cod_provi,
        normalizedData.cldom_cod_canto,
        normalizedData.cldom_cod_parro,
        normalizedData.cldom_dir_domic,
        normalizedData.cldom_tlf_domic ?? null,
        normalizedData.cldom_sit_refdo ?? null,
        normalizedData.cldom_lat_coord ?? null,
        normalizedData.cldom_lon_coord ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<CldomEntity>(sql, params);
      return result ? new CldomValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<CldomEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE cldom_cod_cldom = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<CldomEntity>(sql, [id]);
      return result ? new CldomValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

