---

## description: Reglas y directrices de desarrollo de ConRutina, aplicables a todos los agentes de IA (Claude, Cursor, Codex, Gemini, etc.).
alwaysApply: true

## 1. Principios fundamentales

- **Tareas pequeñas, una a la vez**: Trabajar en pasos incrementales. No avanzar más de un paso a la vez.
- **Desarrollo guiado por pruebas (TDD)**: Empezar con pruebas que fallen para cualquier funcionalidad nueva, según el detalle de la tarea.
- **Tipado estricto**: Todo el código debe estar completamente tipado.
- **Nombres claros**: Usar nombres descriptivos en variables y funciones.
- **Cambios incrementales**: Preferir cambios acotados y focalizados frente a modificaciones grandes.
- **Cuestionar suposiciones**: Revisar siempre inferencias y premisas.
- **Detección de patrones**: Identificar y señalar código repetido.

## 2. Estándares de idioma

- **Documentación técnica (`docs/`)**: Escribir en **español**, salvo identificadores técnicos, rutas, comandos y bloques de código.
- **Interfaz de usuario**: Textos visibles al usuario en **español** (etiquetas, botones, mensajes de error, toasts).
- **Código fuente**:
  - Identificadores (variables, funciones, clases, tipos): **inglés** (convención TypeScript/React).
  - Comentarios en código: **español** cuando aporten contexto de negocio; pueden ser breves en inglés si son puramente técnicos.
  - Mensajes de error/logs orientados al usuario o al operador en desarrollo: **español** (p. ej. `"Usuario con id 1 no encontrado"`).
- **Commits**: Un **commit único** con mensaje en **viñetas breves** en español, **solo al archivar** el change OpenSpec (cuando el usuario acepta los cambios); **no** commitear durante `/opsx:apply`. Push de la rama feature al remoto e integración en `develop` tras el commit. Ver [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md).
- **Esquemas y API**: Nombres de modelos/campos en inglés en Prisma y OpenAPI; descripciones y ejemplos de error en español.

## 3. Estándares específicos

Para directrices detalladas por área del proyecto:

- [Estándares backend](./backend-standards.md) — API, Clean Architecture, Prisma, PostgreSQL, pruebas y seguridad
- [Estándares frontend](./frontend-standards.md) — React + Vite, Tailwind v4, Radix UI, UI/UX y arquitectura frontend
- [Estándares de documentación](./documentation-standards.md) — Estructura, formato y mantenimiento de la documentación
- [Pasos obligatorios OpenSpec](./openspec-tasks-mandatory-steps.md) — Checklist al crear o actualizar `tasks.md`
- [Guía de desarrollo](./development_guide.md) — Instalación, entorno y flujo de trabajo
- [Especificación API](./api-spec.yml) — Endpoints REST de ConRutina
- [Modelo de datos](./data-model.md) — Entidades, relaciones y evolución prevista

## 4. Skills del proyecto

- Las skills viven en `.cursor/skills/` (y enlaces equivalentes en otros agentes).
- Si la petición encaja con una skill, cargar y seguir su `SKILL.md` antes de continuar.
- Cargar también los ficheros referenciados en la skill cuando lo exija.

**Flujo OpenSpec (un ticket del backlog = un change):**

| Fase | Comando / skill |
|------|-----------------|
| Especificar desde ticket `T-XX-YY` | `/opsx-propose-ticket` → skill `propose-from-ticket` |
| Especificar ad hoc | `/opsx:propose` → skill `openspec-propose` |
| Explorar requisitos | `/opsx:explore` → skill `openspec-explore` |
| Implementar | `/opsx:apply` → skill `openspec-apply-change` |
| Archivar | `/opsx:archive` → skill `openspec-archive-change` (cierra Git, archiva change e intenta marcar el ticket ✅ en `docs/product-backlog.md`; fallo de backlog no bloquea el cierre) |

Contexto y reglas por artefacto: `openspec/config.yaml`. Tickets y sprints: `docs/product-backlog.md`.

## 5. Requisito de modelo para planificación

## 6. Integridad de symlinks y portabilidad multiagente

- **Fuente canónica**: Mantener artefactos reutilizables en la ubicación acordada del repo; rutas específicas de agente (`.cursor`, `.claude`) deben referenciarlos por symlink cuando sea posible.
- **Seguridad al actualizar**: Tras renombrar o mover ficheros, verificar symlinks antes de dar por cerrado el cambio.
- **Nuevos artefactos**: Crear symlinks desde las rutas que esperen otros agentes.
- **Puerta de cierre**: Un cambio no está completo si deja symlinks rotos o duplicados inconsistentes.

## 7. Actualización obligatoria de artefactos OpenSpec tras cambios post-apply

Cuando surja una corrección o petición nueva después de `opsx:apply` (o `/apply`) y antes de `opsx:archive` (o `/archive`), tratarla primero como actualización de especificación, no como arreglo informal.

Orden requerido:

1. Actualizar los artefactos OpenSpec afectados (escenarios, specs, `tasks.md`). No añadir tareas sueltas como "bugfix" fuera de la sección de diseño.
2. Si hace falta regenerar artefactos, ejecutar el paso OpenSpec correspondiente antes de codificar.
3. Implementar código solo cuando los artefactos reflejen la petición.
4. Verificar de nuevo frente a los artefactos actualizados antes de archivar.

No aplicar parches solo en código en esta ventana sin actualizar OpenSpec.