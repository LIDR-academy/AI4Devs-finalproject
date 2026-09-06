# Spec: subscriptions

## ADDED Requirements

### Requirement: Suscripción activa desde el alta
El sistema SHALL exigir la elección de un plan (`BASIC` o `PREMIUM`) como parte del
alta de suscriptor, y crear la cuenta y su suscripción **en la misma transacción**.
No existe el estado "cuenta de suscriptor sin suscripción".

#### Scenario: Alta con plan
- **WHEN** un visitante completa el alta eligiendo un plan
- **THEN** se crean su cuenta con rol `SUBSCRIBER` y una suscripción `ACTIVE` en el
  plan elegido, en la misma transacción
- **AND** puede solicitar un set sin ningún paso intermedio

#### Scenario: Alta sin plan
- **WHEN** un visitante intenta completar el alta sin elegir plan
- **THEN** el alta es rechazada indicando que el plan es obligatorio, junto con el
  resto de errores de validación del formulario

#### Scenario: Fallo al crear la suscripción
- **WHEN** la creación de la suscripción falla durante el alta
- **THEN** no se crea la cuenta: la transacción se deshace entera y el usuario puede
  reintentar sin haber dejado una cuenta inservible

### Requirement: Cambio de plan
El sistema SHALL permitir a un suscriptor cambiar entre `BASIC` y `PREMIUM` sobre su
suscripción existente. El cambio tiene efecto inmediato, salvo que rebaje el límite
por debajo de los sets que el suscriptor ya ocupa.

#### Scenario: Subir de plan
- **WHEN** un suscriptor `BASIC` cambia a `PREMIUM`
- **THEN** su límite pasa a 2 sets simultáneos de inmediato

#### Scenario: Bajar de plan sin exceso
- **WHEN** un suscriptor `PREMIUM` con 1 o ningún set ocupando plaza cambia a `BASIC`
- **THEN** el cambio se aplica y su límite pasa a 1 set simultáneo

#### Scenario: Bajar de plan con más sets de los que permite el plan nuevo
- **WHEN** un suscriptor `PREMIUM` con 2 sets ocupando plaza intenta cambiar a `BASIC`
- **THEN** la acción es rechazada indicando cuántos sets debe devolver primero
- **AND** el criterio de "ocupar plaza" es el mismo que el del límite de plan: la
  copia sigue ocupando hasta volver a `DISPONIBLE`

#### Scenario: Cambio al mismo plan
- **WHEN** un suscriptor solicita el plan que ya tiene
- **THEN** la acción no tiene efecto y no se registra un cambio

#### Scenario: El cambio de plan no reordena las colas
- **WHEN** un suscriptor con entradas de cola vivas cambia de plan
- **THEN** el `appliedBonus` de esas entradas **no** se recalcula: se congeló al
  encolar, así que el orden de las colas en curso no varía
- **AND** el bono del plan nuevo solo se aplica a las colas en las que entre a partir
  de ese momento

### Requirement: Precio de los planes
El sistema SHALL asociar un precio mensual configurable a cada plan (`BASIC`,
`PREMIUM`), usado para reportes y para poder evaluar si el suscriptor está "al
corriente de pago" (el cobro real queda fuera de alcance del MVP, ver
`proposal.md`).

#### Scenario: Precio de planes por defecto
- **WHEN** se configura el sistema por primera vez
- **THEN** el plan `BASIC` tiene un precio por defecto de 14,99€/mes y el plan
  `PREMIUM` de 24,99€/mes, ambos configurables por el admin

## REMOVED Requirements

### Requirement: Precio de los planes y del alquiler puntual
**Reason**: Agrupaba el precio de los planes con la fórmula de precio del alquiler
puntual, que sale del alcance. Se sustituye por el requisito "Precio de los planes",
idéntico salvo por la desaparición de esa fórmula y de sus dos parámetros
configurables (porcentaje sobre el valor de referencia del Set y mínimo).
**Migration**: El precio de los planes se sigue configurando igual. Los dos
`SystemSetting` del alquiler puntual dejan de leerse y desaparecen del formulario de
configuración del admin.

### Requirement: Alquiler puntual sin suscripción
**Reason**: Alquilar pasa a exigir plan activo (`proposal.md`). Mantener una segunda
vía de acceso al catálogo —con su propia elegibilidad, su propia fórmula de precio y
sus propios parámetros— no se justifica en un producto que se define como biblioteca
por suscripción.
**Migration**: No hay datos que migrar: la vía nunca llegó a tener interfaz y el MVP
no registró alquileres puntuales. `Rental.subscriptionId` sigue siendo opcional en el
esquema y `RentalType` pasa a ser siempre `SUBSCRIPTION`; las columnas se mantienen
pero dejan de poblarse. Quien no tenga suscripción activa debe darse de alta con plan
o reactivar la suya.
