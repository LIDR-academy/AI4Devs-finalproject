
# ✅ Testing Instructions — Meditation Builder (Backend + Frontend)
**Versión:** 2.0.0

---

## 0. Propósito
Definir **cómo** se prueban los comportamientos y las capas del sistema para que cada historia sea **deployable** sin deuda técnica.

---

## 1. BDD (Backend)
- **Framework**: Cucumber + JUnit 5.
- **Ubicación features**: `/backend/src/test/resources/features/<context>/<feature>.feature`.
- **Ubicación step definitions**: `/backend/src/test/java/com/hexagonal/<bc>/bdd/steps/`.
- **Runner** (JUnit Platform): `@Suite` + `@IncludeEngines("cucumber")` en `/backend/src/test/java/.../bdd/`.
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
- **Frontend**: pruebas de integración con **Vitest + RTL + MSW** (API simulada según OpenAPI).

---

## 4. Contract tests (OpenAPI)
- Validar implementación contra el YAML en `/backend/src/main/resources/openapi/...`.
- **Generación de Cliente**: El frontend **DEBE** ejecutar `npm run generate:api` antes de los tests para asegurar que los tipos están sincronizados.
- Lint obligatorio (p. ej., Redocly CLI).
- Consumer/provider tests integrados en CI.

---

## 5. E2E tests
- **Backend**: Spring Boot E2E tests en `/backend/src/test/java/.../e2e/`.
- **Frontend**: Playwright en `/frontend/tests/e2e/*.spec.ts`.
- **Configuración CI**: Playwright requiere el servidor levantado en puerto 3011 y el backend en 8080.
- Ejecutan los escenarios críticos definidos en BDD.
- Usar contenedores/mocks locales; **no** servicios externos reales.

**Note**: Cucumber BDD (.feature) sirve como especificación, mientras que los E2E tests validan la implementación completa.

---

## 6. Datos de prueba
- Fábricas/fixtures controlados y deterministas.
- Sin datos sensibles.
- Semillas versionadas por historia si aplica.

---

## 7. CI/CD Gates (orden bloqueante)
Cada commit debe pasar por los siguientes gates en GitHub Actions:

### Backend CI (`backend-ci.yml`):
1. **BDD** (Cucumber)
2. **API Verification**
3. **Unit Tests** (Domain + App)
4. **Integration Tests** (Infra/Testcontainers)
5. **Contract Tests**
6. **E2E Tests**
7. **Build** (JAR)

### Frontend CI (`frontend-ci.yml`):
1. **Setup**: Dependencias + **Java 21** (p/ API Gen).
2. **API Generation**: `npm run generate:api`.
3. **Lint & Type Check**: `npm run lint`.
4. **Unit & Integration**: `npm run test` (Vitest + MSW).
5. **E2E**: `npm run test:e2e` (Playwright).
6. **Build**: `npm run build`.

**Fast-fail**: cualquier fallo bloquea el merge.

---

## 8. Métricas y umbrales mínimos
- Cobertura mínima objetivo: **80%** en dominio y lógica de aplicación.
- Cobertura frontend: verificada con `vitest --coverage`.
- Métricas de latencia/errores/throughput en endpoints relevantes.
- Reportes de pruebas en CI (JUnit XML para backend, HTML report para Playwright).

---

## 9. Anti‑patrones
- Tests acoplados a implementación en vez de a comportamiento.
- Flakes por dependencias externas o sleeps fijos.
- E2E masivos sin valor (centrarse en caminos críticos del BDD).

**Regla de oro**: pruebas **rápidas, deterministas y con señal clara**.
