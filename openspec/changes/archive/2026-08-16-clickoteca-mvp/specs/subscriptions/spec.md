# Spec: subscriptions

## ADDED Requirements

### Requirement: Planes de suscripción
El sistema SHALL ofrecer dos planes: `BASIC` (hasta 1 set en alquiler simultáneo) y
`PREMIUM` (hasta 2 sets en alquiler simultáneo).

#### Scenario: Límite de sets del plan basic
- **WHEN** un suscriptor `BASIC` tiene 1 set en alquiler
- **THEN** no puede solicitar ni recibir otro set hasta liberar el actual

#### Scenario: Límite de sets del plan premium
- **WHEN** un suscriptor `PREMIUM` tiene 2 sets en alquiler
- **THEN** no puede solicitar ni recibir un tercer set hasta liberar uno

### Requirement: Precio de los planes y del alquiler puntual
El sistema SHALL asociar un precio mensual configurable a cada plan (`BASIC`,
`PREMIUM`) y una fórmula de precio para el alquiler puntual, usados para reportes
y para poder evaluar si el suscriptor está "al corriente de pago" (el cobro real
queda fuera de alcance del MVP, ver `proposal.md`).

#### Scenario: Precio de planes por defecto
- **WHEN** se configura el sistema por primera vez
- **THEN** el plan `BASIC` tiene un precio por defecto de 14,99€/mes y el plan
  `PREMIUM` de 24,99€/mes, ambos configurables por el admin

#### Scenario: Precio del alquiler puntual
- **WHEN** un usuario no suscrito solicita un alquiler puntual de un Set
- **THEN** el precio se calcula como un porcentaje configurable del valor de
  referencia del Set (ver `catalog-inventory`), con un mínimo configurable

### Requirement: Devolución previa obligatoria para nuevo set
El sistema SHALL impedir que un suscriptor solicite un nuevo set mientras una
devolución previa no esté completada, es decir, hasta que la copia devuelta esté en
estado `DISPONIBLE`.

#### Scenario: Solicitud bloqueada por devolución en curso
- **WHEN** un suscriptor tiene una copia en `EN_DEVOLUCION`, `EN_INSPECCION` o
  `EN_HIGIENIZACION`
- **THEN** esa copia sigue contando contra su límite de plan
- **AND** no puede solicitar un nuevo set que exceda dicho límite

### Requirement: Antigüedad mínima para sets restringidos
El sistema SHALL permitir al admin marcar sets como restringidos (por
precio/categoría) y exigir una antigüedad mínima de suscripción (p. ej. 3 meses)
para poder alquilarlos.

#### Scenario: Suscriptor reciente intenta un set restringido
- **WHEN** un suscriptor con menos de la antigüedad mínima intenta alquilar un set
  restringido
- **THEN** la solicitud es rechazada indicando el requisito de antigüedad

### Requirement: Retención del set y al corriente de pago
El sistema SHALL permitir retener un set mientras dure la suscripción y el
suscriptor esté al corriente de pago.

#### Scenario: Recordatorios amables en sets solicitados
- **WHEN** un set retenido tiene otros suscriptores en cola y el admin ha activado
  recordatorios para ese set
- **THEN** el sistema envía recordatorios amables al suscriptor que lo retiene cada
  X días (configurable)

### Requirement: No cancelar ni pausar con un set fuera
El sistema SHALL impedir pausar o cancelar la suscripción mientras el suscriptor
tenga alguna copia en su poder; la devolución es obligatoria.

#### Scenario: Intento de cancelación con set fuera
- **WHEN** un suscriptor con una copia `ALQUILADA` intenta cancelar o pausar
- **THEN** la acción es rechazada y se le indica que debe devolver primero

### Requirement: Alquiler puntual sin suscripción
El sistema SHALL ofrecer, como opción extra, el alquiler puntual de un set por un
periodo determinado sin necesidad de suscripción.

#### Scenario: Alquiler puntual
- **WHEN** un usuario no suscrito alquila un set de forma puntual
- **THEN** recibe la copia por el periodo pactado y debe devolverla al finalizar
