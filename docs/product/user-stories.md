# User stories · Reading Analytics Platform

**Versión:** 1.0  
**Owner:** Celia (Founder / Product Owner)  
**Fecha:** abril 2026

---

## Índice

1. [User Story 1 · Añadir libro mediante búsqueda automática](#user-story-1--añadir-libro-mediante-búsqueda-automática)
2. [User Story 2 · Gestión de TBR mensual](#user-story-2--gestión-de-tbr-mensual)
3. [User Story 3 · Meta anual de lectura](#user-story-3--meta-anual-de-lectura)
4. [User Story 4 · Gestionar estado, puntuación y fechas en Book Tracker](#user-story-4--gestionar-estado-puntuación-y-fechas-en-book-tracker)
5. [User Story 5 · Visualización de estadísticas mensuales](#user-story-5--visualización-de-estadísticas-mensuales)
6. [User Story 6 · Insights automáticos](#user-story-6--insights-automáticos)

---

## User Story 1 · Añadir libro mediante búsqueda automática

| Campo | Valor |
| --- | --- |
| **Título** | Añadir libro con autocompletado y selección de edición |

### Historia

Como **lectora orientada a datos**, quiero **buscar un libro por título o autora y añadirlo automáticamente a mi tracker**, para **evitar introducir manualmente todos los datos**.

### Criterios de aceptación (BDD)

#### Escenario 1

- **Dado** que estoy en la página *Book Tracker*
- **Cuando** hago clic en **«Añadir libro»**
- **Entonces** se abre un modal con un buscador por título o autora

#### Escenario 2

- **Dado** que he introducido un título válido
- **Cuando** el sistema encuentra varias ediciones
- **Entonces** puedo seleccionar la edición concreta que estoy leyendo

#### Escenario 3

- **Dado** que selecciono una edición
- **Cuando** confirmo el guardado
- **Entonces** el libro aparece en mi tracker con portada, autora, páginas y género

### Estimación

**M**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Sí; no depende de stats o listas |
| **Negotiable** | La fuente de datos puede cambiar |
| **Valuable** | Altísimo valor; reduce fricción |
| **Estimable** | Tamaño claro |
| **Small** | Cabe en un sprint |
| **Testable** | Fácilmente validable con BDD |

---

## User Story 2 · Gestión de TBR mensual

| Campo | Valor |
| --- | --- |
| **Jira** | [KAN-10](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-10) |
| **Título** | Crear y gestionar TBR mensual automático |

### Historia

Como **lectora frecuente**, quiero **tener una lista TBR mensual creada automáticamente**, para **organizar qué libros quiero leer cada mes**.

### Criterios de aceptación (BDD)

#### Escenario 1

- **Dado** que comienza un nuevo mes
- **Cuando** accedo a la sección *Lists*
- **Entonces** veo creada automáticamente la lista «TBR [mes siguiente]»

#### Escenario 2

- **Dado** que la lista TBR está vacía
- **Cuando** entro en la lista
- **Entonces** el sistema me anima a añadir libros

#### Escenario 3

- **Dado** que termino un libro que está en el TBR del mes actual
- **Cuando** actualizo su estado a «leído»
- **Entonces** el libro se marca automáticamente como completado en la checklist

### Estimación

**M**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Depende solo del modelo de listas |
| **Negotiable** | Copy y prompts pueden ajustarse |
| **Valuable** | Caso de uso core |
| **Estimable** | Reglas claras |
| **Small** | Implementable por módulos |
| **Testable** | Estados verificables |

---

## User Story 3 · Meta anual de lectura

| Campo | Valor |
| --- | --- |
| **Título** | Definir y visualizar objetivo anual |
| **Jira** | [KAN-11](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-11) |
| **UC** | UC-06 |

### Historia

Como **lectora que sigue su progreso**, quiero **establecer una meta anual de libros**, para **medir si voy cumpliendo mi objetivo lector**.

### Criterios de aceptación (BDD)

#### Escenario 1

- **Dado** que estoy en la Home
- **Cuando** configuro una meta anual de 50 libros
- **Entonces** el sistema guarda el objetivo

#### Escenario 2

- **Dado** que he leído 20 libros
- **Cuando** visualizo la card de objetivo
- **Entonces** veo «20 / 50» y el porcentaje correspondiente

#### Escenario 3

- **Dado** que existen datos suficientes del año
- **Cuando** consulto la meta
- **Entonces** el sistema muestra una predicción de cumplimiento basada en mi ritmo actual

### Estimación

**S**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Depende solo del contador de lecturas |
| **Negotiable** | El forecast puede evolucionar |
| **Valuable** | Muy relevante para retención |
| **Estimable** | Simple |
| **Small** | Ideal para sprint |
| **Testable** | Cálculo determinista |

---

## User Story 4 · Gestionar estado, puntuación y fechas en Book Tracker

| Campo | Valor |
| --- | --- |
| **ID** | US-04 |
| **Jira** | [KAN-12](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-12) |
| **Título** | Gestionar estado, puntuación y fechas de un libro en Book Tracker |
| **UC** | UC-02, UC-04 (parcial: sin etiquetas) |

### Historia

Como **lectora orientada a datos**, quiero **poder cambiar el estado de mis libros, puntuarlos y gestionar sus fechas de lectura directamente desde el Book Tracker**, para **mantener mi biblioteca actualizada y alimentar correctamente mis estadísticas y dashboards**.

### Contexto

Esta historia cubre el ciclo de vida de un libro **una vez está en la biblioteca**. Es la base de las estadísticas (UC-07), el progreso del TBR (UC-05) y la meta anual (UC-06), ya que los KPIs se calculan a partir del estado `leido` y la fecha `finished_on`.

**Alcance de esta historia:** escenarios 1–7 únicamente. Los efectos sobre TBR y Goals se implementan en historias dependientes (escenario 8 → KAN-13; escenario 9 → KAN-14). El progreso por página (UC-03) y las etiquetas del modal UC-04 quedan fuera de alcance.

### Estados disponibles

| Estado | Descripción |
| --- | --- |
| `pendiente` | En lista de espera; estado por defecto al añadir un libro |
| `leyendo` | Lectura activa en curso |
| `leido` | Libro finalizado; computa en estadísticas y meta anual |
| `dnf` | Did Not Finish — lectura abandonada |

### Criterios de aceptación (BDD) — en alcance

#### Escenario 1 · Cambiar estado desde el tracker (UC-02)

- **Dado** que tengo un libro en la tabla del Book Tracker
- **Cuando** selecciono un nuevo estado desde el selector de la fila
- **Entonces** el estado se actualiza de forma inmediata sin recargar la página

#### Escenario 2 · Activar fechas al pasar a «Leyendo»

- **Dado** que un libro está en estado `pendiente`
- **Cuando** cambio su estado a `leyendo`
- **Entonces** el campo fecha de inicio se autocompleta con la fecha de hoy y queda editable

#### Escenario 3 · Modal de finalización al marcar como «Leído» (UC-04)

- **Dado** que un libro está en estado `leyendo`
- **Cuando** cambio su estado a `leido`
- **Entonces** se abre un modal de finalización que permite confirmar o editar: fecha de fin (por defecto hoy), formato de lectura (Físico / Ebook / Audio) y puntuación de 1 a 5 estrellas

#### Escenario 4 · Cerrar modal sin puntuar

- **Dado** que se ha abierto el modal de finalización
- **Cuando** lo cierro sin completar los campos opcionales
- **Entonces** el libro queda en estado `leido` pero sin puntuación, formato ni fecha de fin, completables más adelante desde la fila del tracker

#### Escenario 5 · Puntuar un libro ya leído

- **Dado** que un libro tiene estado `leido` pero no tiene puntuación
- **Cuando** edito la celda de puntuación directamente en la fila
- **Entonces** puedo asignar una valoración de 1 a 5 estrellas de forma inline sin abrir modal

#### Escenario 6 · Editar fechas de lectura

- **Dado** que un libro tiene estado `leyendo`, `leido` o `dnf`
- **Cuando** hago clic en el campo de fecha de inicio (en esos estados) o de fecha de fin (solo `leyendo` o `leido`) en la fila
- **Entonces** puedo editar la fecha en modo inline con un date picker

#### Escenario 7 · Validación de fechas

- **Dado** que estoy editando las fechas de un libro
- **Cuando** introduzco una fecha de fin anterior a la fecha de inicio
- **Entonces** el sistema muestra un error de validación y no guarda el valor

### Criterios de aceptación — fuera de alcance (historias dependientes)

| Escenario | Dependencia |
| --- | --- |
| 8 · Efecto en TBR al marcar `leido` | [KAN-13](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-13) (`TBRService`, tablas `monthly_tbr_lists` / `tbr_entries`; infra KAN-10) |
| 9 · Efecto en meta anual | [KAN-14](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-14) (subtarea KAN-11: `GoalsService`, tabla `annual_reading_goals`; invalidación caché Home al marcar `leido`) |

### Notas técnicas

- **API:** `PATCH /v1/books/{bookId}/reading-record` — campos mutables: `status`, `started_on`, `finished_on`, `rating`, `read_format`
- **Respuesta:** `meta.openCompletionModal: true` al transicionar a `leido`; `meta.tbrAutoCompleted` en escenario 8 → KAN-13
- **Persistencia:** tabla `reading_records` (1:1 con `books`)
- **UI:** edición inline en tabla; modal solo en transición a `leido`; invalidación de caché TanStack Query; accesibilidad teclado en selector y estrellas (WCAG 2.1 AA)

### Estimación

**L**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Depende de US-01 (libro en biblioteca); no requiere TBR ni Goals |
| **Negotiable** | Modal y columnas de tabla pueden ajustarse |
| **Valuable** | Crítico para MVP; desbloquea stats y objetivos |
| **Estimable** | Alcance acotado a escenarios 1–7 |
| **Small** | Grande; conviene OpenSpec + backend antes que frontend |
| **Testable** | BDD por escenario; tests de integración en PATCH |

---

## User Story 5 · Visualización de estadísticas mensuales

| Campo | Valor |
| --- | --- |
| **ID** | US-05 |
| **Jira** | [KAN-15](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-15) |
| **Título** | Consultar dashboard de estadísticas mensuales |
| **UC** | UC-07 (KPIs y gráficos; sin insights — ver US-06) |
| **Estado** | Implementado — `GET /v1/stats/{year}/{month}` y página `/stats` (ver `openspec/changes/kan-15-monthly-stats-dashboard/`) |

### Historia

Como **lectora apasionada por los datos**, quiero **ver mis estadísticas de lectura por mes**, para **analizar mis hábitos y evolución**.

### Criterios de aceptación (BDD)

#### Escenario 1

- **Dado** que tengo libros registrados en el mes actual
- **Cuando** entro en *Reading Stats*
- **Entonces** veo el número de libros y páginas leídas

#### Escenario 2

- **Dado** que existen libros con distintos géneros
- **Cuando** se carga la página
- **Entonces** veo un gráfico de distribución por géneros

#### Escenario 3

- **Dado** que cambio el filtro de mes
- **Cuando** selecciono otro periodo
- **Entonces** los gráficos se actualizan con los datos correspondientes

### Estimación

**L**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Necesita datos previos, pero es funcionalmente separable |
| **Negotiable** | Los charts concretos pueden cambiar |
| **Valuable** | Propuesta de valor principal |
| **Estimable** | Complejidad alta pero clara |
| **Small** | Más grande; probablemente dividir en subtareas técnicas |
| **Testable** | Outputs medibles |

---

## User Story 6 · Insights automáticos

| Campo | Valor |
| --- | --- |
| **ID** | US-06 |
| **Jira** | [KAN-16](https://privaterelay-team-ymuts08n.atlassian.net/browse/KAN-16) |
| **Título** | Generación automática de insights de lectura |
| **UC** | UC-07 (insights automáticos) |

### Historia

Como **lectora que disfruta analizando patrones**, quiero **recibir insights automáticos sobre mis lecturas**, para **descubrir tendencias y progreso de forma rápida**.

### Criterios de aceptación (BDD)

#### Escenario 1

- **Dado** que tengo datos del mes actual
- **Cuando** entro en *Reading Stats*
- **Entonces** el sistema muestra al menos 3 insights automáticos

#### Escenario 2

- **Dado** que este mes he leído más que el anterior
- **Cuando** se generan los insights
- **Entonces** uno refleja el incremento porcentual

#### Escenario 3

- **Dado** que un género es dominante
- **Cuando** se muestran los insights
- **Entonces** el sistema destaca ese género como tendencia principal

### Estimación

**M**

### Evaluación INVEST

| Criterio | Valoración |
| --- | --- |
| **Independent** | Puede construirse sobre la capa de analytics |
| **Negotiable** | Copy e inteligencia evolucionables |
| **Valuable** | Alto componente *delight* |
| **Estimable** | Lógica definida |
| **Small** | Razonable |
| **Testable** | Reglas verificables |

---

*Documento alineado con el PRD · Reading Analytics Platform*
