# Evidencia Final - RoboDock AI

**Fecha de ejecución:** 2026-07-16  
**Timestamp evidencia Edge:** `2026-07-17T02:14:22.788002+00:00`  
**Proyecto:** RoboDock AI  
**Curso:** AI4Devs  
**Autor:** ASP  
**Rama validada:** `finalproject-ASP`  
**Documento:** `docs/evidence/finalproject/2026-07-16-final-hardware-validation.md`  
**Evidencia Edge:** `multi-cube-pick-drop-multi-2026-07-16-22-15.json`

---

## 1. Resumen ejecutivo

Esta evidencia resume la validación final del Proyecto Final **RoboDock AI**, un MVP local que integra software, visión computacional y hardware físico para simular una descarga inteligente en miniatura.

La demo final validó un flujo end-to-end con cámara, QR, detección de cubos por color, planificación multi-cubo, ejecución física con brazo MaxArm, confirmación física por visión, sincronización con Backend y visualización del avance en el Dashboard operacional.

**Resultado final:** `SUCCESS`

---

## 2. Componentes validados

| Componente | Rol en la demo | Estado |
|---|---|---|
| PostgreSQL | Persistencia local de sesiones, cubos y acciones | Validado |
| Backend REST | API operacional, dashboard, reset y sincronización | Validado |
| Edge Vision API | Cámara, QR, detección, planificación y ejecución | Validado |
| Frontend Dashboard | Visualización, control, feedback y reset operacional | Validado |
| Cámara | Captura para visión computacional | Validado |
| MaxArm | Ejecución física de pick & drop | Validado |
| Drop zones | Zonas de descarga por color | Validado |

---

## 3. Alcance de la prueba final

| Paso | Resultado esperado | Estado |
|---|---|---|
| Iniciar jornada / preparar operación | Dashboard limpio, sin ruido de sesiones previas | OK |
| Detectar QR del camión | Truck code reconocido por Edge Vision | OK |
| Detectar cubos por color | Cubos visibles en snapshot y conteos | OK |
| Planificar descarga | Plan generado con drop zones por color | OK |
| Mostrar resultado de ejecución inicial | Filas pendientes antes de ejecutar | OK |
| Ejecutar descarga física | MaxArm toma y descarga cubos | OK |
| Actualizar avance en vivo | Dashboard muestra progreso durante ejecución | OK |
| Confirmar físicamente | Edge Vision reporta confirmación física por visión | OK |
| Sincronizar Backend | Acciones registradas y sync OK | OK |
| Preparar nuevo camión | Estado operacional limpio para siguiente carga | OK |

---

## 4. Configuración operacional usada

> Los archivos locales `*.local.json` no se adjuntan completos porque contienen calibración específica del montaje físico.

| Elemento | Valor / referencia |
|---|---|
| Backend URL | `http://localhost:3000` |
| Edge Vision URL | `http://localhost:8001` |
| Frontend URL | `http://localhost:5173` |
| Config visión | `edge/config/edge.vision.local.json` |
| Config descarga | `edge/config/single-cube-pick-drop.local.json` |
| Config drop zones | `edge/config/drop_zones.local.json` |
| Modo demo | `hardware` |
| Cámara usada por Edge | `camera:1` |
| Fuente snapshot | `opencv-camera` |
| Truck code | `TRUCK-003` |
| QR detectado | Sí |
| QR válido | Sí |
| QR status | `OK` |
| Cargo ROI | `x=30, y=140, w=349, h=210` |
| QR ROI | `x=496, y=159, w=143, h=197` |
| Sincronización Backend | Activada |
| Confirmación física | Activada |
| Método de confirmación | `post_drop_vision_count_delta` |
| Retry pickup | `enabled=True, maxAttempts=3, zStep=-2.0, minPickZ=132.0` |

---

## 5. Evidencia principal: video demo

**Archivo:** `RoboDock-Demo.mp4`  
**Duración aproximada:** 2 minutos 21 segundos  
**Formato:** MP4  
**Resolución:** 1920x1080

### Contenido del video

El video muestra en paralelo:

- vista externa del proceso físico con cámara de apoyo;
- Dashboard operacional en tiempo real;
- detección visual y planificación;
- ejecución física del MaxArm;
- feedback del resultado de ejecución;
- confirmación física reportada por Edge Vision;
- sincronización con Backend;
- resultado final exitoso.

---

## 6. Evidencia visual del Dashboard

Las siguientes capturas respaldan el flujo completo y deben quedar bajo:

```text
docs/evidence/finalproject/images/
```

| Captura | Archivo | Descripción |
|---|---|---|
| 1 | `01-dashboard-clean-start.png` | Dashboard limpio / inicio de jornada |
| 2 | `02-vision-qr-cubes-detected.png` | QR y cubos detectados |
| 3 | `03-plan-generated-pending.png` | Plan generado y ejecución pendiente |
| 4 | `04-execution-progress.png` | Ejecución en progreso |
| 5 | `05-execution-success.png` | Resultado exitoso |
| 6 | `06-next-truck-clean.png` | Preparar nuevo camión / estado limpio |

---

## 7. Evidencia Edge

| Campo | Valor |
|---|---|
| Archivo JSON | `multi-cube-pick-drop-multi-2026-07-16-22-15.json` |
| `runId` | `multi-f8fbe361-563d-4616-9317-479b76f1032f` |
| `snapshotSignature` | `e406bde6378e4fe22914dc29` |
| `truckCode` | `TRUCK-003` |
| `status` | `SUCCESS` |
| `maxCubes` | 4 |
| Cubos detectados | 4 |
| Cubos planificados | 4 |
| Cubos ejecutados | 4 |
| Cubos intentados | 4 |
| Cubos confirmados físicamente | 4 |
| Cubos restantes | 0 |
| Cubos omitidos | 0 |
| Acciones sincronizadas Backend | 4 |
| Fallas sync Backend | 0 |
| Fallas confirmación física | 0 |
| Último error físico | - |
| Último error Backend | - |
| `serialOpened` | Sí |
| `hardwareMovement` | Sí |
| `successMeaning` | `physical_confirmed` |

---

## 8. Conteo detectado por visión

| Color | Cantidad |
|---|---:|
| Red | 1 |
| Blue | 1 |
| Green | 1 |
| Yellow | 1 |
| Total | 4 |

---

## 9. Plan generado

| # | Color | Drop zone | Posición en zona | Pickup target | Homografía |
|---:|---|---|---:|---|---|
| 1 | red | DROP_RED_01 | 1 | 50, -182, 138 | Sí |
| 2 | blue | DROP_BLUE_01 | 1 | 24, -217, 138 | Sí |
| 3 | yellow | DROP_YELLOW_01 | 1 | -5, -191, 138 | Sí |
| 4 | green | DROP_GREEN_01 | 1 | 77, -214, 138 | Sí |

---

## 10. Resultado de ejecución

| # | Color | Drop zone | Físico | Backend | Intentos | Pick Z | Action | Error |
|---:|---|---|---|---|---:|---:|---|---|
| 1 | red | DROP_RED_01 | CONFIRMED | SUCCESS | 1 | 138.0 | ACTION-001 | - |
| 2 | blue | DROP_BLUE_01 | CONFIRMED | SUCCESS | 1 | 138.0 | ACTION-002 | - |
| 3 | yellow | DROP_YELLOW_01 | CONFIRMED | SUCCESS | 1 | 138.0 | ACTION-003 | - |
| 4 | green | DROP_GREEN_01 | CONFIRMED | SUCCESS | 1 | 138.0 | ACTION-004 | - |

---

## 11. Resultado final observado

| Métrica | Resultado |
|---|---|
| Resultado general | `SUCCESS` |
| Cubos planificados | 4 |
| Cubos ejecutados | 4 |
| Cubos físicamente confirmados | 4 |
| Acciones Backend sincronizadas | 4 |
| Fallas físicas | 0 |
| Fallas de sincronización Backend | 0 |
| Estado final Dashboard | `SUCCESS` |
| Preparar nuevo camión validado | OK |

---

## 12. Validaciones técnicas

Completar con la última ejecución local antes de cerrar entrega:

| Validación | Resultado |
|---|---|
| `backend npm run build` | Pendiente / OK |
| `backend npm test --if-present` | Pendiente / OK |
| `frontend npm run build` | Pendiente / OK |
| `frontend npm test --if-present` | Pendiente / OK |
| `edge python -m pytest -q` | Pendiente / OK |
| `git status --short` | Pendiente / OK |

---

## 13. Observaciones relevantes

- La demo valida un MVP físico local, no solo una simulación.
- El Dashboard permitió observar la operación en vivo.
- La separación entre **Plan generado** y **Resultado de ejecución** mejoró la trazabilidad visual.
- La confirmación física por Edge Vision permitió verificar el avance cubo a cubo.
- La ejecución final descargó 4 cubos: red, blue, yellow y green.
- Cada acción física quedó con `physicalConfirmation.status=CONFIRMED`.
- Las acciones backend `ACTION-001` a `ACTION-004` quedaron sincronizadas correctamente.
- No hubo fallas de sync Backend ni fallas de confirmación física.
- Los prompt-runs dejaron trazabilidad del proceso de construcción, ajustes y validaciones.
- La calibración física, ROI, iluminación y posición de cámara fueron factores críticos.

---

## 14. Limitaciones conocidas

- El sistema está orientado a un entorno local académico.
- No incluye autenticación, RBAC ni auditoría empresarial avanzada.
- El Dashboard usa polling, no streaming en tiempo real.
- La detección depende de cámara, luz, ROI, HSV y montaje físico.
- El modo hardware requiere operador presente, zona despejada y checklist de seguridad.
- Las configuraciones `*.local.json` no forman parte del repositorio porque dependen del montaje físico.

---

## 15. Conclusión

La prueba final demuestra que RoboDock AI logró integrar exitosamente:

- visión computacional;
- lectura QR;
- detección de cubos por color;
- planificación multi-cubo;
- zonas de descarga por color;
- control físico MaxArm;
- confirmación visual post-drop;
- sincronización Backend;
- Dashboard operacional con feedback en vivo;
- reset operacional para nuevas jornadas o camiones.

RoboDock AI evolucionó desde una simulación inicial hacia un MVP físico integrado, validando una forma de trabajo incremental con IA, prompt-runs, pruebas y trazabilidad técnica.
