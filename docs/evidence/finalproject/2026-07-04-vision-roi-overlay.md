# Evidencia vision ROI overlay

## Objetivo

Mostrar visualmente en el snapshot de vision del dashboard los ROI configurados
para carga y QR (`cargoRoi` y `qrRoi`) para diagnosticar `QR_NOT_DETECTED` y
verificar si ambos ROI estan bien posicionados sobre la imagen real de la camara
cenital.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `351fd0f6ee78bec375cbc48faaca8d268153ab2c`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Problema observado

La camara cenital ya se ve en el dashboard y los cubos se detectan razonablemente
bien, pero el QR aparece como `QR_NOT_DETECTED`. Sin ver `qrRoi` y `cargoRoi`
dibujados sobre la misma imagen, no era evidente si el QR fisico quedaba dentro
del ROI configurado.

## Cambios realizados

- `EvidenceWriter.annotate()` ahora dibuja los ROI configurados:
  - `CARGO ROI`: borde verde grueso y etiqueta legible.
  - `QR ROI`: borde magenta grueso y etiqueta legible.
- Los ROI se dibujan aunque no se detecte QR o no haya cubos.
- Si no hay QR, el overlay muestra `QR ROI QR_NOT_DETECTED`.
- `/vision/snapshot` expone `cargoRoi` junto a `qrRoi`, `qrDetected`,
  `qrValid`, `truckCode` y `qrStatus`.
- El panel `Vision / Camara` muestra `cargoRoi` y `qrRoi` en formato `x,y,w,h`.
- No se agregaron controles fisicos ni movimiento.

## Comandos ejecutados

Desde `edge/`:

```powershell
python -m pytest -q
```

Desde `frontend/`:

```powershell
npm run build
```

## Resultados

- Edge tests: **PASS, 89 passed**.
- Frontend build: **PASS**.

## Resultado visual esperado

En `/vision/snapshot/image` y en el dashboard deben verse:

- rectangulo verde `CARGO ROI`;
- rectangulo magenta `QR ROI`;
- bounding boxes de cubos por color;
- etiqueta `QR ROI QR_NOT_DETECTED` si el QR no aparece;
- metadata textual de `qrStatus`, `truckCode`, `cargoRoi` y `qrRoi`.

## Como diagnosticar `qrRoi` mal configurado

1. Levantar Edge Vision con la camara cenital y abrir el dashboard.
2. Mirar si el QR fisico esta completamente dentro del rectangulo `QR ROI`.
3. Si queda fuera, ajustar `vision.qrRoi.x/y/w/h` en
   `edge/config/edge.vision.local.json`.
4. Si el QR esta dentro pero sigue `QR_NOT_DETECTED`, revisar foco, luz,
   reflejos, tamano del QR y `vision.qr.pattern`.
5. Confirmar que `CARGO ROI` cubre solo los cubos y que no se esta confundiendo
   con la zona QR.

## Ejemplo de `/vision/snapshot`

```json
{
  "truckCode": null,
  "qrDetected": false,
  "qrValid": false,
  "qrStatus": "QR_NOT_DETECTED",
  "qrRoi": { "x": 500, "y": 180, "w": 140, "h": 170 },
  "cargoRoi": { "x": 47, "y": 157, "w": 348, "h": 203 },
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2 },
  "imageUrl": "/vision/snapshot/image"
}
```

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se agregaron controles fisicos al dashboard.
- [x] No se agregaron botones de movimiento.
- [x] `simulation` no se modifico.
- [x] Edge Vision sigue degradando si no hay camara o snapshot.
- [x] Dashboard sigue funcionando si Edge Vision esta apagado.
- [x] `_local_context/` no fue modificado.
- [x] No se hizo commit ni push.

## Issues pendientes

- Falta evidencia visual manual con captura real del dashboard mostrando el QR
  fisico y los ROI en la camara cenital.
- Si el ROI queda parcialmente fuera del frame, la captura actual falla antes
  por validacion fail-closed; la visualizacion parcial queda pendiente para una
  herramienta de calibracion mas permisiva.

## Conclusion

**APROBADO CON OBSERVACIONES.**

El overlay de ROI quedo implementado, testeado y documentado. La observacion se
mantiene porque falta validar visualmente con el montaje fisico real y ajustar
`edge.vision.local.json` segun la imagen resultante.
