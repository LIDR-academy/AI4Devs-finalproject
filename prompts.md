> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

```markdown
# ROL
Actúa como un Product Manager senior con más de 10 años de experiencia lanzando
productos digitales B2B y B2C. Dominas la redacción de documentación de producto
(PRDs, one-pagers, visión de producto) y sabes comunicar valor tanto a perfiles
técnicos como de negocio.

# OBJETIVO
Redactar la sección "Descripción general del producto" de la documentación de
este proyecto, centrada exclusivamente en dos bloques:
1. Objetivo del producto
2. Características y funcionalidades principales

# CONTEXTO
- Proyecto: [describe brevemente qué es el producto y el problema que resuelve]
- Usuarios / clientes objetivo: [p. ej. administradores, jugadores, etc.]
- Estado actual: [idea, MVP, en producción…]
- Fuentes que debes usar: [enlaza README, código, tickets o documentos relevantes;
  si no se indican, básate únicamente en lo que se te proporcione y NO inventes datos]

# TAREA
Genera el texto siguiendo esta estructura exacta en Markdown:

## Descripción general del producto

### Objetivo
- Un párrafo (3-5 frases) que explique QUÉ es el producto, QUÉ problema resuelve
  y PARA QUIÉN. Debe entenderlo alguien sin contexto técnico.
- Cierra con la propuesta de valor diferencial en una frase.

### Características y funcionalidades principales
- Lista de 5 a 8 funcionalidades clave.
- Cada ítem en formato: **Nombre de la funcionalidad** — beneficio para el usuario
  (1-2 frases). Prioriza el beneficio sobre la descripción técnica.
- Ordena de mayor a menor relevancia para el usuario final.

# RESTRICCIONES Y CRITERIOS DE CALIDAD
- Tono profesional, claro y conciso. Evita jerga innecesaria y relleno.
- No inventes funcionalidades, métricas ni datos que no estén respaldados por el
  contexto; si falta información crítica, indícalo explícitamente con [PENDIENTE: …]
  en lugar de suponer.
- Usa voz activa y orientada a valor/beneficio, no a especificaciones técnicas.
- Extensión total orientativa: 250-400 palabras.
- Idioma: español.

# ANTES DE EMPEZAR
Si falta información esencial sobre el producto, hazme primero las preguntas
mínimas necesarias para no inventar. Si tienes contexto suficiente, procede
directamente con la redacción.
```

**Prompt 2:**

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

```markdown
# ROL
Eres un arquitecto de software senior especializado en aplicaciones web full-stack con TypeScript y en arquitectura para SEO técnico.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md como única fuente. No introduzcas tecnologías ni patrones que no aparezcan en él. Apóyate especialmente en las secciones "1. Contexto y fuerzas que mandan la decisión", "2. Stack elegido" y "4. Diagramas de arquitectura".

# TAREA
Redacta la subsección "2.1. Diagrama de arquitectura" del readme del proyecto Geoteknia. Debe contener:
1. Una descripción en prosa (1–2 párrafos) del patrón arquitectónico elegido (monolito modular sobre Next.js) y por qué encaja con las fuerzas del proyecto (SEO como producto, escala PYME, RF-21 publicar→revalidar, RGPD).
2. Un diagrama del MVP en formato ASCII art que muestre los componentes (Cloudflare, Vercel con frontal + portal /admin + capa de API, PostgreSQL Neon, API de Claude, Resend) y el flujo entre ellos.
3. Una frase explícita de "Patrón elegido", otra de "Beneficios principales" y otra de "Sacrificio principal".

# RESTRICCIONES
- Justifica la elección en términos de los cinco ejes: escalabilidad, mantenibilidad, seguridad, coste y velocidad de entrega.
- Menciona ISR on-demand (`revalidatePath`) como pieza estructural, no opcional.
- Sin emojis decorativos. Markdown con un bloque de código para el diagrama.
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

```markdown
# ROL
Eres un arquitecto de software senior. Documentas componentes de un sistema para que un equipo de desarrollo pequeño pueda implementarlo sin ambigüedad.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md, en particular la "Tabla de componentes" de la sección 2. No inventes componentes que no estén en el documento.

# TAREA
Redacta la subsección "2.2. Descripción de componentes principales" como una tabla Markdown con tres columnas: Componente | Tecnología | Responsabilidad.

Incluye como mínimo: frontal público, portal de administración (/admin), capa de negocio (/lib + Route Handlers + Server Actions), base de datos, autenticación y control de acceso, integración IA, email transaccional, anti-spam, tracking/analítica y observabilidad.

# RESTRICCIONES
- En la columna "Responsabilidad", vincula cada componente con los requisitos del PRD cuando aplique (p. ej. RF-17 para auth, RF-19/RNF-IA para integración IA, RF-Q3 para email transaccional).
- Usa los identificadores de tecnología exactos del documento (Next.js 15, Auth.js v5, `@anthropic-ai/sdk`, modelos `claude-sonnet-4-6` / `claude-opus-4-8`, Cloudflare Turnstile, etc.).
- Sé concreto: nada de descripciones genéricas tipo "gestiona la lógica". Di qué entidades o flujos maneja cada componente.
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

```markdown
# ROL
Eres un arquitecto de software senior experto en organización de proyectos Next.js (App Router) bajo el patrón de monolito modular.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md, en particular el "Patrón arquitectónico" de la sección 2 (capa `/lib` framework-agnostic con dominios leads/projects/content/ia) y la estructura de silos de URLs del proyecto.

# TAREA
Redacta la subsección "2.3. Descripción de alto nivel del proyecto y estructura de ficheros". Debe incluir:
1. Un árbol de directorios en bloque de código que refleje el App Router con route groups `(public)` y `(admin)`, las rutas de silo SEO (servicios, zonas, proyectos, blog…), la carpeta `/lib` organizada por dominio, `components`, `prisma` (schema + migrations + seed) y `tests` (unit + e2e).
2. Un comentario breve al lado de las carpetas clave indicando su propósito y el tipo de renderizado (SSG/ISR) o el schema JSON-LD asociado donde aplique.
3. Un párrafo final que explique el patrón aplicado: por qué `/lib` es framework-agnostic y cómo eso permite extraer el back-office (p. ej. a NestJS) sin tocar el frontal.

# RESTRICCIONES
- La estructura debe ser coherente con el stack del documento (Next.js, Prisma, Vitest, Playwright).
- Refleja la arquitectura de silos del PRD en las rutas del frontal público.
- Sin relleno; cada carpeta listada debe tener un propósito claro.
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

```markdown
# ROL
Eres un Arquitecto DevOps senior especializado en despliegue serverless y pipelines de CI/CD para aplicaciones Next.js.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md: la fila "Infraestructura" y "CI/CD" de la tabla de componentes, y el diagrama de "Escalado".

# TAREA
Redacta la subsección "2.4. Infraestructura y despliegue" con:
1. Una tabla de proveedores: Vercel, Neon (PostgreSQL serverless región EU), Cloudflare (DNS/WAF/Turnstile) y GitHub, indicando el rol de cada uno.
2. Un diagrama del pipeline de CI/CD (GitHub Actions) en bloque de código que muestre la secuencia: lint → typecheck → tests (Vitest) → E2E (Playwright en preview) → Lighthouse CI como quality gate de Core Web Vitals → `prisma migrate deploy` → deploy en Vercel. Diferencia el comportamiento entre push a main y un PR (preview deploy + Neon branch).
3. Un diagrama o lista del flujo específico de publicación de contenido desde el portal sin redespliegue de código (Editor aprueba → Server Action → `revalidatePath` → Vercel regenera en edge → sitemap actualizado), que materializa el RF-21.

# RESTRICCIONES
- Lighthouse CI debe figurar como gate obligatorio con umbrales numéricos (LCP < 2,5 s, INP < 200 ms, CLS < 0,1).
- Toda la infraestructura de datos debe estar en región EU por RGPD.
- Sin emojis. Tablas y bloques de código.
```

### **2.5. Seguridad**

**Prompt 1:**

```markdown
# ROL
Eres un ingeniero experto en seguridad senior con experiencia en cumplimiento RGPD/LOPDGDD y en aseguramiento de aplicaciones web con back-office y autenticación.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md: la fila "Auth" de la tabla de componentes y la sección "5. Riesgos y mitigaciones" (especialmente R3 RGPD, R6 seguridad de /admin, R7 lock-in).

# TAREA
Redacta la subsección "2.5. Seguridad" como una tabla Markdown de dos columnas: Práctica | Implementación. Cubre como mínimo: HTTPS/HSTS, gestión de secretos (clave de Claude solo en servidor), autenticación del portal (Auth.js v5 + TOTP 2FA + argon2 + expiración de sesión), RBAC (roles Admin/Gestor/Editor/Técnico), audit log, anti-spam (Cloudflare Turnstile), cumplimiento RGPD (Consent Mode v2, datos en EU, sin PII en prompts a Claude, DPA), aislamiento de /admin (noindex + robots disallow + WAF), protección contra inyección (Prisma prepared statements + validación Zod) y control de coste de IA.

# RESTRICCIONES
- Cada práctica debe vincularse a un requisito del PRD cuando exista (RNF-SEC, RNF-ADMIN, RNF-IA, RF-17).
- Aporta ejemplos concretos de implementación (p. ej. "cabecera Strict-Transport-Security en next.config.ts", "X-Robots-Tag: noindex en /admin").
- No enumeres amenazas genéricas; describe controles implementados.
```

### **2.6. Tests**

**Prompt 1:**

```markdown
# ROL
Eres un ingeniero QA senior especializado en estrategias de testing para aplicaciones full-stack TypeScript con flujos críticos de conversión y back-office.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md: la fila "Testing" de la tabla de componentes (Vitest + Playwright + Lighthouse CI) y los flujos del Definition of Done referenciados en el documento.

# TAREA
Redacta la subsección "2.6. Tests" como una tabla Markdown de tres columnas: Nivel | Herramienta | Qué cubre. Incluye al menos:
- Unidad (Vitest): lógica de dominio de `/lib` (calculadora de alcance CTE, validación de estados del pipeline, construcción de prompts y cálculo de coste de tokens).
- E2E formulario multi-paso (Playwright): aterrizaje en landing → 3 pasos con validación → envío → email de confirmación → ficha de lead en portal.
- E2E portal y flujo editorial (Playwright): login + 2FA → crear borrador IA → Borrador→Revisión→Aprobado→Publicado → URL del silo accesible con schema correcto.
- E2E seguridad/RBAC (Playwright): acceso sin auth redirige a login; rol Técnico contra módulo de contenido devuelve 403.
- Rendimiento/a11y (Lighthouse CI en CI): gate con umbrales CWV y accesibilidad ≥ 90.
- Validación de schemas JSON-LD en CI.

# RESTRICCIONES
- Cada nivel debe conectarse con un criterio de aceptación o ítem del Definition of Done del PRD.
- Sé específico sobre el escenario probado, no sobre la herramienta en abstracto.
- Sin emojis. Solo la tabla y, opcionalmente, una frase introductoria.
```

---

### 3. Modelo de Datos

**Prompt 1:**

```markdown
# ROL
Eres un arquitecto de datos senior especializado en modelado relacional y diagramas entidad-relación para aplicaciones full-stack sobre PostgreSQL + Prisma.

# FUENTE DE VERDAD
Usa @docs/modelo-datos-web-b2b-geoteknia.md como única fuente. No inventes entidades, atributos ni relaciones que no aparezcan en él. Apóyate especialmente en los "Bloques reutilizables" (AUDIT, SEO, EDITORIAL) de la sección 0, en las entidades de las secciones A–F y en el "Entregable 1 — Diagrama de relaciones".

# TAREA
Redacta la subsección "3.1. Diagrama del modelo de datos" del readme del proyecto Geoteknia. Debe contener:
1. Un párrafo introductorio (2–3 frases) que explique cómo está organizado el modelo por módulos (taxonomías, contenido publicable, relación M:N, usuarios/seguridad, CRM y generación IA) y las convenciones transversales (UUID como PK, bloques AUDIT/SEO/EDITORIAL, entidades append-only sin soft delete).
2. Un diagrama en formato Mermaid `erDiagram` que represente las entidades principales y sus relaciones. Para cada entidad incluye sus atributos clave con tipo (UUID, string, datetime, enum, boolean, FK…), marcando explícitamente claves primarias (PK) y foráneas (FK).
3. Refleja la cardinalidad correcta de cada relación (1:1, 1:N, N:1, M:N) usando la sintaxis de Mermaid (`||--o{`, `||--||`, `}o--o{`).

# RESTRICCIONES
- Usa los nombres de entidad y atributo EXACTOS del documento (en snake_case: `service_zone_pages`, `workflow_status`, `reference_number`, `ai_token_usage`…).
- Representa al menos las entidades nucleares: `services`, `geo_zones`, `case_studies`, `blog_posts`, `team_members`, `leads`, `projects`, `project_states`, `users`, `roles`, `prompt_templates`, `ai_generations`, `ai_token_usage`, más las tablas puente M:N relevantes (`service_zone_coverage`, `case_study_team_members`…).
- Marca las relaciones especiales del documento: `leads ||--|| projects` (1:1), la auto-referencia de `ai_generations` (`parent_generation_id`) y el vínculo opcional `team_members |o--o| users`.
- No incluyas SQL ni DDL: solo el diagrama Mermaid y su párrafo introductorio. Sin emojis.
```

**Prompt 2:**

```markdown
# ROL
Eres un arquitecto de datos senior. Documentas el modelo de datos para que un equipo de desarrollo pequeño pueda implementar el schema Prisma sin ambigüedad.

# FUENTE DE VERDAD
Usa @docs/modelo-datos-web-b2b-geoteknia.md, en particular las descripciones de entidad de las secciones A–F, los "Bloques reutilizables" de la sección 0, el "Entregable 2 — Tabla resumen" y las "Notas de diseño y asunciones globales".

# TAREA
Redacta la subsección "3.2. Descripción de entidades principales". Para cada entidad principal incluye:
1. Una tabla Markdown con columnas: Atributo | Tipo | Restricciones (PK/FK/unique/not null) | Descripción.
2. Una línea de "Relaciones" indicando entidad relacionada y tipo de relación (1:1, 1:N, N:1, M:N) y la FK que la materializa.
3. Una línea de "Índices" con los índices y restricciones de unicidad declarados en el documento.

Documenta como mínimo las entidades clave de cada módulo: `services` y `geo_zones` (contenido + SEO + editorial), `case_studies`, `leads` y `projects` (CRM y flujo lead→proyecto), `users`/`roles`/`permissions` (RBAC), y `ai_generations` + `ai_token_usage` (generación IA y control de coste).

# RESTRICCIONES
- Refleja los bloques reutilizables: indica explícitamente en cada entidad cuáles aplica (`+ Bloque AUDIT`, `+ Bloque SEO`, `+ Bloque EDITORIAL`) y desglosa sus atributos cuando aporte claridad (p. ej. `workflow_status`, `is_ai_assisted`, `slug`, `noindex`).
- Conserva las asunciones marcadas como `[ASUNCIÓN]` (UUID como PK, separación leads/projects 1:1, entidades append-only sin `updated_at`/`deleted_at`) y menciónalas donde correspondan.
- Vincula cada entidad con su requisito del PRD (RF-01, RF-18, RF-17, RF-19, RNF-IA…) tal como aparece en el documento.
- Usa tipos y nombres exactos del documento. Sin descripciones genéricas: especifica el propósito real de cada campo. Sin emojis.
```

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

```markdown
# ROL
Eres un desarrollador backend senior con amplia experiencia en diseño de APIs REST
y en la especificación OpenAPI 3.1. Aplicas buenas prácticas de diseño de contratos:
nomenclatura de recursos, uso correcto de verbos y códigos HTTP, versionado,
paginación, manejo de errores y seguridad.

# CONTEXTO
- Aplicación: **Geoteknia** — plataforma web B2B para una empresa de ingeniería
  geotécnica española. Capta leads cualificados (SEO/SEM) mediante landings de
  servicio y zona, y los gestiona en un portal interno (/admin) con un CRM ligero
  y generación de contenido SEO asistida por IA.
- Stack backend: **Next.js 15 (App Router)** — monolito modular. La API se expone
  vía **Route Handlers** (`app/api/**/route.ts`) y **Server Actions**. TypeScript E2E.
  Capa de dominio en `/lib` (`/lib/leads`, `/lib/projects`, `/lib/content`, `/lib/ia`).
  Persistencia con **Prisma ORM** sobre **PostgreSQL (Neon, región EU)**.
  Validación de entrada con **Zod**.
- Modelo de autenticación:
  - Endpoints públicos (p. ej. alta de lead): sin sesión, protegidos con
    **Cloudflare Turnstile** (token anti-spam en el body).
  - Endpoints del portal `/admin`: sesión de **Auth.js v5** (cookie de sesión) +
    **RBAC** con roles `Administrador`, `Gestor`, `Editor`, `Técnico`. Acciones
    sensibles registradas en `audit_logs`.
  - La clave de la API de Claude (`@anthropic-ai/sdk`) nunca sale del servidor.
- Entidades principales del dominio (Prisma): `contacts`, `leads`, `projects`,
  `project_states`, `project_state_history`, `services`, `geo_zones`, `case_studies`,
  `content_revisions`, `ai_generations`, `prompt_templates`, `ai_token_usage`,
  `users`, `roles`, `audit_logs`.

# OBJETIVO
Documentar los 3 endpoints MÁS representativos de la API (los que mejor reflejan el
valor central del producto) usando la especificación OpenAPI 3.1.
Endpoints objetivo:
1. **POST /api/leads** — Alta de un lead desde el formulario multi-paso o las
    microconversiones (público + Turnstile). Es el corazón del producto: convierte
    tráfico en oportunidad comercial y crea automáticamente la ficha de proyecto.
2. **POST /api/admin/content/generate** — Generación de un borrador de contenido SEO
    con la API de Claude (servicio, geo-landing, caso, blog, FAQ o meta tags). Es el
    diferenciador del producto; requiere sesión y rol `Editor`+.
3. **PATCH /api/admin/projects/{projectId}/state** — Avance de un proyecto en el
    pipeline del CRM (Lead nuevo → Cualificado → Presupuestado → Adjudicado →
    Entregado), registrando el cambio en el historial. Requiere sesión y rol `Gestor`+.

# INSTRUCCIONES
1. Documenta cada endpoint en formato OpenAPI 3.1 (YAML), incluyendo:
    - `path`, método HTTP y `operationId`
    - `summary` y `description`
    - parámetros (path, query, headers) con tipos y obligatoriedad
    - `requestBody` con su `schema` (cuando aplique)
    - respuestas: caso de éxito (2xx) y errores relevantes:
      · POST /api/leads → 201, 400 (validación Zod), 403 (Turnstile inválido), 429
      · POST /api/admin/content/generate → 200/202, 400, 401, 403 (RBAC), 429 (tope
        de tokens de IA), 502 (fallo upstream de Claude)
      · PATCH .../state → 200, 400, 401, 403, 404, 409 (transición de estado no válida)
    - requisitos de seguridad (`security`): `cookieAuth` (Auth.js) en los de /admin.
2. Define los esquemas reutilizables en `components/schemas` (p. ej. `LeadInput`,
    `Lead`, `ContentGenerationRequest`, `ContentDraft`, `ProjectStateUpdate`,
    `Project`, `Error`) en lugar de repetirlos en línea. Define también
    `securitySchemes` (cookieAuth).
3. Para cada endpoint añade un ejemplo realista de petición y de respuesta, con datos
    verosímiles del dominio geotécnico (servicios reales como "estudios geotécnicos" o
    "sondeos mecánicos", provincias españolas, normativa CTE DB-SE-C, estados del
    pipeline reales). Nada de "string"/"foo".

# FORMATO DE SALIDA
Para cada endpoint, en este orden:
1. Título del endpoint + justificación (1 frase de por qué es uno de los principales).
2. Bloque de código YAML con la especificación OpenAPI 3.1.
3. Ejemplo de **petición** (método, URL, headers, body) en un bloque de código.
4. Ejemplo de **respuesta** (código HTTP + body JSON) en un bloque de código.

Cierra con la sección `components` (`schemas` + `securitySchemes`) consolidada al final.

# RESTRICCIONES
- Coherencia con el stack: rutas bajo `/api/...`, autenticación por cookie de sesión
  (Auth.js v5), validación Zod reflejada en los códigos 400.
- No inventes campos que contradigan el modelo de datos; si falta un detalle, indícalo
  como suposición explícita.
- OpenAPI 3.1 y YAML válido. Códigos HTTP y verbos semánticamente correctos.
- Sé conciso: nada de relleno ni explicaciones fuera de lo solicitado.

# CRITERIOS DE CALIDAD (autoevaluación antes de responder)
- ¿El YAML es válido y parseable como OpenAPI 3.1?
- ¿Cada endpoint tiene su caso de éxito y los errores listados?
- ¿Los ejemplos usan datos reales del dominio y son coherentes con los esquemas?
- ¿Se reutilizan `components/schemas` y se define `cookieAuth` en `securitySchemes`?
- ¿Los endpoints de /admin declaran `security` y el RBAC se refleja en el 403?
```

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

```markdown
# ROL
Eres un Product Manager senior con experiencia en productos B2B de captación de leads en
sectores técnicos regulados y en portales de gestión interna con IA integrada. Dominas
la escritura de historias de usuario con criterios de aceptación precisos y verificables,
orientadas tanto a flujos de conversión digital como a operaciones de back-office.

# FUENTE DE VERDAD
Usa @docs/prd-web-b2b-geoteknia.md como única fuente. Apóyate en:
- Sección 4 "Buyer Personas": perfiles P1 (arquitecto técnico), P4a (gestor de proyectos)
  y P4b (editor de contenido/responsable SEO), sus job-to-be-done y pain points.
- Sección 5 "User Stories Principales": US-03 (formulario multi-paso), US-14 y US-15
  (gestión de leads en portal), US-16, US-17 y US-18 (flujo editorial IA → publicación).
- Sección 6 "Requisitos Funcionales": RF-02 (formulario), RF-21 (publicar → revalidatePath)
  y los requisitos RNF-IA (control de coste, clave de Claude solo en servidor).

# TAREA
Genera exactamente 3 historias de usuario que cubran los tres ejes de valor diferencial
del producto:

1. **US-01 (P1 — Conversión externa):** el arquitecto técnico usa el formulario multi-paso
   pre-rellenable desde la landing de servicio para solicitar presupuesto con baja fricción.

2. **US-02 (P4a — Gestión interna):** el gestor de proyectos necesita que cada lead
   entrante cree automáticamente una ficha en el portal y pueda avanzarla por el pipeline
   de estados (Lead nuevo → Cualificado → Presupuestado → Adjudicado → Entregado).

3. **US-03 (P4b — IA editorial):** el editor de contenido genera un borrador SEO técnico
   con Claude, lo revisa y lo publica directamente en la URL del silo sin redespliegue
   de código, pasando obligatoriamente por el flujo Borrador IA → Aprobado → Publicado.

Para cada historia usa el formato exacto:
> **[ID] — [Persona].** Como **[rol concreto]**, quiero **[acción específica con contexto]**,
> para **[beneficio tangible medible]**.
> **Criterios de aceptación:**
> - [criterio técnico verificable 1]
> - [criterio técnico verificable 2]
> - [criterio de tracking/seguridad/calidad según aplique]

# RESTRICCIONES
- Usa terminología real del dominio: CTE DB-SE-C, SPT/DPSH, URL params (?servicio=...
  &provincia=...), revalidatePath, noindex, Auth.js, pipeline de estados del PRD.
- Cada criterio de aceptación es binario y verificable en un test E2E de Playwright:
  nada de "debe ser rápido" o "buena experiencia". Usa métricas concretas (< 48 h,
  ≤ 3 pasos, evento GA4 X, estado Y visible en tabla).
- US-03 debe incluir: estados Borrador IA → En revisión → Aprobado → Publicado como
  flujo obligatorio e invariable, y la mención de revalidatePath como mecanismo de
  publicación (RF-21).
- Sin emojis. Idioma: español.

# CRITERIOS DE CALIDAD (autoevaluación antes de responder)
- ¿Cada historia es autocontenida y un desarrollador puede implementarla sin leer el PRD?
- ¿Los criterios de aceptación son verificables por un QA en un entorno de staging?
- ¿Se refleja el diferenciador de producto (formulario contextual, CRM sin hojas de
  cálculo y publicación IA sin redespliegue) en el beneficio de cada historia?
```

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

```markdown
# ROL
Eres un Tech Lead backend senior con experiencia en Next.js 15 (App Router), Route Handlers,
Server Actions, Prisma ORM sobre PostgreSQL y Auth.js v5. Conoces el proyecto Geoteknia:
plataforma B2B de captación de leads con portal de administración (/admin), CRM ligero
y generación de contenido SEO asistida por la API de Claude (Anthropic).

# FUENTE DE VERDAD
Usa @docs/prd-web-b2b-geoteknia.md y @docs/arquitectura-stack-web-b2b-geoteknia.md. No inventes
endpoints, entidades ni comportamientos que no estén respaldados por ambos documentos.

# TAREA
Genera un ticket de trabajo de backend para implementar la siguiente funcionalidad:
[DESCRIBE AQUÍ LA FUNCIONALIDAD — p. ej. "Endpoint POST /api/leads con validación Zod,
 anti-spam Turnstile, creación automática de ficha de proyecto y email de confirmación"]

El ticket debe seguir esta estructura exacta:

## [TIPO]-[NÚMERO] — [Título corto]
> Tipo: FEAT | FIX | REFACTOR | CHORE | SECURITY

### Descripción
Un párrafo (3–5 frases) que explique QUÉ hay que construir, POR QUÉ es necesario y
qué requisito del PRD materializa (referencia RF-XX o RNF-XX).

### Ruta(s) afectada(s)
- `app/api/...` o `app/(admin)/...` — Route Handler o Server Action
- `lib/[dominio]/...` — lógica de dominio desacoplada del framework

### Criterios de aceptación
Lista de condiciones binarias y verificables. Cada una debe poderse comprobar
con un test de Vitest o una llamada HTTP desde un test de Playwright:
- [ ] ...

### Implementación técnica (guía, no prescripción)
Pasos técnicos orientativos ordenados. Incluye:
- Schema Zod de entrada y validaciones relevantes.
- Lógica de negocio a implementar en `/lib/[dominio]/`.
- Llamadas a Prisma (modelos y transacciones implicadas).
- Códigos HTTP de respuesta esperados (201, 400, 401, 403, 409, 429, 502…).
- Entradas a añadir en `audit_logs` si es una acción sensible del portal (/admin).
- Control de coste de IA si el endpoint llama a Claude (tope tokens, log en BD).

### Seguridad
- Autenticación requerida: Pública (Turnstile) | Sesión Auth.js v5 + RBAC (rol mínimo: X)
- Datos de entrada validados con Zod: Sí / No
- PII en logs o prompts de Claude: No (o indicar qué campo sí y por qué)
- Entrada en audit_log: Sí / No — campo `action` sugerido

### Tests a escribir
- Unitario (Vitest): [describe el caso a cubrir en `/lib/`]
- E2E (Playwright): [flujo completo del escenario feliz y el error principal]

### Dependencias
- Tickets previos necesarios: [IDs o "ninguno"]
- Variables de entorno requeridas: [lista las nuevas, si aplica]

### Estimación
Complejidad: XS | S | M | L | XL
Puntos de historia: [1 | 2 | 3 | 5 | 8]

# RESTRICCIONES
- La clave de Claude (`ANTHROPIC_API_KEY`) nunca sale del servidor.
- Toda validación de entrada usa Zod; nunca confíes en el tipo TypeScript en runtime.
- Los endpoints de /admin requieren `getServerSession` + comprobación de rol antes de
  ejecutar cualquier lógica de negocio.
- Sin emojis. Markdown con checkboxes para los criterios de aceptación.
- Si falta información para rellenar un campo, indícalo con [PENDIENTE: …].
```

**Prompt 2:**

```markdown
# ROL
Eres un Tech Lead frontend senior especializado en Next.js 15 (App Router), React 19,
TypeScript, Tailwind CSS y accesibilidad WCAG 2.1 AA. Conoces el proyecto Geoteknia:
web B2B de captación de leads con silos SEO (servicio × zona), formularios multi-paso
pre-rellenables y portal de administración (/admin) con flujo editorial asistido por IA.

# FUENTE DE VERDAD
Usa @docs/arquitectura-stack-web-b2b-geoteknia.md y @docs/arquitectura-stack-web-b2b-geoteknia.md. No inventes
componentes, rutas ni comportamientos que no estén respaldados por ambos documentos.

# TAREA
Genera un ticket de trabajo de frontend para implementar la siguiente funcionalidad:
[DESCRIBE AQUÍ LA FUNCIONALIDAD — p. ej. "Formulario multi-paso de solicitud de
 presupuesto con pre-relleno por URL params, validación en tiempo real y evento GA4"]

El ticket debe seguir esta estructura exacta:

## [TIPO]-[NÚMERO] — [Título corto]
> Tipo: FEAT | FIX | REFACTOR | CHORE | A11Y | PERF | SEO

### Descripción
Un párrafo (3–5 frases) que explique QUÉ hay que construir, POR QUÉ es necesario para
el usuario y qué requisito del PRD o buyer persona materializa (referencia RF-XX / P1/P2/P3).

### Ruta(s) / Componente(s) afectado(s)
- `app/(public)/...` o `app/(admin)/...` — página o layout
- `components/[nombre]/` — componente(s) nuevos o modificados
- Renderizado esperado: SSG | ISR on-demand | RSC | Client Component

### Criterios de aceptación
Lista de condiciones binarias y verificables. Cada una debe poderse comprobar
visualmente en un test de Playwright o con Lighthouse CI:
- [ ] ...

### Especificación de UI/UX
- Comportamiento esperado en los estados: vacío, cargando, éxito, error.
- Pre-relleno desde URL params (si aplica): parámetros esperados y campo que rellenan.
- Validación en tiempo real: qué campos y qué mensajes de error.
- Responsive: breakpoints críticos (mobile-first; sticky CTA en móvil si aplica).
- Accesibilidad: roles ARIA requeridos, manejo de foco, contraste mínimo 4.5:1.

### SEO y rendimiento (si la ruta es pública)
- Schema JSON-LD requerido: `Service` | `Article` | `FAQPage` | `BreadcrumbList` | ninguno
- Metadata API de Next.js: `title`, `description`, `canonical`, `robots`.
- Core Web Vitals a vigilar: LCP < 2,5 s | INP < 200 ms | CLS < 0,1
- Imágenes: usar `next/image` con `priority` si es hero; formatos AVIF/WebP.

### Tracking (GA4 / GTM)
- Eventos a disparar: [nombre del evento GA4, parámetros clave]
- Conversiones a marcar: Sí / No — nombre de la conversión en GA4

### Tests a escribir
- E2E (Playwright): [escenario feliz + caso de error principal + validación de accesibilidad]
- Lighthouse CI: [umbral de Performance / Accessibility / SEO a superar en esta ruta]

### Dependencias
- Tickets previos necesarios: [IDs o "ninguno"]
- Endpoints de API requeridos: [lista de Route Handlers o Server Actions]
- Variables de entorno requeridas: [lista las nuevas, si aplica]

### Estimación
Complejidad: XS | S | M | L | XL
Puntos de historia: [1 | 2 | 3 | 5 | 8]

# RESTRICCIONES
- Todos los componentes con interactividad son Client Components (`'use client'`);
  el resto son React Server Components por defecto.
- No usar `useEffect` para lógica de negocio; preferir Server Actions o RSC.
- El schema JSON-LD se inyecta como `<script type="application/ld+json">` en el RSC,
  nunca en el cliente.
- Sin emojis. Markdown con checkboxes para los criterios de aceptación.
- Si falta información para rellenar un campo, indícalo con [PENDIENTE: …].
```

**Prompt 3:**

```markdown
# ROL
Eres un arquitecto de datos senior con experiencia en modelado relacional para PostgreSQL,
Prisma ORM (schema, migraciones, seeds) y diseño de índices para aplicaciones Next.js
con cargas mixtas (lectura SEO + escritura de leads/portal). Conoces el proyecto Geoteknia:
plataforma B2B con módulos de contenido publicable, CRM ligero, RBAC y generación IA.

# FUENTE DE VERDAD
Usa @docs/modelo-datos-web-b2b-geoteknia.md como única fuente de entidades, atributos y
relaciones. No inventes campos ni relaciones que no aparezcan en el documento. Si el PRD
exige algo que el modelo no cubre, indícalo como [PENDIENTE: …].

# TAREA
Genera un ticket de trabajo de base de datos para implementar el siguiente cambio de modelo:
[DESCRIBE AQUÍ EL CAMBIO — p. ej. "Añadir entidad `calculator_rules` con relación a
 `services` y `work_typologies` para la calculadora de alcance CTE (RF-Q1)"]

El ticket debe seguir esta estructura exacta:

## DB-[NÚMERO] — [Título corto]
> Tipo: SCHEMA | MIGRATION | SEED | INDEX | REFACTOR

### Descripción
Un párrafo (3–5 frases) que explique QUÉ cambia en el modelo, POR QUÉ es necesario y
qué requisito del PRD o entidad del documento de modelo materializa (referencia RF-XX
o sección A–F del documento de modelo).

### Entidades afectadas
| Entidad | Tipo de cambio | Motivo |
|---------|---------------|--------|
| `nombre_tabla` | nueva / modificada / eliminada | requisito RF-XX |

### Cambios en `schema.prisma`
Bloque de código Prisma con el modelo nuevo o modificado. Incluye:
- Tipos exactos de Prisma (`String`, `DateTime`, `Boolean`, `Json`, `Enum`, `Int`…).
- Anotaciones `@id`, `@unique`, `@default`, `@relation`, `@@index`, `@@unique`.
- Enums necesarios (con todos sus valores posibles).
- Bloques reutilizables aplicables: AUDIT (created_at, updated_at, deleted_at,
  created_by_id, updated_by_id) | SEO (slug, meta_title, meta_description, noindex…) |
  EDITORIAL (workflow_status, is_ai_assisted, author_id, reviewed_by_id, published_at…).
- Comentario breve `/// ` sobre campos no obvios (solo si el WHY no es evidente).

```prisma
// Insertar aquí el modelo Prisma
```

### Script de migración
- Nombre sugerido para la migración: `[timestamp]_[nombre_descriptivo]`
- Operaciones DDL que generará `prisma migrate dev`:
  - CREATE TABLE / ALTER TABLE / ADD COLUMN / CREATE INDEX / ADD CONSTRAINT…
- ¿Requiere migración de datos existentes? Sí / No
  - Si Sí: descripción del script de data migration y riesgo de downtime.

### Seed (si aplica)
- Datos maestros a insertar: [describe los registros iniciales necesarios]
- Archivo a modificar: `prisma/seed.ts`

### Índices y rendimiento
- Índices nuevos a crear y justificación de cada uno (columna, tipo btree/gin, selectividad esperada).
- Consultas Prisma críticas que se benefician: [describe la query y el plan esperado].
- Consideraciones de tamaño de tabla a 12M (filas esperadas, crecimiento estimado).

### Seguridad y RGPD
- ¿La entidad almacena PII? Sí / No — si Sí, indicar qué campos y la base legal.
- ¿Los datos deben estar en región EU? Sí (obligatorio para todo el sistema — Neon EU).
- ¿Se usan estos datos en prompts de Claude? No (restricción RNF-IA: sin PII en prompts).

### Criterios de aceptación
- [ ] `prisma migrate dev` completa sin errores en rama de desarrollo.
- [ ] `prisma migrate deploy` completa sin errores en Neon branch de PR (CI).
- [ ] Los tests de Vitest que cubren la lógica de dominio de `/lib/` asociada pasan.
- [ ] [criterio específico del ticket]

### Dependencias
- Tickets previos necesarios: [IDs o "ninguno"]
- Tickets de backend/frontend que desbloquea: [IDs o descripción]

### Estimación
Complejidad: XS | S | M | L | XL
Puntos de historia: [1 | 2 | 3 | 5 | 8]

# RESTRICCIONES
- Usa UUID v4 como PK en todas las entidades nuevas (`@id @default(uuid())`).
- Entidades append-only (logs, eventos, historial) no llevan `updated_at` ni `deleted_at`.
- Los enums de `workflow_status` respetan el flujo: `borrador_ia → en_revision →
  aprobado → publicado` (+ `rechazado`, `despublicado`) sin saltarse estados.
- Sin SQL directo: toda la definición va en `schema.prisma`; las migraciones las genera
  Prisma. Si se necesita SQL custom (trigger, función), indícalo como [MANUAL SQL: …].
- Sin emojis. Markdown con checkboxes para los criterios de aceptación.
- Si falta información para rellenar un campo, indícalo con [PENDIENTE: …].
```

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
