# Quickstart — Portal de Verificación

**Feature**: `007-portal-verificacion` | **Date**: 2026-07-30

Guía de validación end-to-end. Detalle de API: [client-api-verificaciones.md](./contracts/client-api-verificaciones.md). Modelo de UI: [data-model.md](./data-model.md), [ui-verificacion.md](./contracts/ui-verificacion.md).

## Prerequisites

1. API pública de verificación disponible (feature `006`) en `http://localhost:8083` (ver [quickstart 006](../006-servicio-publico-verificacion/quickstart.md)).
2. Node/npm según `frontend/portal-verificacion/package.json`.
3. Códigos de prueba conocidos en BD/local: **vigente**, **expirado**, **inexistente** (14 chars `A–Z0–9`).

## Setup

```powershell
cd frontend/portal-verificacion
npm install
# Tras implementar: asegurar environment.development.apiBaseUrl = http://localhost:8083
npm start
```

Abrir la URL que imprima `ng serve` (típicamente `http://localhost:4200`).

## Automated tests (TDD)

```powershell
cd frontend/portal-verificacion
npm test
```

Esperado tras implementación: specs en verde para normalización de código, `VerificacionService` (mapeo 200/404/410/429), orquestación del componente/store (orden validar→documento→registro; sin registro en fallos), y `PdfViewerComponent` (Base64→render; vacío→no render).

## Manual scenarios

### S1 — Acceso público + shell

1. Abrir el portal en ventana privada (sin tokens).
2. **Expect**: shell CCB (logo, “Servicio Virtual”, barra “Certificados Electrónicos”, menú); formulario visible; sin login.

### S2 — T&C y formato

1. Sin marcar T&C → CTA disabled.
2. Marcar T&C; ingresar código corto o con símbolos → error inline; DevTools Network **sin** llamadas a `/api/v1/verificaciones/**`.
3. Pegar código con espacios exteriores y minúsculas que normaliza a vigente → se acepta y se invoca API con código normalizado.

### S3 — Flujo feliz (CA-14.1)

1. Código vigente + T&C → Verificar.
2. **Expect**: confirmación de autenticidad; visor `.pdf-viewer-frame` con PDF; descarga obtiene el PDF.
3. Network: `GET /{codigo}` → `GET /{codigo}/documento` → `POST /{codigo}/registros` (en ese orden).
4. Si se fuerza fallo del POST (p. ej. offline tras documento): resultado y PDF siguen visibles; **sin** mensaje de auditoría.

### S4 — Expirado / inexistente (CA-14.2 / CA-14.3)

1. Código expirado → mensaje de expirado; **sin** visor; **sin** GET documento ni POST registros.
2. Código inexistente → mensaje de no existe; **sin** PDF ni registro.

### S5 — Loading y segunda verificación

1. Throttle Network; verificar → CTA disabled + loading; input editable.
2. Tras éxito, limpiar / editar para nueva consulta → T&C permanece marcado.

### S6 — Rate limit / error temporal

1. Provocar 429 → mensaje de reintentar más tarde; sin PDF.
2. Detener API → mensaje de error temporal; sin PDF.

### S7 — Imagen corporativa y a11y (smoke)

1. Checklist visual §6 de `docs/IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md`.
2. Teclado: foco visible, operar checkbox/CTA/menú; errores anunciados.
3. (Opcional) Lighthouse/Web Vitals en emulación Fast 3G: shell+formulario usable &lt; 3 s; `pdf.js` no en critical path inicial.

## Out of scope for this guide

- Implementación de handlers Java, Liquibase o cambios a `verificacion-api`.
- Portal de certificados autenticado / Cognito / MAUC.
