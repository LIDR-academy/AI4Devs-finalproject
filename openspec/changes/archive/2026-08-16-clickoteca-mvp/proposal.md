# Proposal: Clickoteca MVP

## Why

Los sets de Lego son caros, se montan una vez y luego ocupan espacio. Existe un
dolor real: coste + almacenamiento + el "ya me aburrí". **Clickoteca** es una
*biblioteca de sets de Lego por suscripción*: el suscriptor recibe un set, lo
disfruta y lo devuelve para coger otro.

Este change define el **MVP**, cuyo objetivo es demostrar el circuito completo
end-to-end (suscripción → selección → cola de reservas → alquiler → devolución →
inspección → vuelta a circulación), tanto desde la cara del **suscriptor** como
desde el **back-office** de la empresa (operadores + admin).

> El nombre "Clickoteca" = *click* (el clic de encajar piezas) + *-oteca*
> (biblioteca/colección → comunica el modelo de préstamo). Esquiva por completo la
> marca registrada LEGO®.

## What Changes

- **Cuentas y roles**: autenticación con 3 roles (suscriptor, operador, admin),
  datos de envío/contacto del suscriptor (logística simulada) y auditoría de
  "quién hizo qué" en cada transición.
- **Suscripciones**: planes *basic* (1 set) y *premium* (hasta 2 sets), con precio
  mensual configurable por plan; alquiler puntual sin suscripción con precio como
  % del valor de referencia del set; reglas de elegibilidad (antigüedad mínima
  para sets premium, no pedir nuevo set hasta completar devolución).
- **Catálogo e inventario**: modelo **Set** (modelo de catálogo, con valor de
  referencia) vs **Copia** (unidad física) con ciclo de vida de estados de la
  copia.
- **Alquileres y devoluciones**: solicitud/asignación, **registro de condición en
  la entrega**, devolución, **inspección** e **higienización** como pasos
  separados, gestión de copias incompletas/baja.
- **Cola de reservas**: cola por *Set* con **prioridad por envejecimiento**
  (aditiva: premium tiene ventaja fija, pero el tiempo de espera siempre acaba
  ganando), ventana de confirmación con aceptar/rechazar y caducidad.
- **Notificaciones**: catálogo de eventos que mantienen al suscriptor informado
  (te toca en la cola, recordatorios, devolución recibida, ya puedes pedir otro…).

## Impact

- **Affected specs (nuevas capabilities)**: `accounts-roles`, `subscriptions`,
  `catalog-inventory`, `rentals-returns`, `reservation-queue`, `notifications`.
- **Affected code**: greenfield. La rama `main` solo tiene scaffolding de
  documentación; este change establece el dominio del producto.

## Non-goals (fuera del MVP)

- **Pasarela de pagos real** — se simula (mock / datos de prueba).
- **Logística de mensajería** — el estado "en devolución" existe, pero el
  movimiento físico se marca manualmente por un operador.
- **Marketplace P2P** entre particulares — sólo inventario propio.
- **Reposición automatizada de piezas** — la copia incompleta se gestiona manual.
- **Verificación de identidad real** y **redacción legal** — secciones presentes
  con texto *lorem ipsum*; el titular debe ser adulto con tarjeta de crédito.
- **Penalización económica por pérdida de piezas** — no se contempla inicialmente.
