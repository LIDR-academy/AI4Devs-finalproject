---
description: Genera Work Tickets granulares (máx. 3 horas) para cada User Story, en formato Jira-ready. Incluye un documento de especificación BDD y un plan de pruebas descargable.
handoffs:
  - label: Convertir Tickets a Issues de GitHub
    agent: speckit.taskstoissues
    prompt: Convertir los Work Tickets generados en GitHub Issues
    send: true
  - label: Analizar Consistencia
    agent: speckit.analyze
    prompt: Verificar consistencia entre User Stories y Work Tickets
    send: true
---

## User Input

```text
$ARGUMENTS
```

Si el argumento especifica el número o título de una User Story concreta, generar tickets
solo para esa. Si está vacío, generar tickets para la primera User Story (P1).

## Outline

Este workflow implementa `SoftwareArchitectAndTechLead.GenerateWorkTickets()` y
`SoftwareArchitectAndTechLead.GenerateDocumentationAndTestPlan()` del proceso definido en
`sudolang.sudo`.

### Prerrequisito

Verificar que los siguientes archivos existan:
- `.specify/memory/prd-context.md` — contexto del PRD
- `.specify/memory/user-stories.md` — User Stories generadas

Si falta alguno:
> ⚠️ Debes ejecutar primero `/speckit.prd` y luego `/speckit.userstories`.
> Detener aquí.

Leer ambos archivos. Adicionalmente leer `.specify/memory/constitution.md` para alinear
los tickets con los principios arquitecturales del proyecto.

### 1. Seleccionar User Story objetivo

- Si `$ARGUMENTS` especifica una historia → usar esa.
- Si `$ARGUMENTS` está vacío → usar la User Story con prioridad P1 (Must-Have).

Mostrar al usuario cuál historia se va a procesar antes de continuar.

### 2. Descomponer en Work Tickets

Para cada User Story seleccionada, generar todos los tickets necesarios siguiendo las reglas:

**Regla crítica de tamaño**: Ningún ticket puede superar **3 horas de esfuerzo estimado**.
Si una tarea requiere más tiempo, DEBE descomponerse en sub-tickets.

**Capas a cubrir** (según la arquitectura de arteflujo):
- 🗄️ **Backend** (NestJS): módulos, servicios, DTOs, endpoints
- 🎨 **Frontend** (Next.js): componentes, páginas, hooks, servicios client-side
- 🗃️ **Base de datos**: migraciones, modelos de PostgreSQL
- 🔒 **Seguridad**: validaciones JWT, RBAC, sanitización (si aplica)
- 🧪 **Pruebas**: unitarias, integración, E2E (si aplica)

**Formato de cada ticket**:

```markdown
---
### [ID-XXX] [Título del Ticket]

**Tipo**: Backend | Frontend | Base de datos | Seguridad | Prueba
**User Story**: [US-N: Título]
**Prioridad**: Alta | Media | Baja
**Estimación**: [X horas] (máx. 3h)
**Dependencias**: [ID-XXX, ID-XXX o "Ninguna"]

**Descripción**:
[Qué debe implementarse y por qué, en 2-4 oraciones.]

**Criterios de Aceptación**:
- [ ] [Condición verificable 1]
- [ ] [Condición verificable 2]
- [ ] [Condición verificable 3]

**Tareas Técnicas**:
1. [Paso técnico específico 1]
2. [Paso técnico específico 2]
3. [Paso técnico específico 3]

**Notas**:
[Consideraciones de implementación, referencias a la constitución o al modelo de datos.]
---
```

**Nomenclatura de IDs**: `[SIGLAS-PROYECTO]-[NNN]` → Ejemplo: `ARF-001`, `ARF-002`, …

### 3. Ordenar por dependencias

Construir y mostrar el grafo de dependencias de los tickets generados:
- Identificar qué tickets bloquean a otros
- Sugerir orden de ejecución
- Marcar cuáles pueden ejecutarse en paralelo

### 4. Generar Documento de Especificación BDD

Crear `.specify/memory/specs/[US-N]-bdd.md`:

```markdown
# Especificación BDD: [Título de la User Story]

**User Story**: [US-N]
**Fecha**: [FECHA ISO]

## Feature: [Nombre del Feature]

### Scenario: [Título del escenario 1]
  Given [contexto]
  When [acción]
  Then [resultado]

### Scenario: [Título del escenario 2]
  Given [contexto]
  When [acción]
  Then [resultado]

[Un Scenario por cada criterio de aceptación de la User Story]
```

### 5. Generar Plan de Pruebas

Crear `.specify/memory/specs/[US-N]-test-plan.md`:

```markdown
# Plan de Pruebas: [Título de la User Story]

**User Story**: [US-N]
**Fecha**: [FECHA ISO]

## Unitarias (Backend — Jest)
| ID | Componente | Caso de prueba | Resultado esperado |
|----|-----------|----------------|--------------------|
| UT-001 | [Servicio/Módulo] | [Caso] | [Resultado] |

## Integración
| ID | Endpoint/Flujo | Caso de prueba | Resultado esperado |
|----|---------------|----------------|--------------------|
| IT-001 | [Endpoint] | [Caso] | [Resultado] |

## E2E (Playwright/Cypress)
| ID | Flujo de usuario | Pasos | Resultado esperado |
|----|------------------|-------|--------------------|
| E2E-001 | [Flujo] | [Pasos] | [Resultado] |

## Casos límite y error
- [Escenario de error 1 y comportamiento esperado]
- [Escenario de error 2 y comportamiento esperado]
```

### 6. Preguntar sobre la siguiente User Story

```
¿Deseas proceder con la generación de tickets para la siguiente User Story?
Responde Sí para continuar con [US-N+1] o No para finalizar.
```

Si el usuario responde **Sí** → repetir el proceso desde el paso 1 con la siguiente historia.
Si responde **No** → ejecutar el paso 7.

### 7. Reporte final (FinalOutput)

Mostrar:

```
✅ Work Tickets generados
───────────────────────────────────────
User Stories procesadas : [N]
Total de tickets        : [N]
Tickets de Backend      : [N]
Tickets de Frontend     : [N]
Tickets de BD           : [N]
Tickets de Pruebas      : [N]
───────────────────────────────────────
Artefactos generados:
  📄 .specify/memory/specs/[US-N]-bdd.md
  📄 .specify/memory/specs/[US-N]-test-plan.md

Commit sugerido:
  feat: add work tickets and BDD spec for [User Story title]
```

Próximo paso sugerido: `/speckit.taskstoissues` para convertir los tickets en GitHub Issues.
