---
name: cicd-pipeline
description: "Genera la automatización del pipeline de CI/CD usando la plataforma, runtime e IaC Engine declarados en docs/00_stack_manifest.md (OIDC sin llaves estáticas obligatorio) para linters, auditoría SAST, TDD, validación de contrato y aprovisionamiento declarativo de infraestructura."
version: "3.7.0"
category: "04_governance_and_quality"
inputs:
  - "docs/04_governance_and_quality/08_security_strategy.md"
  - "docs/04_governance_and_quality/09_testing_strategy.md"
outputs:
  - ".github/workflows/ci.yml"
  - "docs/04_governance_and_quality/10_cicd_pipeline.md"
---

# ⚙️ SK-10: Pipeline de CI/CD, DevSecOps y OpenTofu IaC (v3.7.0)

Actúa como un **Principal DevOps Engineer** y **DevSecOps Architect** experto en pipelines de Integración Continua declarativos multi-plataforma (GitHub Actions, GitLab CI, CircleCI...), runtimes modernos, IaC declarativo (OpenTofu, Pulumi, CDK...) y Docker, aplicando siempre la plataforma, runtime e IaC Engine exactos que `docs/00_stack_manifest.md` declare para este proyecto, bajo los **Guards 22, 23, 30 y 31** de `AGENTS.md`.

Tu objetivo es analizar las Estrategias de Seguridad (`08_security_strategy.md`), Pruebas (`09_testing_strategy.md`) y la sección "DevSecOps & Infraestructura" de `docs/00_stack_manifest.md` para:
1. Generar el workflow ejecutable de CI en la sintaxis de la plataforma declarada (ej. `.github/workflows/ci.yml` si es GitHub Actions), con OIDC y sin llaves estáticas.
2. Generar el módulo declarativo de infraestructura en la sintaxis del IaC Engine declarado.
3. Documentar la arquitectura CI/CD en `docs/04_governance_and_quality/10_cicd_pipeline.md`.

> **Nota de referencia:** los Jobs 0-4 abajo son la implementación de referencia para la combinación GitHub Actions + OpenTofu + pnpm (la más usada por proyectos gobernados por `.agents/` hasta la fecha). Si `docs/00_stack_manifest.md` declara una plataforma o gestor de paquetes distinto, adapta la sintaxis concreta de cada Job a esa plataforma manteniendo exactamente la misma secuencia de 5 Jobs y las mismas guardas de seguridad (OIDC, sin credenciales estáticas, sin merges con tests en rojo).

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No exponer secretos ni tokens en el YAML del workflow:** Prohibido hardcodear contraseñas de BD o API Keys en `ci.yml`; referenciar exclusivamente `${{ secrets.YOUR_KEY }}`. **Mandatorio OIDC** (Guard 23).
2. **No omitir auditorías de seguridad ni linters:** Prohibido omitir `pnpm run lint` o `pnpm audit` para acelerar el pipeline.
3. **No permitir merges automáticos con tests en rojo:** El workflow debe fallar de forma estricta ante cualquier desalineación de TypeScript, error de linting o falla en los unit/integration tests.
4. **No usar Node.js < 24 LTS:** Prohibido configurar `node-version` con versiones anteriores a `lts/*` equivalente a Node 24 (Guard 23).
5. **No almacenar credenciales cloud estáticas:** Prohibido usar `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` en secrets de GitHub Actions; mandatorio el uso de **OIDC con tokens efímeros** (Guard 23).
6. **No aprovisionar infraestructura con scripts manuales:** Prohibido crear recursos cloud con `aws cli`, `gcloud` o scripts shell sin estado; mandatorio el uso de **módulos declarativos OpenTofu** en `infrastructure/opentofu/` (Guard 22).
7. **No cerrar el Skill con Dockerfiles/IaC sin hardening (Guard 25, TK-042):** Antes de reportar Job 4 como completo, ejecuta `bash docs/04_governance_and_quality/scripts/check_container_security.sh` sobre cualquier `Dockerfile`/`docker-compose.yml`/módulo `.tf` que este Skill haya creado o modificado — runtime pineado a la versión declarada en `docs/00_stack_manifest.md` §1, usuario no-root, y cero secretos hardcodeados. Si falla, corrige antes de presentar el resultado como terminado.
8. **No pinear una referencia de terceros sin verificar que resuelve (Guard 30, TK-064):** Antes de escribir en el YAML/HCL cualquier `uses: owner/repo@ref` de action, versión de provider IaC, o tag de imagen base, verifica contra la fuente real (API pública de tags/releases de la plataforma, o un dry-run local real como `tofu init`) que esa referencia existe — nunca asumas que una cadena de versión con aspecto plausible es válida. Si el pin es un action compuesto que a su vez depende de OTRA referencia de terceros, esa referencia anidada también debe verificarse cuando investigues un fallo de resolución.
9. **No asumir generación implícita de artefactos de build (Guard 31, TK-064):** Si el proyecto usa una herramienta que genera artefactos requeridos por el build (cliente de ORM, codegen de GraphQL, stubs de protobuf/gRPC), el Job 1 (o el paso más temprano que lo necesite) DEBE incluir un step explícito que ejecute esa generación — nunca asumir que corre sola vía un hook de ciclo de vida del gestor de paquetes (`postinstall` u equivalente). Verifica el comportamiento real corriendo la instalación en un checkout limpio antes de omitir este step, especialmente después de un upgrade de versión mayor de esa herramienta (Guard 31): el comportamiento de auto-generación puede desaparecer entre versiones mayores sin aviso.

---

## 🔄 Pipeline de Ejecución Secuencial en 5 Jobs (GitHub Actions Workflow)

### 📍 Job 0: Governance Gate (1 min) ← Guard 22 & 23
- Checkout de código con `actions/checkout@v5`.
- Verificar integridad del arnés `.agents` con `bash .agents/scripts/validate_agents.sh`.
- Verificar drift de contrato con `bash docs/04_governance_and_quality/scripts/check_contract_drift.sh`.
- Validar especificación DESIGN.md con `npx -y @google/design.md lint DESIGN.md` (si existe).
- **Cobertura DevSecOps (Guard 25, informativo):** `bash docs/04_governance_and_quality/scripts/check_devsecops_manifest_coverage.sh` — verifica que toda herramienta declarada en `docs/00_stack_manifest.md` §6 esté efectivamente wireada como step en este mismo pipeline. Este propio Skill DEBE releer su salida antes de darse por terminado: una brecha reportada aquí significa que el Job 2 de abajo quedó incompleto.

### 📍 Job 1: Lint & Static Analysis (2 min)
- Setup de **Node 24 LTS** (`node-version: 'lts/*'`) con cache de **pnpm 9** (`cache: 'pnpm'`).
- **Generación de artefactos de build ANTES de lint/test (Guard 31, TK-064):** si el stack declarado en `docs/00_stack_manifest.md` usa una herramienta de codegen (ORM, GraphQL, protobuf/gRPC), ejecuta aquí su comando de generación explícito (ej. `<orm-cli> generate`) — nunca asumas que `pnpm install` la dispara sola. Verifica esto en un checkout limpio real, no por documentación previa de la herramienta: su comportamiento puede cambiar entre versiones mayores sin aviso.
- Ejecución de `pnpm run lint` y `npx tsc --noEmit` para verificar tipado estricto.
- Validar especificación OpenAPI con `npx @stoplight/spectral-cli lint docs/03_persistence_and_api/openapi.yaml` (si existe).

### 📍 Job 2: Security & Dependency Audit (2 min)
- Ejecución de escaneo de vulnerabilidades `pnpm audit --audit-level=high`.
- Verificación de secretos mediante `gitleaks` o escaneo estático SAST.
- Escaneo de imagen Docker con `trivy image` para CVEs de dependencias en contenedores.

### 📍 Job 3: Unit & Integration Test Suite (3-5 min)
- Aprovisionamiento de base de datos Postgres 15 efímera mediante Docker Service Container en GitHub Actions.
- **Recordatorio (Guard 31):** este Job corre en un runner separado con su propio checkout/`pnpm install` limpio — si el Job 1 necesitó un step explícito de generación de artefactos de build, este Job TAMBIÉN lo necesita, no se hereda entre Jobs.
- Aplicación de migraciones de base de datos (`npx prisma migrate deploy` o equivalentes).
- Ejecución de la suite de pruebas unitarias y de integración `pnpm test`.

### 📍 Job 4: Build & IaC Provisioning (3 min) ← Guard 22 & 23
- Compilación del bundle de producción `pnpm run build`.
- Autenticación en proveedor cloud mediante **OpenID Connect (OIDC)** — sin `AWS_SECRET_ACCESS_KEY` ni llaves estáticas.
- Validación de módulos IaC: `tofu validate && tofu plan` en `infrastructure/opentofu/` (modo dry-run en PRs, `tofu apply` solo en `main`).
- **Migraciones automáticas en el arranque del contenedor (TK-043):** la imagen de producción del backend NUNCA debe arrancar el servidor directamente como `CMD`; debe usar un script `docker-entrypoint.sh` que primero aplique las migraciones pendientes del ORM declarado (ej. `prisma migrate deploy --schema=...`) y solo luego haga `exec` del proceso servidor — así el propio arranque falla rápido (Fail-Fast) si las migraciones no aplican, en vez de servir tráfico contra un esquema desactualizado.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/04_governance_and_quality/10_cicd_pipeline.md` debe incluir la cabecera:

```markdown
---
document: cicd_pipeline
version: 1.2.0
status: approved
inputs:
  - docs/04_governance_and_quality/08_security_strategy.md
  - docs/04_governance_and_quality/09_testing_strategy.md
outputs:
  - .github/workflows/ci.yml
  - docs/04_governance_and_quality/10_cicd_pipeline.md
---

# ⚙️ Especificación de Pipeline CI/CD y Automatización DevSecOps

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Estrategia de Pruebas (09_testing_strategy.md)](./09_testing_strategy.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Planificación Ágil (05_agile_planning/11_user_stories.md) ➡️](../05_agile_planning/11_user_stories.md)

---
```
