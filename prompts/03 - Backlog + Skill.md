# Product backlog generation for HabitHero
_Exported on 5/25/2026 at 21:34:53 UTC from Cursor (3.5.17)_

---

**User**

@docs/prd.md Eres un "Product Owner" experto con conocimientos de "metodologías ágiles".  

Vas a generar un documento del tipo “Product backlog” a partir de un “PRD” y lo llamarás “product-backlog.md” en el directorio docs del proyecto. 

Quiero que analices el documento adjunto que es el PRD del proyecto (está en formato MarkDown), y que, basándote en el mismo, y en el código fuente actual, me identifiques todas las User Stories correspondientes. 

En el análisis debes de detectar si falta algún aspecto importante e imprescindible para llevar a cabo un primer MVP y considerarlo. 

Añade, si es necesario, requisitos no funcionales de escalabilidad, seguridad, mantenibilidad, disponibilidad y tests.

Genera un primer bloque con la definición de cada una de las User Stories, donde debes de aplicar buenas prácticas, entre ellas las siguientes: 

Crear cada US con un título conciso, claro y descriptivo. 

Formato "Como [rol], quiero [acción], para [beneficio]" 

Evaluación breve "INVEST" (Independent, Negotiable, Valuable, Estimable, Small, Testable). 

Listar los "Acceptance Criteria" (AC) en formato "Behavior-Driven Development" (BDD) (Gherkin): Given/When/Then. 

Los "Acceptance Criteria" (AC) deben de incluir el "happy path" y sugerir escenarios de "edge-cases". 

Detectar algunos escenarios de error habituales. 

Añadir una estimación de complejidad (S/M/L) 

Clasificar según su importancia para el MVP siguiendo el método de priorización MoSCoW (Must have, Should have, Could Have, Won't Have). 

 

Una vez elaborada la lista de las US, quiero que valides la consistencia entre las que estén relacionadas. 

 

El siguiente paso es añadir un bloque donde se diseñe su Backlog, se listen las US sugiriendo su orden de priorización para el MVP (MoSCoW), y se tengan en cuenta criterios importantes como pueden ser los siguientes: 

Valor para el Negocio. 

Urgencia. 

Dependencias. 

Coste de implementación basado en esfuerzo y complejidad. 

Riesgos y obstáculos potenciales. 

Madurez tecnológica. 

Añade un bloque a modo de resumen con una matriz en formato tabla que resuma el backlog ordenado incluyendo las siguientes columnas: Item, Impacto usuario / negocio, Urgencia, Complejidad, Riesgos / dependencias, MoSCoW. 

Muestra también un roadmap en formato Mermaid con el Backlog priorizado por Sprints. Cada conjunto de US debe aportar funcionalidades completas. 

 

Por último, quiero que actúes cómo un "Project Manager" experto con conocimientos de "metodologías ágiles". Tu objetivo es analizar cada User Story del Backlog y dividirla en sus respectivos Tickets necesarios para su desarrollo y entrega del MVP. 

Los tickets deben de estar bien estructurados y tener un nombre breve, conciso, claro y descriptivo. Cada ticket debe de contener toda la información necesaria para llevarse a cabo su desarrollo, así como incluir las partes relevantes de la US a la que pertenecen, como pueden ser los "Acceptance Criteria", "happy path", "edge-cases", etc. También debe quedar muy claro en cada ticket a que US pertenece. Los tickets, al igual que se ha hecho con las User Stories, deben tener su estimación de complejidad (S/M/L) y unidades (puntos de historia). 
Cada ticket, si es del tipo backend, frontend o api, debe incorporar su test unitario que permita comprobar su happy path y sus edge cases con mayor potencial de error. Sólo se definirán tests si estos son importantes para el funcionamiento principal de la funcionalidad y si aportan valor real. Los tests se deben de revisar que estén alineados con su User Story.

---

**Cursor**

Now I have a thorough understanding of the PRD and the current codebase state. Let me generate the comprehensive Product Backlog document.

El documento `docs/product-backlog.md` ha sido generado. Aquí tienes un resumen de lo que contiene:

---

## Estructura del documento

### Bloque 1 — User Stories (US-01 a US-20)

**20 User Stories** identificadas en 3 categorías:
- **Funcionales (US-01 a US-16):** perfil, dashboard, hábitos (crear/registrar/eliminar), recompensas (crear/canjear/eliminar), estadísticas, historial, bloqueo semanal, validaciones y progreso en tiempo real.
- **No funcionales (US-17 a US-20):** rendimiento, seguridad, testing y despliegue.

Cada US incluye:
- Formato "Como / quiero / para"
- Evaluación INVEST completa
- Estado actual del código (✅ / 🟡 / ❌)
- Complejidad (S/M/L), MoSCoW y Story Points
- Scenarios BDD (Gherkin) con happy path, edge cases y errores


### Bloque 2 — Validación de Consistencia

Mapa de dependencias en Mermaid y tabla de 9 análisis de consistencia entre US relacionadas, identificando riesgos como la dependencia estricta US-06 → US-14, o el `lastWeekPoints` hardcodeado que bloquea US-07 hasta resolver US-14.

### Bloque 3 — Backlog Priorizado

- **Matriz resumen** con 6 columnas: impacto, urgencia, complejidad, riesgos, MoSCoW y SP.
- **73 SP Must Have · 25 SP Should Have · 98 SP totales**
- **Roadmap Gantt** en Mermaid con 5 sprints de 2 semanas (21 abril — 26 junio 2026)

### Bloque 4 — Tickets de Desarrollo

**44 tickets** (T-XX-YY) cubriendo todas las US del MVP, distribuidos en los 5 sprints. Cada ticket incluye: US de referencia, tipo (backend/frontend/testing/infra), complejidad, SP, descripción técnica, criterios de completado, happy path y edge cases.

---

**User**

Crea una skill en el fichero @.cursor/skills/generate-product-backlog/SKILL.md utilizando las best practices y totalmente compatible con Cursor.
Este skill debe de ser completo y no incluir referencias a otros ficheros.
Su propósito tiene que ser exactamente el mismo que he indicado en el prompt anterior y que es generar el fichero "product-backlog.md" con exactamente las mismas instrucciones que se han indicado en el prompt.

---

**Cursor**

Revisando la skill de creación de skills y un ejemplo existente para alinear formato y buenas prácticas.



Creando `SKILL.md` autocontenido: incluiré todas las instrucciones del prompt original en formato compacto y cumpliré el frontmatter de Cursor.



Eliminando la mención a `.cursor/commands/` para cumplir estrictamente "sin referencias a otros ficheros".



Corrigiendo plantillas con bloques de código anidados que rompen el Markdown.



Listo. La skill está en `.cursor/skills/generate-product-backlog/SKILL.md` con:

- **Frontmatter Cursor** (`name` + `description` ≤1024 caracteres, tercera persona, qué hace y cuándo usarla).
- **Contenido autocontenido**: no enlaza a `reference.md`, `commands` ni otros ficheros; solo menciona rutas de **entrada/salida** del propio proyecto (`docs/prd.md` → `docs/product-backlog.md`) porque son el contrato del flujo.
- **Misma intención que tu prompt**: rol PO + PM, análisis PRD + código, US con formato «Como…», INVEST, AC en Gherkin (happy path, edge cases, errores), S/M/L, MoSCoW, consistencia entre US con Mermaid, backlog priorizado con los criterios que pediste, **tabla** con las columnas exactas, **roadmap Mermaid por sprints**, tickets por US con complejidad, story points y trazabilidad a la US.
- **Plantillas** reescritas sin bloques Markdown anidados (evita romper el render del `SKILL.md`).
- **Líneas guía Cursor**: checklist de ejecución, idioma español, límite de completitud, búsqueda del PRD si falta la ruta por defecto.

Si quieres, el siguiente paso puede ser añadir un comando `/generate-product-backlog` en `.cursor/commands/` que apunte a esta skill (eso ya sería un fichero aparte).

---

**User**

Sí, añade el comando.

---

**Cursor**

Creando `.cursor/commands/generate-product-backlog.md` siguiendo el patrón de `generate-prd.md`.



Añadiendo en la skill una mención al comando sin enlazar a otros ficheros (cumple la skill autocontenida).



Quedó creado el comando en:

**`.cursor/commands/generate-product-backlog.md`**

Incluye el mismo frontmatter que `/generate-prd` (`name`, `id`, `category`, `description`), las entradas/salida, pasos para el agente (leer la skill, PRD, código, escribir el backlog), ejemplo de uso y qué hacer si falta el PRD.

En **`.cursor/skills/generate-product-backlog/SKILL.md`** actualicé la sección **Invocación** para documentar el slash-command **`/generate-product-backlog`** sin enlazar a otros ficheros.

Puedes invocarlo en el chat con:

```text
/generate-product-backlog
```


