---
name: sport-itsm-workflow
description: >
  Proceso y operativa del repo Sport ITSM (no patrones de código): setup/onboarding, arrancar
  servicios, comandos de BD/testing/Nx, el ciclo obligatorio de ejecución de tareas (branch, ejecutar
  tests uno mismo, verificar BD, testing manual, E2E, informes de verificación, actualizar docs) y los
  estándares de documentación (mapeo cambio→doc, reglas de idioma de docs, AI specs). Úsalo al operar
  el repo, cerrar una tarea o decidir qué documentación actualizar. Para patrones
  de código/arquitectura usa el skill `sport-itsm-engineering-principles`.
---

# Sport One Click — Proceso y workflow

Punto de entrada al **proceso de trabajo** del repo. El contenido autoritativo vive en `docs/standards/` — este skill dice **qué leer y cuándo**; no dupliques sus reglas aquí.

## Reglas de oro (para el detalle, ir al documento)

- **Ejecuta los tests tú mismo** antes de dar una tarea por terminada — no asumas que pasan (`task-execution-standards.md`).
- **Toda tarea empieza en una feature branch** (Step 0), nunca en `master`.
- **Al cambiar código, actualiza la documentación afectada** según la tabla de mapeo de `documentation-standards.md`.
- **Todo el repositorio en inglés** — documentación, código, comentarios y mensajes de commit. Solo los ficheros de traducción i18n y el chat con el usuario van en español (matriz en `base-standards.md` §2).

## Alcance

Este skill cubre **proceso, operativa y documentación**. Para cómo estructurar el código (capas, use cases, entidades, componentes) usa el skill `sport-itsm-engineering-principles`.
