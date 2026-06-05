---
name: github-sync
description: "Github, Sync, Sincronizar, Issues, Github Issues, Backlog Sync. Sincroniza bidireccionalmente las issues de GitHub con las historias de usuario locales en Markdown usando la CLI gh."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre github-sync o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** github, sync, sincronizar, issues, github issues, backlog sync

---

[RULES]

1. **Bidirectional check:** Validar siempre el estado remoto e local antes de escribir cambios para evitar sobreescrituras.
2. **No API token leaks:** No almacenar ni mostrar tokens de acceso a la API de GitHub.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Conflicto de estado remoto/local detectado | Solicitar intervención manual o priorizar local si se especifica | Conflicto |
| Sincronización de issues activa | Ejecutar llamadas gh CLI y alinear estados | Sync |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Revisar el backlog local en `docs/tech-lead/backlog.md`.
2. Obtener el estado de las issues remotas de GitHub usando la CLI.
3. Sincronizar y generar un reporte de diferencias, reportando éxito en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Ejecutar la sincronización automática de issues y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [github-rules.md](references/github-rules.md) — Convenciones de tags y estados de GitHub.
