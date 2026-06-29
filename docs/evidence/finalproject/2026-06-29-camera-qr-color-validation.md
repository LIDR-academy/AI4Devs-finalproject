# Evidencia de validacion de camara, QR y color

## 1. Objetivo

Validar y fortalecer el pipeline de vision real de RoboDock AI con una imagen de
prueba: captura OpenCV, QR, deteccion HSV de cubos, `DetectionSnapshot` y
evidencia reproducible. La prueba no abre camara, serial ni ejecuta MaxArm.

## 2. Identificacion

- Fecha: 2026-06-29.
- Rama: `finalproject-ASP`.
- Commit inicial: `168d7686f4200bcf095ee953dae80633a3958545`.
- Working tree inicial: limpio.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## 3. Entorno local

- Windows / PowerShell.
- Python `3.11.6`.
- OpenCV instalado mediante `edge/requirements.txt`.
- Resolucion del fixture: 640 x 480 px.
- Perfil: `vision-dry-run`.
- Fuente ejecutada: `file`; fuente del snapshot: `opencv-file`.

Backend y Frontend no fueron ejecutados porque no forman parte del foco de esta
validacion. Sus contratos no fueron modificados.

## 4. Configuracion usada, sanitizada

Archivo: `edge/config/edge.vision.example.json`.

```json
{
  "profile": "vision-dry-run",
  "truckCode": "TRUCK-003",
  "safety": {
    "dryRun": true,
    "enableHardwareMotion": false,
    "humanConfirmationRequired": true
  },
  "robotPlanning": {
    "enabled": false
  },
  "vision": {
    "source": "file",
    "imagePath": "../../_local_context/.../dynamic_pickup_original_20260621_163854.png",
    "cameraIndex": 0,
    "qrRoi": {"x": 500, "y": 180, "w": 140, "h": 170},
    "cargoRoi": {"x": 47, "y": 157, "w": 348, "h": 203},
    "qr": {
      "pattern": "^TRUCK-\\d{3}$",
      "allowedTruckCodes": ["TRUCK-001", "TRUCK-002", "TRUCK-003"]
    },
    "detection": {
      "minArea": 250,
      "maxArea": 100000,
      "minFillRatio": 0.45
    },
    "evidence": {
      "directory": "../../workspace/generated/vision-evidence"
    }
  }
}
```

La configuracion versionada contiene solo rutas relativas. El fixture se leyo en
su ubicacion local original y no fue copiado ni modificado.

Los rangos HSV iniciales fueron:

- rojo: H 0-10 y 170-179, S 100-255, V 80-255;
- azul: H 95-130, S 90-255, V 70-255;
- amarillo: H 22-34, S 120-255, V 120-255;
- verde: H 40-85, S 70-255, V 70-255.

## 5. Comandos ejecutados

Desde `edge/`:

```powershell
python -m pytest tests -q -p no:cacheprovider

python src\vision_runner.py `
  --config config\edge.vision.example.json `
  --save-evidence
```

Auditorias de solo lectura desde la raiz:

```powershell
rg --files edge
rg -n "serial|maxarm|VideoCapture|allow-camera" edge/src
Get-Content <archivos de configuracion y contexto>
```

Tambien se uso `cv2.QRCodeDetector.detectAndDecode` en modo lectura para
diagnosticar el primer fixture anotado. No se uso `--allow-camera`.

## 6. Resultado con imagen/fixture

### Intento inicial

Fixture:
`_local_context/spikes/experiments/integrated_vision_detection/debug_frames/truck_and_cargo_debug_20260621_163649.png`.

- Pipeline y escritura de evidencia: correctos.
- QR: no decodificado.
- Cubos: 8 contornos frente a 6 esperados.
- Causa: el archivo ya contenia cajas, texto y overlays de una ejecucion anterior;
  esos pixeles alteraron QR y segmentacion HSV.
- Decision: conservar el fallo como diagnostico y usar el frame original, no
  ajustar umbrales para maquillar una imagen ya anotada.

### Intento reproducible final

Fixture:
`_local_context/spikes/experiments/dynamic_pickup_detection/debug/dynamic_pickup_original_20260621_163854.png`.

- Exit code: `0`.
- Run ID: `7b28aa25-ad2c-4b51-8d7c-32b4a9bdc662`.
- Source: `opencv-file`.
- QR: `TRUCK-003`, detectado y valido.
- Cubos: 6, coincidentes con el conteo conocido del fixture.
- Evidencia JSON e imagen anotada: generadas.

## 7. Resultado con camara real

No ejecutado. No hubo una autorizacion inequivoca para abrir una camara fisica en
esta corrida y el fixture permitia validar el pipeline sin hardware.

Procedimiento preparado:

1. Copiar `edge.vision.example.json` a un archivo local no versionado.
2. Configurar `vision.source=camera` y `cameraIndex`.
3. Mantener `profile=vision-dry-run`, `dryRun=true`,
   `enableHardwareMotion=false` y `robotPlanning.enabled=false`.
4. Probar primero sin flag:

```powershell
python src\vision_runner.py --config config\edge.vision.local.json
```

Debe fallar antes de `VideoCapture`.

5. Solo con autorizacion humana explicita:

```powershell
python src\vision_runner.py `
  --config config\edge.vision.local.json `
  --allow-camera `
  --save-evidence
```

El comando captura un frame y libera la camara en `finally`.

## 8. Resultado QR

- Detectado: si.
- Valor bruto: `TRUCK-003`.
- Valor validado: `TRUCK-003`.
- Pattern: `^TRUCK-\d{3}$`.
- Allowlist: `TRUCK-001`, `TRUCK-002`, `TRUCK-003`.
- ROI: x=500, y=180, w=140, h=170.
- `qrDetected=true`.
- `qrValid=true`.

La metadata ahora conserva `qrRawValue`, incluso cuando un valor detectado no es
valido; `truckCode` sigue siendo null en ese caso.

## 9. Resultado deteccion de cubos

Conteo:

| Color | Total |
|---|---:|
| red | 1 |
| blue | 1 |
| green | 2 |
| yellow | 2 |
| **Total** | **6** |

Bounding boxes globales:

| Color | x | y | w | h | fillRatio |
|---|---:|---:|---:|---:|---:|
| red | 228 | 176 | 73 | 69 | 0.9177 |
| blue | 118 | 258 | 86 | 70 | 0.9373 |
| yellow | 226 | 266 | 69 | 70 | 0.9241 |
| yellow | 331 | 162 | 64 | 68 | 0.8532 |
| green | 112 | 187 | 71 | 57 | 0.8900 |
| green | 320 | 288 | 71 | 67 | 0.9066 |

`confidence` es null porque el detector HSV aun no implementa un score calibrado.
Como metricas diagnosticas se conservan area y `fillRatio`.

La escena tiene iluminacion suficientemente separable y los rangos actuales
detectan el conteo conocido. Los umbrales no deben asumirse calibrados para otra
camara, altura o iluminacion.

## 10. Evidencia generada

- JSON:
  `workspace/generated/vision-evidence/snapshot-7b28aa25-ad2c-4b51-8d7c-32b4a9bdc662.json`
- Imagen anotada:
  `workspace/generated/vision-evidence/snapshot-7b28aa25-ad2c-4b51-8d7c-32b4a9bdc662-annotated.png`

Evidencia del intento inicial, conservada para diagnostico:

- `workspace/generated/vision-evidence/snapshot-7bc12c28-32c6-4021-b216-41080c09908f.json`
- `workspace/generated/vision-evidence/snapshot-7bc12c28-32c6-4021-b216-41080c09908f-annotated.png`

Todas las rutas son relativas.

## 11. Validaciones fail-closed

La suite segura termino con **61 passed** y cubre:

- QR ausente: no crea `truckCode`.
- QR invalido/no permitido: `truckCode=null`, `qrValid=false`.
- ROI fuera del frame: `VisionInputError`.
- Imagen inexistente: `VisionInputError`, sin abrir camara.
- Camara sin `--allow-camera`: rechazo antes de llamar `read_camera`.
- Sin cubos elegibles: `CUBE_UNAVAILABLE`.
- Perfil distinto de `vision-dry-run`: rechazo.
- Configuracion `dryRun=false` o movimiento habilitado: rechazo antes de captura.
- Evidencia deshabilitada por defecto y opt-in mediante `--save-evidence`.

No se ejecuto pytest desde la raiz, porque ese comando descubre un spike serial
fuera de `edge/tests`, documentado en la evidencia E2E anterior.

## 12. Checklist de seguridad

- [x] Fixture procesado sin abrir camara.
- [x] Camara real no ejecutada.
- [x] Gate `--allow-camera` probado automaticamente.
- [x] Puerto serial no abierto.
- [x] No existen imports `serial` o `MaxArm` en el pipeline de vision.
- [x] MaxArm no ejecutado.
- [x] Hardware robot no requerido.
- [x] `mode=hardware` no usado.
- [x] `dryRun=true`.
- [x] `simulation` conserva su default.
- [x] `_local_context/` solo se leyo; no se modifico en esta validacion.
- [x] No se hizo commit ni push.

## 13. Issues encontrados

### VIS-01 — camara fisica no validada

- Esperado final: confirmar indice, resolucion, enfoque, ROI e iluminacion con la
  camara cenital real.
- Obtenido: pipeline validado por archivo.
- Severidad: media.
- Bloquea: no bloquea el flujo por fixture; bloquea declarar aprobada la captura
  fisica.
- Recomendacion: ejecutar una captura autorizada con el montaje final.

### VIS-02 — fixture ya anotado altera la deteccion

- Esperado: QR y 6 cubos.
- Obtenido inicial: QR ausente y 8 contornos.
- Causa: overlays de color sobre la imagen.
- Severidad: baja para el producto, alta para la calidad del fixture.
- Bloquea: no; el frame original aprobo.
- Recomendacion: conservar fixtures originales sin overlays para regresion.

### VIS-03 — confidence no implementada

- Esperado: confidence/score si existe.
- Obtenido: `confidence=null`, con `area` y `fillRatio`.
- Severidad: baja.
- Bloquea: no.
- Recomendacion: definir un score calibrado antes de usar confianza para
  decisiones operacionales.

### VIS-04 — fixture de ejemplo depende del contexto local

- La configuracion es reproducible en este workspace, pero su imagen vive en
  `_local_context/` y no forma parte de `edge/`.
- Severidad: baja/media de portabilidad.
- Bloquea: no para esta evidencia.
- Recomendacion: crear en una tarea posterior un fixture propio, autorizado y sin
  overlays dentro de un directorio de fixtures versionable; no copiar el contexto
  local.

## 14. Ajustes recomendados de ROI/HSV

- Mantener `qrRoi` estrecha sobre el QR, conservando margen blanco completo.
- Mantener `cargoRoi` dentro de la caja para excluir paredes, overlays y fondo.
- Ajustar primero saturacion/valor para rechazar sombras y reflejos; despues H.
- Mantener dos rangos para rojo por el wrap de H en OpenCV.
- Repetir contra escenas con conteo conocido y condiciones clara, tenue y con
  reflejos.
- No promover estos rangos a calibracion final sin una prueba de al menos diez
  escenas del montaje fisico.

## 15. Conclusion

**APROBADO CON OBSERVACIONES.**

El pipeline por archivo detecto un QR real valido y los seis cubos esperados,
genero un `DetectionSnapshot` `opencv-file`, JSON e imagen anotada. Los gates
fallan de forma cerrada y los 61 tests Edge pasan. `simulation` no fue alterado.

La aprobacion no incluye camara fisica: indice, foco, iluminacion y ROI del montaje
final siguen pendientes.

## 16. Proximo paso recomendado

Con autorizacion explicita, ejecutar una captura de un solo frame con la camara
cenital usando el mismo perfil seguro, ajustar ROI/HSV contra el montaje real y
guardar evidencia separada `opencv-camera`. No integrar MaxArm todavia.
