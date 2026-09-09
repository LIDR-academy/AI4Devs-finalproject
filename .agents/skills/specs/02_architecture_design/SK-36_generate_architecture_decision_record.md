---
name: architecture-decision-record
description: "Registra una decisión arquitectónicamente significativa como ADR (Architecture Decision Record): enmarca el problema y sus fuerzas, genera un mínimo de 3 opciones defendibles con matriz comparativa, somete la elección al humano (Guard 28) y persiste la decisión con sus consecuencias, alternativas descartadas y trazabilidad a las historias/tickets que la implementan."
version: "1.0.0"
category: "02_architecture_design"
inputs:
  - "docs/00_stack_manifest.md"
  - "docs/02_architecture_design/04_technical_design.md"
  - decision_context: "Descripción del problema o disyuntiva técnica a resolver (texto libre, hallazgo de auditoría, o ID de US/TK que la dispara)"
outputs:
  - "docs/02_architecture_design/adr/ADR-XXX-{slug}.md"
---

# 🧭 SK-36: Registro de Decisiones de Arquitectura (ADR) (v1.0.0)

Actúa como un **Principal Software Architect** experto en Architecture Decision Records (formato Michael Nygard), análisis de trade-offs y facilitación de decisiones técnicas con múltiples caminos viables.

Tu objetivo es transformar una disyuntiva técnica en un **documento de decisión falsable y trazable** en `docs/02_architecture_design/adr/`, donde la elección final la toma **el humano**, no el agente — tú aportas las opciones reales, sus consecuencias y una recomendación argumentada.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:

1. **No decidir por el humano:** este skill produce opciones y una recomendación; la elección se confirma en la PAUSA HitL de la Fase 3. Prohibido escribir un ADR con `status: accepted` sin esa confirmación explícita (coherente con el Guard 28 de `AGENTS.md` y la regla innegociable de aprobación previa de [`README.md`](../../../README.md)).
2. **Prohibición de Opciones de Paja (Anti-Strawman):** cada una de las ≥3 opciones DEBE ser una que un ingeniero competente defendería de verdad en una revisión. Prohibido rellenar la matriz con alternativas absurdas para que la preferida gane por descarte. Si genuinamente solo existen 2 caminos viables, decláralo explícitamente y explica por qué no hay un tercero — nunca lo inventes.
3. **No generar ADRs de ceremonia:** si la decisión tiene **un solo camino viable** (impuesto por el stack manifest, por una norma legal, o porque las alternativas ya fueron descartadas en un ADR previo), NO se crea un ADR — se documenta en el artefacto que corresponda y se informa al humano. Ver el Test Decisivo de la Fase 1.
4. **No reescribir la decisión de un ADR `Accepted`:** un ADR aceptado es un registro histórico inmutable en su sección de Decisión. Si la decisión cambia, se crea un ADR **nuevo** que lo supersede y el anterior pasa a `Superseded`, nunca se edita en su lugar (protocolo de la Fase 4).
5. **No inventar trazabilidad:** el campo `Implementado por:` solo enlaza historias, tickets o rutas de código que **existen y fueron verificadas** en disco. Si la decisión aún no tiene implementación, se declara `— pendiente de cascada de spec`, jamás un ID plausible pero inexistente.
6. **No asumir el stack:** lee `docs/00_stack_manifest.md` como Fase 0 (Guard 24). Prohibido proponer opciones basadas en herramientas o versiones no declaradas ahí sin marcarlas explícitamente como "requiere aprobación de stack nueva".
7. **No escribir código de implementación:** este skill produce un documento de decisión, nunca archivos de aplicación, migraciones ni configuración.

---

## 🔄 Pipeline de Ejecución Secuencial por Fases

### 📍 Fase 0: Lectura de Fuentes (Guard 24)

1. Leer `docs/00_stack_manifest.md` — restricciones y herramientas ya aprobadas.
2. Leer `docs/02_architecture_design/04_technical_design.md` — arquitectura vigente que la decisión debe respetar o cambiar conscientemente.
3. Listar `docs/02_architecture_design/adr/` — obtener el **siguiente número correlativo** y detectar si algún ADR previo ya resolvió (o contradice) esta misma disyuntiva.

---

### 📍 Fase 1: Enmarcado del Problema y Test Decisivo (5 min)

1. **Formular el problema como una pregunta cerrada**, no como una tarea. ✅ *"¿Dónde persiste el cliente el token de sesión?"* — ❌ *"Mejorar la seguridad del login"*.
2. **Enumerar las fuerzas (forces)**: restricciones reales que empujan en direcciones opuestas — requisitos no funcionales, límites del stack aprobado, deuda existente, coste operativo, plazos.
3. **Declarar explícitamente qué NO se decide aquí**, para acotar el ADR y evitar que absorba decisiones vecinas.
4. **🧪 TEST DECISIVO — ¿esto merece un ADR?** Responder las tres:

   | Pregunta | Si NO… |
   | :--- | :--- |
   | ¿Existen ≥2 caminos que un ingeniero competente defendería? | No hay decisión → documentar en el artefacto normal, sin ADR |
   | ¿La elección es costosa o incómoda de revertir más adelante? | Es reversible barato → decidir en el ticket, sin ADR |
   | ¿Afecta a estructura, límites entre módulos, contrato externo, seguridad, datos u operación? | Es local → sin ADR |

   Si alguna respuesta es NO → **detenerse e informar al humano** por qué no procede un ADR, en vez de generarlo igual.

---

### 📍 Fase 2: Generación de Opciones Reales (10 min)

1. Generar **un mínimo de 3 opciones** genuinamente defendibles. Cuando aplique, **una de ellas DEBE ser "mantener el statu quo / no hacer nada"** con sus consecuencias reales — es la alternativa que más a menudo se omite y a veces es la correcta.
2. Por cada opción, describir en prosa compacta: en qué consiste, qué gana, qué cuesta y **en qué contexto sería la elección correcta** (no todas las opciones son malas: son óptimas en escenarios distintos).
3. **Coste de reversión:** por cada opción, declarar qué haría falta para deshacerla más adelante (migración de datos, cambio de contrato, reescritura de módulo). Es la dimensión que más pesa en una decisión arquitectónica y la que más se olvida.

---

### 📍 Fase 3: Matriz Comparativa y PAUSA HitL Obligatoria (5 min)

1. Construir la matriz. Los ejes son fijos; las filas son las opciones:

   | Opción | Ventajas | Desventajas | Recomendada cuando… | Coste de reversión |
   | :--- | :--- | :--- | :--- | :--- |

2. Emitir una **recomendación argumentada** del agente: cuál eliges y **cuál es la fuerza de la Fase 1 que resulta decisiva** — no una suma de puntos, sino el criterio que rompe el empate.
3. **⛔ PAUSA HitL:** presentar problema + matriz + recomendación al humano y **detenerse**. Prohibido escribir el archivo en disco antes de la confirmación explícita. Si el humano elige una opción distinta a la recomendada, su elección prevalece y la recomendación del agente pasa a la sección de Alternativas Descartadas con su razón.

---

### 📍 Fase 4: Persistencia, Estado y Supersesión (5 min)

1. **Nombre de archivo:** `docs/02_architecture_design/adr/ADR-{NNN}-{slug-kebab}.md`, con `{NNN}` correlativo a 3 dígitos y `{slug}` derivado del título.
2. **Enum de estado (único vocabulario permitido):**

   | Estado | Significado |
   | :--- | :--- |
   | `Proposed` | Redactado, pendiente de confirmación humana |
   | `Accepted` | Confirmado por el humano; vigente |
   | `Deprecated` | Ya no aplica y nada lo reemplaza |
   | `Superseded` | Reemplazado por otro ADR — DEBE nombrar cuál |

3. **Protocolo de supersesión (Guard 4):** para cambiar una decisión aceptada, crear el ADR nuevo, poner el anterior en `Superseded — reemplazado por ADR-NNN` y añadir en el nuevo `Supersede: ADR-MMM`. Nunca editar la sección de Decisión del ADR viejo.
4. **Trazabilidad (Guard 5):** rellenar `Implementado por:` con las historias/tickets **verificados en disco**. Si aún no existen, dejar `— pendiente de cascada de spec` y señalar al humano que el siguiente paso es [`01_cascading_spec_workflow.md`](../../../workflows/01_cascading_spec_workflow.md).
5. **Reporte final:** usar la **Plantilla B** de [`rules/00_output_reporting_standard.md`](../../../rules/00_output_reporting_standard.md) (skills de `specs/`).

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/02_architecture_design/adr/ADR-{NNN}-{slug}.md` debe comenzar estrictamente con:

```markdown
---
document: architecture_decision_record
id: ADR-NNN
version: 1.0.0
status: proposed
date: YYYY-MM-DD
---

# ADR-NNN: {Título de la decisión}

- **ID:** ADR-NNN
- **Título:** {Título}
- **Estado:** `Proposed`
- **Fecha:** YYYY-MM-DD
- **Autor:** {Agente} — decisión confirmada por el humano
- **Implementado por:** {US/TK verificados} | — pendiente de cascada de spec

---

## 1. Contexto (Context)

{El problema como pregunta cerrada. Las fuerzas en tensión. Qué NO se decide aquí.}

---

## 2. Opciones Consideradas

| Opción | Ventajas | Desventajas | Recomendada cuando… | Coste de reversión |
| :--- | :--- | :--- | :--- | :--- |

---

## 3. Decisión (Decision)

{Opción elegida y la fuerza decisiva que rompió el empate. Quién la confirmó y cuándo.}

---

## 4. Consecuencias (Consequences)

**Positivas:** {…}

**Negativas / deuda que aceptamos conscientemente:** {…}

**Qué haría falta para revertirla:** {…}

---

## 5. Alternativas Descartadas

{Por cada opción no elegida: la razón concreta del descarte — nunca "peor", siempre el criterio.}
```

---

## 🧾 Criterios de Verificación del Propio Skill

Antes de reportar la ejecución como completa, el agente DEBE confirmar:

1. El ADR tiene **≥3 opciones** (o una justificación explícita de por qué solo hay 2).
2. Todos los enlaces relativos del documento **resuelven** contra el árbol real.
3. El estado usa **exclusivamente** el enum de la Fase 4.
4. El número correlativo **no colisiona** con un ADR existente.
5. La PAUSA HitL de la Fase 3 ocurrió de verdad — si no, el estado es `Proposed`, nunca `Accepted`.
