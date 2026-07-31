# Data Model — Infraestructura, Configuración por Ambiente y CI/CD

**Feature**: `004-infraestructura-config-cicd` | **Date**: 2026-07-28

No hay entidades de datos de negocio. El "modelo" es la **matriz de ambientes** y el **inventario de variables de entorno** que gobiernan la configuración.

## Matriz de ambientes

| Perfil Spring | Ambiente CCB | Activación | Log | Health detail | Dynatrace |
|---|---|---|---|---|---|
| _(default)_ `local` | Local (Docker Compose) | Manual del desarrollador | DEBUG | always | No |
| `dev` | DEV | Pipeline (auto en `develop`) | DEBUG | always | No |
| `qas` | QAS | Pipeline (auto tras DEV) | INFO | when-authorized | No |
| `stg` | STG | Pipeline (manual, 1 aprobador) | INFO | never | Sí |
| `prd` | PRD | Pipeline (manual, 2 aprobadores) | WARN | never | Sí |

## Puertos

| Servicio | Puerto |
|---|---|
| solicitudes | 8081 |
| descargas | 8082 |
| verificacion | 8083 |
| SQL Server | 1433 |
| Redis | 6379 |

## Inventario de variables de entorno

| Variable | Ámbito | Notas |
|---|---|---|
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Secreto | SQL Server; `DB_PASSWORD` nunca en claro |
| `REDIS_HOST`, `REDIS_PORT` | Config | `REDIS_PORT` default 6379 |
| `PUP_WSDL_URL`, `PUP_TIMEOUT_MS` | Config | timeout default 10000 |
| `TIENDA_WSDL_URL`, `TIENDA_TIMEOUT_MS` | Config | timeout default 8000 |
| `SHD_WSDL_URL`, `SHD_TIMEOUT_MS` | Config | timeout default 8000 |
| `INSCRITOS_REST_URL` | Config | REST inscritos |
| `MAUC_LOGIN_URL`, `MAUC_SIGNOUT_URL` | Config | login de afiliados (no protege endpoints) |
| `AWS_ENCRYPT_URL` | Config | Lambda encripción `solicitudId` |
| `COGNITO_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_ISSUER_URI`, `COGNITO_JWK_SET_URI`, `COGNITO_CLIENT_ID`, `COGNITO_SCOPES` | Secreto/Config | Resource Server (consumido por `shared-auth`, 002) |
| `S3_BUCKET`, `S3_REGION` | Config | `S3_REGION` default us-east-1 |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Secreto | Credenciales AWS (incluye login a ECR) |
| `AWS_REGION` | Config | Región AWS (ECR, S3) |
| `DYNATRACE_API_TOKEN`, `DYNATRACE_ENVIRONMENT_URL` | Secreto | Observabilidad (stg/prd) |
| `ECR_REGISTRY` | Config | Registro de contenedores Amazon ECR (`<acct>.dkr.ecr.<region>.amazonaws.com`) |

## Invariantes

- **INV-1**: Ningún valor de la columna "Secreto" aparece en texto claro en archivos versionados.
- **INV-2**: Cada perfil apunta inequívocamente a su ambiente (verificable en logs de arranque).
- **INV-3**: El `.env.example` lista todas las variables anteriores sin valores reales.
- **INV-4**: Los servicios arrancan en perfil `local` sin BD activa (datasource diferido, D1).
