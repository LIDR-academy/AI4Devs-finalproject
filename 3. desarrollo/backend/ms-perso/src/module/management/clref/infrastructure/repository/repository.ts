import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClrefEntity, ClrefParams } from "../../domain/entity";
import { ClrefPort } from "../../domain/port";
import { ClrefValue } from "../../domain/value";
import { ClrefEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClrefDBRepository implements ClrefPort {
  private readonly table = ClrefEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClrefParams): Promise<{ data: ClrefEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clref_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.tipoReferencia) {
        whereConditions.push(`clref_cod_tiref = $${queryParams.length + 1}`);
        queryParams.push(params.tipoReferencia);
      }

      if (params?.personaId) {
        whereConditions.push(`clref_cod_perso = $${queryParams.length + 1}`);
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
        ORDER BY clref_cod_clref ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClrefEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClrefValue(item).toJson()),
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

  async findById(id: number): Promise<ClrefEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clref_cod_clref = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClrefEntity>(sql, [id]);
      return result ? new ClrefValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClrefEntity[]> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clref_cod_clien = $1 AND deleted_at IS NULL 
        ORDER BY clref_cod_clref ASC
      `;
      const data = await this.pgRepository.queryList<ClrefEntity>(sql, [clienId]);
      return data.map(item => new ClrefValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: ClrefEntity, client?: any): Promise<ClrefEntity | null> {
    try {
      const clrefValue = new ClrefValue(data);
      const normalizedData = clrefValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clref_cod_clien, clref_cod_tiref, clref_cod_perso, clref_nom_refer,
          clref_dir_refer, clref_tlf_refer, clref_num_ctadp, clref_val_saldo,
          clref_fec_apert, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const params = [
        normalizedData.clref_cod_clien,
        normalizedData.clref_cod_tiref,
        normalizedData.clref_cod_perso ?? null,
        normalizedData.clref_nom_refer ?? null,
        normalizedData.clref_dir_refer ?? null,
        normalizedData.clref_tlf_refer ?? null,
        normalizedData.clref_num_ctadp ?? null,
        normalizedData.clref_val_saldo ?? null,
        normalizedData.clref_fec_apert ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClrefEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClrefValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClrefEntity): Promise<ClrefEntity | null> {
    try {
      const clrefValue = new ClrefValue(data, id);
      const normalizedData = clrefValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clref_cod_tiref = $1,
          clref_cod_perso = $2,
          clref_nom_refer = $3,
          clref_dir_refer = $4,
          clref_tlf_refer = $5,
          clref_num_ctadp = $6,
          clref_val_saldo = $7,
          clref_fec_apert = $8,
          updated_by = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE clref_cod_clref = $10 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clref_cod_tiref,
        normalizedData.clref_cod_perso ?? null,
        normalizedData.clref_nom_refer ?? null,
        normalizedData.clref_dir_refer ?? null,
        normalizedData.clref_tlf_refer ?? null,
        normalizedData.clref_num_ctadp ?? null,
        normalizedData.clref_val_saldo ?? null,
        normalizedData.clref_fec_apert ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClrefEntity>(sql, params);
      return result ? new ClrefValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClrefEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clref_cod_clref = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClrefEntity>(sql, [id]);
      return result ? new ClrefValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

