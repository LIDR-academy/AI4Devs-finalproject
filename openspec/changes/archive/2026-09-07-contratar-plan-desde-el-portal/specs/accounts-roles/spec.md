# Spec: accounts-roles

## MODIFIED Requirements

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
