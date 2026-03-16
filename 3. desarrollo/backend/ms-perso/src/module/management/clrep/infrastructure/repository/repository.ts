import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClrepEntity, ClrepParams } from "../../domain/entity";
import { ClrepPort } from "../../domain/port";
import { ClrepValue } from "../../domain/value";
import { ClrepEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClrepDBRepository implements ClrepPort {
  private readonly table = ClrepEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClrepParams): Promise<{ data: ClrepEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clrep_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.tipoRepresentante) {
        whereConditions.push(`clrep_cod_trep = $${queryParams.length + 1}`);
        queryParams.push(params.tipoRepresentante);
      }

      if (params?.personaId) {
        whereConditions.push(`clrep_cod_perso = $${queryParams.length + 1}`);
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
        ORDER BY clrep_cod_clrep ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClrepEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClrepValue(item).toJson()),
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

  async findById(id: number): Promise<ClrepEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clrep_cod_clrep = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClrepEntity>(sql, [id]);
      return result ? new ClrepValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClrepEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clrep_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClrepEntity>(sql, [clienId]);
      return result ? new ClrepValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClrepEntity, client?: any): Promise<ClrepEntity | null> {
    try {
      const clrepValue = new ClrepValue(data);
      const normalizedData = clrepValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clrep_cod_clien, clrep_cod_perso, clrep_cod_trep,
          clrep_fec_nombr, clrep_fec_venci, clrep_obs_clrep,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `;

      const params = [
        normalizedData.clrep_cod_clien,
        normalizedData.clrep_cod_perso,
        normalizedData.clrep_cod_trep,
        normalizedData.clrep_fec_nombr ?? null,
        normalizedData.clrep_fec_venci ?? null,
        normalizedData.clrep_obs_clrep ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClrepEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClrepValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClrepEntity): Promise<ClrepEntity | null> {
    try {
      const clrepValue = new ClrepValue(data, id);
      const normalizedData = clrepValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clrep_cod_perso = $1,
          clrep_cod_trep = $2,
          clrep_fec_nombr = $3,
          clrep_fec_venci = $4,
          clrep_obs_clrep = $5,
          updated_by = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE clrep_cod_clrep = $7 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clrep_cod_perso,
        normalizedData.clrep_cod_trep,
        normalizedData.clrep_fec_nombr ?? null,
        normalizedData.clrep_fec_venci ?? null,
        normalizedData.clrep_obs_clrep ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClrepEntity>(sql, params);
      return result ? new ClrepValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClrepEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clrep_cod_clrep = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClrepEntity>(sql, [id]);
      return result ? new ClrepValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

