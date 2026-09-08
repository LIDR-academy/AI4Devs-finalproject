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
El sistema SHALL ordenar la cola por una prioridad de envejecimiento **aditiva**
equivalente a `días_esperando + bono_plan`, donde `bono_plan` es un valor fijo
configurable para `PREMIUM` (p. ej. +10) y 0 para `BASIC`. Mayor prioridad va más
cerca de cabeza; ante empate, prevalece quien se encoló antes. La implementación
concreta de este orden se define en "Orden de cola por entrada efectiva inmutable"
(no se materializa una puntuación recalculada).

#### Scenario: El tiempo de espera supera la ventaja premium
- **WHEN** un `BASIC` lleva esperando suficientes días para que su puntuación
  supere a la de un `PREMIUM` recién encolado
- **THEN** el `BASIC` se ordena por delante del `PREMIUM`

#### Scenario: Ventaja fija del premium
- **WHEN** un `PREMIUM` y un `BASIC` se encolan en el mismo instante
- **THEN** el `PREMIUM` se ordena por delante por su bono fijo

### Requirement: Orden de cola por entrada efectiva inmutable
El sistema SHALL determinar el orden de la cola mediante una marca de **entrada
efectiva inmutable** `entrada_efectiva = enqueuedAt − bono_aplicado`, calculada **una
sola vez al encolar** (congelando el bono de plan vigente). El orden es siempre
`entrada_efectiva` ascendente, con desempate por identificador, resuelto de forma
*lazy* al ofrecer. El sistema SHALL NOT recalcular periódicamente ninguna puntuación:
por ser la prioridad **aditiva**, la ordenación es invariante en el tiempo y solo
cambia ante eventos estructurales (altas/bajas en la cola). Un cambio del bono por el
admin solo afecta a nuevas incorporaciones.

#### Scenario: El orden no depende del paso del tiempo
- **WHEN** transcurre el tiempo sin altas ni bajas en la cola
- **THEN** el orden relativo de las entradas no cambia
- **AND** no se recalcula ni materializa ninguna puntuación

#### Scenario: Caducar una oferta re-encola al final con prioridad reducida
- **WHEN** una oferta caduca sin respuesta
- **THEN** el suscriptor se re-encola con una nueva `entrada_efectiva` (al final de la
  cola) que incorpora la penalización de prioridad
- **AND** no es expulsado de la cola

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
