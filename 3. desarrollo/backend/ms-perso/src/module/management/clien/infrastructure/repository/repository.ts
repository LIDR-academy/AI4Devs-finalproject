import { ClienEntity, ClienParams } from "../../domain/entity/clien.entity";
import { PersoEntity, PersoParams } from "../../domain/entity/perso.entity";
import { ClienPort } from "../../domain/port";
import { ClienValue } from "../../domain/value/clien.value";
import { PersoValue } from "../../domain/value/perso.value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { ClienEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";
import { PoolClient } from "pg";
import { CldomEntity } from "../../../cldom/domain/entity/cldom.entity";
import { CldomValue } from "../../../cldom/domain/value/cldom.value";
import { ClecoEntity } from "../../../cleco/domain/entity/cleco.entity";
import { ClecoValue } from "../../../cleco/domain/value/cleco.value";
import { ClrepEntity } from "../../../clrep/domain/entity/clrep.entity";
import { ClrepValue } from "../../../clrep/domain/value/clrep.value";
import { ClcygEntity } from "../../../clcyg/domain/entity/clcyg.entity";
import { ClcygValue } from "../../../clcyg/domain/value/clcyg.value";
import { CllabEntity } from "../../../cllab/domain/entity/cllab.entity";
import { CllabValue } from "../../../cllab/domain/value/cllab.value";
import { ClrefEntity } from "../../../clref/domain/entity/clref.entity";
import { ClrefValue } from "../../../clref/domain/value/clref.value";
import { ClfinEntity } from "../../../clfin/domain/entity/clfin.entity";
import { ClfinValue } from "../../../clfin/domain/value/clfin.value";
import { ClbncEntity } from "../../../clbnc/domain/entity/clbnc.entity";
import { ClbncValue } from "../../../clbnc/domain/value/clbnc.value";
import { ClbenEntity } from "../../../clben/domain/entity/clben.entity";
import { ClbenValue } from "../../../clben/domain/value/clben.value";
import { ClrfiEntity } from "../../../clrfi/domain/entity/clrfi.entity";
import { ClrfiValue } from "../../../clrfi/domain/value/clrfi.value";
import { ClasmEntity } from "../../../clasm/domain/entity/clasm.entity";
import { ClasmValue } from "../../../clasm/domain/value/clasm.value";

@Injectable()
export class ClienDBRepository implements ClienPort {
  private readonly tableClien = ClienEnum.table;
  private readonly tablePerso = "rrfperson"; // Tabla de personas
  private readonly tableCldom = "rrfcldom"; // Tabla de domicilios
  private readonly tableCleco = "rrfcleco"; // Tabla de actividades económicas
  private readonly tableClrep = "rrfclrep"; // Tabla de representantes
  private readonly tableClcyg = "rrfclcyg"; // Tabla de cónyuges
  private readonly tableCllab = "rrfcllab"; // Tabla de información laboral
  private readonly tableClref = "rrfclref"; // Tabla de referencias
  private readonly tableClfin = "rrfclfin"; // Tabla de información financiera
  private readonly tableClbnc = "rrfclbnc"; // Tabla de usuario banca digital
  private readonly tableClben = "rrfclben"; // Tabla de beneficiarios
  private readonly tableClrfi = "rrfclrfi"; // Tabla de residencia fiscal
  private readonly tableClasm = "rrfclasm"; // Tabla de asamblea

  constructor(private readonly pgRepository: PgService) { }

  // ========== PERSONA - LECTURAS ==========

  async findAllPersonas(params?: PersoParams): Promise<{ data: PersoEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['perso_fec_elimi IS NULL'];
      const queryParams: any[] = [];
      
      if (params?.tipoPersona) {
        whereConditions.push(`perso_cod_tpers = $${queryParams.length + 1}`);
        queryParams.push(params.tipoPersona);
      }
      
      if (params?.identificacion) {
        whereConditions.push(`perso_ide_perso ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${params.identificacion}%`);
      }
      
      if (params?.nombre) {
        whereConditions.push(`perso_nom_perso ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${params.nombre}%`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const skip = (page - 1) * pageSize;
      
      const sql = `
        SELECT * FROM ${this.tablePerso} 
        ${whereClause} 
        ORDER BY perso_cod_perso ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;
      
      const data = await this.pgRepository.queryList<PersoEntity>(sql, [...queryParams, pageSize, skip]);
      
      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.tablePerso} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;
      
      return {
        data: data.map(item => new PersoValue(item).toJson()),
        total,
      };
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tablePerso, method: 'findAllPersonas' }),
        500,
        error
      );
    }
  }

  async findPersonaById(id: number): Promise<PersoEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tablePerso} 
        WHERE perso_cod_perso = $1 AND perso_fec_elimi IS NULL 
        LIMIT 1
      `;
      const data = await this.pgRepository.queryGet<PersoEntity>(sql, [id]);
      return data ? new PersoValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tablePerso, method: 'findPersonaById' }),
        500,
        error
      );
    }
  }

  async findPersonaByIdentificacion(identificacion: string): Promise<PersoEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tablePerso} 
        WHERE perso_ide_perso = $1 AND perso_fec_elimi IS NULL 
        LIMIT 1
      `;
      const data = await this.pgRepository.queryGet<PersoEntity>(sql, [identificacion.toUpperCase()]);
      return data ? new PersoValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tablePerso, method: 'findPersonaByIdentificacion' }),
        500,
        error
      );
    }
  }

  // ========== PERSONA - ESCRITURAS ==========

  async createPersona(data: PersoEntity): Promise<PersoEntity | null> {
    try {
      const sql = `
        INSERT INTO ${this.tablePerso} (
          perso_cod_tpers, perso_cod_tiden, perso_ide_perso, 
          perso_nom_perso, perso_fec_inici, perso_cod_sexos,
          perso_cod_nacio, perso_cod_instr, perso_cod_ecivi,
          perso_cod_etnia, perso_tlf_celul, perso_tlf_conve,
          perso_dir_email, perso_dac_regci, perso_cap_socia,
          perso_fot_perso, perso_fir_perso, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `;
      
      const params = [
        data.perso_cod_tpers,
        data.perso_cod_tiden,
        data.perso_ide_perso,
        data.perso_nom_perso,
        data.perso_fec_inici,
        data.perso_cod_sexos,
        data.perso_cod_nacio,
        data.perso_cod_instr,
        data.perso_cod_ecivi ?? null,
        data.perso_cod_etnia ?? null,
        data.perso_tlf_celul ?? null,
        data.perso_tlf_conve ?? null,
        data.perso_dir_email ?? null,
        data.perso_dac_regci ?? null,
        data.perso_cap_socia ?? null,
        data.perso_fot_perso ?? null,
        data.perso_fir_perso ?? null,
        data.created_by,
        data.updated_by,
      ];
      
      const created = await this.pgRepository.queryGet<PersoEntity>(sql, params);
      if (!created) return null;
      return new PersoValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tablePerso, method: 'createPersona' }),
        500,
        error
      );
    }
  }

  async updatePersona(id: number, data: PersoEntity): Promise<PersoEntity | null> {
    try {
      const sql = `
        UPDATE ${this.tablePerso} SET 
          perso_nom_perso = $1,
          perso_fec_inici = $2,
          perso_cod_sexos = $3,
          perso_cod_nacio = $4,
          perso_cod_instr = $5,
          perso_cod_ecivi = $6,
          perso_cod_etnia = $7,
          perso_tlf_celul = $8,
          perso_tlf_conve = $9,
          perso_dir_email = $10,
          perso_dac_regci = $11,
          perso_cap_socia = $12,
          perso_fot_perso = $13,
          perso_fir_perso = $14,
          perso_fec_ultfo = $15,
          perso_fec_ultfi = $16,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $17
        WHERE perso_cod_perso = $18 AND perso_fec_elimi IS NULL
        RETURNING *
      `;
      
      const params = [
        data.perso_nom_perso,
        data.perso_fec_inici,
        data.perso_cod_sexos,
        data.perso_cod_nacio,
        data.perso_cod_instr,
        data.perso_cod_ecivi ?? null,
        data.perso_cod_etnia ?? null,
        data.perso_tlf_celul ?? null,
        data.perso_tlf_conve ?? null,
        data.perso_dir_email ?? null,
        data.perso_dac_regci ?? null,
        data.perso_cap_socia ?? null,
        data.perso_fot_perso ?? null,
        data.perso_fir_perso ?? null,
        data.perso_fec_ultfo ?? null,
        data.perso_fec_ultfi ?? null,
        data.updated_by,
        id,
      ];
      
      const updated = await this.pgRepository.queryGet<PersoEntity>(sql, params);
      if (!updated) return null;
      return new PersoValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tablePerso, method: 'updatePersona' }),
        500,
        error
      );
    }
  }

  async deletePersona(id: number): Promise<PersoEntity | null> {
    try {
      const sql = `
        UPDATE ${this.tablePerso} 
        SET perso_fec_elimi = CURRENT_TIMESTAMP, 
            updated_at = CURRENT_TIMESTAMP
        WHERE perso_cod_perso = $1 AND perso_fec_elimi IS NULL
        RETURNING *
      `;
      
      const deleted = await this.pgRepository.queryGet<PersoEntity>(sql, [id]);
      if (!deleted) return null;
      return new PersoValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tablePerso, method: 'deletePersona' }),
        500,
        error
      );
    }
  }

  // ========== CLIENTE - LECTURAS ==========

  async findAll(params?: ClienParams): Promise<{ data: ClienEntity[]; total: number }> {
    try {
      const whereConditions: string[] = ['clien_fec_elimi IS NULL'];
      const queryParams: any[] = [];
      
      if (params?.active === true) {
        whereConditions.push('clien_fec_salid IS NULL');
      }
      
      if (params?.esSocio !== undefined) {
        whereConditions.push(`clien_ctr_socio = $${queryParams.length + 1}`);
        queryParams.push(params.esSocio);
      }
      
      if (params?.oficina) {
        whereConditions.push(`clien_cod_ofici = $${queryParams.length + 1}`);
        queryParams.push(params.oficina);
      }
      
      if (params?.fechaDesde) {
        whereConditions.push(`clien_fec_ingin >= $${queryParams.length + 1}`);
        queryParams.push(params.fechaDesde);
      }
      
      if (params?.fechaHasta) {
        whereConditions.push(`clien_fec_ingin <= $${queryParams.length + 1}`);
        queryParams.push(params.fechaHasta);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const skip = (page - 1) * pageSize;
      
      const sql = `
        SELECT * FROM ${this.tableClien} 
        ${whereClause} 
        ORDER BY clien_cod_clien ASC 
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;
      
      const data = await this.pgRepository.queryList<ClienEntity>(sql, [...queryParams, pageSize, skip]);
      
      const countSql = `SELECT COUNT(*)::int AS total FROM ${this.tableClien} ${whereClause}`;
      const countResult = await this.pgRepository.queryGet<{ total: number }>(countSql, queryParams);
      const total = countResult?.total || 0;
      
      return {
        data: data.map(item => new ClienValue(item).toJson()),
        total,
      };
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableClien, method: 'findAll' }),
        500,
        error
      );
    }
  }

  async findById(id: number): Promise<ClienEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tableClien} 
        WHERE clien_cod_clien = $1 AND clien_fec_elimi IS NULL 
        LIMIT 1
      `;
      const data = await this.pgRepository.queryGet<ClienEntity>(sql, [id]);
      return data ? new ClienValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableClien, method: 'findById' }),
        500,
        error
      );
    }
  }

  async findByPersonaId(personaId: number): Promise<ClienEntity | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tableClien} 
        WHERE clien_cod_perso = $1 AND clien_fec_elimi IS NULL 
        LIMIT 1
      `;
      const data = await this.pgRepository.queryGet<ClienEntity>(sql, [personaId]);
      return data ? new ClienValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableClien, method: 'findByPersonaId' }),
        500,
        error
      );
    }
  }

  // ========== CLIENTE - ESCRITURAS ==========

  async create(data: ClienEntity): Promise<ClienEntity | null> {
    try {
      const sql = `
        INSERT INTO ${this.tableClien} (
          clien_cod_perso, clien_cod_ofici, clien_ctr_socio,
          clien_fec_ingin, clien_fec_salid, clien_obs_clien,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `;
      
      const params = [
        data.clien_cod_perso,
        data.clien_cod_ofici,
        data.clien_ctr_socio,
        data.clien_fec_ingin,
        data.clien_fec_salid ?? null,
        data.clien_obs_clien ?? null,
        data.created_by,
        data.updated_by,
      ];
      
      const created = await this.pgRepository.queryGet<ClienEntity>(sql, params);
      if (!created) return null;
      return new ClienValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableClien, method: 'create' }),
        500,
        error
      );
    }
  }

  async update(id: number, data: ClienEntity): Promise<ClienEntity | null> {
    try {
      const sql = `
        UPDATE ${this.tableClien} SET 
          clien_cod_ofici = $1,
          clien_ctr_socio = $2,
          clien_fec_ingin = $3,
          clien_fec_salid = $4,
          clien_obs_clien = $5,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $6
        WHERE clien_cod_clien = $7 AND clien_fec_elimi IS NULL
        RETURNING *
      `;
      
      const params = [
        data.clien_cod_ofici,
        data.clien_ctr_socio,
        data.clien_fec_ingin,
        data.clien_fec_salid ?? null,
        data.clien_obs_clien ?? null,
        data.updated_by,
        id,
      ];
      
      const updated = await this.pgRepository.queryGet<ClienEntity>(sql, params);
      if (!updated) return null;
      return new ClienValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableClien, method: 'update' }),
        500,
        error
      );
    }
  }

  async delete(id: number): Promise<ClienEntity | null> {
    try {
      const sql = `
        UPDATE ${this.tableClien} 
        SET clien_fec_elimi = CURRENT_TIMESTAMP, 
            updated_at = CURRENT_TIMESTAMP
        WHERE clien_cod_clien = $1 AND clien_fec_elimi IS NULL
        RETURNING *
      `;
      
      const deleted = await this.pgRepository.queryGet<ClienEntity>(sql, [id]);
      if (!deleted) return null;
      return new ClienValue(deleted).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableClien, method: 'delete' }),
        500,
        error
      );
    }
  }

  // ========== TRANSACCIONES UNIFICADAS ==========

  async registrarClienteCompleto(
    personaData: PersoEntity,
    clienteData: ClienEntity,
    domicilioData: CldomEntity,
    actividadEconomicaData: ClecoEntity,
    representanteData?: ClrepEntity | null,
    conyugeData?: ClcygEntity | null,
    informacionLaboralData?: CllabEntity | null,
    referenciasData?: ClrefEntity[] | null,
    informacionFinancieraData?: ClfinEntity[] | null,
    usuarioBancaDigitalData?: ClbncEntity | null,
    beneficiariosData?: ClbenEntity[] | null,
    residenciaFiscalData?: ClrfiEntity | null,
    asambleaData?: ClasmEntity | null
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }> {
    try {
      // Usar método transaction de PgService
      return await this.pgRepository.transaction(async (client) => {
        // 0. Validar que la persona no exista ya (por identificación)
        const personaValue = new PersoValue(personaData).toJson();
        const checkPersonaSql = `
          SELECT perso_cod_perso FROM ${this.tablePerso} 
          WHERE perso_ide_perso = $1 AND perso_fec_elimi IS NULL 
          LIMIT 1
        `;
        const personaExistenteResult = await client.query(checkPersonaSql, [personaValue.perso_ide_perso]);
        let personaCreada: PersoEntity;
        
        if (personaExistenteResult.rows.length > 0) {
          const personaId = personaExistenteResult.rows[0].perso_cod_perso;
          
          // Verificar si ya es cliente activo
          const checkClienteSql = `
            SELECT clien_cod_clien FROM ${this.tableClien} 
            WHERE clien_cod_perso = $1 AND clien_fec_elimi IS NULL AND clien_fec_salid IS NULL 
            LIMIT 1
          `;
          const clienteExistenteResult = await client.query(checkClienteSql, [personaId]);
          
          if (clienteExistenteResult.rows.length > 0) {
            throw new Error('La persona ya es cliente activo de la cooperativa');
          }
          
          // Si la persona existe pero no es cliente, obtenerla dentro de la transacción
          const getPersonaSql = `
            SELECT * FROM ${this.tablePerso} 
            WHERE perso_cod_perso = $1 AND perso_fec_elimi IS NULL 
            LIMIT 1
          `;
          const personaResult = await client.query(getPersonaSql, [personaId]);
          personaCreada = personaResult.rows[0] as PersoEntity;
          
          if (!personaCreada || !personaCreada.perso_cod_perso) {
            throw new Error('Error al obtener la persona existente');
          }
          
          // Asignar ID de persona al cliente
          clienteData.clien_cod_perso = personaCreada.perso_cod_perso;
        } else {
          // 1. Crear Persona dentro de la transacción
          const personaSql = `
          INSERT INTO ${this.tablePerso} (
            perso_cod_tpers, perso_cod_tiden, perso_ide_perso, 
            perso_nom_perso, perso_fec_inici, perso_cod_sexos,
            perso_cod_nacio, perso_cod_instr, perso_cod_ecivi,
            perso_cod_etnia, perso_tlf_celul, perso_tlf_conve,
            perso_dir_email, perso_dac_regci, perso_cap_socia,
            perso_fot_perso, perso_fir_perso, created_by, updated_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          ) RETURNING *
        `;
        
        const personaParams = [
          personaValue.perso_cod_tpers,
          personaValue.perso_cod_tiden,
          personaValue.perso_ide_perso,
          personaValue.perso_nom_perso,
          personaValue.perso_fec_inici,
          personaValue.perso_cod_sexos,
          personaValue.perso_cod_nacio,
          personaValue.perso_cod_instr,
          personaValue.perso_cod_ecivi ?? null,
          personaValue.perso_cod_etnia ?? null,
          personaValue.perso_tlf_celul ?? null,
          personaValue.perso_tlf_conve ?? null,
          personaValue.perso_dir_email ?? null,
          personaValue.perso_dac_regci ?? null,
          personaValue.perso_cap_socia ?? null,
          personaValue.perso_fot_perso ?? null,
          personaValue.perso_fir_perso ?? null,
          personaValue.created_by,
          personaValue.updated_by,
        ];
        
          const personaResult = await client.query(personaSql, personaParams);
          personaCreada = personaResult.rows[0] as PersoEntity;
          
          if (!personaCreada || !personaCreada.perso_cod_perso) {
            throw new Error('Error al crear la persona');
          }
          
          // Asignar ID de persona al cliente
          clienteData.clien_cod_perso = personaCreada.perso_cod_perso;
        }
        
        // 2. Crear Cliente dentro de la transacción
        const clienteValue = new ClienValue(clienteData).toJson();
        const clienteSql = `
          INSERT INTO ${this.tableClien} (
            clien_cod_perso, clien_cod_ofici, clien_ctr_socio,
            clien_fec_ingin, clien_fec_salid, clien_obs_clien,
            created_by, updated_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING *
        `;
        
        const clienteParams = [
          clienteValue.clien_cod_perso,
          clienteValue.clien_cod_ofici,
          clienteValue.clien_ctr_socio,
          clienteValue.clien_fec_ingin,
          clienteValue.clien_fec_salid ?? null,
          clienteValue.clien_obs_clien ?? null,
          clienteValue.created_by,
          clienteValue.updated_by,
        ];
        
        const clienteResult = await client.query(clienteSql, clienteParams);
        const clienteCreado = clienteResult.rows[0] as ClienEntity;
        
        if (!clienteCreado || !clienteCreado.clien_cod_clien) {
          throw new Error('Error al crear el cliente');
        }
        
        // 3. Crear Domicilio dentro de la transacción
        // Asignar ID de cliente al domicilio
        domicilioData.cldom_cod_clien = clienteCreado.clien_cod_clien;
        
        const cldomValue = new CldomValue(domicilioData).toJson();
        const cldomSql = `
          INSERT INTO ${this.tableCldom} (
            cldom_cod_clien, cldom_cod_provi, cldom_cod_canto, cldom_cod_parro,
            cldom_dir_domic, cldom_tlf_domic, cldom_sit_refdo,
            cldom_lat_coord, cldom_lon_coord, created_by, updated_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING *
        `;
        
        const cldomParams = [
          cldomValue.cldom_cod_clien,
          cldomValue.cldom_cod_provi,
          cldomValue.cldom_cod_canto,
          cldomValue.cldom_cod_parro,
          cldomValue.cldom_dir_domic,
          cldomValue.cldom_tlf_domic ?? null,
          cldomValue.cldom_sit_refdo ?? null,
          cldomValue.cldom_lat_coord ?? null,
          cldomValue.cldom_lon_coord ?? null,
          cldomValue.created_by,
          cldomValue.updated_by,
        ];
        
        const cldomResult = await client.query(cldomSql, cldomParams);
        const domicilioCreado = cldomResult.rows[0] as CldomEntity;
        
        if (!domicilioCreado) {
          throw new Error('Error al crear el domicilio');
        }
        
        // 4. Crear Actividad Económica dentro de la transacción
        // Asignar ID de cliente a la actividad económica
        actividadEconomicaData.cleco_cod_clien = clienteCreado.clien_cod_clien;
        
        const clecoValue = new ClecoValue(actividadEconomicaData).toJson();
        const clecoSql = `
          INSERT INTO ${this.tableCleco} (
            cleco_cod_clien, cleco_cod_aebce, cleco_cod_saebc, cleco_cod_dtfin,
            cleco_cod_sebce, cleco_cod_ssgbc, created_by, updated_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING *
        `;
        
        const clecoParams = [
          clecoValue.cleco_cod_clien,
          clecoValue.cleco_cod_aebce,
          clecoValue.cleco_cod_saebc,
          clecoValue.cleco_cod_dtfin,
          clecoValue.cleco_cod_sebce,
          clecoValue.cleco_cod_ssgbc,
          clecoValue.created_by,
          clecoValue.updated_by,
        ];
        
        const clecoResult = await client.query(clecoSql, clecoParams);
        const actividadEconomicaCreada = clecoResult.rows[0] as ClecoEntity;
        
        if (!actividadEconomicaCreada) {
          throw new Error('Error al crear la actividad económica');
        }
        
        // 5. Crear Representante dentro de la transacción (si se proporciona)
        let representanteCreado: ClrepEntity | null = null;
        
        if (representanteData) {
          // Asignar ID de cliente al representante
          representanteData.clrep_cod_clien = clienteCreado.clien_cod_clien;
          
          const clrepValue = new ClrepValue(representanteData).toJson();
          const clrepSql = `
            INSERT INTO ${this.tableClrep} (
              clrep_cod_clien, clrep_cod_perso, clrep_cod_trep,
              clrep_fec_nombr, clrep_fec_venci, clrep_obs_clrep,
              created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING *
          `;
          
          const clrepParams = [
            clrepValue.clrep_cod_clien,
            clrepValue.clrep_cod_perso,
            clrepValue.clrep_cod_trep,
            clrepValue.clrep_fec_nombr ?? null,
            clrepValue.clrep_fec_venci ?? null,
            clrepValue.clrep_obs_clrep ?? null,
            clrepValue.created_by,
            clrepValue.updated_by,
          ];
          
          const clrepResult = await client.query(clrepSql, clrepParams);
          representanteCreado = clrepResult.rows[0] as ClrepEntity;
          
          if (!representanteCreado) {
            throw new Error('Error al crear el representante');
          }
        }
        
        // 6. Crear Cónyuge dentro de la transacción (si se proporciona)
        let conyugeCreado: ClcygEntity | null = null;
        
        if (conyugeData) {
          // Asignar ID de cliente al cónyuge
          conyugeData.clcyg_cod_clien = clienteCreado.clien_cod_clien;
          
          const clcygValue = new ClcygValue(conyugeData).toJson();
          const clcygSql = `
            INSERT INTO ${this.tableClcyg} (
              clcyg_cod_clien, clcyg_cod_perso, clcyg_nom_empre,
              clcyg_des_cargo, clcyg_val_ingre, created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7
            ) RETURNING *
          `;
          
          const clcygParams = [
            clcygValue.clcyg_cod_clien,
            clcygValue.clcyg_cod_perso,
            clcygValue.clcyg_nom_empre ?? null,
            clcygValue.clcyg_des_cargo ?? null,
            clcygValue.clcyg_val_ingre ?? null,
            clcygValue.created_by,
            clcygValue.updated_by,
          ];
          
          const clcygResult = await client.query(clcygSql, clcygParams);
          conyugeCreado = clcygResult.rows[0] as ClcygEntity;
          
          if (!conyugeCreado) {
            throw new Error('Error al crear el cónyuge');
          }
        }
        
        // 7. Crear Información Laboral dentro de la transacción (si se proporciona)
        let informacionLaboralCreada: CllabEntity | null = null;
        
        if (informacionLaboralData) {
          // Asignar ID de cliente a la información laboral
          informacionLaboralData.cllab_cod_clien = clienteCreado.clien_cod_clien;
          
          const cllabValue = new CllabValue(informacionLaboralData).toJson();
          const cllabSql = `
            INSERT INTO ${this.tableCllab} (
              cllab_cod_clien, cllab_cod_depen, cllab_des_cargo, cllab_cod_tcont,
              cllab_fec_ingre, cllab_fec_finct, cllab_val_ingre,
              cllab_dir_traba, cllab_tlf_traba, created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            ) RETURNING *
          `;
          
          const cllabParams = [
            cllabValue.cllab_cod_clien,
            cllabValue.cllab_cod_depen ?? null,
            cllabValue.cllab_des_cargo ?? null,
            cllabValue.cllab_cod_tcont ?? null,
            cllabValue.cllab_fec_ingre ?? null,
            cllabValue.cllab_fec_finct ?? null,
            cllabValue.cllab_val_ingre ?? null,
            cllabValue.cllab_dir_traba ?? null,
            cllabValue.cllab_tlf_traba ?? null,
            cllabValue.created_by,
            cllabValue.updated_by,
          ];
          
          const cllabResult = await client.query(cllabSql, cllabParams);
          informacionLaboralCreada = cllabResult.rows[0] as CllabEntity;
          
          if (!informacionLaboralCreada) {
            throw new Error('Error al crear la información laboral');
          }
        }
        
        // 8. Crear Referencias dentro de la transacción (si se proporcionan)
        const referenciasCreadas: ClrefEntity[] = [];
        
        if (referenciasData && referenciasData.length > 0) {
          for (const referenciaData of referenciasData) {
            // Asignar ID de cliente a la referencia
            referenciaData.clref_cod_clien = clienteCreado.clien_cod_clien;
            
            const clrefValue = new ClrefValue(referenciaData).toJson();
            const clrefSql = `
              INSERT INTO ${this.tableClref} (
                clref_cod_clien, clref_cod_tiref, clref_cod_perso, clref_nom_refer,
                clref_dir_refer, clref_tlf_refer, clref_num_ctadp, clref_val_saldo,
                clref_fec_apert, created_by, updated_by
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
              ) RETURNING *
            `;
            
            const clrefParams = [
              clrefValue.clref_cod_clien,
              clrefValue.clref_cod_tiref,
              clrefValue.clref_cod_perso ?? null,
              clrefValue.clref_nom_refer ?? null,
              clrefValue.clref_dir_refer ?? null,
              clrefValue.clref_tlf_refer ?? null,
              clrefValue.clref_num_ctadp ?? null,
              clrefValue.clref_val_saldo ?? null,
              clrefValue.clref_fec_apert ?? null,
              clrefValue.created_by,
              clrefValue.updated_by,
            ];
            
            const clrefResult = await client.query(clrefSql, clrefParams);
            const referenciaCreada = clrefResult.rows[0] as ClrefEntity;
            
            if (!referenciaCreada) {
              throw new Error('Error al crear la referencia');
            }
            
            referenciasCreadas.push(new ClrefValue(referenciaCreada).toJson());
          }
        }
        
        // 9. Crear Información Financiera dentro de la transacción (si se proporciona)
        const informacionFinancieraCreada: ClfinEntity[] = [];
        
        if (informacionFinancieraData && informacionFinancieraData.length > 0) {
          // Validar constraint único: un cliente solo puede tener un registro por tipo
          const tiposUsados = new Set<number>();
          
          for (const infoFinancieraData of informacionFinancieraData) {
            // Verificar que no haya duplicados en el array
            if (tiposUsados.has(infoFinancieraData.clfin_cod_tifin)) {
              throw new Error(`No se puede crear múltiples registros financieros del mismo tipo ${infoFinancieraData.clfin_cod_tifin} para un cliente`);
            }
            tiposUsados.add(infoFinancieraData.clfin_cod_tifin);
            
            // Asignar ID de cliente a la información financiera
            infoFinancieraData.clfin_cod_clien = clienteCreado.clien_cod_clien;
            
            const clfinValue = new ClfinValue(infoFinancieraData).toJson();
            const clfinSql = `
              INSERT INTO ${this.tableClfin} (
                clfin_cod_clien, clfin_cod_tifin, clfin_val_monto,
                created_by, updated_by
              ) VALUES (
                $1, $2, $3, $4, $5
              ) RETURNING *
            `;
            
            const clfinParams = [
              clfinValue.clfin_cod_clien,
              clfinValue.clfin_cod_tifin,
              clfinValue.clfin_val_monto,
              clfinValue.created_by,
              clfinValue.updated_by,
            ];
            
            const clfinResult = await client.query(clfinSql, clfinParams);
            const infoFinancieraCreada = clfinResult.rows[0] as ClfinEntity;
            
            if (!infoFinancieraCreada) {
              throw new Error('Error al crear la información financiera');
            }
            
            informacionFinancieraCreada.push(new ClfinValue(infoFinancieraCreada).toJson());
          }
        }
        
        // 10. Crear Usuario Banca Digital dentro de la transacción (si se proporciona)
        let usuarioBancaDigitalCreado: ClbncEntity | null = null;
        
        if (usuarioBancaDigitalData) {
          // Asignar ID de cliente al usuario de banca digital
          usuarioBancaDigitalData.clbnc_cod_clien = clienteCreado.clien_cod_clien;
          
          const clbncValue = new ClbncValue(usuarioBancaDigitalData).toJson();
          const clbncSql = `
            INSERT INTO ${this.tableClbnc} (
              clbnc_cod_clien, clbnc_usr_banca, clbnc_pwd_banca, clbnc_fec_regis,
              clbnc_fec_ultin, clbnc_tok_sesio, clbnc_tok_notif, clbnc_imei_disp,
              clbnc_nom_dispo, clbnc_det_dispo, clbnc_ipa_ultin, clbnc_lat_ultin,
              clbnc_lon_ultin, clbnc_geo_ultin, clbnc_msj_bienv, clbnc_ctr_activ,
              clbnc_ctr_termi, clbnc_lim_diario, clbnc_lim_mensu, created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING *
          `;
          
          const clbncParams = [
            clbncValue.clbnc_cod_clien,
            clbncValue.clbnc_usr_banca,
            clbncValue.clbnc_pwd_banca,
            clbncValue.clbnc_fec_regis,
            clbncValue.clbnc_fec_ultin ?? null,
            clbncValue.clbnc_tok_sesio ?? null,
            clbncValue.clbnc_tok_notif ?? null,
            clbncValue.clbnc_imei_disp ?? null,
            clbncValue.clbnc_nom_dispo ?? null,
            clbncValue.clbnc_det_dispo ?? null,
            clbncValue.clbnc_ipa_ultin ?? null,
            clbncValue.clbnc_lat_ultin ?? null,
            clbncValue.clbnc_lon_ultin ?? null,
            clbncValue.clbnc_geo_ultin ?? null,
            clbncValue.clbnc_msj_bienv ?? null,
            clbncValue.clbnc_ctr_activ,
            clbncValue.clbnc_ctr_termi,
            clbncValue.clbnc_lim_diario,
            clbncValue.clbnc_lim_mensu,
            clbncValue.created_by,
            clbncValue.updated_by,
          ];
          
          const clbncResult = await client.query(clbncSql, clbncParams);
          usuarioBancaDigitalCreado = clbncResult.rows[0] as ClbncEntity;
          
          if (!usuarioBancaDigitalCreado) {
            throw new Error('Error al crear el usuario de banca digital');
          }
          
          usuarioBancaDigitalCreado = new ClbncValue(usuarioBancaDigitalCreado).toJson();
        }
        
        // 11. Crear Beneficiarios dentro de la transacción (si se proporcionan y existe Usuario Banca Digital)
        const beneficiariosCreados: ClbenEntity[] = [];
        
        if (beneficiariosData && beneficiariosData.length > 0) {
          // Validar que existe Usuario Banca Digital
          if (!usuarioBancaDigitalCreado) {
            throw new Error('No se pueden crear beneficiarios sin un usuario de banca digital');
          }
          
          for (const beneficiarioData of beneficiariosData) {
            // Asignar ID de usuario de banca digital al beneficiario
            beneficiarioData.clben_cod_clbnc = usuarioBancaDigitalCreado.clbnc_cod_clbnc!;
            
            const clbenValue = new ClbenValue(beneficiarioData).toJson();
            const clbenSql = `
              INSERT INTO ${this.tableClben} (
                clben_cod_clbnc, clben_num_cuent, clben_cod_tcuen, clben_cod_ifina,
                clben_nom_benef, clben_ide_benef, clben_cod_tiden, clben_ema_benef,
                clben_ctr_exter, clben_ali_benef, clben_ctr_activ, created_by, updated_by
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              ) RETURNING *
            `;
            
            const clbenParams = [
              clbenValue.clben_cod_clbnc,
              clbenValue.clben_num_cuent,
              clbenValue.clben_cod_tcuen,
              clbenValue.clben_cod_ifina ?? null,
              clbenValue.clben_nom_benef,
              clbenValue.clben_ide_benef,
              clbenValue.clben_cod_tiden ?? null,
              clbenValue.clben_ema_benef ?? null,
              clbenValue.clben_ctr_exter,
              clbenValue.clben_ali_benef ?? null,
              clbenValue.clben_ctr_activ,
              clbenValue.created_by,
              clbenValue.updated_by,
            ];
            
            const clbenResult = await client.query(clbenSql, clbenParams);
            const beneficiarioCreado = clbenResult.rows[0] as ClbenEntity;
            
            if (!beneficiarioCreado) {
              throw new Error('Error al crear el beneficiario');
            }
            
            beneficiariosCreados.push(new ClbenValue(beneficiarioCreado).toJson());
          }
        }
        
        // 12. Crear Residencia Fiscal dentro de la transacción (si se proporciona)
        let residenciaFiscalCreada: ClrfiEntity | null = null;
        
        if (residenciaFiscalData) {
          // Asignar ID de cliente a la residencia fiscal
          residenciaFiscalData.clrfi_cod_clien = clienteCreado.clien_cod_clien;
          
          const clrfiValue = new ClrfiValue(residenciaFiscalData).toJson();
          const clrfiSql = `
            INSERT INTO ${this.tableClrfi} (
              clrfi_cod_clien, clrfi_ctr_resfi, clrfi_cod_nacio, clrfi_dir_resfi,
              clrfi_des_provi, clrfi_des_ciuda, clrfi_cod_posta, created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING *
          `;
          
          const clrfiParams = [
            clrfiValue.clrfi_cod_clien,
            clrfiValue.clrfi_ctr_resfi,
            clrfiValue.clrfi_cod_nacio ?? null,
            clrfiValue.clrfi_dir_resfi ?? null,
            clrfiValue.clrfi_des_provi ?? null,
            clrfiValue.clrfi_des_ciuda ?? null,
            clrfiValue.clrfi_cod_posta ?? null,
            clrfiValue.created_by,
            clrfiValue.updated_by,
          ];
          
          const clrfiResult = await client.query(clrfiSql, clrfiParams);
          residenciaFiscalCreada = clrfiResult.rows[0] as ClrfiEntity;
          
          if (!residenciaFiscalCreada) {
            throw new Error('Error al crear la residencia fiscal');
          }
          
          residenciaFiscalCreada = new ClrfiValue(residenciaFiscalCreada).toJson();
        }
        
        // 13. Crear Asamblea dentro de la transacción (si se proporciona y es socio)
        let asambleaCreada: ClasmEntity | null = null;
        
        if (asambleaData && clienteCreado.clien_ctr_socio === true) {
          // Asignar ID de cliente a la asamblea
          asambleaData.clasm_cod_clien = clienteCreado.clien_cod_clien;
          
          const clasmValue = new ClasmValue(asambleaData).toJson();
          const clasmSql = `
            INSERT INTO ${this.tableClasm} (
              clasm_cod_clien, clasm_cod_rasam, clasm_fec_rasam,
              clasm_ctr_direc, clasm_fec_direc, created_by, updated_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7
            ) RETURNING *
          `;
          
          const clasmParams = [
            clasmValue.clasm_cod_clien,
            clasmValue.clasm_cod_rasam ?? null,
            clasmValue.clasm_fec_rasam ?? null,
            clasmValue.clasm_ctr_direc,
            clasmValue.clasm_fec_direc ?? null,
            clasmValue.created_by,
            clasmValue.updated_by,
          ];
          
          const clasmResult = await client.query(clasmSql, clasmParams);
          asambleaCreada = clasmResult.rows[0] as ClasmEntity;
          
          if (!asambleaCreada) {
            throw new Error('Error al crear la asamblea');
          }
          
          asambleaCreada = new ClasmValue(asambleaCreada).toJson();
        } else if (asambleaData && clienteCreado.clien_ctr_socio === false) {
          // Si se proporciona asamblea pero el cliente no es socio, lanzar error
          throw new Error('Solo los socios pueden tener participación en asamblea');
        }
        
        return {
          persona: new PersoValue(personaCreada).toJson(),
          cliente: new ClienValue(clienteCreado).toJson(),
          domicilio: new CldomValue(domicilioCreado).toJson(),
          actividadEconomica: new ClecoValue(actividadEconomicaCreada).toJson(),
          representante: representanteCreado ? new ClrepValue(representanteCreado).toJson() : null,
          conyuge: conyugeCreado ? new ClcygValue(conyugeCreado).toJson() : null,
          informacionLaboral: informacionLaboralCreada ? new CllabValue(informacionLaboralCreada).toJson() : null,
          referencias: referenciasCreadas,
          informacionFinanciera: informacionFinancieraCreada,
          usuarioBancaDigital: usuarioBancaDigitalCreado,
          beneficiarios: beneficiariosCreados,
          residenciaFiscal: residenciaFiscalCreada,
          asamblea: asambleaCreada,
        };
      });
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: 'cliente_completo', method: 'registrarClienteCompleto' }),
        500,
        error
      );
    }
  }

  async findClienteCompletoById(id: number): Promise<{
    persona: PersoEntity;
    cliente: ClienEntity;
    domicilio: CldomEntity | null;
    actividadEconomica: ClecoEntity | null;
    representante: (ClrepEntity & { personaRepresentante?: PersoEntity | null }) | null;
    conyuge: (ClcygEntity & { personaConyuge?: PersoEntity | null }) | null;
    informacionLaboral: CllabEntity | null;
    referencias: (ClrefEntity & { personaReferencia?: PersoEntity | null })[];
    informacionFinanciera: ClfinEntity[];
    usuarioBancaDigital: ClbncEntity | null;
    beneficiarios: ClbenEntity[];
    residenciaFiscal: ClrfiEntity | null;
    asamblea: ClasmEntity | null;
    calculosFinancieros: {
      capacidadPago: number;
      patrimonio: number;
      totalIngresos: number;
      totalGastos: number;
      totalActivos: number;
      totalPasivos: number;
    };
  } | null> {
    try {
      // 1. Buscar cliente
      const cliente = await this.findById(id);
      if (!cliente) {
        return null;
      }

      // 2. Buscar persona relacionada
      const persona = await this.findPersonaById(cliente.clien_cod_perso);
      if (!persona) {
        return null;
      }

      // 3. Cargar relaciones 1:1 (obligatorias)
      const domicilioSql = `
        SELECT * FROM ${this.tableCldom} 
        WHERE cldom_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const domicilioResult = await this.pgRepository.queryGet<CldomEntity>(domicilioSql, [id]);
      const domicilio = domicilioResult ? new CldomValue(domicilioResult).toJson() : null;

      const actividadEconomicaSql = `
        SELECT * FROM ${this.tableCleco} 
        WHERE cleco_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const actividadEconomicaResult = await this.pgRepository.queryGet<ClecoEntity>(actividadEconomicaSql, [id]);
      const actividadEconomica = actividadEconomicaResult ? new ClecoValue(actividadEconomicaResult).toJson() : null;

      // 4. Cargar relaciones 1:1 (opcionales) con sus personas relacionadas
      const representanteSql = `
        SELECT * FROM ${this.tableClrep} 
        WHERE clrep_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const representanteResult = await this.pgRepository.queryGet<ClrepEntity>(representanteSql, [id]);
      let representante: (ClrepEntity & { personaRepresentante?: PersoEntity | null }) | null = null;
      if (representanteResult) {
        const representanteData = new ClrepValue(representanteResult).toJson();
        // Cargar persona del representante
        let personaRepresentante: PersoEntity | null = null;
        if (representanteData.clrep_cod_perso) {
          personaRepresentante = await this.findPersonaById(representanteData.clrep_cod_perso);
        }
        representante = {
          ...representanteData,
          personaRepresentante,
        };
      }

      const conyugeSql = `
        SELECT * FROM ${this.tableClcyg} 
        WHERE clcyg_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const conyugeResult = await this.pgRepository.queryGet<ClcygEntity>(conyugeSql, [id]);
      let conyuge: (ClcygEntity & { personaConyuge?: PersoEntity | null }) | null = null;
      if (conyugeResult) {
        const conyugeData = new ClcygValue(conyugeResult).toJson();
        // Cargar persona del cónyuge
        let personaConyuge: PersoEntity | null = null;
        if (conyugeData.clcyg_cod_perso) {
          personaConyuge = await this.findPersonaById(conyugeData.clcyg_cod_perso);
        }
        conyuge = {
          ...conyugeData,
          personaConyuge,
        };
      }

      const informacionLaboralSql = `
        SELECT * FROM ${this.tableCllab} 
        WHERE cllab_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const informacionLaboralResult = await this.pgRepository.queryGet<CllabEntity>(informacionLaboralSql, [id]);
      const informacionLaboral = informacionLaboralResult ? new CllabValue(informacionLaboralResult).toJson() : null;

      const residenciaFiscalSql = `
        SELECT * FROM ${this.tableClrfi} 
        WHERE clrfi_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const residenciaFiscalResult = await this.pgRepository.queryGet<ClrfiEntity>(residenciaFiscalSql, [id]);
      const residenciaFiscal = residenciaFiscalResult ? new ClrfiValue(residenciaFiscalResult).toJson() : null;

      const asambleaSql = `
        SELECT * FROM ${this.tableClasm} 
        WHERE clasm_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const asambleaResult = await this.pgRepository.queryGet<ClasmEntity>(asambleaSql, [id]);
      const asamblea = asambleaResult ? new ClasmValue(asambleaResult).toJson() : null;

      const usuarioBancaDigitalSql = `
        SELECT * FROM ${this.tableClbnc} 
        WHERE clbnc_cod_clien = $1 AND deleted_at IS NULL 
        LIMIT 1
      `;
      const usuarioBancaDigitalResult = await this.pgRepository.queryGet<ClbncEntity>(usuarioBancaDigitalSql, [id]);
      const usuarioBancaDigital = usuarioBancaDigitalResult ? new ClbncValue(usuarioBancaDigitalResult).toJson() : null;

      // 5. Cargar relaciones 1:N con sus personas relacionadas
      const referenciasSql = `
        SELECT * FROM ${this.tableClref} 
        WHERE clref_cod_clien = $1 AND deleted_at IS NULL 
        ORDER BY clref_cod_clref ASC
      `;
      const referenciasResults = await this.pgRepository.queryList<ClrefEntity>(referenciasSql, [id]);
      const referencias: (ClrefEntity & { personaReferencia?: PersoEntity | null })[] = await Promise.all(
        referenciasResults.map(async (ref) => {
          const referenciaData = new ClrefValue(ref).toJson();
          // Cargar persona de la referencia si existe
          let personaReferencia: PersoEntity | null = null;
          if (referenciaData.clref_cod_perso) {
            personaReferencia = await this.findPersonaById(referenciaData.clref_cod_perso);
          }
          return {
            ...referenciaData,
            personaReferencia,
          };
        })
      );

      const informacionFinancieraSql = `
        SELECT * FROM ${this.tableClfin} 
        WHERE clfin_cod_clien = $1 AND deleted_at IS NULL 
        ORDER BY clfin_cod_clfin ASC
      `;
      const informacionFinancieraResults = await this.pgRepository.queryList<ClfinEntity>(informacionFinancieraSql, [id]);
      const informacionFinanciera = informacionFinancieraResults.map(info => new ClfinValue(info).toJson());

      // 6. Cargar beneficiarios (si existe usuario banca digital)
      let beneficiarios: ClbenEntity[] = [];
      if (usuarioBancaDigital) {
        const beneficiariosSql = `
          SELECT * FROM ${this.tableClben} 
          WHERE clben_cod_clbnc = $1 AND deleted_at IS NULL 
          ORDER BY clben_cod_clben ASC
        `;
        const beneficiariosResults = await this.pgRepository.queryList<ClbenEntity>(beneficiariosSql, [usuarioBancaDigital.clbnc_cod_clbnc!]);
        beneficiarios = beneficiariosResults.map(ben => new ClbenValue(ben).toJson());
      }

      // 7. Calcular información financiera
      let totalIngresos = 0;
      let totalGastos = 0;
      let totalActivos = 0;
      let totalPasivos = 0;

      informacionFinanciera.forEach(info => {
        const monto = info.clfin_val_monto || 0;
        const codigo = info.clfin_cod_tifin;
        // Rangos según esquema: Ingresos (1-7), Gastos (10-17), Activos (20-25), Pasivos (30-34)
        if (codigo >= 1 && codigo <= 7) {
          // Ingreso
          totalIngresos += monto;
        } else if (codigo >= 10 && codigo <= 17) {
          // Gasto
          totalGastos += monto;
        } else if (codigo >= 20 && codigo <= 25) {
          // Activo
          totalActivos += monto;
        } else if (codigo >= 30 && codigo <= 34) {
          // Pasivo
          totalPasivos += monto;
        }
      });

      // Capacidad de pago = Ingresos - Gastos
      const capacidadPago = totalIngresos - totalGastos;

      // Patrimonio = Activos - Pasivos
      const patrimonio = totalActivos - totalPasivos;

      return {
        persona: new PersoValue(persona).toJson(),
        cliente: new ClienValue(cliente).toJson(),
        domicilio,
        actividadEconomica,
        representante,
        conyuge,
        informacionLaboral,
        referencias,
        informacionFinanciera,
        usuarioBancaDigital,
        beneficiarios,
        residenciaFiscal,
        asamblea,
        calculosFinancieros: {
          capacidadPago,
          patrimonio,
          totalIngresos,
          totalGastos,
          totalActivos,
          totalPasivos,
        },
      };
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: 'cliente_completo', method: 'findClienteCompletoById' }),
        500,
        error
      );
    }
  }

  async actualizarClienteCompleto(
    clienteId: number,
    personaData: PersoEntity,
    clienteData: ClienEntity,
    domicilioData: CldomEntity,
    actividadEconomicaData: ClecoEntity,
    representanteData?: ClrepEntity | null,
    conyugeData?: ClcygEntity | null,
    informacionLaboralData?: CllabEntity | null,
    referenciasData?: ClrefEntity[] | null,
    informacionFinancieraData?: ClfinEntity[] | null,
    usuarioBancaDigitalData?: ClbncEntity | null,
    beneficiariosData?: ClbenEntity[] | null,
    residenciaFiscalData?: ClrfiEntity | null,
    asambleaData?: ClasmEntity | null
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }> {
    try {
      // Verificar que el cliente existe
      const clienteExistente = await this.findById(clienteId);
      if (!clienteExistente) {
        throw new Error(`Cliente con id ${clienteId} no encontrado`);
      }

      return await this.pgRepository.transaction(async (client: PoolClient) => {
        // 1. Actualizar persona
        const personaValue = new PersoValue(personaData, clienteExistente.clien_cod_perso);
        const personaNormalizada = personaValue.toJson();
        
        const updatePersonaSql = `
          UPDATE ${this.tablePerso} SET
            perso_nom_perso = $1,
            perso_fec_inici = $2,
            perso_cod_sexos = $3,
            perso_cod_nacio = $4,
            perso_cod_instr = $5,
            perso_cod_ecivi = $6,
            perso_cod_etnia = $7,
            perso_tlf_celul = $8,
            perso_tlf_conve = $9,
            perso_dir_email = $10,
            perso_dac_regci = $11,
            perso_cap_socia = $12,
            perso_fot_perso = $13,
            perso_fir_perso = $14,
            perso_fec_ultfo = $15,
            perso_fec_ultfi = $16,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = $17
          WHERE perso_cod_perso = $18 AND perso_fec_elimi IS NULL
          RETURNING *
        `;
        
        const personaParams = [
          personaNormalizada.perso_nom_perso,
          personaNormalizada.perso_fec_inici,
          personaNormalizada.perso_cod_sexos,
          personaNormalizada.perso_cod_nacio,
          personaNormalizada.perso_cod_instr,
          personaNormalizada.perso_cod_ecivi ?? null,
          personaNormalizada.perso_cod_etnia ?? null,
          personaNormalizada.perso_tlf_celul ?? null,
          personaNormalizada.perso_tlf_conve ?? null,
          personaNormalizada.perso_dir_email ?? null,
          personaNormalizada.perso_dac_regci ?? null,
          personaNormalizada.perso_cap_socia ?? null,
          personaNormalizada.perso_fot_perso ?? null,
          personaNormalizada.perso_fir_perso ?? null,
          personaNormalizada.perso_fec_ultfo ?? null,
          personaNormalizada.perso_fec_ultfi ?? null,
          personaNormalizada.updated_by,
          clienteExistente.clien_cod_perso,
        ];
        
        const personaResult = await client.query(updatePersonaSql, personaParams);
        const personaActualizada = personaResult.rows[0] ? new PersoValue(personaResult.rows[0]).toJson() : null;
        if (!personaActualizada) {
          throw new Error('Error al actualizar persona');
        }

        // 2. Actualizar cliente
        const clienteValue = new ClienValue(clienteData, clienteId);
        const clienteNormalizado = clienteValue.toJson();
        
        const updateClienteSql = `
          UPDATE ${this.tableClien} SET
            clien_cod_ofici = $1,
            clien_ctr_socio = $2,
            clien_fec_ingin = $3,
            clien_fec_salid = $4,
            clien_obs_clien = $5,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = $6
          WHERE clien_cod_clien = $7 AND clien_fec_elimi IS NULL
          RETURNING *
        `;
        
        const clienteParams = [
          clienteNormalizado.clien_cod_ofici,
          clienteNormalizado.clien_ctr_socio,
          clienteNormalizado.clien_fec_ingin,
          clienteNormalizado.clien_fec_salid ?? null,
          clienteNormalizado.clien_obs_clien ?? null,
          clienteNormalizado.updated_by,
          clienteId,
        ];
        
        const clienteResult = await client.query(updateClienteSql, clienteParams);
        const clienteActualizado = clienteResult.rows[0] ? new ClienValue(clienteResult.rows[0]).toJson() : null;
        if (!clienteActualizado) {
          throw new Error('Error al actualizar cliente');
        }

        // 3. Actualizar/Crear domicilio (obligatorio)
        const domicilioExistenteSql = `SELECT * FROM ${this.tableCldom} WHERE cldom_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const domicilioExistenteResult = await client.query(domicilioExistenteSql, [clienteId]);
        const domicilioExistente = domicilioExistenteResult.rows[0];
        
        let domicilio: CldomEntity | null = null;
        if (domicilioExistente) {
          // Actualizar domicilio existente
          const cldomValue = new CldomValue(domicilioData, domicilioExistente.cldom_cod_cldom);
          const cldomNormalizado = cldomValue.toJson();
          
          const updateDomicilioSql = `
            UPDATE ${this.tableCldom} SET
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
          
          const domicilioParams = [
            cldomNormalizado.cldom_cod_provi,
            cldomNormalizado.cldom_cod_canto,
            cldomNormalizado.cldom_cod_parro,
            cldomNormalizado.cldom_dir_domic,
            cldomNormalizado.cldom_tlf_domic ?? null,
            cldomNormalizado.cldom_sit_refdo ?? null,
            cldomNormalizado.cldom_lat_coord ?? null,
            cldomNormalizado.cldom_lon_coord ?? null,
            cldomNormalizado.updated_by,
            domicilioExistente.cldom_cod_cldom,
          ];
          
          const domicilioResult = await client.query(updateDomicilioSql, domicilioParams);
          domicilio = domicilioResult.rows[0] ? new CldomValue(domicilioResult.rows[0]).toJson() : null;
        } else {
          // Crear nuevo domicilio
          const cldomValue = new CldomValue({ ...domicilioData, cldom_cod_clien: clienteId });
          const cldomNormalizado = cldomValue.toJson();
          
          const createDomicilioSql = `
            INSERT INTO ${this.tableCldom} (
              cldom_cod_clien, cldom_cod_provi, cldom_cod_canto, cldom_cod_parro,
              cldom_dir_domic, cldom_tlf_domic, cldom_sit_refdo,
              cldom_lat_coord, cldom_lon_coord, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
          `;
          
          const domicilioParams = [
            cldomNormalizado.cldom_cod_clien,
            cldomNormalizado.cldom_cod_provi,
            cldomNormalizado.cldom_cod_canto,
            cldomNormalizado.cldom_cod_parro,
            cldomNormalizado.cldom_dir_domic,
            cldomNormalizado.cldom_tlf_domic ?? null,
            cldomNormalizado.cldom_sit_refdo ?? null,
            cldomNormalizado.cldom_lat_coord ?? null,
            cldomNormalizado.cldom_lon_coord ?? null,
            cldomNormalizado.created_by,
            cldomNormalizado.updated_by,
          ];
          
          const domicilioResult = await client.query(createDomicilioSql, domicilioParams);
          domicilio = domicilioResult.rows[0] ? new CldomValue(domicilioResult.rows[0]).toJson() : null;
        }

        // 4. Actualizar/Crear actividad económica (obligatorio)
        const clecoExistenteSql = `SELECT * FROM ${this.tableCleco} WHERE cleco_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const clecoExistenteResult = await client.query(clecoExistenteSql, [clienteId]);
        const clecoExistente = clecoExistenteResult.rows[0];
        
        let actividadEconomica: ClecoEntity | null = null;
        if (clecoExistente) {
          // Actualizar actividad económica existente
          const clecoValue = new ClecoValue(actividadEconomicaData, clecoExistente.cleco_cod_cleco);
          const clecoNormalizado = clecoValue.toJson();
          
          const updateClecoSql = `
            UPDATE ${this.tableCleco} SET
              cleco_cod_aebce = $1,
              cleco_cod_saebc = $2,
              cleco_cod_dtfin = $3,
              cleco_cod_sebce = $4,
              cleco_cod_ssgbc = $5,
              updated_by = $6,
              updated_at = CURRENT_TIMESTAMP
            WHERE cleco_cod_cleco = $7 AND deleted_at IS NULL
            RETURNING *
          `;
          
          const clecoParams = [
            clecoNormalizado.cleco_cod_aebce,
            clecoNormalizado.cleco_cod_saebc,
            clecoNormalizado.cleco_cod_dtfin,
            clecoNormalizado.cleco_cod_sebce,
            clecoNormalizado.cleco_cod_ssgbc,
            clecoNormalizado.updated_by,
            clecoExistente.cleco_cod_cleco,
          ];
          
          const clecoResult = await client.query(updateClecoSql, clecoParams);
          actividadEconomica = clecoResult.rows[0] ? new ClecoValue(clecoResult.rows[0]).toJson() : null;
        } else {
          // Crear nueva actividad económica
          const clecoValue = new ClecoValue({ ...actividadEconomicaData, cleco_cod_clien: clienteId });
          const clecoNormalizado = clecoValue.toJson();
          
          const createClecoSql = `
            INSERT INTO ${this.tableCleco} (
              cleco_cod_clien, cleco_cod_aebce, cleco_cod_saebc, cleco_cod_dtfin,
              cleco_cod_sebce, cleco_cod_ssgbc, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          
          const clecoParams = [
            clecoNormalizado.cleco_cod_clien,
            clecoNormalizado.cleco_cod_aebce,
            clecoNormalizado.cleco_cod_saebc,
            clecoNormalizado.cleco_cod_dtfin,
            clecoNormalizado.cleco_cod_sebce,
            clecoNormalizado.cleco_cod_ssgbc,
            clecoNormalizado.created_by,
            clecoNormalizado.updated_by,
          ];
          
          const clecoResult = await client.query(createClecoSql, clecoParams);
          actividadEconomica = clecoResult.rows[0] ? new ClecoValue(clecoResult.rows[0]).toJson() : null;
        }

        // 5. Manejar relaciones 1:1 opcionales (representante, cónyuge, información laboral, residencia fiscal, asamblea, usuario banca digital)
        // Helper function para manejar relaciones 1:1 opcionales
        const manejarRelacionOpcional1A1 = async (
          tableName: string,
          fkField: string,
          data: any | null | undefined,
          valueClass: any,
          createSql: string,
          updateSql: string,
          deleteSql: string,
          createParams: any[],
          updateParams: any[],
          clienteId: number
        ): Promise<any | null> => {
          const existenteSql = `SELECT * FROM ${tableName} WHERE ${fkField} = $1 AND deleted_at IS NULL LIMIT 1`;
          const existenteResult = await client.query(existenteSql, [clienteId]);
          const existente = existenteResult.rows[0];

          if (data === undefined) {
            // No modificar
            return existente ? new valueClass(existente).toJson() : null;
          } else if (data === null) {
            // Eliminar si existe
            if (existente) {
              await client.query(deleteSql, [existente[`${tableName.split('rrf')[1]}_cod_${tableName.split('rrf')[1]}`]]);
            }
            return null;
          } else {
            // Crear o actualizar
            if (existente) {
              // Actualizar
              const value = new valueClass(data, existente[`${tableName.split('rrf')[1]}_cod_${tableName.split('rrf')[1]}`]);
              const normalized = value.toJson();
              const result = await client.query(updateSql, [...updateParams.map(p => typeof p === 'function' ? p(normalized) : p), existente[`${tableName.split('rrf')[1]}_cod_${tableName.split('rrf')[1]}`]]);
              return result.rows[0] ? new valueClass(result.rows[0]).toJson() : null;
            } else {
              // Crear
              const value = new valueClass({ ...data, [fkField]: clienteId });
              const normalized = value.toJson();
              const result = await client.query(createSql, createParams.map(p => typeof p === 'function' ? p(normalized) : p));
              return result.rows[0] ? new valueClass(result.rows[0]).toJson() : null;
            }
          }
        };

        // Representante
        const representanteExistenteSql = `SELECT * FROM ${this.tableClrep} WHERE clrep_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const representanteExistenteResult = await client.query(representanteExistenteSql, [clienteId]);
        const representanteExistente = representanteExistenteResult.rows[0];
        
        let representante: ClrepEntity | null = null;
        if (representanteData === undefined) {
          representante = representanteExistente ? new ClrepValue(representanteExistente).toJson() : null;
        } else if (representanteData === null) {
          if (representanteExistente) {
            await client.query(`UPDATE ${this.tableClrep} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clrep_cod_clrep = $2`, [clienteData.updated_by, representanteExistente.clrep_cod_clrep]);
          }
          representante = null;
        } else {
          if (representanteExistente) {
            const clrepValue = new ClrepValue(representanteData, representanteExistente.clrep_cod_clrep);
            const clrepNormalizado = clrepValue.toJson();
            
            const updateClrepSql = `
              UPDATE ${this.tableClrep} SET
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
            
            const clrepParams = [
              clrepNormalizado.clrep_cod_perso,
              clrepNormalizado.clrep_cod_trep,
              clrepNormalizado.clrep_fec_nombr ?? null,
              clrepNormalizado.clrep_fec_venci ?? null,
              clrepNormalizado.clrep_obs_clrep ?? null,
              clrepNormalizado.updated_by,
              representanteExistente.clrep_cod_clrep,
            ];
            
            const clrepResult = await client.query(updateClrepSql, clrepParams);
            representante = clrepResult.rows[0] ? new ClrepValue(clrepResult.rows[0]).toJson() : null;
          } else {
            const clrepValue = new ClrepValue({ ...representanteData, clrep_cod_clien: clienteId });
            const clrepNormalizado = clrepValue.toJson();
            
            const createClrepSql = `
              INSERT INTO ${this.tableClrep} (
                clrep_cod_clien, clrep_cod_perso, clrep_cod_trep,
                clrep_fec_nombr, clrep_fec_venci, clrep_obs_clrep,
                created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING *
            `;
            
            const clrepParams = [
              clrepNormalizado.clrep_cod_clien,
              clrepNormalizado.clrep_cod_perso,
              clrepNormalizado.clrep_cod_trep,
              clrepNormalizado.clrep_fec_nombr ?? null,
              clrepNormalizado.clrep_fec_venci ?? null,
              clrepNormalizado.clrep_obs_clrep ?? null,
              clrepNormalizado.created_by,
              clrepNormalizado.updated_by,
            ];
            
            const clrepResult = await client.query(createClrepSql, clrepParams);
            representante = clrepResult.rows[0] ? new ClrepValue(clrepResult.rows[0]).toJson() : null;
          }
        }

        // Cónyuge
        const conyugeExistenteSql = `SELECT * FROM ${this.tableClcyg} WHERE clcyg_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const conyugeExistenteResult = await client.query(conyugeExistenteSql, [clienteId]);
        const conyugeExistente = conyugeExistenteResult.rows[0];
        
        let conyuge: ClcygEntity | null = null;
        if (conyugeData === undefined) {
          conyuge = conyugeExistente ? new ClcygValue(conyugeExistente).toJson() : null;
        } else if (conyugeData === null) {
          if (conyugeExistente) {
            await client.query(`UPDATE ${this.tableClcyg} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clcyg_cod_clcyg = $2`, [clienteData.updated_by, conyugeExistente.clcyg_cod_clcyg]);
          }
          conyuge = null;
        } else {
          if (conyugeExistente) {
            const clcygValue = new ClcygValue(conyugeData, conyugeExistente.clcyg_cod_clcyg);
            const clcygNormalizado = clcygValue.toJson();
            
            const updateClcygSql = `
              UPDATE ${this.tableClcyg} SET
                clcyg_cod_perso = $1,
                clcyg_nom_empre = $2,
                clcyg_des_cargo = $3,
                clcyg_val_ingre = $4,
                updated_by = $5,
                updated_at = CURRENT_TIMESTAMP
              WHERE clcyg_cod_clcyg = $6 AND deleted_at IS NULL
              RETURNING *
            `;
            
            const clcygParams = [
              clcygNormalizado.clcyg_cod_perso,
              clcygNormalizado.clcyg_nom_empre ?? null,
              clcygNormalizado.clcyg_des_cargo ?? null,
              clcygNormalizado.clcyg_val_ingre ?? null,
              clcygNormalizado.updated_by,
              conyugeExistente.clcyg_cod_clcyg,
            ];
            
            const clcygResult = await client.query(updateClcygSql, clcygParams);
            conyuge = clcygResult.rows[0] ? new ClcygValue(clcygResult.rows[0]).toJson() : null;
          } else {
            const clcygValue = new ClcygValue({ ...conyugeData, clcyg_cod_clien: clienteId });
            const clcygNormalizado = clcygValue.toJson();
            
            const createClcygSql = `
              INSERT INTO ${this.tableClcyg} (
                clcyg_cod_clien, clcyg_cod_perso, clcyg_nom_empre,
                clcyg_des_cargo, clcyg_val_ingre, created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING *
            `;
            
            const clcygParams = [
              clcygNormalizado.clcyg_cod_clien,
              clcygNormalizado.clcyg_cod_perso,
              clcygNormalizado.clcyg_nom_empre ?? null,
              clcygNormalizado.clcyg_des_cargo ?? null,
              clcygNormalizado.clcyg_val_ingre ?? null,
              clcygNormalizado.created_by,
              clcygNormalizado.updated_by,
            ];
            
            const clcygResult = await client.query(createClcygSql, clcygParams);
            conyuge = clcygResult.rows[0] ? new ClcygValue(clcygResult.rows[0]).toJson() : null;
          }
        }

        // Información Laboral
        const cllabExistenteSql = `SELECT * FROM ${this.tableCllab} WHERE cllab_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const cllabExistenteResult = await client.query(cllabExistenteSql, [clienteId]);
        const cllabExistente = cllabExistenteResult.rows[0];
        
        let informacionLaboral: CllabEntity | null = null;
        if (informacionLaboralData === undefined) {
          informacionLaboral = cllabExistente ? new CllabValue(cllabExistente).toJson() : null;
        } else if (informacionLaboralData === null) {
          if (cllabExistente) {
            await client.query(`UPDATE ${this.tableCllab} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE cllab_cod_cllab = $2`, [clienteData.updated_by, cllabExistente.cllab_cod_cllab]);
          }
          informacionLaboral = null;
        } else {
          if (cllabExistente) {
            const cllabValue = new CllabValue(informacionLaboralData, cllabExistente.cllab_cod_cllab);
            const cllabNormalizado = cllabValue.toJson();
            
            const updateCllabSql = `
              UPDATE ${this.tableCllab} SET
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
            
            const cllabParams = [
              cllabNormalizado.cllab_cod_depen ?? null,
              cllabNormalizado.cllab_des_cargo ?? null,
              cllabNormalizado.cllab_cod_tcont ?? null,
              cllabNormalizado.cllab_fec_ingre ?? null,
              cllabNormalizado.cllab_fec_finct ?? null,
              cllabNormalizado.cllab_val_ingre ?? null,
              cllabNormalizado.cllab_dir_traba ?? null,
              cllabNormalizado.cllab_tlf_traba ?? null,
              cllabNormalizado.updated_by,
              cllabExistente.cllab_cod_cllab,
            ];
            
            const cllabResult = await client.query(updateCllabSql, cllabParams);
            informacionLaboral = cllabResult.rows[0] ? new CllabValue(cllabResult.rows[0]).toJson() : null;
          } else {
            const cllabValue = new CllabValue({ ...informacionLaboralData, cllab_cod_clien: clienteId });
            const cllabNormalizado = cllabValue.toJson();
            
            const createCllabSql = `
              INSERT INTO ${this.tableCllab} (
                cllab_cod_clien, cllab_cod_depen, cllab_des_cargo, cllab_cod_tcont,
                cllab_fec_ingre, cllab_fec_finct, cllab_val_ingre,
                cllab_dir_traba, cllab_tlf_traba, created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              RETURNING *
            `;
            
            const cllabParams = [
              cllabNormalizado.cllab_cod_clien,
              cllabNormalizado.cllab_cod_depen ?? null,
              cllabNormalizado.cllab_des_cargo ?? null,
              cllabNormalizado.cllab_cod_tcont ?? null,
              cllabNormalizado.cllab_fec_ingre ?? null,
              cllabNormalizado.cllab_fec_finct ?? null,
              cllabNormalizado.cllab_val_ingre ?? null,
              cllabNormalizado.cllab_dir_traba ?? null,
              cllabNormalizado.cllab_tlf_traba ?? null,
              cllabNormalizado.created_by,
              cllabNormalizado.updated_by,
            ];
            
            const cllabResult = await client.query(createCllabSql, cllabParams);
            informacionLaboral = cllabResult.rows[0] ? new CllabValue(cllabResult.rows[0]).toJson() : null;
          }
        }

        // Residencia Fiscal
        const clrfiExistenteSql = `SELECT * FROM ${this.tableClrfi} WHERE clrfi_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const clrfiExistenteResult = await client.query(clrfiExistenteSql, [clienteId]);
        const clrfiExistente = clrfiExistenteResult.rows[0];
        
        let residenciaFiscal: ClrfiEntity | null = null;
        if (residenciaFiscalData === undefined) {
          residenciaFiscal = clrfiExistente ? new ClrfiValue(clrfiExistente).toJson() : null;
        } else if (residenciaFiscalData === null) {
          if (clrfiExistente) {
            await client.query(`UPDATE ${this.tableClrfi} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clrfi_cod_clrfi = $2`, [clienteData.updated_by, clrfiExistente.clrfi_cod_clrfi]);
          }
          residenciaFiscal = null;
        } else {
          if (clrfiExistente) {
            const clrfiValue = new ClrfiValue(residenciaFiscalData, clrfiExistente.clrfi_cod_clrfi);
            const clrfiNormalizado = clrfiValue.toJson();
            
            const updateClrfiSql = `
              UPDATE ${this.tableClrfi} SET
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
            
            const clrfiParams = [
              clrfiNormalizado.clrfi_ctr_resfi,
              clrfiNormalizado.clrfi_cod_nacio ?? null,
              clrfiNormalizado.clrfi_dir_resfi ?? null,
              clrfiNormalizado.clrfi_des_provi ?? null,
              clrfiNormalizado.clrfi_des_ciuda ?? null,
              clrfiNormalizado.clrfi_cod_posta ?? null,
              clrfiNormalizado.updated_by,
              clrfiExistente.clrfi_cod_clrfi,
            ];
            
            const clrfiResult = await client.query(updateClrfiSql, clrfiParams);
            residenciaFiscal = clrfiResult.rows[0] ? new ClrfiValue(clrfiResult.rows[0]).toJson() : null;
          } else {
            const clrfiValue = new ClrfiValue({ ...residenciaFiscalData, clrfi_cod_clien: clienteId });
            const clrfiNormalizado = clrfiValue.toJson();
            
            const createClrfiSql = `
              INSERT INTO ${this.tableClrfi} (
                clrfi_cod_clien, clrfi_ctr_resfi, clrfi_cod_nacio,
                clrfi_dir_resfi, clrfi_des_provi, clrfi_des_ciuda,
                clrfi_cod_posta, created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING *
            `;
            
            const clrfiParams = [
              clrfiNormalizado.clrfi_cod_clien,
              clrfiNormalizado.clrfi_ctr_resfi,
              clrfiNormalizado.clrfi_cod_nacio ?? null,
              clrfiNormalizado.clrfi_dir_resfi ?? null,
              clrfiNormalizado.clrfi_des_provi ?? null,
              clrfiNormalizado.clrfi_des_ciuda ?? null,
              clrfiNormalizado.clrfi_cod_posta ?? null,
              clrfiNormalizado.created_by,
              clrfiNormalizado.updated_by,
            ];
            
            const clrfiResult = await client.query(createClrfiSql, clrfiParams);
            residenciaFiscal = clrfiResult.rows[0] ? new ClrfiValue(clrfiResult.rows[0]).toJson() : null;
          }
        }

        // Asamblea
        const clasmExistenteSql = `SELECT * FROM ${this.tableClasm} WHERE clasm_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const clasmExistenteResult = await client.query(clasmExistenteSql, [clienteId]);
        const clasmExistente = clasmExistenteResult.rows[0];
        
        let asamblea: ClasmEntity | null = null;
        if (asambleaData === undefined) {
          asamblea = clasmExistente ? new ClasmValue(clasmExistente).toJson() : null;
        } else if (asambleaData === null) {
          if (clasmExistente) {
            await client.query(`UPDATE ${this.tableClasm} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clasm_cod_clasm = $2`, [clienteData.updated_by, clasmExistente.clasm_cod_clasm]);
          }
          asamblea = null;
        } else {
          if (clasmExistente) {
            const clasmValue = new ClasmValue(asambleaData, clasmExistente.clasm_cod_clasm);
            const clasmNormalizado = clasmValue.toJson();
            
            const updateClasmSql = `
              UPDATE ${this.tableClasm} SET
                clasm_cod_rasam = $1,
                clasm_fec_rasam = $2,
                clasm_ctr_direc = $3,
                clasm_fec_direc = $4,
                updated_by = $5,
                updated_at = CURRENT_TIMESTAMP
              WHERE clasm_cod_clasm = $6 AND deleted_at IS NULL
              RETURNING *
            `;
            
            const clasmParams = [
              clasmNormalizado.clasm_cod_rasam ?? null,
              clasmNormalizado.clasm_fec_rasam ?? null,
              clasmNormalizado.clasm_ctr_direc,
              clasmNormalizado.clasm_fec_direc ?? null,
              clasmNormalizado.updated_by,
              clasmExistente.clasm_cod_clasm,
            ];
            
            const clasmResult = await client.query(updateClasmSql, clasmParams);
            asamblea = clasmResult.rows[0] ? new ClasmValue(clasmResult.rows[0]).toJson() : null;
          } else {
            const clasmValue = new ClasmValue({ ...asambleaData, clasm_cod_clien: clienteId });
            const clasmNormalizado = clasmValue.toJson();
            
            const createClasmSql = `
              INSERT INTO ${this.tableClasm} (
                clasm_cod_clien, clasm_cod_rasam, clasm_fec_rasam,
                clasm_ctr_direc, clasm_fec_direc, created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING *
            `;
            
            const clasmParams = [
              clasmNormalizado.clasm_cod_clien,
              clasmNormalizado.clasm_cod_rasam ?? null,
              clasmNormalizado.clasm_fec_rasam ?? null,
              clasmNormalizado.clasm_ctr_direc,
              clasmNormalizado.clasm_fec_direc ?? null,
              clasmNormalizado.created_by,
              clasmNormalizado.updated_by,
            ];
            
            const clasmResult = await client.query(createClasmSql, clasmParams);
            asamblea = clasmResult.rows[0] ? new ClasmValue(clasmResult.rows[0]).toJson() : null;
          }
        }

        // Usuario Banca Digital
        const clbncExistenteSql = `SELECT * FROM ${this.tableClbnc} WHERE clbnc_cod_clien = $1 AND deleted_at IS NULL LIMIT 1`;
        const clbncExistenteResult = await client.query(clbncExistenteSql, [clienteId]);
        const clbncExistente = clbncExistenteResult.rows[0];
        
        let usuarioBancaDigital: ClbncEntity | null = null;
        if (usuarioBancaDigitalData === undefined) {
          usuarioBancaDigital = clbncExistente ? new ClbncValue(clbncExistente).toJson() : null;
        } else if (usuarioBancaDigitalData === null) {
          if (clbncExistente) {
            await client.query(`UPDATE ${this.tableClbnc} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clbnc_cod_clbnc = $2`, [clienteData.updated_by, clbncExistente.clbnc_cod_clbnc]);
          }
          usuarioBancaDigital = null;
        } else {
          if (clbncExistente) {
            const clbncValue = new ClbncValue(usuarioBancaDigitalData, clbncExistente.clbnc_cod_clbnc);
            const clbncNormalizado = clbncValue.toJson();
            
            const updateClbncSql = `
              UPDATE ${this.tableClbnc} SET
                clbnc_usr_banca = $1,
                clbnc_pwd_banca = $2,
                clbnc_ctr_activ = $3,
                clbnc_fec_ultin = $4,
                updated_by = $5,
                updated_at = CURRENT_TIMESTAMP
              WHERE clbnc_cod_clbnc = $6 AND deleted_at IS NULL
              RETURNING *
            `;
            
            const clbncParams = [
              clbncNormalizado.clbnc_usr_banca,
              clbncNormalizado.clbnc_pwd_banca,
              clbncNormalizado.clbnc_ctr_activ,
              clbncNormalizado.clbnc_fec_ultin ?? null,
              clbncNormalizado.updated_by,
              clbncExistente.clbnc_cod_clbnc,
            ];
            
            const clbncResult = await client.query(updateClbncSql, clbncParams);
            usuarioBancaDigital = clbncResult.rows[0] ? new ClbncValue(clbncResult.rows[0]).toJson() : null;
          } else {
            const clbncValue = new ClbncValue({ ...usuarioBancaDigitalData, clbnc_cod_clien: clienteId });
            const clbncNormalizado = clbncValue.toJson();
            
            const createClbncSql = `
              INSERT INTO ${this.tableClbnc} (
                clbnc_cod_clien, clbnc_usr_banca, clbnc_pwd_banca,
                clbnc_fec_regis, clbnc_ctr_activ, clbnc_ctr_termi, clbnc_lim_diario, clbnc_lim_mensu,
                created_by, updated_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *
            `;
            
            const clbncParams = [
              clbncNormalizado.clbnc_cod_clien,
              clbncNormalizado.clbnc_usr_banca,
              clbncNormalizado.clbnc_pwd_banca,
              clbncNormalizado.clbnc_fec_regis,
              clbncNormalizado.clbnc_ctr_activ,
              clbncNormalizado.clbnc_ctr_termi,
              clbncNormalizado.clbnc_lim_diario,
              clbncNormalizado.clbnc_lim_mensu,
              clbncNormalizado.created_by,
              clbncNormalizado.updated_by,
            ];
            
            const clbncResult = await client.query(createClbncSql, clbncParams);
            usuarioBancaDigital = clbncResult.rows[0] ? new ClbncValue(clbncResult.rows[0]).toJson() : null;
          }
        }

        // 6. Manejar relaciones 1:N (referencias, información financiera, beneficiarios)
        // Referencias
        let referencias: ClrefEntity[] = [];
        if (referenciasData === undefined) {
          // No modificar - cargar existentes
          const referenciasSql = `SELECT * FROM ${this.tableClref} WHERE clref_cod_clien = $1 AND deleted_at IS NULL ORDER BY clref_cod_clref ASC`;
          const referenciasResult = await client.query(referenciasSql, [clienteId]);
          referencias = referenciasResult.rows.map(ref => new ClrefValue(ref).toJson());
        } else if (referenciasData === null) {
          // Eliminar todas
          await client.query(`UPDATE ${this.tableClref} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clref_cod_clien = $2 AND deleted_at IS NULL`, [clienteData.updated_by, clienteId]);
          referencias = [];
        } else {
          // Sync completo: obtener existentes, comparar y hacer create/update/delete
          const referenciasExistentesSql = `SELECT * FROM ${this.tableClref} WHERE clref_cod_clien = $1 AND deleted_at IS NULL`;
          const referenciasExistentesResult = await client.query(referenciasExistentesSql, [clienteId]);
          const referenciasExistentes = referenciasExistentesResult.rows;
          const referenciasExistentesIds = new Set(referenciasExistentes.map(r => r.clref_cod_clref));
          const referenciasNuevasIds = new Set(referenciasData.filter(r => r.clref_cod_clref).map(r => r.clref_cod_clref));

          // Eliminar las que no están en el nuevo array
          for (const existente of referenciasExistentes) {
            if (!referenciasNuevasIds.has(existente.clref_cod_clref)) {
              await client.query(`UPDATE ${this.tableClref} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clref_cod_clref = $2`, [clienteData.updated_by, existente.clref_cod_clref]);
            }
          }

          // Crear o actualizar las del nuevo array
          for (const refData of referenciasData) {
            if (refData.clref_cod_clref && referenciasExistentesIds.has(refData.clref_cod_clref)) {
              // Actualizar existente
              const clrefValue = new ClrefValue(refData, refData.clref_cod_clref);
              const clrefNormalizado = clrefValue.toJson();
              
              const updateClrefSql = `
                UPDATE ${this.tableClref} SET
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
              
              const clrefParams = [
                clrefNormalizado.clref_cod_tiref,
                clrefNormalizado.clref_cod_perso ?? null,
                clrefNormalizado.clref_nom_refer ?? null,
                clrefNormalizado.clref_dir_refer ?? null,
                clrefNormalizado.clref_tlf_refer ?? null,
                clrefNormalizado.clref_num_ctadp ?? null,
                clrefNormalizado.clref_val_saldo ?? null,
                clrefNormalizado.clref_fec_apert ?? null,
                clrefNormalizado.updated_by,
                refData.clref_cod_clref,
              ];
              
              const clrefResult = await client.query(updateClrefSql, clrefParams);
              if (clrefResult.rows[0]) {
                referencias.push(new ClrefValue(clrefResult.rows[0]).toJson());
              }
            } else {
              // Crear nuevo
              const clrefValue = new ClrefValue({ ...refData, clref_cod_clien: clienteId });
              const clrefNormalizado = clrefValue.toJson();
              
              const createClrefSql = `
                INSERT INTO ${this.tableClref} (
                  clref_cod_clien, clref_cod_tiref, clref_cod_perso,
                  clref_nom_refer, clref_dir_refer, clref_tlf_refer,
                  clref_num_ctadp, clref_val_saldo, clref_fec_apert,
                  created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
              `;
              
              const clrefParams = [
                clrefNormalizado.clref_cod_clien,
                clrefNormalizado.clref_cod_tiref,
                clrefNormalizado.clref_cod_perso ?? null,
                clrefNormalizado.clref_nom_refer ?? null,
                clrefNormalizado.clref_dir_refer ?? null,
                clrefNormalizado.clref_tlf_refer ?? null,
                clrefNormalizado.clref_num_ctadp ?? null,
                clrefNormalizado.clref_val_saldo ?? null,
                clrefNormalizado.clref_fec_apert ?? null,
                clrefNormalizado.created_by,
                clrefNormalizado.updated_by,
              ];
              
              const clrefResult = await client.query(createClrefSql, clrefParams);
              if (clrefResult.rows[0]) {
                referencias.push(new ClrefValue(clrefResult.rows[0]).toJson());
              }
            }
          }
        }

        // Información Financiera
        let informacionFinanciera: ClfinEntity[] = [];
        if (informacionFinancieraData === undefined) {
          // No modificar - cargar existentes
          const clfinSql = `SELECT * FROM ${this.tableClfin} WHERE clfin_cod_clien = $1 AND deleted_at IS NULL ORDER BY clfin_cod_clfin ASC`;
          const clfinResult = await client.query(clfinSql, [clienteId]);
          informacionFinanciera = clfinResult.rows.map(info => new ClfinValue(info).toJson());
        } else if (informacionFinancieraData === null) {
          // Eliminar todas
          await client.query(`UPDATE ${this.tableClfin} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clfin_cod_clien = $2 AND deleted_at IS NULL`, [clienteData.updated_by, clienteId]);
          informacionFinanciera = [];
        } else {
          // Sync completo
          const clfinExistentesSql = `SELECT * FROM ${this.tableClfin} WHERE clfin_cod_clien = $1 AND deleted_at IS NULL`;
          const clfinExistentesResult = await client.query(clfinExistentesSql, [clienteId]);
          const clfinExistentes = clfinExistentesResult.rows;
          const clfinExistentesIds = new Set(clfinExistentes.map(c => c.clfin_cod_clfin));
          const clfinNuevosIds = new Set(informacionFinancieraData.filter(c => c.clfin_cod_clfin).map(c => c.clfin_cod_clfin));

          // Eliminar las que no están en el nuevo array
          for (const existente of clfinExistentes) {
            if (!clfinNuevosIds.has(existente.clfin_cod_clfin)) {
              await client.query(`UPDATE ${this.tableClfin} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clfin_cod_clfin = $2`, [clienteData.updated_by, existente.clfin_cod_clfin]);
            }
          }

          // Crear o actualizar las del nuevo array
          for (const clfinData of informacionFinancieraData) {
            if (clfinData.clfin_cod_clfin && clfinExistentesIds.has(clfinData.clfin_cod_clfin)) {
              // Actualizar existente
              const clfinValue = new ClfinValue(clfinData, clfinData.clfin_cod_clfin);
              const clfinNormalizado = clfinValue.toJson();
              
              const updateClfinSql = `
                UPDATE ${this.tableClfin} SET
                  clfin_cod_tifin = $1,
                  clfin_val_monto = $2,
                  clfin_des_clfin = $3,
                  updated_by = $4,
                  updated_at = CURRENT_TIMESTAMP
                WHERE clfin_cod_clfin = $5 AND deleted_at IS NULL
                RETURNING *
              `;
              
              const clfinParams = [
                clfinNormalizado.clfin_cod_tifin,
                clfinNormalizado.clfin_val_monto,
                clfinNormalizado.updated_by,
                clfinData.clfin_cod_clfin,
              ];
              
              const clfinResult = await client.query(updateClfinSql, clfinParams);
              if (clfinResult.rows[0]) {
                informacionFinanciera.push(new ClfinValue(clfinResult.rows[0]).toJson());
              }
            } else {
              // Crear nuevo
              const clfinValue = new ClfinValue({ ...clfinData, clfin_cod_clien: clienteId });
              const clfinNormalizado = clfinValue.toJson();
              
              const createClfinSql = `
                INSERT INTO ${this.tableClfin} (
                  clfin_cod_clien, clfin_cod_tifin, clfin_val_monto,
                  created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
              `;
              
              const clfinParams = [
                clfinNormalizado.clfin_cod_clien,
                clfinNormalizado.clfin_cod_tifin,
                clfinNormalizado.clfin_val_monto,
                clfinNormalizado.created_by,
                clfinNormalizado.updated_by,
              ];
              
              const clfinResult = await client.query(createClfinSql, clfinParams);
              if (clfinResult.rows[0]) {
                informacionFinanciera.push(new ClfinValue(clfinResult.rows[0]).toJson());
              }
            }
          }
        }

        // Beneficiarios (solo si existe usuario banca digital)
        let beneficiarios: ClbenEntity[] = [];
        if (usuarioBancaDigital) {
          if (beneficiariosData === undefined) {
            // No modificar - cargar existentes
            const clbenSql = `SELECT * FROM ${this.tableClben} WHERE clben_cod_clbnc = $1 AND deleted_at IS NULL ORDER BY clben_cod_clben ASC`;
            const clbenResult = await client.query(clbenSql, [usuarioBancaDigital.clbnc_cod_clbnc]);
            beneficiarios = clbenResult.rows.map(ben => new ClbenValue(ben).toJson());
          } else if (beneficiariosData === null) {
            // Eliminar todas
            await client.query(`UPDATE ${this.tableClben} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clben_cod_clbnc = $2 AND deleted_at IS NULL`, [clienteData.updated_by, usuarioBancaDigital.clbnc_cod_clbnc]);
            beneficiarios = [];
          } else {
            // Sync completo
            const clbenExistentesSql = `SELECT * FROM ${this.tableClben} WHERE clben_cod_clbnc = $1 AND deleted_at IS NULL`;
            const clbenExistentesResult = await client.query(clbenExistentesSql, [usuarioBancaDigital.clbnc_cod_clbnc]);
            const clbenExistentes = clbenExistentesResult.rows;
            const clbenExistentesIds = new Set(clbenExistentes.map(b => b.clben_cod_clben));
            const clbenNuevosIds = new Set(beneficiariosData.filter(b => b.clben_cod_clben).map(b => b.clben_cod_clben));

            // Eliminar las que no están en el nuevo array
            for (const existente of clbenExistentes) {
              if (!clbenNuevosIds.has(existente.clben_cod_clben)) {
                await client.query(`UPDATE ${this.tableClben} SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE clben_cod_clben = $2`, [clienteData.updated_by, existente.clben_cod_clben]);
              }
            }

            // Crear o actualizar las del nuevo array
            for (const clbenData of beneficiariosData) {
              if (clbenData.clben_cod_clben && clbenExistentesIds.has(clbenData.clben_cod_clben)) {
                // Actualizar existente
                const clbenValue = new ClbenValue(clbenData, clbenData.clben_cod_clben);
                const clbenNormalizado = clbenValue.toJson();
                
                const updateClbenSql = `
                  UPDATE ${this.tableClben} SET
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
                
                const clbenParams = [
                  clbenNormalizado.clben_num_cuent,
                  clbenNormalizado.clben_cod_tcuen,
                  clbenNormalizado.clben_cod_ifina ?? null,
                  clbenNormalizado.clben_nom_benef,
                  clbenNormalizado.clben_ide_benef,
                  clbenNormalizado.clben_cod_tiden ?? null,
                  clbenNormalizado.clben_ema_benef ?? null,
                  clbenNormalizado.clben_ctr_exter,
                  clbenNormalizado.clben_ali_benef ?? null,
                  clbenNormalizado.clben_ctr_activ,
                  clbenNormalizado.updated_by,
                  clbenData.clben_cod_clben,
                ];
                
                const clbenResult = await client.query(updateClbenSql, clbenParams);
                if (clbenResult.rows[0]) {
                  beneficiarios.push(new ClbenValue(clbenResult.rows[0]).toJson());
                }
              } else {
                // Crear nuevo
                if (!usuarioBancaDigital?.clbnc_cod_clbnc) {
                  throw new Error('Usuario de banca digital no encontrado para crear beneficiario');
                }
                const clbenValue = new ClbenValue({ ...clbenData, clben_cod_clbnc: usuarioBancaDigital.clbnc_cod_clbnc });
                const clbenNormalizado = clbenValue.toJson();
                
                const createClbenSql = `
                  INSERT INTO ${this.tableClben} (
                    clben_cod_clbnc, clben_num_cuent, clben_cod_tcuen,
                    clben_cod_ifina, clben_nom_benef, clben_ide_benef,
                    clben_cod_tiden, clben_ema_benef, clben_ctr_exter,
                    clben_ali_benef, clben_ctr_activ, created_by, updated_by
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                  RETURNING *
                `;
                
                const clbenParams = [
                  clbenNormalizado.clben_cod_clbnc,
                  clbenNormalizado.clben_num_cuent,
                  clbenNormalizado.clben_cod_tcuen,
                  clbenNormalizado.clben_cod_ifina ?? null,
                  clbenNormalizado.clben_nom_benef,
                  clbenNormalizado.clben_ide_benef,
                  clbenNormalizado.clben_cod_tiden ?? null,
                  clbenNormalizado.clben_ema_benef ?? null,
                  clbenNormalizado.clben_ctr_exter,
                  clbenNormalizado.clben_ali_benef ?? null,
                  clbenNormalizado.clben_ctr_activ,
                  clbenNormalizado.created_by,
                  clbenNormalizado.updated_by,
                ];
                
                const clbenResult = await client.query(createClbenSql, clbenParams);
                if (clbenResult.rows[0]) {
                  beneficiarios.push(new ClbenValue(clbenResult.rows[0]).toJson());
                }
              }
            }
          }
        }

        return {
          persona: personaActualizada,
          cliente: clienteActualizado,
          domicilio,
          actividadEconomica,
          representante,
          conyuge,
          informacionLaboral,
          referencias,
          informacionFinanciera,
          usuarioBancaDigital,
          beneficiarios,
          residenciaFiscal,
          asamblea,
        };
      });
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: 'cliente_completo', method: 'actualizarClienteCompleto' }),
        500,
        error
      );
    }
  }
}
