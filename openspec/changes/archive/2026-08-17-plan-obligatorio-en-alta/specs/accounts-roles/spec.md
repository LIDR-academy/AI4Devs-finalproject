# Spec: accounts-roles

## MODIFIED Requirements

### Requirement: Titularidad adulta
El sistema SHALL exigir que el titular de una suscripción sea un adulto con tarjeta
de crédito asociada. En el MVP la verificación es simulada y las condiciones
legales se muestran como texto de relleno.

#### Scenario: Alta de suscriptor
- **WHEN** un usuario se da de alta como suscriptor
- **THEN** debe declarar ser mayor de edad y aportar una tarjeta (simulada)
- **AND** debe elegir un plan de suscripción (ver `subscriptions`)
- **AND** se le presentan las condiciones legales (texto *lorem ipsum* en el MVP)
