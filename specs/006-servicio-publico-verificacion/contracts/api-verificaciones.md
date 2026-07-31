# Contract: API pública `/api/v1/verificaciones`

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29

Servicio: `verificacion-api` (puerto 8083). **Sin autenticación** en estas rutas. Envelope de respuesta: `ApiResponse<T>` ([contrato 002](../../002-nucleo-compartido-seguridad/contracts/error-handling.md)).

## Autenticación y CORS

- `Authorization` no requerido.
- CORS: orígenes `https://*.ccb.org.co` (perfil local puede ampliar según 004); métodos GET, POST, OPTIONS.

## Path parameter `codigo`

- Patrón: `^[A-Z0-9]{14}$`.
- Cualquier otra forma → **400** `VALIDACION` (sin consulta a BD).

---

## GET `/api/v1/verificaciones/{codigo}`

Valida existencia y vigencia. **No** escribe auditoría.

### 200 OK

```json
{
  "success": true,
  "data": {
    "valido": true,
    "archivo": "nombre-en-s3.pdf"
  },
  "error": null,
  "correlationId": "...",
  "timestamp": "..."
}
```

### Errores

| Condición | HTTP | `error.code` (orientativo) |
|---|---|---|
| Formato inválido | 400 | `VALIDACION` |
| No existe | 404 | `CODIGO_NO_ENCONTRADO` / `RECURSO_NO_ENCONTRADO` |
| Expirado | 410 | `CODIGO_EXPIRADO` |
| Rate limit | 429 | (filter; ver [rate-limit.md](./rate-limit.md)) |

---

## GET `/api/v1/verificaciones/{codigo}/documento`

Devuelve PDF en Base64 tras las mismas reglas de validez/vigencia.

### 200 OK

```json
{
  "success": true,
  "data": {
    "contenido": "<base64>",
    "tipo": "application/pdf"
  },
  "error": null,
  "correlationId": "...",
  "timestamp": "..."
}
```

**Mapeo DTO → JSON:** en aplicación el resultado se llama `contenidoBase64` (+ `tipo`); en la respuesta HTTP el campo MUST ser `data.contenido` (nunca `contenidoBase64` en el JSON público). El mapeo ocurre en el controller/capa API.

### Errores

| Condición | HTTP | Notas |
|---|---|---|
| Formato / no existe / expirado | 400 / 404 / 410 | Igual que validación |
| Objeto ausente en S3 | 404 | `ARCHIVO_NO_ENCONTRADO`; alerta interna = log estructurado + counter `verificacion.archivo_ausente` (FR-010) |
| S3 no disponible | 503 | `SERVICIO_NO_DISPONIBLE` (`AlmacenamientoNoDisponibleException`) |
| Rate limit | 429 | Cupo compartido |

**Prohibido**: devolver URL pre-firmada o URL pública del bucket.

---

## POST `/api/v1/verificaciones/{codigo}/registros`

Registra auditoría explícita. Body vacío o `{}` aceptable. IP desde request (no del body).

### 201 Created

```json
{
  "success": true,
  "data": {
    "registrado": true
  },
  "error": null,
  "correlationId": "...",
  "timestamp": "..."
}
```

### Errores

| Condición | HTTP | Notas |
|---|---|---|
| Formato inválido | 400 | Sin insert |
| No existe | 404 | Sin insert |
| Expirado | 410 | Sin insert |
| Rate limit | 429 | Cupo compartido |

**Reglas**

- MUST revalidar vigencia en el momento del POST.
- MUST NOT crearse fila si el código no está vigente.
- Validación GET y documento GET MUST NOT insertar registros.

## Idempotencia

- Cada POST exitoso crea una **nueva** fila (verificaciones ilimitadas durante vigencia).
- No hay clave de idempotencia de cliente en v1.
