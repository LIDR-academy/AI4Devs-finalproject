---
name: generate-product-backlog
description: >-
  Genera el documento docs/product-backlog.md en español a partir del PRD
  (docs/ConRutina-PRD.md) y del código fuente: User Stories con INVEST, AC en Gherkin,
  MoSCoW, validación de consistencia, backlog priorizado, matriz resumen, roadmap Mermaid
  por sprints y tickets de desarrollo con story points. Usar cuando el usuario pida
  product backlog, backlog ágil, desglose en tickets, MoSCoW sobre ConRutina, o invoque
  generate-product-backlog o /generate-product-backlog.
---

# generate-product-backlog — Product Backlog desde PRD (ConRutina)

## Objetivo

Actuar como **Product Owner** y **Project Manager** expertos en metodologías ágiles. Analizar el PRD del proyecto **ConRutina** y el **código fuente actual** del repositorio, y **generar o sobrescribir** el fichero:

`docs/ConRutina-Product-Backlog.md`

El documento debe ser **Markdown** en **español**, autocontenido y listo para uso en planificación.

**No** enlazar ni depender de otros ficheros de la skill; toda la norma está en este `SKILL.md`.

---

## Entradas que el agente debe usar

1. **PRD:** `docs/ConRutina-PRD.md` (si el usuario adjunta otra ruta con `@`, usar esa como PRD de referencia, pero el **nombre de salida** sigue siendo `docs/ConRutina-Product-Backlog.md` salvo que el usuario pida explícitamente otra ruta en el mismo mensaje).
2. **Código:** explorar el repositorio (frontend, backend, prisma, docker, tests) para marcar en cada User Story el **estado actual** (implementado / parcial / pendiente) y detectar huecos respecto al MVP del PRD.

---

## Rol 1 — Product Owner (definición del backlog de historias)

### 1.1 Análisis previo

- Leer el PRD completo (funciones, casos de uso, modelo de datos, API, diseño, no-goals).
- Inspeccionar el código para listar qué está hecho, qué es prototipo en memoria/local y qué falta.
- **Detectar aspectos imprescindibles para un primer MVP** que el PRD asuma pero el código no cubra (persistencia, APIs, bloqueo semanal, auth futura, tests, despliegue, etc.) y convertirlos en User Stories o en **requisitos no funcionales** explícitos.

### 1.2 Requisitos no funcionales (añadir si faltan en el PRD)

Incluir al menos historias o secciones dedicadas a: **escalabilidad**, **seguridad**, **mantenibilidad**, **disponibilidad** / operación (ej. despliegue, observabilidad básica, rendimiento), alineados con el stack del repo.

### 1.3 Lista de User Stories (bloque obligatorio en el documento)

Para **cada** User Story:

| Elemento | Regla |
|---|---|
| **Título** | Conciso, claro, descriptivo (una línea). |
| **Formato** | `Como [rol], quiero [acción], para [beneficio]`. |
| **INVEST** | Tabla o lista breve: Independent, Negotiable, Valuable, Estimable, Small, Testable — una frase corta por criterio. |
| **Acceptance Criteria** | **BDD / Gherkin**: bloques `Feature` opcional; al menos varios `Scenario` con pasos **Given / When / Then**. |
| **Cobertura de AC** | Incluir **happy path**, **edge cases** sugeridos y **errores habituales** (validación, API caída, conflicto, permisos, datos inconsistentes). |
| **Estimación** | **Complejidad** por historia: `S`, `M` o `L` (una letra). Opcional: **Story Points** por historia (número entero, Fibonacci habitual). |
| **MoSCoW** | Una etiqueta por historia: **Must have**, **Should have**, **Could have**, **Won't have** (este último solo si el usuario o el PRD excluyen algo de forma explícita). |
| **Estado en código** | Línea breve: implementado / parcial / pendiente respecto al repo actual. |

**Incluir** historias ya implementadas en el código si el PRD las describe (para trazabilidad PRD ↔ producto).

### 1.4 Identificador de historias

Prefijo recomendado: `US-01`, `US-02`, … en orden estable (tabla de contenidos o índice al inicio del doc).

---

## Rol 1 (continuación) — Validación de consistencia

Añadir un **bloque dedicado** que:

- Relacione historias dependientes (texto + diagrama **Mermaid** `graph` o `flowchart` con nodos `US-xx`).
- Señale **inconsistencias o riesgos** (orden de implementación, datos duplicados, definiciones contradictorias entre US, dependencias circulares).
- Proponga **ajustes mínimos** (sin reescribir el PRD) para alinear el backlog.

---

## Rol 1 (continuación) — Diseño del backlog priorizado

Segundo bloque grande del documento:

- **Lista ordenada** de User Stories para el MVP según **MoSCoW** y orden sugerido de trabajo.
- Explicar **explícitamente** la priorización usando estos criterios (párrafo o tabla por historia o por grupo):
  - Valor para el negocio / usuario
  - Urgencia
  - Dependencias
  - Coste de implementación (esfuerzo y complejidad S/M/L)
  - Riesgos y obstáculos
  - Madurez tecnológica

---

## Matriz resumen (tabla obligatoria)

Incluir una **tabla Markdown** con el backlog ordenado y columnas exactas:

| Columna |
|---|
| **Item** (id US + título corto) |
| **Impacto usuario / negocio** |
| **Urgencia** |
| **Complejidad** (S/M/L) |
| **Riesgos / dependencias** |
| **MoSCoW** |

Opcional: columna extra **SP** (story points de la historia) si se estimaron.

---

## Roadmap en Mermaid (obligatorio)

Un diagrama **Mermaid** (tipo `gantt` o `timeline`) que muestre el backlog **priorizado por Sprints**. Reglas:

- Cada sprint agrupa conjuntos de US que entreguen **funcionalidad completa** (incremento coherente, no “medio endpoint” suelto).
- Etiquetar sprints (ej. Sprint 1, Sprint 2, …) y, si es posible, ventanas de tiempo relativas o fechas si el usuario las ha dado; si no hay fechas, usar duración relativa (ej. “2 semanas”) sin inventar calendario concreto.

---

## Rol 2 — Project Manager (tickets de desarrollo)

Tercer bloque grande: **desglosar cada User Story** en los **tickets** necesarios para desarrollar y entregar el MVP.

### Reglas por ticket

| Elemento | Regla |
|---|---|
| **Nombre** | Breve, conciso, claro, descriptivo (título de ticket tipo Jira/Linear). |
| **Vinculación** | Indicar de forma inequívoca la **User Story** (ej. `US-12` o “Pertenece a: US-12 — …”). |
| **Contenido** | Incluir: contexto técnico, alcance, **partes relevantes de la US** (objetivo, restricciones), **Acceptance Criteria** o referencia textual a los escenarios BDD que aplica, **happy path** resumido, **edge cases** y **errores** que el ticket debe cubrir. |
| **Estimación** | **Complejidad** `S` / `M` / `L` por ticket. |
| **Story points** | **Unidades explícitas**: puntos de historia por ticket (entero; misma escala que las US o subdivisión coherente). |
| **Tipo** | Etiqueta breve opcional: Backend, Frontend, DB, Test, Infra, Docs. |

### Formato sugerido de ID de ticket

`T-[número de US]-[secuencial]` (ej. `T-04-02`) o equivalente consistente en todo el documento.

### Cobertura

- Toda **User Story** del backlog debe tener **al menos un ticket** salvo que el usuario pida explícitamente excluir historias Won't have.
- Los tickets pueden agruparse por sprint en subsecciones si encaja con el roadmap.

---

## Estructura del fichero `docs/ConRutina-Product-Backlog.md`

Usar esta jerarquía de secciones (ajustar numeración si hace falta, mantener el orden lógico):

1. Título, versión, fecha (mes/año o fecha que el usuario indique), estado (borrador/MVP).
2. **Tabla de contenidos** con enlaces internos Markdown.
3. **User Stories** (definiciones completas según la sección «Lista de User Stories» arriba).
4. **Validación de consistencia** entre historias relacionadas.
5. **Backlog priorizado** (criterios de priorización descritos arriba).
6. **Matriz resumen** (tabla obligatoria).
7. **Roadmap por Sprints** (Mermaid).
8. **Tickets de desarrollo** (desglose PM).
9. **Resumen final** opcional: totales de SP, conteo de US/tickets, supuestos.

---

## Idioma y calidad

- Redactar el documento generado en **español** (términos ágiles en inglés permitidos: Sprint, MoSCoW, Given/When/Then).
- **Tablas y diagramas Mermaid** válidos (probar sintaxis: comillas en etiquetas de nodos si hay saltos de línea o caracteres especiales).
- Evitar el carácter de sección «§» en el documento generado para el usuario final (puede renderizar mal en algunos visores).

---

## Flujo de trabajo del agente (checklist)

1. Leer `docs/ConRutina-PRD.md` (o PRD sustituto indicado por `@`).
2. Explorar código (lectura/grep) para estado real de implementación.
3. Redactar todas las US + NFR necesarios + MoSCoW + S/M/L + BDD.
4. Escribir validación de consistencia con diagrama Mermaid.
5. Ordenar backlog MVP con criterios de priorización declarados.
6. Insertar **matriz resumen** y **roadmap Mermaid**.
7. Desglosar **cada US** en tickets con SP y complejidad.
8. **Escribir** el fichero `docs/ConRutina-Product-Backlog.md` (crear `docs/` si no existe).
9. Responder al usuario con **ruta del fichero** y un **resumen ejecutivo** de 5–10 líneas (sin pegar el documento entero en el chat).

---

## Invocación

- Frases como: “Genera el product backlog con la skill generate-product-backlog”, “Actualiza ConRutina-Product-Backlog.md desde el PRD”, “Backlog MoSCoW + tickets para ConRutina”.
- Slash-command del proyecto: **`/generate-product-backlog`** (debe cargar y seguir esta skill; salida: `docs/ConRutina-Product-Backlog.md`).

---

## Plantilla mínima de una User Story (copiar y repetir en el documento generado)

Estructura obligatoria (Markdown en el fichero de salida):

- Encabezado: `### US-XX · [Título conciso]`
- Línea **Como / quiero / para** en negritas como en el prompt original.
- Línea **Estado en código:** con emoji ✅ / 🟡 / ❌ y una frase de evidencia.
- Bloque **INVEST** (tabla de 6 filas o lista breve: Independent, Negotiable, Valuable, Estimable, Small, Testable).
- Línea con **Complejidad** (`S`/`M`/`L`), **MoSCoW** (Must/Should/Could/Won't have) y **Story Points** (entero).
- Subsección **Acceptance Criteria (BDD):** seguida de uno o más bloques de código con lenguaje `gherkin`, cada uno con varios `Scenario:` y pasos `Given` / `When` / `Then` (happy path, edge cases, errores habituales).

---

## Plantilla mínima de un ticket (copiar y repetir bajo la US correspondiente)

Estructura obligatoria por ticket:

- Encabezado: `#### T-XX-YY · [Título breve del ticket]`
- Viñeta **User Story:** `US-XX` y título idéntico al de la US.
- Viñeta **Tipo:** Backend | Frontend | DB | Test | Infra | Docs (el que aplique).
- Viñeta **Complejidad** y **Story Points** (entero).
- Línea **Estado en código:** con emoji ✅ / 🟡 / ❌ (por defecto ❌ Pendiente; ✅ al archivar el change OpenSpec del ticket si `openspec:mark-ticket` tiene éxito — fallo no bloquea el archivado).
- Párrafo **Descripción** (qué hacer técnicamente).
- **Alcance / Definición de hecho:** checklist corto.
- **Criterios / BDD que cubre:** referencia a escenarios de la US.
- **Happy path:** pasos numerados breves.
- **Edge cases y errores:** viñetas.
- **Dependencias:** otros tickets o US si aplica.

---

## Límites y criterios de completitud de la skill

- El agente **debe** materializar el resultado en **`docs/ConRutina-Product-Backlog.md`** salvo instrucción explícita del usuario en el mensaje para otra ruta.
- El documento debe ser **autónomo** (quien lo lea no necesita abrir este SKILL).
- Si falta el PRD en la ruta esperada, **buscar** `**/ConRutina-PRD.md` o pedir al usuario la ruta en **una** pregunta concreta y no generar el archivo hasta tener PRD.

---

*Skill autocontenida para el repositorio ConRutina. Actualizar este SKILL solo si cambian las reglas de salida o el nombre del fichero objetivo acordado por el equipo.*
