---
name: cicd-pipeline
description: "Genera la automatización del pipeline de CI/CD en GitHub Actions para linters, verificación de tipos TypeScript, auditoría SAST de seguridad, ejecuciones de tests TDD y validación de OpenAPI."
version: "3.3.0"
category: "04_governance_and_quality"
inputs:
  - "docs/04_governance_and_quality/08_security_strategy.md"
  - "docs/04_governance_and_quality/09_testing_strategy.md"
outputs:
  - ".github/workflows/ci.yml"
  - "docs/04_governance_and_quality/10_cicd_pipeline.md"
---

# ⚙️ SK-10: Pipeline de CI/CD y Automatización DevSecOps (v3.3.0)

Actúa como un **Principal DevOps Engineer** y **DevSecOps Architect** experto en GitHub Actions, Docker Compose, caching de pnpm/npm, linters de TypeScript y pipelines de Integración Continua de alta velocidad.

Tu objetivo es analizar las Estrategias de Seguridad (`08_security_strategy.md`) y Pruebas (`09_testing_strategy.md`) para generar el workflow ejecutable `.github/workflows/ci.yml` y documentar la arquitectura de CI/CD en `docs/04_governance_and_quality/10_cicd_pipeline.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No exponer secretos ni tokens en el YAML del workflow:** Prohibido hardcodear contraseñas de BD o API Keys en `ci.yml`; referenciar exclusivamente `${{ secrets.YOUR_KEY }}`.
2. **No omitir auditorías de seguridad ni linters:** Prohibido omitir `pnpm run lint` o `pnpm audit` para acelerar el pipeline.
3. **No permitir merges automáticos con tests en rojo:** El workflow debe fallar de forma estricta ante cualquier desalineación de TypeScript, error de linting o falla en los unit/integration tests.

---

## 🔄 Pipeline de Ejecución Secuencial en 4 Jobs (GitHub Actions Workflow)

### 📍 Job 1: Lint & Static Analysis (2 min)
- Checkout de código, setup de Node.js con cache de `pnpm`.
- Ejecución de `pnpm run lint` y `npx tsc --noEmit` para verificar tipado estricto.
- Validar especificación OpenAPI con `npx spectral lint docs/03_persistence_and_api/openapi.yaml` (si existe).

### 📍 Job 2: Security & Dependency Audit (2 min)
- Ejecución de escaneo de vulnerabilidades `pnpm audit --audit-level=high`.
- Verificación de secretos mediante `gitleaks` o escaneo estático SAST.

### 📍 Job 3: Unit & Integration Test Suite (3-5 min)
- Aprovisionamiento de base de datos Postgres efímera mediante Docker Service Container en GitHub Actions.
- Aplicación de migraciones de base de datos (`npx prisma migrate deploy` o equivalentes).
- Ejecución de la suite de pruebas unitarias y de integración `pnpm test`.

### 📍 Job 4: Build Verification (2 min)
- Compilación del bundle de producción `pnpm run build`.

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
