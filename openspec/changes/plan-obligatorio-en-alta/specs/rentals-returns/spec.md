# Spec: rentals-returns

## MODIFIED Requirements

### Requirement: Solicitud y asignación de un set
El sistema SHALL permitir a un suscriptor elegible solicitar un set disponible y
asignarle una copia concreta. La elegibilidad exige **suscripción activa**: no hay
forma de alquilar sin plan.

#### Scenario: Solicitud con copia disponible
- **WHEN** un suscriptor elegible solicita un Set con al menos una copia
  `DISPONIBLE`
- **THEN** se le asigna una copia, que pasa a `ALQUILADA`

#### Scenario: Solicitud sin copia disponible
- **WHEN** un suscriptor elegible solicita un Set sin copias disponibles
- **THEN** se le ofrece entrar en la cola de reservas del Set (ver
  `reservation-queue`)

#### Scenario: Solicitud sin suscripción activa
- **WHEN** un usuario sin suscripción activa —nunca la tuvo, la pausó o la canceló—
  solicita un Set
- **THEN** la solicitud es rechazada indicando que necesita un plan activo
- **AND** no se le asigna copia ni se le ofrece la cola
