---
document: technical_ticket
id: TK-001-FE
related_story: N/A
points: 3
type: frontend
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-001-FE: Configuración del Workspace Frontend y Design System Base

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Índice de Historias (11_user_stories/indice_user_stories.md)](../../../11_user_stories/indice_user_stories.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Este ticket de base técnica configura el espacio de trabajo del frontend monorepo (`apps/frontend`) utilizando Vite, React, TypeScript y Vanilla CSS con tokens HSL personalizados. Establece el sistema de diseño base (`index.css`), el tema oscuro industrial, las fuentes modernas (Inter/Outfit de Google Fonts), la regla de ergonomía táctil (botones con área interactiva mínima de 48px x 48px), la arquitectura de navegación global y la infraestructura de pruebas con Vitest y React Testing Library.

*   **ID US Relacionada:** N/A (Ticket Técnico / Habilitador)
*   **Módulo / Vertical Slice:** `shared` (Shared Kernel / Frontend Infrastructure)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Must Have
*   **Prerrequisitos:** Ninguno (Habilitador inicial del frontend)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Design System & CSS (`src/index.css`):** Definición de variables CSS de tokens HSL, paleta industrial de cocina, micro-animaciones CSS para feedback visual y utility `.btn-touch` con dimensión táctil garantizada de $\ge 48\text{px}$.
*   **Core Layout (`src/App.tsx` & `src/components/layout/`):** Estructura principal con barra de navegación táctil (`Navbar.tsx`), contenedor de alertas globales (`AlertBanner.tsx`) y enrutamiento dinámico para módulos.
*   **State Management & Utilities (`src/shared/`):** Cliente de API genérico con soporte de token JWT en localStorage/sessionStorage y manejo defensivo de errores HTTP (`401 Unauthorized`, `403 Forbidden`, `500 Server Error`).
*   **Testing Infrastructure (`vitest.config.ts` & `src/test/setup.ts`):** Configuración de runner de pruebas Vitest, JSDOM y `@testing-library/react`.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Ergonomía Táctil en Entornos de Cocina:** Los operarios interactúan con pantallas táctiles usando guantes o manos húmedas. Si los botones son pequeños (< 48px), se causarán errores operativos graves en el marcado de mermas. Mitigar declarando una clase global `.btn-touch` con `min-height: 48px` y `min-width: 48px`.
2.  **Rendimiento y Tiempo de Carga en Red Local (WLAN Cocina):** Evitar bundles gigantescos. Configurar la división de código (code splitting) en `vite.config.ts` para que cada módulo dinámico se cargue de forma perezosa (`React.lazy`).

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Compilación e inicialización limpia del espacio de trabajo
*   **Given** el subdirectorio `apps/frontend`
*   **When** se ejecuta el comando `pnpm run build`
*   **Then** Vite genera el bundle de producción en `dist/` sin ningún error de compilación TypeScript ni advertencias de linter.

### Criterio de Aceptación 2: Verificación de Ergonomía Táctil y Accesibilidad (WCAG 2.1)
*   **Given** los componentes de navegación e interacción base en `App.tsx`
*   **When** se inspeccionan las áreas interactivas de los botones
*   **Then** el 100% de los botones principales cumple con una dimensión táctil mínima de 48px por 48px.

### DoD Estricto:
1.  **DoD Técnico - Design System:** `src/index.css` incluye los tokens HSL de color, modo oscuro industrial y tipografía Inter.
2.  **DoD Técnico - Tests UI:** `pnpm run test` en el frontend ejecuta las pruebas de componentes y responde en verde.
3.  **DoD Lint & Zero Errors:** 0 errores de TypeScript (`tsc --noEmit`) y 0 advertencias de linter (`pnpm run lint`).

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas a crear/modificar:**
   - `apps/frontend/src/index.css`
   - `apps/frontend/src/App.tsx`
   - `apps/frontend/src/components/layout/Navbar.tsx`
   - `apps/frontend/src/components/layout/AlertBanner.tsx`
   - `apps/frontend/vite.config.ts`
   - `apps/frontend/vitest.config.ts`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm test apps/frontend`
3. **Comando de Verificación Total:** `pnpm run build && pnpm run lint`
