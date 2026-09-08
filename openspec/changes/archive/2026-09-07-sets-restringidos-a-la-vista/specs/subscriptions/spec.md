# Spec: subscriptions

## MODIFIED Requirements

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
