# Eventos Kafka — MyTreeLibrary

Contrato orientativo para el MVP. Los nombres de topic y el payload deben mantenerse alineados con el código (productor/consumidor) y con las pruebas de integración.

## Convenciones generales

| Aspecto | Criterio |
|----------|----------|
| Nombre de topic | Minúsculas, segmentos separados por punto; prefijo de contexto (`catalog`, etc.). |
| Formato mensaje | **JSON** en el valor (UTF-8). |
| Clave del mensaje | Preferible **`arbol_id`** (stringificación del long) para partición estable por árbol cuando aplique. |
| Idempotencia | Los consumidores deben tolerar **reentrega**: usar `evento_id` u otro idempotency key persistido. |
| Versión de esquema | Campo opcional recomendado `schemaVersion` (string, p. ej. `1.0`) en el cuerpo del evento. |

---

## `catalog.arbol.evento`

| Campo | Responsabilidad |
|-------|-----------------|
| **Topic** | `catalog.arbol.evento` |
| **Productor** | **catalog-service** (tras **alta** —creación— de ficha de **ÁRBOL** con éxito; alineado con regla de negocio **R7** y UC-09; **no** publicar a este topic con fines de notificación por **modificaciones** en el MVP). |
| **Consumidor principal** | **notification-service** (generación de notificaciones / correo a suscriptores). |
| **Otros consumidores** | Ninguno obligatorio en el MVP salvo decisión nueva documentada. |

### Payload mínimo (JSON)

Campos recomendados para el MVP (extensibles con cuidado):

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `schemaVersion` | string | No | Versión del contrato del evento (p. ej. `1.0`). |
| `evento_id` | long | Sí | Identificador **único del mensaje** para idempotencia en el consumidor (reentregas). Lo genera el **productor** (`catalog-service`) sin persistir filas en **`EVENTO_CATALOGO`** (esa entidad y su relación con **NOTIFICACION** son responsabilidad del **notification-service**, HU-007). El consumidor puede persistir su propio `evento_id` / clave de deduplicación alineada a este valor. |
| `tipo_evento` | string | Sí | En el MVP, el único valor que debe disparar correo a suscriptores es **`ARBOL_CREADO`** (alta). Otros valores quedan reservados para evolución y no deben activar el flujo de notificación hasta que se documente lo contrario. |
| `arbol_id` | long | Sí | Identificador del árbol en PostgreSQL (`catalog`). |
| `ocurrido_en` | string (ISO-8601) | Sí | Instantánea UTC del hecho de dominio. |
| `resumen_cambio` | string | No | Texto corto para logs o plantillas de correo (sin PII). |

### Notas

- **Disparo de correo (MVP):** solo **`tipo_evento` = `ARBOL_CREADO`**, coherente con **R7** y [use-case-summary.md](../use-cases/use-case-summary.md) (UC-09 solo en alta).
- **Límite de microservicio:** el productor (**catalog-service**, HU-005) **no** persiste **`EVENTO_CATALOGO`**; el consumidor (**notification-service**, HU-007) es quien registra el evento consumido y genera las **NOTIFICACION** asociadas.
- No incluir en el payload **emails de suscriptores** ni datos personales masivos: el consumidor resuelve destinatarios desde su propia base (`notification`).
