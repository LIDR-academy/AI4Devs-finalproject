---
document: technical_ticket
id: TK-123-FE
related_story: US-034
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/settings/US-034_configuracion_agente_ia.md
  - docs/05_agile_planning/12_tickets/settings/backend/TK-123.md
  - DESIGN.md
---

# 🎟️ TK-123-FE: Sub-ruta y Panel de Configuración de Agentes IA (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-034](../../11_user_stories/settings/US-034_configuracion_agente_ia.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Implementar la interfaz de usuario para la sub-ruta `/ajustes/ia` dentro del módulo de Ajustes, permitiendo al Administrador seleccionar proveedor, editar parámetros (modelo, endpoint, temperatura), ingresar o rotar la API key con indicador enmascarado, probar la conexión ("Ping") y activar/desactivar módulos de IA, en estricto cumplimiento de diseño táctil (targets >=48px, Guard 29 sin estilos inline).

*   **ID US Relacionada:** [`US-034`](../../11_user_stories/settings/US-034_configuracion_agente_ia.md)
*   **Módulo / Vertical Slice:** `settings` (frontend)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-121` (Backend API) y `US-024` (Sub-rutas deep-linkable de Ajustes).

---

## 🔀 Alcance de Modificación (Frontend)
*   **Routing:**
    *   Registrar la sub-ruta `ia` en `apps/frontend/src/router.tsx` bajo la ruta `/ajustes`, protegida por `<ProtectedRoute requiredRole="ADMIN">`.
    *   Agregar la pestaña "IA" en la barra de navegación compartida de `SettingsLayout.tsx`.
*   **Componentes:**
    *   Crear `AiSettingsSection.tsx` y su módulo de estilos `AiSettingsSection.module.css`.
    *   Selector de proveedor (`GEMINI`, `OPENAI_COMPATIBLE`, `HEURISTIC`).
    *   Campo de texto para `modelName` y `endpointUrl` (visible solo para proveedores compatibles).
    *   Campo de contraseña/clave con toggle de visualización y botón de "Actualizar Clave".
    *   Botón táctil "Probar Conexión" con indicador de estado (spinner / badge de éxito con latencia / error).
    *   Checkboxes para habilitar/deshabilitar funcionalidades (`replenishmentOn`, `rescueRecipesOn`).
*   **Estilos y Ergonomía Táctil (Guard 29):**
    *   Uso de variables globales de `index.css` (`--space-*`, `--fs-*`, `--color-*`).
    *   Targets táctiles de al menos 48px.
    *   Cero estilos inline (`style={{...}}`).

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)
1. Navegar a `/ajustes/ia` con rol `ADMIN` carga la configuración actual mediante `GET /api/v1/settings/ai`.
2. Un usuario sin rol `ADMIN` es redirigido a `/inventario` al intentar ingresar a `/ajustes/ia`.
3. Al pulsar "Probar Conexión", el botón muestra estado de carga y posteriormente el resultado de latencia en milisegundos.
4. El formulario valida campos requeridos y persiste exitosamente mediante `PUT /api/v1/settings/ai`.
5. Pruebas de componente React Testing Library pasando al 100%.
