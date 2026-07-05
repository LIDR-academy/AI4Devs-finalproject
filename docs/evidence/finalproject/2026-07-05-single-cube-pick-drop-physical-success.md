# Evidencia prueba física single cube pick/drop

Fecha: 2026-07-05

Resultado: FUNCIONÓ

Resumen:
- Edge Vision detectó QR y cubos.
- Se usó homografía para calcular pickupPositionCm.
- Se usó calibración robot del pickup.
- Se agregó delay físico entre movimientos.
- Se aplicó ajuste fino en X para centrar succionador.
- MaxArm tomó el cubo y lo dejó en zona de descarga.

Configuración relevante:
- movement.delay_seconds: revisar single-cube-pick-drop.local.json
- movement.pickup_hold_seconds: revisar single-cube-pick-drop.local.json
- movement.release_hold_seconds: revisar single-cube-pick-drop.local.json
- pickup offset aplicado en robotCorners X
- homographyUsed: true
- visualCalibrationUsed: true

Observación:
El éxito físico se logró después de diferenciar timeout serial vs delay físico entre movimientos.
