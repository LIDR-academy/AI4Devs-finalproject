import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { CllabEntity, CllabParams } from "../../domain/entity";
import { CllabPort } from "../../domain/port";
import { CllabValue } from "../../domain/value";
import { CllabEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";

@Injectable()
export class CllabDBRepository implements CllabPort {
  private readonly table = CllabEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: CllabParams): Promise<{ data: CllabEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`cllab_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.dependenciaId) {
        whereConditions.push(`cllab_cod_depen = $${queryParams.length + 1}`);
        queryParams.push(params.dependenciaId);
      }

      if (params?.tipoContrato) {
        whereConditions.push(`cllab_cod_tcont = $${queryParams.length + 1}`);
        queryParams.push(params.tipoContrato);
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
        ORDER BY cllab_cod_cllab ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<CllabEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new CllabValue(item).toJson()),
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

  async findById(id: number): Promise<CllabEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cllab_cod_cllab = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<CllabEntity>(sql, [id]);
      return result ? new CllabValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<CllabEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE cllab_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<CllabEntity>(sql, [clienId]);
      return result ? new CllabValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async create(data: CllabEntity, client?: any): Promise<CllabEntity | null> {
    try {
      const cllabValue = new CllabValue(data);
      const normalizedData = cllabValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          cllab_cod_clien, cllab_cod_depen, cllab_des_cargo, cllab_cod_tcont,
          cllab_fec_ingre, cllab_fec_finct, cllab_val_ingre,
          cllab_dir_traba, cllab_tlf_traba, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const params = [
        normalizedData.cllab_cod_clien,
        normalizedData.cllab_cod_depen ?? null,
        normalizedData.cllab_des_cargo ?? null,
        normalizedData.cllab_cod_tcont ?? null,
        normalizedData.cllab_fec_ingre ?? null,
        normalizedData.cllab_fec_finct ?? null,
        normalizedData.cllab_val_ingre ?? null,
        normalizedData.cllab_dir_traba ?? null,
        normalizedData.cllab_tlf_traba ?? null,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<CllabEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new CllabValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: CllabEntity): Promise<CllabEntity | null> {
    try {
      const cllabValue = new CllabValue(data, id);
      const normalizedData = cllabValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          cllab_cod_depen = $1,
          cllab_des_cargo = $2,
          cllab_cod_tcont = $3,
          cllab_fec_ingre = $4,
          cllab_fec_finct = $5,
          cllab_val_ingre = $6,
          cllab_dir_traba = $7,
          cllab_tlf_traba = $8,
          updated_by = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE cllab_cod_cllab = $10 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.cllab_cod_depen ?? null,
        normalizedData.cllab_des_cargo ?? null,
        normalizedData.cllab_cod_tcont ?? null,
        normalizedData.cllab_fec_ingre ?? null,
        normalizedData.cllab_fec_finct ?? null,
        normalizedData.cllab_val_ingre ?? null,
        normalizedData.cllab_dir_traba ?? null,
        normalizedData.cllab_tlf_traba ?? null,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<CllabEntity>(sql, params);
      return result ? new CllabValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<CllabEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE cllab_cod_cllab = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<CllabEntity>(sql, [id]);
      return result ? new CllabValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }
}

