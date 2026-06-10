# Prompts de la sesión · Cambio de stack tecnológico

> Sesión de trabajo · Junio 2026 · Actualización de stack en agentes y estándares de documentación

---

## 01 — Ejecutar prompt de cambio de stack

```
Ejecuta el prompt de este archivo & 'c:\repo\ai4devs\AI4Devs-finalproject\prompts\02-cambiar stack tech.md'
```

---

## 02 — Contenido del prompt ejecutado (`02-cambiar stack tech.md`)

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

```
sí, procede
```

*(aprueba el plan para ai-specs/agents/backend-developer.md: TypeScript/Node.js/Express/Prisma/Jest → C#/.NET Core 10/ASP.NET Core/EF Core/xUnit)*

---

## 04 — Aprobación: archivo 2 (frontend-developer.md)

```
si
```

*(aprueba el plan para ai-specs/agents/frontend-developer.md: React/React Router/React Bootstrap/axios → Angular 20/Angular Router/Angular Material/HttpClient)*

---

## 05 — Corrección de ruta: archivos de docs en raíz

```
no lo crees, el archivo está en la carpeta docs de la raiz
```

*(corrección: los archivos backend-standards.md y frontend-standards.md están en docs/ de la raíz, no en ai-specs/docs/)*

---

## 06 — Aprobación: archivo 3 (docs/backend-standards.md)

```
si,cambia todo
```

*(aprueba reescritura completa de docs/backend-standards.md con .NET Core 10/C#/ASP.NET Core/EF Core/xUnit)*

---

## 07 — Aprobación: archivo 4 (docs/frontend-standards.md)

```
si
```

*(aprueba reescritura completa de docs/frontend-standards.md con Angular 20/Angular Material/HttpClient/signals)*

---

## 08 — Guardar prompts de la sesión

```
Todos los prompts que usamos en esta sesion grabalos en el archivo prompts/00-all-prompts.md
```

---

## Resumen de archivos modificados

| Archivo | Stack anterior | Stack nuevo |
|---|---|---|
| `ai-specs/agents/backend-developer.md` | TypeScript / Node.js / Express / Prisma / Jest | C# / .NET Core 10 / ASP.NET Core / EF Core / xUnit |
| `ai-specs/agents/frontend-developer.md` | React / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |
| `docs/backend-standards.md` | Node.js / TypeScript / Prisma / Jest | .NET Core 10 / C# / EF Core / xUnit |
| `docs/frontend-standards.md` | React 18 / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |

---

## 09 — Generación de documentación técnica (meta-prompt)

```
Genera un prompt especializado para IA (meta prompt) en base al archivo initial.md y guarda este
prompt en un archivo llamado master-prompt-docs.md dentro de la carpeta prompts de la raiz del proyecto
```

*(Genera prompts/master-prompt-docs.md con rol, contexto, misión y restricciones para producir docs/documentacion.md)*

---

## 10 — Plan de ejecución para documentación

```
Genera un plan detallado para master-prompt.md y grabalo en master-prompt-docs-plan.md para revisarlo
```

*(Genera prompts/master-prompt-docs-plan.md con checklist verificable, entidades, decisiones y validaciones cruzadas)*

---

## 11 — Ejecución del plan

```
ejecuta el plan de master-prompt-docs-plan.md
```

*(Genera docs/documentacion.md completo: descripción, Lean Canvas, 3 casos de uso, modelo de datos ER, arquitectura y diagramas C4)*

---

## 12 — Corrección de errores Mermaid en documentacion.md

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

```
Agregale priorizacion en MOSCOW (que ya las tiene la documentacion del proyecto) y que agregue los
casos de uso ya expuestos en documentacion.md. y que primero genere el plan con opus pero implemente
con sonnet
```

*(Actualiza agente: modelo Sonnet, priorización MoSCoW, referencia a 3 CUs, dual-model workflow)*

---

## 15 — Expandir casos de uso a Must-Have y Should-Have completos

```
Modifica el documentacion.md para que cree todos los casos de uso de Must-Have y de Should-Have.
Luego actualiza el agente product-owner
```

*(Agrega CU-04 a CU-08 en documentacion.md, actualiza agente con referencia a los 8 CUs organizados por MoSCoW)*

---

## 16 — Creación del modelo de datos detallado

```
Analiza data-model-sample.md y usalo para crear data-model.md con la misma estructura pero basado
en el proyecto de INK-LINK con la documentación sobre el proyecto
```

*(Crea docs/data-model.md con 13 entidades, campos, validaciones, relaciones y diagrama ER Mermaid)*

---

## 17 — Creación de agente Tech Lead (separación de responsabilidades)

```
Ahora, crea un nuevo agente teach lead que sea el que genera los tickets de trabajo desde la historia
de usuario creada por el agente product owner. Debe recibir como parametro la historia de usuario
(us0001.md, por ejemplo) o un ticket de Jira. Elimina del product owner lo de crear tareas tasks
```

*(Crea .github/agents/tech-lead.agent.md, elimina generación de tasks del product owner)*

---

## 18 — Análisis de coherencia del proyecto

```
Analiza readme.md y verifica que el proyecto tiene coherencia, en especial con los archivos de
documentación como documentacion.md, data-model.md y si no tiene coherencia indica por qué y un
plan para corregir. Me interesa también que el modelo de datos soporte todas las funcionalidades
principales y que la documentación sea coherente
```

*(Identifica 7 inconsistencias: stack contradictorio, api-spec.yml placeholder, videos sin modelo, etc.)*

---

## 19 — Crear issue de seguimiento

```
pasa este plan a carpeta fixs/issue-001.md (y asi sucesivamente cuando encontremos mas issues)
para modificar instrucciones y luego ejecutar
```

*(Crea fixs/issue-001.md con hallazgos priorizados y estructura para plan de ejecución)*

---

## 20 — Revisión del plan actualizado

```
Actualicé el plan, verificalo nuevamente y llena el plan de ejcucion y criterios de done
```

*(Llena Plan de Ejecución (7 pasos) y Criterios de Done en fixs/issue-001.md tras revisión del usuario)*

---

## 21 — Ejecución del plan de correcciones

```
Ejecutalo
```

*(Ejecuta los 7 fixes: stack unificado, api-spec vaciado, videos/pares/anti-no-show → Won't-Have, cancelled_at agregado, notificaciones eliminadas)*

---

## 22 — Registrar prompts de la sesión

```
actualiza 00-all-prompts.md con los prompts que te envie por este chat
```

*(Actualiza prompts/00-all-prompts.md con prompts 12-22 de la sesión de documentación y coherencia)*

---

## Resumen de archivos modificados (sesión 2: documentación + coherencia)

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

*INK·LINK © 2026 · Historial de sesión: cambio de stack tecnológico + documentación técnica v1 + análisis de coherencia*
