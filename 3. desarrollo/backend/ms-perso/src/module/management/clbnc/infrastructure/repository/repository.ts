import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { ClbncEntity, ClbncParams } from "../../domain/entity";
import { ClbncPort } from "../../domain/port";
import { ClbncValue } from "../../domain/value";
import { ClbncEnum } from "../enum/enum";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class ClbncDBRepository implements ClbncPort {
  private readonly table = ClbncEnum.table;

  constructor(private readonly pgRepository: PgService) {}

  async findAll(params?: ClbncParams): Promise<{ data: ClbncEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['deleted_at IS NULL'];
      const queryParams: any[] = [];

      if (params?.clienteId) {
        whereConditions.push(`clbnc_cod_clien = $${queryParams.length + 1}`);
        queryParams.push(params.clienteId);
      }

      if (params?.username) {
        whereConditions.push(`LOWER(clbnc_usr_banca) = LOWER($${queryParams.length + 1})`);
        queryParams.push(params.username);
      }

      if (params?.activo !== undefined) {
        whereConditions.push(`clbnc_ctr_activ = $${queryParams.length + 1}`);
        queryParams.push(params.activo);
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
        ORDER BY clbnc_cod_clbnc ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const data = await this.pgRepository.queryList<ClbncEntity>(sql, [...queryParams, pageSize, skip]);

      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.table} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;

      return {
        data: data.map(item => new ClbncValue(item).toJson()),
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

  async findById(id: number): Promise<ClbncEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clbnc_cod_clbnc = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [id]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByClienId(clienId: number): Promise<ClbncEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE clbnc_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [clienId]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByClienId' }),
        500,
        error
      );
    }
  }

  async findByUsername(username: string): Promise<ClbncEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table} 
        WHERE LOWER(clbnc_usr_banca) = LOWER($1) AND deleted_at IS NULL 
        LIMIT 1
      `;
      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [username]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.table, method: 'findByUsername' }),
        500,
        error
      );
    }
  }

  async create(data: ClbncEntity, client?: any): Promise<ClbncEntity | null> {
    try {
      const clbncValue = new ClbncValue(data);
      const normalizedData = clbncValue.toJson();

      const sql = `
        INSERT INTO ${this.table} (
          clbnc_cod_clien, clbnc_usr_banca, clbnc_pwd_banca, clbnc_fec_regis,
          clbnc_fec_ultin, clbnc_tok_sesio, clbnc_tok_notif, clbnc_imei_disp,
          clbnc_nom_dispo, clbnc_det_dispo, clbnc_ipa_ultin, clbnc_lat_ultin,
          clbnc_lon_ultin, clbnc_geo_ultin, clbnc_msj_bienv, clbnc_ctr_activ,
          clbnc_ctr_termi, clbnc_lim_diario, clbnc_lim_mensu, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *
      `;

      const params = [
        normalizedData.clbnc_cod_clien,
        normalizedData.clbnc_usr_banca,
        normalizedData.clbnc_pwd_banca,
        normalizedData.clbnc_fec_regis,
        normalizedData.clbnc_fec_ultin ?? null,
        normalizedData.clbnc_tok_sesio ?? null,
        normalizedData.clbnc_tok_notif ?? null,
        normalizedData.clbnc_imei_disp ?? null,
        normalizedData.clbnc_nom_dispo ?? null,
        normalizedData.clbnc_det_dispo ?? null,
        normalizedData.clbnc_ipa_ultin ?? null,
        normalizedData.clbnc_lat_ultin ?? null,
        normalizedData.clbnc_lon_ultin ?? null,
        normalizedData.clbnc_geo_ultin ?? null,
        normalizedData.clbnc_msj_bienv ?? null,
        normalizedData.clbnc_ctr_activ,
        normalizedData.clbnc_ctr_termi,
        normalizedData.clbnc_lim_diario,
        normalizedData.clbnc_lim_mensu,
        normalizedData.created_by,
        normalizedData.updated_by,
      ];

      // Si se pasa un client (transacción), usar ese, sino usar pgRepository
      const result = client
        ? await client.query(sql, params)
        : await this.pgRepository.queryGet<ClbncEntity>(sql, params);

      const created = client ? result.rows[0] : result;
      return created ? new ClbncValue(created).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.table, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClbncEntity): Promise<ClbncEntity | null> {
    try {
      const clbncValue = new ClbncValue(data, id);
      const normalizedData = clbncValue.toJson();

      const sql = `
        UPDATE ${this.table} SET
          clbnc_usr_banca = $1,
          clbnc_pwd_banca = $2,
          clbnc_fec_ultin = $3,
          clbnc_tok_sesio = $4,
          clbnc_tok_notif = $5,
          clbnc_imei_disp = $6,
          clbnc_nom_dispo = $7,
          clbnc_det_dispo = $8,
          clbnc_ipa_ultin = $9,
          clbnc_lat_ultin = $10,
          clbnc_lon_ultin = $11,
          clbnc_geo_ultin = $12,
          clbnc_msj_bienv = $13,
          clbnc_ctr_activ = $14,
          clbnc_ctr_termi = $15,
          clbnc_lim_diario = $16,
          clbnc_lim_mensu = $17,
          updated_by = $18,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $19 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        normalizedData.clbnc_usr_banca,
        normalizedData.clbnc_pwd_banca,
        normalizedData.clbnc_fec_ultin ?? null,
        normalizedData.clbnc_tok_sesio ?? null,
        normalizedData.clbnc_tok_notif ?? null,
        normalizedData.clbnc_imei_disp ?? null,
        normalizedData.clbnc_nom_dispo ?? null,
        normalizedData.clbnc_det_dispo ?? null,
        normalizedData.clbnc_ipa_ultin ?? null,
        normalizedData.clbnc_lat_ultin ?? null,
        normalizedData.clbnc_lon_ultin ?? null,
        normalizedData.clbnc_geo_ultin ?? null,
        normalizedData.clbnc_msj_bienv ?? null,
        normalizedData.clbnc_ctr_activ,
        normalizedData.clbnc_ctr_termi,
        normalizedData.clbnc_lim_diario,
        normalizedData.clbnc_lim_mensu,
        normalizedData.updated_by,
        id,
      ];

      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, params);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClbncEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $1 AND deleted_at IS NULL
        RETURNING *
      `;
      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [id]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.table, method: 'delete' }),
        500,
        error
      );
    }
  }

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========

  async login(
    username: string,
    password: string,
    deviceInfo: {
      imei?: string | null;
      nombreDispositivo?: string | null;
      detallesDispositivo?: string | null;
      ip?: string | null;
      latitud?: number | null;
      longitud?: number | null;
      geocoder?: string | null;
    }
  ): Promise<{ usuario: ClbncEntity; tokenSesion: string } | null> {
    try {
      // 1. Buscar usuario por username
      const usuario = await this.findByUsername(username);
      if (!usuario) {
        return null;
      }

      // 2. Verificar que esté activo
      if (!usuario.clbnc_ctr_activ) {
        throw new Error('Usuario de banca digital inactivo');
      }

      // 3. Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.clbnc_pwd_banca);
      if (!passwordValido) {
        return null;
      }

      // 4. Generar token de sesión
      const tokenSesion = randomBytes(32).toString('hex');

      // 5. Actualizar información de sesión y dispositivo
      const updateSql = `
        UPDATE ${this.table} SET
          clbnc_fec_ultin = CURRENT_TIMESTAMP,
          clbnc_tok_sesio = $1,
          clbnc_imei_disp = $2,
          clbnc_nom_dispo = $3,
          clbnc_det_dispo = $4,
          clbnc_ipa_ultin = $5,
          clbnc_lat_ultin = $6,
          clbnc_lon_ultin = $7,
          clbnc_geo_ultin = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $9 AND deleted_at IS NULL
        RETURNING *
      `;

      const params = [
        tokenSesion,
        deviceInfo.imei ?? null,
        deviceInfo.nombreDispositivo ?? null,
        deviceInfo.detallesDispositivo ?? null,
        deviceInfo.ip ?? null,
        deviceInfo.latitud ?? null,
        deviceInfo.longitud ?? null,
        deviceInfo.geocoder ?? null,
        usuario.clbnc_cod_clbnc,
      ];

      const updated = await this.pgRepository.queryGet<ClbncEntity>(updateSql, params);
      if (!updated) {
        return null;
      }

      return {
        usuario: new ClbncValue(updated).toJson(),
        tokenSesion,
      };
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'validator', resource: this.table, method: 'login' }),
        500,
        error
      );
    }
  }

  async changePassword(
    id: number,
    passwordActual: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null> {
    try {
      // 1. Buscar usuario
      const usuario = await this.findById(id);
      if (!usuario) {
        return null;
      }

      // 2. Verificar password actual
      const passwordValido = await bcrypt.compare(passwordActual, usuario.clbnc_pwd_banca);
      if (!passwordValido) {
        throw new Error('Password actual incorrecto');
      }

      // 3. Hashear nuevo password
      const passwordHash = await bcrypt.hash(passwordNuevo, 12);

      // 4. Actualizar password
      const updateSql = `
        UPDATE ${this.table} SET
          clbnc_pwd_banca = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $2 AND deleted_at IS NULL
        RETURNING *
      `;

      const updated = await this.pgRepository.queryGet<ClbncEntity>(updateSql, [passwordHash, id]);
      return updated ? new ClbncValue(updated).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'changePassword' }),
        500,
        error
      );
    }
  }

  async iniciarRecuperacionPassword(username: string): Promise<{ codigoVerificacion: string; expiraEn: Date } | null> {
    try {
      // 1. Buscar usuario
      const usuario = await this.findByUsername(username);
      if (!usuario) {
        return null; // No revelar que el usuario no existe por seguridad
      }

      // 2. Generar código de verificación (6 dígitos)
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Hashear código para almacenamiento seguro (usar campo clbnc_tok_sesio temporalmente)
      const codigoHash = await bcrypt.hash(codigoVerificacion, 10);

      // 4. Calcular expiración (15 minutos)
      const expiraEn = new Date();
      expiraEn.setMinutes(expiraEn.getMinutes() + 15);

      // 5. Almacenar código hasheado y expiración (usar clbnc_tok_sesio para código, clbnc_fec_ultin para expiración)
      const updateSql = `
        UPDATE ${this.table} SET
          clbnc_tok_sesio = $1,
          clbnc_fec_ultin = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $3 AND deleted_at IS NULL
      `;

      await this.pgRepository.queryGet(updateSql, [codigoHash, expiraEn, usuario.clbnc_cod_clbnc]);

      // NOTA: En producción, aquí se enviaría el código por email/SMS
      // Por ahora retornamos el código en texto plano (solo para desarrollo)
      return {
        codigoVerificacion,
        expiraEn,
      };
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'validator', resource: this.table, method: 'iniciarRecuperacionPassword' }),
        500,
        error
      );
    }
  }

  async completarRecuperacionPassword(
    username: string,
    codigoVerificacion: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null> {
    try {
      // 1. Buscar usuario
      const usuario = await this.findByUsername(username);
      if (!usuario) {
        return null;
      }

      // 2. Verificar que existe código de recuperación (clbnc_tok_sesio contiene el hash del código)
      if (!usuario.clbnc_tok_sesio || !usuario.clbnc_fec_ultin) {
        throw new Error('No hay proceso de recuperación activo');
      }

      // 3. Verificar que no haya expirado
      const ahora = new Date();
      const expiraEn = new Date(usuario.clbnc_fec_ultin);
      if (ahora > expiraEn) {
        throw new Error('El código de verificación ha expirado');
      }

      // 4. Verificar código
      const codigoValido = await bcrypt.compare(codigoVerificacion, usuario.clbnc_tok_sesio);
      if (!codigoValido) {
        throw new Error('Código de verificación inválido');
      }

      // 5. Hashear nuevo password
      const passwordHash = await bcrypt.hash(passwordNuevo, 12);

      // 6. Actualizar password y limpiar código de recuperación
      const updateSql = `
        UPDATE ${this.table} SET
          clbnc_pwd_banca = $1,
          clbnc_tok_sesio = NULL,
          clbnc_fec_ultin = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $2 AND deleted_at IS NULL
        RETURNING *
      `;

      const updated = await this.pgRepository.queryGet<ClbncEntity>(updateSql, [passwordHash, usuario.clbnc_cod_clbnc]);
      return updated ? new ClbncValue(updated).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'completarRecuperacionPassword' }),
        500,
        error
      );
    }
  }

  async bloquear(id: number, motivo: string): Promise<ClbncEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          clbnc_ctr_activ = false,
          clbnc_tok_sesio = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $1 AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [id]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'bloquear' }),
        500,
        error
      );
    }
  }

  async desbloquear(id: number): Promise<ClbncEntity | null> {
    try {
      const sql = `
        UPDATE ${this.table} SET
          clbnc_ctr_activ = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE clbnc_cod_clbnc = $1 AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [id]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.table, method: 'desbloquear' }),
        500,
        error
      );
    }
  }

  async verificarTokenSesion(tokenSesion: string): Promise<ClbncEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.table}
        WHERE clbnc_tok_sesio = $1 
          AND clbnc_ctr_activ = true 
          AND deleted_at IS NULL
        LIMIT 1
      `;

      const result = await this.pgRepository.queryGet<ClbncEntity>(sql, [tokenSesion]);
      return result ? new ClbncValue(result).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'validator', resource: this.table, method: 'verificarTokenSesion' }),
        500,
        error
      );
    }
  }
}

