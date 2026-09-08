## Context

Ver `proposal.md` — Why. Lo que condicionaba el enfoque, del código que ya había:

- **`findCurrentSubscription` ignora las canceladas**, y es correcto: una cancelada ya
  no rige. La consecuencia es que `PUT /api/subscriptions/me` responde 404 a quien no
  tiene ninguna, para `status` y para `planCode` por igual.
- **El alta pública redirige al portal a quien tiene sesión** (`/registro`), igual que
  el login. Es lo razonable para un alta, y es lo que convertía en callejón el único
  camino de vuelta que existía.
- **`resubscribe` ya resolvía esto sin sesión**, con la contraseña, y hace la
  comprobación de "no tiene otra vigente" **dentro de una transacción** — la cautela
  está escrita y probada.
- **La dirección de envío y la tarjeta cuelgan del usuario, no de la suscripción.**
  Cancelar no las borra.

## Goals / Non-Goals

**Goals:**

- Que quien canceló pueda volver **sin cerrar la sesión** ni recordar su contraseña.
- Que la spec diga lo que el sistema hace: acreditar identidad tiene dos formas, y la
  que aplica depende de si hay sesión.
- No inventar una regla nueva donde ya había una: la cancelada no revive, aquí tampoco.

**Non-Goals:**

- **Reactivar una suscripción cancelada.** Se descartó al escribir la spec original y
  no se reabre: el estado `CANCELLED` es terminal y su fecha de cancelación es un dato
  histórico.
- **Conservar la antigüedad de la suscripción cancelada.** Ver Decisión 3.
- **Cambiar dirección o tarjeta al contratar.** Son datos de la cuenta; editarlos es
  otra pantalla, y meterlos aquí convertiría "contratar" en un formulario de alta.
- **Cobrar o prorratear.** El pago sigue simulado en el MVP.

## Decisions

### 1. La sesión acredita la identidad; no se pide la contraseña otra vez

La spec original nombraba la contraseña porque el único camino de vuelta pasaba por el
alta pública, **donde no hay sesión**. Con sesión, volver a pedirla no añade seguridad:
añade un sitio más donde probar contraseñas —el mismo riesgo que ya se anotó para
`resubscribe`— y una fricción que no protege de nada, porque quien tiene la cookie ya
puede pausar, cancelar y cambiar de plan sin escribirla.

### 2. `POST` y no `PUT`: se crea, no se modifica

`PUT /api/subscriptions/me` opera sobre la suscripción que existe, y por eso responde
404 cuando no hay ninguna. Reutilizarlo para "abre una si no hay" mezclaría dos
operaciones con precondiciones opuestas en el mismo verbo, y dejaría el 404 significando
dos cosas distintas. `POST` sobre el mismo recurso dice lo que pasa: aparece una
suscripción que antes no estaba.

**Alternativa descartada:** hacer que `PUT { status: "ACTIVE" }` reviva la cancelada.
Es la que parece más pequeña y es la que rompe la regla: obligaría a que
`findCurrentSubscription` viera las canceladas, y con ello a decidir en cada consulta
del sistema si una cancelada cuenta o no.

### 3. La antigüedad empieza de cero

`startedAt` es el momento de contratar. La antigüedad gobierna dos cosas —el acceso a
sets restringidos y la ventaja de cola—, y las dos premian **estar suscrito**, no haber
estado alguna vez. Conservarla convertiría cancelar en una operación gratuita para
quien quisiera pausar el pago sin perder posición, que es justo lo que la suscripción
mide.

Es además lo que ya hacía la vuelta por el alta pública: allí la suscripción también
nace nueva. Las dos puertas dan al mismo sitio.

### 4. La comprobación de "no tiene otra" va dentro de la transacción

Mismo motivo, y misma forma, que `SubscriberRepository.resubscribe`: entre consultarlo
y escribir cabe otra petición idéntica —un doble clic basta—, y el resultado serían dos
suscripciones vigentes sobre la misma cuenta, que ninguna consulta del sistema sabe
interpretar. El repositorio devuelve `null` cuando ya había una, y el caso de uso lo
traduce a un rechazo que **remite al cambio de plan**: quien ya tiene una no quiere
contratar, quiere cambiar.

### 5. El botón de los planes depende de quién mire

Arreglar solo el portal habría dejado el bucle intacto, porque a la contratación se
llega desde `/planes`. El destino se decide con la sesión: visitante al alta,
suscriptor al portal —llevando el plan elegido en la URL, como ya hacía el alta—, y al
personal **no se le enseña botón**, porque un operador no contrata planes y ofrecérselo
sería prometer algo que su rol no puede hacer.

## Risks / Trade-offs

- **El plan preseleccionado no se contrata solo.** Llega marcado y hay que pulsar.
  Contratar por navegar sería cobrar —simulado hoy, real mañana— por abrir una URL.
- **Sin dirección de envío, contratar funciona pero alquilar no.** Se acepta: el
  rechazo al solicitar un set ya lo explica con su propio mensaje, y bloquear la
  contratación por un dato que se arregla después sería peor. Queda como aviso posible
  si algún día se ve en uso real.
- **Quedan dos caminos de vuelta** —alta con contraseña y portal con sesión— y hay que
  mantenerlos coherentes. Es el precio de que volver funcione desde los dos sitios
  donde una persona lo intenta; la spec los describe juntos, en un solo requisito, para
  que no diverjan sin que se note.
