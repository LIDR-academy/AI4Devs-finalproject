# Historias de Usuario — Clickoteca MVP

> **Estado:** borrador para revisión. Redactado **únicamente** a partir de la
> documentación existente del proyecto: `documents/PRD.md` (especialmente §4
> Alcance funcional, §6 Flujo E2E y §14 Casos de uso), las specs OpenSpec en
> `openspec/changes/clickoteca-mvp/specs/*` y el modelo de datos de `PRD.md` §15.
> No se inventan pantallas ni reglas nuevas: donde la documentación deja algo
> abierto, la historia lo refleja como tal.
>
> Última actualización: 2026-08-16 — HU-01 absorbe la elección de plan, HU-02 pasa a
> ser **cambio** de plan y el **alquiler puntual sale del alcance**
> (ver `ux-flows.md` §8.1).

## Cómo leer este documento

- **Formato.** Cada historia sigue la plantilla *rol → objetivo → beneficio* y
  añade **criterios de aceptación** en notación Gherkin (Dado/Cuando/Entonces),
  tomados de los escenarios de las specs cuando existen.
- **Prioridad (MoSCoW).** `Must` = imprescindible para el circuito E2E
  demostrable (criterio de éxito del MVP, `PRD.md` §10); `Should` = necesaria
  para un MVP completo pero no bloquea la demo mínima.
- **Trazabilidad.** Cada historia enlaza su **caso de uso** (`PRD.md` §14),
  su **capability/spec** y las **reglas de negocio** que la gobiernan.
- **Selección para `readme.md` §5.** El entregable pide 3 historias. Las tres
  marcadas con ⭐ son las candidatas recomendadas por cubrir los rasgos
  distintivos del producto (cola justa, doble paso operativo, entrega con
  registro de condición). El resto completa la cobertura del circuito.

Las historias se agrupan por las tres superficies de actores del sistema
(`PRD.md` §3): **Suscriptor**, **Back-office (Operador/Admin)** y **Sistema**
(procesos automáticos del backend).

---

## A. Portal del Suscriptor

### HU-00 · Explorar el catálogo y los planes como visitante `Must`
**Como** visitante (usuario sin registrar)
**quiero** ver los sets que se ofrecen y las condiciones de membresía
**para** decidir si me interesa suscribirme antes de crear una cuenta.

- **Trazabilidad:** UC-P01 / UC-P02 / UC-P03 · `accounts-roles` / `catalog-inventory` · `PRD.md` §4.1, `design.md` D13
- **Nota:** el visitante es un **actor no autenticado**, no un rol de cuenta; la
  frontera se traza en la proyección de datos (pública vs. autenticada).
- **Criterios de aceptación:**
  - **Dado** un usuario sin sesión,
    **cuando** entra en la plataforma,
    **entonces** puede explorar el catálogo de Sets publicados (foto, nº de piezas,
    tema, dificultad) y ver los planes de membresía con sus condiciones y la opción
    de alta.
  - **Dado** un visitante en la ficha de un Set,
    **cuando** la consulta,
    **entonces** **no** ve la disponibilidad de copias ni la posición en cola
    (proyección pública).
  - **Dado** un visitante,
    **cuando** intenta solicitar un set o unirse a una cola,
    **entonces** la acción es **rechazada** y se le pide registrarse o iniciar
    sesión.

---

### HU-01 · Alta de suscriptor, con plan `Must`
**Como** visitante mayor de edad
**quiero** registrarme eligiendo plan y aportando mi tarjeta, mi dirección de envío y aceptando las condiciones
**para** quedar listo para alquilar sets sin ningún paso intermedio.

- **Trazabilidad:** UC-P03 / UC-P05 · `accounts-roles` / `subscriptions` · `PRD.md` §4.1, §4.3
- **Decisión (2026-08-16):** la **elección de plan forma parte del alta**. No existe
  el estado "cuenta creada pero sin plan": el alta que no elige plan no se completa.
  Ver `ux-flows.md` §8.1.
- **Criterios de aceptación:**
  - **Dado** un visitante que rellena el formulario de alta,
    **cuando** declara ser mayor de edad, **elige BASIC o PREMIUM**, aporta una
    tarjeta (simulada), una dirección de envío/contacto y acepta las condiciones
    (*lorem ipsum*),
    **entonces** se crea su cuenta con rol `SUBSCRIBER` **y su suscripción activa
    en el plan elegido**, en la misma transacción.
  - **Dado** un alta **sin plan elegido**,
    **cuando** intenta completarse,
    **entonces** el sistema **rechaza** el alta indicando que el plan es
    obligatorio, junto con el resto de errores de validación.
  - **Dado** un alta sin dirección de envío,
    **cuando** intenta completarse,
    **entonces** el sistema **rechaza** el alta indicando que la dirección es
    obligatoria.
  - **Dado** un suscriptor que actualiza su dirección,
    **cuando** guarda el cambio,
    **entonces** afecta a envíos **futuros** y no a los ya registrados.

---

### HU-02 · Cambiar de plan `Must`
**Como** suscriptor con un plan activo
**quiero** pasar de BASIC a PREMIUM o al revés
**para** ajustar cuántos sets simultáneos puedo tener y cuánto pago.

- **Trazabilidad:** UC-P05 · `subscriptions` · `PRD.md` §4.3
- **Decisión (2026-08-16):** esta historia ya **no** cubre la contratación inicial
  (pasa a HU-01) **ni el alquiler puntual**, que sale del alcance del MVP. El cambio
  es siempre **entre BASIC y PREMIUM**, sobre una suscripción existente.
- **Criterios de aceptación:**
  - **Dado** un suscriptor **BASIC**,
    **cuando** pasa a **PREMIUM**, **entonces** puede tener **hasta 2** sets
    simultáneos a la cuota configurada (por defecto 24,99 €/mes) y obtiene el bono
    de prioridad de cola. El cambio es **inmediato**.
  - **Dado** un suscriptor **PREMIUM** con **menos sets fuera de los que permite
    BASIC**,
    **cuando** pasa a **BASIC**, **entonces** el cambio se aplica y su límite pasa
    a 1 set simultáneo.
  - **Dado** un suscriptor **PREMIUM con 2 sets en su poder**,
    **cuando** intenta bajar a **BASIC**, **entonces** la acción es **rechazada**
    indicando cuántos sets debe devolver primero — mismo criterio que el de
    pausar/cancelar (HU-09): primero devuelves, luego cambias.
  - **Dado** un suscriptor que ya está en el plan que solicita,
    **cuando** lo pide otra vez, **entonces** la acción no tiene efecto y no se
    registra un cambio.
  - **Dado** un suscriptor con entradas de cola vivas,
    **cuando** cambia de plan, **entonces** el bono de esas entradas **no se
    recalcula**: `appliedBonus` se congeló al encolar (D11) y el plan nuevo solo
    afecta a las colas en las que entre a partir de ahora.

---

### HU-03 · Solicitar un set con copia disponible ⭐ `Must`
**Como** suscriptor elegible
**quiero** solicitar un set del catálogo
**para** recibirlo y disfrutarlo en casa.

- **Trazabilidad:** UC-P06 · `rentals-returns` · `PRD.md` §4.4
- **Criterios de aceptación:**
  - **Dado** un Set con al menos una copia `DISPONIBLE`,
    **cuando** un suscriptor elegible lo solicita,
    **entonces** se le asigna una copia concreta, que pasa a `ALQUILADA`.
  - **Dado** un Set **sin** copias disponibles,
    **cuando** el suscriptor lo solicita,
    **entonces** el sistema le ofrece **entrar en la cola** de reservas (ver
    HU-04), no se le asigna copia.
  - **Dado** un suscriptor con una devolución anterior aún **no completada**
    (copia no en `DISPONIBLE`),
    **cuando** intenta solicitar un nuevo set que superaría el límite de su plan,
    **entonces** la solicitud es **rechazada** por elegibilidad.

---

### HU-04 · Unirse a la cola de reservas ⭐ `Must`
**Como** suscriptor que quiere un set sin copias libres
**quiero** unirme a su cola con una prioridad justa
**para** conseguir el set cuando se libere, sin que el dinero pase por encima de la espera.

- **Trazabilidad:** UC-P07 / UC-P15 · `reservation-queue` · `PRD.md` §4.5
- **Criterios de aceptación:**
  - **Dado** un suscriptor elegible ante un Set sin copias,
    **cuando** acepta encolarse,
    **entonces** se crea su entrada de cola con la marca de tiempo de
    incorporación y `score = días_esperando + bono_plan`.
  - **Dado** un `PREMIUM` y un `BASIC` encolados en el mismo instante,
    **cuando** se ordena la cola,
    **entonces** el `PREMIUM` va por delante por su bono fijo.
  - **Dado** un `BASIC` que lleva esperando suficientes días,
    **cuando** su `score` supera al de un `PREMIUM` recién encolado,
    **entonces** el `BASIC` se ordena por delante (la espera siempre puede
    superar la ventaja premium — prioridad **aditiva**, nunca multiplicativa).
  - **Dado** un usuario que ya está en su límite de colas simultáneas
    (configurable, por defecto 1),
    **cuando** intenta unirse a otra,
    **entonces** la acción es **rechazada** indicando el límite.

---

### HU-05 · Confirmar (o rechazar) una oferta de cola ⭐ `Must`
**Como** suscriptor al que le llega el turno
**quiero** aceptar o rechazar la copia dentro de una ventana de confirmación
**para** no perder mi sitio por descuido y liberar el turno al instante si no la quiero.

- **Trazabilidad:** UC-P08 / UC-P09 (+ UC-P16 Sistema) · `reservation-queue` · `PRD.md` §4.5
- **Criterios de aceptación:**
  - **Dado** un suscriptor con una oferta abierta,
    **cuando** la **acepta** dentro de la ventana,
    **entonces** se le asigna la copia (pasa a `ALQUILADA`) y abandona la cola.
  - **Dado** un suscriptor con una oferta abierta,
    **cuando** la **rechaza** explícitamente,
    **entonces** la oferta pasa **de inmediato** al siguiente elegible, sin
    esperar al vencimiento.
  - **Dado** que transcurre la **mitad** de la ventana sin respuesta,
    **cuando** el sistema lo detecta,
    **entonces** envía un **recordatorio** al suscriptor ofertado.
  - **Dado** que la ventana **caduca** sin respuesta,
    **cuando** vence,
    **entonces** el suscriptor **pierde el turno y vuelve al final de la cola
    con prioridad reducida** (no es expulsado) y la oferta pasa al siguiente
    elegible.

---

### HU-06 · Consultar «Mis sets», historial y posición en cola `Should`
**Como** suscriptor
**quiero** ver mis sets en préstamo, mi historial y mi posición en las colas activas
**para** saber qué tengo, qué he tenido y cuánto me falta para el próximo.

- **Trazabilidad:** UC-P10 · `PRD.md` §4.7
- **Criterios de aceptación:**
  - **Dado** un suscriptor autenticado,
    **cuando** abre «Mis sets»,
    **entonces** ve los sets actualmente en préstamo, el histórico de alquileres
    pasados y su posición en cada cola en la que espera.

---

### HU-07 · Reportar discrepancia en la entrega `Should`
**Como** suscriptor que acaba de recibir una copia
**quiero** avisar si no coincide con el registro de condición
**para** que no se me impute un daño o falta que ya venía de origen.

- **Trazabilidad:** UC-P12 · `rentals-returns` · `PRD.md` §4.4
- **Criterios de aceptación:**
  - **Dado** un suscriptor dentro de la ventana breve tras recibir la copia,
    **cuando** reporta que está dañada o incompleta respecto al registro,
    **entonces** se abre una **incidencia de back-office** y **no se le imputa**
    la discrepancia.
  - **Dado** que la ventana transcurre sin que reporte nada,
    **cuando** vence,
    **entonces** se asume la entrega **conforme** al registro de condición
    (confirmación tácita).

---

### HU-08 · Iniciar la devolución de un set ⭐ `Must`
**Como** suscriptor
**quiero** iniciar la devolución cuando quiera cambiar de set
**para** liberar mi cupo y poder pedir el siguiente.

- **Trazabilidad:** UC-P13 · `rentals-returns` · `PRD.md` §4.4
- **Criterios de aceptación:**
  - **Dado** un suscriptor con una copia `ALQUILADA`,
    **cuando** inicia la devolución,
    **entonces** la copia transita a `EN_DEVOLUCION` y se genera un
    registro/formulario de recogida (logística simulada en el MVP).
  - **Dado** que la devolución no está **completada** (copia aún no en
    `DISPONIBLE`),
    **cuando** el suscriptor intenta pedir un nuevo set que superaría su límite,
    **entonces** la copia devuelta **sigue contando** contra el límite del plan.

---

### HU-09 · Cancelar o pausar la suscripción (camino feliz) `Should`
**Como** suscriptor
**quiero** cancelar o pausar mi suscripción cuando no tengo nada prestado
**para** dejar de pagar sin trámites cuando estoy al día.

- **Trazabilidad:** UC-P14 · `subscriptions` · `PRD.md` §4.7
- **Criterios de aceptación:**
  - **Dado** un suscriptor **sin copias en su poder** ni saldo/devoluciones
    pendientes,
    **cuando** solicita la baja/pausa,
    **entonces** el sistema confirma que no hay pendientes y completa la baja.
  - **Dado** un suscriptor con una copia todavía en su poder,
    **cuando** intenta cancelar/pausar,
    **entonces** la acción es **rechazada**.

---

## B. Back-office (Operador / Admin)

### HU-10 · Dar de alta una copia `Must`
**Como** operador
**quiero** registrar una nueva unidad física de un Set y catalogarla
**para** ponerla en circulación como copia disponible.

- **Trazabilidad:** UC-B02 · `catalog-inventory` · `PRD.md` §4.2
- **Criterios de aceptación:**
  - **Dado** un Set **con valor de referencia** definido,
    **cuando** un operador da de alta una copia y completa su catalogación,
    **entonces** la copia transita `INTAKE → DISPONIBLE`.
  - **Dado** un Set **sin valor de referencia**,
    **cuando** se intenta publicarlo,
    **entonces** la publicación es **rechazada**.
  - Solo se permiten las **transiciones de estado válidas** definidas en el
    ciclo de vida de la copia (`PRD.md` §15.5); cualquier otra es rechazada.

---

### HU-11 · Registrar la condición de la copia antes del envío ⭐ `Must`
**Como** operador
**quiero** documentar el estado de la copia (checklist/foto) antes de enviarla
**para** tener una referencia auditable con la que resolver discrepancias.

- **Trazabilidad:** UC-B03 · `rentals-returns` · `PRD.md` §4.4
- **Criterios de aceptación:**
  - **Dado** una copia recién asignada (`ALQUILADA`) pendiente de envío,
    **cuando** el operador prepara el envío,
    **entonces** se registra un checklist/fotografía del estado junto con el
    **operador y el instante** (auditoría).

---

### HU-12 · Recepcionar e inspeccionar una devolución `Must`
**Como** operador
**quiero** registrar la recepción de una copia devuelta y verificar su completitud
**para** decidir si vuelve a circulación o requiere una incidencia.

- **Trazabilidad:** UC-B04 / UC-B05 · `rentals-returns` · `PRD.md` §4.4
- **Criterios de aceptación:**
  - **Dado** una copia en `EN_DEVOLUCION`,
    **cuando** el operador la marca como recibida,
    **entonces** transita a `EN_INSPECCION` y se **registra el operador** que la
    recepcionó (auditoría).
  - **Dado** una copia en `EN_INSPECCION` que supera la verificación,
    **cuando** la inspección da **OK**,
    **entonces** pasa a `EN_HIGIENIZACION`.
  - **Dado** una copia a la que **faltan piezas**,
    **cuando** se inspecciona,
    **entonces** pasa a `INCOMPLETA` y se genera una incidencia (ver HU-13).

---

### HU-13 · Higienizar la copia y devolverla a circulación `Must`
**Como** operador
**quiero** higienizar la copia como paso separado tras una inspección OK
**para** que vuelva limpia a estar disponible o se ofrezca a quien espera en cola.

- **Trazabilidad:** UC-B06 · `rentals-returns` · `PRD.md` §4.4 / §7
- **Criterios de aceptación:**
  - **Dado** una copia que **superó la inspección**,
    **cuando** el operador completa la higienización,
    **entonces** la copia queda `DISPONIBLE`, **o** `OFRECIDA` si hay cola activa
    para ese Set.
  - **Dado** un Set con cola,
    **cuando** una copia termina la higienización y queda lista,
    **entonces** se inicia la oferta al **cabeza de cola elegible** — **nunca
    durante** la inspección, solo después de que esté lista.
  - La higienización es un **paso separado y posterior** a la inspección (no se
    fusiona con ella).

---

### HU-14 · Marcar una copia incompleta o dañada `Should`
**Como** operador
**quiero** registrar cuando una copia devuelta viene incompleta o dañada
**para** apartarla del circuito y escalar su reposición o baja.

- **Trazabilidad:** UC-B07 · `catalog-inventory` · `PRD.md` §4.2
- **Criterios de aceptación:**
  - **Dado** una copia en inspección con piezas faltantes o daño,
    **cuando** el operador la marca,
    **entonces** queda en `INCOMPLETA`, pendiente de reposición o de baja por
    admin, y se genera la notificación interna correspondiente.
  - **Dado** una copia `INCOMPLETA` con piezas **repuestas**,
    **cuando** se resuelve,
    **entonces** pasa a `EN_HIGIENIZACION`.
  - El operador **detecta y marca**, pero **no puede dar de baja** la copia
    (ver HU-15).

---

### HU-15 · Dar de baja una copia (solo Admin) `Should`
**Como** admin
**quiero** ser el único que puede dar de baja una copia
**para** controlar una decisión con impacto económico.

- **Trazabilidad:** UC-B09 · `accounts-roles` / `catalog-inventory` · `PRD.md` §3, §7
- **Criterios de aceptación:**
  - **Dado** una copia con daño irreparable, pérdida o sustracción,
    **cuando** un **admin** la da de baja,
    **entonces** transita a `BAJA` y queda fuera de circulación.
  - **Dado** un **operador** (no admin),
    **cuando** intenta dar de baja una copia,
    **entonces** la acción es **rechazada** por permisos.
  - La transición a `BAJA` queda registrada con **quién y cuándo** (auditoría).

---

### HU-16 · Configurar las reglas del sistema (solo Admin) `Should`
**Como** admin
**quiero** ajustar los parámetros del negocio
**para** afinar equidad, precios y límites sin tocar código.

- **Trazabilidad:** UC-B10 / UC-B11 / UC-B12 · `subscriptions` / `reservation-queue` · `PRD.md` §4
- **Criterios de aceptación:**
  - **Dado** un admin,
    **cuando** edita la configuración,
    **entonces** puede fijar: precio de BASIC/PREMIUM, **bono de cola** premium,
    **duración de la ventana de confirmación**, **antigüedad mínima** para sets
    restringidos y **límite de colas simultáneas** por usuario.
    *(Los parámetros del alquiler puntual —% y mínimo— desaparecen con la decisión
    del 2026-08-16.)*
  - **Dado** un admin,
    **cuando** activa los recordatorios de retención para un Set con cola,
    **entonces** el suscriptor que lo retiene recibe recordatorios periódicos
    según la cadencia configurada.
  - Estas acciones de configuración son **exclusivas de admin** y quedan en
    `AuditLog`.

---

## C. Sistema (procesos automáticos)

### HU-17 · Mantener la equidad de la cola (entrada efectiva inmutable) `Must`
**Como** sistema
**quiero** fijar la prioridad de cada entrada al encolar mediante una entrada efectiva inmutable
**para** que el orden refleje el envejecimiento aditivo sin recálculos y de forma auditable.

- **Trazabilidad:** UC-P15 / UC-P16 / UC-P17 · `reservation-queue` · `PRD.md` §15.1, `design.md` D11
- **Criterios de aceptación:**
  - **Dado** un suscriptor que se encola,
    **cuando** se crea su entrada,
    **entonces** se congela el bono de plan (`appliedBonus`) y se calcula, **una
    sola vez**, `effectiveEntryAt = enqueuedAt − appliedBonus`.
  - **Dado** que transcurre el tiempo sin altas ni bajas en la cola,
    **cuando** se consulta el orden,
    **entonces** el orden relativo **no cambia** y no se recalcula ninguna
    puntuación (la prioridad aditiva hace el orden invariante en el tiempo).
  - **Dado** una copia liberada tras inspección OK,
    **cuando** se ofrece,
    **entonces** solo se ofrece a entradas cuyo suscriptor es **elegible** (no
    supera el límite de su plan ni tiene una devolución bloqueante), **saltando**
    a los no elegibles.
  - **Dado** una oferta que caduca y re-encola al suscriptor,
    **cuando** vuelve a la cola,
    **entonces** se le asigna una **nueva** `effectiveEntryAt` (al final) que
    incorpora la **penalización de prioridad**.

---

## Cobertura y notas

- **Circuito E2E** (`PRD.md` §6) cubierto por HU-00 (descubrimiento como
  visitante) → HU-01 → HU-05 (alta, plan, solicitud, cola, confirmación) →
  HU-11/HU-08 (entrega/devolución) → HU-12/HU-13 (inspección/higiene) → HU-06
  (visibilidad) → HU-09 (cierre), con HU-17 como motor de equidad transversal.
- **Fuera de alcance** (no generan historia, `PRD.md` §5): pasarela de pago
  real, logística real, marketplace P2P, reposición automática de piezas,
  verificación de identidad real, penalización económica por pérdida, y —desde el
  **2026-08-16**— el **alquiler puntual sin suscripción**: alquilar exige plan.
- **Pendiente en la documentación** (no inventado aquí): sistema de diseño y
  wireframes (`PRD.md` §9; los **flujos por rol** ya están en `ux-flows.md`) y
  valores por defecto de ventana de confirmación y cadencia de recordatorios
  (`PRD.md` §12) — condicionan la redacción fina de algunos criterios, marcados
  como *configurables*.
- **Para `readme.md` §5** (3 historias): se recomiendan las marcadas con ⭐ —
  **HU-04** (cola justa), **HU-05** (ventana de confirmación) y **HU-11+HU-13**
  (registro de condición + doble paso inspección/higiene) — por ser los rasgos
  que distinguen a Clickoteca de un simple alquiler.
