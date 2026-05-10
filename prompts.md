# Prompts — MotoCiudad

> Compendio cronológico de los prompts usados para definir el proyecto **MotoCiudad** (app móvil colaborativa de parkings de moto): primero en **Claude Design** para generar los mockups visuales, y después a lo largo de **3 conversaciones en Claude.ai** para gamificación, stack y documentación completa.
>
> Sirve como bitácora del proceso de Spec Driven Development y como plantilla reutilizable para futuros proyectos similares.

**Versión**: 1.1
**Última actualización**: Mayo 2026

---

## Índice

1. [Contexto del proyecto](#1-contexto-del-proyecto)
2. [Claude Design — Generación de mockups visuales](#2-claude-design--generación-de-mockups-visuales)
3. [Chat 1 — Stack tecnológico inicial](#3-chat-1--stack-tecnológico-inicial)
4. [Chat 2 — Sistema de gamificación](#4-chat-2--sistema-de-gamificación)
5. [Chat 3 — Documentación completa para Spec Driven Development](#5-chat-3--documentación-completa-para-spec-driven-development)
6. [Patrones que han funcionado bien](#6-patrones-que-han-funcionado-bien)
7. [Plantillas reutilizables](#7-plantillas-reutilizables)
8. [Documentos resultantes](#8-documentos-resultantes)
9. [Próximos pasos previsibles](#9-próximos-pasos-previsibles)

---

## 1. Contexto del proyecto

Se define un proyecto en Claude llamando motociudad y con instrucciones de project manager y adjutos sobre la generacion de diagramas, prd, historias de usurio, backlog y TDD

**MotoCiudad** es una app móvil colaborativa para motoristas urbanos que permite **encontrar, proponer y verificar parkings de moto** (públicos y privados) en cualquier ciudad. La información viene de la propia comunidad, con un sistema de gamificación (Octanos, niveles, insignias) que premia las contribuciones de calidad. Como elemento secundario, los usuarios pueden añadir POIs (talleres, ITV).


---

## 2. Claude Design — Generación de mockups visuales

**Herramienta**: Claude Design (entorno separado de Claude.ai, orientado a generación de UI y mockups visuales).
**Objetivo**: tener una propuesta visual de la app —pantallas iOS y Android— **antes** de empezar a documentar nada técnico, para que el resto de chats pudieran apoyarse en mocks reales y no en descripciones abstractas.

### 2.1 Prompt de creación del proyecto

Este fue el prompt que arrancó todo. Describe la idea sin restricciones técnicas, en lenguaje natural y conversacional:

```
Sera una App Movil como reto para mi que no he realizado ninguna antes
(me dedico mas a Saas), un tipo comunidad con usuarios que se mueven en
moto en la ciudad o que van a otras ciudades y quieren conocer los
parkings de motos publicos al aire libre y privados que no suelen venir
en google maps. La idea es que los usurios vayan propiendo donde estan
esos parkings (ya que no hay info de ello en ningun lado) y otros usuarios
verifique que exite, subiran foto del parking y se les dará como estrellas
para conseguir un nivel de usuario mas Top cada vez.

Como segundario se pueden proponer para moteros otros sitios interesantes
como serián talleres especializados

Se podra navegar hasta dichos puntos abriendo automaticamente la
aplicación de gmaps o apple maps segun el dispositivo y aplicaciones
del usuario

La idea es en un futuro despues de la finalizacion de este proyecto con
esto es que incluso los usuarios puedan hacer rutas y guardarlas y
compartirlas publicas y que unos usuarios puedan seguirse unos a otros
para estar atentos a publicacion de rutas, Tipo wikiloc pero para moteros
```

**Lo que generó**: un primer set de pantallas iOS y Android con:

- Pantalla de bienvenida con tagline
- Mapa con pins de parkings
- Lista filtrable de sitios cercanos
- Detalle de parking
- Detalle de taller (POI secundario)
- Perfil de usuario con sistema de "estrellas"
- Ranking básico
- Formulario de proponer parking
- Cámara de verificación

> **Lección clave**: la visión de futuro (rutas tipo Wikiloc, sistema de seguimiento entre usuarios) se incluyó en el prompt aunque NO sea parte del MVP. Esto sirvió para que los mockups dejaran espacio mental para esa expansión, pero los chats posteriores trataron esa parte como **non-goal explícito** del MVP. Sembrar el roadmap largo en el primer brief, sin pedir que se implemente, es útil para alinear estética y arquitectura sin contaminar el alcance.

### 2.2 Prompt de actualización con sistema de gamificación

Tras cerrar el `gamificacion.md` en Claude.ai (ver §4), volví a Claude Design para alinear los mockups con el sistema definitivo de Octanos / niveles / insignias:

```
Retoca el diseño para las partes que se refieren a los puntos o estrellas
de los usuarios para cambiarlo siguiendo este md, este sera el sistema
de puntuación, insignias para ver en el perfil de usuario, y ranking
```

(Adjunto: `gamificacion.md`)

**Lo que generó**: actualización de las pantallas de:

- **Perfil**: sustitución del sistema vago de "estrellas" por contador de **Octanos** (2.847), barra de progreso al siguiente nivel ("Cartógrafo → 1.154 octanos para Centinela"), stats (propuestos / verificados) y galería de insignias agrupadas por familia (Descubrimiento / Verificación / Comunidad / Temáticas).
- **Ranking**: tabs Madrid / Global / Amigos, sub-tabs Octanos del mes / Acumulado total, podio top 3 + lista paginada con avatar, nivel y Octanos.
- **Verificación in situ**: toast informativo en la cámara con el premio concreto (`+25 Octanos · +15 si eres el 1er verificador`).
- **Pin de detalle**: badge de "Verificado x12" para reflejar el conteo real del modelo.

> **Lección clave**: pedir el retoque de diseño **adjuntando el documento canónico de gamificación** garantiza que la UI refleja literalmente las reglas del sistema (nombres de niveles, baremos, familias de insignias) y no una interpretación libre. Esto facilita después que Claude Code traduzca los mocks a componentes sin tener que improvisar terminología.

### 2.3 Prompt de iconografía custom

Las primeras versiones de las insignias y el badge de nivel salieron como cuadrados con iconos genéricos, lo cual rompía la estética "tactical" del resto de la app:

```
diseña unos iconos chulos para las insignias y el nivel del usuario en
lugar de simples cuadrados con iconos basicos
```

**Lo que generó**: iconografía custom alineada con el branding:

- **Insignias hexagonales** con iluminación neón, distintas para cada familia (Descubrimiento en amarillo, Verificación en verde-cian, Comunidad en naranja, Temáticas más sobrias).
- **Badge de nivel** con forma de galón militar en la esquina del avatar, también hexagonal y con halo amarillo para los niveles altos.
- **Pins de mapa** revisados: amarillo neón con icono de moto para verificados, naranja con llave inglesa para talleres, gris con icono apagado para sin verificar.

> **Lección clave**: la iteración estética merece su propio prompt aislado. Pedirla junto con el resto del diseño suele dar resultados mediocres porque el modelo prioriza estructura sobre detalle. Una vez la estructura está bien, atacar el detalle visual con un prompt dedicado da un salto de calidad sin riesgo de romper lo anterior.

### 2.4 Activos finales del proyecto

Los mockups generados se descargaron como PNGs y forman parte del proyecto en `/mnt/project/`:

```
iOS_entrada.png             iOS_Verificar_parking.png
iOS_Mapa.png                iOS__Taller_POI_secundario_.png
iOS_Lista_filtrable.png     iOS_Proponer_parking.png
iOS_Detalle.png             Android_entrada.png
iOS_Perfil.png              Android_Mapa.png
iOS_Ranking.png             Android_Lista_filtrable.png
                            Android_Perfil.png
preview.webp (composición de pantallas para portada)
```

Estos 14 PNGs son los que se aportaron como input visual al Chat 3 (ver §5.2).

---

## 3. Chat 1 — Stack tecnológico inicial

**Fecha**: 7 mayo 2026
**Objetivo**: obtener una recomendación de stack técnico para arrancar el proyecto.

### 3.1 Prompt inicial

```
Necesito que me recomiendes un stack tecnologico para desarrollar esta
aplicacion móvil, aunque tendra una version web y backend para la api.
Asi mismo un backoffice minimo con un CRUD de usuarios y tambien un manejo
de los puntos propuestos o waypoints
```

**Lo que generó**: una primera propuesta con tres ejes:

- **Móvil**: React Native + Expo (managed workflow) + TypeScript
- **Backend / API**: Laravel 11 + Sanctum (aprovechando la zona de confort del promotor)
- **Web pública + Backoffice**: Next.js 15 (App Router) + shadcn/ui
- **Base de datos**: PostgreSQL 16 + PostGIS (sobre MySQL) por necesidades geoespaciales
- **Storage**: Cloudflare R2
- **Mapas**: Google Maps SDK
- **Push**: Expo Push Notifications

> **Nota**: este stack se reemplazó completamente en el Chat 3 cuando se reorientó el criterio hacia "lo que mejor se lleva con Claude Code" en lugar de "lo que ya domino". Ver §5.

---

## 4. Chat 2 — Sistema de gamificación

**Fecha**: 9 mayo 2026
**Objetivo**: diseñar el sistema de puntos, niveles e insignias antes de meter nada en el PRD.

### 4.1 Prompt inicial

```
Tenemos que encontrar como premiar a los usuarios de la app cuando proponen
un nuevo parking, cuando comenta, y cuando verifica que un parking propuesto
esta correcto.

que me propones, se me ocurren como niveles, e inignias para cada nivel,
como los llamamos? cuantos?
```

**Lo que generó**: marco de gamificación en tres capas (puntos / niveles / insignias) con propuestas concretas:

- **Moneda interna**: opciones (Kilómetros, Octanos, Karma Motero…)
- **Niveles**: 7 niveles, con tres sets de nombres alternativos (motero/explorador, gamberro, sobrio)
- **Tabla de puntos** por acción (proponer, verificar, comentar, etc.)
- **Reglas anti-abuso** desde el día 1 (cap diario, geofencing, moderación)
- **20 insignias** en 4 familias (Descubrimiento, Verificación, Comunidad, Temáticas)

### 4.2 Prompt de cierre

Tras una serie de preguntas que el promotor pospuso para más tarde, vino este prompt directo:

```
De momento hazce un md con el sistema de puntos y niveles que es de lo que
se trata este chat
```

**Lo que generó**: el archivo `gamificacion.md` que ahora vive en el proyecto. Define:

- Octanos como moneda interna
- 7 niveles: Pipiolo → Rodador → Buscaplazas → Cartógrafo → Centinela → Maestro Motero → Leyenda del Asfalto
- Niveles solo suben (sin degradación)
- Tabla completa de acciones puntuables
- Reglas anti-abuso (cap diario 200 Octanos, geofence ≤100m, foto con timestamp ≤5min)
- 20 insignias en 4 familias
- Rankings global / ciudad / amigos, con dos métricas (totales y mensuales)
- Modelo de datos SQL listo para implementar
- Non-goals explícitos (no canjes monetarios, no compras in-app, no PvP…)
- KPIs de éxito a 3 meses

> **Lección clave**: cerrar gamificación **antes** del PRD evita que el sistema de puntos contamine decisiones de producto. El `gamificacion.md` se convirtió en input fijo para el siguiente chat.

---

## 5. Chat 3 — Documentación completa para Spec Driven Development

**Fecha**: 9 mayo 2026
**Objetivo**: generar el set completo de documentos de especificación para que Claude Code pueda construir el proyecto.

### 5.1 Prompt inicial

```
Documenta correctamente el proyecto, necesito estos archivos y tienen que
tener en cuenta el gamificacion.md para el sistema de puntacion y usa el
mejor stack que consideres ya que es un proyecto para un master de IA y va
a programarse a traves de claude code y de especificaciones, no tengo
porque saber de la tecnologia a usar, usa la que consideres mas adecuada

prd.md
arquitectura.md
modelo-datos.md
testing.md
infraestructura.md
```

**Cambio de criterio importante respecto al Chat 1**: aquí el promotor explícitamente delega la decisión técnica.

### 5.2 Prompt de apoyo visual

```
puedes tener en cuanta si lo necestas los screenshots de diseño
```

**Por qué importa**: los 14 screenshots PNG generados en Claude Design (ver §2) aportaron información que ningún texto podía dar:

- Estética dark + acento amarillo neón (#D4FF00)
- Naming tentativo: **MotoCiudad**
- Tagline: *"Aparcar la moto. Sin volverse loco."*
- 5 tabs con botón central de "Aportar" destacado
- Iconografía minimal estilo "tactical" con insignias hexagonales

### 5.3 Prompt que cerró el stack

Tras una pregunta sobre backend (Laravel / NestJS / Supabase / "tú decides"), la respuesta fue:

```
Usa el stack con el que claude code mejor se maneje. No pienses en lo
que dominio sino en lo mejor para este proyecto de mobile app
```

**Stack final elegido** (justificado en `arquitectura.md`):

```
Mobile      : React Native + Expo SDK 52 + TypeScript strict
State       : Zustand (cliente) + TanStack Query v5 (servidor)
Styling     : NativeWind 4 (Tailwind para RN)
Mapas       : react-native-maps (Apple Maps iOS / Google Maps Android)
Cámara      : expo-camera
Backend     : Supabase Cloud Free (PostgreSQL 15 + PostGIS + Auth +
              Storage + Edge Functions Deno)
Validación  : Zod (cliente y edge)
Tests       : Vitest, RN Testing Library, Maestro (E2E), pgTAP (RLS)
CI/CD       : GitHub Actions + EAS Build + EAS Update (OTA)
Observ.     : Sentry + PostHog (cloud EU)
```

**Razones declaradas**:

- TypeScript end-to-end → Claude Code rinde mejor en stacks homogéneos
- PostgreSQL + PostGIS nativo en Supabase → necesario para queries geoespaciales
- Cero infra que mantener (Auth, Storage, Realtime, Edge Functions todo gestionado)
- Edge Functions en Deno/TS → la lógica anti-abuso de Octanos vive cerca de los datos
- OTA updates con EAS → fixes en producción sin pasar por App Store/Play Store

**Lo que generó**: 7 documentos canónicos:

1. **`prd.md`** — Producto, problema, personas, features, flujos críticos
2. **`arquitectura.md`** — Decisiones técnicas, stack, diagramas, rationale
3. **`modelo-datos.md`** — Schema SQL completo, RLS policies, funciones, triggers
4. **`testing.md`** — Estrategia (unit, integration, E2E con Maestro, pgTAP para RLS)
5. **`infraestructura.md`** — Hosting, deployment, CI/CD, costes
6. **`CLAUDE.md`** — Instrucciones de proyecto para Claude Code
7. **`AGENTS.md`** — Subagentes especializados del proyecto

### 5.4 Prompts complementarios para entrega académica

A medida que el máster pidió apartados específicos, se generaron documentos adicionales:

#### Componentes principales

```
Ahora me piden esto

Descripción de componentes principales
```

→ Generó **`componentes-principales.md`** con 9 componentes funcionales + 3 transversales, sitemap completo en Mermaid, y mapeo cruzado componente ↔ documento canónico.

#### Estructura de ficheros

```
sobre la arquitectura necesito una

Descripción de alto nivel del proyecto y estructura de ficheros

Representa la estructura del proyecto y explica brevemente el propósito
de las carpetas principales, así como si obedece a algún patrón o
arquitectura específica.
```

→ Generó **`estructura-proyecto.md`** con árbol completo del monorepo (apps/mobile, supabase, docs, .github, .claude), explicación de cada carpeta y patrones aplicados (BaaS, Feature-Based Architecture, Layered, File-Based Routing, Spec-Driven, Migration-First, Defense in Depth, Monorepo, AI-Assisted Development).

#### Entidades del modelo de datos

```
sobre el modelo de datos necesito responder esto

3.2. Descripción de entidades principales:

Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo
de cada atributo, descripción breve si procede, claves primarias y foráneas,
relaciones y tipo de relación, restricciones (unique, not null…), etc.
```

→ Generó **`entidades-principales.md`** con tabla por entidad (atributos, tipos, restricciones, claves, relaciones), distinguiendo cachés derivadas de fuente de verdad y restricciones SQL de invariantes de negocio.

#### Especificación API

```
4. Especificación de la API

Si tu backend se comunica a través de API, describe los endpoints
principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir
un ejemplo de petición y de respuesta para mayor claridad
```

→ Generó **`especificacion-api.md`** en formato OpenAPI 3.1 con tres endpoints representativos: lectura geoespacial (nearby_parkings), escritura simple con RLS (proponer parking) y escritura crítica con anti-abuso (verificar via Edge Function).

---

## 6. Patrones que han funcionado bien

Observaciones de los 3 chats + Claude Design para futuros proyectos similares.

### 6.1 Mockups visuales antes que documentación

Empezar por **Claude Design** generando mockups visuales reales (no wireframes abstractos) cambió la calidad de los chats posteriores. Cuando Claude.ai vio los PNGs, dedujo de un vistazo:

- Naming, tagline y tono de marca
- Estructura de navegación (5 tabs, botón central destacado)
- Estética dark + acento neón (que se convirtió en token de Tailwind sin discusión)
- Vocabulario UI ("Llévame", "Encuadra tu moto", "Verifica + sube foto")

Sin estos mockups, las decisiones de diseño habrían sido un ping-pong de preguntas y respuestas.

### 6.2 Cerrar piezas pequeñas antes que el PRD grande

Definir **gamificación primero** (Chat 2) antes que el PRD completo (Chat 3) evitó decisiones contradictorias. El `gamificacion.md` ya existía cuando empezó el chat de documentación, así que actuó como input fijo y no como variable abierta.

### 6.3 Delegar la decisión técnica cuando no hay criterio claro

La frase clave fue:

> *"Usa el stack con el que claude code mejor se maneje. No pienses en lo que dominio sino en lo mejor para este proyecto de mobile app"*

Esto reorientó la recomendación de Laravel (zona de confort) a Supabase (mejor encaje con el caso de uso y con desarrollo asistido por IA).

### 6.4 Aislar prompts de iteración estética

En Claude Design, pedir el detalle visual (iconos custom de insignias, badges hexagonales) **en un prompt separado**, una vez la estructura ya estaba bien, dio mejores resultados que pedirlo todo a la vez. Aplica también a documentación: "primero contenido correcto, después pulido visual" es un patrón general.

### 6.5 Pedir documentos uno a uno conforme los exige el contexto

En lugar de pedir "todo el TFM ya", se fue pidiendo cada apartado conforme el máster los requería. Esto generó documentos más enfocados y permitió iterar sobre la estructura de carpetas (`componentes-principales.md`, `estructura-proyecto.md`, `entidades-principales.md` salieron como archivos separados, no como secciones enterradas).

### 6.6 Mantener documentación canónica auto-actualizable

`CLAUDE.md` y `AGENTS.md` incluyen la instrucción explícita:

> *"Si Claude Code (o cualquier subagente) detecta que una decisión técnica nueva contradice o complementa los documentos canónicos, debe proponer la actualización del documento correspondiente en el mismo PR."*

Esto cierra el círculo del Spec Driven Development: el código y las specs no pueden divergir.

---

## 7. Plantillas reutilizables

Prompts genéricos extraídos de la experiencia para reusar en futuros proyectos.

### 7.1 Brief inicial para Claude Design

```
Será una app móvil [/web/etc] tipo [comparable conocido] para [target]
que necesita [problema concreto a resolver].

Funcionalidad principal:
- [acción 1]
- [acción 2]
- [acción 3]

Como secundario:
- [acción opcional 1]
- [acción opcional 2]

Visión a largo plazo (no implementar ahora, solo dejar espacio):
- [feature futura 1]
- [feature futura 2]

Genera mockups iOS y Android de las pantallas principales.
```

### 7.2 Recomendación de stack para nuevo proyecto

```
Tengo idea para una [tipo de aplicación] que [resumen funcional].
Mi perfil técnico actual es [stack que dominas].
Quiero aprovechar este proyecto para aprender [stack objetivo].

Recomiéndame el stack óptimo considerando:
- Mejor encaje con el caso de uso (no con mi zona de confort)
- Compatibilidad con desarrollo asistido por IA (Claude Code, agentes)
- Velocidad de iteración en MVP
- Coste razonable en infraestructura

Justifica cada decisión y advierte de los principales trade-offs.
```

### 7.3 Diseño de sistema de gamificación

```
La app necesita un sistema de gamificación que premie [acciones clave].

Propón un marco que incluya:
- Moneda interna (con opciones de naming)
- Niveles (cuántos, nombres, umbrales)
- Insignias (familias y ejemplos)
- Reglas anti-abuso desde el día 1
- Modelo de datos SQL para implementarlo
- Non-goals explícitos para evitar scope creep
- KPIs para validar el sistema

Genera un archivo gamificacion.md autocontenido que sirva como input
para el PRD posterior.
```

### 7.4 Sincronización de mockups con sistema definitivo

```
Retoca el diseño para las partes que se refieren a [sistema concreto:
puntos / niveles / categorías / etc] siguiendo este md adjunto, este
sera el sistema definitivo de [puntuación / clasificación / etc].
```

(Adjuntar el archivo `.md` con las reglas cerradas)

### 7.5 Iteración estética de iconografía

```
Diseña unos iconos chulos para [insignias / niveles / pins / etc] en
lugar de [problema observado en la versión anterior, ej: "simples
cuadrados con iconos basicos"].
```

> Lanzar este prompt **después** de tener la estructura validada da mejores resultados que pedir el detalle visual desde el principio.

### 7.6 Generación de PRD para Spec Driven Development

```
Documenta correctamente este proyecto para Spec Driven Development con
Claude Code. Necesito estos archivos:

- prd.md (qué construimos y por qué)
- arquitectura.md (stack, decisiones técnicas, rationale)
- modelo-datos.md (schema SQL, RLS, índices)
- testing.md (estrategia y herramientas)
- infraestructura.md (hosting, CI/CD, costes)
- CLAUDE.md (instrucciones para Claude Code, basado en code.claude.com/docs)
- AGENTS.md (subagentes y skills personalizadas del proyecto)

Inputs adicionales:
- [archivo.md de gamificación si aplica]
- [screenshots de diseño si los hay]

Reglas:
- Stack: usa el que mejor se lleve con Claude Code
- Documentos modulares con criterios de aceptación verificables
- Secciones explícitas de "non-goals" y "decisiones cerradas / pendientes"
- CLAUDE.md y AGENTS.md deben incluir la regla de auto-mantener
  los documentos cuando el código diverja
```

### 7.7 Documentos académicos a partir del PRD

```
Sobre el [área del proyecto] necesito responder al apartado del máster:

[pegar el enunciado tal cual del documento del máster]

Genera un documento dedicado [nombre.md] con el formato académico
exigido, alineado con el resto de PRDs del proyecto y con tabla de
referencias cruzadas a los documentos canónicos donde aplique.
```

### 7.8 Restauración / sincronización de documentación

```
He perdido [archivos.md]. Vuelve a la versión que generaste anteriormente
con el stack [stack acordado], aplicando los siguientes ajustes:

- [ajuste 1]
- [ajuste 2]

Mantén el resto sin cambios. Indica explícitamente al final qué has
modificado y qué has dejado intacto.
```

---

## 8. Documentos resultantes

Tras los 3 chats + Claude Design, el proyecto cuenta con esta documentación viva:

| Documento / Activo | Contenido | Origen |
|---|---|---|
| 14 mockups PNG (iOS y Android) | Pantallas de la app: entrada, mapa, lista, detalle, perfil, ranking, proponer, verificar, taller | Claude Design |
| `preview.webp` | Composición visual para portada | Claude Design |
| `gamificacion.md` | Sistema de Octanos, niveles, insignias, rankings | Chat 2 |
| `prd.md` | Producto, problema, personas, features, flujos | Chat 3 |
| `arquitectura.md` | Stack, diagramas, decisiones técnicas | Chat 3 |
| `modelo-datos.md` | Schema SQL, RLS, funciones | Chat 3 |
| `testing.md` | Estrategia y herramientas de testing | Chat 3 |
| `infraestructura.md` | Hosting, CI/CD, costes (plan Free) | Chat 3 |
| `CLAUDE.md` | Instrucciones de proyecto para Claude Code | Chat 3 |
| `AGENTS.md` | Subagentes (`prd-keeper`, `migration-builder`, etc.) | Chat 3 |
| `componentes-principales.md` | Mapa de componentes y sitemap | Chat 3 |
| `estructura-proyecto.md` | Estructura de ficheros y patrones | Chat 3 |
| `entidades-principales.md` | Detalle académico de cada entidad | Chat 3 |
| `especificacion-api.md` | OpenAPI 3.1 de los 3 endpoints clave | Chat 3 |
| `prompts.md` | Este documento | Bitácora |

---
