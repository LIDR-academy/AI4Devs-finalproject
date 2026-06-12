This file contains base rules for an AI agent. I need you to rewrite it for 
a different stack, keeping the exact same structure and purpose.

New stack:
- Mobile app: Flutter (Dart)
- Backend/Database: Firebase (Firestore + Authentication)
- State management: BLoC pattern (flutter_bloc package)
- Architecture: Clean Architecture — presentation (BLoC + widgets), 
  domain (use cases + entities), data (repositories + Firebase datasources)
- Platform: Android / iOS
- Code and comments: English
- Documentation, commits and PR descriptions: Spanish
- No REST API; all data access through Firebase SDK

Replace all React, Node, TypeScript and frontend/backend web references 
with their Flutter/Firebase/BLoC equivalents. Make the result implementation-ready 
for AI agents working in Cursor on this project.

--------------------------

- Deprecate or remove backend-standards.mdc and frontend-standards.mdc 
  since they describe Node/React which is not our stack.
- Update AGENTS.md to reference only the new Flutter/Firebase standards.
- Update any commands in ai-specs/.commands/ that still reference 
  the old backend/frontend standards.

----------------------

Adapt or mark as obsolete ai-specs/specs/development_guide.md and api-spec.yml 
since they describe a web stack. Replace any REST/API references with 
Firebase SDK equivalents, or add a deprecation notice if they are not relevant 
for a Flutter/Firebase project.

---------------------

Update mobile-standards.mdc and AGENTS.md to reference the installed 
skills in .agents/skills/. Specifically ensure agents use:
- flutter-apply-architecture-best-practices
- dart-add-unit-test
- flutter-add-integration-test  
- dart-generate-test-mocks
- flutter-implement-json-serialization
- flutter-setup-declarative-routing
when performing related tasks.

------------------------

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

---------------------------

Dado este PRD: @docs/PRD.com

Genera la sección "Descripción general del producto" para el @readme.md
del proyecto. Debe incluir:

- Qué es el producto y qué problema resuelve (3-4 líneas)
- Propuesta de valor principal (bullet points)
- Funcionalidades principales del MVP (bullet points)
- Flujo E2E prioritario resumido (3-4 líneas)

Formato markdown. Tono técnico pero accesible. Máximo una página.

-----------

### Historias de usuario — Generación inicial
**Herramienta:** Claude (chat conversacional)
**Proceso:** Sesión de metaprompting para afinar el producto antes de 
generar las historias. Se definieron reglas del juego, flujos de UX, 
modelo de sincronización local/nube y casos edge antes de producir 
las historias.
**Resultado:** 15 historias organizadas en 4 épicas (Gestión de partida, 
Flujo de ronda, Historial, Cuenta y sincronización)
**Ajuste humano:** 
  ***Decisión:*** Se detectó la ausencia de funcionalidad de borrado de 
partidas y gestión de favoritos. Se añadieron dos historias Must-Have 
y se actualizó el PRD.
  ***Motivo:*** La IA no contempló la gestión del ciclo de vida de los datos. 
Revisión humana necesaria.
**Conversación completa:** [enlace a esta conversación si la exportas]


--------------


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


-----------------

Use /multitask to process the following Jira tickets in parallel.
Use Atlassian  CLI (acli) to read and update Jira tickets.

For each ticket:

1. Read the current ticket description using acli
2. Run /enrich-us with the ticket content and the PRD at docs/PRD.md
   as context
3. Update the ticket in Jira with the enhanced content using acli,
   keeping the [original] section and adding the [enhanced] section

Tickets to process in parallel:
LPT-6, LPT-7, LPT-8, LPT-9, LPT-10, LPT-11, LPT-12, LPT-13,
LPT-14, LPT-15, LPT-16, LPT-17, LPT-18

---------------
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

-------------------

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

------------

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

----------------

### Seguridad — Eliminación de secretos expuestos
**Tipo:** Corrección humana
**Problema:** firebase_options.dart subido accidentalmente al repo público
**Solución:** git rm --cached, rotación de API key en Firebase, 
GitHub Secret configurado
**Lección:** Configurar .gitignore antes del primer commit, 
no después

-------

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

------------

In readme.md, apply these two corrections to section 2:

1. Section 2.3: Replace any reference to SQLite or drift with
"local storage (technology to be confirmed in Entrega 2)"

2. Section 2.4: Replace Play Store and TestFlight deployment
with GitHub Releases APK download. The deployment process is:
GitHub Actions builds release APK on merge to main,
uploaded as GitHub Release artifact with a public download URL.

----------

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

------------

In readme.md sections 2 and 3, make players consistently
embedded in the games document (not a subcollection).
Update any reference to a players subcollection in section 2
to reflect that players are an embedded array in games.
Do not modify anything else.

-----------

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

------------

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

-----------

Read the file listOfPrompts.md and the prompts.md template
in the repository root.

Fill prompts.md with the most relevant prompts from
listOfPrompts.md, mapping them to the correct sections:

- Section 1 (Descripción general): PRD generation prompt
- Section 2 (Arquitectura): architecture section prompt
- Section 3 (Modelo de datos): data model prompt
- Section 4 (API): API specification prompt
- Section 5 (Historias de usuario): user stories generation prompt
- Section 6 (Tickets de trabajo): /enrich-us + multitask prompt

Maximum 3 prompts per section. Include only the prompt text,
the tool used, and a one-line note on what human adjustment
was needed.

Do not modify listOfPrompts.md.
Write in Spanish.
