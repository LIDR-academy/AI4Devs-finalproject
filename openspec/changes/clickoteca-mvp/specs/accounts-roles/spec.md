# Spec: accounts-roles

## ADDED Requirements

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
- **AND** se le presentan las condiciones legales (texto *lorem ipsum* en el MVP)
