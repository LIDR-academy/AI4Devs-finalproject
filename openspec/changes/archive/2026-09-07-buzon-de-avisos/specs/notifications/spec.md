# Spec: notifications

## ADDED Requirements

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
