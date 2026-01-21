import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClasmEntity, ClasmParams } from "../../domain/entity";
import { ClasmPort } from "../../domain/port";
import { ClasmValue } from "../../domain/value";
import { ClasmEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClasmDBRepository implements ClasmPort {
  private readonly table = ClasmEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClasmParams): Promise<{ data: ClasmEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clasm_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.esDirectivo !== undefined) {
        whereConditions.push(`clasm_ctr_direc = $${queryParams.length + 1}`);
        queryParams.push(params.esDirectivo);
      }

      if (params?.tipoRepresentante) {
        whereConditions.push(`clasm_cod_rasam = $${queryParams.length + 1}`);
        queryParams.push(params.tipoRepresentante);
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
        ORDER BY clasm_cod_clasm ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClasmEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClasmValue(item).toJson()),
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

  async findById(id: number): Promise<ClasmEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clasm_cod_clasm = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClasmEntity>(sql, [id]);
      return result ? new ClasmValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClasmEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clasm_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClasmEntity>(sql, [clienId]);
      return result ? new ClasmValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClasmEntity, client?: any): Promise<ClasmEntity | null> {
    try {
      const clasmValue = new ClasmValue(data);
      const normalizedData = clasmValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clasm_cod_clien, clasm_cod_rasam, clasm_fec_rasam,
          clasm_ctr_direc, clasm_fec_direc, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `;

      const params = [
        normalizedData.clasm_cod_clien,
        normalizedData.clasm_cod_rasam ?? null,
        normalizedData.clasm_fec_rasam ?? null,
        normalizedData.clasm_ctr_direc,
        normalizedData.clasm_fec_direc ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClasmEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClasmValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClasmEntity): Promise<ClasmEntity | null> {
    try {
      const clasmValue = new ClasmValue(data, id);
      const normalizedData = clasmValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clasm_cod_rasam = $1,
          clasm_fec_rasam = $2,
          clasm_ctr_direc = $3,
          clasm_fec_direc = $4,
          updated_by = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE clasm_cod_clasm = $6 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clasm_cod_rasam ?? null,
        normalizedData.clasm_fec_rasam ?? null,
        normalizedData.clasm_ctr_direc,
        normalizedData.clasm_fec_direc ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClasmEntity>(sql, params);
      return result ? new ClasmValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClasmEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clasm_cod_clasm = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClasmEntity>(sql, [id]);
      return result ? new ClasmValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

