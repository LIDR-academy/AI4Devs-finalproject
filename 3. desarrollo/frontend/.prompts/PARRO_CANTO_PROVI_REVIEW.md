# 📋 REVISIÓN - Especificación Módulo Catálogo Geográfico

## ✅ **Aspectos Correctos**

1. ✅ Estructura de carpetas alineada con módulos existentes (tofic, perfi, opcio)
2. ✅ Uso de PgService en lugar de TypeORM directamente
3. ✅ Nomenclatura de tablas (`rrf` + 5 caracteres) correcta
4. ✅ Soft delete con `fec_elimi` y flag de negocio `flg_acti`
5. ✅ Preservación de ceros a la izquierda en códigos SEPS (CHAR/VARCHAR)
6. ✅ Documentación en español
7. ✅ Arquitectura hexagonal respetada

---

## ⚠️ **Inconsistencias con Patrones Existentes**

### **1. Tipo de Primary Key**

**Especificación actual:**
```sql
provi_cod_provi UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

**Patrón existente en MS-CONFI:**
```typescript
// Todos los módulos Parameter usan INTEGER/SERIAL
perfi_cod_perfi?: number;      // Perfil
tofic_cod_tofic?: number;       // Tipo de oficina
color_cod_color?: number;       // Color
icons_cod_icons?: number;       // Iconos
empre_cod_empre?: number;       // Empresa
ofici_cod_ofici?: number;       // Oficina

// Excepción (caso especial):
opcio_cod_opcio?: string;       // Opciones de menú (usa string, no number)
```

**Patrón existente en MS-AUTH (referencia):**
```typescript
// MS-AUTH también usa INTEGER/SERIAL como primary key
@PrimaryGeneratedColumn({ name: 'usuar_cod_usuar' })
id: number;  // INTEGER/SERIAL

// Y tiene UUID como campo adicional (no como primary key)
@Column({ name: 'usuar_uuid_usuar', type: 'uuid' })
uuid: string;
```

**Evidencia de migraciones MS-AUTH:**
```sql
-- Tabla rrfusuar
{
  name: 'usuar_cod_usuar',
  type: 'serial',        -- ✅ INTEGER auto-incrementado
  isPrimary: true,
},
{
  name: 'usuar_uuid_usuar',
  type: 'uuid',          -- ✅ UUID como campo adicional
  default: 'uuid_generate_v4()',
  isUnique: true,
}
```

**Análisis:**
1. **Patrón consistente en todo el proyecto:** Primary keys son `INTEGER/SERIAL`
2. **UUID como campo adicional:** Si se necesita UUID, se agrega como campo separado (no como primary key)
3. **Razón del patrón:** 
   - INTEGER es más eficiente para índices y joins
   - UUID se usa para referencias externas o APIs públicas
   - Mantiene consistencia con el esquema de base de datos existente

**Recomendación:**
- ✅ **Cambiar a INTEGER/SERIAL** para primary keys
- ✅ **Agregar UUID como campo adicional** si se requiere para referencias externas
- ✅ **Mantener consistencia** con el resto del proyecto

**Impacto:** **CRÍTICO** - afecta:
- Todas las foreign keys (deben ser INTEGER, no UUID)
- Todas las referencias en código TypeScript
- Estructura de base de datos completa
- Compatibilidad con otros módulos

**Solución propuesta:**
```sql
-- Tabla rrfprovi (CORREGIDA)
CREATE TABLE rrfprovi (
    provi_cod_provi SERIAL PRIMARY KEY,              -- ✅ INTEGER auto-incrementado
    provi_uuid_provi UUID DEFAULT uuid_generate_v4(), -- ✅ UUID adicional (opcional)
    provi_cod_prov CHAR(2) NOT NULL UNIQUE,           -- Código SEPS
    provi_nom_provi VARCHAR(100) NOT NULL,
    provi_flg_acti BOOLEAN NOT NULL DEFAULT true,
    provi_fec_creac TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_modif TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provi_fec_elimi TIMESTAMPTZ NULL
);

-- Foreign keys también serían INTEGER
CREATE TABLE rrfcanto (
    canto_cod_canto SERIAL PRIMARY KEY,              -- ✅ INTEGER
    provi_cod_provi INTEGER NOT NULL REFERENCES rrfprovi(provi_cod_provi), -- ✅ INTEGER FK
    -- ...
);
```

```typescript
// domain/entity.ts (CORREGIDO)
export interface ProvinciaEntity {
  provi_cod_provi?: number;        // ✅ INTEGER (primary key)
  provi_uuid_provi?: string;       // ✅ UUID (opcional, para referencias externas)
  provi_cod_prov: string;          // Código SEPS (CHAR(2))
  provi_nom_provi: string;
  provi_flg_acti: boolean;
  provi_fec_creac?: Date;
  provi_fec_modif?: Date;
  provi_fec_elimi?: Date | null;
}
```

---

### **2. Estructura de Use Cases**

**Especificación actual:**
```typescript
- ListProvinciasUseCase
- ListCantonesByProvinciaUseCase
- AdminCreateProvinciaUseCase
// ... múltiples clases separadas
```

**Patrón existente:**
```typescript
// Un solo UseCase que implementa el Port
export class ToficUseCase implements ToficPort {
  findAll(params: ToficParams): Promise<...>
  findById(id: number): Promise<...>
  create(data: ToficEntity): Promise<...>
  update(id: number, data: ToficEntity): Promise<...>
  delete(id: number): Promise<...>
}
```

**Recomendación:**
- Usar **un solo UseCase** que implemente `IGeoPort`
- Los métodos pueden tener nombres descriptivos pero dentro de una sola clase
- Alternativa: Si se requiere separación, usar métodos privados con nombres descriptivos

---

### **3. Nombre del Port Interface**

**Especificación actual:**
```typescript
interface IGeoPort
```

**Patrón existente:**
```typescript
interface ToficPort  // Sin prefijo "I"
```

**Recomendación:**
- Cambiar a `GeoPort` (sin prefijo "I") para consistencia
- O verificar si el proyecto usa prefijo "I" en otros lugares

---

### **4. Value Objects**

**Especificación actual:**
```typescript
// domain/value.ts: Value objects (ProvinciaValue, CantonValue, ParroquiaValue)
```

**Patrón existente:**
```typescript
// domain/value.ts: Una sola clase Value
export class ToficValue implements ToficEntity {
  constructor(data: ToficEntity, id?: number) { }
  toJson(): ToficEntity { }
}
```

**Recomendación:**
- Usar **una sola clase `GeoValue`** que maneje las tres entidades
- O crear tres clases separadas si la lógica es muy diferente
- Verificar si hay transformaciones específicas por entidad

---

### **5. Endpoint de Inactivación**

**Especificación actual:**
```typescript
PATCH /api/v1/geo/provincias/:provi_cod_provi/inactivate
```

**Patrón existente:**
```typescript
DELETE /api/v1/tofic/:id  // Soft delete (actualiza fec_elimi)
```

**Recomendación:**
- **Opción A:** Usar `DELETE` para soft delete (consistente con otros módulos)
- **Opción B:** Usar `PATCH /:id/inactivate` si se requiere diferenciar soft delete de inactivación de negocio
- **Clarificar:** ¿`fec_elimi` (soft delete) vs `flg_acti=false` (inactivación de negocio) son diferentes?

---

### **6. Estructura de Migraciones**

**Especificación actual:**
```
BACKEND/MS-CONFI/src/migrations/XXXXXX-CreateGeoCatalog.ts
```

**Hallazgo:**
- No se encontró carpeta `migrations` en MS-CONFI
- MS-CONFI usa `synchronize: true` en desarrollo (ver `orm.config.ts`)
- TypeORM migrations están deshabilitadas (`migrationsRun: false`)

**Recomendación:**
- **Opción A:** Crear migraciones SQL manuales en carpeta `database/migrations/`
- **Opción B:** Si se usa `synchronize: true`, documentar que las tablas se crean automáticamente
- **Opción C:** Habilitar migraciones TypeORM si se requiere para producción

---

### **7. Búsqueda con pg_trgm**

**Especificación actual:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_parro_nom_trgm ON rrfparro USING gin(parro_nom_parro gin_trgm_ops);
```

**Consideración:**
- PgService usa queries SQL raw, así que esto es factible
- Necesita usar `query()` o `queryList()` con SQL personalizado
- Verificar si la extensión `pg_trgm` está disponible en el servidor

**Recomendación:**
- Implementar búsqueda con `ILIKE` como fallback si `pg_trgm` no está disponible
- Documentar dependencia de extensión PostgreSQL

---

### **8. Auditoría**

**Especificación actual:**
- Menciona usar sistema de auditoría existente
- Referencia `rrfaulog` de MS-AUTH

**Hallazgo:**
- No se encontró sistema de auditoría en MS-CONFI
- MS-AUTH tiene `AuditRepository` pero es específico para autenticación
- No hay tabla `rrfaudit` genérica encontrada

**Recomendación:**
- **Opción A:** Crear servicio de auditoría mínimo en MS-CONFI (tabla `rrfaudit` genérica)
- **Opción B:** Usar logging de Winston (ya existe `LoggerService`) para auditoría
- **Opción C:** Postergar auditoría si no es crítica para MVP
- **Documentar** la decisión tomada

---

### **9. Path de API**

**Especificación actual:**
```
GET /api/v1/geo/provincias
```

**Verificación necesaria:**
- Verificar el prefijo real de API en MS-CONFI
- Puede ser `/api/v1/` o solo `/` dependiendo de configuración

**Recomendación:**
- Verificar en `main.ts` o configuración de Swagger el prefijo real
- Ajustar paths según configuración existente

---

### **10. Lookup por Códigos SEPS**

**Especificación actual:**
```
GET /api/v1/geo/provincias/:provi_cod_prov/cantones
```

**Consideración:**
- Los endpoints usan códigos SEPS (CHAR(2)) en lugar de UUID/ID
- Esto es correcto para UX pero requiere queries por código en lugar de ID

**Recomendación:**
- Implementar métodos en repositorio que busquen por código SEPS
- Asegurar que los índices soporten búsquedas por código eficientemente

---

## 📝 **Información Faltante**

### **1. Validaciones de Negocio**

**Faltante:**
- Validación de formato de códigos SEPS (¿solo números? ¿con ceros?)
- Validación de nombres (¿máximo de caracteres? ¿caracteres especiales?)
- Validación de tipo de área (R/U) en parroquias

**Recomendación:**
- Agregar sección de validaciones con reglas específicas
- Incluir ejemplos de códigos válidos/inválidos

---

### **2. Manejo de Errores**

**Faltante:**
- Códigos de error HTTP específicos
- Mensajes de error en español
- Manejo de constraint violations (unicidad)

**Recomendación:**
- Documentar códigos de error esperados (400, 404, 409, 500)
- Incluir mensajes de error en español para cada caso

---

### **3. Paginación**

**Faltante:**
- ¿Los endpoints de lista soportan paginación?
- ¿Qué parámetros de paginación usar? (page, pageSize, all)

**Recomendación:**
- Revisar patrón de paginación en módulos existentes (usar `ParamsInterface`)
- Documentar parámetros de paginación en endpoints

---

### **4. Control de Acceso (Guards)**

**Faltante:**
- ¿Cómo se implementa el guard de ADMIN?
- ¿Existe un decorador `@Roles('ADMIN')` o similar?
- ¿Dónde se valida el rol del usuario?

**Recomendación:**
- Verificar si existe guard de roles en MS-CONFI
- Documentar cómo se implementa el control de acceso
- Si no existe, crear guard básico o usar middleware

---

### **5. Context NATS**

**Especificación actual:**
```
interface/context/context.ts (opcional, solo si es estándar en MS-CONFI)
```

**Hallazgo:**
- Los módulos existentes (tofic, perfi, opcio) **SÍ tienen** `context.ts` para NATS
- No es opcional, es estándar

**Recomendación:**
- **Incluir** `context.ts` como requerido
- Seguir el patrón de los módulos existentes

---

## 🔧 **Recomendaciones de Implementación**

### **1. Priorizar Verificaciones**

Antes de implementar, verificar:
1. ✅ Tipo de primary key usado en MS-CONFI (UUID vs INTEGER)
2. ✅ Estructura exacta de UseCase (uno vs múltiples)
3. ✅ Existencia de sistema de auditoría
4. ✅ Prefijo de API real
5. ✅ Guards de roles disponibles

### **2. Ajustes Sugeridos**

```typescript
// domain/port.ts - Ajustar nombre
export interface GeoPort {  // Sin "I"
  findAllProvincias(active?: boolean): Promise<ProvinciaEntity[]>;
  // ...
}

// application/usecase.ts - Un solo UseCase
export class GeoUseCase implements GeoPort {
  constructor(private readonly repository: GeoPort) {}
  // Implementar todos los métodos del port
}

// domain/value.ts - Una clase o tres según necesidad
export class GeoValue {
  // O: ProvinciaValue, CantonValue, ParroquiaValue separadas
}
```

### **3. Migraciones**

Si no hay sistema de migraciones:
- Crear scripts SQL manuales en `database/migrations/`
- Incluir script de rollback
- Documentar proceso de ejecución

### **4. Auditoría**

Si no existe sistema de auditoría:
- Crear tabla `rrfaudit` genérica
- Crear servicio `AuditService` mínimo
- O usar logging de Winston con formato estructurado

---

## ✅ **Checklist de Verificación Pre-Implementación**

- [ ] Verificar tipo de primary key (UUID vs INTEGER) en MS-CONFI
- [ ] Revisar estructura de UseCase en módulos existentes
- [ ] Confirmar existencia de sistema de auditoría
- [ ] Verificar prefijo de API en configuración
- [ ] Revisar guards de roles disponibles
- [ ] Confirmar estructura de Context NATS (requerido, no opcional)
- [ ] Verificar disponibilidad de extensión `pg_trgm` en PostgreSQL
- [ ] Revisar patrón de paginación en módulos existentes
- [ ] Confirmar nomenclatura de Port (con/sin prefijo "I")

---

## 📌 **Resumen de Cambios Sugeridos**

1. **Críticos:**
   - Verificar tipo de primary key
   - Ajustar estructura de UseCase a patrón existente
   - Incluir Context NATS como requerido

2. **Importantes:**
   - Clarificar sistema de auditoría
   - Ajustar nombre de Port interface
   - Documentar validaciones de negocio

3. **Menores:**
   - Verificar prefijo de API
   - Documentar manejo de errores
   - Aclarar paginación

---

**Fecha de revisión:** 2025-01  
**Revisado por:** AI Assistant  
**Estado:** Pendiente de ajustes antes de implementación

