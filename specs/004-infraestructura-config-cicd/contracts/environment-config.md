# Contract — Configuración por Ambiente

**Feature**: `004-infraestructura-config-cicd`

## `application.yml` base (forma)

- Todos los valores sensibles como `${VARIABLE}` **sin** valor por defecto sensible.
- Secciones: `spring.datasource` (placeholder, autoconfig diferida), `spring.data.redis`, `integrations.*` (URLs + timeouts), `security.cognito.*` (consumido por `shared-auth`), `aws.s3.*`.
- `management`: health con grupos liveness/readiness (del andamiaje).

## Perfiles (solo sobrescriben lo variable)

| Perfil | Log `co.org.ccb` | Health details | Dynatrace |
|---|---|---|---|
| `dev` | DEBUG | always | No |
| `qas` | INFO | when-authorized | No |
| `stg` | INFO | never | Sí |
| `prd` | WARN | never | Sí |

## Criterios

- Cada servicio arranca en perfil `local` solo con el `.env` (Docker Compose).
- Cada perfil apunta inequívocamente a los servicios de su ambiente (URLs en logs de arranque).
- `prd`: log `WARN` y health **sin** detalles.
- `grep` de `password|secret|token` en `src/main/resources/` no retorna valores hardcodeados.
- Timeouts de integraciones externalizados por variable con defaults documentados.
