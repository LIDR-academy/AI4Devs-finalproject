## Context

Ver `proposal.md` — Why. Restricciones del código actual que condicionan el enfoque:

- `registerSubscriber` ya crea usuario, dirección y método de pago **en una sola
  transacción de Prisma**, y acumula los fallos de validación en `errors[]` en vez de
  devolver el primero.
- La elegibilidad vive en `src/domain/subscriptions/eligibility.ts` con **dos
  entradas**: `checkEligibility` (por plan) y `checkOneOffEligibility` (vía puntual),
  y `requestSet` bifurca entre ellas según haya o no suscripción activa. Esa
  bifurcación existe porque un test destapó, en el bloque 5, que el alquiler puntual
  era imposible.
- El límite de plan se calcula sobre `OCCUPYING_COPY_STATES` (`ALQUILADA` + los tres
  estados de retorno): la plaza no se libera al iniciar la devolución sino cuando la
  copia vuelve a `DISPONIBLE`. Pausar/cancelar usa un conjunto más estrecho,
  `HELD_COPY_STATES`.
- `PUT /api/subscriptions/me` opera **siempre sobre la suscripción del usuario en
  sesión, nunca por id**, para que no exista la posibilidad de tocar la de otro.
- `QueueEntry.appliedBonus` y `effectiveEntryAt` se congelan al encolar (D11 del MVP
  archivado): no hay recálculo periódico y el orden es invariante en el tiempo.

## Goals / Non-Goals

**Goals:**

- Que el alta deje una cuenta **operativa**: con plan, capaz de alquilar sin pasos
  intermedios.
- Que el cambio de plan reutilice el criterio de ocupación de plaza que ya existe, en
  vez de inventar una comprobación paralela.
- Retirar la vía puntual **entera** —dominio, configuración e interfaz— sin dejar
  código muerto que aparente seguir soportada.

**Non-Goals:**

- Prorrateo, facturación o cobro del cambio de plan: el cobro real está fuera del MVP
  y `Subscription` no tiene ciclo de facturación (solo `startedAt`/`cancelledAt`).
- Cambios de esquema. Las columnas del puntual se quedan (ver Decisión 3).
- Programar un cambio de plan para más adelante ("bájame cuando devuelva"): exigiría
  persistir un cambio pendiente y un modelo nuevo. Se rechaza y punto.

## Decisions

### 1. La suscripción se crea dentro de la transacción del alta, no después

**Alternativa descartada:** crear la cuenta y, en una segunda llamada, la
suscripción. Es lo que permitiría reutilizar tal cual el endpoint de suscripción,
pero abre exactamente el estado que este cambio quiere eliminar: si la segunda
llamada falla, queda una cuenta que no puede alquilar y que nadie sabe reparar desde
la interfaz. Metiéndolo en la transacción existente, el fallo deshace el alta entera
y el usuario reintenta.

**Consecuencia:** el plan se valida como un error más de `errors[]` (plan ausente o
código inexistente), no con un 404 aparte. El formulario ya muestra todos los errores
juntos y no hay que tocar ese contrato.

### 2. El bloqueo del downgrade se deriva del límite de plazas, no se comprueba aparte

La regla es: *sets que ocupan plaza* > `maxSimultaneousSets` del plan destino →
rechazado. Se calcula con `OCCUPYING_COPY_STATES`, el mismo conjunto que ya usa la
elegibilidad, así que no puede desincronizarse de ella.

**Alternativa descartada:** usar `HELD_COPY_STATES` (el de pausar/cancelar, más
estrecho: solo lo que el suscriptor tiene realmente en su poder). Sería más
permisivo, pero dejaría entrar a un `BASIC` con dos copias aún ocupando plaza —una en
inspección y otra en casa— es decir, por encima de su propio límite, y con eso el
invariante "nadie supera el límite de su plan" deja de sostenerse. El criterio
estrecho tiene sentido para *dejar de pagar* (el suscriptor ya cumplió su parte); no
lo tiene para *bajar de plan*, donde lo que importa es cuántas plazas está ocupando.

**Mensaje de error:** debe decir **cuántos sets faltan por devolver**, no "tienes
pendientes". Un número es accionable; una abstracción no.

### 3. El esquema no se toca; las columnas del puntual se quedan vacías

`Rental.subscriptionId` (opcional), `Rental.price` y la relación con `Payment`
existían para la vía puntual. Quitarlas exige una migración destructiva sobre datos
sembrados a cambio de nada: `RentalType` pasa a valer siempre `SUBSCRIPTION` y esas
columnas simplemente dejan de poblarse.

**Alternativa descartada:** migración de limpieza. Se rechaza por coste/beneficio; si
algún día se retoma el puntual, el modelo ya está.

**Riesgo asumido:** un esquema que admite más de lo que el dominio permite. Se mitiga
dejándolo escrito en `PRD.md` §15 y aquí.

### 4. El cambio de plan amplía `PUT /api/subscriptions/me`; no nace un endpoint nuevo

El endpoint ya resuelve la suscripción **del usuario en sesión, nunca por id**, que es
la propiedad de seguridad que interesa conservar. Aceptar `planCode` además de
`status` mantiene esa propiedad sin duplicarla en un segundo sitio donde pueda
olvidarse.

**Alternativa descartada:** `POST /api/subscriptions/me/plan`. Más explícito, pero
duplica la resolución de identidad y el mapa de errores por un beneficio estético.

### 5. El bono de cola no se recalcula, y eso se dice en la interfaz

Se deriva de D11: `appliedBonus` se congela al encolar y el orden es invariante. No
hay nada que implementar — pero sí que **comunicar**: quien se hace `PREMIUM` estando
en una cola no adelanta. Descubrirlo después de pagar es la queja evitable más
probable de este cambio, así que el aviso va en la pantalla de cambio de plan, antes
de confirmar.

### 6. La retirada del puntual se hace por completo, en el mismo cambio

Dominio (`checkOneOffEligibility`, `computeOneOffPrice`), la bifurcación de
`requestSet`, los dos `SystemSetting` y sus campos en el formulario del admin, y los
tests que los cubren. Dejar el dominio "por si acaso" produce código que ningún
camino alcanza y que la siguiente persona interpretará como funcionalidad viva.

## Risks / Trade-offs

- **El seed tiene un usuario sin suscripción para ejercitar D7 (antigüedad).** Con
  este cambio ese usuario ya no puede alquilar → *Mitigación:* reinterpretarlo como
  "cuenta recién dada de alta" y comprobar que los tests que dependen de él siguen
  probando lo que decían probar, no solo que siguen en verde.
- **Los tests del circuito (`rental-circuit`) y de precios ejercitan la vía puntual**
  → *Mitigación:* no borrarlos sin más; convertir los que sigan teniendo sentido en
  pruebas del rechazo por falta de suscripción activa, que es el comportamiento nuevo.
- **`register-subscriber` gana una responsabilidad** (deja de ser solo "crear
  cuenta") → *Mitigación:* la creación de la suscripción se delega en el caso de uso
  de suscripciones, no se escribe a mano con `prisma.subscription.create` dentro del
  alta; el alta orquesta, no reimplementa.
- **Cuenta suspendida o cancelada que intenta alquilar:** el rechazo nuevo debe
  distinguirse del "no eres elegible por límite de plan", porque la acción que lo
  resuelve es distinta (reactivar el plan vs. devolver un set).

## Migration Plan

1. Aplicar el cambio de comportamiento (sin migración de base de datos).
2. Resembrar en local: `docker compose up -d` + `npm run db:seed`. La semilla es
   idempotente; el usuario sin suscripción se mantiene, ahora con otro papel.
3. **Rollback:** revertir el commit. Al no haber migración ni datos nuevos, no hay
   nada que deshacer en la base.
