# 📋 ESPECIFICACIÓN - Módulo Catálogo Geográfico (Provincias, Cantones, Parroquias)

## 🎯 **Objetivo**
Implementar un nuevo módulo de parámetros dentro de MS-CONFI: Catálogo Geográfico (Provincias, Cantones, Parroquias) siguiendo la arquitectura hexagonal y las convenciones del proyecto FINANTIX.

## 📚 **Referencia Regulatoria**
- **SEPS Manual Técnico "Tablas de Información" v32.0 (11/11/2025)**
  - Tabla 05: Provincia
  - Tabla 06: Cantón
  - Tabla 07: Parroquia

**⚠️ IMPORTANTE**: Los códigos SEPS deben preservar ceros a la izquierda (almacenar como CHAR/VARCHAR, nunca como INTEGER).

---

## 📋 **Reglas de Negocio**

1. **Catálogo Nacional Único**: El catálogo es único a nivel nacional (no específico por tenant).
2. **Control de Acceso**: Solo usuarios ADMIN pueden crear/actualizar/inactivar registros del catálogo.
3. **Referencias Obligatorias**: Las entidades que dependen de geografía (socios/personas, créditos, cuentas) DEBEN referenciar una Parroquia válida.
   - Si la parroquia es inválida o inactiva: BLOQUEAR el onboarding/creación/actualización que la requiera.
4. **Versionado**: No se requiere versionado histórico. Debe soportar activo/inactivo (`flg_acti=false`) sin romper referencias existentes.
5. **Auditoría**: Debe incluir auditoría completa para cambios en el catálogo: quién/cuándo/acción/valor_anterior/valor_nuevo/correlationId.
6. **Clasificación Parroquia**: La parroquia incluye clasificación rural/urbano (`parro_tip_area`: R=Rural, U=Urbano).
7. **Actualización Manual**: Las actualizaciones vienen de PDF/manual y pueden mantenerse vía formularios frontend (no es obligatorio endpoint de importación masiva).
8. **Uso Dual**: En el dominio de personas existen dos usos diferentes: "parroquia de domicilio" y "parroquia de nacimiento" (dos campos diferentes).
   - En esta tarea implementamos solo el módulo de catálogo; pero exponemos endpoints API adecuados para ambos usos.

---

## 🏗️ **Arquitectura y Estructura**

### **Notas Técnicas del Proyecto**
- MS-CONFI sigue estructura de módulos de parámetros existentes (color, icons, opcio, perfi, tofic). Usar esos como patrón.
- El proyecto usa soft delete en entidades; seguir convenciones del proyecto (`fec_creac`, `fec_modif`, `fec_elimi`) y agregar flag de negocio activo (`flg_acti`).
- Existe una entidad/tabla de auditoría mencionada como `rrfaudit` en la plataforma; reutilizar el enfoque de auditoría existente si ya está implementado; de lo contrario crear un escritor de auditoría mínimo consistente con MS-AUTH. (NO duplicar si ya existe).
- MS-CONFI usa **PgService** (raw PostgreSQL) en lugar de TypeORM directamente. Seguir el patrón de los módulos existentes.
- **Primary Keys**: Usar `INTEGER/SERIAL` (no UUID) para mantener consistencia con el resto del proyecto.
- **Inyección de Dependencias**: Usar Symbols para tokens de DI (patrón de MS-AUTH).

### **Estructura del Módulo**

```
BACKEND/MS-CONFI/src/module/parameter/geo/
├── application/
│   └── usecase.ts                    # UseCase único que implementa GeoPort
├── domain/
│   ├── entity.ts                     # Interfaces de entidades (Provincia, Canton, Parroquia)
│   ├── port.ts                       # Interface GeoPort (sin prefijo I)
│   └── value.ts                      # Value objects (GeoValue)
├── infrastructure/
│   ├── dto/
│   │   ├── request/                  # DTOs de request
│   │   │   ├── create-provincia.request.dto.ts
│   │   │   ├── update-provincia.request.dto.ts
│   │   │   └── ...
│   │   ├── response/                 # DTOs de response
│   │   │   ├── provincia.response.dto.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── enum/
│   │   └── enum.ts                   # Constantes (tabla, título, métodos NATS)
│   ├── repository/
│   │   └── repository.ts             # Implementación del repositorio (PgService)
│   └── service/
│       └── service.ts                # Servicio que envuelve use cases
├── interface/
│   ├── controller/
│   │   └── controller.ts             # Controlador REST
│   ├── context/
│   │   └── context.ts                # Handler NATS (REQUERIDO)
│   └── module.ts                     # Módulo NestJS
└── (registrar en parameter.module.ts)
```

---

## 📦 **DELIVERABLES**

### **A) Estructura del Módulo**

#### **Domain Layer**

**domain/entity.ts**: Interfaces de entidades
```typescript
export interface ProvinciaEntity {
  provi_cod_provi?: number;        // INTEGER (primary key)
  provi_cod_prov: string;          // CHAR(2) - Código SEPS
  provi_nom_provi: string;         // VARCHAR(100)
  provi_flg_acti: boolean;         // Flag activo/inactivo
  provi_fec_creac?: Date;
  provi_fec_modif?: Date;
  provi_fec_elimi?: Date | null;
}

export interface CantonEntity {
  canto_cod_canto?: number;        // INTEGER (primary key)
  provi_cod_provi: number;         // INTEGER (FK a provincia)
  canto_cod_cant: string;          // CHAR(2) - Código SEPS
  canto_nom_canto: string;         // VARCHAR(100)
  canto_flg_acti: boolean;
  canto_fec_creac?: Date;
  canto_fec_modif?: Date;
  canto_fec_elimi?: Date | null;
}

export interface ParroquiaEntity {
  parro_cod_parro?: number;        // INTEGER (primary key)
  canto_cod_canto: number;         // INTEGER (FK a cantón)
  parro_cod_parr: string;          // CHAR(2) - Código SEPS
  parro_nom_parro: string;        // VARCHAR(120)
  parro_tip_area?: 'R' | 'U' | null;  // R=Rural, U=Urbano
  parro_flg_acti: boolean;
  parro_fec_creac?: Date;
  parro_fec_modif?: Date;
  parro_fec_elimi?: Date | null;
}

export interface GeoParams extends ParamsInterface {
  active?: boolean;                // Filtrar solo activos
}
```

**domain/port.ts**: Interface del repositorio
```typescript
export interface GeoPort {
  // Lecturas
  findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]>;
  findCantonesByProvincia(proviCodProv: string, active?: boolean): Promise<CantonEntity[]>;
  findParroquiasByCanton(proviCodProv: string, cantoCodCant: string, active?: boolean): Promise<ParroquiaEntity[]>;
  searchParroquias(query: string, limit: number): Promise<ParroquiaEntity[]>;
  
  // Admin - Provincias
  createProvincia(data: ProvinciaEntity): Promise<ProvinciaEntity | null>;
  updateProvincia(id: number, data: ProvinciaEntity): Promise<ProvinciaEntity | null>;
  deleteProvincia(id: number): Promise<ProvinciaEntity | null>;  // Soft delete
  
  // Admin - Cantones
  createCanton(data: CantonEntity): Promise<CantonEntity | null>;
  updateCanton(id: number, data: CantonEntity): Promise<CantonEntity | null>;
  deleteCanton(id: number): Promise<CantonEntity | null>;  // Soft delete
  
  // Admin - Parroquias
  createParroquia(data: ParroquiaEntity): Promise<ParroquiaEntity | null>;
  updateParroquia(id: number, data: ParroquiaEntity): Promise<ParroquiaEntity | null>;
  deleteParroquia(id: number): Promise<ParroquiaEntity | null>;  // Soft delete
}

// Token para inyección de dependencias
export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');
```

**domain/value.ts**: Value objects para validación y transformación
```typescript
export class GeoValue {
  // Implementar transformaciones y validaciones
  // Similar a ToficValue pero para las tres entidades
}
```

#### **Application Layer**

**application/usecase.ts**: Un solo UseCase que implementa GeoPort
```typescript
export class GeoUseCase implements GeoPort {
  constructor(
    @Inject(GEO_REPOSITORY)
    private readonly repository: GeoPort
  ) {}

  // Implementar todos los métodos del Port
  async findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]> {
    // Lógica de negocio
  }
  
  // ... resto de métodos
}
```

#### **Infrastructure Layer**

**infrastructure/repository/repository.ts**: Implementación usando `PgService`
- Usar métodos `query()`, `queryGet()`, `create()`, `update()`, `delete()` de PgService
- Manejar soft delete con `fec_elimi`
- Filtrar por `flg_acti` cuando se requiera

**infrastructure/dto/dto.ts**: DTOs con validaciones en español usando `class-validator`
- Request DTOs: CreateProvinciaRequestDto, UpdateProvinciaRequestDto, etc.
- Response DTOs: ProvinciaResponseDto, CantonResponseDto, ParroquiaResponseDto
- Validaciones: códigos SEPS (CHAR(2)), nombres (longitud), tipo de área (R/U)

**infrastructure/enum/enum.ts**: Constantes del módulo
```typescript
export const GeoEnum = {
  table: {
    provi: "rrfprovi",
    canto: "rrfcanto",
    parro: "rrfparro",
  },
  title: {
    provi: "Provincias",
    canto: "Cantones",
    parro: "Parroquias",
  },
  msService: "msGeo",
  smFindAllProvincias: "findAllProvincias",
  smFindCantonesByProvincia: "findCantonesByProvincia",
  smFindParroquiasByCanton: "findParroquiasByCanton",
  smSearchParroquias: "searchParroquias",
  smCreateProvincia: "createProvincia",
  smUpdateProvincia: "updateProvincia",
  smDeleteProvincia: "deleteProvincia",
  // ... resto de métodos
}
```

**infrastructure/service/service.ts**: Servicio que envuelve use cases
- Similar a ToficService, usando ResponseUtil e InformationMessage

#### **Interface Layer**

**interface/controller/controller.ts**: Controlador REST con endpoints documentados (Swagger)
- Usar decoradores `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`
- Documentar todos los endpoints

**interface/context/context.ts**: Handler NATS (REQUERIDO, no opcional)
- Implementar handlers para todos los métodos NATS definidos en GeoEnum

**interface/module.ts**: Módulo NestJS con providers y controllers
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [GeoController, GeoContext],
  providers: [
    {
      provide: GEO_REPOSITORY,
      useClass: GeoDBRepository,
    },
    GeoService,
  ],
})
export class GeoModule {}
```

### **B) Diseño de Base de Datos (PostgreSQL + Scripts SQL)**

#### **1. Tabla rrfprovi (Provincia)**
```sql
CREATE TABLE rrfprovi (
    provi_cod_provi SERIAL PRIMARY KEY,              -- INTEGER auto-incrementado
    provi_cod_prov CHAR(2) NOT NULL UNIQUE,          -- Código SEPS/INEC (preservar ceros a la izquierda)
    provi_nom_provi VARCHAR(100) NOT NULL,
    provi_flg_acti BOOLEAN NOT NULL DEFAULT true,
    provi_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_elimi TIMESTAMPTZ NULL
);

CREATE INDEX idx_provi_cod_prov ON rrfprovi(provi_cod_prov);
CREATE INDEX idx_provi_flg_acti ON rrfprovi(provi_flg_acti) WHERE provi_fec_elimi IS NULL;
```

#### **2. Tabla rrfcanto (Cantón)**
```sql
CREATE TABLE rrfcanto (
    canto_cod_canto SERIAL PRIMARY KEY,              -- INTEGER auto-incrementado
    provi_cod_provi INTEGER NOT NULL REFERENCES rrfprovi(provi_cod_provi) ON DELETE RESTRICT,
    canto_cod_cant CHAR(2) NOT NULL,                 -- Código SEPS (preservar ceros a la izquierda)
    canto_nom_canto VARCHAR(100) NOT NULL,
    canto_flg_acti BOOLEAN NOT NULL DEFAULT true,
    canto_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canto_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canto_fec_elimi TIMESTAMPTZ NULL,
    CONSTRAINT uk_canto_provi_cant UNIQUE (provi_cod_provi, canto_cod_cant)
);

CREATE INDEX idx_canto_provi ON rrfcanto(provi_cod_provi);
CREATE INDEX idx_canto_nom ON rrfcanto(canto_nom_canto);
CREATE INDEX idx_canto_flg_acti ON rrfcanto(canto_flg_acti) WHERE canto_fec_elimi IS NULL;
```

#### **3. Tabla rrfparro (Parroquia)**
```sql
CREATE TABLE rrfparro (
    parro_cod_parro SERIAL PRIMARY KEY,             -- INTEGER auto-incrementado
    canto_cod_canto INTEGER NOT NULL REFERENCES rrfcanto(canto_cod_canto) ON DELETE RESTRICT,
    parro_cod_parr CHAR(2) NOT NULL,                -- Código SEPS (preservar ceros a la izquierda)
    parro_nom_parro VARCHAR(120) NOT NULL,
    parro_tip_area CHAR(1) NULL CHECK (parro_tip_area IN ('R', 'U') OR parro_tip_area IS NULL),  -- R=Rural, U=Urbano
    parro_flg_acti BOOLEAN NOT NULL DEFAULT true,
    parro_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parro_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parro_fec_elimi TIMESTAMPTZ NULL,
    CONSTRAINT uk_parro_canto_parr UNIQUE (canto_cod_canto, parro_cod_parr)
);

CREATE INDEX idx_parro_canto ON rrfparro(canto_cod_canto);
CREATE INDEX idx_parro_nom ON rrfparro(parro_nom_parro);
CREATE INDEX idx_parro_flg_acti ON rrfparro(parro_flg_acti) WHERE parro_fec_elimi IS NULL;

-- Índice para búsqueda de texto (usar pg_trgm si está disponible, sino ILIKE)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_parro_nom_trgm ON rrfparro USING gin(parro_nom_parro gin_trgm_ops);
-- Alternativa sin pg_trgm:
-- CREATE INDEX idx_parro_nom_lower ON rrfparro(lower(parro_nom_parro));
```

**⚠️ Comportamiento de Integridad:**
- **NUNCA** hacer hard delete de filas. Usar `fec_elimi` para soft delete.
- Usar `flg_acti` para inactivación de negocio.
- Las referencias existentes de socios/créditos/cuentas NO deben romperse si una fila geo se vuelve inactiva.
- Las claves foráneas usan `ON DELETE RESTRICT` para prevenir eliminación accidental.

**📝 Convenciones de Nomenclatura:**
- Tablas: `rrf` + 5 caracteres exactos (`rrfprovi`, `rrfcanto`, `rrfparro`)
- Campos: `{tabla}_{prefijo3}_{campo}` (ej: `provi_cod_provi`, `canto_nom_canto`)
- Prefijos: `cod_` (código/ID), `nom_` (nombre), `flg_` (flag/boolean), `fec_` (fecha), `tip_` (tipo)

### **C) Endpoints REST API (MS-CONFI)**

#### **Lecturas Públicas (autenticadas)**
```
GET /api/v1/geo/provincias?active=true
GET /api/v1/geo/provincias/:provi_cod_prov/cantones?active=true
GET /api/v1/geo/provincias/:provi_cod_prov/cantones/:canto_cod_cant/parroquias?active=true
GET /api/v1/geo/parroquias/search?q=TEXT&limit=20
```

#### **Escrituras Solo Admin**
```
POST   /api/v1/geo/provincias
PUT    /api/v1/geo/provincias/:provi_cod_provi
DELETE /api/v1/geo/provincias/:provi_cod_provi          # Soft delete (actualiza fec_elimi)

POST   /api/v1/geo/cantones
PUT    /api/v1/geo/cantones/:canto_cod_canto
DELETE /api/v1/geo/cantones/:canto_cod_canto             # Soft delete

POST   /api/v1/geo/parroquias
PUT    /api/v1/geo/parroquias/:parro_cod_parro
DELETE /api/v1/geo/parroquias/:parro_cod_parro          # Soft delete
```

**📝 Comportamiento de Lookup por Códigos (para selects en cascada):**
- Parámetro provincia usa `provi_cod_prov` (CHAR(2), código SEPS)
- Parámetro cantón usa `canto_cod_cant` (CHAR(2), código SEPS)
- Lista de parroquias se resuelve haciendo join provincia->cantón->parroquia

**🔐 Control de Acceso:**
- Endpoints de lectura: Requieren autenticación (JWT)
- Endpoints de escritura: Requieren rol ADMIN (implementar guard o decorador)

**📋 Códigos de Estado HTTP:**
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Validación fallida
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (no es ADMIN)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Violación de constraint (unicidad)
- `500 Internal Server Error`: Error del servidor

### **D) Auditoría**

Para cada escritura de admin (create/update/delete), escribir un registro de auditoría usando el mecanismo de auditoría existente.

**Campos requeridos en auditoría:**
- `action`: CREATE/UPDATE/DELETE
- `entity`: rrfprovi/rrfcanto/rrfparro
- `entityId`: INTEGER del registro afectado (no UUID)
- `oldValue`: JSON con valores anteriores (null para CREATE)
- `newValue`: JSON con valores nuevos (null para DELETE)
- `userId`: ID del usuario que realiza la acción
- `correlationId`: UUID de correlación de la petición
- `timestamp`: Fecha/hora de la acción
- `ipAddress`: IP del cliente (opcional pero recomendado)
- `userAgent`: User agent del cliente (opcional)

**⚠️ IMPORTANTE**: Si un servicio/tabla de auditoría ya existe en el repositorio, reutilizarlo; NO duplicar.

**Referencia**: Ver implementación en MS-AUTH (`rrfaulog` o tabla general de auditoría si existe).

### **E) Tests**

#### **Tests Unitarios**
- Use cases: validaciones, errores de unicidad, filtros de activos
- Repositorio: métodos de búsqueda, creación, actualización, soft delete
- Value objects: transformaciones y validaciones

#### **Tests de Integración**
- Constraints de unicidad (provi_cod_prov, combinación provincia-cantón, combinación cantón-parroquia)
- Joins en cascada (provincia->cantón->parroquia)
- Soft delete y flags de activación
- Verificar que los scripts SQL hacen rollback limpiamente

**Estructura de Tests:**
```
BACKEND/MS-CONFI/test/
└── geo/
    ├── unit/
    │   ├── usecase.spec.ts
    │   └── repository.spec.ts
    └── e2e/
        └── geo.e2e-spec.ts
```

---

### **F) Documentación**

Crear `/docs/modules/ms-confi/geo-catalog.md` en español con:
- **Arquitectura**: Overview de la estructura del módulo
- **Flujos de Negocio**: Cómo se crean/actualizan/inactivan registros
- **Contratos API**: Endpoints con ejemplos de request/response
- **Diccionario de Base de Datos**: Descripción de tablas y campos
- **Diagrama ER**: Relaciones entre provincias, cantones y parroquias
- **Reglas de Validación**: Validaciones de negocio y mensajes de error
- **Guía de Actualización Manual**: Cómo actualizar el catálogo desde PDF SEPS manualmente
- **Controles de Seguridad**: Permisos y roles requeridos

---

## 🔧 **Reglas de Ejecución**

### **Antes de Implementar**
1. **Escanear el repositorio** para patrones existentes en módulos Parameter de MS-CONFI (color, icons, opcio, perfi, tofic)
2. **Revisar implementación de auditoría** existente (MS-AUTH o MS-CONFI)
3. **Verificar estructura de scripts SQL** si existe en MS-CONFI
4. **Seguir convenciones**:
   - Tokens de DI (Symbol) existentes
   - Nomenclatura de archivos y clases
   - Patrones de respuesta API (`ApiResponse`, `ApiResponses`)
   - Mensajes en español

### **Convenciones a Seguir**

#### **Nomenclatura**
- **Tablas**: `rrf` + 5 caracteres (`rrfprovi`, `rrfcanto`, `rrfparro`)
- **Campos**: `{tabla}_{prefijo3}_{campo}` (ej: `provi_cod_provi`, `canto_nom_canto`)
- **Clases**: PascalCase (`ProvinciaEntity`, `GeoUseCase`)
- **Archivos**: kebab-case (`provincia.entity.ts`, `geo.usecase.ts`)
- **Interfaces**: PascalCase sin prefijo I (`GeoPort`, no `IGeoPort`)
- **Constantes**: UPPER_SNAKE_CASE (`GEO_REPOSITORY`)

#### **Mensajes y Validaciones**
- **Mensajes al usuario**: Español
- **Comentarios**: Español con JSDoc
- **Validaciones**: Usar `class-validator` con mensajes en español
- **Errores HTTP**: Mensajes descriptivos en español

#### **Patrones de Código**
- Seguir estructura de módulos Parameter existentes (tofic, perfi, etc.)
- Usar `PgService` para acceso a base de datos (no TypeORM directamente)
- Implementar value objects para transformación y validación
- Usar `ResponseUtil` y `InformationMessage` para respuestas consistentes
- Usar Symbols para inyección de dependencias (patrón MS-AUTH)

### **Aprobación Requerida**
Antes de realizar cambios que afecten otros módulos o librerías compartidas, solicitar aprobación en el checklist de salida.

---

## 📤 **Salida Esperada**

### **1. Lista de Archivos Creados/Modificados**
```
BACKEND/MS-CONFI/src/module/parameter/geo/
├── application/usecase.ts
├── domain/entity.ts
├── domain/port.ts
├── domain/value.ts
├── infrastructure/dto/
│   ├── request/
│   │   ├── create-provincia.request.dto.ts
│   │   ├── update-provincia.request.dto.ts
│   │   └── ...
│   ├── response/
│   │   ├── provincia.response.dto.ts
│   │   └── ...
│   └── index.ts
├── infrastructure/enum/enum.ts
├── infrastructure/repository/repository.ts
├── infrastructure/service/service.ts
├── interface/controller/controller.ts
├── interface/context/context.ts
└── interface/module.ts

BACKEND/MS-CONFI/src/module/parameter/parameter.module.ts (modificado)
BACKEND/MS-CONFI/src/database/scripts/XXXXXX-CreateGeoCatalog.sql (nuevo)
BACKEND/MS-CONFI/test/geo/... (tests)
docs/modules/ms-confi/geo-catalog.md (nuevo)
```

### **2. Resumen SQL/Script**
- Scripts de creación de tablas (`rrfprovi`, `rrfcanto`, `rrfparro`)
- Índices y constraints
- Script de rollback

### **3. Lista de Endpoints + Ejemplos de Requests**
- Documentación Swagger completa
- Ejemplos de request/response para cada endpoint
- Códigos de estado HTTP y mensajes de error

### **4. Resumen de Cobertura de Tests**
- Tests unitarios: use cases, repositorio, value objects
- Tests de integración: constraints, joins, soft delete
- Porcentaje de cobertura

**⚠️ TODAS las explicaciones deben estar en ESPAÑOL.**

---

## ✅ **Checklist de Implementación**

- [ ] **Domain Layer**
  - [ ] Entidades de dominio creadas (Provincia, Canton, Parroquia)
  - [ ] Puerto (interfaz) del repositorio definido (`GeoPort`, sin prefijo I)
  - [ ] Value objects implementados
  - [ ] Token Symbol para inyección de dependencias (`GEO_REPOSITORY`)

- [ ] **Application Layer**
  - [ ] UseCase único creado que implementa `GeoPort`
  - [ ] Validaciones de negocio implementadas
  - [ ] Manejo de errores apropiado
  - [ ] Integración con auditoría

- [ ] **Infrastructure Layer**
  - [ ] Repositorio implementado con PgService
  - [ ] DTOs con validaciones en español
  - [ ] Enums con constantes del módulo
  - [ ] Servicio que envuelve use cases

- [ ] **Interface Layer**
  - [ ] Controller REST con endpoints documentados
  - [ ] Context NATS (REQUERIDO)
  - [ ] Módulo NestJS configurado con providers correctos

- [ ] **Base de Datos**
  - [ ] Script SQL creado con rollback
  - [ ] Tablas con nomenclatura correcta (`rrf` + 5 chars)
  - [ ] Primary keys como INTEGER/SERIAL (no UUID)
  - [ ] Foreign keys como INTEGER
  - [ ] Índices en campos de búsqueda frecuente
  - [ ] Constraints de unicidad y foreign keys
  - [ ] Soft delete implementado (`fec_elimi`)

- [ ] **Auditoría**
  - [ ] Integración con sistema de auditoría existente
  - [ ] Registro de acciones CREATE/UPDATE/DELETE
  - [ ] Campos requeridos incluidos (entityId como INTEGER)

- [ ] **Testing**
  - [ ] Tests unitarios para use cases
  - [ ] Tests unitarios para repositorio
  - [ ] Tests de integración
  - [ ] Verificación de rollback de scripts SQL

- [ ] **Documentación**
  - [ ] Documentación técnica completa
  - [ ] ERD y diccionario de base de datos
  - [ ] Guía de actualización manual
  - [ ] Ejemplos de uso de API

---

**Versión**: 2.1.0  
**Última actualización**: 2025-01  
**Basado en**: Template CRUD Core, Convenciones FINANTIX y Patrón MS-AUTH
