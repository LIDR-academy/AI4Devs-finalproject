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
misma cuenta**, y SHALL aceptar **dos formas de acreditar la identidad**, según desde
dónde vuelva:

- **sin sesión**, desde el alta pública, con la **contraseña** de esa cuenta;
- **con sesión abierta**, desde su portal, donde la propia sesión ya acredita quién es
  y NO SHALL pedirse la contraseña otra vez.

Volver SHALL ser alcanzable desde dentro de la sesión: al suscriptor sin plan activo no
se le puede ofrecer como única salida un camino que exija cerrarla.

Una suscripción cancelada no se reactiva —ya no rige—: lo que se hace es abrir una
nueva sobre la cuenta de siempre.

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

#### Scenario: Vuelve desde su portal, con la sesión abierta
- **WHEN** un suscriptor sin suscripción vigente contrata un plan desde su portal
- **THEN** no se le pide la contraseña: la sesión ya acredita su identidad
- **AND** se abre una suscripción nueva sobre su misma cuenta, conservando su
  historial, su dirección de envío y su método de pago

#### Scenario: Contratar desde los planes con la sesión abierta
- **WHEN** un suscriptor sin suscripción vigente elige un plan desde la página de
  planes
- **THEN** llega a contratarlo llevando consigo el plan que eligió
- **AND** no se le devuelve al punto de partida ni se le exige cerrar la sesión

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

### Requirement: Restablecimiento de contraseña por correo
El sistema SHALL permitir a un usuario que ha olvidado su contraseña recuperar el
acceso por sí mismo, mediante un enlace de un solo uso enviado a la dirección de
correo de su cuenta. El sistema SHALL responder a la solicitud de forma **idéntica**
exista o no una cuenta con esa dirección, y NO SHALL revelar por ningún medio —mensaje,
código de estado o contenido— si la dirección está dada de alta.

El enlace SHALL caducar transcurrida **1 hora** desde su emisión y SHALL poder usarse
**una sola vez**. El sistema SHALL guardar únicamente el **hash** del token, nunca el
token en claro ni el enlace completo.

#### Scenario: Solicitud con una dirección dada de alta
- **WHEN** un usuario pide restablecer la contraseña de una dirección con cuenta activa
- **THEN** se le envía a esa dirección un enlace de restablecimiento
- **AND** se le muestra un mensaje que no confirma que la cuenta exista
- **AND** cualquier enlace de restablecimiento anterior de esa cuenta queda invalidado

#### Scenario: Solicitud con una dirección desconocida
- **WHEN** un usuario pide restablecer la contraseña de una dirección sin cuenta
- **THEN** no se envía ningún correo
- **AND** se le muestra **el mismo** mensaje y el mismo estado que si la cuenta existiera

#### Scenario: Solicitud para una cuenta suspendida
- **WHEN** un usuario pide restablecer la contraseña de una cuenta suspendida
- **THEN** no se envía ningún enlace, porque restablecer no levanta la suspensión
- **AND** se le muestra **el mismo** mensaje que en los casos anteriores

#### Scenario: Uso del enlace
- **WHEN** el usuario abre un enlace vigente y elige una contraseña nueva válida
- **THEN** la contraseña de la cuenta queda sustituida
- **AND** el enlace queda gastado y no vuelve a servir
- **AND** se cierran todas las sesiones abiertas de esa cuenta
- **AND** el usuario puede entrar con la contraseña nueva

#### Scenario: Enlace caducado, ya usado o inexistente
- **WHEN** el usuario abre un enlace caducado, ya gastado o que nunca existió
- **THEN** el sistema rechaza el intento con el mismo error en los tres casos
- **AND** le ofrece solicitar un enlace nuevo
- **AND** la contraseña de la cuenta no cambia

#### Scenario: Contraseña nueva no válida
- **WHEN** el usuario envía una contraseña que no cumple el mínimo exigido en el alta,
  o una confirmación que no coincide
- **THEN** el intento se rechaza indicando el campo que falla
- **AND** el enlace **sigue vigente**, para que pueda corregir sin pedir otro

