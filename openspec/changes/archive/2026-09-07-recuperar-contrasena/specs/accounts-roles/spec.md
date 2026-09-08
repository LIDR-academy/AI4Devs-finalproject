# Spec: accounts-roles

## ADDED Requirements

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
