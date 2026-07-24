# Alcance Entrega 2 - RoboDock AI

## 1. Objetivo de la Entrega 2

Construir un MVP funcional de RoboDock AI que demuestre el flujo principal de descarga automatizada en modo local y mayoritariamente simulado:

1. identificar un camion por codigo QR o payload equivalente;
2. crear una sesion de descarga;
3. registrar cubos detectados por color;
4. registrar acciones simuladas del robot MaxArm;
5. visualizar el estado operacional en un dashboard;
6. documentar ejecucion, pruebas, evidencias y prompts.

La Entrega 2 debe priorizar software ejecutable sobre documentacion aspiracional. El alcance busca demostrar integracion minima entre backend, base de datos, edge simulado/adaptado desde spikes y frontend.

## 2. Historias de usuario minimas

### Historia 1 - Iniciar sesion de descarga por camion identificado

Como operador de muelle,
quiero iniciar una sesion de descarga asociada a un camion identificado por QR,
para registrar la operacion y monitorearla desde el sistema.

#### Criterios de aceptacion

- Dado un `truckCode` con formato funcional, por ejemplo `TRUCK-001`, el sistema crea o reutiliza el camion.
- El sistema crea una `UnloadSession` asociada al camion.
- La sesion queda con `id` UUID tecnico y `code` funcional visible.
- La sesion queda en un estado inicial verificable, por ejemplo `DETECTING` o `IN_PROGRESS`.
- El backend expone una respuesta JSON con identificadores y estado de la sesion.
- La operacion puede probarse localmente mediante una llamada HTTP documentada.

### Historia 2 - Registrar detecciones de cubos por color

Como sistema edge,
quiero enviar al backend los cubos detectados en una sesion,
para persistir conteos y detalles minimos de la carga.

#### Criterios de aceptacion

- Dada una sesion existente, el backend acepta un payload con cubos detectados.
- Cada cubo registrado incluye color y datos minimos de posicion o bounding box cuando esten disponibles.
- Los colores soportados para el MVP son `red`, `blue`, `green` y `yellow`.
- El sistema actualiza o permite consultar conteos por color y total de cubos.
- Si el payload es invalido, el backend responde con error controlado.
- La deteccion puede provenir de un script edge en modo simulado o de una salida adaptada desde los spikes existentes.

### Historia 3 - Registrar accion simulada del robot

Como operador o sistema edge,
quiero registrar una accion simulada de pick and drop del MaxArm,
para demostrar trazabilidad de la descarga sin depender del hardware real.

#### Criterios de aceptacion

- Dada una sesion existente, el sistema permite registrar una `RobotAction`.
- La accion incluye tipo, estado, color o cubo relacionado cuando aplique, y metadata minima de la simulacion.
- El MVP soporta al menos estados `PLANNED`, `SUCCESS` y `ERROR`.
- La accion queda asociada a la sesion.
- El dashboard puede mostrar las ultimas acciones registradas.
- No se requiere mover fisicamente el MaxArm en Entrega 2.

### Historia 4 - Visualizar dashboard operacional minimo

Como operador de muelle,
quiero ver el estado actual de la descarga en un dashboard web,
para validar rapidamente camion, sesion, cubos y acciones del robot.

#### Criterios de aceptacion

- El frontend muestra camion identificado, codigo de sesion y estado.
- El frontend muestra conteo de cubos por color y total.
- El frontend muestra ultimas acciones simuladas del robot.
- El frontend consume datos desde el backend, no solo datos hardcodeados.
- El dashboard puede ejecutarse localmente con instrucciones documentadas.
- Si no hay sesion activa o la API falla, muestra un estado vacio o error comprensible.

### Historia 5 - Documentar ejecucion y evidencias de la entrega

Como evaluador del proyecto,
quiero instrucciones y evidencias claras de ejecucion,
para verificar que el MVP de Entrega 2 funciona localmente.

#### Criterios de aceptacion

- Existe documentacion minima para ejecutar backend, frontend y edge/simulador.
- Se documentan variables de entorno en `.env.example`.
- Se incluye una prueba manual del flujo principal.
- Se registran prompts relevantes usados durante la entrega.
- Se agregan evidencias o instrucciones para obtenerlas, por ejemplo capturas del dashboard o JSON de prueba.
- La documentacion diferencia claramente MVP funcional de evolucion futura.

## 3. Priorizacion

| Prioridad | Historia | Motivo |
|---|---|---|
| Must | Historia 1 - Iniciar sesion de descarga por camion identificado | Es la entrada del flujo MVP y conecta QR/camion con persistencia. |
| Must | Historia 2 - Registrar detecciones de cubos por color | Demuestra vision/edge y permite mostrar valor operacional. |
| Must | Historia 3 - Registrar accion simulada del robot | Cubre el componente robotico sin bloquearse por hardware. |
| Must | Historia 4 - Visualizar dashboard operacional minimo | Permite validar el flujo completo ante evaluacion. |
| Should | Historia 5 - Documentar ejecucion y evidencias | Necesaria para entrega academica; puede completarse incrementalmente. |

## 4. Fuera de alcance

- Control fisico obligatorio del MaxArm.
- Streaming de camara en vivo integrado al dashboard productivo.
- Autenticacion, roles, permisos o multiusuario.
- Dashboard historico o analytics avanzado.
- WebSockets, colas, event sourcing o arquitectura distribuida compleja.
- Calibracion completa de camara y robot como flujo de usuario.
- Asignacion avanzada de posiciones de descarga con prevencion transaccional de sobreposicion.
- Despliegue cloud.
- Modelo de datos completo de Entrega 1 con todas las entidades propuestas.
- Optimizacion de vision computacional mas alla de reutilizar o adaptar spikes existentes.

## 5. Supuestos

- La Entrega 2 se ejecutara en entorno local.
- PostgreSQL puede ejecutarse localmente o mediante Docker, segun disponibilidad.
- Prisma se usara para modelo y persistencia.
- El backend sera Node.js, Express y TypeScript.
- El frontend sera React, Vite y TypeScript.
- El edge sera Python y podra operar en modo simulado para no depender de camara o robot fisico.
- Los codigos de camion de prueba pueden ser `TRUCK-001`, `TRUCK-002` y `TRUCK-003`.
- `id` se usa como UUID tecnico y `code` como identificador funcional.
- `.env` no se versiona y las variables necesarias se documentan en `.env.example`.

## 6. Riesgos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Intentar implementar el modelo completo de Entrega 1 | Alto | Reducir el MVP a `Truck`, `UnloadSession`, `Cube` y `RobotAction`. |
| Dependencia de camara o MaxArm real | Alto | Mantener modo simulado como camino principal de demo. |
| Dashboard demasiado ambicioso | Medio | Construir una sola vista operacional con datos del backend. |
| Endpoints excesivos o API dispersa | Medio | Mantener pocos endpoints alineados al flujo principal. |
| Falta de evidencia verificable | Medio | Documentar comandos, payloads y capturas desde el inicio. |
| Problemas locales con PostgreSQL | Medio | Documentar setup y considerar seed/datos de prueba simples. |
| Promover spikes sin limpieza minima | Medio | Adaptar solo lo necesario hacia `edge/` y dejar experimentos en `spikes/`. |

## 7. Proximo agente recomendado

El proximo agente recomendado es el Delivery Manager.

Objetivo sugerido para ese agente:

```text
Usa AGENTS.md como guia principal.

Actua como el agente definido en prompts/agents/delivery-manager.md.
Usa como referencia docs/delivery/01-alcance-entrega2.md y prompts/playbooks/delivery-2.md.

Objetivo:
Convertir el alcance minimo de Entrega 2 en un plan de trabajo incremental con dependencias, orden de ejecucion, entregables y criterios de termino.

Restricciones:
- No implementes codigo.
- No modifiques backend, frontend ni edge.
- Crea o actualiza solo docs/delivery/02-plan-entrega2.md.
```
