# Refinamiento HU MTL (backlog -> historia detallada)

Skill para revisar y completar una historia de usuario a partir de `readme.md` y `docs/backlog/backlog.md`, generando un único documento de salida listo para refinamiento y desarrollo.

## Cómo usar (pasos)

1. Abre el chat del Agent.
2. Inserta esta skill:
   - con `/` y seleccionando `hu-refinement-mtl`, o
   - con `@` adjuntando `.cursor/skills/hu-refinement-mtl/SKILL.md`.
3. Añade en el mensaje **solo** la HU objetivo (`HU-XXX`).
4. Opcional: adjunta un borrador de historia si existe.

### Fuentes por defecto (automáticas)

- `readme.md`
- `docs/backlog/backlog.md`

No hace falta indicarlas en cada invocación salvo que quieras usar una variante.

---

## Prompt operativo (usar tal cual)

Actúa como Product Owner y analista de negocio.  
Tu trabajo es revisar y completar la historia **[HU-XXX]** usando como fuentes **`readme.md`** y **`docs/backlog/backlog.md`**.

### Entradas obligatorias

- [HU objetivo: HU-XXX]

### Fuentes base (siempre)

- `readme.md`
- `docs/backlog/backlog.md`

### Objetivo

- Validar que la información existente sea correcta.
- Comprobar si la historia cumple INVEST.
- Completar solo la información necesaria para refinamiento y desarrollo.

### Comprueba la información existente

- Título descriptivo.
- Historia en formato: "Como [rol], quiero [acción], para [beneficio]".
- Estimación de complejidad (S/M/L).
- Prioridad.

### Añade

- 3 criterios de aceptación en formato BDD con "Dado que / Cuando / Entonces".
- Evaluación breve contra INVEST.
- Esfuerzo estimado de implementación.
- Riesgos.
- Dependencias.
- Huecos o aclaraciones necesarias.

### Reglas

- No inventes información no respaldada por el readme o el backlog.
- Si detectas inconsistencias, indícalas.
- Si la historia es demasiado grande, dilo y propone división.
- Usa lenguaje claro, concreto y profesional.
- Devuelve la respuesta en markdown.
- Si hay huecos, listarlos en "Aclaraciones pendientes".
- **Si la HU ya tiene estimación y prioridad en backlog, no modificarlas salvo justificación explícita en una línea por cada cambio.**
- La salida debe seguir **exactamente** la estructura y estilo de `docs/backlog/HU-005-alta-de-ficha-de-arbol.md`.
- No omitir secciones obligatorias; si falta información, escribir explícitamente: `Pendiente de definición en refinamiento`.

### Estructura de salida (canónica)

1. `## 1. Validación de la información existente`
2. `## 2. Historia refinada`, incluyendo:
   - tabla inicial con `ID`, `Épica`, `Título`, `Estimación de complejidad`, `Prioridad`
   - bloque `**Historia de usuario**`
   - viñeta `**Entregable de la historia**`
   - `### Alcance` con `#### Incluye` y `#### Queda fuera de esta historia`
   - `### Dependencias`
   - `### Riesgos`
   - `### Aclaraciones pendientes (refinamiento)`
3. `## 3. Criterios de aceptación (BDD)`, incluyendo:
   - `### Referencias`
   - 3 escenarios numerados en formato `Dado que / Cuando / Entonces`
4. `## 4. Evaluación INVEST (resumen)` en tabla con columnas `Criterio` y `Comentario`
5. `## 5. Esfuerzo estimado de implementación`

### Salida final obligatoria

Genera un único documento Markdown siguiendo la estructura canónica anterior.

Restricciones adicionales de redacción:

- La historia de usuario debe estar en formato "Como... quiero... para..." y sin referencias en línea.
- Mantener encabezados, tablas y estilo markdown homogéneos con `HU-005-alta-de-ficha-de-arbol.md`.

Guarda el resultado en `docs/backlog/HU-XXX-<titulo-en-kebab-case>.md`.

---

## Restricciones de repositorio (MTL)

- Mantener separación de niveles:
  - `docs/backlog/backlog.md`: solo definición de HUs (sin tickets).
  - `docs/backlog/HU-xxx-ticket-breakdown.md`: detalle técnico y tickets.
- No crear tickets de trabajo en esta fase.
- No cambiar alcance funcional fuera de fuentes canónicas.
