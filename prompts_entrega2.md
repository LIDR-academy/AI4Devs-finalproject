> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

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

### Prompt 1

**Herramienta:** Claude (chat conversacional)

**Prompt:**

Actúa como un Product Owner senior con experiencia en apps móviles.
Genera un PRD (Product Requirements Document) completo en español para
la siguiente app móvil:

## Contexto

App móvil Flutter llamada "La Pocha" — marcador digital para el juego
de cartas español homónimo. El objetivo es sustituir el papel y lápiz
con una experiencia ágil y sencilla.

## Decisiones ya tomadas

### Jugadores y cartas

- Mínimo 3, máximo 8 jugadores
- El número de cartas se determina automáticamente por el número de jugadores:
  - 3 jugadores: 30 cartas, máximo 10 por ronda
  - 4 jugadores: 40 cartas, máximo 10 por ronda
  - 5 jugadores: 40 cartas, máximo 8 por ronda
  - 6 jugadores: 48 cartas, máximo 8 por ronda
  - 7 jugadores: 49 cartas (+ comodín), máximo 7 por ronda
  - 8 jugadores: 48 cartas, máximo 6 por ronda

### Puntuación

- Acierto: 10 + (5 × bazas conseguidas)
- Fallo: -5 × diferencia entre bazas apostadas y conseguidas
- Restricción del repartidor: obligatoria. La suma de apuestas no puede
  igualar el número de bazas disponibles. No se puede cerrar la fase de
  apuestas si se incumple.

### Flujo de una ronda

1. Introducir apuestas en orden; el repartidor apuesta el último
2. Pantalla de juego: muestra apuestas de cada jugador, puntuación
   acumulada y balance de bazas pedidas vs disponibles en tiempo real
3. Introducir bazas reales obtenidas
4. Pantalla de resultado de ronda: ranking, puntuación total, delta
   respecto a ronda anterior

- Corrección permitida solo en ronda actual
- Si una corrección viola la restricción del repartidor, se bloquea
  hasta que el repartidor corrija sus bazas
- Posibilidad de repetir una ronda completa

### Configuración de partida

- El usuario elige número de jugadores (3-8); el resto se calcula solo
- Primer repartidor: por defecto el primero de la lista, con botón
  "🎲 Repartidor aleatorio"
- El orden de jugadores es editable antes de empezar y determina la
  rotación del reparto

### Jugadores

- Tres formas de añadir un jugador: nombre libre, buscar usuario
  registrado por nombre de usuario, o seleccionar de lista de favoritos
- Favoritos: lista local de jugadores frecuentes, pueden ser
  registrados o no
- El orden de jugadores puede modificarse antes de empezar la partida

### Cuenta y sincronización en la nube

- Registro completamente opcional
- Sin cuenta: todo funciona en local, sin conexión
- Con cuenta: las partidas se suben automáticamente a la nube al
  finalizar
- Los jugadores de la partida que tengan cuenta registrada reciben
  la partida automáticamente en su historial
- Partidas locales previas al registro: se quedan en local
- Historial único con icono diferenciador local/nube

### Historial

- Listado de todas las partidas (locales y en nube mezcladas)
- Detalle de una partida: resultado ronda a ronda
- Repetir partida: crea nueva partida con misma configuración y
  jugadores, editable antes de empezar

## Alcance del MVP

Incluye todo lo descrito arriba.

## Post-MVP explícito (NO incluir en MVP)

- Subida manual de partidas locales antiguas tras registrarse
- Campeonatos y ligas entre amigos
- Estadísticas sociales y gamificación
- Variantes random durante la partida
- Soporte para 2 jugadores

## Estructura del PRD

El documento debe incluir:

1. Visión del producto y problema que resuelve
2. Usuarios objetivo (2-3 personas)
3. Propuesta de valor
4. Alcance del MVP (qué sí, qué no)
5. Flujo E2E prioritario descrito en prosa
6. Funcionalidades principales
7. Restricciones técnicas
8. Métricas de éxito para el MVP

Sé específico y evita generalidades. El documento debe ser suficientemente
claro para que cualquier desarrollador pueda entender el producto sin
explicación adicional.

**Ajuste humano:** Se añadieron posteriormente historias de borrado de partidas y gestión de favoritos que la IA no había contemplado en el PRD inicial.

---

### Prompt 2

**Herramienta:** Cursor

**Prompt:**

Dado este PRD: @docs/PRD.com

Genera la sección "Descripción general del producto" para el @readme.md
del proyecto. Debe incluir:

- Qué es el producto y qué problema resuelve (3-4 líneas)
- Propuesta de valor principal (bullet points)
- Funcionalidades principales del MVP (bullet points)
- Flujo E2E prioritario resumido (3-4 líneas)

Formato markdown. Tono técnico pero accesible. Máximo una página.

**Ajuste humano:** Corregir la referencia `@docs/PRD.com` por `@docs/PRD.md` antes de ejecutar el prompt.

---

### Prompt 3

**Herramienta:** Cursor

**Prompt:**

Read the PRD at docs/PRD.md and update the readme.md in the repository
root with the following two sections:

## Ficha del proyecto

Generate a project card with these fields:

- Nombre: La Pocha
- Descripción corta: one sentence
- Stack: Flutter + Firebase (Firestore + Authentication)
- State management: BLoC
- Plataforma: Android / iOS
- Autor: [leave blank for the user to fill]
- Repositorio: [leave blank for the user to fill]

## Descripción general del producto

Based on PRD sections 1, 2, 3 and 5, write a concise product description
in Spanish including:

- What it is and what problem it solves (3-4 lines)
- Target users (the 3 personas from the PRD, summarized)
- Main value proposition (bullet points)
- MVP E2E flow summarized (3-4 lines)

Keep markdown formatting clean. Write in Spanish.
Do not modify any other existing content in readme.md.

**Ajuste humano:** Completar manualmente los campos Autor y Repositorio en la ficha del proyecto.

---

## 2. Arquitectura del sistema

### Prompt 1

**Herramienta:** Cursor

**Prompt:**

Read the PRD at docs/PRD.md and the standards at .cursor/rules/.
Generate the architecture section for readme.md in Spanish, filling
these subsections:

## 2.1 Diagrama de arquitectura

Generate a Mermaid diagram showing the main components:

- Flutter app (presentation/domain/data layers)
- Local storage (device)
- Firebase Authentication
- Firebase Firestore
Show the data flow for both offline and online scenarios.
Justify the Clean Architecture choice and BLoC pattern.

## 2.2 Descripción de componentes principales

Describe each component with the technology used.

## 2.3 Estructura de ficheros

Show the folder structure under lib/ following Clean Architecture
with BLoC. Include a brief description of each main folder.

## 2.4 Infraestructura y despliegue

Describe Firebase infrastructure and the deployment process
for the Flutter app (APK/TestFlight).

## 2.5 Seguridad

Describe security practices: Firebase Auth, Firestore Security Rules,
local data, secrets management.

## 2.6 Tests

Describe the testing strategy: unit tests (domain logic),
integration tests (BLoC + repository), E2E test (main flow).

Do not modify any other section of readme.md.
Write in Spanish. Use Mermaid for diagrams.

**Ajuste humano:** Sustituir referencias a SQLite/drift y a Play Store/TestFlight por las decisiones reales del proyecto (ver Prompt 2).

---

### Prompt 2

**Herramienta:** Cursor

**Prompt:**

In readme.md, apply these two corrections to section 2:

1. Section 2.3: Replace any reference to SQLite or drift with
"local storage (technology to be confirmed in Entrega 2)"

2. Section 2.4: Replace Play Store and TestFlight deployment
with GitHub Releases APK download. The deployment process is:
GitHub Actions builds release APK on merge to main,
uploaded as GitHub Release artifact with a public download URL.

**Ajuste humano:** Confirmar la tecnología de almacenamiento local en la Entrega 2 cuando se defina.

---

### Prompt 3

**Herramienta:** Cursor

**Prompt:**

In readme.md sections 2 and 3, make players consistently
embedded in the games document (not a subcollection).
Update any reference to a players subcollection in section 2
to reflect that players are an embedded array in games.
Do not modify anything else.

**Ajuste humano:** Verificar coherencia con el modelo de datos de la sección 3 tras el cambio.

---

## 3. Modelo de datos

### Prompt 1

**Herramienta:** Cursor

**Prompt:**

Read the PRD at docs/PRD.md and the architecture already defined
in readme.md section 2.

Generate the data model section for readme.md in Spanish,
filling these subsections:

## 3.1 Diagrama del modelo de datos

Generate a Mermaid entity-relationship diagram for the Firestore
data model. Include these collections based on the PRD:

- users: registered user profiles
- games: game sessions (local and cloud)
- games/{gameId}/rounds: round detail subcollection
- favorites: local player favorites (document per user)

For each collection show all fields with types.
Mark which fields are used for queries (history by user,
game detail).
Note: local storage model mirrors the Firestore model
but persists on device.

## 3.2 Descripción de entidades principales

For each collection/entity describe:

- All fields with type and description
- Relationships between entities
- Key constraints and validation rules
- Which fields are indexed for queries

Important constraints from PRD:

- games.hostId: user who created the game
- games.participantIds: array of registered user IDs
  (for history queries)
- rounds are a subcollection of games (not embedded array)
- deletion is per-user only (soft delete or filtered query)
- offline-first: all data exists locally before any
  Firestore sync

Write in Spanish. Use Mermaid for the diagram.
Do not modify any other section of readme.md.

**Ajuste humano:** Alinear jugadores como array embebido en `games` en lugar de subcolección (ver sección 2, Prompt 3).

---

### Prompt 2

**Herramienta:** Cursor

**Prompt:**

In readme.md sections 2 and 3, make players consistently
embedded in the games document (not a subcollection).
Update any reference to a players subcollection in section 2
to reflect that players are an embedded array in games.
Do not modify anything else.

**Ajuste humano:** Revisar que el diagrama ER de la sección 3.1 refleje el array embebido de jugadores.

---

## 4. Especificación de la API

### Prompt 1

**Herramienta:** Cursor

**Prompt:**

Read the PRD at docs/PRD.md and the data model already defined
in readme.md section 3.

Generate the API section for readme.md in Spanish, filling
section 4:

## 4. Especificación de la API

This project does not use a REST API. All data access is through
Firebase SDK. Document the 3 most important Firestore operations
as if they were API endpoints, using a similar format to OpenAPI
but adapted to Firestore:

Operation 1: Create and sync a finished game

- Firestore path: games/{gameId} + subcollection rounds/{roundNumber}
- Operation type: batch write
- Required fields from data model
- Security rule that applies
- Offline behaviour (written locally first)

Operation 2: Get user game history

- Firestore path: games (collection query)
- Operation type: query
- Filters: participantIds array-contains userId,
  status == finished, hiddenInHistory != true for this user
- Ordered by finishedAt descending
- Security rule that applies

Operation 3: Firebase Authentication - register and login

- Operations: createUserWithEmailAndPassword,
  signInWithEmailAndPassword
- Fields: email, password, displayName
- Error cases: email already in use, wrong password,
  user not found
- Effect on Firestore: creates users/{uid} document on register

For each operation include:

- Description
- Parameters / fields
- Success response
- Error cases
- Security rule that applies

Write in Spanish. Do not modify any other section of readme.md.

**Ajuste humano:** Validar que las reglas de seguridad documentadas coincidan con `firestore.rules` antes de publicar.

---

### Prompt 2

**Herramienta:** Cursor

**Prompt:**

Adapt or mark as obsolete ai-specs/specs/development_guide.md and api-spec.yml
since they describe a web stack. Replace any REST/API references with
Firebase SDK equivalents, or add a deprecation notice if they are not relevant
for a Flutter/Firebase project.

**Ajuste humano:** Marcar `api-spec.yml` como obsoleto y redirigir a `firebase-data-access.yml` como contrato de acceso a datos.

---

## 5. Historias de usuario

### Prompt 1

**Herramienta:** Claude (chat conversacional)

**Prompt:**

Actúa como Product Owner senior. Antes de generar historias de usuario,
define en sesión de metaprompting las reglas del juego de La Pocha,
los flujos de UX, el modelo de sincronización local/nube y los casos
edge. Con ese contexto afinado, genera historias de usuario Must-Have
y Should-Have organizadas en épicas: Gestión de partida, Flujo de ronda,
Historial, y Cuenta y sincronización.

**Ajuste humano:** Se añadieron dos historias Must-Have (borrado de partidas y gestión de favoritos) que la IA no había contemplado.

---

### Prompt 2

**Herramienta:** Claude (chat conversacional) + Jira

**Prompt:**

Create the following user stories as Jira tickets in project LA-POCHA.
For each ticket set status "To refine", add the corresponding epic,
priority (High for Must-Have, Medium for Should-Have), and estimate (S/M/L).

EPIC: Gestión de partida

1. Como organizador, quiero crear una nueva partida seleccionando el número
   de jugadores, para que la app genere automáticamente la secuencia de
   rondas y el número de cartas. Priority: High. Size: M.
2. Como organizador, quiero añadir jugadores por nombre libre, buscando
   usuarios registrados o seleccionando de mis favoritos, para configurar
   la partida rápidamente. Priority: High. Size: M.
3. Como organizador, quiero reordenar los jugadores y elegir el primer
   repartidor (o asignarlo aleatoriamente), para respetar el orden físico
   de la mesa. Priority: High. Size: S.
4. Como organizador, quiero repetir una partida desde el historial, para
   recrear la misma configuración sin introducir los datos de nuevo.
   Priority: High. Size: S.

EPIC: Flujo de ronda
5. Como organizador, quiero introducir las apuestas de cada jugador en
   orden (repartidor al final) con validación de la restricción en tiempo
   real, para cerrar la fase de apuestas sin errores. Priority: High. Size: L.
6. Como organizador, quiero ver durante el juego las apuestas, puntuación
   acumulada y balance de bazas de cada jugador, para que todos puedan
   seguir el estado de la partida. Priority: High. Size: M.
7. Como organizador, quiero introducir las bazas reales obtenidas y que
   la app calcule los puntos automáticamente, para eliminar errores de
   cálculo. Priority: High. Size: M.
8. Como organizador, quiero poder corregir apuestas o bazas en la ronda
   actual, para subsanar errores de introducción. Priority: High. Size: M.
9. Como organizador, quiero poder repetir una ronda completa, para
   gestionar situaciones excepcionales durante el juego.
   Priority: High. Size: S.
10. Como organizador, quiero ver el resultado de cada ronda con ranking
    y puntuación acumulada, para que todos los jugadores conozcan su
    posición. Priority: High. Size: S.

EPIC: Historial
11. Como jugador, quiero ver un listado de todas mis partidas jugadas
    (locales y en nube), para consultar mi historial de juego.
    Priority: High. Size: M.
12. Como jugador, quiero ver el detalle de una partida pasada ronda a
    ronda, para recordar cómo se desarrolló. Priority: High. Size: M.
13. Como jugador, quiero eliminar partidas de mi historial, para mantener
    solo las que me interesa conservar. Priority: High. Size: S.
14. Como jugador, quiero gestionar mi lista de favoritos (añadir y
    eliminar), para mantenerla actualizada. Priority: High. Size: S.

EPIC: Cuenta y sincronización
15. Como jugador, quiero registrarme y hacer login con email y contraseña,
    para poder sincronizar mis partidas en la nube.
    Priority: Medium. Size: M.
16. Como jugador registrado, quiero que mis partidas se suban
    automáticamente al finalizarlas, para tener mi historial disponible
    en la nube sin ninguna acción adicional. Priority: Medium. Size: M.
17. Como jugador registrado, quiero recibir automáticamente en mi historial
    las partidas en las que participé aunque no fuera yo quien llevara el
    marcador, para ver todas mis partidas desde mi cuenta.
    Priority: Medium. Size: M.

**Ajuste humano:** Las historias 13 y 14 se incorporaron tras la revisión humana del metaprompting inicial.

---

### Prompt 3

**Herramienta:** Cursor

**Prompt:**

Read the Jira tickets descriptions stored in .tmp/jira-descriptions/
and the readme.md structure.

Fill sections 5 and 6 of readme.md:

## 5. Historias de Usuario

Select the 3 most representative Must-Have user stories from
the available tickets. Good candidates:

- LPT-5 (create game - core flow)
- LPT-9 (bets with dealer restriction - most complex)
- LPT-11 (real tricks and scoring - core logic)

For each story include the full enhanced content from Jira:
original story + acceptance criteria.
Do not include technical implementation details here.

## 6. Tickets de Trabajo

Select 3 tickets that represent different layers:

- One focused on domain logic (scoring, round sequence)
- One focused on UI/presentation (a screen or BLoC)
- One focused on Firebase/data layer (sync or auth)

For each ticket include the full enhanced content from Jira
including: context, acceptance criteria, data model impact,
architecture files, and definition of done.

Write in Spanish. Do not modify any other section of readme.md.

**Ajuste humano:** Seleccionar manualmente los tickets más representativos si el contenido enriquecido de Jira difiere de los candidatos sugeridos.

---

## 6. Tickets de trabajo

### Prompt 1

**Herramienta:** Cursor (`/multitask` + `/enrich-us`)

**Prompt:**

Use /multitask to process the following Jira tickets in parallel.
Use Atlassian CLI (acli) to read and update Jira tickets.

For each ticket:

1. Read the current ticket description using acli
2. Run /enrich-us with the ticket content and the PRD at docs/PRD.md
   as context
3. Update the ticket in Jira with the enhanced content using acli,
   keeping the [original] section and adding the [enhanced] section

Tickets to process in parallel:
LPT-6, LPT-7, LPT-8, LPT-9, LPT-10, LPT-11, LPT-12, LPT-13,
LPT-14, LPT-15, LPT-16, LPT-17, LPT-18

**Ajuste humano:** Validar cada ticket enriquecido en Jira antes de moverlo a "Pending refinement validation".

---

### Prompt 2

**Herramienta:** Cursor (`/multitask` + `/enrich-us` + acli)

**Prompt:**

Use /multitask to process the following Jira tickets in parallel.
The Atlassian MCP is not available, use acli (C:\Users\juanm\acli.exe)
to read and update Jira tickets instead.

For each ticket:

1. Read the current ticket description using acli
2. Run /enrich-us with the ticket content and the PRD at docs/PRD.md
   as context
3. Update the ticket in Jira with the enhanced content using acli,
   keeping the [original] section and adding the [enhanced] section

Tickets to process in parallel:
LPT-19, LPT-20, LPT-21

**Ajuste humano:** Usar la ruta absoluta de `acli.exe` cuando el MCP de Atlassian no esté disponible.

---

### Prompt 3

**Herramienta:** Cursor + acli

**Prompt:**

Using acli (C:\Users\juanm\acli.exe), update the Jira ticket LPT-5.

Read the current description of LPT-5 and apply ONLY these two changes:

1. In the acceptance criteria, replace criterion 3 with:
"La secuencia de rondas sigue el patrón ascendente-plateau-descendente:
1, 2, …, M (repetido N veces, siendo N el número de jugadores), M-1, …, 2, 1.
Ejemplo con 4 jugadores (M=10): 1,2,3,4,5,6,7,8,9,10,10,10,10,9,8,7,6,5,4,3,2,1 = 22 rondas."

2. In the configuration table, replace the "Rondas (2M−1)" column
with "Rondas (2M−1+N)" and update values:
| Jugadores | Cartas totales | Máx. por ronda (M) | Rondas |
|-----------|----------------|--------------------|--------|
| 3         | 30             | 10                 | 21     |
| 4         | 40             | 10                 | 22     |
| 5         | 40             | 8                  | 19     |
| 6         | 48             | 8                  | 21     |
| 7         | 49 (+ comodín) | 7                  | 19     |
| 8         | 48             | 6                  | 18     |

Do not modify any other content. Preserve all existing formatting.

**Ajuste humano:** La IA había calculado mal la fórmula de rondas (2M−1 en lugar de 2M−1+N); corrección manual del criterio de aceptación.

---

## 7. Pull requests

### Prompt 1

**Herramienta:** Cursor + GitHub CLI (`gh`)

**Prompt:**

```
Crea una Pull Request en GitHub para la rama finalproject-entrega1-JMGS
hacia main con el siguiente contenido:

Título: feat(entrega1): documentación técnica completa — La Pocha Tracker

Descripción:
## Qué incluye esta PR
- README completo con arquitectura, modelo de datos, API, historias
  de usuario y tickets de trabajo
- PRD del producto en docs/PRD.md
- Especificación de acceso a datos Firebase en ai-specs/specs/
- Reglas e índices Firestore en firestore.rules y firestore.indexes.json
- Configuración de proyecto Firebase (firebase.json, .firebaserc)

## Decisiones tomadas
- Clean Architecture con BLoC como patrón de estado
- Offline-first: Drift (SQLite) como almacenamiento local
- players[] embebido en games (no subcolección)
- Estado inicial de partida: setup (no lobby)

## Tests
No aplica en esta entrega (documentación únicamente)
```

**Ajuste humano:** Verificar que la rama está actualizada y que no hay conflictos con main antes de crear la PR.

---

### Prompt 2

**Herramienta:** Cursor + GitHub CLI (`gh`)

**Prompt:**

```
Crea una Pull Request en GitHub para la rama feature-entrega2-JMGS
hacia main con el siguiente contenido:

Título: feat(entrega2): implementación Flutter completa — La Pocha Tracker

Descripción:
## Qué incluye esta PR

### Implementación (13 tickets completados)
- LPT-23: Setup Drift (SQLite) — AppDatabase, tablas games y rounds
- LPT-5: Crear partida — selector jugadores, secuencia de rondas, Drift
- LPT-6: Añadir jugadores — nombre libre, stubs registrado/favoritos
- LPT-7: Orden de mesa y repartidor — drag-and-drop, aleatorio, empezar
- LPT-9: Apuestas con restricción del repartidor — validación en tiempo real
- LPT-10: Pantalla de juego — vista solo lectura del estado de ronda
- LPT-11: Bazas reales y cálculo de puntos — scoring automático
- LPT-12: Corrección de apuestas en ronda actual — re-validación restricción
- LPT-14: Resultado de ronda y fin de partida — ranking, rotación repartidor
- LPT-15: Historial local — listado offline-first con badge local/nube
- LPT-19: Registro y login — Firebase Auth email/contraseña
- LPT-20: Subida automática — batch write Firestore, players[] embebido
- LPT-24: Cancelar partida — borrado Drift sin guardar en historial

### Diseño
- Wireframes generados con Figma Make (IA generativa)
- Sistema de diseño documentado en docs/design.md
- Flujo de navegación completo en readme §1.3 (diagrama Mermaid)

### Documentación
- ADR (Architecture Decision Records): Drift vs Hive, setup vs lobby
- docs/backlog-futuro.md con features post-MVP
- prompts.md completado con Entrega 2

## Tests
- 138+ tests unitarios y de BLoC pasando (flutter test)
- flutter analyze sin errores
- Pruebas E2E manuales en dispositivo Xiaomi Mi A1

## Issues conocidos (trabajo futuro)
- Textos cortados en pantallas pequeñas
- Stubs de búsqueda de usuario registrado y favoritos (LPT-18, LPT-19)
- Pantallas Bazas reales y Resultado sin wireframe visual
  (créditos Figma agotados durante el desarrollo)
- Claves Firebase pendientes de rotación (expuestas brevemente
  en repo público; ya corregidas pero conveniente regenerar)
```

**Ajuste humano:** Completar la URL del repositorio y verificar que todos los tickets están marcados como Done en Jira antes de crear la PR.

---

---

## Entrega 2 — Código funcional

> Esta sección documenta los prompts de la Entrega 2 (implementación),
> siguiendo el mismo formato que la Entrega 1. El registro completo y
> cronológico se encuentra en `listOfPrompts.md`.

---

## E2.1 Decisiones de arquitectura previas a implementación

### Prompt 1 — Actualización del readme (ADR + Drift + setup)

**Herramienta:** Cursor

**Prompt:**

```
Abre el archivo `readme.md` y aplica los siguientes cambios exactos:

CAMBIO 1 (7 ocurrencias): lobby → setup en diagrama ER, tabla de campos
games, descripción startedAt, HU1/LPT-5, Ticket 1/LPT-7 (criterios de
aceptación, modelo de datos y Security Rules).

CAMBIO 2: Data — local | Drift (SQLite) en tabla de componentes §2.2
y descripción de capa data/ §2.3.

CAMBIO 3: Añadir tabla ADR antes de §2 con las dos decisiones tomadas:
| Estado inicial | setup | lobby | Single-device, no sala de espera |
| Storage local | Drift | Hive | Tipado fuerte, migraciones, tests |

No modifiques nada más.
```

**Ajuste humano:** El estado `lobby` estaba presente en 7 puntos distintos del readme — se verificó manualmente que ninguno quedara sin actualizar tras el prompt.

---

## E2.2 Diseño de interfaz con IA generativa

### Prompt 1 — Wireframes con Figma Make

**Herramienta:** Figma Make (IA generativa de pantallas)

**Prompt (pantalla Home, fija el lenguaje visual):**

```
Diseña una pantalla de inicio (Home) para una app móvil llamada
"La Pocha", marcador digital para un juego de cartas español.

Estilo: verde tapete como color primario (~#2E7D5B), fondo neutro claro,
acento ámbar para acciones secundarias. Material Design 3. Tipografía
generosa — público incluye usuarios mayores de 50 años (persona Carlos,
PRD §2). Esquinas redondeadas 12-16px, elevación sutil.

Contenido: cabecera con nombre y icono de cuenta discreto (no
bloqueante, la app funciona sin sesión), botón principal "Nueva partida",
sección Historial con estado vacío amigable, tip de "¿Cómo empezar?".
Mobile-first, frame 390x844. Texto en español.
```

**Ajuste humano:** Eliminada tarjeta "Mejor racha" (no existe en el modelo de datos del MVP — la IA la generó sin base en el PRD). Corregido número de rondas para 4 jugadores de 19 a 22 en la pantalla "Crear partida" (error aritmético de la IA en los datos de ejemplo).

---

### Prompt 2 — Sistema de diseño (docs/design.md)

**Herramienta:** Claude (chat, inspección visual de wireframes)

**Prompt:**

```
A partir de los wireframes generados en Figma para La Pocha (Home,
Crear partida, Añadir jugadores, Orden de mesa, Apuestas, Pantalla
de juego), extrae y documenta el sistema de diseño en docs/design.md.

Incluye: paleta de color con tokens semánticos de Material 3
(primary, surface, error...), tipografía (familias, jerarquía de
tamaños), espaciado y radios de esquina, componentes recurrentes
identificados (avatar, botón primario/secundario, chip selector,
banner de aviso, fila reordenable). Nombra los tokens con la
convención ColorScheme de Flutter para facilitar el theming futuro.
```

**Ajuste humano:** La extracción automática vía plugin de Figma no fue posible en plan gratuito (requiere Dev Mode de pago). El documento se generó por inspección visual de las capturas, con tokens aproximados — suficiente como referencia orientativa para Cursor.

---

## E2.3 Implementación por bloques

### Prompt 1 — Patrón estándar (ticket = prompt)

**Herramienta:** Cursor (modo Plan antes de ejecutar)

**Prompt tipo (aplicado a todos los tickets del Bloque 1 al 4):**

```
Lee el ticket [LPT-X] de Jira con acli, revisa docs/design.md
para referencia visual, e impleméntalo siguiendo las convenciones
en .cursor/rules/. Usa modo Plan antes de ejecutar.
```

**Ajuste humano:** Este patrón mínimo fue posible gracias al enriquecimiento SDD previo de los tickets. Cuando el agente detectó ambigüedades (ubicación de CancelGameUseCase en el árbol de features, patrón BLoC vs. llamada directa en LPT-24, alcance de corrección de bazas en LPT-12), se resolvieron en chat con Claude antes de ejecutar — el agente no tomó decisiones de arquitectura por su cuenta.

---

### Prompt 2 — Corrección de discrepancia crítica (LPT-20)

**Herramienta:** Cursor

**Prompt:**

```
Lee el ticket LPT-20 de Jira con acli e impleméntalo siguiendo
las convenciones en .cursor/rules/.

CORRECCIÓN CRÍTICA: el ticket describe players como subcolección
(games/{gameId}/players/{playerId}), pero el modelo validado en
readme.md §3 usa players[] EMBEBIDO en el documento games.
Usa el modelo embebido. NO crear subcolección players/.

Batch Firestore debe escribir:
- games/{gameId}: con players[] embebido, participantIds[], etc.
- games/{gameId}/rounds/{roundNumber}: subcolección (correcta)

Usa modo Plan antes de ejecutar.
```

**Ajuste humano:** Detectada la discrepancia entre el ticket (generado por IA en Entrega 1) y el modelo validado en el readme. Regla aplicada: readme.md como fuente de verdad ante cualquier contradicción con contenido generado por IA.

---

## E2.4 Resolución de bugs en dispositivo

### Prompt 1 — Firebase duplicate-app

**Herramienta:** Cursor

**Prompt:**

```
Investiga y corrige el error [core/duplicate-app] al hacer flutter run.
La solución debe eliminar la causa raíz — NO silenciar la excepción
(capturar y obviar una excepción es un code smell inaceptable).
Busca TODAS las ocurrencias de initializeApp en lib/ y test/.
No apliques cambios hasta mostrar el diagnóstico completo.
```

**Causa raíz y fix:** `firebase_options.dart` y `google-services.json` tenían `apiKey` distintas (desincronización de configuración). Fix: `flutterfire configure --project=la-pocha-9d070`. No se tocó `main.dart`.

**Ajuste humano:** El diagnóstico inicial apuntaba a doble inicialización en código; la causa real era desincronización de ficheros de configuración. La exigencia de no capturar la excepción llevó al diagnóstico correcto.

---

### Prompt 2 — Crash ScaffoldMessenger al finalizar partida

**Herramienta:** Cursor

**Prompt:**

```
La app se bloquea con "No ScaffoldMessenger widget found" al pulsar
"Ver resultado". Causa probable: SyncStatusSnackbar intenta mostrar
un SnackBar con un BuildContext sin ScaffoldMessenger en el árbol
tras la navegación a la pantalla de resultado final.

Fix correcto: GlobalKey<ScaffoldMessengerState> en MaterialApp
(scaffoldMessengerKey), no try/catch ni gestión por contexto local.
No apliques cambios hasta mostrar el diagnóstico del punto exacto.
```

**Causa raíz y fix:** `SyncStatusSnackbar` envolvía `MaterialApp.router` por fuera — el `ScaffoldMessenger` existe por debajo en el árbol y no era alcanzable desde el `BlocListener`. Fix: `rootScaffoldMessengerKey` global + `scaffoldMessengerKey` en `MaterialApp.router`.

**Ajuste humano:** El crash solo se manifestaba al terminar una partida completa (único flujo que emite `GameSyncSuccess`/`GameSyncFailure`), lo que dificultaba su reproducción en pruebas parciales.
