# Prompt Run - Dashboard pickup target integer format

## Fecha

2026-07-13

## Secuencia

001

## Objetivo

Mostrar las coordenadas de la columna "Pickup target" como enteros en la tabla operacional del Dashboard, manteniendo intactos los valores originales usados por Frontend, Edge y Backend.

## Problema visual detectado

En la pestana "Plan de descarga", la columna "Pickup target" mostraba coordenadas con muchos decimales, por ejemplo `-4.7010000000000005, -220.534, 138`. Para la demo operacional se requiere una lectura mas limpia como `-5, -221, 138`.

## Cambio realizado

- Se agrego un helper local en Frontend para redondear cada coordenada con `Math.round`.
- Se agrego manejo explicito de `-0` para mostrar `0`.
- Se ajusto solamente el render de la columna "Pickup target" en la tabla "Plan de descarga".
- Si no existe `pickupTarget`, se mantiene la salida visual `-`.

## Archivos modificados

- `frontend/src/components/Dashboard.tsx`
- `docs/prompt-runs-finalproject/2026-07-13-001-dashboard-pickup-target-integer-format.md`

## Validaciones ejecutadas

- `npm run build` desde `frontend`: OK.
- `npm test --if-present` desde `frontend`: el wrapper `npm.ps1` fue bloqueado por la politica local de PowerShell.
- `npm.cmd test --if-present` desde `frontend`: OK. No hay script de test configurado, por lo que no se ejecuto suite adicional.

## Aclaraciones

- No se modifico Backend.
- No se modifico Edge.
- No se modificaron configuraciones locales fisicas.
- No se modifican coordenadas originales, payloads, memoria ni datos internos; el cambio aplica solo a la presentacion visual de la tabla.
- No se ejecutaron pruebas fisicas MaxArm.
