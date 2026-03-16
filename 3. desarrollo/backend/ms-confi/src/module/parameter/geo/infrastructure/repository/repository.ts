import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from "../../domain/entity";
import { GeoPort } from "../../domain/port";
import { ProvinciaValue, CantonValue, ParroquiaValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { GeoEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class GeoDBRepository implements GeoPort {

  private readonly tableProvi = GeoEnum.table.provi;
  private readonly tableCanto = GeoEnum.table.canto;
  private readonly tableParro = GeoEnum.table.parro;

  constructor(private readonly pgRepository: PgService) { }

  // ========== LECTURAS - PROVINCIAS ==========

  async findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]> {
    try {
      // Construir WHERE clause manualmente para manejar IS NULL correctamente
      const whereConditions: string[] = ['provi_fec_elimi IS NULL'];
      const params: any[] = [];
      
      if (active === true) {
        whereConditions.push(`provi_flg_acti = $${params.length + 1}`);
        params.push(true);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const sql = `SELECT * FROM ${this.tableProvi} ${whereClause} ORDER BY provi_cod_provi ASC`;
      
      console.log('[GeoDBRepository] findAllProvincias - SQL:', sql);
      console.log('[GeoDBRepository] findAllProvincias - params:', params);
      console.log('[GeoDBRepository] findAllProvincias - active filter:', active);

      const data = await this.pgRepository.queryList<ProvinciaEntity>(sql, params);

      console.log('[GeoDBRepository] findAllProvincias - raw data count:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('[GeoDBRepository] findAllProvincias - first item:', JSON.stringify(data[0], null, 2));
      }

      return data.map(item => new ProvinciaValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableProvi, method: 'findAllProvincias' }),
        500,
        error
      );
    }
  }

  // ========== LECTURAS - CANTONES ==========

  async findCantonesByProvincia(proviCodProv: string, active?: boolean): Promise<CantonEntity[]> {
    try {
      // Primero obtener el ID de la provincia por código SEPS usando SQL directo
      const provSql = `SELECT * FROM ${this.tableProvi} WHERE provi_cod_prov = $1 AND provi_fec_elimi IS NULL LIMIT 1`;
      const provincias = await this.pgRepository.queryList<ProvinciaEntity>(provSql, [proviCodProv]);

      if (provincias.length === 0) {
        return [];
      }

      const proviId = provincias[0].provi_cod_provi;
      
      // Construir WHERE clause manualmente para manejar IS NULL correctamente
      const whereConditions: string[] = [`provi_cod_provi = $1`, 'canto_fec_elimi IS NULL'];
      const params: any[] = [proviId];
      
      if (active === true) {
        whereConditions.push(`canto_flg_acti = $${params.length + 1}`);
        params.push(true);
      }

      const whereClause = whereConditions.join(' AND ');
      const sql = `SELECT * FROM ${this.tableCanto} WHERE ${whereClause} ORDER BY canto_cod_canto ASC`;
      
      const data = await this.pgRepository.queryList<CantonEntity>(sql, params);

      return data.map(item => new CantonValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCanto, method: 'findCantonesByProvincia' }),
        500,
        error
      );
    }
  }

  // ========== LECTURAS - PARROQUIAS ==========

  async findParroquiasByCanton(proviCodProv: string, cantoCodCant: string, active?: boolean): Promise<ParroquiaEntity[]> {
    try {
      // Obtener provincia por código SEPS usando SQL directo
      const provSql = `SELECT * FROM ${this.tableProvi} WHERE provi_cod_prov = $1 AND provi_fec_elimi IS NULL LIMIT 1`;
      const provincias = await this.pgRepository.queryList<ProvinciaEntity>(provSql, [proviCodProv]);

      if (provincias.length === 0) {
        return [];
      }

      const proviId = provincias[0].provi_cod_provi;

      // Obtener cantón por código SEPS y provincia usando SQL directo
      const cantoSql = `SELECT * FROM ${this.tableCanto} WHERE provi_cod_provi = $1 AND canto_cod_cant = $2 AND canto_fec_elimi IS NULL LIMIT 1`;
      const cantones = await this.pgRepository.queryList<CantonEntity>(cantoSql, [proviId, cantoCodCant]);

      if (cantones.length === 0) {
        return [];
      }

      const cantoId = cantones[0].canto_cod_canto;
      
      // Construir WHERE clause manualmente para manejar IS NULL correctamente
      const whereConditions: string[] = [`canto_cod_canto = $1`, 'parro_fec_elimi IS NULL'];
      const params: any[] = [cantoId];
      
      if (active === true) {
        whereConditions.push(`parro_flg_acti = $${params.length + 1}`);
        params.push(true);
      }

      const whereClause = whereConditions.join(' AND ');
      const sql = `SELECT * FROM ${this.tableParro} WHERE ${whereClause} ORDER BY parro_cod_parro ASC`;
      
      const data = await this.pgRepository.queryList<ParroquiaEntity>(sql, params);

      return data.map(item => new ParroquiaValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableParro, method: 'findParroquiasByCanton' }),
        500,
        error
      );
    }
  }

  async searchParroquias(query: string, limit: number): Promise<ParroquiaEntity[]> {
    try {
      // Usar búsqueda con ILIKE (o pg_trgm si está disponible)
      const sql = `
        SELECT p.*
        FROM ${this.tableParro} p
        INNER JOIN ${this.tableCanto} c ON p.canto_cod_canto = c.canto_cod_canto
        INNER JOIN ${this.tableProvi} pr ON c.provi_cod_provi = pr.provi_cod_provi
        WHERE p.parro_fec_elimi IS NULL
          AND p.parro_flg_acti = true
          AND (p.parro_nom_parro ILIKE $1 OR c.canto_nom_canto ILIKE $1 OR pr.provi_nom_provi ILIKE $1)
        ORDER BY p.parro_nom_parro ASC
        LIMIT $2
      `;

      const searchTerm = `%${query}%`;
      const data = await this.pgRepository.query<ParroquiaEntity>(sql, [searchTerm, limit]);

      return data.map(item => new ParroquiaValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableParro, method: 'searchParroquias' }),
        500,
        error
      );
    }
  }

  // ========== ADMIN - PROVINCIAS ==========

  async createProvincia(data: ProvinciaEntity): Promise<ProvinciaEntity | null> {
    try {
      const entityData = {
        provi_cod_prov: data.provi_cod_prov,
        provi_nom_provi: data.provi_nom_provi,
        provi_flg_acti: data.provi_flg_acti ?? true,
        provi_fec_creac: new Date(),
        provi_fec_modif: new Date(),
      };

      const created = await this.pgRepository.create<ProvinciaEntity>(this.tableProvi, entityData);
      if (!created) return null;
      return new ProvinciaValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableProvi, method: 'createProvincia' }),
        500,
        error
      );
    }
  }

  async updateProvincia(id: number, data: ProvinciaEntity): Promise<ProvinciaEntity | null> {
    try {
      const entityData = {
        provi_cod_prov: data.provi_cod_prov,
        provi_nom_provi: data.provi_nom_provi,
        provi_flg_acti: data.provi_flg_acti,
        provi_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<ProvinciaEntity>(
        this.tableProvi,
        entityData,
        { provi_cod_provi: id }
      );
      if (!updated) return null;
      return new ProvinciaValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableProvi, method: 'updateProvincia' }),
        500,
        error
      );
    }
  }

  async deleteProvincia(id: number): Promise<ProvinciaEntity | null> {
    try {
      // Soft delete: actualizar fec_elimi
      const entityData = {
        provi_fec_elimi: new Date(),
        provi_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<ProvinciaEntity>(
        this.tableProvi,
        entityData,
        { provi_cod_provi: id }
      );
      if (!updated) return null;
      return new ProvinciaValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableProvi, method: 'deleteProvincia' }),
        500,
        error
      );
    }
  }

  // ========== ADMIN - CANTONES ==========

  async createCanton(data: CantonEntity): Promise<CantonEntity | null> {
    try {
      const entityData = {
        provi_cod_provi: data.provi_cod_provi,
        canto_cod_cant: data.canto_cod_cant,
        canto_nom_canto: data.canto_nom_canto,
        canto_flg_acti: data.canto_flg_acti ?? true,
        canto_fec_creac: new Date(),
        canto_fec_modif: new Date(),
      };

      const created = await this.pgRepository.create<CantonEntity>(this.tableCanto, entityData);
      if (!created) return null;
      return new CantonValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCanto, method: 'createCanton' }),
        500,
        error
      );
    }
  }

  async updateCanton(id: number, data: CantonEntity): Promise<CantonEntity | null> {
    try {
      const entityData = {
        provi_cod_provi: data.provi_cod_provi,
        canto_cod_cant: data.canto_cod_cant,
        canto_nom_canto: data.canto_nom_canto,
        canto_flg_acti: data.canto_flg_acti,
        canto_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<CantonEntity>(
        this.tableCanto,
        entityData,
        { canto_cod_canto: id }
      );
      if (!updated) return null;
      return new CantonValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCanto, method: 'updateCanton' }),
        500,
        error
      );
    }
  }

  async deleteCanton(id: number): Promise<CantonEntity | null> {
    try {
      // Soft delete: actualizar fec_elimi
      const entityData = {
        canto_fec_elimi: new Date(),
        canto_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<CantonEntity>(
        this.tableCanto,
        entityData,
        { canto_cod_canto: id }
      );
      if (!updated) return null;
      return new CantonValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCanto, method: 'deleteCanton' }),
        500,
        error
      );
    }
  }

  // ========== ADMIN - PARROQUIAS ==========

  async createParroquia(data: ParroquiaEntity): Promise<ParroquiaEntity | null> {
    try {
      const entityData = {
        canto_cod_canto: data.canto_cod_canto,
        parro_cod_parr: data.parro_cod_parr,
        parro_nom_parro: data.parro_nom_parro,
        parro_tip_area: data.parro_tip_area,
        parro_flg_acti: data.parro_flg_acti ?? true,
        parro_fec_creac: new Date(),
        parro_fec_modif: new Date(),
      };

      const created = await this.pgRepository.create<ParroquiaEntity>(this.tableParro, entityData);
      if (!created) return null;

      // Obtener datos completos con JOIN para incluir información de cantón y provincia
      const sql = `
        SELECT 
          p.*,
          c.canto_cod_cant,
          c.canto_nom_canto,
          pr.provi_cod_prov,
          pr.provi_nom_provi
        FROM ${this.tableParro} p
        INNER JOIN ${this.tableCanto} c ON p.canto_cod_canto = c.canto_cod_canto
        INNER JOIN ${this.tableProvi} pr ON c.provi_cod_provi = pr.provi_cod_provi
        WHERE p.parro_cod_parro = $1
      `;
      
      const fullData = await this.pgRepository.queryGet<ParroquiaEntity & { canto_cod_cant: string; canto_nom_canto: string; provi_cod_prov: string; provi_nom_provi: string }>(sql, [created.parro_cod_parro]);
      
      if (!fullData) return new ParroquiaValue(created).toJson();
      
      // Combinar datos creados con datos relacionados
      const combinedData = {
        ...fullData,
        ...created,
      };
      
      return new ParroquiaValue(combinedData).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableParro, method: 'createParroquia' }),
        500,
        error
      );
    }
  }

  async updateParroquia(id: number, data: ParroquiaEntity): Promise<ParroquiaEntity | null> {
    try {
      const entityData = {
        canto_cod_canto: data.canto_cod_canto,
        parro_cod_parr: data.parro_cod_parr,
        parro_nom_parro: data.parro_nom_parro,
        parro_tip_area: data.parro_tip_area,
        parro_flg_acti: data.parro_flg_acti,
        parro_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<ParroquiaEntity>(
        this.tableParro,
        entityData,
        { parro_cod_parro: id }
      );
      if (!updated) return null;

      // Obtener datos completos con JOIN para incluir información de cantón y provincia
      const sql = `
        SELECT 
          p.*,
          c.canto_cod_cant,
          c.canto_nom_canto,
          pr.provi_cod_prov,
          pr.provi_nom_provi
        FROM ${this.tableParro} p
        INNER JOIN ${this.tableCanto} c ON p.canto_cod_canto = c.canto_cod_canto
        INNER JOIN ${this.tableProvi} pr ON c.provi_cod_provi = pr.provi_cod_provi
        WHERE p.parro_cod_parro = $1
      `;
      
      const fullData = await this.pgRepository.queryGet<ParroquiaEntity & { canto_cod_cant: string; canto_nom_canto: string; provi_cod_prov: string; provi_nom_provi: string }>(sql, [id]);
      
      if (!fullData) return new ParroquiaValue(updated).toJson();
      
      // Combinar datos actualizados con datos relacionados
      const combinedData = {
        ...fullData,
        ...updated,
      };
      
      return new ParroquiaValue(combinedData).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableParro, method: 'updateParroquia' }),
        500,
        error
      );
    }
  }

  async deleteParroquia(id: number): Promise<ParroquiaEntity | null> {
    try {
      // Soft delete: actualizar fec_elimi
      const entityData = {
        parro_fec_elimi: new Date(),
        parro_fec_modif: new Date(),
      };

      const updated = await this.pgRepository.update<ParroquiaEntity>(
        this.tableParro,
        entityData,
        { parro_cod_parro: id }
      );
      if (!updated) return null;
      return new ParroquiaValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableParro, method: 'deleteParroquia' }),
        500,
        error
      );
    }
  }
}

