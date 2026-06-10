# Registro de Prompts · INK·LINK

> Historial completo de prompts del proyecto con metadatos de ejecución.

## Convención de metadatos

Cada prompt incluye una línea de metadatos con el formato:

```
> 📋 {fecha UTC} · {source} · {modelo} · {thinking} · {contexto} · {usuario}
```

| Campo | Descripción |
|---|---|
| Fecha UTC | Timestamp ISO 8601 del envío |
| Source | Herramienta desde donde se ejecutó |
| Modelo | Modelo de IA utilizado |
| Thinking | Nivel de razonamiento (low / medium / high) |
| Contexto | Tamaño aproximado del contexto |
| Usuario | Quien ejecutó el prompt |

---

# Sesión 1 — Cambio de stack tecnológico

> 📅 2026-06-09 · VS Code · Copilot Agent Mode

---

## 01 — Ejecutar prompt de cambio de stack

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
Ejecuta el prompt de este archivo & 'c:\repo\ai4devs\AI4Devs-finalproject\prompts\02-cambiar stack tech.md'
```

---

## 02 — Contenido del prompt ejecutado (`02-cambiar stack tech.md`)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
Modifica los archivos ai-specs/agents/backend-developer.md, ai-specs/agents/frontend-developer.md,
ai-specs/docs/backend-standards.md, ai-specs/docs/frontend-standards.md
para que adopten el stack tecnológico de este proyecto, que es: netcore 10 C#, base de datos PostgreSQL, Angular 20.

IMPORTANTE:
- solo modifica el stack tecnológico, no modifiques ni elimines referencias a otras tecnologías
  o herramientas, como docker, git, etc.
- Genera un plan y preguntame antes de continuar por cada archivo.
```

---

## 03 — Aprobación: archivo 1 (backend-developer.md)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
sí, procede
```

*(aprueba el plan para ai-specs/agents/backend-developer.md: TypeScript/Node.js/Express/Prisma/Jest → C#/.NET Core 10/ASP.NET Core/EF Core/xUnit)*

---

## 04 — Aprobación: archivo 2 (frontend-developer.md)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
si
```

*(aprueba el plan para ai-specs/agents/frontend-developer.md: React/React Router/React Bootstrap/axios → Angular 20/Angular Router/Angular Material/HttpClient)*

---

## 05 — Corrección de ruta: archivos de docs en raíz

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
no lo crees, el archivo está en la carpeta docs de la raiz
```

*(corrección: los archivos backend-standards.md y frontend-standards.md están en docs/ de la raíz, no en ai-specs/docs/)*

---

## 06 — Aprobación: archivo 3 (docs/backend-standards.md)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
si,cambia todo
```

*(aprueba reescritura completa de docs/backend-standards.md con .NET Core 10/C#/ASP.NET Core/EF Core/xUnit)*

---

## 07 — Aprobación: archivo 4 (docs/frontend-standards.md)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
si
```

*(aprueba reescritura completa de docs/frontend-standards.md con Angular 20/Angular Material/HttpClient/signals)*

---

## 08 — Guardar prompts de la sesión

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
Todos los prompts que usamos en esta sesion grabalos en el archivo prompts/00-all-prompts.md
```

---

## 09 — Generación de documentación técnica (meta-prompt)

> 📋 2026-06-09 · VS Code · n/d · n/d · n/d · rodri

```
Genera un prompt especializado para IA (meta prompt) en base al archivo initial.md y guarda este
prompt en un archivo llamado master-prompt-docs.md dentro de la carpeta prompts de la raiz del proyecto
```

*(Genera prompts/master-prompt-docs.md con rol, contexto, misión y restricciones para producir docs/documentacion.md)*

---

## Resumen de archivos modificados (sesión 1)

| Archivo | Stack anterior | Stack nuevo |
|---|---|---|
| `ai-specs/agents/backend-developer.md` | TypeScript / Node.js / Express / Prisma / Jest | C# / .NET Core 10 / ASP.NET Core / EF Core / xUnit |
| `ai-specs/agents/frontend-developer.md` | React / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |
| `docs/backend-standards.md` | Node.js / TypeScript / Prisma / Jest | .NET Core 10 / C# / EF Core / xUnit |
| `docs/frontend-standards.md` | React 18 / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |

---

# Sesión 2 — Documentación técnica, agentes y coherencia

> 📅 2026-06-10 (mañana) · VS Code · Copilot Agent Mode · Claude Opus 4.6 (Anthropic) · Thinking: High

---

## 10 — Plan de ejecución para documentación

> 📋 2026-06-10T07:02:22Z · VS Code · Claude Opus 4.6 · High · ~20K tokens · rodri

```
Genera un plan detallado para master-prompt.md y grabalo en master-prompt-docs-plan.md para revisarlo
```

*(Genera prompts/master-prompt-docs-plan.md con checklist verificable, entidades, decisiones y validaciones cruzadas)*

---

## 11 — Ejecución del plan

> 📋 2026-06-10T07:08:35Z · VS Code · Claude Opus 4.6 · High · ~25K tokens · rodri

```
ejecuta el plan de master-prompt-docs-plan.md
```

*(Genera docs/documentacion.md completo: descripción, Lean Canvas, 3 casos de uso, modelo de datos ER, arquitectura y diagramas C4)*

---

## 12 — Corrección de errores Mermaid en documentacion.md

> 📋 2026-06-10T07:14:46Z · VS Code · Claude Opus 4.6 · High · ~40K tokens · rodri

```
Revisa y corrige el archivo documentacion.md generado recién, tiene algunos errores como este:
**Unable to render rich display**

Parse error on line 24:...de reserva S-->>Note over S: Notific---^Expecting '+', '-', '()', 'ACTOR', got 'note'

o este

**Unable to render rich display**

Parse error on line 15:...Completa" PA-->>Note over PA: Artist---^Expecting '+', '-', '()', 'ACTOR', got 'note'
```

*(Corrige sintaxis Mermaid: `S-->>Note over S:` → `Note over S:` como declaración independiente)*

---

## 13 — Creación de agente Technical Product Owner

> 📋 2026-06-10T07:31:00Z · VS Code · Claude Opus 4.6 · High · ~45K tokens · rodri

```
Crea un agente Product Owner Técnico (Technical Product Owner) especializado en crear historias de
usuario en base a documentación tecnica y del negocio. Conoce el negocio en su totalidad. El agente
debe crear tambien tickets de trabajo con la estructura siguiente de ejemplo: en la raiz,
docs/us/us0001/task0001.md y las historias de usuario en: docs/us/us0001/us0001.md. El agente debe
ser creado en .github/agents
```

*(Crea .github/agents/technical-product-owner.agent.md con templates de US y tasks, contexto de negocio INK·LINK)*

---

## 14 — Mejoras al agente: MoSCoW + CU + dual-model

> 📋 2026-06-10T07:34:20Z · VS Code · Claude Opus 4.6 · High · ~50K tokens · rodri

```
Agregale priorizacion en MOSCOW (que ya las tiene la documentacion del proyecto) y que agregue los
casos de uso ya expuestos en documentacion.md. y que primero genere el plan con opus pero implemente
con sonnet
```

*(Actualiza agente: modelo Sonnet, priorización MoSCoW, referencia a 3 CUs, dual-model workflow)*

---

## 15 — Expandir casos de uso a Must-Have y Should-Have completos

> 📋 2026-06-10T07:36:30Z · VS Code · Claude Opus 4.6 · High · ~55K tokens · rodri

```
Modifica el documentacion.md para que cree todos los casos de uso de Must-Have y de Should-Have.
Luego actualiza el agente product-owner
```

*(Agrega CU-04 a CU-08 en documentacion.md, actualiza agente con referencia a los 8 CUs organizados por MoSCoW)*

---

## 16 — Creación del modelo de datos detallado

> 📋 2026-06-10T07:42:48Z · VS Code · Claude Opus 4.6 · High · ~60K tokens · rodri

```
Analiza data-model-sample.md y usalo para crear data-model.md con la misma estructura pero basado
en el proyecto de INK-LINK con la documentación sobre el proyecto
```

*(Crea docs/data-model.md con 13 entidades, campos, validaciones, relaciones y diagrama ER Mermaid)*

---

## 17 — Creación de agente Tech Lead (separación de responsabilidades)

> 📋 2026-06-10T07:48:07Z · VS Code · Claude Opus 4.6 · High · ~65K tokens · rodri

```
Ahora, crea un nuevo agente teach lead que sea el que genera los tickets de trabajo desde la historia
de usuario creada por el agente product owner. Debe recibir como parametro la historia de usuario
(us0001.md, por ejemplo) o un ticket de Jira. Elimina del product owner lo de crear tareas tasks
```

*(Crea .github/agents/tech-lead.agent.md, elimina generación de tasks del product owner)*

---

## 18 — Análisis de coherencia del proyecto

> 📋 2026-06-10T07:57:23Z · VS Code · Claude Opus 4.6 · High · ~70K tokens · rodri

```
Analiza readme.md y verifica que el proyecto tiene coherencia, en especial con los archivos de
documentación como documentacion.md, data-model.md y si no tiene coherencia indica por qué y un
plan para corregir. Me interesa también que el modelo de datos soporte todas las funcionalidades
principales y que la documentación sea coherente
```

*(Identifica 7 inconsistencias: stack contradictorio, api-spec.yml placeholder, videos sin modelo, etc.)*

---

## 19 — Crear issue de seguimiento

> 📋 2026-06-10T08:02:34Z · VS Code · Claude Opus 4.6 · High · ~75K tokens · rodri

```
pasa este plan a carpeta fixs/issue-001.md (y asi sucesivamente cuando encontremos mas issues)
para modificar instrucciones y luego ejecutar
```

*(Crea fixs/issue-001.md con hallazgos priorizados y estructura para plan de ejecución)*

---

## 20 — Revisión del plan actualizado

> 📋 2026-06-10T08:09:14Z · VS Code · Claude Opus 4.6 · High · ~80K tokens · rodri

```
Actualicé el plan, verificalo nuevamente y llena el plan de ejcucion y criterios de done
```

*(Llena Plan de Ejecución (7 pasos) y Criterios de Done en fixs/issue-001.md tras revisión del usuario)*

---

## 21 — Ejecución del plan de correcciones

> 📋 2026-06-10T08:10:01Z · VS Code · Claude Opus 4.6 · High · ~85K tokens · rodri

```
Ejecutalo
```

*(Ejecuta los 7 fixes: stack unificado, api-spec vaciado, videos/pares/anti-no-show → Won't-Have, cancelled_at agregado, notificaciones eliminadas)*

---

## 22 — Registrar prompts de la sesión

> 📋 2026-06-10T08:15:04Z · VS Code · Claude Opus 4.6 · High · ~90K tokens · rodri

```
actualiza 00-all-prompts.md con los prompts que te envie por este chat
```

*(Actualiza prompts/00-all-prompts.md con prompts 12-22 de la sesión de documentación y coherencia)*

---

## Resumen de archivos modificados (sesión 2)

| Archivo | Acción |
|---|---|
| `prompts/master-prompt-docs.md` | Creado — meta-prompt para generar documentación |
| `prompts/master-prompt-docs-plan.md` | Creado — plan de ejecución verificable |
| `docs/documentacion.md` | Creado y corregido — documentación técnica completa (8 CU, ER, C4) |
| `docs/data-model.md` | Creado — modelo de datos con 13 entidades |
| `.github/agents/technical-product-owner.agent.md` | Creado y actualizado — agente TPO |
| `.github/agents/tech-lead.agent.md` | Creado — agente Tech Lead |
| `docs/api-spec.yml` | Vaciado — solo estructura OpenAPI |
| `readme.md` | Actualizado — Won't-Have para videos, pares, anti no-show |
| `fixs/issue-001.md` | Creado y resuelto — 7 inconsistencias corregidas |

---

# Sesión 3 — Creación de historias de usuario

> 📅 2026-06-10 (continuación) · VS Code · Copilot Agent Mode · Claude Opus 4.6 (Anthropic) · Thinking: High

---

## 23 — Crear historias de usuario del proyecto

> 📋 2026-06-10T08:18:56Z · VS Code · Claude Opus 4.6 · High · ~95K tokens · rodri

```
Crea las historias de usuario del proyecto
```

*(Propone plan inicial de 20 US organizadas por MoSCoW, sujeto a refinamiento iterativo)*

---

## 24 — Refinamiento: login con data seed

> 📋 2026-06-10T08:21:14Z · VS Code · Claude Opus 4.6 · High · ~100K tokens · rodri

```
US0002 usara data-seed y US0001 tambien usara data seed
```

*(Ajusta US0001 y US0002: no hay registro, los usuarios vienen precargados vía seed)*

---

## 25 — Refinamiento: eliminar panel artista, reducir scope

> 📋 2026-06-10T08:25:29Z · VS Code · Claude Opus 4.6 · High · ~105K tokens · rodri

```
**CU-02: Configurar perfil** seran datos seed.
US0014 solo el cliente vera la agenda del arista, no "entraremos" con el artista a la web por el momento, ese es un wont have por ahora
US0018 sera wont have, no la implementaremos. De hecho eliminalo de todo el proyecto
US0019 sera wont have, no se implementara en esta version
```

*(Elimina panel de artista del MVP, reduce backlog de 20 a 14 US, marca Won't-Have: foto curación, notificaciones, respuestas a reseñas)*

---

## 26 — Aprobación del plan de 14 US

> 📋 2026-06-10T08:26:22Z · VS Code · Claude Opus 4.6 · High · ~110K tokens · rodri

```
apruebo
```

*(Aprueba plan final de 14 US: 10 Must-Have + 4 Should-Have = 81 SP. Inicia creación secuencial de archivos)*

---

## 27 — Verificar coherencia CU ↔ US

> 📋 2026-06-10T17:18:29Z · VS Code · Claude Opus 4.6 · High · ~120K tokens · rodri

```
Los casos de uso que agregaste tienen coherencia con los diagramas de casos de uso?
```

*(Análisis de mapeo: 12/14 US coherentes, 2 inconsistencias detectadas: US0010 → Transversal, US0014 → CU-08)*

---

## 28 — Corregir asignación de CU

> 📋 2026-06-10T17:22:41Z · VS Code · Claude Opus 4.6 · High · ~125K tokens · rodri

```
US0010 a transversal , US0014 ok , cambialo a CU-08
```

*(Actualiza US0010: CU-01 → Transversal. Actualiza US0014: Transversal (complementa CU-02) → CU-08)*

---

## 29 — Actualizar registro de prompts con metadatos

> 📋 2026-06-10T17:29:56Z · VS Code · Claude Opus 4.6 · High · ~130K tokens · rodri

```
actualiza 00-all-prompts.md con los prompts que no se hayan enviado y acualiza los anteriores
con fecha hora (UTC), source (vs code), modelo utilizado, si fue medium, high, low, y el tamaño
del contexto que tenia. Tambien el usuario que ejecuto el prompt
```

*(Reestructura 00-all-prompts.md con metadatos: timestamp UTC, source, modelo, thinking level, contexto estimado, usuario)*

---

## Resumen de archivos modificados (sesión 3)

| Archivo | Acción |
|---|---|
| `docs/us/us0001/us0001.md` — `docs/us/us0014/us0014.md` | Creados — 14 historias de usuario completas |
| `.github/agents/technical-product-owner.agent.md` | Actualizado — Won't-Have list, referencia a 14 US |
| `docs/us/us0010/us0010.md` | Corregido — Caso de Uso: CU-01 → Transversal |
| `docs/us/us0014/us0014.md` | Corregido — Caso de Uso: Transversal → CU-08 |
| `prompts/00-all-prompts.md` | Actualizado — prompts 23-29 + metadatos en todos |

---

## Mapeo final CU ↔ US

| CU | Descripción | US asignadas |
|---|---|---|
| CU-01 | Cliente Cotiza y Reserva | US0008, US0009 |
| CU-02 | Tatuador Configura Perfil | (seed — sin US) |
| CU-03 | Cliente Califica | US0013 |
| CU-04 | Cliente Descubre en Vitrina | US0003, US0004, US0005 |
| CU-05 | Cliente Explora en Mapa | US0012 |
| CU-06 | Cliente Cotiza con Chatbot | US0011 |
| CU-07 | Cancelación / Anti No-Show | (Won't-Have — sin US) |
| CU-08 | Comparar por Certificaciones | US0006, US0007, US0014 |
| Transversal | — | US0001, US0002, US0010 |

---

*INK·LINK © 2026 · Registro de prompts · 3 sesiones · 29 prompts documentados*
