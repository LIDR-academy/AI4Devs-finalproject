# catalog-inventory Specification

## Purpose
Gobierna el catálogo y el inventario físico: la separación entre Set (obra del catálogo) y Copy (unidad física), qué ve el público de cada Set, y la máquina de estados por la que pasa una copia a lo largo de su vida.

## Requirements
### Requirement: Modelo Set y Copia
El sistema SHALL distinguir entre **Set** (modelo de catálogo, con atributos como
foto, nº de piezas, edad recomendada, tema y dificultad) y **Copia** (unidad física
concreta que la empresa posee). Un Set puede tener varias Copias.

#### Scenario: Varias copias de un set popular
- **WHEN** el admin adquiere una segunda copia de un Set existente
- **THEN** ambas copias se asocian al mismo Set
- **AND** cada copia mantiene su propio estado de ciclo de vida de forma
  independiente

### Requirement: Proyección pública del catálogo
El sistema SHALL exponer el catálogo en dos proyecciones. La **pública** (visitante,
sin autenticar) muestra únicamente Sets publicados con sus atributos de catálogo
(foto, nº de piezas, edad recomendada, tema, dificultad) y **oculta la disponibilidad
y la posición/estado en la cola de reservas**. La **autenticada** (suscriptor) añade
la disponibilidad de copias y la posición/estado en la cola. El estado a nivel de
`Copy` nunca se expone en la proyección pública.

#### Scenario: Visitante ve el catálogo sin disponibilidad
- **WHEN** un usuario no autenticado consulta el catálogo o el detalle de un Set
- **THEN** ve los atributos de catálogo de los Sets publicados
- **AND** no ve la disponibilidad de copias ni la posición en cola

#### Scenario: Suscriptor ve la disponibilidad
- **WHEN** un suscriptor autenticado consulta el detalle de un Set
- **THEN** ve además la disponibilidad de copias y su posición/estado en la cola de
  reservas

### Requirement: Valor de referencia del Set
El sistema SHALL almacenar un valor de referencia (coste de reposición) por Set,
usado para calcular el precio del alquiler puntual (ver `subscriptions`) y como
base documental ante incidencias de pérdida o daño irreparable. Calcular o cobrar
una penalización económica automática queda fuera de alcance del MVP (ver
`proposal.md`); el dato se guarda para poder usarlo más adelante y para fundamentar
reclamaciones.

#### Scenario: Set sin valor de referencia
- **WHEN** el admin intenta publicar un Set en el catálogo sin valor de referencia
- **THEN** la publicación es rechazada hasta completar el dato

### Requirement: Ciclo de vida de la copia
El sistema SHALL gestionar el estado de cada copia según los estados: `INTAKE`,
`DISPONIBLE`, `OFRECIDA`, `ALQUILADA`, `EN_DEVOLUCION`, `EN_INSPECCION`,
`EN_HIGIENIZACION`, `INCOMPLETA` y `BAJA`, con transiciones válidas únicamente las
definidas.

#### Scenario: Alta de una copia
- **WHEN** un operador da de alta una copia y completa su catalogación
- **THEN** la copia pasa de `INTAKE` a `DISPONIBLE`

#### Scenario: Inspección con resultado correcto
- **WHEN** una copia en `EN_INSPECCION` pasa la verificación de completitud
- **THEN** transita a `EN_HIGIENIZACION`

#### Scenario: Inspección detecta piezas faltantes
- **WHEN** una copia en `EN_INSPECCION` presenta piezas faltantes
- **THEN** transita a `INCOMPLETA`

#### Scenario: Copia incompleta repuesta
- **WHEN** una copia `INCOMPLETA` recibe las piezas que faltaban
- **THEN** transita a `EN_HIGIENIZACION` antes de volver a `DISPONIBLE`

#### Scenario: Higienización completada
- **WHEN** una copia en `EN_HIGIENIZACION` termina su limpieza
- **THEN** transita a `DISPONIBLE`, o a `OFRECIDA` si el Set tiene cola

#### Scenario: Daño irreparable o pérdida
- **WHEN** una copia sufre daño irreparable, o no es devuelta por pérdida o
  sustracción
- **THEN** un `ADMIN` la transita a `BAJA` y deja de contar en el inventario
  disponible

### Requirement: Transiciones inválidas rechazadas
El sistema SHALL rechazar cualquier transición de estado no contemplada en el ciclo
de vida.

#### Scenario: Saltar inspección
- **WHEN** se intenta pasar una copia de `EN_DEVOLUCION` directamente a
  `DISPONIBLE`
- **THEN** la transición es rechazada

