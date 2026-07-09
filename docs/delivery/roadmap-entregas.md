# Roadmap de Entregas - RoboDock AI

## Objetivo

Este documento aclara la estrategia incremental de RoboDock AI entre Entrega 2 y Entrega 3, separando lo implementado en modo `simulation` de la integracion fisica futura con camara, QR, OpenCV y MaxArm.

## Entrega 2 - MVP funcional en simulation

La Entrega 2 implementa la arquitectura funcional completa del MVP con contratos reales entre componentes:

- Backend ejecutable con API REST.
- PostgreSQL como persistencia.
- Prisma como ORM.
- Edge en modo `simulation`.
- Contratos HTTP reales entre Edge y Backend.
- Dashboard operational como contrato backend disponible para frontend.
- Evidencia QA del flujo Backend + PostgreSQL + Edge simulation.

El flujo validado para Entrega 2 es:

```text
PostgreSQL Docker
-> Backend
-> Edge simulation
-> crear sesion
-> registrar cubos simulados
-> registrar accion robot en mode=simulation
-> consultar dashboard operacional
```

La simulacion de Entrega 2 no es trabajo desechable. Es la primera implementacion funcional de los adapters del Edge y permite estabilizar:

- contratos API;
- estructura de payloads;
- trazabilidad por `sessionId`;
- conteos por color;
- registro de acciones robot;
- integracion con dashboard;
- evidencia reproducible sin depender de hardware.

## Entrega 3 - Integracion hardware sobre contratos estables

La Entrega 3 debe reemplazar o complementar los adapters simulados por adapters hardware, manteniendo estables los contratos ya validados.

Adapters esperados para Entrega 3:

- QR real usando camara y OpenCV.
- Deteccion real de cubos por color usando OpenCV.
- MaxArm en modo hardware solo con bandera explicita.
- Dry run previo antes de cualquier movimiento real.
- Validacion de coordenadas y posiciones seguras.
- Evidencia separada para simulation, dry run y hardware real.

Los spikes existentes de hardware son evidencia de factibilidad tecnica para Entrega 3. No deben confundirse con implementacion productiva de Entrega 2.

Spikes relevantes:

- `spikes/experiments/truck_code_detection/`
- `spikes/experiments/vision_color_detection/`
- `spikes/experiments/integrated_vision_detection/`
- `spikes/experiments/dynamic_pickup_maxarm_pick/`
- `spikes/experiments/dashboard_live_camera/`

## Contratos que deben permanecer estables

Para evitar retrabajo, estos contratos deben permanecer estables entre Entrega 2 y Entrega 3 salvo decision documentada:

- `POST /sessions`
- `GET /health`
- `GET /sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/cubes`
- `POST /robot/actions`
- `GET /dashboard/operational`

Tambien deben conservarse:

- `truckCode` como identificador funcional del camion.
- `id` como UUID tecnico.
- `code` como identificador de negocio.
- `mode=simulation` para ejecuciones simuladas.
- `mode=hardware` solo cuando exista integracion fisica explicita.
- Payloads de cubos con `color`, coordenadas, dimensiones y `confidence`.
- Acciones robot con `actionType`, `status`, `mode`, `color` y `metadata`.

## Lo que no debe declararse en Entrega 2

Entrega 2 no debe declarar como implementado:

- control fisico real del MaxArm;
- movimiento real de robot;
- lectura real de camara como parte del MVP final;
- deteccion OpenCV productiva integrada al flujo principal;
- calibracion completa camara -> pickup -> robot;
- seguridad fisica completa;
- automatizacion robotica real de descarga.

La declaracion correcta para Entrega 2 es:

```text
RoboDock AI implementa el flujo funcional completo en modo simulation,
con Backend, PostgreSQL, Edge simulado y contratos API reales.
```

La declaracion correcta para los spikes es:

```text
Los spikes de hardware validan factibilidad tecnica para Entrega 3,
pero no son claims de hardware real implementado en Entrega 2.
```

## Estrategia de continuidad

1. Mantener Backend, base de datos y contratos API estables.
2. Implementar Frontend contra `GET /dashboard/operational`.
3. Conservar Edge simulation como fallback permanente de QA/demo.
4. Crear adapters hardware que produzcan los mismos payloads que simulation.
5. Agregar evidencia hardware solo cuando exista ejecucion fisica real y segura.
6. Documentar cualquier cambio de contrato como ADR antes de modificar consumidores.

## Estado actual

Estado de Entrega 2 al crear este roadmap:

- Backend MVP validado por QA.
- PostgreSQL Docker validado.
- Edge simulation validado por QA.
- Dashboard operational backend validado.
- Frontend implementado y validado por QA.
- Hardware real pendiente para Entrega 3.

## Proximo paso recomendado

Ejecutar el agente Frontend para implementar el dashboard operacional consumiendo el contrato estable:

```text
GET /dashboard/operational
```

El frontend debe mostrar al menos:

- camion detectado;
- codigo de sesion;
- estado de sesion;
- conteo de cubos por color;
- ultima accion robot;
- modo `simulation`.
