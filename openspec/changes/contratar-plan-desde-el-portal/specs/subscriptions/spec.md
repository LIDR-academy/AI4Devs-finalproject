# Spec: subscriptions

## ADDED Requirements

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
