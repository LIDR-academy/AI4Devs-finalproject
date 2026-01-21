import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from "../../domain/entity";
import { CiiuPort } from "../../domain/port";
import {
  SeccionValue, DivisionValue, GrupoValue,
  ClaseValue, SubclaseValue, ActividadValue
} from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { CiiuEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class CiiuDBRepository implements CiiuPort {

  private readonly tableCisec = CiiuEnum.table.cisec;
  private readonly tableCidiv = CiiuEnum.table.cidiv;
  private readonly tableCigru = CiiuEnum.table.cigru;
  private readonly tableCicla = CiiuEnum.table.cicla;
  private readonly tableCisub = CiiuEnum.table.cisub;
  private readonly tableCiact = CiiuEnum.table.ciact;

  constructor(private readonly pgRepository: PgService) { }

  // ==================== SECCIÓN (Nivel 1) ====================

  async createSeccion(data: SeccionEntity): Promise<SeccionEntity | null> {
    try {
      const entityData = {
        cisec_abr_cisec: data.cisec_abr_cisec,
        cisec_des_cisec: data.cisec_des_cisec,
        cisec_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<SeccionEntity>(this.tableCisec, entityData);
      if (!created) return null;
      return new SeccionValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCisec, method: 'createSeccion' }),
        500,
        error
      );
    }
  }

  async findAllSecciones(): Promise<SeccionEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCisec} WHERE cisec_fec_elimi IS NULL ORDER BY cisec_cod_cisec ASC`;
      const data = await this.pgRepository.queryList<SeccionEntity>(sql, []);
      return data.map(item => new SeccionValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCisec, method: 'findAllSecciones' }),
        500,
        error
      );
    }
  }

  async findSeccionById(id: number): Promise<SeccionEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCisec} WHERE cisec_cod_cisec = $1 AND cisec_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<SeccionEntity>(sql, [id]);
      return data ? new SeccionValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCisec, method: 'findSeccionById' }),
        500,
        error
      );
    }
  }

  async findSeccionByAbr(abr: string): Promise<SeccionEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCisec} WHERE cisec_abr_cisec = $1 AND cisec_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<SeccionEntity>(sql, [abr.toUpperCase()]);
      return data ? new SeccionValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCisec, method: 'findSeccionByAbr' }),
        500,
        error
      );
    }
  }

  async updateSeccion(id: number, data: SeccionEntity): Promise<SeccionEntity | null> {
    try {
      const entityData = {
        cisec_abr_cisec: data.cisec_abr_cisec,
        cisec_des_cisec: data.cisec_des_cisec,
      };

      const updated = await this.pgRepository.update<SeccionEntity>(
        this.tableCisec,
        entityData,
        { cisec_cod_cisec: id }
      );
      if (!updated) return null;
      return new SeccionValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCisec, method: 'updateSeccion' }),
        500,
        error
      );
    }
  }

  async deleteSeccion(id: number): Promise<SeccionEntity | null> {
    try {
      const entityData = {
        cisec_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<SeccionEntity>(
        this.tableCisec,
        entityData,
        { cisec_cod_cisec: id }
      );
      if (!updated) return null;
      return new SeccionValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCisec, method: 'deleteSeccion' }),
        500,
        error
      );
    }
  }

  // ==================== DIVISIÓN (Nivel 2) ====================

  async createDivision(data: DivisionEntity): Promise<DivisionEntity | null> {
    try {
      const entityData = {
        cidiv_cod_cisec: data.cidiv_cod_cisec,
        cidiv_abr_cidiv: data.cidiv_abr_cidiv,
        cidiv_des_cidiv: data.cidiv_des_cidiv,
        cidiv_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<DivisionEntity>(this.tableCidiv, entityData);
      if (!created) return null;
      return new DivisionValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCidiv, method: 'createDivision' }),
        500,
        error
      );
    }
  }

  async findAllDivisiones(): Promise<DivisionEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCidiv} WHERE cidiv_fec_elimi IS NULL ORDER BY cidiv_cod_cidiv ASC`;
      const data = await this.pgRepository.queryList<DivisionEntity>(sql, []);
      return data.map(item => new DivisionValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCidiv, method: 'findAllDivisiones' }),
        500,
        error
      );
    }
  }

  async findDivisionesBySeccion(cisecId: number): Promise<DivisionEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCidiv} WHERE cidiv_cod_cisec = $1 AND cidiv_fec_elimi IS NULL ORDER BY cidiv_cod_cidiv ASC`;
      const data = await this.pgRepository.queryList<DivisionEntity>(sql, [cisecId]);
      return data.map(item => new DivisionValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCidiv, method: 'findDivisionesBySeccion' }),
        500,
        error
      );
    }
  }

  async findDivisionById(id: number): Promise<DivisionEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCidiv} WHERE cidiv_cod_cidiv = $1 AND cidiv_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<DivisionEntity>(sql, [id]);
      return data ? new DivisionValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCidiv, method: 'findDivisionById' }),
        500,
        error
      );
    }
  }

  async updateDivision(id: number, data: DivisionEntity): Promise<DivisionEntity | null> {
    try {
      const entityData = {
        cidiv_cod_cisec: data.cidiv_cod_cisec,
        cidiv_abr_cidiv: data.cidiv_abr_cidiv,
        cidiv_des_cidiv: data.cidiv_des_cidiv,
      };

      const updated = await this.pgRepository.update<DivisionEntity>(
        this.tableCidiv,
        entityData,
        { cidiv_cod_cidiv: id }
      );
      if (!updated) return null;
      return new DivisionValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCidiv, method: 'updateDivision' }),
        500,
        error
      );
    }
  }

  async deleteDivision(id: number): Promise<DivisionEntity | null> {
    try {
      const entityData = {
        cidiv_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<DivisionEntity>(
        this.tableCidiv,
        entityData,
        { cidiv_cod_cidiv: id }
      );
      if (!updated) return null;
      return new DivisionValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCidiv, method: 'deleteDivision' }),
        500,
        error
      );
    }
  }

  // ==================== GRUPO (Nivel 3) ====================

  async createGrupo(data: GrupoEntity): Promise<GrupoEntity | null> {
    try {
      const entityData = {
        cigru_cod_cidiv: data.cigru_cod_cidiv,
        cigru_abr_cigru: data.cigru_abr_cigru,
        cigru_des_cigru: data.cigru_des_cigru,
        cigru_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<GrupoEntity>(this.tableCigru, entityData);
      if (!created) return null;
      return new GrupoValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCigru, method: 'createGrupo' }),
        500,
        error
      );
    }
  }

  async findAllGrupos(): Promise<GrupoEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCigru} WHERE cigru_fec_elimi IS NULL ORDER BY cigru_cod_cigru ASC`;
      const data = await this.pgRepository.queryList<GrupoEntity>(sql, []);
      return data.map(item => new GrupoValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCigru, method: 'findAllGrupos' }),
        500,
        error
      );
    }
  }

  async findGruposByDivision(cidivId: number): Promise<GrupoEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCigru} WHERE cigru_cod_cidiv = $1 AND cigru_fec_elimi IS NULL ORDER BY cigru_cod_cigru ASC`;
      const data = await this.pgRepository.queryList<GrupoEntity>(sql, [cidivId]);
      return data.map(item => new GrupoValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCigru, method: 'findGruposByDivision' }),
        500,
        error
      );
    }
  }

  async findGrupoById(id: number): Promise<GrupoEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCigru} WHERE cigru_cod_cigru = $1 AND cigru_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<GrupoEntity>(sql, [id]);
      return data ? new GrupoValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCigru, method: 'findGrupoById' }),
        500,
        error
      );
    }
  }

  async updateGrupo(id: number, data: GrupoEntity): Promise<GrupoEntity | null> {
    try {
      const entityData = {
        cigru_cod_cidiv: data.cigru_cod_cidiv,
        cigru_abr_cigru: data.cigru_abr_cigru,
        cigru_des_cigru: data.cigru_des_cigru,
      };

      const updated = await this.pgRepository.update<GrupoEntity>(
        this.tableCigru,
        entityData,
        { cigru_cod_cigru: id }
      );
      if (!updated) return null;
      return new GrupoValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCigru, method: 'updateGrupo' }),
        500,
        error
      );
    }
  }

  async deleteGrupo(id: number): Promise<GrupoEntity | null> {
    try {
      const entityData = {
        cigru_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<GrupoEntity>(
        this.tableCigru,
        entityData,
        { cigru_cod_cigru: id }
      );
      if (!updated) return null;
      return new GrupoValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCigru, method: 'deleteGrupo' }),
        500,
        error
      );
    }
  }

  // ==================== CLASE (Nivel 4) ====================

  async createClase(data: ClaseEntity): Promise<ClaseEntity | null> {
    try {
      const entityData = {
        cicla_cod_cigru: data.cicla_cod_cigru,
        cicla_abr_cicla: data.cicla_abr_cicla,
        cicla_des_cicla: data.cicla_des_cicla,
        cicla_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<ClaseEntity>(this.tableCicla, entityData);
      if (!created) return null;
      return new ClaseValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCicla, method: 'createClase' }),
        500,
        error
      );
    }
  }

  async findAllClases(): Promise<ClaseEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCicla} WHERE cicla_fec_elimi IS NULL ORDER BY cicla_cod_cicla ASC`;
      const data = await this.pgRepository.queryList<ClaseEntity>(sql, []);
      return data.map(item => new ClaseValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCicla, method: 'findAllClases' }),
        500,
        error
      );
    }
  }

  async findClasesByGrupo(cigruId: number): Promise<ClaseEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCicla} WHERE cicla_cod_cigru = $1 AND cicla_fec_elimi IS NULL ORDER BY cicla_cod_cicla ASC`;
      const data = await this.pgRepository.queryList<ClaseEntity>(sql, [cigruId]);
      return data.map(item => new ClaseValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCicla, method: 'findClasesByGrupo' }),
        500,
        error
      );
    }
  }

  async findClaseById(id: number): Promise<ClaseEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCicla} WHERE cicla_cod_cicla = $1 AND cicla_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<ClaseEntity>(sql, [id]);
      return data ? new ClaseValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCicla, method: 'findClaseById' }),
        500,
        error
      );
    }
  }

  async updateClase(id: number, data: ClaseEntity): Promise<ClaseEntity | null> {
    try {
      const entityData = {
        cicla_cod_cigru: data.cicla_cod_cigru,
        cicla_abr_cicla: data.cicla_abr_cicla,
        cicla_des_cicla: data.cicla_des_cicla,
      };

      const updated = await this.pgRepository.update<ClaseEntity>(
        this.tableCicla,
        entityData,
        { cicla_cod_cicla: id }
      );
      if (!updated) return null;
      return new ClaseValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCicla, method: 'updateClase' }),
        500,
        error
      );
    }
  }

  async deleteClase(id: number): Promise<ClaseEntity | null> {
    try {
      const entityData = {
        cicla_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<ClaseEntity>(
        this.tableCicla,
        entityData,
        { cicla_cod_cicla: id }
      );
      if (!updated) return null;
      return new ClaseValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCicla, method: 'deleteClase' }),
        500,
        error
      );
    }
  }

  // ==================== SUBCLASE (Nivel 5) ====================

  async createSubclase(data: SubclaseEntity): Promise<SubclaseEntity | null> {
    try {
      const entityData = {
        cisub_cod_cicla: data.cisub_cod_cicla,
        cisub_abr_cisub: data.cisub_abr_cisub,
        cisub_des_cisub: data.cisub_des_cisub,
        cisub_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<SubclaseEntity>(this.tableCisub, entityData);
      if (!created) return null;
      return new SubclaseValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCisub, method: 'createSubclase' }),
        500,
        error
      );
    }
  }

  async findAllSubclases(): Promise<SubclaseEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCisub} WHERE cisub_fec_elimi IS NULL ORDER BY cisub_cod_cisub ASC`;
      const data = await this.pgRepository.queryList<SubclaseEntity>(sql, []);
      return data.map(item => new SubclaseValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCisub, method: 'findAllSubclases' }),
        500,
        error
      );
    }
  }

  async findSubclasesByClase(ciclaId: number): Promise<SubclaseEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCisub} WHERE cisub_cod_cicla = $1 AND cisub_fec_elimi IS NULL ORDER BY cisub_cod_cisub ASC`;
      const data = await this.pgRepository.queryList<SubclaseEntity>(sql, [ciclaId]);
      return data.map(item => new SubclaseValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCisub, method: 'findSubclasesByClase' }),
        500,
        error
      );
    }
  }

  async findSubclaseById(id: number): Promise<SubclaseEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCisub} WHERE cisub_cod_cisub = $1 AND cisub_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<SubclaseEntity>(sql, [id]);
      return data ? new SubclaseValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCisub, method: 'findSubclaseById' }),
        500,
        error
      );
    }
  }

  async updateSubclase(id: number, data: SubclaseEntity): Promise<SubclaseEntity | null> {
    try {
      const entityData = {
        cisub_cod_cicla: data.cisub_cod_cicla,
        cisub_abr_cisub: data.cisub_abr_cisub,
        cisub_des_cisub: data.cisub_des_cisub,
      };

      const updated = await this.pgRepository.update<SubclaseEntity>(
        this.tableCisub,
        entityData,
        { cisub_cod_cisub: id }
      );
      if (!updated) return null;
      return new SubclaseValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCisub, method: 'updateSubclase' }),
        500,
        error
      );
    }
  }

  async deleteSubclase(id: number): Promise<SubclaseEntity | null> {
    try {
      const entityData = {
        cisub_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<SubclaseEntity>(
        this.tableCisub,
        entityData,
        { cisub_cod_cisub: id }
      );
      if (!updated) return null;
      return new SubclaseValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCisub, method: 'deleteSubclase' }),
        500,
        error
      );
    }
  }

  // ==================== ACTIVIDAD (Nivel 6) ====================

  async createActividad(data: ActividadEntity): Promise<ActividadEntity | null> {
    try {
      const entityData = {
        ciact_cod_cisub: data.ciact_cod_cisub,
        ciact_cod_semaf: data.ciact_cod_semaf ?? 0,
        ciact_abr_ciact: data.ciact_abr_ciact,
        ciact_des_ciact: data.ciact_des_ciact,
        ciact_fec_creac: new Date(),
      };

      const created = await this.pgRepository.create<ActividadEntity>(this.tableCiact, entityData);
      if (!created) return null;
      return new ActividadValue(created).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'create', resource: this.tableCiact, method: 'createActividad' }),
        500,
        error
      );
    }
  }

  async findAllActividades(): Promise<ActividadEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCiact} WHERE ciact_fec_elimi IS NULL ORDER BY ciact_cod_ciact ASC`;
      const data = await this.pgRepository.queryList<ActividadEntity>(sql, []);
      return data.map(item => new ActividadValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCiact, method: 'findAllActividades' }),
        500,
        error
      );
    }
  }

  async findActividadesBySubclase(cisubId: number): Promise<ActividadEntity[]> {
    try {
      const sql = `SELECT * FROM ${this.tableCiact} WHERE ciact_cod_cisub = $1 AND ciact_fec_elimi IS NULL ORDER BY ciact_cod_ciact ASC`;
      const data = await this.pgRepository.queryList<ActividadEntity>(sql, [cisubId]);
      return data.map(item => new ActividadValue(item).toJson());
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: this.tableCiact, method: 'findActividadesBySubclase' }),
        500,
        error
      );
    }
  }

  async findActividadById(id: number): Promise<ActividadEntity | null> {
    try {
      const sql = `SELECT * FROM ${this.tableCiact} WHERE ciact_cod_ciact = $1 AND ciact_fec_elimi IS NULL LIMIT 1`;
      const data = await this.pgRepository.queryGet<ActividadEntity>(sql, [id]);
      return data ? new ActividadValue(data).toJson() : null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: this.tableCiact, method: 'findActividadById' }),
        500,
        error
      );
    }
  }

  async updateActividad(id: number, data: ActividadEntity): Promise<ActividadEntity | null> {
    try {
      const entityData = {
        ciact_cod_cisub: data.ciact_cod_cisub,
        ciact_cod_semaf: data.ciact_cod_semaf,
        ciact_abr_ciact: data.ciact_abr_ciact,
        ciact_des_ciact: data.ciact_des_ciact,
      };

      const updated = await this.pgRepository.update<ActividadEntity>(
        this.tableCiact,
        entityData,
        { ciact_cod_ciact: id }
      );
      if (!updated) return null;
      return new ActividadValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'update', resource: this.tableCiact, method: 'updateActividad' }),
        500,
        error
      );
    }
  }

  async deleteActividad(id: number): Promise<ActividadEntity | null> {
    try {
      const entityData = {
        ciact_fec_elimi: new Date(),
      };

      const updated = await this.pgRepository.update<ActividadEntity>(
        this.tableCiact,
        entityData,
        { ciact_cod_ciact: id }
      );
      if (!updated) return null;
      return new ActividadValue(updated).toJson();
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'delete', resource: this.tableCiact, method: 'deleteActividad' }),
        500,
        error
      );
    }
  }

  // ==================== BÚSQUEDA Y SELECTOR ====================

  async searchActividades(query: string, limit: number = 20): Promise<ActividadCompletaEntity[]> {
    try {
      const sql = `
        SELECT *
        FROM vw_ciiu_actividad_completa
        WHERE ciact_des_ciact ILIKE $1
           OR ciact_abr_ciact ILIKE $2
        ORDER BY 
          CASE 
            WHEN ciact_abr_ciact ILIKE $2 THEN 1
            WHEN ciact_des_ciact ILIKE $3 THEN 2
            ELSE 3
          END,
          ciact_des_ciact
        LIMIT $4
      `;
      
      const params = [
        `%${query}%`,           // $1: búsqueda parcial en descripción
        `${query}%`,            // $2: búsqueda por código que empieza con
        `${query}%`,            // $3: descripción que empieza con
        limit                   // $4: límite
      ];
      
      return await this.pgRepository.queryList<ActividadCompletaEntity>(sql, params);
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: 'vw_ciiu_actividad_completa', method: 'searchActividades' }),
        500,
        error
      );
    }
  }

  async findActividadCompleta(ciactId: number): Promise<ActividadCompletaEntity | null> {
    try {
      const sql = `SELECT * FROM vw_ciiu_actividad_completa WHERE ciact_cod_ciact = $1 LIMIT 1`;
      const result = await this.pgRepository.queryGet<ActividadCompletaEntity>(sql, [ciactId]);
      return result || null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: 'vw_ciiu_actividad_completa', method: 'findActividadCompleta' }),
        500,
        error
      );
    }
  }

  async findActividadCompletaByAbr(abr: string): Promise<ActividadCompletaEntity | null> {
    try {
      const sql = `SELECT * FROM vw_ciiu_actividad_completa WHERE ciact_abr_ciact = $1 LIMIT 1`;
      const result = await this.pgRepository.queryGet<ActividadCompletaEntity>(sql, [abr.toUpperCase()]);
      return result || null;
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'get', resource: 'vw_ciiu_actividad_completa', method: 'findActividadCompletaByAbr' }),
        500,
        error
      );
    }
  }

  // ==================== ÁRBOL JERÁRQUICO ====================

  async findArbolCompleto(): Promise<ArbolCiiuEntity[]> {
    try {
      const sql = `SELECT * FROM vw_ciiu_arbol ORDER BY nivel, codigo`;
      return await this.pgRepository.queryList<ArbolCiiuEntity>(sql, []);
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: 'vw_ciiu_arbol', method: 'findArbolCompleto' }),
        500,
        error
      );
    }
  }

  async findHijosByNivel(nivel: number, parentId: number): Promise<ArbolCiiuEntity[]> {
    try {
      const sql = `
        SELECT * FROM vw_ciiu_arbol 
        WHERE nivel = $1 AND parent_id = $2
        ORDER BY codigo
      `;
      return await this.pgRepository.queryList<ArbolCiiuEntity>(sql, [nivel, parentId]);
    } catch (error: any) {
      throw ResponseUtil.error(
        InformationMessage.error({ action: 'list', resource: 'vw_ciiu_arbol', method: 'findHijosByNivel' }),
        500,
        error
      );
    }
  }
}

