# Spec: notifications

## ADDED Requirements

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
