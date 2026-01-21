import { IfinaEntity, IfinaParams } from "../../domain/entity";
import { IfinaPort } from "../../domain/port";
import { IfinaValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { IfinaEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class IfinaDBRepository implements IfinaPort {
  private readonly table = IfinaEnum.table;

  constructor(private readonly pgRepository: PgService) { }

  public async findAll(params: IfinaParams): Promise<{ data: IfinaEntity[]; total: number; }> {
    try {
      const { page, pageSize, activo } = params;
      const skip = (page - 1) * pageSize;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (activo !== undefined) {
        whereConditions.push(`ifina_est_ifina = $${queryParams.length + 1}`);
        queryParams.push(activo);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const sql = `SELECT * FROM ${this.table} ${whereClause} ORDER BY ifina_cod_ifina ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, skip);

      const result = await this.pgRepository.queryList<IfinaEntity>(sql, queryParams);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams.slice(0, -2));
      const total = countResult?.total || 0;

      return {
        data: result.map(item => new IfinaValue(item).toJson()),
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

  public async findById(id: number): Promise<IfinaEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.table} WHERE ifina_cod_ifina = $1`;
      const geted = await this.pgRepository.queryGet<IfinaEntity>(sql, [id]);
      if (!geted) return null;
      return new IfinaValue(geted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  public async create(data: IfinaEntity): Promise<IfinaEntity | null> {
    try {
      const normalizedData = new IfinaValue(data);
      const sql = `INSERT INTO ${this.table} (ifina_nom_ifina, ifina_cod_spi, ifina_est_ifina) 
                   VALUES ($1, $2, $3) RETURNING *`;
      const params = [
        normalizedData.ifina_nom_ifina,
        normalizedData.ifina_cod_spi,
        normalizedData.ifina_est_ifina,
      ];
      const created = await this.pgRepository.queryGet<IfinaEntity>(sql, params);
      if (!created) return null;
      return new IfinaValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error,
      );
    }
  }

  public async update(id: number, data: IfinaEntity): Promise<IfinaEntity | null> {
    try {
      const normalizedData = new IfinaValue(data);
      const sql = `UPDATE ${this.table} SET 
                   ifina_nom_ifina = $1,
                   ifina_cod_spi = $2,
                   ifina_est_ifina = $3
                   WHERE ifina_cod_ifina = $4 RETURNING *`;
      const params = [
        normalizedData.ifina_nom_ifina,
        normalizedData.ifina_cod_spi,
        normalizedData.ifina_est_ifina,
        id,
      ];
      const updated = await this.pgRepository.queryGet<IfinaEntity>(sql, params);
      if (!updated) return null;
      return new IfinaValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }), 500, error);
    }
  }

  public async delete(id: number): Promise<IfinaEntity | null> {
    try {
      const sql = `UPDATE ${this.table} SET ifina_est_ifina = false WHERE ifina_cod_ifina = $1 RETURNING *`;
      const deleted = await this.pgRepository.queryGet<IfinaEntity>(sql, [id]);
      if (!deleted) return null;
      return new IfinaValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }), 500, error);
    }
  }
}

