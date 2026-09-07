---
document: technical_ticket
id: TK-124-FE
related_story: US-035
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md
  - docs/00_stack_manifest.md
  - docs/02_architecture_design/04_design_system.md
---

# 🎟️ TK-124-FE: Selector de Modo Dual y Badge de Privacidad Zero-Leakage (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-035](../../11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Incorporar en el modal de sugerencias de aprovechamiento (`RescueRecipesModal.tsx`) un selector táctil accesible (≥48px) para alternar entre:
1. **Recetas del Restaurante (100% Privado)**: Utiliza exclusivamente las recetas registradas en el local. Despliega un badge de garantía `"🔒 100% Local / Zero Data Leakage"`.
2. **Generación Creativa (IA)**: Activa la propuesta libre con IA externa (Gemini/OpenAI/Ollama o Heurístico).

*   **ID US Relacionada:** [`US-035`](../../11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md)
*   **Módulo / Vertical Slice:** `recipes` / `kitchen`
*   **Estimación (Story Points):** 2
*   **Prioridad MoSCoW:** Must Have
*   **Prerrequisitos:** `TK-122-FE` (Modal inicial), `TK-124` (Backend dual mode).

---

## 🗣️ Decisiones de Diseño y Gobernanza (Guard 28 & Guard 29)
1.  **Sin Estilos Inline (Guard 29):** Todo el layout y estados de selector se estructuran mediante clases semánticas en `RescueRecipesModal.module.css` usando tokens de `DESIGN.md`.
2.  **Touch Targets Accesibles:** Botones de alternancia de modo con altura mínima de 48px y padding ergonómico para uso con guantes en cocina.
3.  **Transparencia de Privacidad:** Mensaje destacado cuando el modo catálogo está activo para brindar absoluta certeza al usuario de que sus recetas no son compartidas.

---

## 🔀 Alcance de Modificación (Frontend Components)
*   **Services:**
    *   `recipes.service.ts`: Extender `suggestRescueRecipes(mode?: 'CATALOG' | 'CREATIVE')` enviando payload JSON.
    *   Tipos: Añadir `'CATALOG'` a `RescueSuggestionsResponse['source']`.
*   **Components:**
    *   `RescueRecipesModal.tsx`: Estado local `selectedMode`, pestañas accesibles de selección de modo, visualización del badge Zero-Leakage, y refresco al alternar de modo.
    *   `RescueRecipesModal.module.css`: Clases semánticas para los tabs y el badge de privacidad.
*   **Tests:**
    *   `RescueRecipesModal.test.tsx`: Pruebas de renderizado de selector, alternancia de pestañas y verificación de llamada a API con el modo respectivo.

---

## ✅ Criterios de Aceptación (DoD)
- [x] Selector accesible con mínimo 48px de área táctil.
- [x] Indicador visual claro del origen de datos y garantía Zero-Leakage.
- [x] Zero estilos inline (`style={{...}}`).
- [x] Pruebas unitarias de componente en verde (`pnpm test`).
- [x] Build de frontend verificado sin advertencias de tipos.
