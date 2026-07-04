# Evidencia vision color tuning

## Objetivo

Ajustar y endurecer la deteccion de cubos por color en Edge Vision usando como
referencia tecnica el spike local `dynamic_pickup_maxarm_pick`, sin copiar el
script completo, sin abrir serial y sin mover MaxArm.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `150a83422485e1311760958b7e6cbfe1a83ef70d`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Problema observado

El panel de vision del dashboard ya podia usar la camara cenital con
`cameraIndex=1`, pero la deteccion de cubos generaba falsos positivos: bordes
del pickup, zonas largas de color y cajas asociadas a ruido. El conteo podia
superar los cubos reales.

## Referencia del spike

Se reviso `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/pick_dynamic_cube_with_maxarm.py`
como contexto de calibracion fisica. Se extrajeron criterios, no codigo
monolitico:

- HSV por color, incluyendo rojo en dos rangos.
- Amarillo con valor minimo `V` mas alto.
- Morfologia `OPEN` + `CLOSE` con kernel `5x5`.
- `MIN_AREA_PX = 1200`.
- `MIN_FILL_RATIO = 0.45`.
- Rechazo de contornos alargados o demasiado chicos/grandes.
- Validacion de tamano esperado mediante `size_valid`.
- Uso estricto de una region de pickup/carga.

## Ajustes realizados

- `vision.detection` ahora acepta parametros JSON para area, ancho, alto,
  relacion de aspecto, fill ratio, NMS por solape, `sizeValid` y kernel
  morfologico.
- `ColorDetector` filtra candidatos por:
  - `minArea` / `maxArea`;
  - `minWidth` / `maxWidth`;
  - `minHeight` / `maxHeight`;
  - `minAspectRatio` / `maxAspectRatio`;
  - `minFillRatio`.
- La deteccion se mantiene limitada a `cargoRoi` cuando esta configurado.
- Las coordenadas del snapshot siguen siendo globales del frame completo.
- Se agrego deduplicacion NMS mediante `overlapThreshold`.
- El overlay anota bounding box, color y `sizeValid`; muestra score si existe.
- `edge/config/edge.vision.example.json` quedo con parametros iniciales mas
  cercanos al spike fisico y `cameraIndex=1`.
- `simulation` y `vision-dry-run` siguen siendo perfiles seguros.

## Comandos ejecutados

Desde `edge/`:

```powershell
python -m pytest -q
```

Desde la raiz:

```powershell
rg -n "import serial|from serial|MaxArm|mode=hardware|dryRun.: false|enableHardwareMotion.: true" edge\src edge\tests edge\config\edge.vision.example.json
```

## Resultados de tests

- `python -m pytest -q`: **PASS, 82 passed**.
- La busqueda de seguridad no encontro imports serial ni activacion de hardware
  en los archivos revisados.

## Cobertura agregada

- No detectar rectangulos largos como cubos.
- Rechazar bounding boxes con aspect ratio invalido.
- Rechazar areas demasiado grandes.
- Rechazar areas demasiado pequenas.
- Conservar detecciones validas por color.
- Mantener coordenadas globales al usar ROI.
- Deduplicar detecciones solapadas.
- No depender de camara fisica.

## Resultado visual esperado

Con una escena calibrada y `cargoRoi` bien ajustado, el snapshot debe mostrar
solo cajas dentro de la zona de carga. Los bordes largos del pickup, en especial
bordes rojos, deben quedar fuera por ROI o ser rechazados por ancho/alto/aspect
ratio. La imagen anotada muestra color y `sizeValid=true` para detecciones
aceptadas.

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se cambio `dryRun=false`.
- [x] No se habilito `enableHardwareMotion=true`.
- [x] `simulation` se mantiene como default seguro.
- [x] `vision-dry-run` se mantiene como perfil seguro.
- [x] Los tests no dependen de camara fisica.
- [x] `_local_context/` se uso solo como lectura y no fue modificado.
- [x] No se hizo commit ni push.

## Como probar manualmente con camara cenital

1. Crear o ajustar un archivo local no versionado, por ejemplo
   `edge/config/edge.vision.local.json`, con:
   - `profile=vision-dry-run`;
   - `vision.source=camera`;
   - `vision.cameraIndex=1`;
   - `vision.cargoRoi` calibrado al pickup real.
2. Levantar Edge Vision:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.local.json --allow-camera
```

3. Levantar el dashboard con `VITE_EDGE_VISION_URL=http://localhost:8001`.
4. Verificar conteo por color contra los cubos reales.
5. Verificar overlay: bounding boxes dentro de `cargoRoi`, color correcto y
   `sizeValid=true`.
6. Verificar que bordes largos del pickup no aparecen como cubos.

## Issues pendientes

- Falta evidencia visual manual con camara cenital despues de ajustar el ROI en
  el montaje fisico real.
- Los limites iniciales de ancho/alto/aspect ratio estan en pixeles del frame,
  no en centimetros ni en una vista homografica normalizada.
- Si cambia altura de camara, iluminacion o posicion del pickup, se debe
  recalibrar `cargoRoi`, HSV y filtros geometricos.

## Conclusion

**APROBADO CON OBSERVACIONES.**

La deteccion queda mas estricta, parametrizable y testeada contra falsos
positivos tipicos. La aprobacion queda con observaciones porque falta una corrida
visual documentada con la camara cenital y cubos reales del montaje final.
