# Contract — Pipeline CI/CD (Azure DevOps)

**Feature**: `004-infraestructura-config-cicd`

## Disparadores

- CI en cada PR y push a `develop`/`main`.

## Etapas CI

| Etapa | Acción | Gate |
|---|---|---|
| Compilar | `./gradlew compileJava compileTestJava` | — |
| Tests + cobertura | `./gradlew test` + JaCoCo | Falla si cobertura < 80% en `*-domain`/`*-application` |
| Tests de integración | `./gradlew integrationTest` | — |
| Seguridad | OWASP Dependency-Check | Falla si vulnerabilidad **Critical** |
| Imágenes | build + push a Amazon ECR | Login `aws ecr get-login-password`; tags `{servicio}:{SHA}` y `{rama}-latest` |

## Etapas CD

| Ambiente | Rama | Activación | Aprobación | Post-deploy |
|---|---|---|---|---|
| DEV | `develop` | Automático | — | smoke `/health`; rollback si falla |
| QAS | `develop` | Auto tras DEV | — | smoke; rollback si falla |
| STG | `main` | Manual | 1 aprobador | smoke extendido; rollback si falla |
| PRD | `main` | Manual | 2 aprobadores | smoke health; rollback |

## Reglas

- El pipeline es la **única** vía de build/deploy.
- Ningún secreto en el YAML: se usan 4 Variable Groups (`vg-dev`/`vg-qas`/`vg-stg`/`vg-prd`).
- Ramas protegidas: `develop` (PR + CI verde + 1 revisor); `main` (PR + CI verde + 2 revisores + merge desde `develop`).
- Zero-downtime: rolling, una instancia a la vez.
- CI completo en **< 15 minutos**.
- La creación de Variable Groups y Environments se realiza en Azure DevOps (fuera del repositorio).
- Las notificaciones (Teams/email) y otras tareas específicas de la entidad las añade el equipo DevOps de la CCB sobre el pipeline base (fuera del alcance del repositorio).
