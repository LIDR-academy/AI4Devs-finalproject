# Informe de verificación — Paso 6 · T-01-04 `.env.example`

**Change:** `t-01-04-env-example`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-01-04-env-example`  
**Estado:** PASS

## Resumen

Plantilla `.env.example` creada en la raíz con las 8 variables documentadas, alineada con `docker-compose.yml`. Documentación actualizada (`README.md`, `docs/development_guide.md`, `docs/infrastructure.md`). `.gitignore` cumple el DoD sin cambios.

## 6.1 Lint

| Comando | Resultado |
| ------- | --------- |
| `npm run lint` | Exit code 0 (~144s) |

## 6.2 Contenido de `.env.example`

Verificación con `Select-String`:

| Variable | Presente |
| -------- | -------- |
| `DATABASE_URL` | Sí |
| `API_PORT` | Sí |
| `CORS_ORIGIN` | Sí |
| `POSTGRES_USER` | Sí |
| `POSTGRES_PASSWORD` | Sí |
| `POSTGRES_DB` | Sí |
| `POSTGRES_PORT` | Sí |
| `NODE_ENV` | Sí |

Cada clave tiene comentario `#` en la línea anterior. Valores coherentes con default `conrutina` de `docker-compose.yml`.

## 2.3–2.4 Gitignore

| Comando | Resultado |
| ------- | --------- |
| `git check-ignore -v .env` | `.gitignore:18:.env` — ignorado ✓ |
| `git check-ignore -v .env.example` | Coincide regla `!.env.example` (excepción); `git add -n .env.example` → trackable ✓ |

## 6.3–6.4 Arranque con `.env` copiado

| Verificación | Resultado |
| ------------ | --------- |
| `copy .env.example .env` | OK (temporal, no commiteado) |
| PostgreSQL disponible | `conrutina-postgres` Up (healthy) |
| `npm run dev:api` | Carga env OK — `[API] PostgreSQL → base de datos: conrutina`; puerto 3001 ocupado por instancia previa (sin error de variables faltantes) |

## 6.6 Vite

| Comando | Resultado |
| ------- | --------- |
| `npm run dev:web` | Vite v6.4.2 ready (puerto 5175; 5173/5174 ocupados) — no depende de `.env` ✓ |

## 6.7 Limpieza

| Verificación | Resultado |
| ------------ | --------- |
| `.env` local eliminado tras prueba | Sí |
| `.env` en `git status` | No aparece (ignorado) |

## 5. Tests unitarios

**N/A — ticket de documentación/infra.** No hay tests que validen ficheros de configuración o variables de entorno.

## 7. Pruebas curl

**Paso curl N/A — T-01-04 no altera la API.**

## 8. Pruebas E2E

**Paso E2E N/A — T-01-04 solo afecta plantilla de entorno y documentación.**

## 9. Documentación

| Fichero | Estado |
| ------- | ------ |
| `README.md` | Instalación: `cp .env.example .env`; advertencia de ausencia eliminada; Configuración referencia plantilla |
| `docs/development_guide.md` | §2 alineado con `.env.example`; credenciales `conrutina` unificadas |
| `docs/infrastructure.md` | §7 y §12: referencia a `.env.example`; defaults `conrutina` / volumen `conrutina_postgres_data` |

## Cambios implementados

- `.env.example` (nuevo)
- `README.md`
- `docs/development_guide.md`
- `docs/infrastructure.md`

## Pendiente (cierre Git / archive)

Pasos 10.x (commit, push, merge, archive) se ejecutan solo con `/opsx:archive` tras aceptación del usuario.
