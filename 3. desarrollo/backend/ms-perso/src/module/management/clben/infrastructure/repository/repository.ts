import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClbenEntity, ClbenParams } from "../../domain/entity";
import { ClbenPort } from "../../domain/port";
import { ClbenValue } from "../../domain/value";
import { ClbenEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class ClbenDBRepository implements ClbenPort {
  private readonly table = ClbenEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClbenParams): Promise<{ data: ClbenEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.usuarioBancaDigitalId) {
        whereConditions.push(`clben_cod_clbnc = $${queryParams.length + 1}`);
        queryParams.push(params.usuarioBancaDigitalId);
      }

      if (params?.activo !== undefined) {
        whereConditions.push(`clben_ctr_activ = $${queryParams.length + 1}`);
        queryParams.push(params.activo);
      }

      if (params?.externo !== undefined) {
        whereConditions.push(`clben_ctr_exter = $${queryParams.length + 1}`);
        queryParams.push(params.externo);
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
        ORDER BY clben_cod_clben ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClbenEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClbenValue(item).toJson()),
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

  async findById(id: number): Promise<ClbenEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clben_cod_clben = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClbenEntity>(sql, [id]);
      return result ? new ClbenValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClbncId(clbncId: number): Promise<ClbenEntity[]> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clben_cod_clbnc = $1 AND deleted_at IS NULL 
        ORDER BY clben_cod_clben ASC
      `;
      const data = await this.pgRepository.queryList<ClbenEntity>(sql, [clbncId]);
      return data.map(item => new ClbenValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClbncId' }),
        500,
        error
      );
    }
  }

  async create(data: ClbenEntity, client?: any): Promise<ClbenEntity | null> {
    try {
      const clbenValue = new ClbenValue(data);
      const normalizedData = clbenValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clben_cod_clbnc, clben_num_cuent, clben_cod_tcuen, clben_cod_ifina,
          clben_nom_benef, clben_ide_benef, clben_cod_tiden, clben_ema_benef,
          clben_ctr_exter, clben_ali_benef, clben_ctr_activ, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING *
      `;

      const params = [
        normalizedData.clben_cod_clbnc,
        normalizedData.clben_num_cuent,
        normalizedData.clben_cod_tcuen,
        normalizedData.clben_cod_ifina ?? null,
        normalizedData.clben_nom_benef,
        normalizedData.clben_ide_benef,
        normalizedData.clben_cod_tiden ?? null,
        normalizedData.clben_ema_benef ?? null,
        normalizedData.clben_ctr_exter,
        normalizedData.clben_ali_benef ?? null,
        normalizedData.clben_ctr_activ,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClbenEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClbenValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClbenEntity): Promise<ClbenEntity | null> {
    try {
      const clbenValue = new ClbenValue(data, id);
      const normalizedData = clbenValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clben_num_cuent = $1,
          clben_cod_tcuen = $2,
          clben_cod_ifina = $3,
          clben_nom_benef = $4,
          clben_ide_benef = $5,
          clben_cod_tiden = $6,
          clben_ema_benef = $7,
          clben_ctr_exter = $8,
          clben_ali_benef = $9,
          clben_ctr_activ = $10,
          updated_by = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE clben_cod_clben = $12 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clben_num_cuent,
        normalizedData.clben_cod_tcuen,
        normalizedData.clben_cod_ifina ?? null,
        normalizedData.clben_nom_benef,
        normalizedData.clben_ide_benef,
        normalizedData.clben_cod_tiden ?? null,
        normalizedData.clben_ema_benef ?? null,
        normalizedData.clben_ctr_exter,
        normalizedData.clben_ali_benef ?? null,
        normalizedData.clben_ctr_activ,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClbenEntity>(sql, params);
      return result ? new ClbenValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClbenEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clben_cod_clben = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClbenEntity>(sql, [id]);
      return result ? new ClbenValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

