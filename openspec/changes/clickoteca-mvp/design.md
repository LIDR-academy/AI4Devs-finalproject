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
