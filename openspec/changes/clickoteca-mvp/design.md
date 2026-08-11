# Design: Clickoteca MVP

## Context

MVP que demuestra el flujo E2E de una biblioteca de Lego por suscripción con
inventario propio. Greenfield. El objetivo es modelar correctamente **estados** y
**flujos** del dominio, simulando lo que aún no se automatiza (pagos, logística),
con un humano (operador/admin) cubriendo esos huecos.

## Goals / Non-Goals

**Goals**
- Circuito E2E completo y demostrable: suscripción → cola → alquiler → devolución
  → inspección → higienización → de vuelta a disponible.
- Modelo de dominio correcto desde el día uno (Set/Copia, ciclo de vida, roles).
- Equidad real en la cola de reservas.

**Non-Goals** — ver `proposal.md` (pagos reales, logística, P2P, reposición
automática, verificación legal/identidad, penalizaciones).

## Decisions

### D1 — Modelo de dominio: Set vs Copia (dos niveles)
Un **Set** es el modelo de catálogo ("Millennium Falcon 75192": foto, nº piezas,
edad, tema, dificultad). Una **Copia** es una unidad física concreta que la
empresa posee; puede haber varias copias del mismo Set. El **estado** vive en la
Copia; la **cola de reservas** se hace sobre el Set; la **asignación** es de una
Copia concreta.
**Por qué**: permite tener varias copias de los sets más solicitados sin un
refactor doloroso. Coste bajo, beneficio alto.

### D2 — Ciclo de vida de una Copia
Estados: `INTAKE` → `DISPONIBLE` → (`OFRECIDA`) → `ALQUILADA` → `EN_DEVOLUCION`
→ `EN_INSPECCION` → `EN_HIGIENIZACION` → `DISPONIBLE`. Ramas: `INCOMPLETA`
(faltan piezas, esperando reposición), `BAJA` (pérdida/sustracción/daño
irreparable). Inspección e higienización son **estados separados** (dos checks de
operador). Orden elegido: inspección (completitud) antes que higienización
(limpieza); intercambiable sin coste.

```
INTAKE → DISPONIBLE ⇄ OFRECIDA → ALQUILADA → EN_DEVOLUCION → EN_INSPECCION
   pasa OK → EN_HIGIENIZACION → DISPONIBLE
   faltan piezas → INCOMPLETA → (repuesta) → EN_HIGIENIZACION | (no reparable) → BAJA
   daño irreparable → BAJA ;  pérdida en préstamo → BAJA
```

### D3 — Avisar a la cola DESPUÉS de inspección OK (Opción A1)
Cuando una copia se libera y hay cola, se ofrece al cabeza de cola **una vez la
inspección ha pasado** (estado pasa a DISPONIBLE/OFRECIDA), no durante la
inspección.
**Por qué**: evita "des-prometer" un set que resulta estar incompleto. Sin
logística/penalizaciones reales, el paralelismo aporta poco. Reversible si luego
se quiere optimizar velocidad.

### D4 — Prioridad de cola por envejecimiento (aditiva)
`score = días_esperando + bono_plan` (premium `+N`, basic `+0`; `N` configurable
por admin, p. ej. 10). Mayor score = más cerca de cabeza; empate → quien se encoló
antes.
**Por qué**: premium tiene una ventaja **fija**, pero el tiempo de espera siempre
acaba ganando (equidad). Se rechaza la versión **multiplicativa** porque haría
crecer la ventaja del premium con el tiempo — lo contrario de la equidad buscada.

### D5 — Ventana de confirmación de oferta
Al cabeza de cola se le ofrece la copia con una **ventana configurable por Set**.
Soporta **aceptar/rechazar explícito** (rechazo libera al instante). Recordatorio
a mitad de ventana. Si caduca sin respuesta → pierde el turno y **vuelve al final
con prioridad reducida** (no expulsado).
**Elegibilidad al ofrecer**: sólo se ofrece a quien *puede* recibir el set (no
tiene ya un set fuera según su plan / no supera su límite). El recorrido de la cola
**salta** a quien no es elegible en ese momento.

### D6 — Roles y permisos (3 roles)
`SUSCRIPTOR` (cliente), `OPERADOR` (empleado operativo) y `ADMIN` (gestión/config).
- **Dar de BAJA una copia → sólo ADMIN** (decisión con impacto económico; el
  operador *detecta* y marca INCOMPLETA/dañada, el admin confirma la baja).
- **Operador → lectura limitada del historial de cliente** (para soporte por
  teléfono/correo), no el perfil completo.
- **Auditoría**: cada transición de estado registra **quién** la realizó
  (campo "realizado por").

### D7 — Reglas de suscripción
- No se puede solicitar un nuevo set hasta que la devolución del anterior esté
  **completada** (copia en DISPONIBLE).
- **Antigüedad mínima** (p. ej. 3 meses de suscripción) para alquilar sets por
  encima de cierto precio/categoría (configurable).
- El set se retiene mientras dure la suscripción y se esté **al corriente de
  pago**. Para sets solicitados (con cola), el admin puede activar **recordatorios
  amables** cada X días al suscriptor que lo retiene.
- **No** se puede pausar/cancelar la suscripción con un set fuera: la devolución
  es **obligatoria**.
- **Límite de colas simultáneas por usuario** configurable (default 1, sube con
  antigüedad/cumplimiento).

### D8 — Registro de condición en la entrega
Además de la inspección al retorno (D2), se registra un checklist/foto de la copia
justo antes del envío, con confirmación tácita o discrepancia explícita del
suscriptor tras recibirla.
**Por qué**: sin un registro "antes", no se puede atribuir con certeza una rotura o
pieza perdida al periodo de alquiler de un suscriptor concreto — es la base
documental de cualquier reclamación por daño/pérdida. Coste bajo: mismo patrón que
la inspección de retorno, en sentido inverso.

### D9 — Precio de los planes (benchmarking de mercado)
`BASIC` 14,99€/mes (1 set, cambios ilimitados) y `PREMIUM` 24,99€/mes (2 sets
simultáneos), configurables por admin. Alquiler puntual = % configurable del valor
de referencia del Set (nuevo atributo en `catalog-inventory`).
**Por qué**: se ancla al competidor con la estructura más parecida a la nuestra —
**Brick Borrow** (UK): Mystery £9.99, Builder 1 set £14.99, Master 2 sets £24.99 —
en vez de a servicios con un modelo distinto (varios sets por envío: BrickDrop
$40–100/mes, NetBricks $24–99/mes), cuyo valor no es comparable (nosotros: un set
a la vez, cambios ilimitados mientras no haya devolución pendiente). Cifras en EUR
con paridad numérica sobre las de Brick Borrow en GBP, por simplicidad de MVP; a
revisar con datos reales de coste logístico.
**Explícitamente fuera de esto**: no se añade una franquicia de piezas perdidas
("missing piece allowance", común en BrickDrop) porque cobrar por pérdida de
piezas sigue siendo *non-goal* del MVP. El valor de referencia del Set se guarda
igualmente porque hace falta para el propio cálculo del alquiler puntual y como
base de una futura tabla de valoración legal.

### D10 — Modelo de datos (entidades y esquema Prisma)
El modelo de datos completo del MVP se documenta en `documents/PRD.md` §15 y se
implementa en `prisma/schema.prisma` (PostgreSQL + Prisma). Entidades por
anillos de importancia:
- **Núcleo del circuito:** `User`, `Set`, `Copy`, `Subscription`, `Rental`,
  `ReservationQueueEntry`, `ReservationOffer`.
- **Operación y trazabilidad:** `ConditionReport`, `Incident`,
  `CopyStateTransition`, `AuditLog`, `Notification`, `Shipment`.
- **Configuración y pagos (simulados):** `Plan`, `SystemSetting`,
  `RetentionReminderConfig`, `PaymentMethod`, `Payment`, `Address`, `Theme`,
  `MediaAsset`.

Los modelos Prisma van en inglés (convención) y mapean a los términos de dominio
en español de estas specs. Decisiones de modelado:
- **Un único `User` con `role`** (`SUBSCRIBER | OPERATOR | ADMIN`): no se modela una
  entidad `Employee` aparte en el MVP (coherente con D6). Solo se separaría si
  hicieran falta datos laborales (turnos, etc.).
- **`Rental.shippingAddress` como snapshot JSON inmutable** (no FK a `Address`):
  materializa la regla "editar la dirección solo afecta a envíos futuros"
  (`accounts-roles`).
- **`ReservationOffer` separada de `ReservationQueueEntry`**: una entrada de cola
  puede recibir varias ofertas a lo largo del tiempo (aceptar/rechazar/caducar y
  re-encolar, D5); modelarlas aparte hace triviales la ventana de confirmación y su
  auditoría.
- **`CopyStateTransition` (ciclo de vida) separada de `AuditLog` (genérico)**: la
  máquina de estados de la copia es de primera clase (D2); `AuditLog` cubre el resto
  de acciones admin.
- **`MediaAsset` polimórfico** (`ownerType` + `ownerId`, sin FK de BD): integridad
  validada en la aplicación, para adjuntar fotos tanto a `Set` como a
  `ConditionReport`.

### D11 — Orden de cola por `entrada_efectiva` inmutable (sin recálculo)
La ordenación de D4 se implementa **sin materializar ni recalcular un `score`**. Al
encolar se **congela el bono vigente** y se almacena una marca de entrada efectiva
**inmutable**: `entrada_efectiva = entrada − bono_aplicado` (el premium "entra
antes"). El orden de cola es siempre `ORDER BY entrada_efectiva ASC, id ASC`,
resuelto de forma **lazy** con un `LIMIT` indexado en el momento de ofrecer.
**Por qué**: como D4 es **aditiva** (no multiplicativa), la diferencia de score
entre dos entradas **no depende del instante `t`** → el orden es **invariante en el
tiempo** y nunca hace falta recalcular por el mero paso del tiempo. El orden solo
cambia por eventos **estructurales** (alta/baja en la cola), que se resuelven en la
propia inserción/borrado. Un cambio del bono `N` por el admin **solo afecta a nuevas
incorporaciones** (D4), así que `entrada_efectiva` se escribe **una vez y nunca se
reescribe**.
**Consecuencias**:
- Se **elimina el scheduler de recálculo de score**; el scheduler queda solo para
  eventos genuinamente temporales: **caducidad de ventana de oferta** (D5) y
  **recordatorios** (D7).
- **Granularidad**: `entrada_efectiva` es un `timestamptz` de precisión completa,
  **sin cuantizar** a días/horas. Cuantizar es lo que *crearía* empates; con
  timestamp crudo el empate solo ocurre por simultaneidad real, desempatada por `id`
  (coincide con "quien se encoló antes", D4).
- **Auditoría**: se conserva `bono_aplicado` en la entrada, de modo que la posición
  es explicable y un cambio de política **no reordena la cola retroactivamente**.
**Reemplaza** la versión anterior (score materializado + recálculo periódico), cuyo
supuesto ("la ordenación exige recálculo") era incorrecto precisamente por la
aditividad de D4. El "UC-P15 Calcular score de cola" del PRD se reinterpreta como el
cálculo de `entrada_efectiva` en el momento de encolar.

### D12 — Concurrencia: transiciones de estado guardadas (compare-and-swap)
Todas las mutaciones de estado del dominio (máquina de estados de la copia D2,
confirmación/caducidad de oferta D5) se ejecutan como **escrituras condicionadas al
estado esperado** (*compare-and-swap* sobre la propia columna de estado), **no**
mediante bloqueo/serialización global.
- **Patrón de una fila** (Prisma): `updateMany({ where: { id, state: <esperado> },
  data: {…} })`; si `count === 0`, la precondición falló → error de dominio **409
  Conflict** (`COPY_STATE_CONFLICT`). Ejemplo: si dos operadores mueven la copia
  #405 `EN_INSPECCION → EN_HIGIENIZACION`, la segunda obtiene `count === 0` y falla.
- Cubre con **un solo patrón** las tres carreras: operador-vs-operador,
  usuario-vs-scheduler y usuario-vs-usuario. La columna de estado **es** el cerrojo;
  no hacen falta locks explícitos.
- Invariantes **multi-fila** (p. ej. "ofrecer al cabeza de cola": leer cola + crear
  `ReservationOffer`) se envuelven en **transacción** con `SELECT … FOR UPDATE`
  sobre la copia, o un **índice único parcial** "una oferta activa por copia" que
  impide dos ofertas simultáneas.
**Por qué**: el dominio tiene **dos escritores concurrentes** (peticiones y
scheduler in-process) y transiciones sensibles al orden; el CAS hace que el perdedor
falle de forma **determinista** y barata, sin serializar todo el sistema. Cada
conflicto expone un `code` estable del contrato de errores RFC 9457
(`documents/ADR-0002-api-auth-errores.md`).

### D13 — Visitante = actor no autenticado con proyección pública (no un rol)
El **visitante** (usuario sin sesión) se modela como **actor no autenticado**, no como
un cuarto rol de `User`. Puede ver una **proyección pública** del catálogo (atributos
de Set de Sets publicados, **sin** disponibilidad ni cola), los **planes/condiciones**
de membresía y la **opción de alta**. La disponibilidad y todo lo de nivel `Copy`/cola
quedan tras autenticación.
**Por qué**: los tres roles (D6) son a nivel de cuenta y el visitante **no tiene
cuenta**; añadirlo al enum `Role` rompería la invariante "una cuenta = un rol" e
introduciría un valor que nunca se persiste. La frontera se traza en la **proyección
de datos** (público vs. autenticado), no en el catálogo entero: da descubribilidad/SEO
y empuja la conversión sin exponer el inventario en vivo. Coste de implementación bajo:
el middleware de auth ya distingue "hay sesión / no hay sesión".
**Cambio respecto al PRD original**: UC-P02 concedía al visitante ver "disponibilidad y
posición en cola"; con D13 eso pasa a exigir login. Reflejado en `accounts-roles`
(Requirement "Acceso público no autenticado"), `catalog-inventory` (Requirement
"Proyección pública del catálogo") y `documents/PRD.md` §3/§4.1/§14.1.

## Risks / Trade-offs

- **Integridad de piezas**: verificar completitud de un set de cientos/miles de
  piezas es el reto operativo central. Mitigación MVP: inspección manual como
  estado de primera clase; sin reposición automática.
- **Logística simulada**: el coste real de envío bidireccional puede superar la
  cuota; fuera del MVP, pero condicionará el modelo de negocio real.
- **Equidad vs conversión premium**: el bono `N` de la cola es la palanca de
  tensión; configurable para poder ajustarlo con datos reales.

## Open Questions

- Categorías/umbral exacto de "set premium" sujeto a antigüedad → a definir con
  datos del catálogo.
- Valores por defecto de ventana de confirmación y cadencia de recordatorios.

## Backlog (próxima iteración, fuera de este MVP)

- Búsqueda/filtro de catálogo (tema, edad, dificultad, disponibilidad).
- Panel de métricas para admin (utilización, tiempo medio en cola, sets más
  solicitados).
- Valoración/reseña del set por el suscriptor tras la devolución.
