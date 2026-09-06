# Spec: rentals-returns

## ADDED Requirements

### Requirement: Solicitud y asignación de un set
El sistema SHALL permitir a un suscriptor elegible solicitar un set disponible y
asignarle una copia concreta.

#### Scenario: Solicitud con copia disponible
- **WHEN** un suscriptor elegible solicita un Set con al menos una copia
  `DISPONIBLE`
- **THEN** se le asigna una copia, que pasa a `ALQUILADA`

#### Scenario: Solicitud sin copia disponible
- **WHEN** un suscriptor elegible solicita un Set sin copias disponibles
- **THEN** se le ofrece entrar en la cola de reservas del Set (ver
  `reservation-queue`)

### Requirement: Registro de condición en la entrega
El sistema SHALL registrar el estado de la copia en el momento de la entrega, antes
de enviarla al suscriptor, como checklist/fotografía de referencia, y SHALL permitir
al suscriptor confirmar la recepción o reportar una discrepancia dentro de una
ventana breve tras recibirla.

#### Scenario: Registro de estado antes del envío
- **WHEN** un operador prepara el envío de una copia recién asignada (`ALQUILADA`)
- **THEN** se registra un checklist/fotografía del estado de la copia junto con el
  operador y el instante (auditoría)

#### Scenario: Confirmación tácita de recepción conforme
- **WHEN** transcurre la ventana de confirmación tras la entrega sin que el
  suscriptor reporte ninguna discrepancia
- **THEN** se asume la entrega conforme al registro de condición

#### Scenario: Suscriptor reporta discrepancia en la entrega
- **WHEN** el suscriptor reporta, dentro de la ventana, que la copia recibida no
  coincide con el registro de condición (dañada o incompleta)
- **THEN** se genera una incidencia para el back-office y no se le imputa la
  discrepancia al suscriptor

### Requirement: Inicio de devolución
El sistema SHALL permitir al suscriptor iniciar la devolución de una copia que tiene
en alquiler.

#### Scenario: Suscriptor inicia devolución
- **WHEN** un suscriptor inicia la devolución de una copia `ALQUILADA`
- **THEN** la copia transita a `EN_DEVOLUCION`
- **AND** se genera un formulario/registro de recogida (logística simulada en MVP)

### Requirement: Recepción e inspección por operador
El sistema SHALL permitir a un operador registrar la recepción de una copia
devuelta y verificar su completitud y estado.

#### Scenario: Recepción de una devolución
- **WHEN** un operador marca como recibida una copia en `EN_DEVOLUCION`
- **THEN** la copia transita a `EN_INSPECCION`
- **AND** se registra el operador que la recibió (auditoría)

### Requirement: Higienización por operador
El sistema SHALL tratar la higienización como un paso separado posterior a la
inspección satisfactoria.

#### Scenario: Higienización tras inspección OK
- **WHEN** una copia supera la inspección
- **THEN** un operador la procesa en `EN_HIGIENIZACION` y, al terminar, la copia
  queda `DISPONIBLE` (o `OFRECIDA` si hay cola)

### Requirement: Liberación notifica a la cola tras inspección OK
El sistema SHALL ofrecer la copia liberada al cabeza de cola **únicamente después**
de que la copia haya superado la inspección y esté lista (no durante la inspección).

#### Scenario: Set con cola se libera correctamente
- **WHEN** una copia de un Set con cola termina higienización y queda lista
- **THEN** se inicia la oferta al cabeza de cola elegible (ver `reservation-queue`)
