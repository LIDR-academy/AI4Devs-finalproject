# Spec: notifications

## ADDED Requirements

### Requirement: Notificaciones dirigidas por eventos del ciclo
El sistema SHALL notificar al suscriptor ante los eventos relevantes de su
actividad. Cada notificación se origina en una transición o evento de dominio.

#### Scenario: Te toca en la cola
- **WHEN** una copia se ofrece a un suscriptor que es el cabeza de cola elegible
- **THEN** se le notifica la disponibilidad junto con la ventana para confirmar

#### Scenario: Recordatorio a mitad de ventana
- **WHEN** transcurre la mitad de la ventana de confirmación sin respuesta
- **THEN** se le envía un recordatorio

#### Scenario: Confirmación de alquiler
- **WHEN** se asigna una copia a un suscriptor
- **THEN** se le notifica la confirmación del alquiler

#### Scenario: Recordatorio amable de retención
- **WHEN** un suscriptor retiene un set solicitado por otros y el admin activó
  recordatorios para ese set
- **THEN** se le envía un recordatorio amable cada X días

#### Scenario: Devolución recibida
- **WHEN** un operador marca como recibida la devolución de una copia
- **THEN** se notifica al suscriptor que su devolución está en proceso de
  inspección

#### Scenario: Devolución completada
- **WHEN** la copia devuelta vuelve a `DISPONIBLE`
- **THEN** se notifica al suscriptor que ya puede solicitar otro set

### Requirement: Notificaciones internas a back-office
El sistema SHALL notificar a operadores/admin de incidencias operativas relevantes.

#### Scenario: Devolución incompleta detectada
- **WHEN** una inspección marca una copia como `INCOMPLETA`
- **THEN** se notifica al back-office para su gestión (reposición o baja por admin)

#### Scenario: Copia dada de baja
- **WHEN** un admin da de baja una copia
- **THEN** queda registrada y notificada internamente
