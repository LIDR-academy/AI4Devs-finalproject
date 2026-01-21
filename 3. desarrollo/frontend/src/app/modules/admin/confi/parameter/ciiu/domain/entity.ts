/**
 * Entidad de dominio Actividad Completa CIIU
 * Retorna actividad con toda su jerarquía completa (6 niveles)
 */
export interface ActividadCompletaEntity {
  // Actividad (Nivel 6)
  ciact_cod_ciact: number;
  ciact_abr_ciact: string;
  ciact_des_ciact: string;
  ciact_cod_semaf: number;
  semaf_des_semaf: string;
  semaf_ico_semaf: string;
  semaf_col_semaf: string;
  // Subclase (Nivel 5)
  cisub_cod_cisub: number;
  cisub_abr_cisub: string;
  cisub_des_cisub: string;
  // Clase (Nivel 4)
  cicla_cod_cicla: number;
  cicla_abr_cicla: string;
  cicla_des_cicla: string;
  // Grupo (Nivel 3)
  cigru_cod_cigru: number;
  cigru_abr_cigru: string;
  cigru_des_cigru: string;
  // División (Nivel 2)
  cidiv_cod_cidiv: number;
  cidiv_abr_cidiv: string;
  cidiv_des_cidiv: string;
  // Sección (Nivel 1)
  cisec_cod_cisec: number;
  cisec_abr_cisec: string;
  cisec_des_cisec: string;
}

/**
 * Entidad de dominio Árbol CIIU
 * Retorna estructura de árbol para navegación jerárquica
 */
export interface ArbolCiiuEntity {
  nivel: number;
  id: number;
  parent_id: number | null;
  codigo: string;
  descripcion: string;
  tipo: 'seccion' | 'division' | 'grupo' | 'clase' | 'subclase' | 'actividad';
  semaf_cod?: number | null;
  semaf_des?: string | null;
}

/**
 * Value Object para Actividad Completa
 * Estructura los datos de la vista para facilitar el uso en componentes
 */
export interface ActividadValue {
  codigo: number;
  abreviatura: string;
  descripcion: string;
  semaforo: {
    codigo: number;
    descripcion: string;
    icono: string;
    color: string;
  };
  jerarquia: {
    seccion: { codigo: number; abreviatura: string; descripcion: string };
    division: { codigo: number; abreviatura: string; descripcion: string };
    grupo: { codigo: number; abreviatura: string; descripcion: string };
    clase: { codigo: number; abreviatura: string; descripcion: string };
    subclase: { codigo: number; abreviatura: string; descripcion: string };
  };
}

/**
 * Convierte ActividadCompletaEntity a ActividadValue
 */
export function toActividadValue(entity: ActividadCompletaEntity): ActividadValue {
  return {
    codigo: entity.ciact_cod_ciact,
    abreviatura: entity.ciact_abr_ciact,
    descripcion: entity.ciact_des_ciact,
    semaforo: {
      codigo: entity.ciact_cod_semaf,
      descripcion: entity.semaf_des_semaf,
      icono: entity.semaf_ico_semaf,
      color: entity.semaf_col_semaf,
    },
    jerarquia: {
      seccion: {
        codigo: entity.cisec_cod_cisec,
        abreviatura: entity.cisec_abr_cisec,
        descripcion: entity.cisec_des_cisec,
      },
      division: {
        codigo: entity.cidiv_cod_cidiv,
        abreviatura: entity.cidiv_abr_cidiv,
        descripcion: entity.cidiv_des_cidiv,
      },
      grupo: {
        codigo: entity.cigru_cod_cigru,
        abreviatura: entity.cigru_abr_cigru,
        descripcion: entity.cigru_des_cigru,
      },
      clase: {
        codigo: entity.cicla_cod_cicla,
        abreviatura: entity.cicla_abr_cicla,
        descripcion: entity.cicla_des_cicla,
      },
      subclase: {
        codigo: entity.cisub_cod_cisub,
        abreviatura: entity.cisub_abr_cisub,
        descripcion: entity.cisub_des_cisub,
      },
    },
  };
}

/**
 * Obtiene la clase CSS para el semáforo según su código
 */
export function getSemaforoClass(codigo: number | null | undefined): string {
  if (codigo === null || codigo === undefined) return '';
  const classes: Record<number, string> = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-orange-100 text-orange-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-red-200 text-red-900',
  };
  return classes[codigo] || '';
}

