
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
    /api              # Cliente OpenAPI autogenerado + wrappers finos
    /components       # Presentacionales (sin IO)
    /pages            # Páginas/routers
    /hooks            # Lógica de interacción (sin negocio)
    /state            # Slices de Zustand (UI-state)
    /styles           # Estilos globales o por módulo
    /utils            # Utilidades UI puras
  /tests
    /unit             # Jest/Vitest + RTL
    /integration      # RTL con API mockeada
    /e2e              # Playwright
```

**Reglas:**
- Cualquier acceso a red pasa por `src/api` (cliente OpenAPI).  
- `components/` nunca importan `src/api` directamente; lo hará un `hook` o `page`.
- `state/` solo almacena **estado de UI** (flags, filtros, wizard steps). **Datos remotos** → React Query.

---

## 3. Pipeline por historia (frontend)
1) **BDD** (solo negocio; vive en backend y guía el comportamiento observable).  
2) **API First** (YAML en backend).  
3) **Generar cliente OpenAPI** para FE (`npm run generate:api`).  
4) **UI**: páginas/comp./hooks + estado (Zustand).  
5) **Tests unitarios** (RTL) sobre componentes y hooks.  
6) **Tests de integración** (RTL) simulando API con MSW.  
7) **E2E (Playwright)** contra backend real o mockeado.  
8) **CI/CD** (gates bloqueantes).

**Prohibido** crear llamadas manuales a fetch/axios sin pasar por el **cliente OpenAPI**.

---

## 4. Naming y convenciones
- Componentes: `PascalCase`, p. ej., `MeditationBuilderPage.tsx`, `MusicSection.tsx`.
- Hooks: `useCamelCase`, p. ej., `useGenerateMeditationText.ts`.
- Slices Zustand: `camelCase` + selector explícito, p. ej., `useComposerStore()`.
- API: módulos autogenerados; cualquier wrapper manual va en `src/api/client.ts` o `src/api/adapters.ts`.
- Tests: `*.spec.ts(x)` (unit/integration) y `*.e2e.ts` (Playwright).

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
Orden **bloqueante**: `lint → unit → integration → e2e`.  
Ningún fallo permite merge a `main`.

---

## 9. Artefactos por fase
- **Cliente OpenAPI**: `src/api/*` (autogenerado).  
- **UI**: `src/pages/*`, `src/components/*`, `src/hooks/*`, `src/state/*`.  
- **Tests**: `tests/unit/*`, `tests/integration/*`, `tests/e2e/*`.

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
