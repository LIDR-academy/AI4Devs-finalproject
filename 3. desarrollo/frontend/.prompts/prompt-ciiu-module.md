# 📋 PROMPT: Módulo CIIU - Catálogo de Actividades Económicas SEPS

**Proyecto**: CORE-NEST (FINANTIX)  
**Microservicio**: MS-CONFI  
**Módulo**: CIIU (Clasificación Industrial Internacional Uniforme)  
**Versión**: 1.0.0  
**Fecha**: 2025-01-28

---

## 🎯 Objetivo

Implementar el módulo de **Catálogo de Actividades Económicas CIIU** dentro de MS-CONFI, siguiendo la arquitectura hexagonal establecida en el proyecto. Este catálogo es requerido por la SEPS (Superintendencia de Economía Popular y Solidaria) y se utiliza en la apertura de cuentas de socios y generación de créditos.

El catálogo CIIU tiene una estructura jerárquica de **6 niveles** basada en la Revisión 4.0:

| Nivel | Nombre | Código Ejemplo | Caracteres | Registros |
|-------|--------|----------------|------------|-----------|
| 1 | Sección | A | 1 | 21 |
| 2 | División | A01 | 3 | 88 |
| 3 | Grupo | A011 | 4 | 237 |
| 4 | Clase | A0111 | 5 | 420 |
| 5 | Subclase | A01111 | 6 | 542 |
| 6 | Actividad | A011112 | 7 | 1,738 |

---

## 📐 Arquitectura

### Patrones a Seguir (OBLIGATORIO)

Seguir exactamente los patrones establecidos en el proyecto:

1. **Arquitectura Hexagonal** con separación clara de capas
2. **PgService** para repositorios con SQL directo (NO TypeORM Repository)
3. **Service Layer** entre controllers/contexts y use cases
4. **Value Objects** para normalización de datos con método `toJson()`
5. **Update DTOs** que extienden Create DTOs
6. **Un solo UseCase** que implementa el Port directamente
7. **Nomenclatura NATS** con nombre del módulo para evitar duplicados
8. **Soft Delete** con campo `{tabla}_fec_elimi`

### Estructura de Carpetas Backend

```
apps/ms-confi/src/modules/ciiu/
├── application/
│   └── ciiu.usecase.ts              # UseCase único implementando CiiuPort
├── domain/
│   ├── entities/
│   │   ├── seccion.entity.ts        # Interface Sección
│   │   ├── division.entity.ts       # Interface División
│   │   ├── grupo.entity.ts          # Interface Grupo
│   │   ├── clase.entity.ts          # Interface Clase
│   │   ├── subclase.entity.ts       # Interface Subclase
│   │   ├── actividad.entity.ts      # Interface Actividad
│   │   └── index.ts
│   ├── ports/
│   │   └── ciiu.port.ts             # Interface del repositorio
│   └── value/
│       ├── seccion.value.ts
│       ├── division.value.ts
│       ├── grupo.value.ts
│       ├── clase.value.ts
│       ├── subclase.value.ts
│       ├── actividad.value.ts
│       └── index.ts
├── infrastructure/
│   ├── dto/
│   │   ├── create-seccion.dto.ts
│   │   ├── update-seccion.dto.ts
│   │   ├── create-division.dto.ts
│   │   ├── update-division.dto.ts
│   │   ├── create-grupo.dto.ts
│   │   ├── update-grupo.dto.ts
│   │   ├── create-clase.dto.ts
│   │   ├── update-clase.dto.ts
│   │   ├── create-subclase.dto.ts
│   │   ├── update-subclase.dto.ts
│   │   ├── create-actividad.dto.ts
│   │   ├── update-actividad.dto.ts
│   │   ├── search-actividad.dto.ts  # DTO para búsqueda/autocomplete
│   │   └── index.ts
│   ├── enum/
│   │   └── enum.ts                 # Constantes (tablas, títulos, métodos NATS)
│   ├── repository/
│   │   └── ciiu.repository.ts       # Implementación con PgService
│   └── service/
│       └── ciiu.service.ts          # Service Layer
├── interface/
│   ├── controller/
│   │   └── ciiu.controller.ts       # REST Controller
│   └── context/
│       └── ciiu.context.ts          # NATS Context (NO "NatsController")
└── ciiu.module.ts
```

---

## 🗄️ Base de Datos

### Convenciones de Nomenclatura

- **Prefijo tablas**: `rrf` + exactamente 5 caracteres
- **Campos**: `{tabla}_{prefijo3}_{campo}`
- **Primary Keys**: `{tabla}_cod_{tabla}` (INTEGER SERIAL)
- **Foreign Keys**: Referencia al PK de la tabla padre
- **Timestamps**: `{tabla}_fec_creac`, `{tabla}_fec_elimi`
- **Soft Delete**: `{tabla}_fec_elimi` (TIMESTAMP nullable)

### Esquema SQL

```sql
-- ============================================================================
-- MÓDULO CIIU - Catálogo de Actividades Económicas SEPS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: rrfsemaf (YA EXISTE - Semáforo de Riesgo Ambiental)
-- -----------------------------------------------------------------------------
-- Esta tabla ya existe en el sistema con la siguiente estructura:
-- semaf_cod_semaf INTEGER PK (0=BAJO, 1=MEDIO, 2=ALTO, 3=EXCLUIDO)
-- semaf_des_semaf VARCHAR(10) - Descripción
-- semaf_ico_semaf VARCHAR(10) - Icono (info, warning)
-- semaf_col_semaf VARCHAR(10) - Color (blue, orange, red)

-- -----------------------------------------------------------------------------
-- Tabla: rrfcisec - Sección CIIU (Nivel 1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfcisec (
    cisec_cod_cisec     SERIAL PRIMARY KEY,
    cisec_abr_cisec     CHAR(1) NOT NULL,           -- Código CIIU: A, B, C...
    cisec_des_cisec     VARCHAR(200) NOT NULL,      -- Descripción completa
    cisec_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cisec_fec_elimi     TIMESTAMP NULL,             -- Soft delete
    
    CONSTRAINT uk_cisec_abr UNIQUE (cisec_abr_cisec)
);

CREATE INDEX idx_cisec_abr ON rrfcisec(cisec_abr_cisec) WHERE cisec_fec_elimi IS NULL;
CREATE INDEX idx_cisec_activo ON rrfcisec(cisec_fec_elimi) WHERE cisec_fec_elimi IS NULL;

COMMENT ON TABLE rrfcisec IS 'Catálogo CIIU Nivel 1 - Secciones';
COMMENT ON COLUMN rrfcisec.cisec_abr_cisec IS 'Código alfabético de sección (A-U)';

-- -----------------------------------------------------------------------------
-- Tabla: rrfcidiv - División CIIU (Nivel 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfcidiv (
    cidiv_cod_cidiv     SERIAL PRIMARY KEY,
    cidiv_cod_cisec     INTEGER NOT NULL,           -- FK a Sección
    cidiv_abr_cidiv     VARCHAR(3) NOT NULL,        -- Código CIIU: A01, A02...
    cidiv_des_cidiv     VARCHAR(200) NOT NULL,      -- Descripción completa
    cidiv_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cidiv_fec_elimi     TIMESTAMP NULL,
    
    CONSTRAINT fk_cidiv_cisec FOREIGN KEY (cidiv_cod_cisec) 
        REFERENCES rrfcisec(cisec_cod_cisec),
    CONSTRAINT uk_cidiv_abr UNIQUE (cidiv_abr_cidiv)
);

CREATE INDEX idx_cidiv_cisec ON rrfcidiv(cidiv_cod_cisec) WHERE cidiv_fec_elimi IS NULL;
CREATE INDEX idx_cidiv_abr ON rrfcidiv(cidiv_abr_cidiv) WHERE cidiv_fec_elimi IS NULL;

COMMENT ON TABLE rrfcidiv IS 'Catálogo CIIU Nivel 2 - Divisiones';

-- -----------------------------------------------------------------------------
-- Tabla: rrfcigru - Grupo CIIU (Nivel 3)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfcigru (
    cigru_cod_cigru     SERIAL PRIMARY KEY,
    cigru_cod_cidiv     INTEGER NOT NULL,           -- FK a División
    cigru_abr_cigru     VARCHAR(4) NOT NULL,        -- Código CIIU: A011, A012...
    cigru_des_cigru     VARCHAR(200) NOT NULL,
    cigru_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cigru_fec_elimi     TIMESTAMP NULL,
    
    CONSTRAINT fk_cigru_cidiv FOREIGN KEY (cigru_cod_cidiv) 
        REFERENCES rrfcidiv(cidiv_cod_cidiv),
    CONSTRAINT uk_cigru_abr UNIQUE (cigru_abr_cigru)
);

CREATE INDEX idx_cigru_cidiv ON rrfcigru(cigru_cod_cidiv) WHERE cigru_fec_elimi IS NULL;
CREATE INDEX idx_cigru_abr ON rrfcigru(cigru_abr_cigru) WHERE cigru_fec_elimi IS NULL;

COMMENT ON TABLE rrfcigru IS 'Catálogo CIIU Nivel 3 - Grupos';

-- -----------------------------------------------------------------------------
-- Tabla: rrfcicla - Clase CIIU (Nivel 4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfcicla (
    cicla_cod_cicla     SERIAL PRIMARY KEY,
    cicla_cod_cigru     INTEGER NOT NULL,           -- FK a Grupo
    cicla_abr_cicla     VARCHAR(5) NOT NULL,        -- Código CIIU: A0111, A0112...
    cicla_des_cicla     VARCHAR(200) NOT NULL,
    cicla_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cicla_fec_elimi     TIMESTAMP NULL,
    
    CONSTRAINT fk_cicla_cigru FOREIGN KEY (cicla_cod_cigru) 
        REFERENCES rrfcigru(cigru_cod_cigru),
    CONSTRAINT uk_cicla_abr UNIQUE (cicla_abr_cicla)
);

CREATE INDEX idx_cicla_cigru ON rrfcicla(cicla_cod_cigru) WHERE cicla_fec_elimi IS NULL;
CREATE INDEX idx_cicla_abr ON rrfcicla(cicla_abr_cicla) WHERE cicla_fec_elimi IS NULL;

COMMENT ON TABLE rrfcicla IS 'Catálogo CIIU Nivel 4 - Clases';

-- -----------------------------------------------------------------------------
-- Tabla: rrfcisub - Subclase CIIU (Nivel 5)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfcisub (
    cisub_cod_cisub     SERIAL PRIMARY KEY,
    cisub_cod_cicla     INTEGER NOT NULL,           -- FK a Clase
    cisub_abr_cisub     VARCHAR(6) NOT NULL,        -- Código CIIU: A01111, A01112...
    cisub_des_cisub     VARCHAR(200) NOT NULL,
    cisub_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cisub_fec_elimi     TIMESTAMP NULL,
    
    CONSTRAINT fk_cisub_cicla FOREIGN KEY (cisub_cod_cicla) 
        REFERENCES rrfcicla(cicla_cod_cicla),
    CONSTRAINT uk_cisub_abr UNIQUE (cisub_abr_cisub)
);

CREATE INDEX idx_cisub_cicla ON rrfcisub(cisub_cod_cicla) WHERE cisub_fec_elimi IS NULL;
CREATE INDEX idx_cisub_abr ON rrfcisub(cisub_abr_cisub) WHERE cisub_fec_elimi IS NULL;

COMMENT ON TABLE rrfcisub IS 'Catálogo CIIU Nivel 5 - Subclases';

-- -----------------------------------------------------------------------------
-- Tabla: rrfciact - Actividad Económica CIIU (Nivel 6)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrfciact (
    ciact_cod_ciact     SERIAL PRIMARY KEY,
    ciact_cod_cisub     INTEGER NOT NULL,           -- FK a Subclase
    ciact_cod_semaf     INTEGER NOT NULL DEFAULT 0, -- FK a Semáforo (riesgo ambiental)
    ciact_abr_ciact     VARCHAR(7) NOT NULL,        -- Código CIIU: A011111, A011112...
    ciact_des_ciact     VARCHAR(500) NOT NULL,      -- Descripción (puede ser larga)
    ciact_fec_creac     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ciact_fec_elimi     TIMESTAMP NULL,
    
    CONSTRAINT fk_ciact_cisub FOREIGN KEY (ciact_cod_cisub) 
        REFERENCES rrfcisub(cisub_cod_cisub),
    CONSTRAINT fk_ciact_semaf FOREIGN KEY (ciact_cod_semaf) 
        REFERENCES rrfsemaf(semaf_cod_semaf),
    CONSTRAINT uk_ciact_abr UNIQUE (ciact_abr_ciact)
);

CREATE INDEX idx_ciact_cisub ON rrfciact(ciact_cod_cisub) WHERE ciact_fec_elimi IS NULL;
CREATE INDEX idx_ciact_semaf ON rrfciact(ciact_cod_semaf) WHERE ciact_fec_elimi IS NULL;
CREATE INDEX idx_ciact_abr ON rrfciact(ciact_abr_ciact) WHERE ciact_fec_elimi IS NULL;
CREATE INDEX idx_ciact_des ON rrfciact USING gin(to_tsvector('spanish', ciact_des_ciact)) 
    WHERE ciact_fec_elimi IS NULL;

COMMENT ON TABLE rrfciact IS 'Catálogo CIIU Nivel 6 - Actividades Económicas';
COMMENT ON COLUMN rrfciact.ciact_cod_semaf IS 'Nivel de riesgo ambiental (0=Bajo, 1=Medio, 2=Alto, 3=Excluido)';

-- -----------------------------------------------------------------------------
-- Vista: vw_ciiu_actividad_completa
-- Retorna actividad con toda su jerarquía para el selector
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_ciiu_actividad_completa AS
SELECT 
    -- Actividad (Nivel 6)
    act.ciact_cod_ciact,
    act.ciact_abr_ciact,
    act.ciact_des_ciact,
    act.ciact_cod_semaf,
    sem.semaf_des_semaf,
    sem.semaf_ico_semaf,
    sem.semaf_col_semaf,
    
    -- Subclase (Nivel 5)
    sub.cisub_cod_cisub,
    sub.cisub_abr_cisub,
    sub.cisub_des_cisub,
    
    -- Clase (Nivel 4)
    cla.cicla_cod_cicla,
    cla.cicla_abr_cicla,
    cla.cicla_des_cicla,
    
    -- Grupo (Nivel 3)
    gru.cigru_cod_cigru,
    gru.cigru_abr_cigru,
    gru.cigru_des_cigru,
    
    -- División (Nivel 2)
    div.cidiv_cod_cidiv,
    div.cidiv_abr_cidiv,
    div.cidiv_des_cidiv,
    
    -- Sección (Nivel 1)
    sec.cisec_cod_cisec,
    sec.cisec_abr_cisec,
    sec.cisec_des_cisec

FROM rrfciact act
INNER JOIN rrfsemaf sem ON sem.semaf_cod_semaf = act.ciact_cod_semaf
INNER JOIN rrfcisub sub ON sub.cisub_cod_cisub = act.ciact_cod_cisub
INNER JOIN rrfcicla cla ON cla.cicla_cod_cicla = sub.cisub_cod_cicla
INNER JOIN rrfcigru gru ON gru.cigru_cod_cigru = cla.cicla_cod_cigru
INNER JOIN rrfcidiv div ON div.cidiv_cod_cidiv = gru.cigru_cod_cidiv
INNER JOIN rrfcisec sec ON sec.cisec_cod_cisec = div.cidiv_cod_cisec
WHERE act.ciact_fec_elimi IS NULL
  AND sub.cisub_fec_elimi IS NULL
  AND cla.cicla_fec_elimi IS NULL
  AND gru.cigru_fec_elimi IS NULL
  AND div.cidiv_fec_elimi IS NULL
  AND sec.cisec_fec_elimi IS NULL;

COMMENT ON VIEW vw_ciiu_actividad_completa IS 'Vista para selector de actividad económica con jerarquía completa';

-- -----------------------------------------------------------------------------
-- Vista: vw_ciiu_arbol
-- Retorna estructura de árbol para navegación jerárquica
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_ciiu_arbol AS
-- Nivel 1: Secciones
SELECT 
    1 as nivel,
    cisec_cod_cisec as id,
    NULL::INTEGER as parent_id,
    cisec_abr_cisec as codigo,
    cisec_des_cisec as descripcion,
    'seccion' as tipo,
    NULL::INTEGER as semaf_cod,
    NULL::VARCHAR as semaf_des
FROM rrfcisec WHERE cisec_fec_elimi IS NULL

UNION ALL

-- Nivel 2: Divisiones
SELECT 
    2 as nivel,
    cidiv_cod_cidiv as id,
    cidiv_cod_cisec as parent_id,
    cidiv_abr_cidiv as codigo,
    cidiv_des_cidiv as descripcion,
    'division' as tipo,
    NULL, NULL
FROM rrfcidiv WHERE cidiv_fec_elimi IS NULL

UNION ALL

-- Nivel 3: Grupos
SELECT 
    3 as nivel,
    cigru_cod_cigru as id,
    cigru_cod_cidiv as parent_id,
    cigru_abr_cigru as codigo,
    cigru_des_cigru as descripcion,
    'grupo' as tipo,
    NULL, NULL
FROM rrfcigru WHERE cigru_fec_elimi IS NULL

UNION ALL

-- Nivel 4: Clases
SELECT 
    4 as nivel,
    cicla_cod_cicla as id,
    cicla_cod_cigru as parent_id,
    cicla_abr_cicla as codigo,
    cicla_des_cicla as descripcion,
    'clase' as tipo,
    NULL, NULL
FROM rrfcicla WHERE cicla_fec_elimi IS NULL

UNION ALL

-- Nivel 5: Subclases
SELECT 
    5 as nivel,
    cisub_cod_cisub as id,
    cisub_cod_cicla as parent_id,
    cisub_abr_cisub as codigo,
    cisub_des_cisub as descripcion,
    'subclase' as tipo,
    NULL, NULL
FROM rrfcisub WHERE cisub_fec_elimi IS NULL

UNION ALL

-- Nivel 6: Actividades
SELECT 
    6 as nivel,
    act.ciact_cod_ciact as id,
    act.ciact_cod_cisub as parent_id,
    act.ciact_abr_ciact as codigo,
    act.ciact_des_ciact as descripcion,
    'actividad' as tipo,
    sem.semaf_cod_semaf,
    sem.semaf_des_semaf
FROM rrfciact act
INNER JOIN rrfsemaf sem ON sem.semaf_cod_semaf = act.ciact_cod_semaf
WHERE act.ciact_fec_elimi IS NULL;

COMMENT ON VIEW vw_ciiu_arbol IS 'Vista para navegación en árbol del catálogo CIIU';
```

---

## 🔧 Backend - Implementación

### Domain Layer

#### Entities (Interfaces TypeScript)

```typescript
// domain/entities/seccion.entity.ts
export interface SeccionEntity {
  cisec_cod_cisec: number;
  cisec_abr_cisec: string;
  cisec_des_cisec: string;
  cisec_fec_creac?: Date;
  cisec_fec_elimi?: Date | null;
}

// domain/entities/actividad.entity.ts
export interface ActividadEntity {
  ciact_cod_ciact: number;
  ciact_cod_cisub: number;
  ciact_cod_semaf: number;
  ciact_abr_ciact: string;
  ciact_des_ciact: string;
  ciact_fec_creac?: Date;
  ciact_fec_elimi?: Date | null;
}

// domain/entities/actividad-completa.entity.ts
// Entidad para el resultado de la vista vw_ciiu_actividad_completa
export interface ActividadCompletaEntity {
  // Actividad
  ciact_cod_ciact: number;
  ciact_abr_ciact: string;
  ciact_des_ciact: string;
  ciact_cod_semaf: number;
  semaf_des_semaf: string;
  semaf_ico_semaf: string;
  semaf_col_semaf: string;
  // Subclase
  cisub_cod_cisub: number;
  cisub_abr_cisub: string;
  cisub_des_cisub: string;
  // Clase
  cicla_cod_cicla: number;
  cicla_abr_cicla: string;
  cicla_des_cicla: string;
  // Grupo
  cigru_cod_cigru: number;
  cigru_abr_cigru: string;
  cigru_des_cigru: string;
  // División
  cidiv_cod_cidiv: number;
  cidiv_abr_cidiv: string;
  cidiv_des_cidiv: string;
  // Sección
  cisec_cod_cisec: number;
  cisec_abr_cisec: string;
  cisec_des_cisec: string;
}

// domain/entities/arbol-ciiu.entity.ts
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
```

#### Port (Interface del Repositorio)

```typescript
// domain/ports/ciiu.port.ts
import { 
  SeccionEntity, DivisionEntity, GrupoEntity, 
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity 
} from '../entities';

export interface CiiuPort {
  // ==================== SECCIÓN (Nivel 1) ====================
  createSeccion(data: Partial<SeccionEntity>): Promise<SeccionEntity>;
  findAllSecciones(): Promise<SeccionEntity[]>;
  findSeccionById(id: number): Promise<SeccionEntity | null>;
  findSeccionByAbr(abr: string): Promise<SeccionEntity | null>;
  updateSeccion(id: number, data: Partial<SeccionEntity>): Promise<SeccionEntity>;
  deleteSeccion(id: number): Promise<void>;

  // ==================== DIVISIÓN (Nivel 2) ====================
  createDivision(data: Partial<DivisionEntity>): Promise<DivisionEntity>;
  findAllDivisiones(): Promise<DivisionEntity[]>;
  findDivisionesBySeccion(cisecId: number): Promise<DivisionEntity[]>;
  findDivisionById(id: number): Promise<DivisionEntity | null>;
  updateDivision(id: number, data: Partial<DivisionEntity>): Promise<DivisionEntity>;
  deleteDivision(id: number): Promise<void>;

  // ==================== GRUPO (Nivel 3) ====================
  createGrupo(data: Partial<GrupoEntity>): Promise<GrupoEntity>;
  findAllGrupos(): Promise<GrupoEntity[]>;
  findGruposByDivision(cidivId: number): Promise<GrupoEntity[]>;
  findGrupoById(id: number): Promise<GrupoEntity | null>;
  updateGrupo(id: number, data: Partial<GrupoEntity>): Promise<GrupoEntity>;
  deleteGrupo(id: number): Promise<void>;

  // ==================== CLASE (Nivel 4) ====================
  createClase(data: Partial<ClaseEntity>): Promise<ClaseEntity>;
  findAllClases(): Promise<ClaseEntity[]>;
  findClasesByGrupo(cigruId: number): Promise<ClaseEntity[]>;
  findClaseById(id: number): Promise<ClaseEntity | null>;
  updateClase(id: number, data: Partial<ClaseEntity>): Promise<ClaseEntity>;
  deleteClase(id: number): Promise<void>;

  // ==================== SUBCLASE (Nivel 5) ====================
  createSubclase(data: Partial<SubclaseEntity>): Promise<SubclaseEntity>;
  findAllSubclases(): Promise<SubclaseEntity[]>;
  findSubclasesByClase(ciclaId: number): Promise<SubclaseEntity[]>;
  findSubclaseById(id: number): Promise<SubclaseEntity | null>;
  updateSubclase(id: number, data: Partial<SubclaseEntity>): Promise<SubclaseEntity>;
  deleteSubclase(id: number): Promise<void>;

  // ==================== ACTIVIDAD (Nivel 6) ====================
  createActividad(data: Partial<ActividadEntity>): Promise<ActividadEntity>;
  findAllActividades(): Promise<ActividadEntity[]>;
  findActividadesBySubclase(cisubId: number): Promise<ActividadEntity[]>;
  findActividadById(id: number): Promise<ActividadEntity | null>;
  updateActividad(id: number, data: Partial<ActividadEntity>): Promise<ActividadEntity>;
  deleteActividad(id: number): Promise<void>;

  // ==================== BÚSQUEDA Y SELECTOR ====================
  /**
   * Busca actividades por descripción (autocomplete)
   * Retorna máximo 20 resultados ordenados por relevancia
   */
  searchActividades(query: string, limit?: number): Promise<ActividadCompletaEntity[]>;
  
  /**
   * Obtiene una actividad con toda su jerarquía completa
   * Para mostrar los 6 niveles al seleccionar
   */
  findActividadCompleta(ciactId: number): Promise<ActividadCompletaEntity | null>;
  
  /**
   * Obtiene una actividad completa por su código abreviado
   */
  findActividadCompletaByAbr(abr: string): Promise<ActividadCompletaEntity | null>;

  // ==================== ÁRBOL JERÁRQUICO ====================
  /**
   * Obtiene el árbol completo para navegación
   */
  findArbolCompleto(): Promise<ArbolCiiuEntity[]>;
  
  /**
   * Obtiene hijos de un nodo específico
   */
  findHijosByNivel(nivel: number, parentId: number): Promise<ArbolCiiuEntity[]>;
}

export const CIIU_PORT = Symbol('CIIU_PORT');
```

#### Value Objects

```typescript
// domain/value/actividad.value.ts
import { ActividadCompletaEntity } from '../entities';

export class ActividadValue {
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
    this.ciact_abr_ciact = entity.ciact_abr_ciact?.trim().toUpperCase();
    this.ciact_des_ciact = entity.ciact_des_ciact?.trim();
    this.ciact_cod_semaf = entity.ciact_cod_semaf;
    
    this.semaforo = {
      codigo: entity.ciact_cod_semaf,
      descripcion: entity.semaf_des_semaf,
      icono: entity.semaf_ico_semaf,
      color: entity.semaf_col_semaf,
    };
    
    this.subclase = {
      codigo: entity.cisub_cod_cisub,
      abreviatura: entity.cisub_abr_cisub?.trim().toUpperCase(),
      descripcion: entity.cisub_des_cisub?.trim(),
    };
    
    this.clase = {
      codigo: entity.cicla_cod_cicla,
      abreviatura: entity.cicla_abr_cicla?.trim().toUpperCase(),
      descripcion: entity.cicla_des_cicla?.trim(),
    };
    
    this.grupo = {
      codigo: entity.cigru_cod_cigru,
      abreviatura: entity.cigru_abr_cigru?.trim().toUpperCase(),
      descripcion: entity.cigru_des_cigru?.trim(),
    };
    
    this.division = {
      codigo: entity.cidiv_cod_cidiv,
      abreviatura: entity.cidiv_abr_cidiv?.trim().toUpperCase(),
      descripcion: entity.cidiv_des_cidiv?.trim(),
    };
    
    this.seccion = {
      codigo: entity.cisec_cod_cisec,
      abreviatura: entity.cisec_abr_cisec?.trim().toUpperCase(),
      descripcion: entity.cisec_des_cisec?.trim(),
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
```

### Infrastructure Layer

#### Enum (Constantes del Módulo)

```typescript
// infrastructure/enum/enum.ts
export const CiiuEnum = {
  // Tablas
  table: {
    cisec: "rrfcisec",
    cidiv: "rrfcidiv",
    cigru: "rrfcigru",
    cicla: "rrfcicla",
    cisub: "rrfcisub",
    ciact: "rrfciact",
  },
  // Títulos
  title: {
    cisec: "Sección",
    cidiv: "División",
    cigru: "Grupo",
    cicla: "Clase",
    cisub: "Subclase",
    ciact: "Actividad",
  },
  // Servicio NATS
  msService: "msCiiu",
  
  // ==================== SECCIONES (Nivel 1) ====================
  smFindAllSecciones: "findAllSecciones",
  smFindSeccionById: "findSeccionById",
  smFindSeccionByAbr: "findSeccionByAbr",
  smCreateSeccion: "createSeccion",
  smUpdateSeccion: "updateSeccion",
  smDeleteSeccion: "deleteSeccion",
  
  // ==================== DIVISIONES (Nivel 2) ====================
  smFindAllDivisiones: "findAllDivisiones",
  smFindDivisionesBySeccion: "findDivisionesBySeccion",
  smFindDivisionById: "findDivisionById",
  smCreateDivision: "createDivision",
  smUpdateDivision: "updateDivision",
  smDeleteDivision: "deleteDivision",
  
  // ==================== GRUPOS (Nivel 3) ====================
  smFindAllGrupos: "findAllGrupos",
  smFindGruposByDivision: "findGruposByDivision",
  smFindGrupoById: "findGrupoById",
  smCreateGrupo: "createGrupo",
  smUpdateGrupo: "updateGrupo",
  smDeleteGrupo: "deleteGrupo",
  
  // ==================== CLASES (Nivel 4) ====================
  smFindAllClases: "findAllClases",
  smFindClasesByGrupo: "findClasesByGrupo",
  smFindClaseById: "findClaseById",
  smCreateClase: "createClase",
  smUpdateClase: "updateClase",
  smDeleteClase: "deleteClase",
  
  // ==================== SUBCLASES (Nivel 5) ====================
  smFindAllSubclases: "findAllSubclases",
  smFindSubclasesByClase: "findSubclasesByClase",
  smFindSubclaseById: "findSubclaseById",
  smCreateSubclase: "createSubclase",
  smUpdateSubclase: "updateSubclase",
  smDeleteSubclase: "deleteSubclase",
  
  // ==================== ACTIVIDADES (Nivel 6) ====================
  smFindAllActividades: "findAllActividades",
  smFindActividadesBySubclase: "findActividadesBySubclase",
  smFindActividadById: "findActividadById",
  smCreateActividad: "createActividad",
  smUpdateActividad: "updateActividad",
  smDeleteActividad: "deleteActividad",
  
  // ==================== BÚSQUEDA Y SELECTOR ====================
  smSearchActividades: "searchActividades",
  smFindActividadCompleta: "findActividadCompleta",
  smFindActividadCompletaByAbr: "findActividadCompletaByAbr",
  
  // ==================== ÁRBOL JERÁRQUICO ====================
  smFindArbolCompleto: "findArbolCompleto",
  smFindHijosByNivel: "findHijosByNivel",
}
```

**📝 Notas sobre nomenclatura NATS:**
- Los métodos NATS usan nombres de entidad directamente (sin prefijo `ciiu.*`)
- Siguen el patrón: `{acción}{Entidad}` (ej: `findAllSecciones`, `createActividad`)
- Los métodos personalizados usan nombres descriptivos (ej: `searchActividades`, `findActividadCompleta`)
- Todos los valores son únicos en el proyecto para evitar duplicados

#### DTOs

```typescript
// infrastructure/dto/search-actividad.dto.ts
import { IsString, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class SearchActividadDto {
  @IsString()
  @MinLength(3, { message: 'La búsqueda debe tener al menos 3 caracteres' })
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

// infrastructure/dto/create-actividad.dto.ts
import { IsString, IsInt, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateActividadDto {
  @IsInt()
  @Min(1)
  ciact_cod_cisub: number;

  @IsInt()
  @Min(0)
  ciact_cod_semaf: number = 0;

  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  ciact_abr_ciact: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  ciact_des_ciact: string;
}

// infrastructure/dto/update-actividad.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadDto } from './create-actividad.dto';

export class UpdateActividadDto extends PartialType(CreateActividadDto) {}
```

#### Repository (PgService con SQL directo)

```typescript
// infrastructure/repository/ciiu.repository.ts
import { Injectable } from '@nestjs/common';
import { PgService } from '@app/common/database/pg.service';
import { CiiuPort } from '../../domain/ports/ciiu.port';
import { ActividadCompletaEntity, ArbolCiiuEntity } from '../../domain/entities';

@Injectable()
export class CiiuRepository implements CiiuPort {
  constructor(private readonly pg: PgService) {}

  // ==================== BÚSQUEDA PRINCIPAL (AUTOCOMPLETE) ====================
  async searchActividades(query: string, limit: number = 20): Promise<ActividadCompletaEntity[]> {
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
    
    return this.pg.query<ActividadCompletaEntity>(sql, params);
  }

  async findActividadCompleta(ciactId: number): Promise<ActividadCompletaEntity | null> {
    const sql = `SELECT * FROM vw_ciiu_actividad_completa WHERE ciact_cod_ciact = $1`;
    const result = await this.pg.query<ActividadCompletaEntity>(sql, [ciactId]);
    return result[0] || null;
  }

  async findActividadCompletaByAbr(abr: string): Promise<ActividadCompletaEntity | null> {
    const sql = `SELECT * FROM vw_ciiu_actividad_completa WHERE ciact_abr_ciact = $1`;
    const result = await this.pg.query<ActividadCompletaEntity>(sql, [abr.toUpperCase()]);
    return result[0] || null;
  }

  // ==================== ÁRBOL ====================
  async findArbolCompleto(): Promise<ArbolCiiuEntity[]> {
    const sql = `SELECT * FROM vw_ciiu_arbol ORDER BY nivel, codigo`;
    return this.pg.query<ArbolCiiuEntity>(sql);
  }

  async findHijosByNivel(nivel: number, parentId: number): Promise<ArbolCiiuEntity[]> {
    const sql = `
      SELECT * FROM vw_ciiu_arbol 
      WHERE nivel = $1 AND parent_id = $2
      ORDER BY codigo
    `;
    return this.pg.query<ArbolCiiuEntity>(sql, [nivel, parentId]);
  }

  // ... implementar resto de métodos CRUD para cada nivel
  // Seguir el patrón de otros módulos como GEO
}
```

#### Service Layer (Orquestación)

```typescript
// infrastructure/service/ciiu.service.ts
import { Injectable } from "@nestjs/common";
import { CiiuEnum } from "../enum/enum";
import { CiiuUseCase } from "../../application/usecase";
import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from "../../domain/entities";
import { ApiResponse, ApiResponses, ResponseUtil } from "src/shared/util";
import { CiiuRepository } from "../repository/repository";
import {
  CreateSeccionRequestDto, UpdateSeccionRequestDto,
  CreateDivisionRequestDto, UpdateDivisionRequestDto,
  CreateGrupoRequestDto, UpdateGrupoRequestDto,
  CreateClaseRequestDto, UpdateClaseRequestDto,
  CreateSubclaseRequestDto, UpdateSubclaseRequestDto,
  CreateActividadRequestDto, UpdateActividadRequestDto,
  SearchActividadDto
} from "../dto";

@Injectable()
export class CiiuService {
  public usecase: CiiuUseCase;

  constructor(private readonly repository: CiiuRepository) {
    this.usecase = new CiiuUseCase(this.repository);
  }

  // ==================== SECCIONES ====================
  
  async findAllSecciones(active?: boolean): Promise<ApiResponses<SeccionEntity>> {
    const listed = await this.usecase.findAllSecciones(active);
    return ResponseUtil.responses(
      listed,
      listed.length,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      `Se encontraron ${listed.length} secciones`
    );
  }

  async findSeccionById(id: number): Promise<ApiResponse<SeccionEntity>> {
    const found = await this.usecase.findSeccionById(id);
    return ResponseUtil.response(
      found,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      found ? "Sección encontrada" : "Sección no encontrada"
    );
  }

  async findSeccionByAbr(abr: string): Promise<ApiResponse<SeccionEntity>> {
    const found = await this.usecase.findSeccionByAbr(abr);
    return ResponseUtil.response(
      found,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      found ? "Sección encontrada" : "Sección no encontrada"
    );
  }

  async createSeccion(data: CreateSeccionRequestDto): Promise<ApiResponse<SeccionEntity>> {
    const created = await this.usecase.createSeccion(data);
    return ResponseUtil.response(
      created,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      "Sección creada exitosamente"
    );
  }

  async updateSeccion(id: number, data: UpdateSeccionRequestDto): Promise<ApiResponse<SeccionEntity>> {
    const updated = await this.usecase.updateSeccion(id, data);
    return ResponseUtil.response(
      updated,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      "Sección actualizada exitosamente"
    );
  }

  async deleteSeccion(id: number): Promise<ApiResponse<SeccionEntity>> {
    const deleted = await this.usecase.deleteSeccion(id);
    return ResponseUtil.response(
      deleted,
      { table: CiiuEnum.table.cisec, title: CiiuEnum.title.cisec },
      "Sección eliminada exitosamente"
    );
  }

  // ==================== ACTIVIDADES - BÚSQUEDA ====================
  
  async searchActividades(query: string, limit?: number): Promise<ApiResponses<ActividadCompletaEntity>> {
    const results = await this.usecase.searchActividades(query, limit);
    return ResponseUtil.responses(
      results,
      results.length,
      { table: CiiuEnum.table.ciact, title: CiiuEnum.title.ciact },
      `Se encontraron ${results.length} actividades`
    );
  }

  async findActividadCompleta(id: number): Promise<ApiResponse<ActividadCompletaEntity>> {
    const found = await this.usecase.findActividadCompleta(id);
    return ResponseUtil.response(
      found,
      { table: CiiuEnum.table.ciact, title: CiiuEnum.title.ciact },
      found ? "Actividad encontrada" : "Actividad no encontrada"
    );
  }

  async findActividadCompletaByAbr(abr: string): Promise<ApiResponse<ActividadCompletaEntity>> {
    const found = await this.usecase.findActividadCompletaByAbr(abr);
    return ResponseUtil.response(
      found,
      { table: CiiuEnum.table.ciact, title: CiiuEnum.title.ciact },
      found ? "Actividad encontrada" : "Actividad no encontrada"
    );
  }

  // ==================== ÁRBOL ====================
  
  async findArbolCompleto(): Promise<ApiResponses<ArbolCiiuEntity>> {
    const arbol = await this.usecase.findArbolCompleto();
    return ResponseUtil.responses(
      arbol,
      arbol.length,
      { table: "vw_ciiu_arbol", title: "Árbol CIIU" },
      `Árbol con ${arbol.length} nodos`
    );
  }

  async findHijosByNivel(nivel: number, parentId: number): Promise<ApiResponses<ArbolCiiuEntity>> {
    const hijos = await this.usecase.findHijosByNivel(nivel, parentId);
    return ResponseUtil.responses(
      hijos,
      hijos.length,
      { table: "vw_ciiu_arbol", title: "Hijos CIIU" },
      `Se encontraron ${hijos.length} hijos`
    );
  }

  // ... resto de métodos para Divisiones, Grupos, Clases, Subclases y Actividades
  // Seguir el mismo patrón
}
```

**📝 Reglas para service.ts:**
- **Instancia manual**: Crear instancia del UseCase en el constructor
- **Formato de respuestas**: Transformar a `ApiResponse`/`ApiResponses` usando `ResponseUtil`
- **Mensajes informativos**: Incluir mensajes descriptivos en español
- **Orquestación**: El Service Layer orquesta entre controllers/contexts y use cases

### Interface Layer

#### REST Controller

```typescript
// interface/controller/ciiu.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { CiiuService } from '../../infrastructure/service/ciiu.service';
import { SearchActividadDto, CreateActividadDto, UpdateActividadDto } from '../../infrastructure/dto';

@Controller('ciiu')
export class CiiuController {
  constructor(private readonly ciiuService: CiiuService) {}

  // ==================== BÚSQUEDA / SELECTOR ====================
  
  /**
   * GET /ciiu/actividades/search?query=maiz&limit=20
   * Búsqueda de actividades para autocomplete
   * Retorna actividades con jerarquía completa
   */
  @Get('actividades/search')
  async searchActividades(@Query() dto: SearchActividadDto) {
    return this.ciiuService.searchActividades(dto.query, dto.limit);
  }

  /**
   * GET /ciiu/actividades/:id/completa
   * Obtiene actividad con jerarquía completa
   */
  @Get('actividades/:id/completa')
  async findActividadCompleta(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.findActividadCompleta(id);
  }

  /**
   * GET /ciiu/actividades/codigo/:codigo
   * Obtiene actividad por código CIIU
   */
  @Get('actividades/codigo/:codigo')
  async findActividadByAbr(@Param('codigo') codigo: string) {
    return this.ciiuService.findActividadCompletaByAbr(codigo);
  }

  // ==================== ÁRBOL ====================
  
  /**
   * GET /ciiu/arbol
   * Retorna estructura de árbol completa
   */
  @Get('arbol')
  async findArbol() {
    return this.ciiuService.findArbolCompleto();
  }

  /**
   * GET /ciiu/arbol/:nivel/:parentId/hijos
   * Retorna hijos de un nodo específico
   */
  @Get('arbol/:nivel/:parentId/hijos')
  async findHijos(
    @Param('nivel', ParseIntPipe) nivel: number,
    @Param('parentId', ParseIntPipe) parentId: number,
  ) {
    return this.ciiuService.findHijosByNivel(nivel, parentId);
  }

  // ==================== CRUD SECCIONES (Nivel 1) ====================
  @Get('secciones')
  async findAllSecciones() {
    return this.ciiuService.findAllSecciones();
  }

  @Get('secciones/:id')
  async findSeccionById(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.findSeccionById(id);
  }

  // ... resto de endpoints CRUD para cada nivel
  // Seguir el patrón establecido
}
```

#### NATS Context

```typescript
// interface/context/ciiu.context.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { CiiuEnum } from '../../infrastructure/enum/enum';
import { CiiuService } from '../../infrastructure/service/ciiu.service';
import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from '../../domain/entities';
import {
  CreateSeccionRequestDto, UpdateSeccionRequestDto,
  CreateDivisionRequestDto, UpdateDivisionRequestDto,
  CreateGrupoRequestDto, UpdateGrupoRequestDto,
  CreateClaseRequestDto, UpdateClaseRequestDto,
  CreateSubclaseRequestDto, UpdateSubclaseRequestDto,
  CreateActividadRequestDto, UpdateActividadRequestDto,
  SearchActividadDto
} from '../../infrastructure/dto';

@Controller(CiiuEnum.table.cisec)  // Usa el nombre de tabla del enum
export class CiiuContext {
  constructor(private readonly ciiuService: CiiuService) {}

  // ==================== SECCIONES (Nivel 1) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllSecciones })
  public async findAllSecciones(@Payload() payload: { active?: boolean }): Promise<ApiResponses<SeccionEntity>> {
    return await this.ciiuService.findAllSecciones(payload?.active);
  }

  @MessagePattern({ sm: CiiuEnum.smFindSeccionById })
  public async findSeccionById(@Payload('id') id: number): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.findSeccionById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smFindSeccionByAbr })
  public async findSeccionByAbr(@Payload() data: { abr: string }): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.findSeccionByAbr(data.abr);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateSeccion })
  public async createSeccion(@Payload() data: CreateSeccionRequestDto): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.createSeccion(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateSeccion })
  public async updateSeccion(@Payload() payload: { id: number; data: UpdateSeccionRequestDto }): Promise<ApiResponse<SeccionEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateSeccion(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteSeccion })
  public async deleteSeccion(@Payload('id') id: number): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.deleteSeccion(+id);
  }

  // ==================== DIVISIONES (Nivel 2) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllDivisiones })
  public async findAllDivisiones(@Payload() payload: { active?: boolean }): Promise<ApiResponses<DivisionEntity>> {
    return await this.ciiuService.findAllDivisiones(payload?.active);
  }

  @MessagePattern({ sm: CiiuEnum.smFindDivisionesBySeccion })
  public async findDivisionesBySeccion(@Payload() payload: { cisecId: number; active?: boolean }): Promise<ApiResponses<DivisionEntity>> {
    return await this.ciiuService.findDivisionesBySeccion(payload.cisecId, payload?.active);
  }

  @MessagePattern({ sm: CiiuEnum.smFindDivisionById })
  public async findDivisionById(@Payload('id') id: number): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.findDivisionById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateDivision })
  public async createDivision(@Payload() data: CreateDivisionRequestDto): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.createDivision(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateDivision })
  public async updateDivision(@Payload() payload: { id: number; data: UpdateDivisionRequestDto }): Promise<ApiResponse<DivisionEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateDivision(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteDivision })
  public async deleteDivision(@Payload('id') id: number): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.deleteDivision(+id);
  }

  // ==================== ACTIVIDADES - BÚSQUEDA ====================
  
  @MessagePattern({ sm: CiiuEnum.smSearchActividades })
  public async searchActividades(@Payload() data: SearchActividadDto): Promise<ApiResponses<ActividadCompletaEntity>> {
    return await this.ciiuService.searchActividades(data.query, data.limit);
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadCompleta })
  public async findActividadCompleta(@Payload() data: { id: number }): Promise<ApiResponse<ActividadCompletaEntity>> {
    return await this.ciiuService.findActividadCompleta(data.id);
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadCompletaByAbr })
  public async findActividadCompletaByAbr(@Payload() data: { abr: string }): Promise<ApiResponse<ActividadCompletaEntity>> {
    return await this.ciiuService.findActividadCompletaByAbr(data.abr);
  }

  // ==================== ÁRBOL ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindArbolCompleto })
  public async findArbolCompleto(): Promise<ApiResponses<ArbolCiiuEntity>> {
    return await this.ciiuService.findArbolCompleto();
  }

  @MessagePattern({ sm: CiiuEnum.smFindHijosByNivel })
  public async findHijosByNivel(@Payload() data: { nivel: number; parentId: number }): Promise<ApiResponses<ArbolCiiuEntity>> {
    return await this.ciiuService.findHijosByNivel(data.nivel, data.parentId);
  }

  // ... resto de métodos NATS para Grupos, Clases, Subclases y Actividades
  // Seguir el mismo patrón usando CiiuEnum.sm{Method}
}
```

**📝 Notas importantes:**
- Usar `@MessagePattern({ sm: CiiuEnum.smMethod })` con el patrón `{ sm: "método" }`
- El Controller usa `@Controller(CiiuEnum.table.cisec)` (nombre de tabla del enum)
- Los métodos NATS usan nombres de entidad directamente (sin prefijo `ciiu.*`)
- Todos los métodos retornan `ApiResponse` o `ApiResponses` según corresponda

---

## 🎨 Frontend - Angular 19

### Estructura de Carpetas

```
libs/modules/admin/confi/ciiu/
├── application/
│   └── ciiu.usecase.ts
├── domain/
│   ├── entities/
│   │   ├── actividad-completa.entity.ts
│   │   ├── arbol-ciiu.entity.ts
│   │   └── index.ts
│   ├── ports/
│   │   └── ciiu.port.ts
│   └── value/
│       └── actividad.value.ts
├── infrastructure/
│   ├── controller/
│   │   └── ciiu.controller.ts          # HTTP Service
│   ├── repository/
│   │   └── ciiu.repository.ts
│   └── enum/
│       └── ciiu-nivel.enum.ts
├── interface/
│   └── view/
│       ├── ciiu-admin/                  # Módulo de administración
│       │   ├── ciiu-admin.component.ts
│       │   ├── ciiu-admin.component.html
│       │   └── components/
│       │       ├── ciiu-tree/           # Vista de árbol
│       │       ├── ciiu-list/           # Listado con filtros
│       │       └── ciiu-detail/         # Detalle con edición
│       └── ciiu-selector/               # Componente reutilizable
│           ├── ciiu-selector.component.ts
│           ├── ciiu-selector.component.html
│           └── ciiu-selector.component.scss
└── ciiu.routes.ts
```

### Componente Selector Reutilizable

Este componente implementa `ControlValueAccessor` para integrarse con formularios reactivos.

```typescript
// interface/view/ciiu-selector/ciiu-selector.component.ts
import { 
  Component, Input, forwardRef, signal, computed, 
  OnInit, inject, DestroyRef 
} from '@angular/core';
import { 
  ControlValueAccessor, NG_VALUE_ACCESSOR, 
  ReactiveFormsModule, FormControl 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CiiuController } from '../../infrastructure/controller/ciiu.controller';
import { ActividadCompletaEntity } from '../../domain/entities';
import { ActividadValue } from '../../domain/value/actividad.value';

@Component({
  selector: 'app-ciiu-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CiiuSelectorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ciiu-selector">
      <!-- Campo de búsqueda -->
      <mat-form-field class="w-full" [appearance]="appearance">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [formControl]="searchControl"
          [matAutocomplete]="auto"
          [placeholder]="placeholder"
          (focus)="onFocus()"
        />
        <mat-icon matSuffix>search</mat-icon>
        @if (loading()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
        <mat-autocomplete
          #auto="matAutocomplete"
          [displayWith]="displayFn"
          (optionSelected)="onOptionSelected($event)"
        >
          @for (option of options(); track option.ciact_cod_ciact) {
            <mat-option [value]="option">
              <div class="flex flex-col">
                <span class="font-medium">{{ option.ciact_abr_ciact }} - {{ option.ciact_des_ciact }}</span>
                <span class="text-xs text-gray-500">
                  {{ option.cisec_abr_cisec }} > {{ option.cidiv_abr_cidiv }} > {{ option.cigru_abr_cigru }}
                </span>
              </div>
            </mat-option>
          }
          @if (options().length === 0 && searchControl.value?.length >= 3 && !loading()) {
            <mat-option disabled>No se encontraron resultados</mat-option>
          }
        </mat-autocomplete>
        @if (errorMessage()) {
          <mat-error>{{ errorMessage() }}</mat-error>
        }
      </mat-form-field>

      <!-- Jerarquía seleccionada -->
      @if (selectedActividad() && showHierarchy) {
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-semibold mb-3 text-gray-700">Jerarquía CIIU</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- Sección -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">Sección (Nivel 1)</span>
              <span class="text-sm font-medium">
                {{ selectedActividad().seccion.abreviatura }} - 
                {{ selectedActividad().seccion.descripcion | slice:0:50 }}...
              </span>
            </div>
            <!-- División -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">División (Nivel 2)</span>
              <span class="text-sm font-medium">
                {{ selectedActividad().division.abreviatura }} - 
                {{ selectedActividad().division.descripcion | slice:0:50 }}...
              </span>
            </div>
            <!-- Grupo -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">Grupo (Nivel 3)</span>
              <span class="text-sm font-medium">
                {{ selectedActividad().grupo.abreviatura }} - 
                {{ selectedActividad().grupo.descripcion | slice:0:50 }}...
              </span>
            </div>
            <!-- Clase -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">Clase (Nivel 4)</span>
              <span class="text-sm font-medium">
                {{ selectedActividad().clase.abreviatura }} - 
                {{ selectedActividad().clase.descripcion | slice:0:50 }}...
              </span>
            </div>
            <!-- Subclase -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">Subclase (Nivel 5)</span>
              <span class="text-sm font-medium">
                {{ selectedActividad().subclase.abreviatura }} - 
                {{ selectedActividad().subclase.descripcion | slice:0:50 }}...
              </span>
            </div>
            <!-- Actividad + Semáforo -->
            <div class="ciiu-level">
              <span class="text-xs text-gray-500">Actividad (Nivel 6)</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">
                  {{ selectedActividad().abreviatura }}
                </span>
                <span 
                  class="px-2 py-0.5 text-xs rounded-full"
                  [ngClass]="{
                    'bg-blue-100 text-blue-800': selectedActividad().semaforo.color === 'blue',
                    'bg-orange-100 text-orange-800': selectedActividad().semaforo.color === 'orange',
                    'bg-red-100 text-red-800': selectedActividad().semaforo.color === 'red'
                  }"
                >
                  {{ selectedActividad().semaforo.descripcion }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .ciiu-level {
      @apply flex flex-col p-2 bg-white rounded border border-gray-200;
    }
  `]
})
export class CiiuSelectorComponent implements ControlValueAccessor, OnInit {
  // Inputs
  @Input() label = 'Actividad Económica';
  @Input() placeholder = 'Buscar por descripción o código...';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() showHierarchy = true;
  @Input() required = false;

  // Services
  private readonly ciiuController = inject(CiiuController);
  private readonly destroyRef = inject(DestroyRef);

  // State
  searchControl = new FormControl('');
  loading = signal(false);
  options = signal<ActividadCompletaEntity[]>([]);
  selectedActividad = signal<ActividadValue | null>(null);
  errorMessage = signal<string>('');

  // ControlValueAccessor
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;

  ngOnInit(): void {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(value => typeof value === 'string'),
      tap(() => this.loading.set(true)),
      switchMap(query => {
        if (!query || query.length < 3) {
          return of([]);
        }
        return this.ciiuController.searchActividades(query);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (results) => {
        this.options.set(results);
        this.loading.set(false);
      },
      error: () => {
        this.options.set([]);
        this.loading.set(false);
        this.errorMessage.set('Error al buscar actividades');
      }
    });
  }

  displayFn(option: ActividadCompletaEntity): string {
    return option ? `${option.ciact_abr_ciact} - ${option.ciact_des_ciact}` : '';
  }

  onOptionSelected(event: any): void {
    const entity: ActividadCompletaEntity = event.option.value;
    const value = new ActividadValue(entity);
    this.selectedActividad.set(value);
    this.onChange(entity.ciact_cod_ciact);
    this.onTouched();
  }

  onFocus(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    if (value) {
      // Cargar actividad por ID
      this.ciiuController.findActividadCompleta(value).subscribe({
        next: (entity) => {
          if (entity) {
            const actValue = new ActividadValue(entity);
            this.selectedActividad.set(actValue);
            this.searchControl.setValue(entity as any, { emitEvent: false });
          }
        }
      });
    } else {
      this.selectedActividad.set(null);
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }

  // Método público para obtener el valor seleccionado
  getSelectedValue(): ActividadValue | null {
    return this.selectedActividad();
  }

  // Método público para limpiar la selección
  clear(): void {
    this.selectedActividad.set(null);
    this.searchControl.setValue('');
    this.onChange(null);
  }
}
```

### Uso del Selector en otros módulos

```typescript
// Ejemplo de uso en apertura de cuentas o créditos
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CiiuSelectorComponent } from '@modules/admin/confi/ciiu';

@Component({
  selector: 'app-apertura-cuenta',
  standalone: true,
  imports: [ReactiveFormsModule, CiiuSelectorComponent],
  template: `
    <form [formGroup]="form">
      <!-- Otros campos del formulario -->
      
      <app-ciiu-selector
        formControlName="actividadEconomica"
        label="Actividad Económica del Socio"
        [showHierarchy]="true"
        [required]="true"
      />
      
      <!-- El valor del form control será el ID de la actividad (ciact_cod_ciact) -->
    </form>
  `
})
export class AperturaCuentaComponent {
  form = inject(FormBuilder).group({
    // otros campos...
    actividadEconomica: [null, Validators.required],
  });
}
```

### Módulo de Administración

```typescript
// interface/view/ciiu-admin/ciiu-admin.component.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule, FlatTreeControl } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CiiuController } from '../../infrastructure/controller/ciiu.controller';
import { ArbolCiiuEntity } from '../../domain/entities';

@Component({
  selector: 'app-ciiu-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Catálogo CIIU - Actividades Económicas</h1>
      </div>

      <mat-tab-group>
        <!-- Tab: Vista de Árbol -->
        <mat-tab label="Árbol Jerárquico">
          <div class="p-4">
            <mat-tree [dataSource]="treeDataSource" [treeControl]="treeControl">
              <!-- Nodo hoja -->
              <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
                <button mat-icon-button disabled></button>
                <span class="flex items-center gap-2">
                  <span class="text-gray-500">{{ node.codigo }}</span>
                  <span>{{ node.descripcion }}</span>
                  @if (node.semaf_des) {
                    <span 
                      class="px-2 py-0.5 text-xs rounded-full"
                      [class]="getSemaforoClass(node.semaf_cod)"
                    >
                      {{ node.semaf_des }}
                    </span>
                  }
                </span>
              </mat-tree-node>
              
              <!-- Nodo expandible -->
              <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
                <button mat-icon-button matTreeNodeToggle>
                  <mat-icon>
                    {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                  </mat-icon>
                </button>
                <span class="font-medium">
                  <span class="text-blue-600">{{ node.codigo }}</span> - 
                  {{ node.descripcion }}
                </span>
              </mat-tree-node>
            </mat-tree>
          </div>
        </mat-tab>

        <!-- Tab: Listado por Nivel -->
        <mat-tab label="Listado">
          <div class="p-4">
            <!-- Filtros -->
            <div class="flex gap-4 mb-4">
              <mat-form-field appearance="outline">
                <mat-label>Nivel</mat-label>
                <mat-select [(value)]="selectedNivel" (selectionChange)="onNivelChange()">
                  <mat-option [value]="1">Sección</mat-option>
                  <mat-option [value]="2">División</mat-option>
                  <mat-option [value]="3">Grupo</mat-option>
                  <mat-option [value]="4">Clase</mat-option>
                  <mat-option [value]="5">Subclase</mat-option>
                  <mat-option [value]="6">Actividad</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Buscar</mat-label>
                <input matInput placeholder="Código o descripción..." />
              </mat-form-field>
            </div>

            <!-- Tabla -->
            <table mat-table [dataSource]="listDataSource()" class="w-full">
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let row">{{ row.codigo }}</td>
              </ng-container>
              
              <ng-container matColumnDef="descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let row">{{ row.descripcion }}</td>
              </ng-container>
              
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button (click)="onView(row)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="onEdit(row)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDelete(row)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <mat-paginator [pageSize]="20" [pageSizeOptions]="[10, 20, 50, 100]" />
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class CiiuAdminComponent implements OnInit {
  private readonly ciiuController = inject(CiiuController);
  
  // Tree
  treeControl: FlatTreeControl<ArbolCiiuEntity>;
  treeDataSource = signal<ArbolCiiuEntity[]>([]);
  
  // List
  selectedNivel = 6;
  listDataSource = signal<ArbolCiiuEntity[]>([]);
  displayedColumns = ['codigo', 'descripcion', 'acciones'];

  hasChild = (_: number, node: ArbolCiiuEntity) => node.nivel < 6;

  ngOnInit(): void {
    this.loadArbol();
    this.onNivelChange();
  }

  private loadArbol(): void {
    this.ciiuController.findArbol().subscribe({
      next: (data) => this.treeDataSource.set(data)
    });
  }

  onNivelChange(): void {
    // Cargar datos del nivel seleccionado
  }

  getSemaforoClass(codigo: number): string {
    const classes: Record<number, string> = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-orange-100 text-orange-800',
      2: 'bg-red-100 text-red-800',
      3: 'bg-red-200 text-red-900',
    };
    return classes[codigo] || '';
  }

  onView(row: ArbolCiiuEntity): void {
    // Abrir modal de detalle
  }

  onEdit(row: ArbolCiiuEntity): void {
    // Abrir modal de edición
  }

  onDelete(row: ArbolCiiuEntity): void {
    // Confirmar y ejecutar soft delete
  }
}
```

---

## 📡 API Endpoints

### Búsqueda y Selector (uso principal)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/ciiu/actividades/search?query=maiz&limit=20` | Buscar actividades (autocomplete) |
| GET | `/api/v1/ciiu/actividades/:id/completa` | Obtener actividad con jerarquía |
| GET | `/api/v1/ciiu/actividades/codigo/:codigo` | Obtener por código CIIU |

### Árbol

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/ciiu/arbol` | Árbol completo |
| GET | `/api/v1/ciiu/arbol/:nivel/:parentId/hijos` | Hijos de un nodo |

### CRUD por Nivel

| Nivel | GET all | GET by id | POST | PUT | DELETE |
|-------|---------|-----------|------|-----|--------|
| Sección | `/secciones` | `/secciones/:id` | `/secciones` | `/secciones/:id` | `/secciones/:id` |
| División | `/divisiones` | `/divisiones/:id` | `/divisiones` | `/divisiones/:id` | `/divisiones/:id` |
| Grupo | `/grupos` | `/grupos/:id` | `/grupos` | `/grupos/:id` | `/grupos/:id` |
| Clase | `/clases` | `/clases/:id` | `/clases` | `/clases/:id` | `/clases/:id` |
| Subclase | `/subclases` | `/subclases/:id` | `/subclases` | `/subclases/:id` | `/subclases/:id` |
| Actividad | `/actividades` | `/actividades/:id` | `/actividades` | `/actividades/:id` | `/actividades/:id` |

---

## 📝 Mensajes NATS

**IMPORTANTE**: Los métodos NATS usan nombres de entidad directamente (sin prefijo `ciiu.*`) para seguir el patrón del proyecto.

```typescript
// ==================== SECCIONES (Nivel 1) ====================
{ sm: "findAllSecciones" }           // payload: { active?: boolean }
{ sm: "findSeccionById" }           // payload: { id: number }
{ sm: "findSeccionByAbr" }          // payload: { abr: string }
{ sm: "createSeccion" }             // payload: CreateSeccionRequestDto
{ sm: "updateSeccion" }             // payload: { id: number, data: UpdateSeccionRequestDto }
{ sm: "deleteSeccion" }             // payload: { id: number }

// ==================== DIVISIONES (Nivel 2) ====================
{ sm: "findAllDivisiones" }        // payload: { active?: boolean }
{ sm: "findDivisionesBySeccion" }  // payload: { cisecId: number, active?: boolean }
{ sm: "findDivisionById" }          // payload: { id: number }
{ sm: "createDivision" }            // payload: CreateDivisionRequestDto
{ sm: "updateDivision" }            // payload: { id: number, data: UpdateDivisionRequestDto }
{ sm: "deleteDivision" }            // payload: { id: number }

// ==================== GRUPOS (Nivel 3) ====================
{ sm: "findAllGrupos" }             // payload: { active?: boolean }
{ sm: "findGruposByDivision" }      // payload: { cidivId: number, active?: boolean }
{ sm: "findGrupoById" }             // payload: { id: number }
{ sm: "createGrupo" }                // payload: CreateGrupoRequestDto
{ sm: "updateGrupo" }                // payload: { id: number, data: UpdateGrupoRequestDto }
{ sm: "deleteGrupo" }                // payload: { id: number }

// ==================== CLASES (Nivel 4) ====================
{ sm: "findAllClases" }             // payload: { active?: boolean }
{ sm: "findClasesByGrupo" }         // payload: { cigruId: number, active?: boolean }
{ sm: "findClaseById" }             // payload: { id: number }
{ sm: "createClase" }                // payload: CreateClaseRequestDto
{ sm: "updateClase" }                // payload: { id: number, data: UpdateClaseRequestDto }
{ sm: "deleteClase" }                // payload: { id: number }

// ==================== SUBCLASES (Nivel 5) ====================
{ sm: "findAllSubclases" }          // payload: { active?: boolean }
{ sm: "findSubclasesByClase" }     // payload: { ciclaId: number, active?: boolean }
{ sm: "findSubclaseById" }          // payload: { id: number }
{ sm: "createSubclase" }            // payload: CreateSubclaseRequestDto
{ sm: "updateSubclase" }            // payload: { id: number, data: UpdateSubclaseRequestDto }
{ sm: "deleteSubclase" }            // payload: { id: number }

// ==================== ACTIVIDADES (Nivel 6) ====================
{ sm: "findAllActividades" }        // payload: { active?: boolean }
{ sm: "findActividadesBySubclase" } // payload: { cisubId: number, active?: boolean }
{ sm: "findActividadById" }         // payload: { id: number }
{ sm: "createActividad" }           // payload: CreateActividadRequestDto
{ sm: "updateActividad" }           // payload: { id: number, data: UpdateActividadRequestDto }
{ sm: "deleteActividad" }           // payload: { id: number }

// ==================== BÚSQUEDA Y SELECTOR ====================
{ sm: "searchActividades" }         // payload: { query: string, limit?: number }
{ sm: "findActividadCompleta" }    // payload: { id: number }
{ sm: "findActividadCompletaByAbr" } // payload: { abr: string }

// ==================== ÁRBOL JERÁRQUICO ====================
{ sm: "findArbolCompleto" }         // payload: void
{ sm: "findHijosByNivel" }          // payload: { nivel: number, parentId: number }
```

**📝 Notas:**
- Todos los métodos NATS están definidos en `CiiuEnum` (archivo `infrastructure/enum/enum.ts`)
- Los valores son únicos en todo el proyecto para evitar duplicados
- Siguen el patrón `{acción}{Entidad}` usado en otros módulos (ej: `findAllProvincias`, `createCanton`)

---

## ✅ Checklist de Implementación

### Base de Datos
- [ ] Crear tabla `rrfcisec` (Secciones)
- [ ] Crear tabla `rrfcidiv` (Divisiones)
- [ ] Crear tabla `rrfcigru` (Grupos)
- [ ] Crear tabla `rrfcicla` (Clases)
- [ ] Crear tabla `rrfcisub` (Subclases)
- [ ] Crear tabla `rrfciact` (Actividades)
- [ ] Crear vista `vw_ciiu_actividad_completa`
- [ ] Crear vista `vw_ciiu_arbol`
- [ ] Crear índices para búsqueda full-text

### Backend MS-CONFI
- [ ] Crear módulo `ciiu.module.ts`
- [ ] Implementar entidades de dominio
- [ ] Implementar Value Objects (en `domain/value/`)
- [ ] Implementar Port (interface)
- [ ] Crear `enum.ts` con constantes y métodos NATS
- [ ] Implementar Repository con PgService
- [ ] Implementar Service Layer
- [ ] Implementar UseCase
- [ ] Implementar REST Controller
- [ ] Implementar NATS Context (usar `{ sm: Enum.smMethod }`)
- [ ] Implementar DTOs con validaciones
- [ ] Verificar que métodos NATS no se dupliquen con otros módulos
- [ ] Escribir tests unitarios

### Frontend Angular
- [ ] Crear módulo CIIU
- [ ] Implementar `CiiuSelectorComponent` con ControlValueAccessor
- [ ] Implementar `CiiuAdminComponent` con tabs
- [ ] Implementar vista de árbol
- [ ] Implementar listado con filtros
- [ ] Implementar modales de detalle/edición
- [ ] Implementar HTTP Controller
- [ ] Configurar rutas

### Documentación
- [ ] README del módulo
- [ ] Documentación de API
- [ ] Guía de uso del selector

---

## 📊 Datos de Prueba (INSERT Inicial)

El INSERT inicial se generará a partir del Excel de la SEPS. La estructura del Excel es:

| Columna | Contenido |
|---------|-----------|
| 0 | CÓDIGO CIIU 4 (A, A01, A011, A0111, A01111, A011111) |
| 1 | Sección (descripción) |
| 2 | División (descripción) |
| 3 | Grupo (descripción) |
| 4 | Clase (descripción) |
| 5 | Subclase (descripción) |
| 6 | Actividad Económica (descripción) |
| 7 | Aplicación (campo informativo, no se almacena) |

---

## 🔗 Referencias

- Módulo GEO como referencia de implementación
- Template CRUD del proyecto
- Convenciones de nomenclatura del proyecto
- Arquitectura hexagonal establecida

---

**Fin del Prompt**
