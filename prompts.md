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

**Prompt 1:** "Empecemos. ¿Qué recomiendas como librerías de UI? Algo ligero para
móviles, pero potente para web, con aspecto moderno" — la sesión que, además de las
librerías, fijó el **layout del repositorio**: proyecto Next.js único con la app en la
raíz, `backend/prisma/schema.prisma` → `prisma/schema.prisma` y los primitivos de shadcn
en `components/ui/*`. Ver log [2026-08-11].

**Prompt 2:** "lo siguiente del plan es la navegación en los dos layouts
(wireframes.md §8.5)" — los destinos de cada superficie se declaran en
`lib/navigation.ts`, filtrados por la matriz de permisos, y se pintan desde el layout del
portal y el del back-office en vez de vivir dentro de una página.

**Prompt 3:** "actualiza openspec antes de seguir" — el archivado del MVP reparte la
estructura documental: `openspec/changes/` queda para lo que está en curso y
`openspec/specs/` pasa a contener las 6 capabilities con sus 32 requisitos.

### **2.4. Infraestructura y despliegue**

**Prompt 1:** "El MVP debe ser accesible públicamente para su revisión, y no
escalará a producción, con lo que sugiere distintos proveedores donde alojar
la aplicación y la base de datos, si puede ser de forma gratuita, como MVP."

**Prompt 2:** "Limpia y cierra. Como base de datos he creado en Vercel una llamada
'supabase-clickoteca'. ¿Hay que modificar muchas cosas del proyecto?" — de aquí salen las
**dos URLs** (pooler de transacción para la aplicación, conexión directa para las
migraciones), `DATABASE_POOL_MAX` sin valor por defecto y el script `db:deploy`.

**Prompt 3:** "Verifica que la documentación, incluyendo readme, refleja los cambios de
VM a Vercel. La URL pública de la aplicación ahora será clickoteca.vercel.app. Y que
OpenSpec está debidamente actualizado." — nace `ADR-0003`, y `ADR-0001` §5 se queda con un
banner de *sustituida* y sus negativas tachadas pero visibles.

### **2.5. Seguridad**

**Prompt 1:** "¿Queda algún aspecto a revisar de la arquitectura?" — de esa sesión de
decisiones sale `ADR-0002`: **sesión server-side** con cookie `httpOnly` que transporta un
token opaco (en la base solo su SHA-256, así que un volcado de la tabla no permite
suplantar sesiones), `argon2id` para las contraseñas y contrato de errores RFC 9457.

**Prompt 2:** "`admin@clickoteca.test` ¿tiene la misma password que en desarrollo?" → "¿Y
el resto de cuentas tienen ese mismo seed password?" — sí: la semilla usa **un único hash
para las cinco cuentas**, de modo que la contraseña publicada en el readme no era la de un
suscriptor de demostración sino una llave maestra que entra como administrador. Nace
`SEED_PASSWORD` y las credenciales de la instancia desplegada dejan de publicarse.

**Prompt 3:** "Tengo una cuenta Hobby. Vercel me lista las variables de entorno que ha
creado junto con la base de datos: …" — higiene de secretos: `.gitignore` pasa a ignorar
`.env*` entero en vez de una lista de variantes (`.env.vercel` de `vercel env pull` se
colaba), el código no lee las `STORAGE_*` de la integración, y queda anotado que
`vercel env pull` baja esos valores como `[SENSITIVE]`.

### **2.6. Tests**

**Prompt 1:** "puedes arrancar el docker?" — primera ejecución de verdad de la suite E2E,
que destapó tres problemas; el stack (Vitest, Playwright y Testcontainers para un Postgres
real) se había cerrado en la sesión de librerías, ver log [2026-08-11].

**Prompt 2:** "continue" — con el arnés en rojo por el pool de compilación de `next dev`,
se cambió el objetivo en vez de bajar el paralelismo: Playwright hace `next build` y
levanta el **paquete autónomo** en el puerto 3100, que es un artefacto de producción.

**Prompt 3:** "continue" — `@axe-core/playwright` entra en el E2E y audita nueve
pantallas, cerrando el hueco de accesibilidad que `ux-flows.md` §9 tenía anotado.

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

**Prompt 3:** "Empecemos. ¿Qué recomiendas como librerías de UI? Algo ligero para
móviles, pero potente para web, con aspecto moderno" — la misma sesión cerró la **versión
de Prisma**, movió el esquema a `prisma/schema.prisma` y dejó la URL de conexión en
`prisma.config.ts` en vez de en el bloque `datasource`.

---

### 4. Especificación de la API

**Prompt 1:** "Para el frontend y el backend estoy valorando para MVP Next.js como mejor
opción." — al evaluar el encaje se eligió el modelo de API: **Route Handlers en
`app/api/*` con Zod → OpenAPI**, es decir una API REST pública de verdad, en lugar de las
Server Actions/RPC hacia las que empuja Next.

**Prompt 2:** "Vamos a por W4" — y con ella la decisión de **no** escribir `GET /api/sets`:
las pantallas del back-office son Server Components que leen el repositorio, y la API
pública se amplía cuando la pida alguien de fuera, no por simetría.

**Prompt 3:** "Estoy probando de hacer un deployment en Vercel. Da el siguiente error:
[module not found en `src/db/prisma.ts`] … Sí, commitea y monta el endpoint de cron" —
nace `GET /api/cron/:job`, con `Authorization: Bearer $CRON_SECRET` comparado en tiempo
constante y **cerrado por defecto**: sin la variable el endpoint responde 404.

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

**Prompt 1:** "La selección de plan debe realizarse en HU-01. HU-02 debería ser un cambio
de plan" — de aquí sale el cambio OpenSpec `plan-obligatorio-en-alta`, con su propuesta,
sus deltas de spec y sus **18 tareas**.

**Prompt 2:** "sigamos" — ejecución de las 18: el alta acepta `planCode`, lo valida contra
los planes activos y crea la suscripción **dentro de la misma transacción** que el
usuario, la dirección y la tarjeta.

**Prompt 3:** "resolvamos los bloqueos" + "Añadir que si alguien se quiere dar de alta con
un correo previamente cancelado, se debe poder dar de alta de nuevo (o si provee la
password correcta, reactivar la suscripción)" — los dos bloqueantes de `wireframes.md`
§8.1 y §8.2, y la vuelta de quien canceló.

---

### 7. Pull Requests

**Prompt 1:** "Reemplaza los esquemas PlantUML del PRD por Mermaid. Luego, como arquitecto
de software, genera el modelo de datos organizando entidades y relaciones por orden de
importancia […] y genera el esquema Prisma en `backend/prisma`." — hito **`7c37834`**
(*Pull Request 1 — Modelo de datos*); el mismo prompt de §3.

**Prompt 2:** "Siguiendo con la arquitectura del sistema, genera en `documents` los
diagramas C4 a partir de los specs actuales para revisión, junto con un Architecture
Decision Record (ADR)." — hito **`7985b78`** (*Pull Request 2 — Arquitectura*), junto con
las decisiones de concurrencia, orden de cola y contrato de errores dictadas después.

**Prompt 3:** "Para el frontend y el backend estoy valorando para MVP Next.js como mejor
opción." — hito **`a5edc4b`** (*Pull Request 3 — Cierre de arquitectura y stack*): el
mismo prompt de §4, que además cerró las *Open questions* de arquitectura.

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

### [2026-08-20] — Wireframes: las cinco pantallas que faltan, dibujadas contra el código
**Prompt:** "sigamos con ux" (formato elegido: Markdown en `documents/`; alcance: la
tanda completa de cinco pantallas, cerrando de paso las decisiones abiertas).
**Resumen de la respuesta:** Tercer entregable de UX —
**[`documents/wireframes.md`](documents/wireframes.md)**, ~1.000 líneas — con las cinco
pantallas que `ux-flows.md` §9.2 dejó pendientes: **W1** ficha de set `/catalogo/:id`,
**W2** registro de condición (back-office), **W3** revisión de entrega y discrepancia
(portal), **W4** catálogo e inventario (back-office) y **W5** portal ampliado. Wireframes
ASCII de **disposición y contenido**, no de estilo: el color y la tipografía ya están
resueltos y medidos en `design-system.md`. Cada pantalla lleva los mismos cuatro
apartados —de dónde salen los datos, acciones con sus respuestas reales, vacío/error/
espera, y accesibilidad—, que son justo los que se dejan para el final.
**El método vuelve a ser el que dio resultado en `ux-flows.md`:** dibujar contra el
**código que ya existe** —la forma real de las proyecciones, los veredictos reales del
dominio, los `detail` reales de la API— en vez de contra una idea de lo que debería
haber. Eso es lo que produce información nueva.
**Se cierran los tres puntos que quedaban de `ux-flows.md` §8.2:** (3) el back-office de
catálogo es **lista + ficha con inventario, sin endpoint nuevo** —la API completa ya
existe y sin lista no hay forma de llegar a un set no publicado, que es como nace todo
set—; (4) "mi suscripción" va a **pantalla propia** `/portal/suscripcion`, porque ahí
tienen que caber pausar, cancelar y reactivar, y cancelar no puede ser un botón más en
una lista de bloques; (7) la navegación del portal es un **`layout.tsx` con cinco rutas**,
cabecera y no `tabs`, porque son URL de verdad.
**Siete huecos de implementación que solo aparecen al intentar dibujar la pantalla**, dos
bloqueantes: (1) **`ALQUILADA` no está en `ACTIONABLE_STATES`**, así que W2 sería una
pantalla sin puerta — y registrar la condición no cambia el estado de la copia, luego el
grupo nuevo de la cola de trabajo tiene que excluir las que ya tengan envío de salida;
(2) el **`checklist` es un `Record<string, unknown>` libre** en los dos endpoints, no hay
catálogo de comprobaciones en ninguna capa y una pantalla no se dibuja contra un
diccionario (se proponen cuatro ítems, **a ratificar**); (3) la ventana de discrepancia
reutiliza **`offerConfirmationWindowHours`**, así que acortar el plazo de las ofertas
acorta sin querer el de reclamar una entrega; (4) **la posición en la cola no llega al
portal** —`QueueEntrySummary` no la trae—, así que HU-06 se queda a medias hasta tocar el
repositorio; (5) **la navegación de superficie no está en los layouts** —existen, pero el
`<nav>` del back-office vive dentro de su portada—; (6) no hace falta `GET /api/sets`; (7) la tabla de cobertura de `ux-flows.md` estaba **desfasada** —
se escribió un día antes de `plan-obligatorio-en-alta`.
**La decisión de diseño que sale directamente del dominio:** el suscriptor **no puede
tener un botón de "Todo correcto"** al revisar una entrega. La conformidad tácita no se
persiste a propósito (es la ausencia de discrepancia pasada la ventana), así que ese
botón no llamaría a nada y dejaría al usuario creyendo que ha dejado constancia. Solo hay
una acción —"Algo no coincide"— y el silencio se explica en vez de disfrazarse.
**Cobertura:** hoy **9 de 18** historias tienen recorrido completo por interfaz; con las
cinco pantallas construidas serían **16 de 18** y **6 de 6** de las ⭐ distintivas — es
decir, se podría ser cliente de Clickoteca usando solo el navegador, que hoy no se puede.
**Sincronizados:** `ux-flows.md` (§7 corregida, §8.2 cerrada entera, §9 al día),
`design-system.md` §6.2 (cuatro componentes más, `tabs` descartado), `PRD.md` §9 y
`readme.md` §1.3 + árbol de ficheros.

### [2026-08-20] — W1: la ficha de set, construida
**Prompt:** "sigamos".
**Resumen de la respuesta:** Primera pantalla de los wireframes, y la que más pesaba:
**`/catalogo/:id`** (`app/(public)/catalogo/[setId]/page.tsx` + `set-actions.tsx`, con
`Card` traído de shadcn). El catálogo deja de ser **una rejilla sin destino**: HU-00,
HU-03 y HU-04 pasan a verde y ya se puede pedir un set y entrar en su cola desde el
navegador — **12 de 18** historias con recorrido por interfaz, y 5 de las 6 ⭐.
**La pantalla es donde D13 se hace visible:** la misma URL cuenta cosas distintas según
quién mira, y eso se resuelve con **un `loadView` que devuelve un tipo discriminado**
(`public` | `authenticated`) en vez de repartir `if (session)` por la plantilla. Todo lo
que cambia vive en **una sola caja de decisión**, para que la página mantenga una única
pregunta viva: ¿puedo llevármelo, y si no, por qué? Los cuatro motivos de no elegibilidad
se muestran con **el `detail` literal del dominio** y una salida distinta cada uno; y con
`PLAN_LIMIT_REACHED` se ofrecen **las dos cosas** —el aviso y la cola—, porque `joinQueue`
no mira el límite de plazas. A operador y admin no se les pide veredicto: les diría
"necesitas una suscripción activa", que es cierto e inútil.
**Se decidió no enseñar "Pedir este set" sin copias libres** aunque la API lo toleraría
(devuelve `200 no_copy_available`): esa tolerancia es para la carrera entre pintar y
pulsar, no una forma de ahorrarse la decisión. Si la carrera ocurre, se explica en el
sitio.
**Dos correcciones que solo aparecen al construir:** (1) la **cabecera pública ofrecía
"Acceder" a quien ya tenía sesión** — no se notaba porque nadie visitaba las páginas
públicas estando dentro, y con la ficha un suscriptor navega el catálogo desde dentro;
ahora enlaza a su superficie. Una pantalla nueva no solo añade: **cambia quién pisa las
viejas**. (2) "1 de 1 copias libres" estaba mal escrito.
**Dos trampas de Playwright que costaron una ejecución roja:** `getByRole("button",
{ name: "Salir" })` casa **por subcadena** y en la ficha encontraba **"Salir de la
cola"**, así que el paso que creía cerrar sesión deshacía el anterior; y esperar la
navegación con un `expect` sobre el destino la somete al reloj de la aserción (5 s) en vez
de al de la prueba — con tres workers, la primera petición de una ruta recién estrenada
los agota y el fallo miente. Este último **solo salía contra el build autónomo**, no
contra `next dev`.
**Y un no-fallo que lo parecía:** "6785 piezas" sin separador de millares es **correcto**
en español (CLDR usa `minimumGroupingDigits: 2`).
**Verificación:** 344 unitarios, `tsc`, `eslint` y **27 E2E en dos ejecuciones seguidas**
dejando la base limpia. Los pasos 1 y 2 del circuito completo **pasan ahora por la
interfaz**, que es donde tocaba probar HU-03 y HU-04 sin que dos ficheros se disputen la
misma copia; `axe` audita ya **doce pantallas** (la ficha cuenta como dos, una por
proyección). Sincronizados `wireframes.md` (§3.10 nuevo), `ux-flows.md` §7,
`design-system.md` §6.1, `PRD.md` §9 y `readme.md` §1.3.

### [2026-08-20] — La navegación de superficie, en los dos layouts
**Prompt:** "lo siguiente del plan es la navegación en los dos layouts
(wireframes.md §8.5)".
**Resumen de la respuesta:** Paso 2 de `wireframes.md` §9.2, el que todo lo que viene
después da por supuesto. Los destinos de cada superficie se declaran en
**`lib/navigation.ts`** y los pinta **`SurfaceNav`** desde el **layout**: la barra del
back-office vivía dentro de `backoffice/page.tsx`, así que existía en el centro y no en
las secciones —de `/backoffice/clientes` a `/backoffice/empleados` había que volver al
hub—, y ahora está en las cinco.
**Una lista única en vez de JSX repartido**, porque las tres cosas que pueden salir mal
son datos y no pintura: **quién ve qué** sale de la **matriz de permisos** y nunca de un
`if (rol === admin)`; **qué está activo** se marca con `aria-current="page"`, con prefijo
en las secciones —la ficha de un cliente ilumina `Clientes`— y **coincidencia exacta en
la raíz**, o `/backoffice` saldría activa en las cinco; y **qué existe todavía no**: los
destinos sin pantalla se declaran con `pending` y no se pintan, así que el orden de la
barra es una decisión de diseño y no el orden en que se implementaron las pantallas.
**Se preguntó antes de construir** qué hacer con el portal, que solo tiene una ruta:
la opción elegida evita enlaces a 404 —declara sus cinco destinos, pinta uno y por eso
la barra no aparece— y deja que **W5 y W4 la enciendan quitando una marca**, sin volver
a tocar los layouts.
**Efecto colateral que la barra hace evidente:** los tres enlaces «← Volver a la cola de
trabajo» de las secciones sobraban y se han quitado; el de la ficha de un cliente a su
lista se queda, porque es un paso atrás y no una sección.
**No hizo falta traer nada de shadcn** —`navigation-menu` es para menús con submenús;
esto son cinco enlaces planos dentro de un `<nav>`—, así que esa fila sale de la tabla de
componentes pendientes de `design-system.md` §6.2.
**Verificación:** 354 unitarios, `tsc`, `eslint`, `next build` y **29 E2E en dos
ejecuciones seguidas**, con `e2e/navegacion.spec.ts` probando el salto sección→sección
que antes no se podía hacer. Tres rojos intermedios en `page.goto` de páginas públicas
intactas resultaron ser **hambre de CPU con Docker Desktop recién arrancado** (§9.3), no
una regresión. Sincronizados `wireframes.md` (§8.5 resuelta, §9.2), `design-system.md`
§6.1/§6.2 y `readme.md` §1.3 + árbol de ficheros.

### [2026-08-20] — W4: catálogo e inventario del back-office
**Prompt:** "Vamos a por W4".
**Resumen de la respuesta:** Las dos pantallas de `wireframes.md` §6 —
`/backoffice/catalogo` y `/backoffice/catalogo/:setId`— construidas como **Server
Components que leen el repositorio**: no se escribió `GET /api/sets` porque la pantalla
no lo necesita y la API pública se amplía cuando la pida alguien de fuera (§2.1).
**HU-10 pasa a verde**: dar de alta un set, tasarlo, publicarlo y ponerle copias ya se
hace desde el navegador — **13 de 18** historias con recorrido completo por interfaz.
Se construyó **fuera del orden previsto**, a petición: de las tres pantallas que
quedaban era la única sin bloqueantes.
**La lista existe por los sets que no están publicados.** Un set recién creado nace sin
publicar y el catálogo público responde 404 a propósito, así que sin esta lista no hay
forma de volver a él; por eso el filtro por defecto es "Todos" y no "Publicados". La
columna de copias enseña el caso que de verdad se cuela —publicado y con cero copias,
que sale en el catálogo y no se puede alquilar nunca— sin abrir nada.
**El hallazgo que solo aparece construyendo:** el botón `[ Dar de baja ]` de la cola de
trabajo iba por el endpoint **genérico** de transiciones con un motivo enlatado,
saltándose que `/retire` **exige** el motivo porque "la baja tiene impacto económico y
su motivo es parte del rastro de auditoría". W4 reutilizaba ese componente y heredaba el
atajo; se preguntó y se arregló **en el componente compartido**, así que la auditoría
deja de tener bajas sin causa también en la cola de trabajo.
**Tres decisiones de componente, en contra del dibujo:** el tenedor de la copia tiene
columna propia —lo que deja sitio a la única acción que el dominio permite sobre una
copia alquilada, la baja por pérdida, que no tenía interfaz en ninguna parte—; **no**
se trajo `alert-dialog`, porque la baja pide un **dato** y `alertdialog` es para
decidir, no para rellenar; y el tema es un `<select>` **nativo**, que en móvil es mejor
y no necesita JavaScript. Sí se trajeron `dialog`, `input` y `label`.
**Un defecto viejo destapado:** el layout raíz ya añade `· Clickoteca` con
`title.template` y **siete páginas lo repetían**, así que la pestaña decía "Cola de
trabajo · Clickoteca · Clickoteca". Corregido en todas.
**Dos lecciones de pruebas:** `getByRole("alert")` casa también con el **anunciador de
rutas de Next**, así que cualquier error en pantalla vuelve la consulta ambigua; y la
semilla es idempotente **por existencia**, no restaura estados — tras varias ejecuciones
del E2E ya no quedaba ninguna copia `INCOMPLETA` con la que probar la baja, así que esa
prueba vive donde no depende del estado de la base: en un test de componente.
**Verificación:** 366 unitarios, `tsc`, `eslint`, `next build` y **33 E2E en dos
ejecuciones seguidas**, con `axe` auditando catorce pantallas más el diálogo de alta.
Sincronizados `wireframes.md` (§6.6 nueva, §9.1, §9.2 y §9.4), `design-system.md`
§6.1/§6.2 y `readme.md` §1.3 + árbol.

### [2026-08-20] — W5: el portal ampliado
**Prompt:** "commit y seguimos".
**Resumen de la respuesta:** Las cinco rutas de `wireframes.md` §7 —resumen, mis sets,
historial, suscripción y avisos— con la barra del portal ya encendida y su **contador
de avisos sin leer**. **HU-09 pasa a verde**: pausar, cancelar y reactivar tenían API
desde el principio y ningún sitio donde pulsarlas. **14 de 18** historias con recorrido
completo por interfaz.
**Los dos veredictos se calculan al pintar, no se esperan como error.**
`canSwitchToPlan` dice **cuántos** sets habría que devolver para bajar de plan y
`canEndSubscription` si se puede pausar; el suscriptor lo sabe antes de pulsar y el 409
queda para la carrera. Y miden cosas distintas a propósito: el cambio de plan cuenta lo
que **ocupa plaza**; pausar y cancelar, solo lo que está **en su poder**. Con una copia
en inspección se puede pausar pero no bajar de plan.
**Dos decisiones de estructura:** las **colas viven en "Mis sets"** —§2.3 fija cinco
destinos y no hay sexta ruta, y una cola es lo mismo que un set en casa visto un paso
antes—; y **cancelar abre un `alertdialog`**, no un `dialog`: interrumpe pidiendo una
decisión y no lleva más campos que sus dos botones. Se escribió a mano sobre Radix
porque el generador de shadcn insistía en sobrescribir `button.tsx`.
**El hallazgo, y sigue abierto: cancelar es un callejón sin salida.** Una suscripción
cancelada ya no rige, así que no hay nada que reactivar, y el alta exige un email nuevo:
un cliente que cancela no puede volver por la web. El diálogo lo dice sin adornos y
empuja a pausar, pero el hueco es de producto y falta un "recontratar".
**Dos textos que solo se corrigen construyendo:** cancelar **no** saca de las colas —las
entradas siguen y el recorrido las salta por no elegible (D5)—, así que decirlo habría
sido mentira; y el precio se pintaba como "24.99 €/mes" porque el decimal viaja como
cadena.
**Una trampa de la auditoría automática:** `axe` medía el contraste **mientras el
diálogo entraba**, con la opacidad a medias, y fallaba en textos que quietos pasan de
sobra. Ahora espera a que no quede ninguna animación corriendo.
**Verificación:** 367 unitarios, `tsc`, `eslint`, `next build` y **36 E2E en dos
ejecuciones seguidas** dejando la base limpia. Las pruebas del portal crean **su propia
cuenta**: pausar o cancelar cambia el estado del suscriptor entero y chocaría con el
circuito completo, que corre en paralelo. Sincronizados `wireframes.md` (§7.7 nueva,
§8.4, §9.1, §9.2 y §9.4), `design-system.md` §6.1/§6.2 y `readme.md` §1.3.

### [2026-08-20] — Los dos bloqueantes de W2/W3, y la vuelta de quien canceló
**Prompt:** "resolvamos los bloqueos" + "Añadir que si alguien se quiere dar de alta con
un correo previamente cancelado, se debe poder dar de alta de nuevo (o si provee la
password correcta, reactivar la suscripción)".
**Resumen de la respuesta:** Los dos bloqueos eran de naturaleza distinta y se
resolvieron distinto.
**§8.1 era código.** La cola de trabajo no incluía las copias `ALQUILADA`, así que el
operador no podía enterarse de que hay un set adjudicado esperando a prepararse y la
pantalla de W2 habría sido **inalcanzable**. Ahora es el grupo **primero**, y con el
matiz que de verdad importa: registrar la condición **no mueve la copia**, así que se
excluyen las que ya tienen envío de salida — sin eso, lo preparado se quedaría en la cola
para siempre. Y se titula **"Por preparar"**, no "Con el cliente": en la cola esa copia no
está con nadie, está esperando. Es el mismo estado con dos lecturas, como `EN_INSPECCION`
ya tenía dos según quién mire.
**§8.2 era una decisión de operación**, y se preguntó. Ratificadas **dos**
comprobaciones —recuento de piezas y manual—; fuera la caja, porque el embalaje es valor
en un set de exposición y casi nada en uno de construcción, y una casilla única mentiría
en la mitad de los casos. Viven en un módulo de dominio del que se deriva la validación
de los **dos** informes: o están todas o ninguna, nada fuera del catálogo y booleanos.
Dos casillas que siempre se rellenan valen más que cuatro que se marcan en bloque.
**Y el callejón sin salida que destapó W5, cerrado:** darse de alta con un email que ya
existe **reabre la suscripción** si viene con la contraseña de esa cuenta. Sin ella la
respuesta es exactamente la de antes —no se revela nada nuevo—, pero sí añade un sitio
donde probar contraseñas, igual que el login: cuando haya limitación de intentos tiene
que cubrir los dos. La comprobación de "no tiene otra vigente" va **dentro de la
transacción**, o dos altas simultáneas dejarían dos suscripciones; y los datos de envío y
pago se actualizan con los nuevos sin borrar los viejos, que pueden estar referenciados
por pagos y por el snapshot de un alquiler.
**Verificación:** 382 unitarios, `tsc`, `eslint`, `next build` y **38 E2E en dos
ejecuciones seguidas**, con `e2e/preparacion.spec.ts` nuevo — monta el caso por API,
comprueba que la copia adjudicada aparece y que **desaparece al registrar la condición**
aunque siga en `ALQUILADA`, y cierra su circuito. Requisito nuevo en la spec
`accounts-roles`; sincronizados `wireframes.md` (§4.1, §4.3, §7.7, §8.1, §8.2, §9.2) y
`readme.md` §1.3.

### [2026-08-20] — W2 y W3: registro de condición y discrepancia
**Prompt:** "seguimos".
**Resumen de la respuesta:** Las dos últimas pantallas, **juntas** porque el par solo
tiene sentido completo: el aviso del suscriptor se compara contra lo que el operador
registró, y sin ese registro previo no hay nada contra lo que comparar. **HU-11 y HU-07
pasan a verde**, y con ellas **las seis ⭐** del producto: 16 de 18 historias con
recorrido por interfaz y **las cinco pantallas de los wireframes construidas**.
**El hueco que solo aparece construyendo: las observaciones no tenían dónde ir.** El
wireframe dibuja "Observaciones (opcional)" y `ConditionReport` no tenía ningún campo de
texto. El catálogo de casillas es cerrado a propósito, así que sin esa válvula un
informe `Dañada` no puede decir **qué** está roto; y la asimetría era indefendible,
porque el suscriptor sí podía escribir su versión. Se añadió la columna `notes`.
**Un invariante que faltaba:** un alquiler tiene **un solo** registro de entrega. El
segundo crearía otro envío de salida y movería el reloj de la discrepancia, que ya está
corriendo. La cola de trabajo ya excluía lo preparado, pero **la pantalla no es la única
puerta al endpoint**, así que la regla vive en el caso de uso.
**Y el informe sale con sus casillas**, que no salían: el diálogo de W3 tiene que
enseñar contra qué se compara lo recibido, porque "algo no coincide" sin eso no
significa nada. En el orden del catálogo, no en el del JSON guardado.
**Tres trampas del E2E, ya con reincidencia:** anclar por la fila del set no vale cuando
dos pruebas en paralelo tienen dos copias del mismo set —se ancla por el enlace de la
copia—; la limpieza del circuito va en un `finally` y es "haz lo que puedas", porque una
prueba que falla a mitad dejaba la copia alquilada; y el montaje común vive ahora en
`e2e/alquileres.ts` en vez de copiado en cada spec.
**Verificación:** 385 unitarios, `tsc`, `eslint`, `next build` y **41 E2E en dos
ejecuciones seguidas** dejando la base limpia, con el recorrido registro→discrepancia
entero por interfaz. `axe` audita 19 pantallas y 3 diálogos. Sincronizados
`wireframes.md` (§5.6 nueva, §9.1, §9.2 y §9.4), `design-system.md` §6.1/§6.2 y
`readme.md` §1.3.

### [2026-08-21] — HU-06 y HU-16: el puesto en la cola y la pantalla de configuración
**Prompt:** "seguimos".
**Resumen de la respuesta:** Las **dos historias que quedaban a medias**, cerradas.
Con ellas, **18 de 18 con recorrido por interfaz** y ninguna que dependa ya de llamar
a la API a mano.
**HU-06 — el puesto llega al portal** (`wireframes.md` §8.4, el último hallazgo que
seguía abierto). "Mis colas" abre ahora cada línea con **"2.º de 5"**, que era
literalmente lo que pide la historia y lo único que solo se veía entrando en la ficha
de cada set. Lo que importa de cómo se hizo: el puesto lo calcula **el dominio**
—`placeInQueues` agrupa por Set y ordena con el mismo `orderQueue` que sirve las
ofertas—, no una cuenta aparte en SQL. Contar en la consulta habría dejado el criterio
de orden de D11 escrito en dos sitios, y el día que se toquen los empates la pantalla
diría un puesto que el motor no respeta. El doble en memoria de los tests usa **la
misma función**, por lo mismo. Es además una proyección aparte y no dos campos más en
la entrada de cola: el puesto obliga a leer la cola entera del Set, y quien crea una
entrada no debe pagar esa consulta.
**HU-16 — la sexta pantalla, la que no estaba dibujada.** Los planes se editan desde
`/backoffice/configuracion`, un formulario por plan y **un solo botón**: los tres
campos viajan en la misma llamada, así que subir el precio y bajar el bono es un cambio
y no dos en la auditoría. Los recordatorios de retención, en cambio, se activan **set a
set desde su ficha del catálogo** —el endpoint es por set, y llevarlo al panel
obligaría a inventar allí un selector de sets—; en el panel queda un puntero y la
cadencia por defecto. La pantalla dice lo que más sorprende de D7: activarlos en un set
**que nadie espera no envía nada**.
**El mando que no estaba conectado.** Construir la pantalla destapó que
`premiumQueueBonusDays` —parámetro del sistema, con su etiqueta y su campo— **no lo
leía nadie**: la ventaja en cola sale de `Plan.queueBonus`, que es lo que se congela al
encolar. Un admin podía ajustarlo, guardarlo y no cambiar nada. Retirado del catálogo y
de la semilla; una fila suya en la base es inofensiva porque solo se recorren las claves
del catálogo.
**Y el hallazgo §8.3, cerrado por la vía barata:** la ventana de confirmación de ofertas
es **también** el plazo para reclamar una entrega, y ahora el campo lo dice debajo.
Separarlo en dos ajustes es un cambio de modelo y de spec que nadie ha pedido; lo que
no podía seguir es que se acortase a ciegas.
**Y una carrera vieja del E2E, destapada al ejecutarlo:** tras pulsar "Higienizada", el
circuito completo cerraba sesión sin esperar nada y la navegación abortaba el `fetch` en
vuelo — la copia se quedaba a medio circuito y el fallo aparecía tres pasos más allá, en
la oferta que nunca llegó. Los pasos anteriores no lo sufrían porque se anclan en el
encabezado del grupo siguiente; este no tiene grupo detrás, porque la copia **sale** de la
cola de trabajo. Se ancla ahora en la respuesta de la transición.
**Verificación:** 397 unitarios (con `tests/configuracion-forms.test.tsx`, que prueba
los dos formularios por sus caminos de error), `tsc`, `eslint`, `next build`,
`openspec validate --strict` y **44 E2E en dos ejecuciones seguidas** dejando la base
limpia; requisito nuevo en la spec `reservation-queue`
("Consulta de la posición en cola", con el escenario de que **el puesto no revela quién
más espera**). Sincronizados `wireframes.md` (§8.3, §8.4, §8.7, §9.4 y §10 nueva),
`ux-flows.md` §7 —cuya tabla de cobertura había envejecido con el reparto de rutas de
W5—, `PRD.md` y `readme.md` §1.3.

### [2026-08-21] — El disparador HTTP de los trabajos periódicos
**Prompt:** "Estoy probando de hacer un deployment en Vercel. Da el siguiente error:
[module not found en `src/db/prisma.ts`] … Sí, commitea y monta el endpoint de cron".
**Resumen de la respuesta:** El error era de generación, no de código: el cliente Prisma
se genera en `src/generated/prisma`, que está en `.gitignore` porque se regenera, y el
build era solo `next build`. En cualquier máquina limpia —Vercel, un CI, un clon recién
hecho— ese módulo no existe, y por eso el fallo salpicaba a la vez al route handler, al
`proxy` y a un Server Component: los tres acaban importándolo. El build genera ahora el
cliente antes de compilar, que vale para cualquier destino y de paso compila siempre
contra el esquema vigente. **Con una trampa que conviene saber:** `prisma generate` carga
`prisma.config.ts`, que resuelve `DATABASE_URL` al arrancar, así que sin esa variable el
build muere en el paso nuevo.
**Y el hueco de verdad que abre Vercel:** el scheduler es un proceso de vida larga
(`node-cron`) y ahí eso no existe — sin él las ofertas no caducan nunca y no sale ningún
recordatorio. Se ha montado `GET /api/cron/:job`, y lo que importa es **cómo**: el *qué*
se ejecuta vive en un módulo único (`use-cases/scheduler/jobs.ts`) que comparten el
proceso de la VM y el endpoint. Los dos disparadores solo aportan el reloj. Sin ese
módulo común, la primera divergencia entre los dos caminos sería cuestión de semanas y
solo se notaría en producción.
**El candado, que es lo único que decide algo:** `Authorization: Bearer $CRON_SECRET` —el
contrato que ya emite Vercel Cron y que un `systemd timer` replica con una línea—,
comparado en tiempo constante y **cerrado por defecto**: sin la variable el endpoint
responde **404** y no ejecuta nada. Un despliegue al que se le olvidó configurarla no
puede acabar con la URL abierta, que es justo lo que pasaría si "sin secreto" significara
"sin comprobación". Es 404 y no 503 a propósito: sin secreto aquí no hay endpoint, y así
tampoco confirma a un desconocido qué trabajos existen.
**Lo que el endpoint no da, dicho en voz alta:** el scheduler evita solaparse con un flag
en memoria, y eso no sirve cuando cada invocación es un proceso distinto. Lo sostiene el
dominio —el cierre de oferta es un CAS— con un margen conocido: dos barridos a la vez
podrían repetir **un recordatorio**. Se acepta antes que montar un cerrojo distribuido
para un aviso amable.
**Tres cosas de Vercel que no son obvias** y quedan escritas: su cron va en **UTC** (las
10:00 de Madrid son las 08:00 en verano y las 09:00 en invierno, así que el recordatorio
se desplaza con el cambio de hora); el plan **Hobby** admite dos crons y solo diarios, con
lo que `*/5` obliga a plan de pago; y sigue haciendo falta un Postgres gestionado, porque
allí no hay `localhost` que valga.
**Verificación:** 403 unitarios (6 nuevos sobre el candado y el catálogo de trabajos),
`tsc`, `eslint`, `next build`, y prueba a mano contra el paquete autónomo: 401 sin
credencial y con la equivocada, 404 sin `CRON_SECRET` y con un trabajo inventado, y 200
con resumen contable en los dos trabajos buenos. Sincronizados `ADR-0001` §4,
`readme.md` §2.4 y `.env.example`.

### [2026-08-21] — Un Postgres gestionado son dos URLs
**Prompt:** "Limpia y cierra. Como base de datos he creado en Vercel una llamada
'supabase-clickoteca'. ¿Hay que modificar muchas cosas del proyecto?"
**Resumen de la respuesta:** Poco código y una idea nueva: **con un pooler de
transacciones delante —Supabase, Neon— hacen falta dos URLs, no una**. La aplicación se
conecta al pooler; las migraciones no pueden, porque necesitan una sesión estable para
tomar el *advisory lock* y ejecutar DDL. `prisma.config.ts` prefiere `DIRECT_URL` cuando
existe y cae a `DATABASE_URL` cuando no —leyendo `process.env` y **no** `env()`, que lanza
si la variable falta y aquí faltar es lo normal: en la máquina de desarrollo y en el E2E
solo hay una base—.
**`DATABASE_POOL_MAX` se queda deliberadamente sin número por defecto:** el valor correcto
depende de dónde corre el proceso. En una VM hay un proceso y le conviene un pool holgado;
en serverless hay tantos pools como instancias vivas, y diez conexiones por instancia
agotan el límite del proveedor. Cualquier número fijado a ciegas empeora uno de los dos
casos, así que se pide explícitamente en el entorno que lo necesita.
**Y `db:deploy`,** porque `db:migrate` es `prisma migrate dev` —interactivo, capaz de
recrear la base— y contra una base remota no se usa.
Nada de esto cambia el despliegue en la VM: sin `DIRECT_URL` ni `DATABASE_POOL_MAX`, el
comportamiento es exactamente el de antes.

### [2026-08-21] — Los crons, a lo que el plan Hobby admite
**Prompts:** "Vercel me ha creado un nuevo repositorio forkeado de un commit anterior,
desde el que hace los upgrades. ¿Cuál sería la mejor estrategia de gestión para tener
ambos controlados?" / "Tengo una cuenta Hobby. Vercel me lista las variables de entorno
que ha creado junto con la base de datos: `STORAGE_POSTGRES_PRISMA_URL`,
`STORAGE_POSTGRES_URL_NON_POOLING`, …"
**Resumen de la respuesta:** **Vercel no degrada una expresión de cron demasiado
frecuente: hace fallar el despliegue entero.** En Hobby son dos crons y solo diarios, así
que el `*/5` heredado del scheduler de la VM impedía desplegar. Se recortan a diarios y
**el precio queda escrito para no redescubrirlo**: la caducidad de ofertas se vuelve
imprecisa —una ventana de 48 h puede cerrarse casi un día tarde— y el recordatorio de
mitad de ventana puede llegar tarde o no llegar. El dominio lo aguanta porque **todo se
decide por marcas de tiempo y no por contadores**, que es también lo que hace que una
ejecución perdida se cure sola en la siguiente — y Vercel avisa de que la entrega es
*best effort*.
**Dos decisiones sobre la integración de Supabase:** `DATABASE_URL` se rellena a mano con
el valor de `STORAGE_POSTGRES_PRISMA_URL`, y `DIRECT_URL` vive solo en el `.env` local,
porque quien migra es la máquina de desarrollo. **El código no lee las `STORAGE_*`**:
acoplaría el proyecto a los nombres de una integración concreta, y el mismo código tiene
que arrancar en la VM y en local.
**Sobre el repositorio duplicado:** el `clickoteca` que creó Vercel es un commit "Initial
commit" **sin ancestro común**, con el árbol de `d169b2d`. Mantener los dos en paralelo
significa fusionar a mano historias que no comparten raíz, así que se archiva y el
despliegue se apunta al repositorio de trabajo.

### [2026-08-21] — El build que compila entero y muere al final: `standalone` fuera de Vercel
**Prompts:** "Sigue con un *build failed*: [log de Vercel, commit `3cdce76`]" / "Running
onBuildComplete from Vercel / Error: ENOENT: no such file or directory, open
'/vercel/path0/.next/next-server.js.nft.json'"
**Resumen de la respuesta:** El modo `standalone` se lleva el trazado a
`.next/standalone/` y **deja de emitir `.next/next-server.js.nft.json`**, que es justo el
fichero que abre el paso `onBuildComplete` de Vercel para armar sus funciones. De ahí el
síntoma desconcertante: el build compila entero, genera las 28 páginas y **muere al
final** con un ENOENT sobre un json que no menciona `standalone` por ningún lado. Despista
todavía más que el log traiga `Applying modifyConfig from Vercel`, como si Vercel ya
hubiera ajustado la configuración.
**Lo decide `process.env.VERCEL`,** que define su propio entorno de build: en la VM, en
local y en el E2E sigue saliendo el paquete autónomo —el artefacto que despliega `systemd`
y el que prueba Playwright—; en Vercel, no.
**Comprobado en las dos direcciones** (sin `VERCEL` sale `.next/standalone`; con
`VERCEL=1` sale `next-server.js.nft.json`) y **fijado en `tests/next-config.test.ts`**,
porque el síntoma no lleva a la causa por ningún camino razonable: sin una prueba que lo
sostenga, alguien lo revierte por "limpieza".
**Verificación:** 406 unitarios, `tsc`, `eslint`, `next build` y 46 E2E.

### [2026-08-21] — La contraseña que no puede publicarse, y el TLS del pooler
**Prompts:** "`admin@clickoteca.test` ¿tiene la misma password que en desarrollo?" / "¿Y
el resto de cuentas tienen ese mismo seed password?" / "Déjalo claro en la documentación y
ya"
**Resumen de la respuesta:** Sí, y ese *sí* era el problema. **La semilla usa un único
hash para las cinco cuentas**, así que `clickoteca` —escrita en el readme de un
repositorio público— no es la clave de un suscriptor de demostración: es **una llave
maestra del entorno** que entra también como operador y como administrador, y ADMIN toca
la configuración del sistema, las bajas de copia y las cuentas del personal. Sembrar con
ella un despliegue accesible desde fuera es publicar una cuenta de administrador abierta.
**Tres cambios y una decisión.** `SEED_PASSWORD` sustituye la constante, con el valor
público por defecto para que el entorno local y el E2E sigan igual, y **el resumen de la
semilla solo imprime la contraseña cuando es la pública** —una puesta a mano acabaría en
el historial de la terminal y en cualquier log—. El readme dice ahora que `clickoteca` es
**la del entorno local** y que las credenciales de la instancia desplegada **no se
publican aquí**, sino que se entregan por el canal del curso. Se valoró hashear por cuenta
para poder entregar solo la del suscriptor y **se descartó**: media aplicación es el
back-office, y quien corrige tiene que verlo.
**Ojo con una consecuencia de que la semilla sea idempotente:** el `upsert` actualiza
nombre y rol, **no el hash**, así que la contraseña se decide en la primera siembra.
**El `.gitignore`, del listado al patrón:** `.env` y `.env*.local` dejaban fuera justo los
ficheros que se crean sin pensar y traen credenciales de verdad —`.env.vercel` de
`vercel env pull`, `.env.production`, `.env.supabase`—. Se ignora `.env*` entero y se
rescata la plantilla.
**Y el TLS del pooler, que es una trampa de manual:** `pg` v8.16+ interpreta
`sslmode=require` como `verify-full`, y el certificado del pooler de Supabase encadena a
una raíz que Node no lleva en su almacén; sin `uselibpqcompat=true` la conexión muere con
"self-signed certificate in certificate chain". **Lo traicionero es dónde aparece:** no al
migrar —el motor de Prisma usa la semántica de libpq y pasa— sino en la aplicación, que va
por el mismo `pg` del *driver adapter*. Es decir, **despliegue en verde y fallo en el
primer query**. El parámetro devuelve a `require` su significado de libpq (cifra, no
verifica) y es además la forma que sobrevive al cambio anunciado para `pg` v9; la
alternativa estricta —CA de Supabase con `verify-full` y `sslrootcert`— queda anotada.
Se anota también que **`vercel env pull` baja las variables de una integración como
`[SENSITIVE]`**: comparar dos de ellas no prueba nada, y para saber si una credencial vale
hay que intentar conectar.

### [2026-08-22] — El pooler de sesión no aguanta serverless
**Prompts:** "No puedo cambiar el pooler. Según documentación, el pooler *transaction* usa
el puerto 6543." / "Verifica que los `Promise.all` no tienen ningún mal efecto" / "Ponlo a
1 y commitea"
**Resumen de la respuesta:** `/backoffice/catalogo` daba la página de error de Next en el
despliegue (digest 2243060452). Detrás estaba `(EMAXCONNSESSION) max clients reached in
session mode - max clients are limited to pool_size: 15`: **`DATABASE_URL` apuntaba al
pooler de sesión**, donde cada cliente retiene una conexión de servidor y **el techo de
clientes *es* el `pool_size`**. Con `DATABASE_POOL_MAX=3`, cinco instancias de función lo
llenaban — y esa pantalla era la primera en caer porque pedía tres conexiones de golpe.
**La variable pasa al pooler de transacción (`:6543`) y el pool por instancia a 1.** Lo
segundo importa más de lo que parece: el techo **no lo marca la concurrencia de peticiones
sino ese número por el de instancias vivas**, y una instancia congelada no ejecuta
temporizadores, así que el `idleTimeoutMillis` de `pg` nunca cierra la conexión y el hueco
queda tomado hasta que Vercel la recicla.
**Verificado a las bravas:** una sonda de 30 conexiones aceptaba **1** tras una prueba de
carga y **30** justo después de redesplegar — que es, de paso, la palanca de emergencia si
vuelve a pasar.
**El cambio de código ya no hacía falta para la conexión, y se queda por la otra razón:**
los tres *reads* de `listManaged` van en un `$transaction`, así que la lista y los
recuentos de la cabecera **ven la misma foto** —antes, un alta a medio camino los
descuadraba— y de paso caben en una conexión. La página encadena sus dos llamadas por lo
mismo.
**Los `Promise.all` del resto de la app se revisaron y quedan como están:** ninguna
transacción usa el cliente global —no hay interbloqueo de pool posible— y ninguno recorre
una lista. Con el pool a 1 se serializan solos, y el coste no se nota: páginas calientes
en ~280 ms, dominadas por la red.

### [2026-08-22] — El despliegue es Vercel, y la documentación aún decía VM
**Prompt:** "Verifica que la documentación, incluyendo readme, refleja los cambios de VM a
Vercel. La URL pública de la aplicación ahora será clickoteca.vercel.app. Y que OpenSpec
está debidamente actualizado."
**Resumen de la respuesta:** La aplicación llevaba días en
**https://clickoteca.vercel.app** y el corpus entero seguía describiendo la VM de Oracle
con Caddy, `systemd` y Postgres en `localhost`. Los detalles operativos sí estaban al día
—crons, pooler, `uselibpqcompat`—, pero **la decisión de hosting no, que es justo lo que
lee quien corrige**.
**La decisión se registra en `ADR-0003` en vez de reescribir `ADR-0001` §5.** Esa sección
se queda con un banner de *sustituida* y **sus negativas tachadas pero visibles** —ops
propio, punto único de fallo, riesgo de reclamación—, porque son precisamente las que
motivaron el salto: borrarlas dejaría el ADR sin explicar por qué se cambió de idea. El
ADR nuevo lleva las dos URLs (pooler de transacción para el runtime, de sesión para las
migraciones), `DATABASE_POOL_MAX=1` con su aritmética, los crons diarios del plan Hobby y
por qué `standalone` se apaga en Vercel.
**El readme** abre §0.4 con la URL desplegada —y con que las credenciales de esa instancia
no se publican aquí—, cambia los dos diagramas por la topología real y añade el *runbook*
de un despliegue nuevo, incluido el redespliegue como palanca si vuelve el `EMAXCONN`. C4,
`ADR-0002`, PRD y `AGENTS.md`, en consecuencia.
**De paso caen dos afirmaciones que ya no eran ciertas:** la tipografía sin webfont no se
justifica "porque el destino es una VM libre de Oracle" sino por la petición bloqueante en
la primera pintura, y los comentarios que hablaban de Caddy o del scheduler "de la VM"
pasan a nombrar lo que hay.
**OpenSpec no se toca, a propósito:** los seis specs son de comportamiento —colas,
ofertas, notificaciones— y ninguno menciona hosting ni despliegue, así que el cambio no
altera ningún requisito. Sigue en verde con `--strict`.

### [2026-09-06] — El videotutorial se retira: la aplicación real es lo que se evalúa
**Prompt:** "No es necesario el videotutorial, puesto que se podrá evaluar la aplicación
real."
**Resumen de la respuesta:** Era **el único entregable que quedaba abierto**, y la razón
para retirarlo es buena: desde el despliegue del 21–22 de agosto hay una instancia en pie
en **https://clickoteca.vercel.app**, así que quien corrige no necesita ver una grabación
del recorrido — puede hacerlo. Y hay una diferencia real entre las dos cosas: **un vídeo
enseña el camino que el autor eligió enseñar**, mientras que en la aplicación desplegada
las 18 historias se recorren por el pie de quien evalúa, incluidos los caminos de error,
que son precisamente el criterio de éxito declarado del MVP (PRD §10).
**Lo que hace falta para que eso funcione, y ya estaba:** el readme abre §0.4 con la URL y
con el `GET /api/health` para comprobar de un vistazo que está en pie, y dice que las
credenciales de la instancia desplegada **no se publican en el repositorio** —es público, y
la semilla usa un único hash para las cinco cuentas— sino que se entregan por el canal del
curso.
Se anotó en los tres sitios que lo daban por pendiente —`readme.md` §1.3, `documents/PRD.md`
§9 y `AGENTS.md`— como decisión con fecha, no borrando la línea: el proyecto **no tiene ya
ningún entregable abierto**.

### [2026-09-06] — La semilla, con nueve meses de operación a la espalda
**Prompt:** "Quiero revisar la aplicación, y quiero un seed de la base de datos que
incluya, aparte del administrador, dos operadores al azar y 10 usuarios registrados con
distintos niveles de suscripción y un historial completo de alquileres y devoluciones de
mínimo 2 meses de antigüedad."
**Resumen de la respuesta:** La semilla llegaba hasta las cuentas y el catálogo, y ahí se
paraba: **la base nacía sin pasado**. Para *probar* el circuito bastaba; para *revisarlo*
no, que es un uso distinto — el portal decía "aún no has alquilado nada", la cola de
trabajo del operador estaba vacía y el historial de cualquier copia era una sola línea.
Ahora hay **13 cuentas** (1 admin, 2 operadores y 10 suscriptores que cubren los dos
planes, los tres estados de suscripción y antigüedades de 1 a 10 meses) y **29 alquileres
repartidos por nueve meses**, con sus devoluciones, inspecciones, envíos, incidencias,
colas y avisos.
**La decisión que sostiene todo lo demás: nada se escribe a mano.** Cada cambio de estado
pasa por `applyTransition` —el mismo camino que usa la aplicación, con su *compare-and-swap*
y su registro de auditoría— y cada aviso por `notificationsFor`, la función pura del
emisor real. La alternativa, escribir los estados finales directamente, habría sido más
corta y habría producido **historiales imposibles**: copias que aparecen en
`EN_HIGIENIZACION` sin haber pasado por inspección, alquileres cerrados sin devolución. Y
sobre todo, habría creado una segunda versión de "cómo se mueve una copia" que divergiría
de la primera en cuanto alguien tocara la máquina de estados. Las 186 transiciones
sembradas usan **12 pares distintos, y los 12 están en la tabla de PRD §15.5**.
**El historial trae sus propias copias, y esa es la segunda regla.** Las 59 de la semilla
base no se tocan: las 7 que hacen falta las da de alta el módulo con fecha pasada, sobre
sets que ya tenían dos o más. La razón es el E2E, que busca literalmente "un set con
**una sola** copia libre" y "un set con **dos o más**": un historial que consumiera
inventario existente le movería el suelo, y el fallo aparecería a semanas vista y en otra
pantalla. Con la regla puesta, tras sembrar siguen quedando 11 sets del primer tipo y 12
del segundo.
**Lo que se decidió no sembrar, y por qué.** No hay cargos: `Payment` es un modelo que
**ni se escribe ni se lee en ninguna parte** de la aplicación, así que sembrarlo sería
inventar filas cuyo único sitio en el mundo es la base de datos. El encargo era el
historial de alquileres y devoluciones, y ahí es donde se ha quedado.
**Cuadrar en el tiempo cuesta más de lo que parece.** Ningún alquiler empieza antes de la
suscripción que lo paga ni después de cancelarla; ninguna copia está en dos manos a la
vez —una copia sirve a varios ciclos, pero solo si el anterior terminó—; y un set
restringido solo lo alquila quien tenía la antigüedad exigida **entonces**, no ahora. Las
cuatro comprobaciones salen a cero contra la base sembrada.
**El circuito queda parado en sus cuatro puntos a la vez** —una copia adjudicada sin
preparar, otra en casa del suscriptor, otra en devolución y otra en inspección—, más una
devolución incompleta que se repuso, una copia de baja por daño y un set agotado
(`Hogwarts Castle`) con su cola de dos. Ese último detalle no es adorno: **una cola solo
es coherente si el set no tiene copias libres**, porque con una libre el sistema ya la
habría ofrecido. Y se eligió un set **restringido** para agotarlo justamente porque son
los únicos que el E2E descarta por definición.
**Y una fragilidad que el historial destapó, que era el verdadero hallazgo.** El recorrido
completo pulsaba `"Recepcionar"`, `"Inspección OK"` y `"Higienizada"` con `.first()`, lo
que solo funciona si la cola de trabajo contiene únicamente lo que esa prueba montó. Con
otras copias en curso, el primer botón es el de otra copia: la prueba avanzaba la
equivocada y el fallo salía **tres pasos más allá**, en una oferta a Bruno que nunca
llegaba. La cola de trabajo ya ponía el nombre del set en el nombre accesible de cada
botón —"Recepcionar: <set>"— precisamente para esto, y la prueba no lo estaba usando. Con
el ancla puesta, el fallo desaparece; y de paso desaparece una carrera que dos pruebas en
paralelo podían provocar sin necesidad de ninguna semilla.
**Verificación:** 406 unitarios, `tsc`, `eslint` y **46 E2E en verde contra la base
sembrada**, con la semilla ejecutada dos veces seguidas para comprobar que es idempotente
(mismos recuentos exactos). Sincronizados `readme.md` §1.4 —con la tabla de las trece
cuentas y qué situación ejercita cada una—, `AGENTS.md` y `ADR-0003`.

### [2026-09-06] — La contraseña perdida, y por qué la única salida era resetear
**Prompts:** "¿Qué debería hacer para sembrar la instancia de Vercel?" → "La contraseña
que tenía apuntada del despliegue en Vercel no me funciona. ¿Cómo la puedo recuperar?" →
"Quiero resetear la instancia entera del despliegue" → "Quiero una contraseña para el
admin, otra para los operadores y otra para los usuarios de prueba."
**Resumen de la respuesta:** **No se podía recuperar, y conviene entender por qué antes de
seguir probando.** En la base solo hay hashes argon2id, que no se invierten; y el `upsert`
de la semilla actualiza nombre y rol **pero no el hash**, así que cambiar `SEED_PASSWORD`
y volver a sembrar no habría hecho absolutamente nada sobre cuentas que ya existían. Al
buscar el valor apareció además la causa de fondo: **`SEED_PASSWORD` ya no existía en
ningún entorno de Vercel** —ni producción ni *development*—, así que no había ningún sitio
de registro; la única copia del mundo era un `.env.vercel` de hacía dos semanas.
**Lo que hizo la decisión fácil fue mirar antes de tocar.** Una sonda de solo lectura
contra la base desplegada dijo: **5 usuarios, 0 alquileres, 59 copias** — ni un dato que
no hubiera puesto la propia semilla. Nadie había usado la instancia, así que el reset no
se llevaba nada por delante y podía además meter el historial de nueve meses de una sola
pasada. Sin esa comprobación, la misma decisión habría sido a ciegas.
**Prisma paró la maniobra, y con razón.** `migrate reset` detecta que lo invoca un agente
y se niega hasta que el usuario consiente explícitamente, exigiendo que se le expliquen
antes el comando exacto, que la acción es irreversible y si el destino es producción o no.
Lo era —es la base detrás de `clickoteca.vercel.app`—, y decirlo con esas palabras, junto
con el recuento de lo que había dentro, es lo que permitió al usuario decidir con criterio
en vez de firmar un cheque en blanco. Es un candado que **debería existir en más sitios**.
**Y el encargo cambió la decisión de seguridad del proyecto.** Hasta hoy la semilla usaba
**un único hash para las trece cuentas**, y en `ADR-0003` está escrito que se valoró
separarlas y se descartó. El problema de aquella decisión era real: entregar la contraseña
de un suscriptor de demostración era entregar también la del **administrador**, que
configura el sistema y da de baja copias, y no había forma de dar lo uno sin lo otro. Ahora
hay **tres contraseñas, una por rol** (`SEED_PASSWORD_ADMIN`, `_OPERATOR`, `_SUBSCRIBER`,
con `SEED_PASSWORD` a secas como valor común para no romper nada). Quien corrige sigue
recibiendo las tres —media aplicación es el back-office—, pero cada una abre solo lo suyo
y se pueden rotar por separado. En local las tres siguen siendo `clickoteca`, que es lo que
usa el E2E, así que el entorno de desarrollo no se entera.
**El reset dejó un hueco que hay que anotar:** `migrate reset` aplicó las cinco migraciones
pero **no ejecutó la semilla**, y la instancia se quedó unos minutos con la base vacía
—comprobado, no supuesto: la sonda devolvió ceros en todas las tablas—. Se sembró a
continuación a mano. Quien repita esto no debe dar por hecho que `reset` siembra: hay que
mirar.
**Estado final de la instancia desplegada**, verificado contra la base: 13 cuentas con
**3 hashes distintos** (uno por rol), 66 copias, 29 alquileres, 186 transiciones, 87
avisos, el alquiler más antiguo de hace 270 días, y los dos controles de coherencia
—solapes de copia y alquileres anteriores a su suscripción— a cero. Las tres contraseñas
quedan en `default_passwords`, ignorado por git, **y no hay otra copia**.
**Verificación:** 406 unitarios y **46 E2E en verde** contra una base local recreada con el
código nuevo — que es lo que prueba de verdad el reparto por rol, porque las cuentas
antiguas conservaban el hash viejo. Sincronizados `readme.md` §1.4, `.env.example`,
`ADR-0003` §5 y `AGENTS.md`.

---

### [2026-09-06] — Recuperar contraseña: enlace de un solo uso al correo de la cuenta

**Prompt:** "Quisiera añadir la funcionalidad de recordar contraseña en la ventana de
login, enviando al correo de origen un enlace de reestablecimiento. De momento no es
necesario MFA."

**Resumen.** La ventana de acceso solo tenía una puerta: `argon2id` no se invierte y no
había ninguna pantalla para reponer credenciales, así que un olvido dejaba la cuenta
muerta —lo dice el propio `.env.example` sobre las semillas—. Antes de escribir nada se
consultaron las dos decisiones que cambiaban el trabajo: **transporte de correo** (no
existía ninguno; el usuario eligió el **stub de consola**, sin proveedor externo) y
**flujo** (propuesta OpenSpec primero, `recuperar-contrasena`, y después implementar).

**Lo que decidió el diseño, y por qué.** La pieza ya existía a medias en el proyecto: la
sesión opaca de `ADR-0002` es exactamente la misma figura —un secreto portador del que en
la base solo se guarda el SHA-256—, así que el enlace **se copia de ella** en vez de
inventarse. De ahí salen las cinco decisiones que sostienen el flujo: tabla propia
(`password_reset_tokens`) y no columnas en `users`, para que un enlace gastado siga siendo
reconocible; **respuesta idéntica exista o no la cuenta** —el login lleva desde el primer
día evitando ser un oráculo de enumeración y esta pantalla no podía deshacerlo desde la
puerta de al lado, así que ni el email desconocido ni la cuenta suspendida se distinguen,
y **ni siquiera un fallo del transporte** cambia la respuesta—; **cada solicitud invalida
las anteriores**; el consumo es un **CAS** (`WHERE usedAt IS NULL`), no una comprobación
previa; y gastar el enlace **cierra todas las sesiones abiertas**, que es lo que quiere
quien sospecha que alguien más entró — el método `deleteSessionsForUser` llevaba desde
la tarea 2.1 escrito para este momento, sin que lo llamara nadie.

**La consecuencia incómoda, aceptada a propósito:** el enlace **no se guarda en ninguna
tabla**. Meterlo en la fila de `Notification` habría hecho cómodo el desarrollo y anulado
por completo el hash —quien viera la tabla entraría en cualquier cuenta—, así que el
adaptador de consola registra el mensaje **entero** y el log es el único sitio donde el
enlace existe. Los dos avisos nuevos del buzón (`PASSWORD_RESET_REQUESTED`,
`PASSWORD_CHANGED`) llevan la caducidad, nunca el token.

Código nuevo: dominio puro `password-reset.ts`, puerto `Mailer` en `src/mail/` —fuera de
`repositories`, que es persistencia— con adaptador de consola y mensaje como función pura,
repositorio con su adaptador Prisma y su doble en memoria, dos casos de uso, dos Route
Handlers (202 constante / 410 `RESET_TOKEN_INVALID`, código nuevo del enum de `ADR-0002`)
y dos pantallas en español, con el enlace "¿Has olvidado la contraseña?" junto al campo del
login. **Verificación:** `tsc`, `eslint`, **441 unitarios** (35 nuevos) y **53 E2E** en
verde, incluida la auditoría `axe` de las dos pantallas nuevas, más `openspec validate`.
El E2E no completa el circuito a propósito: el token no viaja por HTTP y exponerlo "solo
para los tests" sería regalar una puerta trasera — el camino feliz se prueba donde el
doble del transporte sí ve el mensaje.

---

### [2026-09-06] — El alta de personal existía en la API, pero no en la pantalla

**Prompt:** "¿Cómo un admin da de alta un nuevo operador?" → "Añade el formulario."

**Resumen.** La pregunta destapó un hueco que la documentación no reflejaba. `POST
/api/employees` existía desde el bloque 8 —con el permiso `employee.manage`
comprobado en el **caso de uso** y no solo en la ruta, hash argon2id de la contraseña
y `AuditLog` con `employee.created`—, pero la pantalla `/backoffice/empleados` solo
listaba, cambiaba el rol y suspendía. Su único `fetch` era el `PATCH` de cada fila.
Un admin que entrara por la interfaz **no podía crear un operador**: tenía que llamar
al endpoint a mano. Y `ux-flows.md` §A2 daba el flujo por "implementado", con "Alta de
empleado con rol" dibujada en el diagrama.

**Sin cambio de OpenSpec.** La spec `accounts-roles` ya dice que el admin "gestiona
empleados" y el PRD ya tiene UC-B13 ("crea, modifica y desactiva"): esto no es un
requisito nuevo, es un hueco de implementación. Inventar un change para taparlo habría
sido ceremonia.

**Lo que decidió la pantalla.** La contraseña inicial se muestra **en claro**: no es la
del admin, tiene que **leerla para entregarla**, y ocultarla solo conseguiría que la
copiara mal y nadie lo notara hasta el primer acceso fallido. El rol por defecto es
**operador** —un admin de más reparte permisos que luego hay que quitar a mano—. El
email repetido llega como error de campo (`errors[]`, RFC 9457) y se pinta junto al
suyo **sin vaciar el formulario**: reescribir cuatro campos por una colisión sería
castigar al admin por los tres que tenía bien. Y la pantalla dice lo que la API no
puede decir — que la contraseña se entrega **en persona**, porque no se manda ningún
correo (el adaptador de esta entrega escribe al log).

**Lo que sigue sin poder hacer un admin:** reponer la contraseña de un empleado
existente. Es la misma exclusión deliberada del cambio `recuperar-contrasena`: quien
puede fijar credenciales ajenas tiene una puerta trasera. Para eso está el enlace.

**Probado como formulario de admin, no en E2E**, por la misma razón escrita en
`configuracion-forms.test.tsx`: crear un empleado de verdad dejaría una cuenta más en
la base compartida en **cada** ejecución de la suite, y la semilla no limpia lo que no
ha creado ella. La pantalla ya pasa por la auditoría `axe` del E2E. **Verificación:**
`tsc`, `eslint`, **450 unitarios** (9 nuevos) y **53 E2E** en verde. Sincronizados
`readme.md` §1.2 y §2.6, `PRD.md` §4.1, `ux-flows.md` §A2 (con la corrección fechada de
lo que daba por hecho) y `AGENTS.md`.

---

### [2026-09-06] — «Sets fuera» contaba alquileres cerrados

**Prompt:** "En el formulario de clientes: la columna «Sets fuera» ¿es la suma de sets
históricos del cliente? Aparece un cliente con 5 sets y otro con 3, pero al ver el
histórico aparece que los sets están cerrados o con uno en curso."

**Resumen.** No era la suma histórica: era algo más raro y más equivocado. El `_count`
de la lista de clientes filtraba **solo por el estado de la copia**
(`copy: { state: { in: OCCUPYING } }`), sin mirar el estado del alquiler. Así, un
alquiler cerrado hace meses seguía contando si **esa misma copia** está hoy fuera con
otra persona. Comprobado contra la base antes de tocar nada: Diego 5 cuando tiene 1,
Ana 3 cuando tiene 0, Carla 2 cuando tiene 0.

La regla correcta ya estaba escrita en el resto del código —`currentCopyStates`, la
cola de trabajo, la ficha de copia, los recordatorios de retención llevan las **dos**
condiciones—; la lista de clientes era la única que se dejaba la mitad. El arreglo es
esa condición, no una invención: `status: { not: "COMPLETED" }`.

**Por qué se coló, que es lo que importa.** Los adaptadores Prisma **no tienen ninguna
prueba**: los casos de uso corren contra dobles en memoria, y un doble no tiene copias
que hayan pasado por varias manos. El fallo solo es visible contra una base con
pasado, y de hecho nació cuando la semilla ganó nueve meses de historial. Por eso la
prueba nueva es un E2E (`e2e/clientes.spec.ts`) y no un test de caso de uso: es **de
solo lectura** —no alquila ni devuelve nada, que comparte base con el resto de la
suite— y usa a Elena Prat, del historial sembrado, que nadie más toca y tiene la forma
exacta del fallo: tres alquileres, todos devueltos. Verificado en los dos sentidos: con
el fallo reintroducido a propósito, la prueba se pone roja (`Expected "0", Received
"1"`).

**Queda una pregunta abierta para el usuario**, que no se decidió por él: la columna
cuenta los cuatro estados que ocupan plaza de plan, y dos de ellos —`EN_INSPECCION` y
`EN_HIGIENIZACION`— son copias que ya están de vuelta en el almacén. El número es el
correcto para saber si el cliente puede pedir otro set, pero el título "Sets fuera" las
nombra mal. O cambia el título, o la columna pasa a `HELD_COPY_STATES`.

---

### [2026-09-06] — Los errores de validación hablaban en inglés y en jerga

**Prompt:** "En formularios de cliente veo que los errores de validación deberían ser
en castellano en lenguaje no técnico, evitar «Invalid input: expected number, received
null» o «Too big: expected number to be <=12». ¿Lo revisas?"

**Resumen.** Los fallos de Zod viajan al cliente dentro de `errors[]` (RFC 9457,
ADR-0002 §2) y el formulario los pinta **tal cual** junto a su campo. Es decir: lo que
escribe Zod lo lee una persona. Y sus mensajes por defecto están en inglés y hablan de
tipos y operadores. La defensa hasta hoy era acordarse de escribir un mensaje propio en
cada regla —`plans/[code]` lo dice por escrito en un comentario—, y en la tarjeta del
alta se olvidó. Los dos mensajes citados son exactamente `expMonth` y `expYear`.

**La decisión de fondo: que el defecto sea el correcto.** Un `z.config({ customError })`
en `src/http/validation-messages.ts`, importado desde `parse-body.ts` —por donde pasa
toda la validación de peticiones—, con frases que no mencionan tipos: "Este dato es
obligatorio", "Tiene que ser 12 o menos", "Escribe al menos 8 caracteres", "Aquí va un
número". **No se usa `z.locales.es()`**, que existe: traduce literalmente y deja el
mismo lenguaje de programador en otro idioma ("Demasiado pequeño: se esperaba que texto
tuviera >=2 caracteres"). El problema no era el idioma, era hablarle de tipos a quien
está rellenando un formulario. El mensaje escrito en el esquema **sigue mandando** sobre
el mapa —comprobado en un test—: el genérico es una red, no un techo, así que donde el
rango es la explicación se puso a medida ("El mes va del 1 (enero) al 12 (diciembre)").

**Dos cosas aparecieron por el camino.** La primera: **cuatro rutas** —`login`,
`register` y las dos de restablecimiento— repetían a mano el bloque de `safeParse` que
`parseJsonBody` existe precisamente para evitar, y por eso se saltaban el punto único
donde ahora se instalan los mensajes. Ya pasan por él, y de paso se van veinte líneas de
copia y pega por ruta.

La segunda explica el "received null" del prompt, que era lo que no cuadraba:
**`JSON.stringify` convierte `NaN` en `null`**. Los formularios hacían `Number(campo)`,
así que un campo vacío llegaba como `0` —un valor perfectamente válido— y unas letras
llegaban como `null`, indistinguibles de no haber escrito nada. El servidor no podía
contestar bien porque no le llegaba con qué distinguirlo. `lib/form-values.ts`
(`numericField`) conserva la diferencia: vacío es `null` —"este dato es obligatorio"— y
lo que no es un número viaja **como el texto que se escribió** —"aquí va un número"—.
Lo usan los cinco formularios que mandaban números.

**Verificación:** 462 unitarios (12 nuevos, incluido uno que barre catorce esquemas y
exige que ningún mensaje contenga `invalid|expected|received|too big|<=`) y una pasada
real contra `/api/auth/register` con mes 13, campos vacíos, letras y casillas sin
marcar: todos responden en castellano.

---

### [2026-09-06] — Cancelar dejaba encerrado a quien seguía con sesión

**Prompt:** "Iniciando sesión como suscriptor cancelado, al ir a los planes y
seleccionar un plan «Basic» o «Premium» no tiene efecto."

**Resumen.** No es que el botón fallara: es que no había ningún sitio al que llevar.
El bucle, reproducido contra el servidor: el portal de quien canceló dice "ver los
planes" → `/planes` → sus botones apuntan al alta → y **la página de alta redirige al
portal a quien ya tiene sesión** (307 comprobado). Se daba la vuelta entera y se
volvía al punto de partida. Y la API no ofrecía salida:
`PUT /api/subscriptions/me` responde **404** tanto para `status` como para `planCode`,
porque una suscripción cancelada ya no rige y no hay ninguna que tocar.

**Lo llamativo es por qué no se detectó.** El camino de "volver a suscribirse" **sí**
existía —alta con la contraseña de la cuenta, spec `accounts-roles`— y el E2E lo
cubría… llamando a la API de alta directamente. Por HTTP funcionaba; por la interfaz
no había forma de llegar. La prueba pasaba y el usuario estaba encerrado.

**La decisión: contratar es crear, no reactivar.** `POST /api/subscriptions/me`
(`openSubscription`) abre una suscripción nueva para el usuario en sesión. **Sin
contraseña**, porque la sesión ya acredita quién es —esa exigencia del alta pública
existe justo porque allí no hay sesión—. Y **no reactiva la cancelada**: la spec dice
que una cancelada no revive, así que se abre otra sobre la misma cuenta, con la
dirección y la tarjeta que ya tenía, y con `startedAt` de hoy — la antigüedad para
sets restringidos y para la cola se gana con la suscripción que rige, no con la que se
canceló. La comprobación de "no tiene otra vigente" va **dentro de la transacción**,
como ya hacía `resubscribe`: fuera, dos peticiones simultáneas abrirían dos.

**Y el otro extremo del bucle:** el botón de `/planes` ahora **depende de quién mire**
— visitante al alta, suscriptor a su portal, y al personal no se le enseña botón,
porque un operador no contrata planes. Sin esto, el arreglo del portal seguiría
escondido detrás de una redirección.

**Verificación:** 467 unitarios (5 nuevos sobre el caso de uso) y 55 E2E, con el
recorrido de interfaz completo —cancelar, ir a planes, pulsar, contratar— comprobado
**en los dos sentidos**: devolviendo el enlace viejo, la prueba se pone roja esperando
una URL que nunca llega. Más una pasada real con Carla, la cancelada de la semilla:
201 al contratar y 409 al intentarlo dos veces. Se revirtió su suscripción para
dejarla como fixture de "sin plan activo".

**La spec se quedó corta y se formalizó a continuación** (change
`contratar-plan-desde-el-portal`, 2026-09-07): nombraba la contraseña como la única
forma de acreditar identidad al volver —lo era cuando se escribió, porque el único
camino pasaba por el alta pública, sin sesión— y ahora reconoce las dos, más un
requisito nuevo en `subscriptions` para contratar sin suscripción vigente. Queda
archivarlo.
