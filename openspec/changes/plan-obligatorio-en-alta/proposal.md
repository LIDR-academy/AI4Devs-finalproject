## Why

La revisión de flujos por rol (`documents/ux-flows.md` §8.1) destapó que el alta
termina en un callejón: se crea la cuenta pero **no existe ningún camino para
contratar un plan**, así que un usuario registrado en la aplicación real nunca puede
alquilar. Las únicas suscripciones del sistema son las que siembra `prisma/seed.ts`.

Al cerrar ese hueco, el propietario decidió además simplificar el modelo comercial:
**alquilar exige plan**. El alquiler puntual sin suscripción —una vía paralela con su
propia elegibilidad, su propia fórmula de precio y sus propios parámetros de
configuración— se retira del alcance del MVP. El coste de mantenerlo no se justifica
para un producto que se define como biblioteca **por suscripción**.

## What Changes

- **El plan se elige en el alta.** El registro pasa a crear usuario, dirección,
  método de pago **y suscripción activa** en la misma transacción. Un alta sin plan
  se rechaza, con el error acumulado junto al resto de validaciones. Desaparece el
  estado "cuenta creada sin plan".
- **Nuevo: cambio de plan** `BASIC ⇄ PREMIUM` sobre una suscripción existente.
  Inmediato al subir. Al bajar, **rechazado mientras el suscriptor tenga más sets
  ocupando plaza de los que permite el plan nuevo** — mismo criterio que ya rige para
  pausar/cancelar. El `appliedBonus` de las entradas de cola vivas **no se
  recalcula**: se congela al encolar (`design.md` D11 del MVP), así que subir de plan
  no adelanta esperas en curso.
- **BREAKING — se elimina el alquiler puntual sin suscripción.** Solicitar un set
  exige suscripción activa. Con él se van su fórmula de precio y los dos
  `SystemSetting` que la parametrizan (porcentaje sobre el valor de referencia y
  mínimo).

No cambia: el modelo de datos. `Rental.subscriptionId` sigue siendo opcional,
`Rental.price` y `Payment` se quedan donde están — quitarlos cuesta una migración y no
estorban. Simplemente dejan de poblarse: `RentalType` es siempre `SUBSCRIPTION`.

## Capabilities

### New Capabilities

Ninguna. El cambio se apoya en capabilities existentes.

### Modified Capabilities

- `subscriptions`: la suscripción nace con el alta (nuevo requisito); se añade el
  cambio de plan con su regla de bloqueo al bajar (nuevo requisito); se retira el
  requisito de alquiler puntual y el escenario de precio que lo acompañaba.
- `rentals-returns`: solicitar un set exige **suscripción activa** — hasta ahora la
  spec decía "suscriptor elegible" sin cerrar la puerta a la vía puntual.
- `accounts-roles`: el alta de suscriptor incorpora la elección de plan como dato
  obligatorio, junto a la mayoría de edad, la tarjeta y la dirección.

## Impact

**Código a añadir**

- `src/use-cases/accounts/register-subscriber.ts`: crear la suscripción dentro de la
  transacción existente; validar el plan como un error más de `errors[]`.
- Cambio de plan: `PUT /api/subscriptions/me` hoy solo acepta
  `status: ACTIVE|PAUSED|CANCELLED`. Hay que admitir el plan y aplicar la regla del
  downgrade reutilizando el conjunto de estados que ocupan plaza
  (`OCCUPYING_COPY_STATES`).
- `app/(public)/registro/register-form.tsx`: selector de plan, aceptando el plan
  preseleccionado por la URL desde `/planes`.

**Código a retirar**

- `checkOneOffEligibility` (`src/domain/subscriptions/eligibility.ts`).
- `computeOneOffPrice` (`src/domain/subscriptions/pricing.ts`).
- La bifurcación por vía en `src/use-cases/rentals/request-set.ts`.
- Los dos `SystemSetting` del puntual y sus campos en el formulario de
  `/backoffice/configuracion`.
- Los tests que cubren la vía puntual (`tests/subscription-pricing-reminders.test.ts`,
  `tests/rental-circuit.test.ts`).

**Semilla y documentación**

- `prisma/seed.ts` mantiene un usuario sin suscripción para ejercitar D7; con este
  cambio ese usuario ya no puede alquilar, así que su papel pasa a ser el de cuenta
  recién dada de alta.
- Ya sincronizados: `documents/PRD.md` (§1, §4.3, §5, §6, UC-P05, UC-B10, §15),
  `documents/user_stories.md` (HU-01, HU-02, HU-16) y `documents/ux-flows.md`.
