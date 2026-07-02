# PRD: Clickoteca — MVP

> **Estado:** borrador para revisión. Sintetizado a partir de
> `openspec/changes/clickoteca-mvp/` (`proposal.md`, `design.md`, `specs/*`,
> `tasks.md`) y de las decisiones registradas en `prompts.md`/`AGENTS.md`. Dos
> secciones quedan explícitamente pendientes en vez de inventadas (§9 Diseño/UX
> y §10 Criterios de éxito) — ver notas en cada una.
>
> Última actualización: 2026-07-03.

## 1. Resumen

**Clickoteca** es una *biblioteca de sets de Lego por suscripción*: el
suscriptor recibe un set, lo disfruta y lo devuelve para pedir otro. Este PRD
cubre el **MVP**: el circuito completo end-to-end (suscripción → selección →
cola de reservas → alquiler → devolución → inspección → higienización → vuelta
a circulación), tanto desde la cara del **suscriptor** como desde el
**back-office** (operadores + admin).

> El nombre "Clickoteca" = *click* (el clic de encajar piezas) + *-oteca*
> (biblioteca/colección). Esquiva por completo la marca registrada LEGO®.

## 2. Problema y propuesta de valor

Los sets de Lego son caros, se montan una vez y luego ocupan espacio: coste +
almacenamiento + "ya me aburrí". Clickoteca resuelve ese dolor con un modelo de
préstamo: se paga una cuota mensual (o un alquiler puntual) para disfrutar sets
sin comprarlos ni quedárselos.

## 3. Usuarios y roles

El sistema soporta tres roles; cada cuenta tiene exactamente uno.

| Acción | Suscriptor | Operador | Admin |
|---|---|---|---|
| Gestionar su cuenta, ver catálogo, solicitar sets, entrar en colas, confirmar ofertas, iniciar devoluciones | ✅ | – | – |
| Acceso al back-office | ❌ | ✅ | ✅ |
| Alta de copias y avance por su ciclo de vida (recepción, inspección, higienización), marcar incidencias | – | ✅ | ✅ |
| Historial de cliente | – | Lectura limitada (soporte) | Completo |
| Dar de **BAJA** una copia | ❌ | ❌ (solo detecta/marca incompleta o dañada) | ✅ |
| Configurar planes/reglas/parámetros, gestionar empleados | ❌ | ❌ | ✅ |

Cada transición de estado y cada acción administrativa registra **quién** la
realizó y **cuándo** (auditoría).

## 4. Alcance funcional del MVP

### 4.1 Cuentas y roles
- Autenticación con los 3 roles anteriores.
- Alta de suscriptor: declaración de mayoría de edad + tarjeta (simulada) +
  dirección de envío/contacto (obligatoria; sin ella no se completa el alta) +
  aceptación de condiciones (texto *lorem ipsum* en el MVP).
- Actualizar la dirección de envío afecta a envíos futuros, no a los ya
  registrados.

### 4.2 Catálogo e inventario
- **Set** (modelo de catálogo: foto, nº de piezas, edad recomendada, tema,
  dificultad, **valor de referencia**) vs. **Copia** (unidad física concreta;
  un Set puede tener varias Copias, cada una con su propio estado).
- Un Set no puede publicarse sin valor de referencia.
- Ciclo de vida de la Copia (estados y transiciones válidas únicamente las
  aquí definidas):

  ```
  INTAKE → DISPONIBLE ⇄ OFRECIDA → ALQUILADA → EN_DEVOLUCION → EN_INSPECCION
     pasa OK → EN_HIGIENIZACION → DISPONIBLE
     faltan piezas → INCOMPLETA → (repuesta) → EN_HIGIENIZACION | (no reparable) → BAJA
     daño irreparable → BAJA ;  pérdida en préstamo → BAJA
  ```
- Seed del catálogo: dataset público de Rebrickable (nombre, año, tema, nº
  piezas, foto de caja); edad recomendada y dificultad curadas a mano para el
  subconjunto semilla (no cubiertas por ese dataset).

### 4.3 Suscripciones y alquiler puntual

| Plan | Sets simultáneos | Precio/mes |
|---|---|---|
| BASIC | 1 | 14,99 € (configurable) |
| PREMIUM | hasta 2 | 24,99 € (configurable) |
| Alquiler puntual (sin suscripción) | 1, por periodo pactado | % configurable del valor de referencia del Set, con mínimo configurable |

Precios anclados a Brick Borrow (UK), el competidor con estructura más
parecida (1 set / 2 sets simultáneos con cambios ilimitados) — detalle del
benchmarking en `design.md` D9.

Reglas adicionales:
- No se puede solicitar un nuevo set hasta que la devolución del anterior esté
  **completada** (copia en `DISPONIBLE`); mientras tanto, esa copia sigue
  contando contra el límite del plan.
- Antigüedad mínima configurable (p. ej. 3 meses) para sets marcados como
  restringidos por precio/categoría.
- No se puede pausar/cancelar la suscripción con una copia en su poder — ver
  §4.7 (camino feliz de cancelación).
- Límite de colas simultáneas por usuario, configurable (default 1, ampliable
  con antigüedad/cumplimiento).

### 4.4 Alquileres y devoluciones
- Solicitud de un Set: si hay copia `DISPONIBLE` se asigna directamente
  (pasa a `ALQUILADA`); si no, se ofrece entrar en la cola (§4.5).
- **Registro de condición en la entrega**: antes de enviar, un operador
  registra un checklist/foto de referencia (con auditoría); el suscriptor,
  dentro de una ventana breve tras recibir la copia, puede confirmar
  conformidad (tácita si no dice nada) o reportar una discrepancia — si la
  reporta, se abre una incidencia de back-office **sin imputársela**.
- El suscriptor inicia la devolución cuando quiere (copia → `EN_DEVOLUCION`,
  con registro/formulario de recogida; logística simulada en el MVP).
- Un operador registra la recepción (→ `EN_INSPECCION`, auditoría), verifica
  completitud e higieniza como **paso separado** posterior a una inspección
  OK.
- La copia liberada solo se ofrece a la cola **después** de que la inspección
  haya dado OK (nunca durante), para no "desprometer" un set que resulte
  incompleto.

### 4.5 Cola de reservas
- Una cola por Set. Orden por `score = días_esperando + bono_plan` (bono fijo
  configurable para PREMIUM, p. ej. +10; +0 para BASIC); empate → quien se
  encoló antes. El tiempo de espera siempre puede superar la ventaja premium.
- Al liberarse una copia, se ofrece al primer elegible (que no supere el
  límite de su plan ni tenga una devolución pendiente que lo bloquee),
  saltando a quien no lo sea.
- Ventana de confirmación configurable por Set: aceptar (asigna la copia y
  sale de la cola) o rechazar explícito (pasa al instante al siguiente
  elegible); recordatorio a mitad de ventana; si caduca sin respuesta, pierde
  el turno y vuelve al **final** de la cola con prioridad reducida (no
  expulsado).

### 4.6 Notificaciones
Al suscriptor: te toca en la cola (+ ventana para confirmar), recordatorio a
mitad de ventana, confirmación de alquiler, recordatorio amable de retención
(cada X días configurable, si hay cola y el admin lo activó para ese set),
devolución recibida (en inspección), devolución completada (ya puede pedir
otro).
Al back-office: devolución incompleta detectada, copia dada de baja.

### 4.7 Otras funcionalidades del suscriptor
- **"Mis sets"**: vista con los sets actualmente en préstamo, histórico de
  alquileres pasados y posición en la(s) cola(s) activa(s).
- **Cancelación (camino feliz)**: solo cuando el suscriptor no tiene ninguna
  copia en su poder; el sistema confirma que no hay devoluciones pendientes
  ni saldo pendiente antes de completar la baja.

## 5. Fuera de alcance (Non-goals del MVP)

- Pasarela de pagos real (se simula).
- Logística de mensajería real (el estado "en devolución" existe, pero el
  movimiento físico lo marca manualmente un operador).
- Marketplace P2P entre particulares — solo inventario propio.
- Reposición automatizada de piezas — la copia incompleta se gestiona a mano.
- Verificación de identidad real y redacción legal real (texto *lorem ipsum*;
  el titular debe declarar ser adulto con tarjeta de crédito).
- Penalización económica por pérdida de piezas.

## 6. Flujo end-to-end del suscriptor

1. **Alta**: se registra, declara mayoría de edad, aporta tarjeta (simulada),
   dirección de envío/contacto, acepta condiciones.
2. **Elige plan** (BASIC/PREMIUM) o entra sin suscripción para un alquiler
   puntual.
3. **Solicita un Set** del catálogo → asignación directa si hay copia
   disponible, o entra en cola si no.
4. **En cola** (si aplica): espera su turno; el score combina antigüedad en
   cola y bono de plan.
5. **Le toca**: recibe la oferta con ventana de confirmación → acepta,
   rechaza, o la deja caducar (con recordatorio a mitad de ventana).
6. **Entrega**: un operador registra la condición de la copia antes de
   enviarla; el suscriptor confirma conformidad o reporta discrepancia al
   recibirla.
7. **Disfruta el set**: consultable en "Mis sets"; si hay cola para ese set y
   el admin activó recordatorios, los recibe periódicamente.
8. **Inicia devolución** cuando quiere cambiar de set.
9. **Operador recibe e inspecciona**: completo → higienización → disponible
   (u ofrecida si hay cola); incompleto → incidencia de back-office; daño
   irreparable o pérdida → un admin da la copia de baja.
10. **Nuevo set**: solo puede solicitarlo cuando su devolución anterior está
    completada (copia en `DISPONIBLE`).
11. **Cancelación** (opcional, camino feliz): solo sin copias en su poder ni
    pendientes.

## 7. Reglas de negocio clave (resumen transversal)

- Modelo Set (catálogo) vs. Copia (unidad física) en dos niveles — permite
  varias copias del mismo set sin refactor.
- Inspección e higienización son **dos pasos separados** de operador (en ese
  orden; intercambiable sin coste).
- Prioridad de cola **aditiva**, nunca multiplicativa (evita que la ventaja
  premium crezca con el tiempo — sería lo contrario de la equidad buscada).
- Dar de baja una copia es **decisión exclusiva de ADMIN** (impacto
  económico); el operador solo detecta y marca.
- Auditoría "quién/cuándo" en toda transición de estado y acción admin.

## 8. Consideraciones legales y de cumplimiento (MVP simulado)

El MVP usa contenido de relleno (*lorem ipsum*) para todo lo legal y no
implementa verificación de identidad real (non-goal, §5). Aun así, un
lanzamiento real necesitaría, como mínimo:

- Términos y condiciones del servicio de suscripción/préstamo.
- Tabla de valoración de sets/piezas — base documental para reclamaciones por
  pérdida o rotura (por eso se guarda el valor de referencia del Set desde
  ahora, aunque no se cobre penalización en el MVP).
- Autorización de cargo recurrente sobre la tarjeta (simulada en el MVP).
- Plantilla de requerimiento fehaciente para impago o no devolución.
- Cumplimiento RGPD (datos personales y dirección de envío del suscriptor).
- Derecho de desistimiento (normativa UE de consumidores para contratos a
  distancia/suscripción).
- Hoja de reclamaciones y enlace a la plataforma de resolución de litigios en
  línea (ODR) de la UE.

## 9. Diseño y experiencia de usuario

**Pendiente** — no hay mockups ni wireframes todavía (`readme.md` §1.3 sigue
vacío). Recomendado producirlos como siguiente paso, una vez cerrado el stack
de frontend (la librería de componentes elegida condiciona el sistema de
diseño). No se inventan pantallas en este PRD para no dar una falsa sensación
de que el UX ya está decidido.

## 10. Criterios de éxito del MVP

Este MVP es un proyecto académico (AI4Devs/Lidr) que **no escalará a
producción**, así que no aplican KPIs de negocio (conversión, churn, MRR...).
Se define el éxito como:

- Circuito E2E completo y **demostrable**, desde ambas caras (suscriptor y
  back-office): suscripción → cola → alquiler → devolución → inspección →
  higienización → de vuelta a disponible.
- `openspec validate clickoteca-mvp --strict` en verde (`tasks.md` 8.5).
- Cobertura de tests priorizando caminos de error y casos límite, no solo el
  camino feliz (criterio no negociable fijado en `tasks.md`).

## 11. Riesgos y trade-offs

- **Integridad de piezas**: verificar la completitud de un set de
  cientos/miles de piezas es el reto operativo central. Mitigación del MVP:
  inspección manual como estado de primera clase, sin reposición automática.
- **Logística simulada**: el coste real de envío bidireccional puede superar
  la cuota; queda fuera del MVP pero condicionará el modelo de negocio real.
- **Equidad vs. conversión premium**: el bono de cola es la palanca de
  tensión entre ambas; se deja configurable para poder ajustarlo con datos
  reales.

## 12. Preguntas abiertas y backlog (próxima iteración)

**Abiertas:**
- Categorías/umbral exacto de "set premium" sujeto a antigüedad mínima — a
  definir con datos reales del catálogo.
- Valores por defecto de la ventana de confirmación y de la cadencia de
  recordatorios.

**Backlog (fuera de este MVP):**
- Búsqueda/filtro de catálogo (tema, edad, dificultad, disponibilidad).
- Panel de métricas para admin (utilización, tiempo medio en cola, sets más
  solicitados).
- Valoración/reseña del set por el suscriptor tras la devolución.

## 13. Referencias

- `openspec/changes/clickoteca-mvp/proposal.md`
- `openspec/changes/clickoteca-mvp/design.md` (decisiones D1–D9)
- `openspec/changes/clickoteca-mvp/specs/{accounts-roles, catalog-inventory, subscriptions, rentals-returns, reservation-queue, notifications}/spec.md`
- `openspec/changes/clickoteca-mvp/tasks.md`
- `prompts.md` (log de decisiones, 2026-07-02 y 2026-07-03)
