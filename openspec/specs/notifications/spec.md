# notifications Specification

## Purpose
Define qué se le comunica a quién y cuándo, a partir de eventos del ciclo de alquiler y de cola, tanto al suscriptor como al back-office, sin que un fallo al avisar comprometa la operación que lo originó.
## Requirements
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

### Requirement: Avisos de seguridad de la cuenta
El sistema SHALL dejar constancia en el buzón del usuario de los hechos que afectan a
sus credenciales, para que la titular legítima pueda detectar un movimiento que no ha
hecho ella. Estos avisos NO SHALL contener el enlace de restablecimiento ni ningún dato
que permita usarlo.

Un fallo al registrar el aviso NO SHALL impedir el restablecimiento: avisar es un
efecto secundario del hecho, no una condición para que ocurra.

#### Scenario: Se ha pedido restablecer la contraseña
- **WHEN** se emite un enlace de restablecimiento para una cuenta
- **THEN** se registra un aviso en el buzón de esa cuenta indicando que se ha
  solicitado un restablecimiento y cuándo
- **AND** el aviso no incluye el enlace ni el token

#### Scenario: La contraseña ha cambiado
- **WHEN** un usuario completa el restablecimiento de su contraseña
- **THEN** se registra un aviso en su buzón indicando que la contraseña ha cambiado

### Requirement: Buzón de avisos del usuario
El sistema SHALL ofrecer a cada usuario un buzón con los avisos dirigidos **a él**, y
NO SHALL permitir que nadie lea, cuente ni marque los de otro. El destinatario se
resuelve a partir de la sesión de quien pregunta, nunca de un dato que venga en la
petición.

El buzón SHALL distinguir los avisos sin leer de los ya leídos, y SHALL exponer cuántos
hay sin leer para poder anunciarlo fuera del propio buzón.

El usuario SHALL poder marcar como leído **un aviso concreto** o **todos los suyos de
una vez**. "Todos" son todos los avisos sin leer de su buzón, y no solo los que quepan
en la pantalla que los muestra.

Marcar como leído SHALL afectar únicamente a los avisos que estaban sin leer: repetir
la acción no altera la fecha de lectura ya registrada.

#### Scenario: Cada cual ve su buzón
- **WHEN** un usuario consulta su buzón
- **THEN** ve los avisos dirigidos a él, con los no leídos distinguidos de los demás
- **AND** no ve ningún aviso de otro usuario

#### Scenario: Marcar un aviso como leído
- **WHEN** el usuario marca como leído un aviso suyo que estaba sin leer
- **THEN** el aviso queda leído y deja de contar entre los pendientes

#### Scenario: Marcar un aviso que no procede
- **WHEN** el usuario intenta marcar un aviso que no existe, que no es suyo o que ya
  estaba leído
- **THEN** la petición se rechaza **igual en los tres casos**, sin revelar cuál de
  ellos era
- **AND** ningún aviso cambia de estado

#### Scenario: Marcar todos de una vez
- **WHEN** el usuario marca todos sus avisos como leídos
- **THEN** quedan leídos **todos** los suyos que estaban sin leer, también los que la
  pantalla no estuviera mostrando
- **AND** se le indica cuántos eran
- **AND** ningún aviso de otro usuario se ve afectado

#### Scenario: Marcar todos con el buzón ya al día
- **WHEN** el usuario marca todos sus avisos como leídos y no tenía ninguno pendiente
- **THEN** la acción se considera cumplida y no se trata como un error: lo que pidió
  —un buzón sin pendientes— es lo que ya tenía
- **AND** no se altera la fecha de lectura de los avisos ya leídos

