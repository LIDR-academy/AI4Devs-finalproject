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

[HARNESS]

1. **Verificación Bidireccional:** Validar siempre el estado remoto e local antes de escribir cambios para evitar sobreescrituras accidentales.
2. **No API leaks:** Queda terminantemente prohibido almacenar o escribir tokens de GitHub (`GITHUB_TOKEN` u otros) en archivos del repositorio o logs.
3. **Control de Rate Limit:** Monitorear y registrar el número de llamadas a la API de GitHub para evitar suspensiones por exceso de cuota de API.
4. **Idempotencia de Creación:** Antes de crear una nueva issue, validar si ya existe una issue remota con el mismo identificador o título.
5. **Labels y Tags Consistentes:** Toda issue creada o sincronizada debe heredar los labels de prioridad (ej. MoSCoW) y tags correspondientes al backlog local.
6. **Mapeo de Estados:** Los estados de las issues (Open/Closed) en GitHub deben mapearse de forma exacta a los estados definidos en el contrato local.
7. **Formato Markdown Soportado:** Validar que los textos a sincronizar usan elementos de Markdown soportados por el parser de GitHub para evitar renderizados incorrectos.
8. **Enlace a Historias:** Las descripciones de las issues en GitHub deben incluir una cabecera con el ID único e inmutable de la historia de usuario local.
9. **Manejo de Rate Limits en Lotes:** Al sincronizar por lotes, introducir retardos adecuados de al menos 500ms entre llamadas de escritura para evitar bloqueos del servidor.
10. **Preservación de Comentarios:** Las actualizaciones automáticas del cuerpo de las issues no deben borrar ni sobrescribir los comentarios de usuarios remotos.
11. **Uso de la CLI gh:** Emplear comandos nativos a través de la CLI `gh` configurada, evitando llamadas `curl` directas con tokens de sesión inseguros.
12. **Manejo de Errores de Conexión:** En caso de fallas de red, implementar un mecanismo de reintento exponencial antes de abortar la sincronización.
13. **Procedimiento de Autoverificación - Token Check:** Validar que la variable de entorno de autenticación existe y está configurada de forma segura antes de realizar llamadas.
14. **Procedimiento de Autoverificación - Conflictos:** Buscar discrepancias entre las fechas de modificación local y remota para alertar sobre posibles colisiones.
15. **Procedimiento de Autoverificación - Nombres de Ramas:** Confirmar que no se crean issues asociadas a ramas de git inexistentes o mal nombradas.
16. **Procedimiento de Autoverificación - Formato de Output:** Asegurar que los reportes de sincronización generados en `.gemini/` o `docs/` son válidos.
17. **Procedimiento de Autoverificación - Tags:** Verificar que todos los tags aplicados pertenecen a la lista permitida en `github-rules.md`.
18. **Procedimiento de Autoverificación - Limpieza:** Comprobar que no quedan archivos temporales de volcado de JSON de la API en el directorio de trabajo.
19. **Procedimiento de Autoverificación - Asignados:** Validar que los usuarios asignados a las issues de GitHub existen en la organización correspondiente.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
