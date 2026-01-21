import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClrfiEntity, ClrfiParams } from "../../domain/entity";
import { ClrfiPort } from "../../domain/port";
import { ClrfiValue } from "../../domain/value";
import { ClrfiEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClrfiDBRepository implements ClrfiPort {
  private readonly table = ClrfiEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClrfiParams): Promise<{ data: ClrfiEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clrfi_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.tieneResidenciaFiscal !== undefined) {
        whereConditions.push(`clrfi_ctr_resfi = $${queryParams.length + 1}`);
        queryParams.push(params.tieneResidenciaFiscal);
      }

      if (params?.paisId) {
        whereConditions.push(`clrfi_cod_nacio = $${queryParams.length + 1}`);
        queryParams.push(params.paisId);
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
        ORDER BY clrfi_cod_clrfi ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClrfiEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClrfiValue(item).toJson()),
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

  async findById(id: number): Promise<ClrfiEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clrfi_cod_clrfi = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClrfiEntity>(sql, [id]);
      return result ? new ClrfiValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClrfiEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clrfi_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClrfiEntity>(sql, [clienId]);
      return result ? new ClrfiValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClrfiEntity, client?: any): Promise<ClrfiEntity | null> {
    try {
      const clrfiValue = new ClrfiValue(data);
      const normalizedData = clrfiValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clrfi_cod_clien, clrfi_ctr_resfi, clrfi_cod_nacio, clrfi_dir_resfi,
          clrfi_des_provi, clrfi_des_ciuda, clrfi_cod_posta, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING *
      `;

      const params = [
        normalizedData.clrfi_cod_clien,
        normalizedData.clrfi_ctr_resfi,
        normalizedData.clrfi_cod_nacio ?? null,
        normalizedData.clrfi_dir_resfi ?? null,
        normalizedData.clrfi_des_provi ?? null,
        normalizedData.clrfi_des_ciuda ?? null,
        normalizedData.clrfi_cod_posta ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClrfiEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClrfiValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClrfiEntity): Promise<ClrfiEntity | null> {
    try {
      const clrfiValue = new ClrfiValue(data, id);
      const normalizedData = clrfiValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clrfi_ctr_resfi = $1,
          clrfi_cod_nacio = $2,
          clrfi_dir_resfi = $3,
          clrfi_des_provi = $4,
          clrfi_des_ciuda = $5,
          clrfi_cod_posta = $6,
          updated_by = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE clrfi_cod_clrfi = $8 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clrfi_ctr_resfi,
        normalizedData.clrfi_cod_nacio ?? null,
        normalizedData.clrfi_dir_resfi ?? null,
        normalizedData.clrfi_des_provi ?? null,
        normalizedData.clrfi_des_ciuda ?? null,
        normalizedData.clrfi_cod_posta ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClrfiEntity>(sql, params);
      return result ? new ClrfiValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClrfiEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clrfi_cod_clrfi = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClrfiEntity>(sql, [id]);
      return result ? new ClrfiValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

