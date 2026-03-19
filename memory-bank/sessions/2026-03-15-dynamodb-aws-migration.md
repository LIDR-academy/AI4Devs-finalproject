# Sesión 2026-03-15 — Migración DynamoDB Local → AWS (Dev + Prod)

**Estado**: ✅ Completado  
**Tipo**: Infraestructura / Seguridad  
**Duración estimada**: ~2h  
**Change asociado**: Sin change OpenSpec (tarea de infraestructura pura)

---

## Objetivo de la Sesión

Migrar la base de datos DynamoDB de local (Docker `amazon/dynamodb-local`) a AWS real, configurando dos entornos (Dev en eu-west-1, Prod en eu-central-1) con seguridad IAM de mínimo privilegio y sin romper el entorno local existente.

---

## Trabajo Realizado

### 1. Análisis del repositorio

- Tabla local: `adresles-messages` (PK: `conversationId`, SK: `messageId`, TTL: `expiresAt`)
- Dos clientes DynamoDB independientes: `apps/worker/src/dynamodb/dynamodb.service.ts` y `apps/api/src/mock/mock-conversations.service.ts`
- Mecanismo de distinción ya implementado: `DYNAMODB_ENDPOINT` definido → Local; no definido → AWS
- `TABLE_NAME` estaba hardcodeado como `'adresles-messages'` en ambos ficheros

### 2. IAM — Políticas y Usuarios con Mínimo Privilegio

Creados con AWS CLI (`--profile adresles-dev`, usuario `Cursor-Deployer`):

| Recurso | Detalle |
|---------|---------|
| `AdreslesAppDevDynamoDB` (Policy) | `PutItem`, `GetItem`, `Query`, `UpdateItem` sobre `adresles-messages-dev` en eu-west-1 |
| `AdreslesAppProdDynamoDB` (Policy) | `PutItem`, `GetItem`, `Query`, `UpdateItem` sobre `adresles-messages-prod` en eu-central-1 |
| `adresles-app-dev` (IAM User) | Tags: `Project=adresles`, `Environment=dev` |
| `adresles-app-prod` (IAM User) | Tags: `Project=adresles`, `Environment=prod` |

Las políticas están versionadas en `infrastructure/iam/`.

### 3. Tablas DynamoDB en AWS

| Tabla | Región | BillingMode | TTL |
|-------|--------|-------------|-----|
| `adresles-messages-dev` | eu-west-1 | PAY_PER_REQUEST | `expiresAt` ENABLED |
| `adresles-messages-prod` | eu-central-1 | PAY_PER_REQUEST | `expiresAt` ENABLED |

Schema idéntico al local: PK `conversationId` (HASH), SK `messageId` (RANGE).

### 4. Cambios en el código

**Dos ficheros** (mismo cambio):

```typescript
// Antes
const TABLE_NAME = 'adresles-messages';

// Después
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'adresles-messages';
```

**Tres archivos `.env`** en la raíz del monorepo:
- `.env` — DynamoDB Local (sin cambios, retrocompatible)
- `.env.dev` — AWS Dev (credenciales `adresles-app-dev`, región eu-west-1, tabla `-dev`)
- `.env.prod` — AWS Prod (credenciales `adresles-app-prod`, región eu-central-1, tabla `-prod`)

### 5. Script de validación

Nuevo `infrastructure/scripts/validate-dynamodb-aws.ts`:
- Escribe un ítem de prueba y lo lee con `Query`
- Acepta el archivo `.env` como argumento (compatible con Windows PowerShell)
- Dos comandos en `package.json`: `pnpm dynamo:validate:dev` y `pnpm dynamo:validate:prod`

### 6. Validación exitosa

```
[DynamoDB Validate] Tabla: adresles-messages-dev
[DynamoDB Validate] Región: eu-west-1
[DynamoDB Validate] Endpoint: (AWS real)
[DynamoDB Validate] Escritura OK
[DynamoDB Validate] Lectura OK
[DynamoDB Validate] ✓ Conexión a AWS DynamoDB validada correctamente.

[DynamoDB Validate] Tabla: adresles-messages-prod
[DynamoDB Validate] Región: eu-central-1
[DynamoDB Validate] Endpoint: (AWS real)
[DynamoDB Validate] Escritura OK
[DynamoDB Validate] Lectura OK
[DynamoDB Validate] ✓ Conexión a AWS DynamoDB validada correctamente.
```

### 7. Documentación actualizada

- `readme.md` — Secciones de variables de entorno, instalación, servicios externos y modelo de datos
- `memory-bank/architecture/002-supabase-dynamodb.md` — Nota de revisión con esquema real
- `memory-bank/architecture/010-dynamodb-aws-multienv.md` — ADR nuevo (esta decisión)
- `memory-bank/README.md` — Actualizado con ADR-010 y esta sesión

---

## Aprendizajes

### Sobre AWS CLI en Windows (PowerShell)

Los comandos AWS CLI con muchos parámetros (`--tags Key=X,Value=Y Key=Z,Value=W`) pueden fallar en PowerShell por longitud o interpretación de caracteres. Solución: separar comandos largos en llamadas independientes.

### Sobre IAM y el usuario `Cursor-Deployer`

El usuario de infraestructura (`Cursor-Deployer`) no tenía permisos IAM por defecto. Fue necesario adjuntarle `IAMFullAccess` temporalmente para crear las políticas y usuarios, y retirárselo después. Principio: el usuario de despliegue de infraestructura y el usuario de aplicación son roles distintos.

### Sobre la distinción local/AWS en el código

El patrón `DYNAMODB_ENDPOINT` presente/ausente ya era correcto. El único gap era el `TABLE_NAME` hardcodeado. Con `DYNAMODB_TABLE_NAME` como variable de entorno, el mismo código sirve para los tres entornos sin lógica condicional.

### Sobre `dotenv` con `ts-node` en Windows

El patrón `node -r dotenv/config script.ts dotenv_config_path=.env.X` no funciona bien en Windows para cargar archivos `.env` alternativos. La solución robusta es cargar `dotenv` explícitamente dentro del script con `dotenv.config({ path: resolve(cwd, envFile) })` y pasar el archivo como argumento.

---

## Deuda Técnica Identificada

| Deuda | Severidad | Acción futura |
|-------|-----------|---------------|
| Access Keys estáticas en `.env.dev`/`.env.prod` | Media | Migrar a IAM Roles de instancia al usar EC2/ECS |
| Ítems de prueba dejados por `validate-dynamodb-aws.ts` | Baja | Se borran por TTL (90 días); añadir limpieza explícita opcional |
| `Cursor-Deployer` recibió `IAMFullAccess` temporalmente | Resuelto | Se retiró inmediatamente tras crear los recursos |

---

## Estado Final

- ✅ Tablas AWS creadas y activas
- ✅ IAM con mínimo privilegio configurado
- ✅ Entornos Dev y Prod completamente aislados
- ✅ DynamoDB Local sigue funcionando sin cambios
- ✅ Validación end-to-end pasando en ambos entornos
- ✅ Documentación actualizada (README, ADRs, readme.md del proyecto)
