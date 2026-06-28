Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/frontend.md

Lee:
- docs/evidence/frontend-dashboard-test-results.md
- frontend/src/components/Dashboard.tsx

Objetivo:
Corregir la observación QA-FE-001 del frontend.

Debes actualizar:
- frontend/src/components/Dashboard.tsx

Cambio requerido:
- Reemplazar el carácter mojibake del botón refrescar (`â†»`) por texto ASCII claro, por ejemplo `Refresh` o `Actualizar`.

Restricciones:
- No modifiques backend.
- No modifiques edge.
- No cambies la lógica del dashboard.
- No agregues dependencias.
- No hagas commit ni push.

Al finalizar, resume:
1. Archivo modificado.
2. Cambio realizado.
3. Cómo validar.