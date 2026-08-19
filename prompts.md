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

**Prompt 1:** "Como experto en plataformas de alquiler: qué funcionalidades le
faltan al MVP (priorizadas), qué beneficios aporta la plataforma, cuál es el flujo
paso a paso del suscriptor, y qué documentación legal se necesitaría para poder
reclamar ante abandono sin devolución o pérdida/rotura de sets."

**Prompt 2:** "¿Tienes los datos necesarios para redactar un borrador de PRD en
@documents\PRD.md para revisar?"

**Prompt 3:** "Como analista de software experto, enumera y describe brevemente
los casos de uso más importantes a implementar para una funcionalidad básica,
tanto desde el punto de vista de los usuarios como de los operadores. Representa
estos casos de uso en el tipo de diagrama más adecuado usando el formato
PlantUML. Diferencia entre usuarios visitantes y usuarios logueados. Acorde a la
sintaxis y buenas prácticas UML, define y describe lo que sea necesario. Estos
diagramas se deben adjuntar al PRD."

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** "Siguiendo con la arquitectura del sistema, genera en `documents`
los diagramas C4 a partir de los specs actuales para revisión, junto con un
Architecture Decision Record (ADR)."

**Prompt 2:** "Valora ventajas y desventajas de separar el frontend de usuario
del de operador/admin. Adopta la opción 2 (SPA única con back-office en chunk
lazy), fija el ADR y actualiza los specs necesarios."

**Prompt 3:** "¿Queda algún aspecto a revisar de la arquitectura?" — seguido de una
serie de decisiones dictadas por el usuario (concurrencia, orden de cola,
autenticación, hosting y contrato de errores). Ver log al final.

### **2.2. Descripción de componentes principales:**

**Prompt 1:** "El frontend debe usar bibliotecas typescript y ser compatible con
todos los navegadores, y la parte de usuario debe ser responsive y poder
mostrarse en todo tipo de dispositivos desde móvil, tablets y pantallas de
escritorio. Debe cumplir con las normas a11y europeas de accesibilidad."

**Prompt 2:** "El backend debe servir una API REST pública, implementada en
typescript, y incorporar una base de datos. Para el desarrollo del mismo se
deben usar los principios SOLID/CUPID/DRY."

**Prompt 3:** "La base de datos la podemos modelar con Prisma. Por familiaridad
se usará PostgreSQL o similar."

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:** "El MVP debe ser accesible públicamente para su revisión, y no
escalará a producción, con lo que sugiere distintos proveedores donde alojar
la aplicación y la base de datos, si puede ser de forma gratuita, como MVP."

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:** "Añade el registro de condición de entrega. Para el precio de los
planes, ¿qué sugieres basándote en servicios similares como BrickBorrow? Añade
también los datos de dirección de envío ahora. Busca una base de datos pública de
sets de Lego (mínimo foto del set/caja) para facilitar el catálogo."

**Prompt 2:** "Como arquitecto de software, genera el modelo de datos para su
revisión, organizando las entidades y relaciones por orden de importancia. ¿Qué
otras entidades son importantes en un sistema de este tipo? Usa diagramas mermaid.
[...] Adopta 'User único con rol' y 'score materializado + recálculo', incorpora una
nueva sección en PRD.md y genera el esquema prisma en `backend/prisma`."

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:** "Quiero redactar en @documents\user_stories.md las historias de
usuario más relevantes para este MVP basándonos únicamente en la documentación."

**Prompt 2:** "Estoy valorando añadir un nuevo rol de usuario, el visitante: un
usuario sin registrar que solo podría ver los sets ofrecidos (sin disponibilidad) y
las condiciones de membresía junto con la opción de alta. Opiniones? → aplica los
cambios usando el actor no autenticado."

**Prompt 3:** "Revisando design.md y reservation-queue/spec.md, ¿no es inconsistente
D11 (orden por entrada_efectiva) con el Requirement de prioridad aditiva? design.md
tiene la última decisión → aplica la reconciliación."

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## Log de prompts

> Registro cronológico de los prompts de contenido del proyecto y un resumen de la
> respuesta del asistente. Los prompts de configuración/flujo de trabajo no se registran.

<!-- Formato por entrada:
### [fecha] — Título corto
**Prompt:** (texto del prompt)
**Resumen de la respuesta:** (qué hizo el asistente)
-->

### [2026-07-02] — Funcionalidades, beneficios, flujo de usuario y documentación legal del MVP
**Prompt:** "Como experto en plataformas de alquiler: 1) qué funcionalidades le
faltan al MVP (priorizadas de mayor a menor), 2) qué beneficios aporta la
plataforma, 3) cuál es el flujo paso a paso del suscriptor, 4) qué documentación
legal se necesitaría para reclamar ante abandono sin devolución, pérdida o rotura
de sets."
**Resumen de la respuesta:** Se identificaron 9 huecos funcionales priorizados
(registro de condición en la entrega, precio de planes, dirección de envío,
historial "Mis sets", cancelación en camino feliz, búsqueda/filtro de catálogo,
panel de métricas admin, valoración/reseña, mejoras post-MVP); beneficios para
suscriptor/negocio/operación; flujo E2E del suscriptor paso a paso; y listado de
documentación legal necesaria (T&C, tabla de valoración, autorización de cargo,
requerimiento fehaciente, RGPD, derecho de desistimiento, hoja de
reclamaciones/ODR de la UE).

### [2026-07-02] — Condición de entrega, precio por benchmarking, dirección de envío y fuente de datos de catálogo
**Prompt:** "1. Añade el registro de condición de entrega. 2. Para el precio de
los planes, ¿qué sugieres basándote en otros servicios similares como BrickBorrow?
¿Qué otros valores aportan estas plataformas similares? 3. Los datos de envío los
podemos contemplar ahora. 4 y 5. Añadir al PRD. Los de prioridad media se
contemplan en la siguiente iteración. Busca una base de datos pública de sets de
Lego con los datos requeridos y como mínimo la fotografía del set o de la caja."
**Resumen de la respuesta:** Se investigaron precios y funcionalidades de Brick
Borrow, Pley, BrickDrop y NetBricks; se fijaron precios BASIC 14,99€/mes y PREMIUM
24,99€/mes (anclados a Brick Borrow, el competidor con estructura más parecida:
1 set vs. 2 sets simultáneos con cambios ilimitados) y precio del alquiler puntual
como % del valor de referencia del Set. Se añadieron requirements nuevos a
`rentals-returns` (condición en la entrega), `accounts-roles` (dirección de
envío), `catalog-inventory` (valor de referencia) y `subscriptions` (precio); se
documentaron las decisiones D8/D9 y un backlog de próxima iteración en
`design.md`; se actualizaron `proposal.md` y `tasks.md`; se añadieron al PRD
(`readme.md` 1.2) el historial "Mis sets" y la cancelación en camino feliz; se
recomendó **Rebrickable** (dataset/API pública y gratuita, con `img_url` por set)
como fuente para el catálogo semilla, complementando a mano edad recomendada y
dificultad (no cubiertas por ese dataset).

### [2026-07-03] — Arquitectura y stack: requisitos de frontend, backend, base de datos y hosting
**Prompt:** "Toca decidir la arquitectura y el stack. 1. El frontend debe usar
bibliotecas TypeScript, ser compatible con todos los navegadores, responsive en
móvil/tablet/escritorio, y cumplir las normas a11y europeas. 2. El backend debe
servir una API REST pública en TypeScript, con base de datos, usando los
principios SOLID/CUPID/DRY. 3. La base de datos la podemos modelar con Prisma;
por familiaridad, PostgreSQL o similar. 4. El MVP debe ser accesible
públicamente para su revisión y no escalará a producción — sugiere proveedores
de hosting para la app y la base de datos, si puede ser gratuitos."
**Resumen de la respuesta:** Se tradujeron los requisitos a implicaciones
técnicas concretas: frontend con objetivo de accesibilidad **WCAG 2.1 AA** (vía
**EN 301 549**, el estándar de la Directiva europea de Accesibilidad/European
Accessibility Act); backend como API REST documentable en **OpenAPI**, con
arquitectura en capas (rutas → casos de uso → repositorios → dominio) para
conciliar SOLID (separación de responsabilidades/inversión de dependencias) con
CUPID (evitar sobre-abstracción/ceremonia); capa de datos confirmada como
**PostgreSQL + Prisma**. Para el hosting gratuito se investigaron condiciones
vigentes (julio 2026) y se recomendó **Vercel** (frontend, gratuito sin
caducidad), **Render** (API, free tier 750h/mes con cold start de 30-60s tras
15 min inactivo) y **Neon** (Postgres, tier gratuito que suspende cómputo por
inactividad pero nunca borra el proyecto) — descartando la Postgres gratuita de
Render (caduca a los 30 días + 14 de gracia y se borra) y Railway (ya no ofrece
un plan gratuito viable para una app con base de datos en 2026). Quedan
pendientes: framework concreto de frontend y de backend, y confirmación final
del hosting por parte del usuario, que va a explorar las opciones sugeridas
antes de retomar.

### [2026-07-03] — Borrador de PRD
**Prompt:** "¿Tienes los datos necesarios para redactar un borrador de PRD en
@documents\PRD.md para revisar?"
**Resumen de la respuesta:** Se confirmó que sí, sintetizando lo ya decidido en
`openspec/changes/clickoteca-mvp/` (proposal, design D1–D9, las 6 specs de
capability, tasks) más los añadidos de `readme.md` §1.2 ("Mis sets",
cancelación camino feliz) y la lista de documentación legal del log de
prompts. Se creó `documents/PRD.md` con: resumen y propuesta de valor, roles y
matriz de permisos, alcance funcional por capability (con tabla de precios de
planes), non-goals, flujo E2E del suscriptor paso a paso, reglas de negocio
transversales, consideraciones legales (marcadas como contenido simulado en el
MVP), riesgos/trade-offs, y preguntas abiertas/backlog. Dos secciones se
marcaron explícitamente **pendientes** en vez de inventadas: diseño/UX (sin
mockups aún) y criterios de éxito de negocio (no aplican a un MVP académico
que no escala a producción — se sustituyen por el criterio de circuito E2E
demostrable + `openspec validate --strict`).

### [2026-07-03] — Casos de uso y diagramas PlantUML para el PRD
**Prompt:** "Como analista de software experto, enumera y describe brevemente
los casos de uso más importantes a implementar para una funcionalidad básica,
tanto desde el punto de vista de los usuarios como de los operadores. Representa
estos casos de uso en el formato PlantUML. Diferencia entre usuarios visitantes
y usuarios logueados. Adjuntar al PRD."
**Resumen de la respuesta:** Se identificaron 32 casos de uso agrupados en dos
superficies. **Portal del suscriptor (UC-P01–P18):** Visitante (ver catálogo,
detalle, registrarse, iniciar sesión), Suscriptor (hereda Visitante + activar
plan, solicitar set, cola de reservas, confirmar/rechazar oferta, «Mis sets»,
perfil/dirección, discrepancia, devolución, cancelar suscripción), Sistema
(calcular score de cola, gestionar ventana de confirmación con
recordatorio/caducidad, ofrecer copia al cabeza de cola, enviar notificación).
**Back-office (UC-B01–B14):** Operador (panel de trabajo, alta de copia,
registrar condición de entrega, recepción de devolución, inspección,
higienización, marcar incompleta/dañada, historial limitado del cliente), Admin
(hereda Operador + dar de baja copia, configurar planes/precios/reglas,
activar recordatorios de retención, gestionar empleados, historial completo del
cliente). Se usaron relaciones <<extend>>, <<include>> y herencia de actores
(`--|>`) según convención UML. Diagramas y tablas descriptivas añadidas como
`§14` de `documents/PRD.md`.

### [2026-07-04] — Modelo de datos: diagramas Mermaid, esquema Prisma y sincronización
**Prompt:** "Reemplaza los esquemas PlantUML del PRD por Mermaid. Luego, como
arquitecto de software, genera el modelo de datos organizando entidades y
relaciones por orden de importancia y sugiere qué otras entidades importan. Adopta
'User único con rol' y 'score materializado + recálculo', incorpora una sección en
PRD.md y genera el esquema Prisma en `backend/prisma`. Actualiza las specs, verifica
que todo cuadra y actualiza `readme.md`."
**Resumen de la respuesta:** (1) Se convirtieron los dos diagramas de casos de uso
PlantUML del PRD a Mermaid (`flowchart` con actores, `subgraph` como frontera,
`«include»/«extend»`/herencia punteadas, colores vía `classDef`). (2) Se diseñó el
modelo de datos en tres anillos de importancia — núcleo (`User`, `Set`, `Copy`,
`Subscription`, `Rental`, `ReservationQueueEntry`, `ReservationOffer`), operación
(`ConditionReport`, `Incident`, `CopyStateTransition`, `AuditLog`, `Notification`,
`Shipment`) y config/pagos (`Plan`, `SystemSetting`, `RetentionReminderConfig`,
`PaymentMethod`, `Payment`, `Address`, `Theme`, `MediaAsset`) — con diagramas ER y
máquina de estados de `Copy` como **§15** del PRD. (3) Decisiones adoptadas: `User`
único con rol (sin `Employee`) y `score` de cola materializado + recálculo,
registradas como **D10/D11** en `design.md`. (4) Se generó
`backend/prisma/schema.prisma` (20 modelos + 16 enums, PostgreSQL), validado con
Prisma 6 (nota: Prisma 7 exige mover la URL del datasource a `prisma.config.ts`).
(5) Se sincronizaron las specs: nueva Requirement "Recálculo del score de cola" en
`reservation-queue`, `tasks.md` 1.2 (modelo completo) y 6.2 (materializado);
`openspec validate --strict` en verde. (6) Se rellenó `readme.md` §3 (Modelo de
datos) con el ER consolidado y las tablas de entidades por anillo.

### [2026-07-04] — Diagramas C4 y ADR de arquitectura
**Prompt:** "Siguiendo con la arquitectura del sistema, genera en `documents` los
diagramas C4 a partir de los specs actuales para revisión, junto con un
Architecture Decision Record (ADR)."
**Resumen de la respuesta:** (1) Se creó `documents/C4-architecture.md` con los
tres niveles C4 en Mermaid: **contexto** (personas Suscriptor/Operador/Admin +
sistema Clickoteca + tres externos simulados: pagos, logística manual, correo),
**contenedores** (SPA TS con dos superficies por rol, API REST TS/OpenAPI,
scheduler para recálculo de score/caducidad de ofertas/recordatorios, PostgreSQL+
Prisma) y **componentes** de la API siguiendo la arquitectura en capas
`rutas → casos de uso → repositorios → dominio`, con un slice de casos de uso por
capability de `specs/*` y el dominio concentrando la máquina de estados y la
política de score. Incluye tabla de trazabilidad specs↔componentes. (2) Se creó
`documents/ADR-0001-arquitectura-mvp.md` (estado **Propuesto**) registrando las
decisiones de arquitectura de la aplicación (Postgres+Prisma, API REST TS/OpenAPI
en capas sin DI pesado, SPA TS única, scheduler in-process, hosting propuesto
Vercel+Render+Neon) con alternativas descartadas y consecuencias. (3) Se respetó
la regla "no inventar": framework concreto de front/back y confirmación de hosting
quedan marcados como *pendiente/propuesto* (coherente con `AGENTS.md` § Open
questions). (4) Se archivó el prompt en `§2.1 Diagrama de arquitectura`.

### [2026-07-04] — Separación de superficies frontend (suscriptor vs back-office)
**Prompt:** "Valora ventajas y desventajas de separar el frontend de usuario del
de operador/admin. Adopta la opción 2 (SPA única con back-office en chunk lazy),
fija el ADR y actualiza los specs necesarios."
**Resumen de la respuesta:** (1) Se valoraron 3 opciones —SPA única sin split, SPA
única con code-splitting, y dos apps separadas— con sus ventajas (exposición,
tamaño de bundle, UX/design system, cadencia de deploy) y desventajas
(duplicación, dos pipelines, más scaffolding, time-to-demo). (2) Se **adoptó la
opción 2**: SPA única con el Back-office en un *chunk* cargado *lazy*
(code-splitting) segmentado por rol —no viaja en el bundle público— y la capa
compartida (cliente OpenAPI, tipos, dominio) factorizada para dejar barata una
futura separación; la partición en dos apps queda pospuesta y reversible. Motivo:
captura casi toda la ventaja con coste de setup casi nulo, sin partir el
time-to-demo, y la autz real la impone la API server-side. (3) Se **fijó
`ADR-0001` §3** (decisión, alternativas descartadas y consecuencias) y se reflejó
en `C4-architecture.md` (contenedor SPA + nota) y en `tasks.md` 1.1. (4) Se
constató que los specs de comportamiento no cambian: `accounts-roles` ya modela el
acceso al back-office por rol; `openspec validate clickoteca-mvp --strict` en
verde. (5) Prompt archivado en `§2.1` como Prompt 2.

### [2026-07-04] — Revisión de aspectos abiertos de la arquitectura
**Prompt:** "¿Queda algún aspecto a revisar de la arquitectura?" — seguido de una
sesión de dictado de decisiones punto por punto.
**Resumen de la respuesta:** Se identificaron los transversales sin cerrar
(concurrencia, auth, CORS, almacenamiento de imágenes, contrato de errores) y el
usuario fue fijando cada decisión: (1) **Concurrencia → `design.md` D12**:
transiciones de estado guardadas por *compare-and-swap* (`updateMany` con
precondición de estado → 409 si `count===0`); cubre operador-vs-operador,
usuario-vs-scheduler y usuario-vs-usuario con un patrón; invariantes multi-fila con
transacción `FOR UPDATE` o índice único parcial. (2) **Orden de cola → `design.md`
D11 reescrito**: se demostró que, por ser D4 **aditiva**, el orden es **invariante
en el tiempo** → se elimina el score materializado y su recálculo periódico; se
ordena de forma *lazy* sobre `entrada_efectiva` inmutable (bono congelado al
encolar, `timestamptz` de precisión completa, desempate por `id`); el scheduler
queda solo con caducidad de ofertas y recordatorios. El bono `N` solo afecta a
nuevas incorporaciones. (3) **Auth → `ADR-0002`**: cookie de sesión server-side
(`httpOnly`+`Secure`+`SameSite`) + argon2id, autorización por rol server-side; se
descarta JWT (revocación cara). (4) **Contrato de errores → `ADR-0002`**: RFC 9457
(Problem Details) + miembro de extensión `code` (enum de dominio estable), `errors[]`
de validación, mapa dominio→HTTP centralizado, 500 sin filtrar interno. (5)
**Hosting → `ADR-0001` §5 reescrito**: **VM única con IP pública** en **Oracle Cloud
Free Tier** (Ampere A1/ARM64, 2 OCPU·12 GB·50 GB, Ubuntu 24.04), **mismo origen**
(Caddy sirve la SPA y enruta `/api`; Postgres en `localhost`; imágenes en
filesystem) → elimina CORS, cold-start y suspensión de BD; plan B Hetzner CX22 si
Oracle reclama la instancia. (6) Se creó **`ADR-0002-api-auth-errores.md`**, se
colapsó el **C4 nivel 2** a un solo host, se actualizaron `ADR-0001`, `design.md`,
`AGENTS.md` (hosting decidido, Open questions reducidas al framework) y
`openspec validate --strict` en verde. Commit `7985b78`.

### [2026-07-05] — Historias de usuario del MVP a partir de la documentación
**Prompt:** "Quiero redactar en @documents\user_stories.md las historias de usuario
más relevantes para este MVP basándonos únicamente en la documentación."
**Resumen de la respuesta:** Se creó `documents/user_stories.md` con **17 historias
de usuario** derivadas exclusivamente de la documentación existente (`PRD.md` §4/§6/§14,
las 6 specs de `openspec/changes/clickoteca-mvp/specs/*` y el modelo de datos §15),
sin inventar pantallas ni reglas. Estructura en tres superficies de actor: **Portal
del Suscriptor** (HU-01→09: alta, plan, solicitud con asignación directa, unirse a
cola, confirmar/rechazar oferta, «Mis sets», discrepancia en entrega, iniciar
devolución, cancelación camino feliz), **Back-office** (HU-10→16: alta de copia,
registro de condición, recepción+inspección, higienización, marcar incompleta, baja
solo-admin, configuración de reglas) y **Sistema** (HU-17: equidad de cola / score
aditivo + elegibilidad al ofrecer). Cada historia lleva plantilla *rol→objetivo→
beneficio*, prioridad **MoSCoW**, **criterios de aceptación en Gherkin** (tomados de
los escenarios de las specs) y **trazabilidad** a caso de uso + capability + reglas.
Se marcaron con ⭐ las 3 candidatas para `readme.md` §5 (HU-04 cola justa, HU-05
ventana de confirmación, HU-11+HU-13 condición de entrega + doble paso inspección/
higiene) y se listaron non-goals y puntos aún abiertos en la doc como tales.

### [2026-07-05] — Visitante como actor no autenticado (proyección pública del catálogo)
**Prompt:** "Estoy valorando añadir un nuevo rol de usuario, el visitante: usuario sin
registrar que solo podría ver los sets ofrecidos (sin especificar disponibilidad) y
las condiciones de membresía junto con la opción de alta. Opiniones?" → "aplica estos
cambios usando el actor no autenticado."
**Resumen de la respuesta:** Se argumentó que el visitante **ya existía como actor**
en `PRD.md` §14.1 (UC-P01–P04, con herencia `Suscriptor --|> Visitante`) y que lo
correcto es modelarlo como **actor no autenticado, no como un cuarto rol de `User`**
(los tres roles son a nivel de cuenta y "una cuenta = un rol"; el enum `Role` no
cambia). Lo genuinamente nuevo: (a) exponer planes/condiciones en público y (b)
**ocultar la disponibilidad y la cola** al visitante —lo que **contradecía** UC-P02,
que se lo concedía—. Se recomendó trazar la frontera en la **proyección de datos**
(pública sin disponibilidad ni nivel `Copy`/cola vs. autenticada con ambas), no en el
catálogo entero. Cambios aplicados: **`design.md` D13** (nueva decisión); nuevas
Requirements en `accounts-roles` ("Acceso público no autenticado (visitante)") y
`catalog-inventory` ("Proyección pública del catálogo"); `PRD.md` §3 (nota de
visitante), §4.1 (bullet de acceso público) y §14.1 (UC-P02 y tabla de actores ya sin
disponibilidad para el visitante); **HU-00** en `documents/user_stories.md`; hecho de
proyecto en `AGENTS.md`; tareas **2.6/2.7** (acceso público + tests de gating) y **3.6**
(proyección pública vs. autenticada + tests). `openspec validate clickoteca-mvp
--strict` en verde.

### [2026-07-05] — Reconciliar la cola de reservas con D11 (entrada efectiva inmutable)
**Prompt:** "Revisando design.md y reservation-queue/spec.md, ¿no es inconsistente D11
(orden por `entrada_efectiva`) con el Requirement de prioridad aditiva? design.md tiene
la última decisión." → "aplica."
**Resumen de la respuesta:** Se diagnosticó que el requirement señalado ("Prioridad por
envejecimiento aditiva") **sí es consistente** con D11 —describe el comportamiento
aditivo, que D11 implementa dando el mismo orden—, y que la inconsistencia real estaba
en **otro sitio**: el requirement "Recálculo del score de cola" (residuo del enfoque
pre-D11 del 2026-07-04 mañana, no reconciliado cuando D11 se reescribió esa tarde,
commit `7985b78`) y su **propagación al modelo de datos** (`score` materializado en
`schema.prisma`, `PRD.md` §15 y `readme.md`; UC-P15 descrito como "recalcular"; tarea
6.2). Reconciliación aplicada hacia D11 (la decisión más reciente manda): (1) **spec
`reservation-queue`**: se sustituyó "Recálculo del score de cola" por **"Orden de cola
por entrada efectiva inmutable"** (`entrada_efectiva = enqueuedAt − bono_aplicado`,
calculada una vez, `SHALL NOT` recalcular; caducar = re-encolar al final con
penalización) y se matizó el requirement aditivo para no implicar columna materializada.
(2) **`schema.prisma`**: `score Int` → `effectiveEntryAt DateTime` + `appliedBonus Int`
(conservando `enqueuedAt` y `priorityPenalty`), reindexado por `effectiveEntryAt, id`.
(3) **`PRD.md`** §15.1/§15.2 (ER), UC-P15 y labels del diagrama; (4) **`readme.md`** §3
(ER + tabla de entidades); (5) **`user_stories.md`** HU-17 reescrita; (6) **`tasks.md`**
6.2; (7) **`AGENTS.md`**: corregido el resumen de D11 (describía la versión original ya
revertida). `openspec validate clickoteca-mvp --strict` en verde.

### [2026-07-05] — Stack: Next.js full-stack (front + API REST/OpenAPI)
**Prompt:** "Para el frontend y el backend estoy valorando para MVP Next.js como
mejor opción." → (tras evaluar el encaje y elegir modelo de API) "aplica."
**Resumen de la respuesta:** Se evaluó Next.js frente a las decisiones previas:
**mejora** el encaje con el hosting mismo-origen (unifica front+API en un deploy) y
conserva lo transversal (capas, Prisma, cookie+argon2id, RFC 9457, WCAG); **roza**
con dos compromisos —el requisito de "API REST pública en OpenAPI" (Next empuja a
Server Actions/RPC) y la decisión "SPA única" (Next es SSR/RSC, no SPA)— y obliga a
sacar el **scheduler** del in-process. Ante la bifurcación de modelo de API, el
usuario eligió **mantener REST público + OpenAPI vía Route Handlers**. Decisión
aplicada: **Next.js full-stack (App Router, TS)** sirve front (SSR/RSC) y API REST
(`app/api/*` + Zod → OpenAPI); dominio/casos de uso agnósticos del framework;
back-office por **route groups + middleware** (no chunk lazy de SPA); **scheduler
como proceso Node aparte** (node-cron); Caddy termina TLS y enruta al servidor Next;
deploy `next build` standalone + systemd. Docs actualizados: `ADR-0001` (Estado→
**Aceptado**; §Decisión, alternativas —eje Framework—, consecuencias, contexto),
`ADR-0002` (SPA→app Next), `C4-architecture.md` (nivel 2 colapsa SPA+API en un
contenedor Next + scheduler aparte; nivel 3 = Route Handlers), `AGENTS.md` (hecho de
stack, separación de superficies, **Open questions de arquitectura cerradas**),
`tasks.md` 1.1. `openspec validate clickoteca-mvp --strict` en verde.

### [2026-08-11] — Cierre de librerías: UI, tests y versión de Prisma
**Prompt:** "Empecemos. ¿Qué recomiendas como librerías de UI? Algo ligero para
móviles, pero potente para web, con aspecto moderno" → (tras elegir) stack de tests
y versión de Prisma.
**Resumen de la respuesta:** Se cerraron las tres decisiones de librerías que
bloqueaban el scaffolding (tarea 1.1), sin abrir temas de arquitectura. **UI:**
**Tailwind CSS + shadcn/ui** (componentes sobre **Radix UI**, copiados al repo en
`components/ui/*`), elegido por peso mínimo en móvil (purga de clases, cero runtime
CSS-in-JS), accesibilidad AA de serie vía Radix (alineado con WCAG 2.1 AA), estética
moderna y encaje nativo con App Router/RSC; theming por CSS variables (encaja con el
modelo `Theme`), iconos **lucide-react**, formularios **react-hook-form + Zod**
compartiendo los esquemas Zod con la API. Descartados MUI/Chakra (runtime CSS-in-JS,
fricción con RSC) y Mantine (más bundle, menos idiomático RSC). **Tests:** **Vitest**
(unit/integración), **Playwright** (E2E), **Testcontainers** para Postgres real en
integración (prueba real de transiciones de `Copy` y CAS/orden de cola). **Prisma:**
se decidió **Prisma 7**, lo que obliga a migrar la config del datasource de
`url = env("DATABASE_URL")` a `prisma.config.ts` al inicializar el backend (afecta a
la tarea 1.2; supersede la nota previa de pinnear Prisma 6). Registrado en `AGENTS.md`
(hechos + Open questions cerradas).

### [2026-08-11] — Scaffolding del proyecto Next.js (tarea 1.1)
**Prompt:** "Empecemos. ¿Qué recomiendas como librerías de UI? Algo ligero para
móviles, pero potente para web, con aspecto moderno" → (tras cerrar UI/tests/Prisma y
elegir layout) ejecución del scaffolding.
**Resumen de la respuesta:** Se generó y **verificó** el esqueleto de la app (tarea
1.1). Layout elegido: **app en la raíz** del repo (proyecto único Next.js), moviendo
`backend/prisma/schema.prisma` → **`prisma/schema.prisma`** y actualizando las refs en
los docs vivos (README, PRD, C4, ADR-0001, design, tasks, AGENTS); `prompts.md` se dejó
como log histórico. Stack cableado: **Next 16 + React 19.2 + Tailwind v4 + shadcn/ui
(Radix) + Prisma 7 (generator `prisma-client` + driver adapter `@prisma/adapter-pg`,
URL en `prisma.config.ts`) + Zod 4/react-hook-form + Vitest/Playwright/Testcontainers**.
Estructura en capas (route groups public/portal/backoffice, `app/api/health`,
`proxy.ts` de auth —Next 16 renombró middleware→proxy—, `src/domain` con
`reservation-queue/ordering.ts` puro alineado con D11, `src/use-cases`,
`src/repositories`, `src/db/prisma.ts`, `scheduler/` node-cron aparte). Verificado en
verde: `prisma generate`, `tsc --noEmit`, `eslint .`, `next build` (5 rutas),
`vitest run` (6 tests humo) y runtime real (`/api/health`, landing, `/portal`).
Caveats registrados en AGENTS.md: Node ≥22.22 para Testcontainers (hay 22.19) y uso del
flat config nativo de `eslint-config-next` 16 en vez de `FlatCompat`. Decisiones de
librerías (UI/tests/Prisma) documentadas en `AGENTS.md`; `tasks.md` 1.1 marcada [x].

### [2026-08-16] — Flujos de usuario por rol (primer entregable de UX)
**Prompt:** "¿Cómo me puedes ayudar en el diseño de la UX?" → "Flujos por rol".
**Resumen de la respuesta:** Primer entregable de `PRD.md` §9, que seguía vacío a
propósito: **`documents/ux-flows.md`** con actores y superficies, **mapa de navegación**
y **15 diagramas Mermaid** de flujo por rol (visitante, suscriptor, operador, admin y
el sistema/scheduler como actor invisible), más una tabla de cobertura HU → flujo →
pantalla. El método fue cruzar tres fuentes: `user_stories.md` (qué debería poder
hacerse), las specs/PRD (bajo qué reglas) y **el código de `app/`** (qué se puede hacer
hoy). Ese tercer cruce es el que aporta información nueva: **solo 8 de 18 historias
tienen recorrido completo por interfaz**; el resto existe en la API pero **sin pantalla
desde la que ejecutarse** (solicitar set, encolarse, registro de condición,
discrepancia, pausar/cancelar, alta de set/copia, editar planes). Hallazgo crítico:
**contratar un plan (HU-02) no existe en ninguna capa** — `PUT /api/subscriptions/me`
solo cambia el estado de una suscripción ya existente y `register-subscriber.ts` no
crea ninguna, así que las únicas suscripciones del sistema son las de la semilla y un
usuario registrado en la app real nunca podría alquilar. Otros huecos: no hay ficha de
set `/catalogo/:id` (la pantalla que desbloquea el flujo central y donde D13 se hace
visible), y las copias `ALQUILADA` pendientes de envío no aparecen en la cola de
trabajo del operador. El documento cierra con siete decisiones a tomar antes de dibujar
pantallas y el orden propuesto para las fases siguientes (sistema de diseño →
wireframes → implementación → verificación de accesibilidad). Los 15 diagramas se
validaron con el parser real de Mermaid.

### [2026-08-16] — Decisión de alcance: el plan entra en el alta, fuera el alquiler puntual
**Prompt:** "La selección de plan debe realizarse en HU-01. HU-02 debería ser un
cambio de plan" (+ respuestas: solo BASIC/PREMIUM en el alta, eliminando el alquiler
puntual como opción; el downgrade con sets fuera se rechaza hasta devolver).
**Resumen de la respuesta:** Primera decisión salida de la revisión de flujos, que
cierra el callejón detectado en `ux-flows.md` §8.1. **HU-01** absorbe la elección de
plan —usuario, dirección, método de pago y **suscripción** en la misma transacción, sin
estado intermedio "cuenta sin plan"—; **HU-02** pasa a ser **cambio** de plan BASIC ⇄
PREMIUM, inmediato al subir y **rechazado al bajar mientras tenga más sets ocupando
plaza de los que permite el plan nuevo** (mismo criterio que pausar/cancelar: la regla
se cae del límite de plazas, no es una comprobación aparte); y el **alquiler puntual
sin suscripción sale del alcance**. Se documentó además que el `appliedBonus` de las
colas vivas **no se recalcula** al cambiar de plan (D11), así que subir a premium no
adelanta esperas en curso — algo que hay que decir en pantalla *antes* de pagar.
Sincronizados `user_stories.md` (HU-01, HU-02, HU-16 y notas de alcance), `PRD.md`
(§1, §4.3, §5, §6, UC-P05, UC-B10 y el rationale del modelo de datos) y `ux-flows.md`
(flujos V2 y S5 redibujados, tabla de cobertura y §8.1). **No** se tocaron specs ni
código: retirar el alquiler puntual es un cambio de comportamiento que debe ir por
propuesta OpenSpec, y quedó inventariado qué deja sin uso (`checkOneOffEligibility`,
`computeOneOffPrice`, la bifurcación de `requestSet`, dos `SystemSetting`) y qué falta
crear (la suscripción en `register-subscriber.ts` y el cambio de plan en
`PUT /api/subscriptions/me`, que hoy solo acepta `status`).

### [2026-08-16] — OpenSpec: archivado del MVP y cambio `plan-obligatorio-en-alta`
**Prompt:** "actualiza openspec antes de seguir".
**Resumen de la respuesta:** Se llevó a OpenSpec la decisión de alcance anterior, en dos
pasos. **(1) Archivado del MVP:** `clickoteca-mvp` estaba ✓ Complete (45/45) pero sin
archivar, así que `openspec/specs/` estaba **vacío** y ningún delta de tipo
MODIFIED/REMOVED podía validarse contra una línea base inexistente. `openspec archive`
aplicó los deltas y promovió **32 requisitos** a 6 capabilities; se rellenaron a mano
los `## Purpose` que el archivado deja como TBD. **(2) Cambio nuevo
`plan-obligatorio-en-alta`** con sus cuatro artefactos: proposal, tres delta specs
—`subscriptions` (ADDED "Suscripción activa desde el alta", "Cambio de plan" y "Precio
de los planes"; REMOVED "Alquiler puntual sin suscripción" y el requisito de precio que
lo agrupaba), `rentals-returns` (MODIFIED: solicitar exige suscripción activa) y
`accounts-roles` (MODIFIED: el alta incluye elegir plan)—, `design.md` con seis
decisiones razonadas y `tasks.md` con 18 tareas en cuatro bloques. Dos detalles de
diseño que no estaban en la conversación previa: el downgrade se mide con
**`OCCUPYING_COPY_STATES`** y no con el conjunto más estrecho de pausar/cancelar (si
no, un BASIC podría quedarse por encima de su propio límite), y el orden de las tareas
abre el camino nuevo **antes** de cerrar el viejo, porque al revés habría un momento sin
ninguna forma de conseguir una suscripción. Aprendido del validador: **RENAMED y
MODIFIED no pueden coincidir** sobre el mismo requisito, así que un renombrado con
cambio de contenido se expresa como REMOVED + ADDED. Se corrigió además
`npm run spec:validate`, que apuntaba al cambio ya archivado y fallaba, por
`openspec validate --all --strict`. Todo en verde: **7 items, 0 fallos**.

### [2026-08-17] — Implementación de `plan-obligatorio-en-alta` (18/18)
**Prompt:** "sigamos".
**Resumen de la respuesta:** Se implementó entero el cambio que estaba propuesto y sin
ejecutar. **(1) Alta con plan:** `registerSubscriber` acepta `planCode`, lo valida
contra los planes activos y acumula el fallo en `errors[]`; la suscripción `ACTIVE` se
crea **dentro de la transacción existente** del alta (usuario + dirección + tarjeta +
suscripción, o ninguna de las cuatro). Interfaz: selector de plan en `/registro` con los
planes leídos de la base, plan preseleccionado por `?plan=` desde `/planes` y cambiable
sin volver atrás; **sin valor por defecto**, para que elegir plan siga siendo una
decisión y no un descuido. **(2) Cambio de plan:** caso de uso `changePlan` +
`PUT /api/subscriptions/me` ampliado con `planCode` (sigue resolviendo siempre la
suscripción del usuario en sesión), sección "Tu plan" en el portal con el aviso de que
las colas vivas **no** se reordenan (D11), y auditoría con el antes/después copiado.
**(3) Retirada del alquiler puntual:** fuera `checkOneOffEligibility`,
`computeOneOffPrice` (fichero borrado), la bifurcación de `requestSet`, los dos
`SystemSetting` y sus campos en el formulario del admin; los tests que probaban la vía
puntual se **convirtieron** en pruebas del rechazo. **(4) Semilla y cierre:** Carla pasa
a tener suscripción **CANCELLED** —desde este cambio no existe la cuenta de suscriptor
sin suscripción, así que sembrarla sin ninguna contradiría la spec— y el E2E arranca en
un alta con plan y cambia de plan en el portal.
**Decisiones tomadas al implementar:** (a) la creación de la suscripción se delega en el
**puerto** de suscripciones (validación del plan) y la escribe el adaptador dentro del
`$transaction`, en vez de invocar un caso de uso dentro de la transacción, que invertiría
la dirección de dependencias; (b) **dos códigos de error nuevos**,
`NO_ACTIVE_SUBSCRIPTION` y `PLAN_DOWNGRADE_BLOCKED`, porque lo que resuelve cada rechazo
es distinto —contratar plan, o devolver un set—, y el segundo dice **cuántos** devolver;
(c) `canSwitchToPlan` no bifurca por dirección del cambio: mide lo que ocupa plaza contra
el límite del plan destino, así que subir pasa solo.
**Lo que encontró el E2E y no encontraron los unitarios:** con `planCode: z.string(msg)`
la cadena vacía pasaba el esquema del borde, así que el error del plan **no** aparecía
junto al resto del formulario; hizo falta `.min(1, msg)`. Verificado además contra la
base sembrada: alta sin plan y con plan inexistente (422 con mensajes distintos), alta
correcta con suscripción activa, subida y bajada de plan, cuenta sin plan activo
rechazada al pedir un set (409) y bajada bloqueada con dos sets fuera (409).
**Verde:** `tsc`, `eslint`, 275 tests unitarios, 10 E2E, `next build` y
`openspec validate --all --strict`.

### [2026-08-19] — Sistema de diseño: tokens, tonos y vocabulario de estados
**Prompt:** "seguimos con la ux".
**Resumen de la respuesta:** Se ejecutó el paso 1 del plan que dejó `ux-flows.md` §9
—el **sistema de diseño**— y se implementó, no solo se escribió.
**(1) Paleta.** Los tokens eran los grises puros de fábrica de shadcn (croma 0). Ahora
la familia neutra lleva `h≈258` con croma bajísimo (los grises "van juntos" sin
percibirse azules), hay un azul de acción `--primary` y un amarillo de marca
`--highlight` **que no es color de acción** —no lleva texto de botón encima, para no
acabar con dos primarios peleándose—. Todo en OKLCH y **calculado, no elegido a ojo**:
un script propio de OKLCH→sRGB→ratio WCAG fijó cada valor.
**(2) Cinco tonos de estado** (`--tone-*`, con fondo/texto/borde cada uno) separados a
propósito de los semánticos de superficie: mezclarlos es lo que convierte el rojo de
"esto ha fallado" en ruido de fondo.
**(3) Vocabulario de estados** en `lib/status.ts` con dos reglas: la **granularidad
depende de quién mira** —al operador el estado exacto, al suscriptor los cuatro pasos
del circuito de devolución fundidos en "Devolución en curso"— y **el tono mide la
urgencia de quien lee, no el estado**: `EN_INSPECCION` es `warning` para el operador e
`info` para el suscriptor. Aplicado al portal, la cola de trabajo, clientes y personal:
se acabaron los `EN_HIGIENIZACION` y los `QUEUE_TURN` en pantalla.
**(4) Dos redes de seguridad.** `tests/design-tokens.test.ts` lee `globals.css` y mide
los contrastes de verdad (4.5:1 texto / 3:1 controles, en los dos temas, todo dentro
de gamut sRGB, ningún token sin override en `.dark`); `tests/status.test.tsx` lee
**`prisma/schema.prisma`** y exige etiqueta para cada valor de cada enum en cada
superficie. Un estado nuevo sin traducir pone la suite roja en vez de llegar a
producción en MAYÚSCULAS.
**Lo que encontraron esas pruebas y no había visto nadie:** el token `--input` (borde
de control) no llegaba al 3:1 de WCAG 1.4.11; el botón destructivo llevaba
`text-white` fijo, que sobre el rojo claro del tema oscuro se queda en **3.13:1** (de
ahí `--destructive-foreground`); y los nueve mensajes de error usaban `text-red-600`,
un color de Tailwind ajeno al tema que en oscuro da 3.82:1. Los tres corregidos.
**Trampas técnicas:** a `L≥0.93` el gamut sRGB se estrecha tanto que el croma máximo
del azul cae a ~0.03 mientras el verde admite 0.10 —los fondos de tono salieron de un
solver, no de copiar un valor entre hues—; bajo jsdom, Vitest reescribe
`import.meta.url` a `http://…` y `fileURLToPath` lo rechaza (hay que usar
`process.cwd()`); y un comentario JSX no puede colocarse entre `? (` y el elemento.
**Documentación sincronizada:** `documents/design-system.md` (nuevo, 10 apartados con
las tablas de tokens y de ratios generadas desde el CSS real), `ux-flows.md` (§8.2
punto 5 cerrado, §9 replanteado) y `readme.md` §1.3, que seguía diciendo que el diseño
estaba entero pendiente.
**Verde:** `tsc`, `eslint`, **344 tests** (275 → 344: +51 de tokens, +18 de
vocabulario) y `next build`. El **E2E no se pudo ejecutar** —Docker y Postgres no
estaban levantados en la máquina—, pero se actualizó `circuito-completo.spec.ts`, que
afirmaba sobre los títulos viejos de la cola de trabajo.

### [2026-08-19] — El E2E ejecutado de verdad: tres problemas y uno abierto
**Prompt:** "puedes arrancar el docker?".
**Resumen de la respuesta:** Docker ya estaba en marcha (`clickoteca-db` sano), así que
se aprovechó para correr Playwright, que no se había podido ejecutar al cerrar el
sistema de diseño. Aparecieron tres cosas.
**(1) Una regresión propia:** al rehacer el bloque "Tu plan" del portal desapareció el
literal "Plan actual: Premium" que el test afirmaba. Se arregló por el lado bueno: los
bloques del portal pasan a ser `<section aria-labelledby>` —regiones con nombre
accesible, que además es deuda que el propio sistema de diseño tenía anotada— y el test
pasa a acotarse con `getByRole("region", { name: "Tu plan" })`, así que ya no depende de
cómo esté redactada una frase. Lección clara: **cambiar copia rompe E2E**, y `tsc` +
unitarios no lo ven.
**(2) El circuito no era repetible:** terminaba con Bruno quedándose el set, así que la
segunda ejecución le encontraba en su límite de plazas y el `no_copy_available` que
esperaba llegaba como `NOT_ELIGIBLE`. Ahora el test **cierra el circuito** —Bruno
devuelve, el operador recepciona, inspecciona e higieniza— y deja la copia
`DISPONIBLE`. El residuo de las ejecuciones anteriores se limpió por la API de la
aplicación, no tocando `copy.state` a mano, que se saltaría la máquina de estados.
**(3) El proyecto `mobile` repetía el recorrido completo** y competía con `chromium`
por la misma copia. Acotado al smoke: lo que aporta el móvil es el viewport pequeño, no
duplicar un circuito con estado compartido.
**Lo que queda abierto:** con los 5 workers por defecto el suite falla ~50% de las
veces, siempre en `page.goto("/")` o `/catalogo`, agotando el tiempo esperando el
evento `load` **aunque el servidor conteste el HTML en 50 ms**. Con `--workers=1` y un
solo proyecto es estable y tarda 7 s. Descartado que sea estado, que sea el CDN de
Rebrickable (se abortan sus imágenes en `e2e/fixtures.ts`) y que sea el servidor frío
(hay `e2e/warmup.ts` y el timeout subió a 60 s). La siguiente prueba pendiente es bajar
`workers` en la configuración y ver si a 1 o 2 se estabiliza.
**Verde:** `tsc`, `eslint`, 344 unitarios, y el E2E **12/12 varias veces seguidas**
cuando no le pega la inestabilidad de paralelismo.

### [2026-08-19] — El E2E deja de probar `next dev` y pasa a probar lo que se despliega
**Prompt:** "continue".
**Resumen de la respuesta:** Se retomó el único punto abierto —el E2E inestable con el
paralelismo por defecto— y se cerró por la vía buena. El diagnóstico previo ya decía que
el culpable era el pool de workers de `next dev`, no las pruebas; en vez de esconderlo
bajando `workers` a 1, **se cambió el objetivo**: `playwright.config.ts` hace `next build`
y levanta el **paquete autónomo** (`output: "standalone"`) en el **puerto 3100**.
Resultado: **14/14 en ~35 s con los 5 workers por defecto**, repetido sin un solo fallo.
**Por qué el puerto 3100 y `reuseExistingServer: false`:** con el 3000 y la reutilización
activada, un `next dev` abierto se colaba como servidor de pruebas y un `start` viejo
servía un build anterior —la trampa que ya había costado una sesión—. Ahora el puerto
ocupado falla en voz alta.
**Por qué el paquete autónomo y no `next start`:** `next start` avisa de que no funciona
con `output: standalone` y tiene razón —el paquete **no incluye `.next/static`**, copiarlo
es trabajo del despliegue—. El nuevo `scripts/start-standalone.mjs` hace esa copia (y la
de `public`) y arranca `server.js`, que es literalmente el runbook de la VM (ADR-0001 §5).
Así el E2E cubre también el empaquetado, no solo la aplicación.
**Prueba nueva que vigila justo eso:** si los estáticos faltan, las páginas siguen
respondiendo 200 y el evento `load` no se entera —un chunk caído no lo impide—, así que
el smoke mira el tráfico de `/_next/static/` y exige que haya alguno y que ninguno falle.
Comprobado que no es una prueba vacua: borrando el directorio, el chunk pasa de 200 a 500.
**Puerta de escape para iterar:** `E2E_DEV=1` sigue apuntando a `next dev` (puerto 3000,
un worker), que es lo único que aquel pool aguantaba, para no pagar un build por vuelta
mientras se escribe una pantalla. El calentamiento ya no lleva el puerto a mano: lo lee
del `baseURL` de la configuración.
**Verde:** `tsc`, `eslint`, **344 unitarios**, `openspec validate --all --strict` y
**14 E2E** en tres ejecuciones seguidas.

### [2026-08-19] — `axe` entra en el E2E: la accesibilidad se comprueba sola
**Prompt:** "continue".
**Resumen de la respuesta:** Con el E2E ya estable se cerró el punto 4 del plan de UX
(`ux-flows.md` §9), que llevaba abierto desde el sistema de diseño: **no había ninguna
comprobación automatizada de accesibilidad**. Ahora `e2e/accesibilidad.spec.ts`
(`@axe-core/playwright`) audita **nueve pantallas** —las cinco públicas, el portal y las
cuatro del back-office— y **sale limpia a la primera**, lo que era de esperar después de
haber medido el contraste de los tokens y haber puesto nombres accesibles a las regiones.
**Se piden solo las etiquetas de conformidad** (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`): las *best-practice* de axe son consejos razonables, pero mezclarlas con el
criterio convierte el rojo en una opinión y se deja de arreglar. **El informe se formatea
a mano** —regla, impacto, `helpUrl` y selector—, porque un `toEqual([])` a secas escupe el
objeto entero de axe y obliga a bucear para saber qué elemento falla.
**Alcance honesto:** axe encuentra los fallos mecánicos, del orden de un tercio de los
reales; que esto esté verde no significa "es accesible" —el recorrido por teclado y la
calidad de los textos alternativos siguen sin comprobarse, y así queda escrito en el
propio fichero y en `design-system.md`.
**Refactor menor:** `login`/`apiLogin`/`PASSWORD` salen de `circuito-completo.spec.ts` a
`e2e/sesion.ts`, que ahora usan los dos recorridos.
**Un hallazgo con el paralelismo:** al añadir axe volvieron los timeouts en `page.goto`
con los workers por defecto, esta vez también contra el build autónomo y hasta en el
smoke. **No es el fallo de `next dev`** —no hay 500 ni pool caído—: es hambre de recursos,
cada worker es un Chromium entero y auditar con axe es caro en el navegador. Fijado
`workers: 3`, con el porqué escrito en la configuración: **21 pruebas en ~40 s**, verde
repetido.
**Verde:** `tsc`, `eslint`, 344 unitarios y **21 E2E** en dos ejecuciones seguidas.
