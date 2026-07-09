# ADR-003

## Titulo

Contrato HTTP JSON entre Edge y Backend

## Fecha

2026-06-07

## Estado

Propuesta

Nota de actualizacion Entrega 2: esta ADR conserva el razonamiento historico sobre HTTP JSON. La implementacion MVP validada usa rutas REST granulares sin prefijo `/api`: `POST /sessions`, `POST /sessions/:id/cubes`, `POST /robot/actions` y `GET /dashboard/operational`.

---

## Contexto

El MVP de Entrega 2 necesita que el Edge reporte al Backend la identificacion del camion, las detecciones de cubos y las acciones simuladas del robot. La arquitectura definida para Entrega 2 propone Backend como fuente de verdad, Edge como productor de eventos y Frontend como consumidor de estado operacional.

El alcance debe mantenerse simple: sin colas, WebSockets, streaming productivo ni servicios distribuidos complejos.

---

## Alternativas evaluadas

### Opcion 1: HTTP JSON con endpoint unico de eventos Edge

Ventajas:

- Simple de implementar y probar.
- Compatible con scripts Python y herramientas HTTP.
- Mantiene API pequena.
- Permite agregar tipos de eventos sin crear muchos endpoints.

Desventajas:

- Menos expresivo que endpoints especializados.
- Requiere validar bien `eventType` y `payload`.

### Opcion 2: Endpoints especializados por accion

Ventajas:

- Contratos mas explicitos para cada caso.
- Validaciones mas directas por endpoint.

Desventajas:

- Aumenta superficie API.
- Puede romper la restriccion de pocos endpoints principales.
- Menos flexible para evolucionar eventos del edge.

### Opcion 3: WebSockets o cola de mensajes

Ventajas:

- Mejor para tiempo real o alto volumen.
- Permite comunicacion asincrona mas robusta.

Desventajas:

- Sobreingenieria para Entrega 2.
- Agrega infraestructura y complejidad de operacion.
- Dificulta pruebas academicas simples.

---

## Decision

Usar HTTP JSON entre Edge y Backend.

El Edge inicia o usa una sesion mediante `POST /sessions`, registra cubos mediante `POST /sessions/:id/cubes` y reporta acciones del robot mediante `POST /robot/actions`.

Los eventos minimos son:

- `CUBES_DETECTED`
- `ROBOT_ACTION_RECORDED`
- `SESSION_COMPLETED` como evento terminal opcional, no como ruta principal separada del MVP

| Ruta | Evento | Payload principal |
|---|---|---|
| `POST /sessions` | `SESSION_STARTED` | `truckCode` |
| `POST /sessions/:id/cubes` | `CUBES_DETECTED` | `source`, `detections[]` o `cubes[]` |
| `POST /robot/actions` | `ROBOT_ACTION_RECORDED` | `sessionId`, `actionType`, `status`, `mode`, `color`, `metadata` |
| `GET /dashboard/operational` | Consulta operacional | Sin payload |

El dashboard no consume al Edge directamente; consume estado agregado desde `GET /dashboard/operational`.

---

## Justificacion

HTTP JSON permite probar el flujo con scripts, curl o cliente Python, y mantiene la arquitectura comprensible. Las rutas REST granulares del MVP reducen ambiguedad por caso de uso sin impedir evolucion futura.

Esta decision tambien favorece trazabilidad: todos los eventos relevantes quedan asociados a `sessionId` y persistidos por el backend.

---

## Consecuencias

### Positivas

- Contrato facil de documentar y validar.
- Edge y Backend quedan desacoplados de implementaciones internas.
- Frontend recibe un estado agregado estable.
- Evita colas o tiempo real antes de necesitarlos.

### Negativas

- No hay comunicacion en tiempo real avanzada.
- El backend debe interpretar payloads por tipo de evento.
- La validacion de eventos debe ser cuidadosa para no guardar datos inconsistentes.

### Riesgos

- Que `payload` se vuelva demasiado libre y dificil de mantener.
- Que el Edge envie eventos sin `sessionId`.
- Que se declaren capacidades de tiempo real que no existen en el MVP.
