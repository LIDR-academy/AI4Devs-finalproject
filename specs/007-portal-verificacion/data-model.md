# Data Model — Portal de Verificación (cliente)

**Feature**: `007-portal-verificacion` | **Date**: 2026-07-30

Modelo de **vista/estado en el SPA**. No hay tablas nuevas ni DDL. Persistencia de auditoría y certificados permanece en el servicio `verificacion` (ver [data-model 006](../006-servicio-publico-verificacion/data-model.md)).

## Entities (client-side)

### CodigoVerificacion (valor de entrada)

| Campo | Tipo | Reglas |
|---|---|---|
| `valorIngresado` | string | Lo que escribe/pega el usuario |
| `valorNormalizado` | string | `trim` extremos + mayúsculas (FR-004a) |
| `formatoValido` | boolean | `valorNormalizado` coincide con `^[A-Z0-9]{14}$` |

- MUST NOT eliminar espacios internos ni símbolos en la normalización.
- Solo si `formatoValido` se invoca al API con `valorNormalizado` en el path.

### TerminosCondiciones

| Campo | Tipo | Reglas |
|---|---|---|
| `aceptados` | boolean | Default `false`; MUST ser `true` para habilitar CTA |
| `urlDocumento` | string (URL) | `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf` (guía §7) |

- Al limpiar resultado / nueva verificación en la misma visita: `aceptados` permanece `true` salvo desmarcado manual (FR-006b).
- No persistir en `localStorage` / cookies de sesión.

### ResultadoVerificacion (estado de UI)

| Campo | Tipo | Valores / notas |
|---|---|---|
| `estado` | enum | `idle` \| `loading` \| `vigente` \| `expirado` \| `inexistente` \| `formato_invalido` \| `documento_no_disponible` \| `rate_limit` \| `error_temporal` |
| `mensaje` | string \| null | Texto orientativo para el usuario |
| `nombreArchivo` | string \| null | Opcional desde GET validar (`data.archivo`); no se usa para descarga S3 |

**Transiciones relevantes**

```text
idle → loading → vigente → (documento OK) → vigente + documento
                 → expirado | inexistente | rate_limit | error_temporal
loading → documento_no_disponible   # validó vigente pero falló documento
cualquier resultado → idle/loading  # al editar código o iniciar otra verificación
```

- `formato_invalido` y T&C no aceptados: **no** pasan por `loading` HTTP.
- PDF / visor solo si `estado === vigente` **y** hay contenido de documento.

### DocumentoCertificado

| Campo | Tipo | Reglas |
|---|---|---|
| `contenidoBase64` | string | `data.contenido` del GET documento |
| `tipo` | string | Esperado `application/pdf` |
| `bytes` / `blobUrl` | derivado | Para pdf.js y descarga; liberar Object URL al limpiar |

- MUST NOT renderizar visor si contenido vacío/ausente (FR-013).
- MUST NOT solicitar registro de auditoría si no hay documento usable (FR-017).

### RegistroAuditoria (intención de cliente)

| Campo | Tipo | Reglas |
|---|---|---|
| `solicitado` | boolean | `true` tras disparar POST registros |
| `exitoso` | boolean \| null | Resultado interno; **no** se muestra en UI |
| `errorInterno` | unknown \| null | Solo observabilidad cliente opcional |

- IP y fecha/hora: responsabilidad del servidor (no viajan en el body).
- Fallo: experiencia permanece en `vigente` + PDF visible (FR-018).

### IdentidadVisualShell (referencia, no entidad mutable)

Shell global ya materializado: logo CCB, “Servicio Virtual”, barra `#033864`, menú off-canvas, tokens `--ccb-*`. El feature MUST reutilizar clases de la guía (`.rotulo`, `.alert-info`, `.lista`, `.btn`, `.pdf-viewer-frame`).

## Validation rules (cliente)

| Regla | Origen |
|---|---|
| Normalizar antes de formato | FR-004a |
| Exactamente 14 `A–Z0–9` post-normalización | FR-004 / FR-005 |
| CTA disabled sin T&C | FR-006 |
| CTA disabled + loading en vuelo; input editable | FR-006a |
| Conservar T&C al limpiar resultado | FR-006b |
| Orden validar → documento → registro | FR-008a |
| Sin PDF en expirado / inexistente / formato inválido | FR-015 |
| Sin registro en fallos / sin documento | FR-017 / FR-017a |

## Relationships

```text
Usuario ──ingresa──► CodigoVerificacion
Usuario ──acepta──► TerminosCondiciones
CodigoVerificacion + TerminosCondiciones ──habilitan──► orquestación
orquestación ──produce──► ResultadoVerificacion
ResultadoVerificacion(vigente) ──obtiene──► DocumentoCertificado
DocumentoCertificado(OK) ──dispara──► RegistroAuditoria (best-effort)
DocumentoCertificado ──renderiza──► PdfViewer (UI)
```
