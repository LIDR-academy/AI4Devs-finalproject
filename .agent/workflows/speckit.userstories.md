---
description: Genera User Stories por persona a partir del PRD cargado. Una sola User Story por User Persona, alineada con los requisitos del producto. Produce tickets de trabajo granulares (máx. 3 horas) listos para Jira.
handoffs:
  - label: Generar Tickets de Trabajo
    agent: speckit.worktickets
    prompt: Generar Work Tickets para las User Stories generadas
    send: true
  - label: Crear Especificación Técnica
    agent: speckit.specify
    prompt: Crear especificación técnica para la siguiente User Story
---

## User Input

```text
$ARGUMENTS
```

Si el argumento contiene una User Story específica para analizar, usar esa en lugar de
generar automáticamente.

## Outline

Este workflow implementa `BusinessAnalyst.ReviewPRDAndCalculateUserStories()` y
`BusinessAnalyst.GenerateUserStoriesAutomatically()` del proceso definido en `sudolang.sudo`.

### Prerrequisito

Verificar que `.specify/memory/prd-context.md` exista. Si no existe:
> ⚠️ Debes ejecutar primero `/speckit.prd` para cargar el PRD y definir las personas y requisitos.
> Detener aquí.

Leer `.specify/memory/prd-context.md` y extraer:
- Lista de User Personas
- Lista de Requisitos Funcionales

### 1. Modo de generación

Si `$ARGUMENTS` está vacío → **Generación automática** (paso 2A).
Si `$ARGUMENTS` contiene texto → **User Story específica** (paso 2B).

### 2A. Generación automática de User Stories

**Restricción crítica**: Generar **exactamente 1 User Story por User Persona**.

Para cada persona, generar una User Story siguiendo el formato:

```markdown
---
## User Story [N]: [Título corto]

**Persona**: [Nombre de la persona]
**Prioridad**: [Must-Have | Should-Have | Nice-to-Have]

**Historia**:
Como [persona], quiero [acción] para [beneficio/valor].

**Criterios de Aceptación**:
1. **Dado** [contexto inicial], **Cuando** [acción], **Entonces** [resultado esperado].
2. **Dado** [contexto inicial], **Cuando** [acción], **Entonces** [resultado esperado].
3. **Dado** [contexto inicial], **Cuando** [acción], **Entonces** [resultado esperado].

**Requisitos cubiertos**: [RF-xxx, RF-xxx]

**Fuera de scope**: [Lo que esta US NO cubre explícitamente]

**Notas técnicas (para tickets)**: [Consideraciones relevantes para el desarrollo]
---
```

**Reglas de priorización**:
- P1 Must-Have: La historia que define el MVP y entrega valor core al producto.
- P2 Should-Have: Mejoran la experiencia pero no bloquean el lanzamiento.
- P3 Nice-to-Have: Deseables a futuro.

Asignar prioridad justificando brevemente.

### 2B. Análisis de User Story específica

Tomar el texto pegado en `$ARGUMENTS` y:
1. Verificar que la historia esté alineada con el PRD y las personas definidas.
2. Si no está alineada: indicar "Esta User Story está fuera del scope y por qué."
3. Si está alineada: completar el formato estándar del paso 2A con los datos derivados.

### 3. Validación de User Stories

Para cada User Story generada verificar:
- [ ] Tiene exactamente 1 persona asignada.
- [ ] Los criterios de aceptación son testeables (no vagos).
- [ ] Cubre al menos un RF del PRD.
- [ ] No solapa con otra User Story del mismo set.
- [ ] Está dentro del scope de arteflujo.

Si alguna falla, corregir antes de continuar.

### 4. Presentar al usuario

Mostrar todas las User Stories generadas con el formato estándar.

Preguntar:
> ¿Deseas proceder con la generación de Tickets de Trabajo para la **primera User Story (P1)**?
> Responde **Sí** para continuar, **No** para modificar alguna historia, o indica el número
> de historia con la que quieres empezar.

### 5. Persistir en memoria

Escribir `.specify/memory/user-stories.md` con todas las User Stories en formato estándar,
precedidas de:

```markdown
# User Stories: [NOMBRE DEL PROYECTO]

**Generado**: [FECHA ISO]
**Total**: [N] User Stories
**Personas cubiertas**: [lista]

[User Stories en formato estándar]
```

### 6. Reporte final

- ✅ N User Stories generadas
- Tabla resumen: Persona | User Story | Prioridad
- Próximo paso: `/speckit.worktickets` para generar los tickets de trabajo
