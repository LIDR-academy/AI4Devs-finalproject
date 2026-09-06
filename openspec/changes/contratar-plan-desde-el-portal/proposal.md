## Why

Un suscriptor que había cancelado y seguía con la sesión abierta **no tenía forma de
volver a contratar**. Pulsaba "Empezar con Basic" en `/planes` y no ocurría nada
visible. El bucle, reproducido contra el servidor:

```
/portal/suscripcion  →  "ver los planes"
   /planes           →  "Empezar con Basic"  →  /registro?plan=BASIC
   /registro         →  307  →  /portal
```

La página de alta redirige al portal a quien ya tiene sesión, así que la pulsación se
consumía en una redirección. Y la API tampoco ofrecía salida:
`PUT /api/subscriptions/me` responde **404** —tanto para `status` como para
`planCode`—, porque una suscripción cancelada ya no rige y no hay ninguna que tocar.

El camino de volver **sí existía** en la spec: `accounts-roles` → "Volver a
suscribirse con una cuenta existente", acreditando la identidad con la contraseña. Lo
que no se vio al escribirlo es que ese camino **solo funciona sin sesión**: pasa por el
alta pública, y el alta pública no es alcanzable desde dentro. El E2E lo cubría
llamando a la API de alta directamente, así que la prueba pasaba en verde mientras el
usuario estaba encerrado.

> **Estado: el código ya está en `main` de la rama de trabajo** (commit "Cancelar
> dejaba encerrado a quien seguía con la sesión abierta", 2026-09-06). Se arregló como
> lo que era —un usuario bloqueado—, y este change **formaliza la spec**, que se quedó
> corta al nombrar la contraseña como la única forma de acreditar identidad. Las tareas
> nacen marcadas por eso; lo que queda por hacer es archivarlo.

## What Changes

- **La identidad se puede acreditar de dos formas, según desde dónde se vuelva.** Con
  la **contraseña** desde el alta pública, sin sesión —como hasta ahora—; y con la
  **propia sesión** cuando ya se está dentro. Pedir la contraseña a quien acaba de
  demostrar quién es no añade seguridad: añade un sitio más donde probar contraseñas.
- **Nuevo: contratar un plan sin suscripción vigente**, desde el portal.
  `POST /api/subscriptions/me`. No reactiva la cancelada —ya no rige, y la spec ya lo
  decía—: abre una nueva sobre la misma cuenta, conservando la dirección de envío y la
  tarjeta que ya tenía.
- **La antigüedad cuenta desde la suscripción que rige.** La nueva empieza hoy, así que
  ni la antigüedad mínima para sets restringidos ni el bono de cola heredan nada de la
  cancelada.
- **Nunca dos suscripciones vigentes.** La comprobación de "no tiene otra" ocurre dentro
  de la misma transacción que la creación; quien ya tiene una recibe un rechazo que le
  remite al cambio de plan.
- **El camino deja de ser un callejón.** Desde los planes, quien tiene sesión de
  suscriptor llega a contratar, no a un alta que le devuelve al portal.

No cambia: el modelo de datos, el alta pública, ni la regla de que una suscripción
cancelada no se reactiva.

## Capabilities

### New Capabilities

Ninguna. El cambio se apoya en capabilities existentes.

### Modified Capabilities

- `accounts-roles`: el requisito "Volver a suscribirse con una cuenta existente" pasa a
  reconocer **las dos** formas de acreditar identidad, y a exigir que volver sea
  alcanzable desde dentro de la sesión.
- `subscriptions`: requisito nuevo para contratar un plan sin suscripción vigente, con
  su regla de antigüedad, la conservación de datos de envío y pago, y el rechazo de la
  segunda suscripción simultánea.

## Impact

**Código ya implementado** (referencia para quien archive):

- `src/use-cases/subscriptions/manage-subscription.ts` → `openSubscription`.
- `src/repositories/subscription.repository.ts` (+ adaptador Prisma) →
  `openSubscription`, con la comprobación **dentro de la transacción**.
- `app/api/subscriptions/me/route.ts` → `POST` (201; 409 si ya hay una vigente).
- `src/domain/audit/actions.ts` → acción `subscription.opened`.
- `app/(portal)/portal/suscripcion/page.tsx` y `subscription-actions.tsx` →
  `PlanContractor`, con `?plan=` preseleccionado.
- `app/(public)/planes/page.tsx` → el destino del botón depende de quién mire:
  visitante al alta, suscriptor al portal, personal sin botón.

**Pruebas**

- `tests/manage-subscription.test.ts`: 5 casos sobre el caso de uso.
- `e2e/portal.spec.ts`: el recorrido de interfaz completo —cancelar, planes, contratar—,
  que es justo lo que faltaba: el E2E anterior volvía a suscribirse **por API**.

**Documentación ya sincronizada:** `readme.md` §2.6, `documents/PRD.md` §4.1 y
`AGENTS.md`.
