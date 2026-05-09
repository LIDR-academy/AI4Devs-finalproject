# Convenciones y buenas prácticas — tests frontend (`frontend/`)

Guía breve para alinear implementación en Vue 3 + TypeScript con Vitest. Comandos de frontend: [frontend/README.md](../../frontend/README.md). Reglas cortas de IA (auth/HTTP/testing): [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc).  
Este documento es **canónico técnico** para testing frontend; la guía de inicio vive en [docs/onboarding/vue-development-guide.md](../onboarding/vue-development-guide.md).

## 1. Alcance y stack

- Runner: **Vitest** (`npm run test`).
- Entorno de pruebas de UI: **jsdom** (configurado en `frontend/vitest.config.ts`).
- Objetivo MVP: cubrir lógica relevante de frontend sin acoplarse a infraestructura real (Keycloak, gateway, backend).

## 2. Qué testear por capa (reglas mínimas, MVP)

No hay umbral de cobertura % obligatorio; sí reglas mínimas por tipo de cambio:

| Zona | Regla mínima |
|------|---------------|
| `composables/` con validación, estado derivado o ramas | Añadir `*.test.ts` con casos happy-path y errores esperables. |
| `services/` (cliente HTTP, mapeo de errores, auth helpers) | Probar parseo/transformación y clasificación de errores (`401`, `403`, `5xx`, red). |
| `router/` (guards, meta por rol, redirecciones) | Añadir tests de navegación/guard para sesión válida, anónimo y acceso denegado. |
| `views/` / `components/` con lógica no trivial | Test de interacción y rendering condicional; evitar tests de puro markup estático. |
| i18n de placeholders/restricción | Verificar que el componente usa keys i18n (sin copy hardcode en la vista). |

**Notas**

- Cambios de estilos puros o copy sin lógica no requieren test nuevo por sí solos.
- Si se modifica seguridad de navegación o auth, los tests de router pasan a ser obligatorios.

## 3. Diseño de tests (calidad y mantenibilidad)

- Patrón por test: **Arrange / Act / Assert**.
- Un comportamiento verificable por test; títulos descriptivos de negocio.
- Preferir aserciones explícitas sobre snapshots grandes de vistas completas.
- Mantener tests cerca del código (`*.test.ts` en la misma carpeta) cuando sea posible.
- Evitar dependencias entre tests: reset de mocks y estado en `beforeEach`.

## 4. Aislamiento y mocks

- Tests unitarios/componente: **sin llamadas reales** a Keycloak ni backend.
- Mockear en borde: `authService`, cliente HTTP, router.
- No mockear lógica propia que se quiere validar (mocks solo para dependencias externas).
- Si un flujo requiere integración real (E2E), tratarlo fuera de este documento y no mezclarlo con unitarios Vitest.

## 5. Definición de hecho para un cambio frontend con lógica

- `npm run test` en `frontend/` pasa.
- `npm run build` en `frontend/` pasa (`vue-tsc` + build Vite).
- La nueva lógica relevante tiene tests añadidos/actualizados.
- No hay copy hardcode en vistas para errores/placeholders si existe i18n.

## 6. Ejecutar tests frontend

Desde `frontend/`:

- Todos los tests:

  ```bash
  npm run test
  ```

- Un archivo concreto:

  ```bash
  npx vitest run src/router/index.test.ts
  ```

- Por patrón de nombre:

  ```bash
  npx vitest run -t "redirige a auth-error"
  ```

## 7. Referencias relacionadas (sin duplicar)

- Reglas cortas IA: [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc), [frontend-vue3.mdc](../../.cursor/rules/frontend-vue3.mdc), [quality-and-testing.mdc](../../.cursor/rules/quality-and-testing.mdc).
- Guía de inicio frontend: [docs/onboarding/vue-development-guide.md](../onboarding/vue-development-guide.md).
- Estrategia general de calidad del proyecto: [readme.md](../../readme.md) (apartado 2.6).
