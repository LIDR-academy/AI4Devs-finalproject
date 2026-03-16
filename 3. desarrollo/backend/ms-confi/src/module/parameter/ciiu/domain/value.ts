import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity
} from "./entity";

/**
 * Value object para Sección
 */
export class SeccionValue implements SeccionEntity {
  cisec_cod_cisec?: number;
  cisec_abr_cisec: string;
  cisec_des_cisec: string;
  cisec_fec_creac?: Date;
  cisec_fec_elimi?: Date | null;

  constructor(data: SeccionEntity, id?: number) {
    this.cisec_cod_cisec = id ?? data.cisec_cod_cisec;
    this.cisec_abr_cisec = data.cisec_abr_cisec.trim().toUpperCase();
    this.cisec_des_cisec = data.cisec_des_cisec.trim();
    this.cisec_fec_creac = data.cisec_fec_creac;
    this.cisec_fec_elimi = data.cisec_fec_elimi ?? null;
  }

  public toJson(): SeccionEntity {
    return {
      ...(this.cisec_cod_cisec ? { cisec_cod_cisec: this.cisec_cod_cisec } : {}),
      cisec_abr_cisec: this.cisec_abr_cisec,
      cisec_des_cisec: this.cisec_des_cisec,
      ...(this.cisec_fec_creac ? { cisec_fec_creac: this.cisec_fec_creac } : {}),
      cisec_fec_elimi: this.cisec_fec_elimi,
    };
  }
}

/**
 * Value object para División
 */
export class DivisionValue implements DivisionEntity {
  cidiv_cod_cidiv?: number;
  cidiv_cod_cisec: number;
  cidiv_abr_cidiv: string;
  cidiv_des_cidiv: string;
  cidiv_fec_creac?: Date;
  cidiv_fec_elimi?: Date | null;

  constructor(data: DivisionEntity, id?: number) {
    this.cidiv_cod_cidiv = id ?? data.cidiv_cod_cidiv;
    this.cidiv_cod_cisec = data.cidiv_cod_cisec;
    this.cidiv_abr_cidiv = data.cidiv_abr_cidiv.trim().toUpperCase();
    this.cidiv_des_cidiv = data.cidiv_des_cidiv.trim();
    this.cidiv_fec_creac = data.cidiv_fec_creac;
    this.cidiv_fec_elimi = data.cidiv_fec_elimi ?? null;
  }

  public toJson(): DivisionEntity {
    return {
      ...(this.cidiv_cod_cidiv ? { cidiv_cod_cidiv: this.cidiv_cod_cidiv } : {}),
      cidiv_cod_cisec: this.cidiv_cod_cisec,
      cidiv_abr_cidiv: this.cidiv_abr_cidiv,
      cidiv_des_cidiv: this.cidiv_des_cidiv,
      ...(this.cidiv_fec_creac ? { cidiv_fec_creac: this.cidiv_fec_creac } : {}),
      cidiv_fec_elimi: this.cidiv_fec_elimi,
    };
  }
}

/**
 * Value object para Grupo
 */
export class GrupoValue implements GrupoEntity {
  cigru_cod_cigru?: number;
  cigru_cod_cidiv: number;
  cigru_abr_cigru: string;
  cigru_des_cigru: string;
  cigru_fec_creac?: Date;
  cigru_fec_elimi?: Date | null;

  constructor(data: GrupoEntity, id?: number) {
    this.cigru_cod_cigru = id ?? data.cigru_cod_cigru;
    this.cigru_cod_cidiv = data.cigru_cod_cidiv;
    this.cigru_abr_cigru = data.cigru_abr_cigru.trim().toUpperCase();
    this.cigru_des_cigru = data.cigru_des_cigru.trim();
    this.cigru_fec_creac = data.cigru_fec_creac;
    this.cigru_fec_elimi = data.cigru_fec_elimi ?? null;
  }

  public toJson(): GrupoEntity {
    return {
      ...(this.cigru_cod_cigru ? { cigru_cod_cigru: this.cigru_cod_cigru } : {}),
      cigru_cod_cidiv: this.cigru_cod_cidiv,
      cigru_abr_cigru: this.cigru_abr_cigru,
      cigru_des_cigru: this.cigru_des_cigru,
      ...(this.cigru_fec_creac ? { cigru_fec_creac: this.cigru_fec_creac } : {}),
      cigru_fec_elimi: this.cigru_fec_elimi,
    };
  }
}

/**
 * Value object para Clase
 */
export class ClaseValue implements ClaseEntity {
  cicla_cod_cicla?: number;
  cicla_cod_cigru: number;
  cicla_abr_cicla: string;
  cicla_des_cicla: string;
  cicla_fec_creac?: Date;
  cicla_fec_elimi?: Date | null;

  constructor(data: ClaseEntity, id?: number) {
    this.cicla_cod_cicla = id ?? data.cicla_cod_cicla;
    this.cicla_cod_cigru = data.cicla_cod_cigru;
    this.cicla_abr_cicla = data.cicla_abr_cicla.trim().toUpperCase();
    this.cicla_des_cicla = data.cicla_des_cicla.trim();
    this.cicla_fec_creac = data.cicla_fec_creac;
    this.cicla_fec_elimi = data.cicla_fec_elimi ?? null;
  }

  public toJson(): ClaseEntity {
    return {
      ...(this.cicla_cod_cicla ? { cicla_cod_cicla: this.cicla_cod_cicla } : {}),
      cicla_cod_cigru: this.cicla_cod_cigru,
      cicla_abr_cicla: this.cicla_abr_cicla,
      cicla_des_cicla: this.cicla_des_cicla,
      ...(this.cicla_fec_creac ? { cicla_fec_creac: this.cicla_fec_creac } : {}),
      cicla_fec_elimi: this.cicla_fec_elimi,
    };
  }
}

/**
 * Value object para Subclase
 */
export class SubclaseValue implements SubclaseEntity {
  cisub_cod_cisub?: number;
  cisub_cod_cicla: number;
  cisub_abr_cisub: string;
  cisub_des_cisub: string;
  cisub_fec_creac?: Date;
  cisub_fec_elimi?: Date | null;

  constructor(data: SubclaseEntity, id?: number) {
    this.cisub_cod_cisub = id ?? data.cisub_cod_cisub;
    this.cisub_cod_cicla = data.cisub_cod_cicla;
    this.cisub_abr_cisub = data.cisub_abr_cisub.trim().toUpperCase();
    this.cisub_des_cisub = data.cisub_des_cisub.trim();
    this.cisub_fec_creac = data.cisub_fec_creac;
    this.cisub_fec_elimi = data.cisub_fec_elimi ?? null;
  }

  public toJson(): SubclaseEntity {
    return {
      ...(this.cisub_cod_cisub ? { cisub_cod_cisub: this.cisub_cod_cisub } : {}),
      cisub_cod_cicla: this.cisub_cod_cicla,
      cisub_abr_cisub: this.cisub_abr_cisub,
      cisub_des_cisub: this.cisub_des_cisub,
      ...(this.cisub_fec_creac ? { cisub_fec_creac: this.cisub_fec_creac } : {}),
      cisub_fec_elimi: this.cisub_fec_elimi,
    };
  }
}

/**
 * Value object para Actividad
 */
export class ActividadValue implements ActividadEntity {
  ciact_cod_ciact?: number;
  ciact_cod_cisub: number;
  ciact_cod_semaf?: number;
  ciact_abr_ciact: string;
  ciact_des_ciact: string;
  ciact_fec_creac?: Date;
  ciact_fec_elimi?: Date | null;

  constructor(data: ActividadEntity, id?: number) {
    this.ciact_cod_ciact = id ?? data.ciact_cod_ciact;
    this.ciact_cod_cisub = data.ciact_cod_cisub;
    this.ciact_cod_semaf = data.ciact_cod_semaf ?? 0;
    this.ciact_abr_ciact = data.ciact_abr_ciact.trim().toUpperCase();
    this.ciact_des_ciact = data.ciact_des_ciact.trim();
    this.ciact_fec_creac = data.ciact_fec_creac;
    this.ciact_fec_elimi = data.ciact_fec_elimi ?? null;
  }

  public toJson(): ActividadEntity {
    return {
      ...(this.ciact_cod_ciact ? { ciact_cod_ciact: this.ciact_cod_ciact } : {}),
      ciact_cod_cisub: this.ciact_cod_cisub,
      ciact_cod_semaf: this.ciact_cod_semaf ?? 0,
      ciact_abr_ciact: this.ciact_abr_ciact,
      ciact_des_ciact: this.ciact_des_ciact,
      ...(this.ciact_fec_creac ? { ciact_fec_creac: this.ciact_fec_creac } : {}),
      ciact_fec_elimi: this.ciact_fec_elimi,
    };
  }
}

/**
 * Value object para Actividad Completa (con jerarquía)
 * Normaliza y estructura los datos de la vista vw_ciiu_actividad_completa
 */
export class ActividadCompletaValue {
  readonly ciact_cod_ciact: number;
  readonly ciact_abr_ciact: string;
  readonly ciact_des_ciact: string;
  readonly ciact_cod_semaf: number;
  readonly semaforo: {
    codigo: number;
    descripcion: string;
    icono: string;
    color: string;
  };
  readonly subclase: { codigo: number; abreviatura: string; descripcion: string };
  readonly clase: { codigo: number; abreviatura: string; descripcion: string };
  readonly grupo: { codigo: number; abreviatura: string; descripcion: string };
  readonly division: { codigo: number; abreviatura: string; descripcion: string };
  readonly seccion: { codigo: number; abreviatura: string; descripcion: string };

  constructor(entity: ActividadCompletaEntity) {
    this.ciact_cod_ciact = entity.ciact_cod_ciact;
    this.ciact_abr_ciact = entity.ciact_abr_ciact?.trim().toUpperCase() || '';
    this.ciact_des_ciact = entity.ciact_des_ciact?.trim() || '';
    this.ciact_cod_semaf = entity.ciact_cod_semaf;
    
    this.semaforo = {
      codigo: entity.ciact_cod_semaf,
      descripcion: entity.semaf_des_semaf || '',
      icono: entity.semaf_ico_semaf || '',
      color: entity.semaf_col_semaf || '',
    };
    
    this.subclase = {
      codigo: entity.cisub_cod_cisub,
      abreviatura: entity.cisub_abr_cisub?.trim().toUpperCase() || '',
      descripcion: entity.cisub_des_cisub?.trim() || '',
    };
    
    this.clase = {
      codigo: entity.cicla_cod_cicla,
      abreviatura: entity.cicla_abr_cicla?.trim().toUpperCase() || '',
      descripcion: entity.cicla_des_cicla?.trim() || '',
    };
    
    this.grupo = {
      codigo: entity.cigru_cod_cigru,
      abreviatura: entity.cigru_abr_cigru?.trim().toUpperCase() || '',
      descripcion: entity.cigru_des_cigru?.trim() || '',
    };
    
    this.division = {
      codigo: entity.cidiv_cod_cidiv,
      abreviatura: entity.cidiv_abr_cidiv?.trim().toUpperCase() || '',
      descripcion: entity.cidiv_des_cidiv?.trim() || '',
    };
    
    this.seccion = {
      codigo: entity.cisec_cod_cisec,
      abreviatura: entity.cisec_abr_cisec?.trim().toUpperCase() || '',
      descripcion: entity.cisec_des_cisec?.trim() || '',
    };
  }

  toJson() {
    return {
      codigo: this.ciact_cod_ciact,
      abreviatura: this.ciact_abr_ciact,
      descripcion: this.ciact_des_ciact,
      semaforo: this.semaforo,
      jerarquia: {
        seccion: this.seccion,
        division: this.division,
        grupo: this.grupo,
        clase: this.clase,
        subclase: this.subclase,
      },
    };
  }
}

