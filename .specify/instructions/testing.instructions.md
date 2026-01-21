
# ✅ Testing Instructions — Meditation Builder (Backend + Frontend)
**Versión:** 2.0.0

---

## 0. Propósito
Definir **cómo** se prueban los comportamientos y las capas del sistema para que cada historia sea **deployable** sin deuda técnica.

---

## 1. BDD (Backend)
- **Framework**: Cucumber + JUnit 5.
- **Ubicación**: `/backend/tests/bdd/<context>/<feature>.feature`.
- **Runner** (JUnit Platform): `@Suite` + `@IncludeEngines("cucumber")` + `@SelectClasspathResource("tests/bdd")`.
- **Reglas**: lenguaje 100% de negocio; sin HTTP/JSON/DB/UI.
- **Ciclo**: debe empezar en **rojo** (steps pending) y acabar en verde.

---

## 2. Unit tests
### Backend — Dominio
- TDD puro; sin mocks técnicos; tests rápidos/deterministas.
- Cobertura sobre invariantes y reglas significativas.

### Backend — Aplicación
- Tests de orquestación con mocks de puertos.
- Casos felices + errores relevantes.

### Frontend
- **Jest/Vitest + React Testing Library**.
- Componentes y hooks aislados; sin IO real.

---

## 3. Integration tests (Infra)
- **Backend**: Testcontainers para DB/colas cuando aplique.
- **IA adapters**: simular respuestas; nunca dependencias externas reales en CI.
- **Frontend**: pruebas de integración con **RTL + MSW** (API simulada según OpenAPI).

---

## 4. Contract tests (OpenAPI)
- Validar implementación contra el YAML en `/backend/src/main/resources/openapi/...`.
- Lint obligatorio (p. ej., Redocly CLI).
- Consumer/provider tests integrados en CI.

---

## 5. E2E tests
- **Backend**: Cucumber sobre artefacto real en `/backend/tests/e2e`.
- **Frontend**: Playwright en `/frontend/tests/e2e`.
- Ejecutan los escenarios críticos definidos en BDD.
- Usar contenedores/mocks locales; **no** servicios externos reales.

---

## 6. Datos de prueba
- Fábricas/fixtures controlados y deterministas.
- Sin datos sensibles.
- Semillas versionadas por historia si aplica.

---

## 7. CI/CD Gates (orden bloqueante)
1. `bdd` (puede empezar rojo)  
2. `api` (lint + schema)  
3. `unit` (dominio + aplicación + frontend unit)  
4. `infra` (integración backend + integración frontend)  
5. `contract`  
6. `e2e` backend  
7. `e2e` frontend

**Fast‑fail**: cualquier fallo bloquea el merge.

---

## 8. Métricas y umbrales mínimos
- Cobertura razonada (no dogmática) por capa.
- Métricas de latencia/errores/throughput en endpoints relevantes.
- Reportes de pruebas en CI (JUnit XML / HTML / Allure según tooling).

---

## 9. Anti‑patrones
- Tests acoplados a implementación en vez de a comportamiento.
- Flakes por dependencias externas o sleeps fijos.
- E2E masivos sin valor (centrarse en caminos críticos del BDD).

**Regla de oro**: pruebas **rápidas, deterministas y con señal clara**.
