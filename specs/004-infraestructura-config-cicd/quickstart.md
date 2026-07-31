# Quickstart — Validación de Infraestructura, Config y CI/CD

**Feature**: `004-infraestructura-config-cicd` | **Date**: 2026-07-28

Guía de validación. No contiene código de implementación.

## Prerrequisitos

- Andamiaje `001` compilando; JDK 25; **Docker + Docker Compose** (para escenarios 1-2).
- Un archivo `.env` local basado en `.env.example` (valores de desarrollo).
- Azure DevOps/Amazon ECR NO se requieren para la validación local (escenarios 5-6 son estructurales).

## Escenario 1 — Entorno local arranca (valida US1, SC-001)

```bash
docker compose -f deploy/docker/docker-compose.yml up -d
curl http://localhost:8081/health   # 200
curl http://localhost:8082/health   # 200
curl http://localhost:8083/health   # 200
```

**Esperado**: 3 servicios + SQL Server + Redis arriba; health 200 en < 3 min.

## Escenario 2 — Arranque por perfil (valida US2, SC-003)

```bash
# ejemplo: perfil dev
SPRING_PROFILES_ACTIVE=dev ./gradlew :verificacion:verificacion-api:bootRun
```

**Esperado**: arranca sin propiedades faltantes; los logs muestran las URLs del ambiente; `prd` no expone detalles en `/health`.

## Escenario 3 — Sin secretos en texto claro (valida SC-002)

- Buscar `password|secret|token` en `**/src/main/resources/` y en los archivos de `deploy/`.

**Esperado**: sin valores hardcodeados; todo por `${ENV}` / Variable Groups; `.env.example` sin valores reales.

## Escenario 4 — Gate de cobertura (valida SC-006)

```bash
./gradlew build   # incluye jacoco + verificación
```

**Esperado**: `BUILD SUCCESSFUL`; una cobertura < 80% en `*-domain`/`*-application` haría fallar el build.

## Escenario 5 — Estructura del pipeline (valida US3, SC-004/005/007)

- Revisar `azure-pipelines.yml` + `deploy/azure-devops/templates/`.

**Esperado**: etapas CI (compilar, test+cobertura, integración, OWASP, imágenes) y CD (DEV/QAS auto, STG/PRD con aprobación); sin secretos en YAML; gates de cobertura y seguridad; rollback y zero-downtime declarados. (Ejecución real en Azure DevOps.)

## Escenario 6 — Despliegue y rollback (valida SC-008) — plataforma

- En Azure DevOps: forzar un smoke test fallido post-deploy en un ambiente de prueba.

**Esperado**: rollback automático a la versión previa. (Validable solo en la plataforma.)

## Referencias

- [contracts/local-environment.md](./contracts/local-environment.md)
- [contracts/environment-config.md](./contracts/environment-config.md)
- [contracts/cicd-pipeline.md](./contracts/cicd-pipeline.md)
- [data-model.md](./data-model.md) · [research.md](./research.md)
