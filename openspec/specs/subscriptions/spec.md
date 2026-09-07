# subscriptions Specification

## Purpose
Define el acceso al servicio por suscripción: los planes y su precio, la suscripción que nace con el alta, el cambio de plan, y las reglas de elegibilidad que determinan cuándo un suscriptor puede llevarse otro set o dejar de pagar.
## Requirements
### Requirement: Planes de suscripción
El sistema SHALL ofrecer dos planes: `BASIC` (hasta 1 set en alquiler simultáneo) y
`PREMIUM` (hasta 2 sets en alquiler simultáneo).

#### Scenario: Límite de sets del plan basic
- **WHEN** un suscriptor `BASIC` tiene 1 set en alquiler
- **THEN** no puede solicitar ni recibir otro set hasta liberar el actual

#### Scenario: Límite de sets del plan premium
- **WHEN** un suscriptor `PREMIUM` tiene 2 sets en alquiler
- **THEN** no puede solicitar ni recibir un tercer set hasta liberar uno

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

Cuando rechace por este motivo, el sistema SHALL indicar **desde cuándo** podrá
llevárselo quien pregunta, y no solo cuánta antigüedad le falta: es el único dato
accionable del rechazo, porque la espera no depende de ninguna otra persona.

Esa fecha SHALL calcularse sobre la suscripción **vigente**. Pausar no la desplaza —la
antigüedad sigue corriendo—, pero cancelar y volver a contratar la reinicia, porque la
antigüedad se cuenta desde la suscripción que rige (ver "Contratar un plan sin
suscripción vigente").

#### Scenario: Suscriptor reciente intenta un set restringido
- **WHEN** un suscriptor con menos de la antigüedad mínima intenta alquilar un set
  restringido
- **THEN** la solicitud es rechazada indicando el requisito de antigüedad
- **AND** el rechazo incluye la fecha a partir de la cual sí podrá alquilarlo

#### Scenario: La fecha es el primer instante en que se cumple la antigüedad
- **WHEN** se calcula desde cuándo un suscriptor podrá alquilar un set restringido
- **THEN** la fecha devuelta cumple la antigüedad mínima
- **AND** cualquier instante anterior no la cumple, incluido el caso en que el día del
  mes de alta no existe en el mes de destino

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

### Requirement: Suscripción activa desde el alta
El sistema SHALL exigir la elección de un plan (`BASIC` o `PREMIUM`) como parte del
alta de suscriptor, y crear la cuenta y su suscripción **en la misma transacción**.
No existe el estado "cuenta de suscriptor sin suscripción".

#### Scenario: Alta con plan
- **WHEN** un visitante completa el alta eligiendo un plan
- **THEN** se crean su cuenta con rol `SUBSCRIBER` y una suscripción `ACTIVE` en el
  plan elegido, en la misma transacción
- **AND** puede solicitar un set sin ningún paso intermedio

#### Scenario: Alta sin plan
- **WHEN** un visitante intenta completar el alta sin elegir plan
- **THEN** el alta es rechazada indicando que el plan es obligatorio, junto con el
  resto de errores de validación del formulario

#### Scenario: Fallo al crear la suscripción
- **WHEN** la creación de la suscripción falla durante el alta
- **THEN** no se crea la cuenta: la transacción se deshace entera y el usuario puede
  reintentar sin haber dejado una cuenta inservible

### Requirement: Cambio de plan
El sistema SHALL permitir a un suscriptor cambiar entre `BASIC` y `PREMIUM` sobre su
suscripción existente. El cambio tiene efecto inmediato, salvo que rebaje el límite
por debajo de los sets que el suscriptor ya ocupa.

#### Scenario: Subir de plan
- **WHEN** un suscriptor `BASIC` cambia a `PREMIUM`
- **THEN** su límite pasa a 2 sets simultáneos de inmediato

#### Scenario: Bajar de plan sin exceso
- **WHEN** un suscriptor `PREMIUM` con 1 o ningún set ocupando plaza cambia a `BASIC`
- **THEN** el cambio se aplica y su límite pasa a 1 set simultáneo

#### Scenario: Bajar de plan con más sets de los que permite el plan nuevo
- **WHEN** un suscriptor `PREMIUM` con 2 sets ocupando plaza intenta cambiar a `BASIC`
- **THEN** la acción es rechazada indicando cuántos sets debe devolver primero
- **AND** el criterio de "ocupar plaza" es el mismo que el del límite de plan: la
  copia sigue ocupando hasta volver a `DISPONIBLE`

#### Scenario: Cambio al mismo plan
- **WHEN** un suscriptor solicita el plan que ya tiene
- **THEN** la acción no tiene efecto y no se registra un cambio

#### Scenario: El cambio de plan no reordena las colas
- **WHEN** un suscriptor con entradas de cola vivas cambia de plan
- **THEN** el `appliedBonus` de esas entradas **no** se recalcula: se congeló al
  encolar, así que el orden de las colas en curso no varía
- **AND** el bono del plan nuevo solo se aplica a las colas en las que entre a partir
  de ese momento

### Requirement: Precio de los planes
El sistema SHALL asociar un precio mensual configurable a cada plan (`BASIC`,
`PREMIUM`), usado para reportes y para poder evaluar si el suscriptor está "al
corriente de pago" (el cobro real queda fuera de alcance del MVP, ver
`proposal.md`).

#### Scenario: Precio de planes por defecto
- **WHEN** se configura el sistema por primera vez
- **THEN** el plan `BASIC` tiene un precio por defecto de 14,99€/mes y el plan
  `PREMIUM` de 24,99€/mes, ambos configurables por el admin

### Requirement: Contratar un plan sin suscripción vigente
El sistema SHALL permitir abrir una suscripción a un usuario que **no tiene ninguna
vigente**, sin pasar por un alta nueva. La suscripción se crea; la cancelada **no se
reactiva**.

La antigüedad SHALL contarse desde la suscripción que rige: la nueva empieza en el
momento de contratarla, y no hereda de la cancelada ni la antigüedad mínima para sets
restringidos ni la ventaja de cola.

El sistema NO SHALL permitir dos suscripciones vigentes sobre la misma cuenta, ni
siquiera ante dos peticiones simultáneas: la comprobación de que no existe otra ocurre
en la misma transacción que la creación.

#### Scenario: Contratar tras haber cancelado
- **WHEN** un usuario sin suscripción vigente contrata un plan disponible
- **THEN** se abre una suscripción `ACTIVE` en ese plan sobre su misma cuenta
- **AND** conserva su dirección de envío y su método de pago, que no dependen de la
  suscripción
- **AND** puede solicitar un set sin ningún paso intermedio

#### Scenario: La antigüedad no se hereda de la cancelada
- **WHEN** se abre la suscripción nueva
- **THEN** su antigüedad se cuenta desde ese momento
- **AND** un set restringido que exija antigüedad mínima vuelve a exigirla desde cero

#### Scenario: Ya tiene una suscripción vigente
- **WHEN** un usuario con suscripción vigente —activa o en pausa— intenta contratar otra
- **THEN** la acción se rechaza y se le remite al cambio de plan, que es lo que
  resuelve su caso
- **AND** no se crea ninguna suscripción

#### Scenario: Plan retirado o inexistente
- **WHEN** se intenta contratar un plan que no existe o que ya no se ofrece
- **THEN** la acción se rechaza y no se crea ninguna suscripción

