# Reglas de Cursor (`.cursor/rules/`): lo esencial

Guía corta para quien empieza con Cursor y la IA en este monorepo. Las reglas **orientan al agente** (y pueden influir en el editor); no sustituyen leer el código ni la documentación canónica en `docs/`.

Alcance de este documento: **onboarding** (cómo empezar y qué leer primero).  
La **normativa técnica canónica** (tema -> fuente canónica -> regla corta) se mantiene en [docs/engineering/canonical-sources.md](../engineering/canonical-sources.md).

## Qué son y dónde están

- Son ficheros **`.mdc`** en [`.cursor/rules/`](../../.cursor/rules/) en la raíz del repo.
- Cada fichero = un **tema** (API, seguridad, Spring, tests, Kafka, etc.) para mantener el contexto **acotado** y coherente con el proyecto.

## Estructura de un `.mdc`

1. **Frontmatter YAML** entre `---` y `---`: metadatos que Cursor usa para decidir **cuándo** aplica la regla.
2. **Cuerpo en Markdown**: reglas **accionables** (qué hacer / qué no hacer). Lo detallado debe vivir en `docs/` y enlazarse desde aquí.

Ejemplo mínimo de cabecera:

```yaml
---
description: Breve descripción del tema
globs:
  - "services/**/*.java"
alwaysApply: false
---
```

## `alwaysApply`

- **`true`**: la regla entra en contexto **siempre** (cualquier chat o archivo).
- Úsalo solo para poco texto y **alto valor global** (p. ej. producto, calidad mínima). Cada línea extra suma ruido y tokens en **todas** las conversaciones.
- En este repo, las reglas globales cortas están marcadas así; el resto no.

## `globs`

- Lista de **patrones de ruta** (estilo gitignore). Si **`alwaysApply` es `false`**, la regla suele aplicarse cuando trabajas con archivos que **coinciden** con esos patrones (p. ej. solo Java bajo `services/`, solo `frontend/src`, solo OpenAPI bajo `docs/api`).
- Sirve para **no** cargar reglas de backend cuando solo editas frontend, y viceversa.

## Cómo usarlas tú (día a día)

1. **No tienes que “activar” reglas a mano** si Cursor ya las asocia por globs y por los archivos del chat.
2. Para encargos claros al agente: **nombra el objetivo**, adjunta **`@`** a ficheros relevantes (`AGENTS.md`, `docs/api/openapi.yaml`, el servicio concreto) y, si aplica, la **HU** o ticket del backlog.
3. **Orden de aprendizaje recomendado en este repo:**
   - [AGENTS.md](../../AGENTS.md) (mapa del monorepo y enlaces).
   - [docs/engineering/canonical-sources.md](../engineering/canonical-sources.md) (qué documento manda en cada tema).
   - Contrato HTTP: [docs/api/openapi.yaml](../api/openapi.yaml).
   - Reglas en [`.cursor/rules/`](../../.cursor/rules/): checklist [backend-generation-standard.mdc](../../.cursor/rules/backend-generation-standard.mdc) al tocar `services/`.

## Buenas prácticas al escribir o ampliar reglas

- **Cortas y concretas**; enlaza a `docs/` para tablas largas o decisiones estables.
- Evita duplicar lo mismo en tres `.mdc`; mejor un enlace y una sola fuente.
- Si varias reglas comparten el mismo glob, es normal que **varias** entren a la vez en un mismo fichero; por eso cada una debe ser breve.

## Relación con otras piezas de Cursor

- **`AGENTS.md`**: instrucciones de **ámbito repo** para agentes (no es sustituto de `.cursor/rules/`, se complementan).
- **Skills** (p. ej. [`.cursor/skills/.../SKILL.md`](../../.cursor/skills/encargo-mtl/SKILL.md)): plantillas o flujos de encargo; las reglas son **normas persistentes** por tipo de archivo o tema.
