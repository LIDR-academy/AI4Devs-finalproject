
# 🎨 Frontend Delivery Playbook — Meditation Builder
**Versión:** 2.0.0 (Simétrico al backend, listo para Speckit + Claude 4.5 Sonnet)
**Ámbito:** `/frontend` — React 18 + TypeScript + Vite + React Query + Zustand + Playwright

---

## 0. Propósito
Establecer un **flujo vertical y normativo** para el frontend que refleje el Champion Guide del backend:
**BDD → API First (contrato) → Cliente OpenAPI → UI (páginas/comp.) → Estado (RQ/Zustand) → Tests unit/integration → E2E (Playwright) → CI/CD**.

Objetivo: **entregar valor observable** por historia sin introducir lógica de negocio en la UI.

---

## 1. Principios
- **UI reactiva** y desacoplada del backend.
- **Sin lógica de negocio** en componentes/hook/state (solo presentación y acciones de usuario).
- **Cliente OpenAPI autogenerado** desde `/backend/src/main/resources/openapi/...`.
- **Server-state** con **React Query**; **UI-state** con **Zustand**.
- **API First mínimo**: solo lo que requiere el BDD.
- **Tests primero** a nivel de unidad y después integración/E2E.

---

## 2. Estructura del proyecto (normativa)
```
/frontend
  /src
    /api              # Cliente OpenAPI autogenerado (src/api/generated/) + wrappers
    /components       # Presentacionales (sin IO) + __tests__/ (unit)
    /pages            # Páginas/routers
    /hooks            # Lógica de interacción (sin negocio)
    /state            # Slices de Zustand (UI-state) + __tests__/ (unit)
    /styles           # Estilos globales o por módulo
    /utils            # Utilidades UI puras
    /test             # Setup de vitest (setup.ts)
  /tests
    /e2e              # Playwright (*.spec.ts)
```

**Reglas:**
- Cualquier acceso a red pasa por `src/api` (cliente OpenAPI autogenerado).  
- `components/` nunca importan `src/api` directamente; lo hará un `hook` o `page`.
- `state/` solo almacena **estado de UI** (flags, filtros, wizard steps). **Datos remotos** → React Query.

---

## 3. Pipeline por historia (frontend)
1) **BDD** (solo negocio; vive en backend y guía el comportamiento observable).  
2) **API First** (YAML en backend).  
3) **Generar cliente OpenAPI** para FE: `npm run generate:api` (requiere Java 21).  
4) **UI**: páginas/comp./hooks + estado (Zustand).  
5) **Tests unitarios** (Vitest + RTL) sobre componentes, hooks y stores.  
6) **Tests de integración** (Vitest + RTL + MSW) simulando API según OpenAPI.  
7) **E2E (Playwright)** contra backend real (puerto 8080) y frontend (puerto 3011).  
8) **CI/CD** (gates bloqueantes).

**Prohibido** crear llamadas manuales a fetch/axios sin pasar por el **cliente OpenAPI**.

---

## 4. Naming y convenciones
- Componentes: `PascalCase`, p. ej., `MeditationBuilderPage.tsx`, `MusicSection.tsx`.
- Hooks: `useCamelCase`, p. ej., `useGenerateMeditation.ts`.
- Slices Zustand: `camelCase` + hook selector, p. ej., `useComposerStore()`.
- API: módulos autogenerados en `src/api/generated/`; wrappers en `src/api/client.ts` o `src/api/generation-client.ts`.
- Tests: `*.test.ts(x)` (unit/integration - ubicados en `__tests__`) y `*.spec.ts` (E2E Playwright).

---

## 5. Reglas de uso de estado
- **React Query**: datos remotos, caché, reintentos, invalidaciones.  
- **Zustand**: solo estado de UI (no cachea server-data).  
- **Nunca** dupliques datos remotos en Zustand.

---

## 6. Errores y autenticación
- Interceptor de auth reutilizable → añade `Authorization` a todas las peticiones.
- Mapear errores comunes:
  - `401/403` → recuperación de sesión / redirect a login.
  - `429/503` → mensajes de reintento no bloqueantes.
- **No** persistir contenido si la US no lo contempla (estado vive en UI/sesión).

---

## 7. Testing
- **Unit (RTL)**: componentes/hook aislados; sin IO real.
- **Integration (RTL + MSW)**: flujos de UI contra API simulada consistente con OpenAPI.
- **E2E (Playwright)**: flujos reales de usuario; sin mocks salvo necesidad operativa.

**Coberturas recomendadas**: unidad ≥ 70%, integración ≥ 60%, E2E cubre caminos críticos del BDD.

---

## 8. CI/CD (gates)
Orden **bloqueante**:
1. **API Gen**: `npm run generate:api` (bloquea si hay error en contrato).
2. **Lint & Check**: `npm run lint` + `tsc`.
3. **Vitest**: `npm run test` (Unit + Integration con MSW).
4. **Playwright**: `npm run test:e2e` (E2E con backend real).
5. **Build**: `npm run build` (Vite production build).

Ningún fallo permite merge a `main`.

---

## 9. Artefactos por fase
- **Cliente OpenAPI**: `src/api/*` (autogenerado).  
- **UI**: `src/pages/*`, `src/components/*`, `src/hooks/*`, `src/state/*`.  
- **Tests**: `src/**/__tests__/*.test.tsx` (unit), `tests/e2e/*.spec.ts` (E2E Playwright).

---

## 10. Anti‑patrones
- Llamadas HTTP manuales (sin cliente OpenAPI).
- Lógica de negocio en UI (if/else complejos con reglas).
- Mezclar server‑state en Zustand.
- Tests que dependen de servicios cloud reales.
- Anticipar endpoints/campos no presentes en BDD.

---

## 11. Done (frontend)
Una historia está **DONE** en frontend si:
- UI implementada según BDD.
- Cliente OpenAPI actualizado.
- Unit + Integration + E2E (Playwright) en verde.
- Manejo de errores y estados de carga.
- Sin lógica de negocio en UI.
- CI en verde.

**Principio final:** la UI **solo** muestra y orquesta; **nunca decide** reglas de negocio.
