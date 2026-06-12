# Issue-003: Resolver gaps de dependencias antes de crear tickets de trabajo

**Fecha:** 2026-06-10
**Actualizado:** 2026-06-12
**Contexto:** Análisis de dependencias entre las 14 US previo a generar tickets técnicos.

---

## Decisiones Tomadas

### 1. 🔴 No existe transición booking → completed

**Problema:** US0013 (Calificar) requiere que un booking tenga status `completed`. US0009 lo deja en `confirmed`. Nadie lo marca como completado.

**Decisión: D) Cliente confirma asistencia (agregar CA en US0010)**

Las reservas confirmadas cuya fecha ya pasó muestran botón "Confirmar asistencia". Al confirmar, el status pasa a `completed` y aparece CTA "Calificar". Esto mantiene el flujo 100% centrado en el cliente, sin requerir participación del artista en el MVP.

**Justificación:** Mínimo flujo posible enfocado en el cliente. En un MVP con datos seed, el riesgo de fraude es inexistente.

---

### 2. 🟡 US0002 (Login artista) sin consumidor en el MVP

**Problema:** Con decisión 1.D, el artista no participa activamente en ningún flujo del MVP.

**Decisión: A) Absorber en US0001**

US0001 se reescribe como "Login de usuarios" genérico (funciona para cualquier rol seeded). Se elimina US0002 como US independiente. El endpoint es el mismo; si el usuario es artista, el JWT incluye `artist_profile_id` pero no hay UI que lo consuma en el MVP.

**Justificación:** 3 SP liberados. El login de artista existe técnicamente (mismo endpoint) pero no hay US ni UI que lo requiera.

---

### 3. 🟡 US0007 redundante con US0004.CA5

**Problema:** US0004.CA5 ya define "Filtro por certificación sanitaria: toggle". US0007 repite el toggle y solo agrega el badge visual.

**Decisión: B) Reasignar US0007 como "Badge de certificación"**

Reescribir US0007 enfocada solo en el componente badge visual reutilizable. Quitar CA1 (toggle) y CA5 (combinación con filtros) que ya están en US0004.

---

### 4. 🟢 US0011 (Chatbot) → US0008 (Slot) — entry point acoplado

**Problema:** US0008.CA1 dice "Desde el perfil del artista (o después del chatbot)". US0011 es Should-Have pero US0008 ya lo referencia.

**Decisión: A) Quitar referencia al chatbot de US0008**

Limpiar US0008.CA1 para que sea independiente del chatbot. Cuando se implemente US0011, se añade la integración como parte de esos tickets.

---

## Análisis de Coherencia Post-Decisiones

### Estado de las US

| US | Acción | Estado final |
|----|--------|-------------|
| US0001 | Reescribir como "Login de usuarios" (genérico, cualquier rol) | Ampliada |
| US0002 | **Eliminar** — absorber en US0001 | Eliminada |
| US0003-US0006 | Sin cambios | OK |
| US0007 | Reescribir: solo badge visual, sin toggle | Reducida |
| US0008 | Editar CA1: quitar referencia a chatbot | Editada |
| US0009 | Sin cambios | OK |
| US0010 | Agregar CA8: "Confirmar asistencia" para bookings cuya fecha pasó | Ampliada |
| US0011-US0012 | Sin cambios | OK |
| US0013 | Sin cambios (depende de US0010 para tener status completed) | OK |
| US0014 | Sin cambios | OK |

### Nuevo backlog: 13 US

| # | Historia | MoSCoW | SP |
|---|----------|--------|----|
| US0001 | Login de usuarios (cualquier rol) | Must-Have | 3 |
| US0003 | Ver vitrina principal | Must-Have | 8 |
| US0004 | Filtrar artistas | Must-Have | 8 |
| US0005 | Buscar artistas por texto | Must-Have | 3 |
| US0006 | Ver perfil de artista | Must-Have | 5 |
| US0007 | Badge de certificación sanitaria | Must-Have | 2 |
| US0008 | Seleccionar slot y ver resumen | Must-Have | 5 |
| US0009 | Pagar depósito vía Flow | Must-Have | 13 |
| US0010 | Ver historial + confirmar asistencia | Must-Have | 5 (+2 SP por nuevo CA) |
| US0011 | Cotizar con chatbot | Should-Have | 13 |
| US0012 | Explorar artistas en mapa | Should-Have | 8 |
| US0013 | Calificar artista post-sesión | Should-Have | 5 |
| US0014 | Mostrar auspicios de marcas | Should-Have | 2 |

**Total: 13 US · 80 SP · 9 Must-Have (52 SP) + 4 Should-Have (28 SP)**

### Grafo de Dependencias Actualizado

```
                    ┌──────────┐
                    │  SEED    │
                    └────┬─────┘
                         │
                    ┌────┴─────┐
                    │ US0001   │
                    │Login     │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────────────┐
         ▼               ▼                       ▼
    ┌────────┐     ┌────────┐              ┌────────┐
    │ US0003 │     │ US0010 │              │ US0008 │
    │Vitrina │     │Historial│             │  Slot  │
    └───┬────┘     └────┬────┘             └───┬────┘
        │               │                     │
   ┌────┼────┐          ▼                     ▼
   ▼    ▼    ▼     ┌────────┐            ┌────────┐
┌────┐┌────┐┌────┐ │ US0013 │            │ US0009 │
│0004││0005││0012│ │Calificar│           │  Pago  │
└─┬──┘└────┘└────┘ └────────┘            └───┬────┘
  │                                          │
  ▼                                          ▼
┌────┐                                  (confirma booking →
│0007│                                   visible en US0010)
│Badge│
└────┘

    ┌────────┐     ┌────────┐
    │ US0006 │◀────│ US0003 │
    │ Perfil │     └────────┘
    └───┬────┘
        │
   ┌────┼────┐
   ▼    ▼    ▼
┌────┐┌────┐┌────┐
│0008││0011││0014│
│Slot││Chat││Ausp│
└────┘└────┘└────┘
```

### Flujo Crítico del Cliente (Happy Path)

```
US0003 → US0004/0005 → US0006 → US0008 → US0001(login) → US0009(pago)
  → [mundo real: sesión] → US0010(confirmar asistencia) → US0013(calificar)
```

**Todas las capas son cliente-only. Cero dependencia de artista.**

### Booking Status Machine (actualizada)

```
                    ┌──────────────┐
     US0008         │ pending_hold │ (TTL 5 min)
     (selecciona)   └──────┬───────┘
                           │ pago OK (US0009)
                           ▼
                    ┌──────────────┐
                    │  confirmed   │
                    └──────┬───────┘
                           │ cliente confirma asistencia
                           │ (US0010, solo si fecha pasó)
                           ▼
                    ┌──────────────┐
                    │  completed   │
                    └──────┬───────┘
                           │ cliente califica (US0013)
                           ▼
                    ┌──────────────┐
                    │  (review)    │
                    └──────────────┘

    En cualquier momento antes de completed:
    confirmed → cancelled (cliente cancela, US0010)
```

### Gaps Restantes Detectados

| # | Gap | Severidad | Acción |
|---|-----|-----------|--------|
| 1 | `api-spec.yml` tiene `POST /bookings/{id}/complete` descrito como "artist action" | Baja | Actualizar descripción: es acción del cliente |
| 2 | US0010 sube de 3 SP a ~5 SP con el nuevo CA | Info | Ajustar estimación |
| 3 | US0013 dice en dependencias "US0009 (booking completado)" — debería decir US0010 | Baja | Corregir dependencia |
| 4 | data-model.md Booking tiene status enum sin `pending_hold` — ¿se necesita? | Media | US0008 menciona "hold temporal" con TTL. Decidir si es un status o un campo `expires_at` en `confirmed` |

---

## Plan de Ejecución

| Paso | Acción | Archivo(s) |
|---|---|---|
| 1 | Reescribir US0001 como login genérico (cualquier rol) | `docs/us/us0001/us0001.md` |
| 2 | Eliminar US0002 | `docs/us/us0002/` (borrar directorio) |
| 3 | Reescribir US0007 (solo badge, sin toggle) | `docs/us/us0007/us0007.md` |
| 4 | Editar US0008.CA1 (quitar referencia a chatbot) | `docs/us/us0008/us0008.md` |
| 5 | Agregar CA8 a US0010 (confirmar asistencia) + ajustar SP | `docs/us/us0010/us0010.md` |
| 6 | Corregir dependencias en US0013 | `docs/us/us0013/us0013.md` |
| 7 | Actualizar api-spec.yml (complete es acción de cliente) | `docs/api-spec.yml` |
| 8 | Regenerar all-us.md (13 US) | `docs/us/all-us.md` |
| 9 | Decidir gap #4 (pending_hold como status vs campo) | `docs/data-model.md` |

---

## Criterios de Done

- [x] Las 4 decisiones están tomadas (1D, 2A, 3B, 4A)
- [x] US afectadas actualizadas según decisiones
- [x] US0002 eliminada
- [x] all-us.md regenerado con 13 US
- [x] api-spec.yml coherente con decisiones
- [x] No quedan dependencias circulares ni gaps funcionales
- [x] Listo para generar tickets de trabajo con el agente tech-lead
