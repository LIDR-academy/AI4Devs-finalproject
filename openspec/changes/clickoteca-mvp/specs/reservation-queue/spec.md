# Spec: reservation-queue

## ADDED Requirements

### Requirement: Cola de reservas por Set
El sistema SHALL mantener una cola de reservas por cada Set, a la que los
suscriptores elegibles pueden unirse cuando no hay copias disponibles.

#### Scenario: Unirse a la cola
- **WHEN** un suscriptor elegible solicita un Set sin copias disponibles y acepta
  encolarse
- **THEN** se añade una entrada de cola con la marca de tiempo de su incorporación

### Requirement: Prioridad por envejecimiento aditiva
El sistema SHALL ordenar la cola por una puntuación `score = días_esperando +
bono_plan`, donde `bono_plan` es un valor fijo configurable para `PREMIUM`
(p. ej. +10) y 0 para `BASIC`. Mayor puntuación va más cerca de cabeza; ante
empate, prevalece quien se encoló antes.

#### Scenario: El tiempo de espera supera la ventaja premium
- **WHEN** un `BASIC` lleva esperando suficientes días para que su puntuación
  supere a la de un `PREMIUM` recién encolado
- **THEN** el `BASIC` se ordena por delante del `PREMIUM`

#### Scenario: Ventaja fija del premium
- **WHEN** un `PREMIUM` y un `BASIC` se encolan en el mismo instante
- **THEN** el `PREMIUM` se ordena por delante por su bono fijo

### Requirement: Recálculo del score de cola
El sistema SHALL mantener el `score` de cada entrada de forma materializada y
recalcularlo de forma periódica y ante eventos relevantes (nueva entrada, oferta
caducada que re-encola, cambio de plan del suscriptor), de modo que la ordenación
refleje el envejecimiento acumulado sin depender del instante de lectura.

#### Scenario: El score refleja el paso del tiempo
- **WHEN** transcurre el tiempo y se ejecuta el recálculo de la cola
- **THEN** el `score` de cada entrada se actualiza a `días_esperando + bono_plan`
- **AND** la cola queda reordenada según los nuevos valores

#### Scenario: Recálculo tras caducar una oferta
- **WHEN** una oferta caduca sin respuesta y el suscriptor vuelve al final con
  prioridad reducida
- **THEN** su `score` se recalcula aplicando la penalización de prioridad

### Requirement: Elegibilidad al ofrecer
El sistema SHALL ofrecer la copia liberada únicamente a entradas de la cola cuyo
suscriptor pueda recibir el set en ese momento (no supera el límite de su plan ni
tiene una devolución pendiente que lo bloquee), saltando a las no elegibles.

#### Scenario: Saltar a suscriptor no elegible
- **WHEN** el cabeza de cola ya tiene el máximo de sets de su plan en alquiler
- **THEN** se le salta y se evalúa al siguiente elegible

### Requirement: Ventana de confirmación de oferta
El sistema SHALL ofrecer la copia al primer elegible mediante una ventana de
confirmación de duración configurable por Set, con aceptar y rechazar explícitos.

#### Scenario: Aceptar la oferta
- **WHEN** el suscriptor acepta dentro de la ventana
- **THEN** se le asigna la copia (pasa a `ALQUILADA`) y abandona la cola

#### Scenario: Rechazo explícito libera al instante
- **WHEN** el suscriptor rechaza la oferta
- **THEN** la oferta pasa de inmediato al siguiente elegible, sin esperar al
  vencimiento

#### Scenario: Recordatorio a mitad de ventana
- **WHEN** transcurre la mitad de la ventana sin respuesta
- **THEN** el sistema envía un recordatorio al suscriptor ofertado

#### Scenario: Caducidad sin respuesta
- **WHEN** la ventana caduca sin respuesta
- **THEN** el suscriptor pierde el turno y vuelve al final de la cola con prioridad
  reducida (no es expulsado)
- **AND** la oferta pasa al siguiente elegible

### Requirement: Límite de colas simultáneas por usuario
El sistema SHALL limitar el número de colas simultáneas por usuario mediante un
valor configurable por el admin (por defecto 1), que puede incrementarse según la
antigüedad y el historial de cumplimiento.

#### Scenario: Límite de colas alcanzado
- **WHEN** un usuario en su límite de colas intenta unirse a otra
- **THEN** la acción es rechazada indicando el límite
