# 📋 Plan de Implementación de Catálogos - MS-PERSO

**Fecha**: 2025-01-28  
**Objetivo**: Implementar todos los catálogos faltantes según el esquema SQL `MS-CLIEN_DDL_v4.1.sql`

---

## ✅ Estado Actual

### Catálogos Implementados
- ✅ `rrftiden` - Tipos de identificación (ACTUALIZADO según esquema SQL)

### Catálogos Faltantes (12)
1. `rrftpers` - Tipos de persona
2. `rrfsexos` - Sexos
3. `rrfinstr` - Niveles de instrucción
4. `rrfecivi` - Estados civiles
5. `rrfnacio` - Nacionalidades
6. `rrfetnia` - Etnias SEPS
7. `rrftcont` - Tipos de contrato laboral
8. `rrftiref` - Tipos de referencia
9. `rrftrep` - Tipos de representante legal
10. `rrftifin` - Tipos financieros
11. `rrfrasam` - Tipos de representante en asamblea
12. `rrfifina` - Instituciones financieras

---

## 📐 Estructura de Cada Catálogo

Cada catálogo seguirá el patrón establecido en `tiden`:

```
parameter/{catalogo}/
├── application/
│   └── usecase.ts
├── domain/
│   ├── entity.ts
│   ├── port.ts
│   └── value.ts
├── infrastructure/
│   ├── dto/
│   │   ├── dto.ts
│   │   └── index.ts
│   ├── enum/
│   │   └── enum.ts
│   ├── repository/
│   │   └── repository.ts
│   └── service/
│       └── service.ts
└── interface/
    ├── context/
    │   └── context.ts
    ├── controller/
    │   └── controller.ts
    └── module.ts
```

---

## 📊 Detalles de Cada Catálogo

### 1. rrftpers - Tipos de Persona
**Tabla**: `rrftpers`  
**Campos**:
- `tpers_cod_tpers` (SMALLINT PRIMARY KEY)
- `tpers_nom_tpers` (VARCHAR(30))
- `tpers_est_tpers` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = NATURAL
- 2 = JURÍDICA

**Prioridad**: 🔴 ALTA (usado en Persona)

---

### 2. rrfsexos - Sexos
**Tabla**: `rrfsexos`  
**Campos**:
- `sexos_cod_sexos` (SMALLINT PRIMARY KEY)
- `sexos_nom_sexos` (VARCHAR(20))
- `sexos_cod_seps` (VARCHAR(1)) - Código SEPS
- `sexos_est_sexos` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = MASCULINO (M)
- 2 = FEMENINO (F)
- 3 = NO APLICA (N)

**Prioridad**: 🔴 ALTA (usado en Persona)

---

### 3. rrfinstr - Niveles de Instrucción
**Tabla**: `rrfinstr`  
**Campos**:
- `instr_cod_instr` (SMALLINT PRIMARY KEY)
- `instr_nom_instr` (VARCHAR(50))
- `instr_cod_seps` (VARCHAR(2)) - Código SEPS
- `instr_est_instr` (BOOLEAN, default true)

**Datos iniciales**:
- 0 = NO APLICA (0)
- 1 = NINGUNA (1)
- 2 = PRIMARIA (2)
- 3 = SECUNDARIA (3)
- 4 = SUPERIOR (4)
- 5 = POSTGRADO (5)

**Prioridad**: 🔴 ALTA (usado en Persona)

---

### 4. rrfecivi - Estados Civiles
**Tabla**: `rrfecivi`  
**Campos**:
- `ecivi_cod_ecivi` (SMALLINT PRIMARY KEY)
- `ecivi_nom_ecivi` (VARCHAR(30))
- `ecivi_req_conyu` (BOOLEAN, default false) - Requiere cónyuge
- `ecivi_est_ecivi` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = SOLTERO/A (false)
- 2 = CASADO/A (true)
- 3 = UNIÓN DE HECHO (true)
- 4 = DIVORCIADO/A (false)
- 5 = VIUDO/A (false)
- 6 = UNIÓN LIBRE (true)

**Prioridad**: 🔴 ALTA (usado en Persona, determina si requiere cónyuge)

---

### 5. rrfnacio - Nacionalidades
**Tabla**: `rrfnacio`  
**Campos**:
- `nacio_cod_nacio` (SMALLINT PRIMARY KEY)
- `nacio_nom_nacio` (VARCHAR(80))
- `nacio_cod_pais` (VARCHAR(3)) - Código ISO 3166-1
- `nacio_est_nacio` (BOOLEAN, default true)

**Datos iniciales**: 11 nacionalidades comunes (ver SQL)

**Prioridad**: 🔴 ALTA (usado en Persona y Residencia Fiscal)

---

### 6. rrfetnia - Etnias SEPS
**Tabla**: `rrfetnia`  
**Campos**:
- `etnia_cod_etnia` (SMALLINT PRIMARY KEY)
- `etnia_nom_etnia` (VARCHAR(50))
- `etnia_cod_seps` (VARCHAR(2)) - Código SEPS
- `etnia_est_etnia` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = MESTIZO (1)
- 2 = BLANCO (2)
- 3 = INDÍGENA (3)
- 4 = AFROECUATORIANO (4)
- 5 = MONTUBIO (5)
- 6 = OTRO (6)

**Prioridad**: 🟡 MEDIA (usado en Persona)

---

### 7. rrftcont - Tipos de Contrato Laboral
**Tabla**: `rrftcont`  
**Campos**:
- `tcont_cod_tcont` (SMALLINT PRIMARY KEY)
- `tcont_nom_tcont` (VARCHAR(50))
- `tcont_est_tcont` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = INDEFINIDO
- 2 = PLAZO FIJO
- 3 = EVENTUAL
- 4 = HONORARIOS PROFESIONALES
- 5 = INDEPENDIENTE/NEGOCIO PROPIO

**Prioridad**: 🟡 MEDIA (usado en Información Laboral)

---

### 8. rrftiref - Tipos de Referencia
**Tabla**: `rrftiref`  
**Campos**:
- `tiref_cod_tiref` (SMALLINT PRIMARY KEY)
- `tiref_nom_tiref` (VARCHAR(30))
- `tiref_req_finan` (BOOLEAN, default false) - Requiere datos financieros
- `tiref_est_tiref` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = PERSONAL (false)
- 2 = COMERCIAL (false)
- 3 = FINANCIERA (true)

**Prioridad**: 🟡 MEDIA (usado en Referencias)

---

### 9. rrftrep - Tipos de Representante Legal
**Tabla**: `rrftrep`  
**Campos**:
- `trep_cod_trep` (SMALLINT PRIMARY KEY)
- `trep_nom_trep` (VARCHAR(30))
- `trep_est_trep` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = REPRESENTANTE LEGAL
- 2 = TUTOR
- 3 = APODERADO GENERAL
- 4 = APODERADO ESPECIAL

**Prioridad**: 🟡 MEDIA (usado en Representante)

---

### 10. rrftifin - Tipos Financieros
**Tabla**: `rrftifin`  
**Campos**:
- `tifin_cod_tifin` (INTEGER PRIMARY KEY)
- `tifin_nom_tifin` (VARCHAR(50))
- `tifin_tip_tifin` (VARCHAR(1)) - I=Ingreso, G=Gasto, A=Activo, P=Pasivo
- `tifin_est_tifin` (BOOLEAN, default true)

**Datos iniciales**: 34 tipos (7 Ingresos, 8 Gastos, 6 Activos, 5 Pasivos)

**Prioridad**: 🟡 MEDIA (usado en Información Financiera)

---

### 11. rrfrasam - Tipos de Representante en Asamblea
**Tabla**: `rrfrasam`  
**Campos**:
- `rasam_cod_rasam` (SMALLINT PRIMARY KEY)
- `rasam_nom_rasam` (VARCHAR(50))
- `rasam_est_rasam` (BOOLEAN, default true)

**Datos iniciales**:
- 1 = DELEGADO PRINCIPAL
- 2 = DELEGADO SUPLENTE

**Prioridad**: 🟢 BAJA (usado en Asamblea)

---

### 12. rrfifina - Instituciones Financieras
**Tabla**: `rrfifina`  
**Campos**:
- `ifina_cod_ifina` (INTEGER PRIMARY KEY)
- `ifina_nom_ifina` (VARCHAR(150))
- `ifina_cod_spi` (VARCHAR(20)) - Código SPI BCE
- `ifina_est_ifina` (BOOLEAN, default true)

**Datos iniciales**: 9 instituciones de ejemplo (ver SQL)

**Prioridad**: 🟡 MEDIA (usado en Beneficiarios Banca Digital)

---

## 🚀 Plan de Implementación

### Fase 1: Catálogos Críticos (Prioridad ALTA)
1. ✅ `rrftiden` - Actualizado
2. 🔄 `rrftpers` - Tipos de persona
3. 🔄 `rrfsexos` - Sexos
4. 🔄 `rrfinstr` - Niveles de instrucción
5. 🔄 `rrfecivi` - Estados civiles
6. 🔄 `rrfnacio` - Nacionalidades

### Fase 2: Catálogos de Media Prioridad
7. 🔄 `rrfetnia` - Etnias SEPS
8. 🔄 `rrftcont` - Tipos de contrato
9. 🔄 `rrftiref` - Tipos de referencia
10. 🔄 `rrftrep` - Tipos de representante
11. 🔄 `rrftifin` - Tipos financieros
12. 🔄 `rrfifina` - Instituciones financieras

### Fase 3: Catálogos de Baja Prioridad
13. 🔄 `rrfrasam` - Tipos de representante en asamblea

### Fase 4: Integración
14. 🔄 Actualizar `ParameterModule` para incluir todos los catálogos
15. 🔄 Verificar que todos los módulos de management usen los catálogos correctamente

---

## 📝 Notas

- Todos los catálogos seguirán el mismo patrón que `tiden`
- Soft delete mediante campo `{tabla}_est_{tabla} = false`
- Validaciones en Value Objects
- DTOs con Swagger documentation
- Métodos NATS con nombre del módulo para evitar duplicados

---

**Última actualización**: 2025-01-28

