# Tasks: Contratar plan desde el portal

> **Las tareas nacen marcadas.** El arreglo se hizo antes que este change, y a
> propósito: había un usuario encerrado —cancelaba, y ni la interfaz ni la API le
> dejaban volver sin cerrar la sesión—. Este documento recoge lo hecho para que la
> spec y el código digan lo mismo, y para que quien archive pueda comprobarlo pieza a
> pieza en vez de creerse el resumen.
>
> Commit: "Cancelar dejaba encerrado a quien seguía con la sesión abierta" (2026-09-06).

## 1. Abrir la suscripción

- [x] 1.1 `SubscriptionRepository.openSubscription`: crea la suscripción `ACTIVE` y
      comprueba **dentro de la misma transacción** que no hay otra vigente; devuelve
      `null` si la había (design.md §4)
- [x] 1.2 Caso de uso `openSubscription`: resuelve el plan por su código **entre los
      activos**, delega en el repositorio y traduce el `null` a un rechazo que remite
      al cambio de plan
- [x] 1.3 `startedAt` es el instante de contratar, no el de la suscripción cancelada
      (design.md §3); el reloj entra inyectado, como en el resto de casos de uso
- [x] 1.4 Acción de auditoría propia `subscription.opened` — no comparte la de
      `user.reactivated`, porque no se reactiva nada
- [x] 1.5 Tests: abre en el plan elegido; queda en auditoría con el código del plan en
      `metadata` y el UUID en `entityId`; rechaza si ya hay una vigente; rechaza plan
      inexistente y plan retirado sin crear nada

## 2. API

- [x] 2.1 `POST /api/subscriptions/me`: **201** con la suscripción creada; **409** si ya
      hay una vigente. `POST` y no `PUT` porque aquí se crea (design.md §2)
- [x] 2.2 La identidad sale **siempre** de la sesión, nunca del cuerpo: es la misma
      regla que ya seguía el `PUT`, y la razón de que no haga falta contraseña

## 3. Interfaz

- [x] 3.1 `/portal/suscripcion` sin suscripción vigente: deja de ser un vacío con un
      enlace y pasa a ofrecer la contratación, con el plan de `?plan=` marcado —pero
      **sin contratarlo solo** al cargar la página
- [x] 3.2 `/planes`: el destino del botón depende de quién mire — visitante al alta,
      suscriptor al portal con su plan, y al personal no se le enseña botón
      (design.md §5)
- [x] 3.3 La pantalla dice que se usarán la dirección y la tarjeta que ya tiene la
      cuenta: contratar no pide datos que ya están
- [x] 3.4 E2E del recorrido **por la interfaz** —cancelar, ir a planes, pulsar,
      contratar—, que es lo que faltaba: el E2E anterior volvía a suscribirse llamando
      a la API de alta, y por eso el callejón no se veía. Verificado en los dos
      sentidos: con el enlace viejo, se pone rojo

## 4. Documentación y cierre

- [x] 4.1 `documents/PRD.md` §4.1, `readme.md` §2.6 y `AGENTS.md`
- [x] 4.2 Verificación completa: `tsc --noEmit`, `eslint .`, `vitest run` (467),
      `next build`, `npm run test:e2e` (55) y una pasada real con la suscriptora
      cancelada de la semilla (201 al contratar, 409 al repetir), revirtiendo después
      su suscripción para no gastar el fixture
- [x] 4.3 Archivar el change: es lo único pendiente, y aplica los deltas a
      `openspec/specs/accounts-roles` y `openspec/specs/subscriptions`
