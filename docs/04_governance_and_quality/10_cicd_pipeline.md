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
> [⬅️ Volver a Estrategia de Pruebas (09_testing_strategy.md)](./09_testing_strategy.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Planificación Ágil (05_agile_planning/11_user_stories.md) ➡️](../05_agile_planning/11_user_stories.md)

---

## 📊 1. Resumen de Automatización del Pipeline

El pipeline de Integración Continua y Despliegue Continuo (CI/CD) automatiza la verificación de calidad, seguridad y pruebas ante cada evento de Pull Request hacia la rama `main`.

| Job | Herramienta | Tiempo Obj. | Criterio de Éxito |
| :--- | :--- | :---: | :--- |
| **Lint & Static Analysis** | ESLint, TypeScript `tsc`, Spectral | < 2 min | 0 errores de sintaxis, tipos estrictos y OpenAPI validado. |
| **Security Audit (SAST)** | `pnpm audit`, Gitleaks | < 2 min | 0 vulnerabilidades de nivel `high`/`critical` y 0 secretos expuestos. |
| **Unit & Integration Tests** | Vitest, Docker Service (PostgreSQL) | < 4 min | 100% de tests en verde, migraciones aplicadas e in-memory fakes. |
| **Build Verification** | Vite, Node.js compilation | < 2 min | Compilación de bundle de producción limpia sin advertencias. |

---

## 🛠️ 2. Estructura del Workflow de GitHub Actions (`ci.yml`)

El pipeline se encuentra configurado en `.github/workflows/ci.yml` ejecutándose en entornos aislados con cache de dependencias pnpm:

```yaml
name: CI/CD DevSecOps Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-typecheck:
    name: Lint & TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run build

  security-audit:
    name: Security & Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm audit --audit-level=high

  unit-and-integration-tests:
    name: Unit & Integration Test Suite
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```
