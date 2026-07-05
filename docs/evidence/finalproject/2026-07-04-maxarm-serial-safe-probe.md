# Evidencia MaxArm serial safe probe

## Objetivo

Implementar y validar una primera integracion segura con MaxArm real mediante
comunicacion serial, sin carga, sin succion y sin manipular cubos.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `5e6829c4d76072b887ce764eaadfc8c6eb77566d`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Alcance

- Se crea `MaxArmSerialAdapter` con transporte inyectable para tests.
- Se crea CLI `edge/src/maxarm_safe_probe.py`.
- El CLI exige `--confirm-safe-motion` antes de abrir serial.
- La pose debe estar en `safePoses` y en allowlist segura.
- Solo se envia `POSE <x> <y> <z> 0`.
- No se activa succion.
- No se ejecuta pickup.
- No se ejecuta drop.
- No se usan cubos ni camara.
- No se registra `mode=hardware` en Backend ni se modifica Dashboard.

## Comandos ejecutados

Pruebas unitarias iniciales:

```powershell
python -m pytest edge\tests\test_maxarm_serial.py edge\tests\test_maxarm_safe_probe.py -q
```

Resultado: **PASS, 11 passed**.

Suite Edge completa:

```powershell
cd edge
python -m pytest -q
```

Resultado: **PASS, 108 passed**.

Backend:

```powershell
cd backend
npm run build
```

Resultado: **build OK**.

Frontend:

```powershell
cd frontend
npm run build
```

Resultado: **build OK**.

Dependencia serial:

```powershell
cd edge
python -c "import serial; print(serial.VERSION)"
```

Resultado: **3.5**.

## Resultado de ejecucion sin confirmacion

Comando seguro:

```powershell
cd edge
python src\maxarm_safe_probe.py --config config\maxarm.safe-probe.example.json
```

Resultado esperado:

- `result=ERROR`.
- `errorCode=CONFIRMATION_REQUIRED`.
- `serialOpened=false`.
- `hardwareMovement=false`.
- se genera evidencia JSON.

Resultado obtenido:

```json
{
  "runId": "7804801a-62c9-47e5-ba11-7ddd49249a71",
  "portSanitized": "COM4",
  "baudrate": 115200,
  "poseName": "reset",
  "commandPreview": "POSE 0 -79 176 0",
  "commandSent": null,
  "firmwareResponse": null,
  "timeout": false,
  "serialOpened": false,
  "hardwareMovement": false,
  "suctionActivated": false,
  "pickupExecuted": false,
  "dropExecuted": false,
  "result": "ERROR",
  "errorCode": "CONFIRMATION_REQUIRED"
}
```

Evidencia generada:

```text
edge/workspace/generated/edge-evidence/maxarm-safe-probe/maxarm-safe-probe-7804801a-62c9-47e5-ba11-7ddd49249a71.json
```

## Procedimiento para ejecucion real con confirmacion

Ejecutar solo despues de completar el checklist fisico:

```powershell
cd edge
python src\maxarm_safe_probe.py `
  --config config\maxarm.safe-probe.example.json `
  --port COM4 `
  --baudrate 115200 `
  --pose-name reset `
  --confirm-safe-motion
```

El resultado esperado en caso feliz es:

- serial abierto y cerrado correctamente;
- `commandSent` igual a una unica linea `POSE ... 0`;
- `firmwareResponse` contiene `DONE`;
- `result=SUCCESS`;
- `suctionActivated=false`;
- `pickupExecuted=false`;
- `dropExecuted=false`.

## Resultado de ejecucion real

No ejecutado automaticamente por Codex. Requiere operador presente, puerto COM
real confirmado y checklist fisico completado.

## Evidencia generada

Directorio por defecto:

```text
edge/workspace/generated/edge-evidence/maxarm-safe-probe/
```

Ejemplo de evidencia JSON:

```json
{
  "runId": "uuid",
  "timestamp": "2026-07-04T00:00:00+00:00",
  "portSanitized": "COM4",
  "baudrate": 115200,
  "timeoutSeconds": 5.0,
  "poseName": "reset",
  "commandPreview": "POSE 0 -79 176 0",
  "commandSent": null,
  "firmwareResponse": null,
  "timeout": false,
  "serialOpened": false,
  "hardwareMovement": false,
  "suctionActivated": false,
  "pickupExecuted": false,
  "dropExecuted": false,
  "result": "ERROR",
  "errorCode": "CONFIRMATION_REQUIRED"
}
```

## Checklist de seguridad

- [ ] Brazo sobre superficie estable antes de ejecutar con confirmacion.
- [ ] Zona despejada antes de ejecutar con confirmacion.
- [ ] No hay cubos bajo el brazo.
- [ ] No hay personas u objetos en el recorrido.
- [ ] Cable conectado correctamente.
- [ ] Puerto COM confirmado.
- [ ] Fuente de energia estable.
- [ ] Boton o forma de cortar energia accesible.
- [ ] Pose segura revisada visualmente.
- [ ] Operador presente durante toda la prueba.
- [x] Sin `--confirm-safe-motion`, no se abre serial.
- [x] No se activa succion.
- [x] No se ejecuta pickup/drop.
- [x] Los tests no abren serial real.

Los primeros diez puntos son obligatorios para la ejecucion fisica real; en esta
corrida quedan documentados como precondicion, no como ejecucion material.

## Issues pendientes

- Falta corrida manual con MaxArm fisico y respuesta `DONE` registrada.
- Las poses versionadas son seguras solo si el operador las revisa contra el
  montaje fisico real.
- Este paso no habilita pick/drop ni `mode=hardware` en Backend/Dashboard.

Resultado ejecución física controlada:

- Fecha/hora ejecución: 2026-07-05T00:53:45Z
- Puerto: COM4
- Baudrate: 115200
- Pose ejecutada: ready
- Comando enviado: POSE 124 -83 212 0
- Respuesta firmware: DONE recibido
- serialOpened: true
- hardwareMovement: true
- suctionActivated: false
- pickupExecuted: false
- dropExecuted: false
- Resultado: SUCCESS
- Evidencia local generada en workspace/generated/edge-evidence/maxarm-safe-probe/
- Observación: la respuesta incluye bytes de protocolo antes de DONE, pero el comando finalizó correctamente.

## Conclusion

APROBADO: comunicación serial real con MaxArm validada mediante pose segura allowlisted, sin carga, sin succión y sin manipulación de cubos.