# accounts-roles Specification

## Purpose
Define quién puede hacer qué en Clickoteca: los tres roles de cuenta (SUBSCRIBER, OPERATOR, ADMIN), el visitante como actor no autenticado, los requisitos del alta de suscriptor y el rastro de auditoría de las acciones administrativas.
## Requirements
### Requirement: Roles del sistema
El sistema SHALL soportar tres roles: `SUSCRIPTOR`, `OPERADOR` y `ADMIN`. Cada
cuenta tiene exactamente un rol. Las acciones disponibles dependen del rol.

#### Scenario: Acceso del suscriptor
- **WHEN** un usuario con rol `SUSCRIPTOR` accede a la plataforma
- **THEN** puede gestionar su cuenta, ver el catálogo, solicitar sets, entrar en
  colas, confirmar ofertas e iniciar devoluciones
- **AND** no tiene acceso al back-office

#### Scenario: Acceso del operador al back-office
- **WHEN** un usuario con rol `OPERADOR` accede al back-office
- **THEN** puede dar de alta copias y avanzar copias por su ciclo de vida
  (recepción, inspección, higienización) y marcar incidencias (incompleta/dañada)
- **AND** puede ver el historial de cliente en **modo lectura limitada**
- **AND** no puede dar de baja copias ni configurar reglas del sistema

#### Scenario: Acceso del admin
- **WHEN** un usuario con rol `ADMIN` accede al back-office
- **THEN** puede realizar todo lo del operador y además dar de baja copias,
  configurar planes/reglas/parámetros, gestionar empleados y ver el historial
  completo de clientes

### Requirement: Acceso público no autenticado (visitante)
El sistema SHALL permitir el acceso no autenticado (visitante) a un subconjunto de
solo lectura de la plataforma: explorar la proyección pública del catálogo de Sets
(ver `catalog-inventory`), consultar los planes de membresía y sus condiciones, e
iniciar el alta. El visitante **no es un rol de cuenta** —los roles son los tres
anteriores, uno por cuenta—: representa el estado sin sesión y no tiene registro en
el modelo de datos.

#### Scenario: Visitante explora sin cuenta
- **WHEN** un usuario sin sesión accede a la plataforma
- **THEN** puede ver la proyección pública del catálogo, los planes de membresía con
  sus condiciones y la opción de registro
- **AND** no puede solicitar sets, entrar en colas ni acceder al back-office

#### Scenario: Acción reservada exige autenticación
- **WHEN** un visitante intenta una acción de suscriptor (solicitar un set, unirse a
  una cola) o acceder al back-office
- **THEN** la acción es rechazada y se le solicita iniciar sesión o registrarse

### Requirement: Dar de baja una copia restringido a ADMIN
El sistema SHALL permitir dar de baja (`BAJA`) una copia únicamente a usuarios con
rol `ADMIN`.

#### Scenario: Operador intenta dar de baja
- **WHEN** un `OPERADOR` intenta dar de baja una copia
- **THEN** la acción es rechazada
- **AND** el operador sí puede marcar la copia como incompleta o dañada para que un
  `ADMIN` confirme la baja

### Requirement: Auditoría de acciones
El sistema SHALL registrar, en cada transición de estado de una copia y en cada
acción administrativa, el usuario que la realizó y el instante en que ocurrió.

#### Scenario: Registro de quién inspecciona
- **WHEN** un operador marca una copia como inspeccionada
- **THEN** el sistema registra el identificador del operador y la marca de tiempo
  asociados a esa transición

### Requirement: Titularidad adulta
El sistema SHALL exigir que el titular de una suscripción sea un adulto con tarjeta
de crédito asociada. En el MVP la verificación es simulada y las condiciones
legales se muestran como texto de relleno.

#### Scenario: Alta de suscriptor
- **WHEN** un usuario se da de alta como suscriptor
- **THEN** debe declarar ser mayor de edad y aportar una tarjeta (simulada)
- **AND** debe elegir un plan de suscripción (ver `subscriptions`)
- **AND** se le presentan las condiciones legales (texto *lorem ipsum* en el MVP)

### Requirement: Volver a suscribirse con una cuenta existente
El sistema SHALL permitir que quien canceló vuelva a contratar un plan **sobre su
misma cuenta**, acreditando su identidad con la contraseña de esa cuenta. Una
suscripción cancelada no se reactiva —ya no rige—: lo que se hace es abrir una nueva
sobre la cuenta de siempre, con los datos de envío y pago que aporte en ese momento.

#### Scenario: Vuelve con su contraseña
- **WHEN** alguien se da de alta con un email que ya tiene cuenta y aporta la
  contraseña de esa cuenta
- **AND** esa cuenta no tiene ninguna suscripción vigente
- **THEN** se abre una suscripción nueva con el plan elegido sobre esa misma cuenta
- **AND** se actualizan su nombre, su dirección de envío y su método de pago con los
  datos aportados

#### Scenario: Vuelve sin la contraseña correcta
- **WHEN** alguien se da de alta con un email que ya tiene cuenta y no aporta su
  contraseña
- **THEN** el alta se rechaza con el mismo mensaje que cualquier email ya registrado,
  sin revelar nada más sobre esa cuenta

#### Scenario: La cuenta ya tiene suscripción
- **WHEN** alguien se da de alta con un email cuya cuenta ya tiene una suscripción
  vigente, aun aportando la contraseña correcta
- **THEN** el alta se rechaza y se le remite a su portal, donde se gestiona la que ya
  tiene

### Requirement: Datos de envío del suscriptor
El sistema SHALL requerir y mantener una dirección de envío y un contacto
(teléfono o email) por suscriptor, usados para el registro de entrega y de
recogida (logística simulada en el MVP). Un modelo más detallado de direcciones
(varias direcciones, validación postal, etc.) queda para una especificación
posterior.

#### Scenario: Alta sin dirección de envío
- **WHEN** un usuario intenta darse de alta como suscriptor sin aportar una
  dirección de envío
- **THEN** el alta es rechazada hasta completar el dato

#### Scenario: Actualización de dirección
- **WHEN** un suscriptor actualiza su dirección de envío
- **THEN** los envíos futuros usan la dirección actualizada; los envíos ya
  registrados no se modifican retroactivamente

