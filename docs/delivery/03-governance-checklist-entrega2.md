# Governance Checklist Entrega 2 - RoboDock AI

## 1. Controles minimos comprometidos para Entrega 2

Estos controles son razonables para un MVP academico local y no deberian bloquear el desarrollo funcional.

| Control | Compromiso MVP | Evidencia esperada |
|---|---|---|
| Separacion `.env` / `.env.example` | No versionar `.env`; documentar variables necesarias | `.env.example` en componentes que lo requieran |
| Modo simulado por defecto | Edge y robot deben operar en `simulation` o `dryRun` por defecto | Configuracion, README o salida de consola |
| Validacion de payloads | Validar `truckCode`, `sessionId`, `eventType`, colores y campos obligatorios | Respuestas HTTP controladas ante payload invalido |
| Persistencia con Prisma | Usar Prisma para acceso a PostgreSQL y evitar SQL manual innecesario | `schema.prisma`, migracion o setup documentado |
| Identificadores consistentes | Usar `id` como UUID tecnico y `code` como identificador funcional | Modelo y respuestas API |
| Trazabilidad basica | Asociar cubos y acciones robot a una `UnloadSession` | Registros consultables desde backend/dashboard |
| Estado operacional consultable | Exponer estado para dashboard desde backend | `GET /api/dashboard/operational` |
| Claims acotados | Diferenciar implementado, simulado, dry run y futuro | README/docs finales |
| Evidencia minima | Registrar comandos, payloads o capturas del flujo | Docs de pruebas/evidencias |
| Prompts registrados | Mantener trazabilidad del uso de IA en la planificacion e implementacion | `prompts/` o docs de prompts |

## 2. Controles que quedan como evolucion futura

Estos controles son importantes para una version productiva, pero quedan fuera del alcance minimo de Entrega 2.

- Autenticacion de usuarios.
- RBAC con roles `operator`, `supervisor` y `admin`.
- Rate limiting.
- HTTPS y certificados.
- Gestion de secretos con secret manager.
- Auditoria formal por usuario, IP y dispositivo.
- CorrelationId distribuido entre multiples servicios desplegados.
- Logs centralizados.
- Retencion y anonimization de datos.
- Hardening de PostgreSQL para produccion.
- Separacion multi-tenant.
- Control transaccional avanzado de `DropPosition`.
- Seguridad fisica completa para movimiento real del MaxArm.
- Revision formal de privacidad.
- Monitoreo y alertas.

## 3. Riesgos de seguridad

| Riesgo | Impacto | Mitigacion MVP |
|---|---|---|
| Subir `.env` o secretos al repositorio | Alto | Mantener `.gitignore`, usar `.env.example` y revisar antes de commit |
| Ejecutar hardware real por accidente | Alto | Modo `simulation`/`dryRun` por defecto y bandera explicita para hardware |
| Payloads invalidos crean datos inconsistentes | Medio | Validar campos obligatorios y valores permitidos |
| API local sin autenticacion | Medio | Declarar que es MVP local; no exponer a internet |
| Logs con informacion sensible | Bajo | No registrar secretos, tokens ni rutas privadas innecesarias |
| SQL injection | Medio | Usar Prisma Client y evitar SQL raw |
| Claims exagerados sobre IA o robotica | Medio | Documentar claramente que Entrega 2 prioriza simulacion funcional |

## 4. Riesgos operacionales

| Riesgo | Impacto | Mitigacion MVP |
|---|---|---|
| Demo depende de camara o MaxArm real | Alto | Mantener flujo simulado completo como camino principal |
| Backend, edge y frontend usan contratos distintos | Alto | Congelar contratos minimos antes de implementar |
| Dashboard muestra datos hardcodeados | Medio | Consumir API real aunque los datos provengan de simulacion |
| Spikes se confunden con producto final | Medio | Dejar `spikes/` como referencia y mover solo lo necesario a `edge/` |
| Estado de sesion queda ambiguo | Medio | Usar estados simples: `IN_PROGRESS`, `COMPLETED`, `ERROR` |
| Falta evidencia reproducible | Medio | Documentar comandos y payloads de prueba desde el inicio |
| Errores no trazables | Medio | Agregar logs con `correlationId` y `sessionId` cuando sea posible |

## 5. Recomendaciones de trazabilidad

Para Entrega 2, la trazabilidad minima debe responder estas preguntas:

- Que camion fue identificado: `Truck.code`.
- Que sesion se creo: `UnloadSession.id` y `UnloadSession.code`.
- Que cubos se detectaron: registros `DetectedCube` asociados a la sesion.
- Que accion robot se simulo: registros `RobotAction` asociados a la sesion.
- En que modo se ejecuto: `simulation` o `hardware`.
- Cuando ocurrio: `createdAt`, `updatedAt`, `detectedAt` o timestamps equivalentes.

Recomendaciones concretas:

- Incluir `sessionId` en todos los eventos enviados por Edge despues de iniciar sesion.
- Incluir `mode` en acciones robot: `simulation` o `hardware`.
- Guardar payload original o metadata resumida en campo JSON cuando ayude a explicar la demo.
- Evitar crear entidades de auditoria completas en Entrega 2 si el modelo minimo ya permite seguir el flujo.
- Documentar ejemplos de payload y respuesta para reproducir la demo.

## 6. Recomendaciones para logs, auditoria y correlationId

### Logs minimos

El backend deberia registrar en consola, al menos durante desarrollo:

- inicio de servidor;
- errores de validacion relevantes;
- creacion de sesion;
- recepcion de evento Edge;
- errores inesperados con stack solo en entorno local.

El Edge deberia registrar:

- `truckCode` usado;
- `sessionId` recibido;
- cantidad de cubos enviados;
- accion robot simulada;
- errores de conexion al backend.

### CorrelationId

Para Entrega 2, `correlationId` puede ser simple:

- Si el request trae header `x-correlation-id`, reutilizarlo.
- Si no existe, generar uno por request.
- Devolverlo en la respuesta cuando sea posible.
- Incluirlo en logs junto a `sessionId`.

Formato sugerido:

```text
correlationId=uuid sessionId=uuid eventType=CUBES_DETECTED status=recorded
```

### Auditoria

No se requiere auditoria formal en Entrega 2. Como minimo, la auditoria queda cubierta por:

- timestamps en entidades principales;
- relacion de cubos y acciones con sesion;
- metadata de acciones robot;
- evidencias de ejecucion en docs.

Auditoria avanzada por usuario, IP, rol o dispositivo queda para evolucion futura.

## 7. Claims que NO deben declararse como implementados si aun no existen

Para mantener uso responsable de IA y trazabilidad academica, no declarar como implementado lo siguiente salvo que exista evidencia funcional en el repositorio:

- Control fisico real del MaxArm.
- Descarga robotica completamente automatizada.
- Vision computacional productiva integrada al dashboard final.
- Streaming de camara en vivo dentro del dashboard React de Entrega 2.
- Calibracion completa camara -> pickup -> robot.
- Prevencion real de colisiones o seguridad fisica certificada.
- Autenticacion, RBAC o permisos de usuario.
- Auditoria empresarial completa.
- Logs centralizados o observabilidad productiva.
- Despliegue cloud.
- Sistema multiusuario o multi-tenant.
- IA generativa tomando decisiones autonomas de robotica.
- Reconocimiento de objetos con modelos ML entrenados, si solo se usa OpenCV/HSV.
- Cumplimiento normativo industrial.

Formulaciones recomendadas:

- Correcto: "El MVP registra acciones simuladas del MaxArm".
- Evitar: "El robot descarga autonomamente los cubos".
- Correcto: "El modo hardware queda preparado como evolucion futura o evidencia opcional".
- Evitar: "La Entrega 2 opera con hardware real de forma completa".
- Correcto: "Se usan asistentes de IA para planificacion, documentacion y apoyo al desarrollo".
- Evitar: "La IA controla la operacion robotica de forma autonoma".

## Checklist de cierre governance

- [ ] `.env` no esta versionado.
- [ ] `.env.example` documenta variables necesarias.
- [ ] Modo simulado es el default.
- [ ] Hardware real no se ejecuta sin configuracion explicita.
- [ ] Payloads principales tienen validacion.
- [ ] API no expone errores internos innecesarios.
- [ ] Cubos y acciones quedan asociados a una sesion.
- [ ] Dashboard consume backend real.
- [ ] README/docs separan implementado, simulado y futuro.
- [ ] Prompts relevantes quedan registrados.
- [ ] Claims finales coinciden con evidencia disponible.
