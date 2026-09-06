---
document: technical_ticket
id: TK-121-FE
related_story: US-015
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/security/US-015.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-121-FE: Ocultamiento por Permiso y Aterrizaje en Login (Frontend, US-015 Escenario 2)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-015 (11_user_stories/security/US-015.md)](../../../11_user_stories/security/US-015.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Hoy el frontend decide qué mostrar comparando `role === 'ADMIN'` a mano (`AppNav`, `ProtectedRoute`, `ReportsDashboard`). Con `TK-121` el JWT ya trae la lista de permisos: este ticket la consume para ocultar lo que el usuario no puede ejercer y para aterrizarlo en una ruta que sí puede ver.

*   **ID US Relacionada:** [`US-015`](../../../11_user_stories/security/US-015.md) — Escenario 2
*   **Módulo / Vertical Slice:** `security` (transversal a `app/`)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-121` (permisos en el JWT)

---

## ⚠️ Invariante de Seguridad
Ocultar un botón **no es** un control de acceso: es ergonomía (no ofrecer lo que fallaría con `403`). La autorización real la impone el backend en cada petición (`authorizePermissions`, `TK-117`). Ningún cambio de este ticket debe presentarse —ni en código ni en comentarios— como si asegurara algo.

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Origen de la lista (decidido al implementar):** los permisos **se leen decodificando el payload del JWT ya almacenado**, no se persisten aparte junto al usuario como planteaba el borrador de este ticket. Motivo: el backend los emite dentro del token (no en el objeto `user` de la respuesta), así que duplicarlos en `localStorage` habría creado una segunda copia capaz de desincronizarse del token que realmente se envía en cada petición. La decodificación es un `atob` del segmento central — **sin verificar la firma y sin dependencia nueva**, porque aquí solo se decide qué ofrecer, nunca a qué se tiene derecho.
*   **Hook de permisos (`shared/hooks/`):** `usePermissions()` → `{ has(code): boolean }`, único punto que interpreta la lista (incluido el fallback de compatibilidad).
*   **`AppNav.tsx`:** cada `NavItem` declara el permiso que lo habilita (`/reportes` → `reports:view`, `/ajustes` → `roles:manage`) en vez del booleano `adminOnly`. Códigos verificados contra la tabla `Permission` real, no asumidos.
*   **`ProtectedRoute.tsx`:** acepta `requiredPermission` — el propio JSDoc del componente ya anticipaba este cambio ("cuando exista la matriz de permisos granular, esta comprobación pasará a consultar permisos, sin cambiar la forma del componente").
*   **`ReportsDashboard.tsx`:** sustituye `userRole !== 'ADMIN'` por el permiso correspondiente.
*   **Aterrizaje tras login — evaluado y NO implementado a propósito:** `/` (Tablero FEFO) no exige ningún permiso y es la ruta por defecto, así que **todo usuario autenticado ya aterriza en una pantalla que puede ver**; el Escenario 2 se cumple sin código adicional. Añadir hoy un "redirige a la primera ruta accesible" sería lógica muerta por construcción. Si en el futuro alguna ruta raíz pasa a exigir permiso, ahí sí hará falta — y `NAV_ITEMS` ya declara el permiso de cada destino, que es lo que esa regla necesitaría.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Sesiones ya abiertas (riesgo de auto-bloqueo):** un token emitido antes de `TK-121` no trae `permissions`. `usePermissions()` DEBE, ante una lista ausente, **caer al comportamiento anterior basado en rol** — nunca asumir "sin permisos", que dejaría a todo usuario con sesión viva sin navegación hasta re-loguear.
2.  **Un solo punto de interpretación:** ninguna vista vuelve a leer `permissions` cruda ni a comparar `role` a mano; todas pasan por `usePermissions()`.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

@critical
### Criterio de Aceptación 1: Se oculta lo que el usuario no puede ejercer
*   **Given** un usuario con permisos de cocina y sin `reports:view` ni `roles:manage`
*   **When** entra a la aplicación
*   **Then** la navegación no ofrece **Reportes** ni **Ajustes**, y el Tablero FEFO sigue plenamente disponible.

### Criterio de Aceptación 2: Compatibilidad con sesiones anteriores
*   **Given** una sesión abierta con un token sin `permissions` (emitido antes de `TK-121`)
*   **When** el usuario navega
*   **Then** la interfaz se comporta exactamente como antes (gating por rol), sin perder acceso ni forzar re-login.

### DoD Estricto:
1.  **Tests RTL:** ambos criterios + `ProtectedRoute` redirige al carecer del permiso exigido.
2.  **Complejidad/Duplicación/Dead code:** gates ticket-scoped en verde.
3.  **A11y:** la navegación resultante conserva orden de foco y `aria-label` existentes.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Ficheros representativos:** `app/AppNav.tsx`, `app/ProtectedRoute.tsx`, `app/session.ts`, `features/auth/services/auth.service.ts`, `shared/hooks/usePermissions.ts` (nuevo), `features/reports/components/ReportsDashboard.tsx`.
2. **Suite:** `pnpm --filter @restostock/frontend run test`
3. **Verificación total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna propia. La edición de la matriz de permisos ya existe (`/ajustes/roles`, `TK-073-FE`); este ticket solo consume su resultado.
