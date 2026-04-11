# User stories · Reading Analytics Platform

**Versión:** 1.0  
**Owner:** Celia (Founder / Product Owner)  
**Fecha:** abril 2026

---

## Índice

1. [User Story 1 · Añadir libro mediante búsqueda automática](#user-story-1--añadir-libro-mediante-búsqueda-automática)
2. [User Story 2 · Gestión de TBR mensual](#user-story-2--gestión-de-tbr-mensual)
3. [User Story 3 · Meta anual de lectura](#user-story-3--meta-anual-de-lectura)
4. [User Story 4 · Visualización de estadísticas mensuales](#user-story-4--visualización-de-estadísticas-mensuales)
5. [User Story 5 · Insights automáticos](#user-story-5--insights-automáticos)

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

## User Story 4 · Visualización de estadísticas mensuales

| Campo | Valor |
| --- | --- |
| **Título** | Consultar dashboard de estadísticas mensuales |

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

## User Story 5 · Insights automáticos

| Campo | Valor |
| --- | --- |
| **Título** | Generación automática de insights de lectura |

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
