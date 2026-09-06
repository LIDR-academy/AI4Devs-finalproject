# Tasks: Plan obligatorio en el alta

> Tests no negociables, igual que en el MVP: priorizar caminos de error y casos
> límite. Aquí el caso límite que más importa es el **downgrade con sets fuera**, y el
> camino de error que más importa es el **rechazo por falta de suscripción activa**.
>
> Orden pensado para que el repositorio nunca quede en un estado incoherente: primero
> se abre el camino nuevo (alta con plan), después se cierra el viejo (puntual). Al
> revés, entre un paso y otro no habría **ninguna** forma de conseguir una suscripción.

## 1. Alta con plan

- [x] 1.1 `registerSubscriber`: aceptar `planCode`, validarlo contra los planes
      existentes y acumular el fallo en `errors[]` (ausente / código desconocido),
      no como un 4xx aparte
- [x] 1.2 Crear la suscripción `ACTIVE` **dentro de la transacción existente** del
      alta, delegando en el caso de uso de suscripciones en vez de escribir
      `prisma.subscription.create` a mano (design.md §1 y Risks)
- [x] 1.3 `POST /api/auth/register`: ampliar el esquema Zod compartido con el
      formulario; verificar que un fallo al crear la suscripción **deshace también la
      cuenta**
- [x] 1.4 `app/(public)/registro/register-form.tsx`: selector de plan con los planes
      cargados de la base (precio, sets simultáneos y ventaja de cola), aceptando el
      plan preseleccionado por la URL desde `/planes` y permitiendo cambiarlo sin
      volver atrás
- [x] 1.5 `/planes`: que las tarjetas "Empezar con {plan}" pasen el plan a `/registro`
- [x] 1.6 Tests: alta con plan crea cuenta **y** suscripción activa; alta sin plan
      rechazada junto al resto de errores; plan inexistente rechazado; fallo a mitad
      de transacción no deja cuenta huérfana

## 2. Cambio de plan

- [x] 2.1 Caso de uso `changePlan` en `src/use-cases/subscriptions/`: sin efecto si
      ya está en ese plan; inmediato al subir; al bajar, comprobar los sets que
      ocupan plaza con `OCCUPYING_COPY_STATES` contra el `maxSimultaneousSets` del
      plan **destino** (design.md §2)
- [x] 2.2 El rechazo devuelve **cuántos sets debe devolver**, no un mensaje genérico;
      código de error propio, distinguible del límite de plan al solicitar
- [x] 2.3 `PUT /api/subscriptions/me`: aceptar `planCode` además de `status`,
      resolviendo siempre la suscripción del usuario en sesión (design.md §4)
- [x] 2.4 Registrar el cambio en `AuditLog` con el antes/después en `metadata` —
      copiando el estado previo, no referenciando el objeto que el repositorio muta
      (trampa ya encontrada en el bloque 4); el código legible del plan va en
      `metadata`, **nunca** en `entityId`, que es una columna UUID
- [x] 2.5 Tests: subir; bajar sin exceso; bajar con exceso rechazado (incluida la
      copia en devolución, que **sigue ocupando plaza**); mismo plan sin efecto; y que
      el `appliedBonus` de las colas vivas **no** cambia tras el cambio de plan

## 3. Retirada del alquiler puntual

- [x] 3.1 `src/use-cases/rentals/request-set.ts`: eliminar la bifurcación y exigir
      suscripción activa; el rechazo distingue "sin plan activo" de "límite de plan"
- [x] 3.2 Borrar `checkOneOffEligibility` (`src/domain/subscriptions/eligibility.ts`)
      y `computeOneOffPrice` (`src/domain/subscriptions/pricing.ts`)
- [x] 3.3 Retirar los dos `SystemSetting` del puntual: `resolveSettings`, la semilla y
      los campos del formulario de `/backoffice/configuracion`
- [x] 3.4 Tests: convertir los que ejercitaban la vía puntual
      (`tests/rental-circuit.test.ts`, `tests/subscription-pricing-reminders.test.ts`)
      en pruebas del **rechazo** por falta de suscripción activa; no borrarlos sin
      sustituto

## 4. Semilla y cierre

- [x] 4.1 `prisma/seed.ts`: el usuario sin suscripción pasa a representar una "cuenta
      recién dada de alta"; revisar que los tests que dependían de él sigan probando
      lo que decían probar (Risks de design.md)
- [x] 4.2 E2E: el recorrido de `e2e/circuito-completo.spec.ts` arranca ahora en un
      alta **con plan**; añadir el cambio de plan al recorrido del portal
- [x] 4.3 Verificación completa: `tsc --noEmit`, `eslint .`, `vitest run`,
      `next build` y `npm run spec:validate` en verde, más una pasada manual del alta
      contra la base sembrada
