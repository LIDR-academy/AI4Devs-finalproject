## Context

El flujo KAN-9 en `backend/` + `frontend/` ya implementa búsqueda, selección de edición y `POST /v1/books` con un único `cover_image_url`. Open Library identifica obras (`/works/OL…W`) y ediciones (`/books/OL…M`) con `covers` y `cover_i`. Google Books suele ofrecer `imageLinks.thumbnail` / `smallThumbnail` / a veces `medium` en `volumeInfo`.

## Goals / Non-Goals

**Goals:**

- Tras elegir una fila de resultados (edición), mostrar **≥1 portada** cuando existan variantes; si hay varias, la usuaria elige una antes de guardar.
- Persistir en `books.cover_image_url` la URL elegida (sin cambiar esquema DB).
- Mantener política de catálogo existente (OL primario, GB fallback en búsqueda; portadas OL vía editions del work).

**Non-Goals:**

- Upload de imagen propia.
- Recorte o edición de portada.
- Sincronizar portadas en libros ya guardados.

## Decisions

### 1. Flujo UI en dos pasos dentro del mismo modal

| Paso | Acción |
| --- | --- |
| 1 | Búsqueda + lista de ediciones (comportamiento actual) |
| 2 | Al seleccionar edición → cargar portadas → grid «Elige portada» → «Guardar» |

Si solo hay una portada, preseleccionarla y permitir guardar directamente (sin fricción extra).

### 2. Endpoint de portadas

```text
GET /v1/books/catalog/covers
  ?data_source=open_library|google_books
  &external_provider_id=/works/OL82563W   (o volumeId de GB)
Authorization: Bearer <jwt>

200 {
  "covers": [
    { "id": "9255566", "url": "https://covers.openlibrary.org/b/id/9255566-L.jpg", "label": "Edición 2002" },
    ...
  ],
  "default_cover_id": "9255566"
}
```

- Máximo **12** portadas en respuesta (evitar payloads enormes).
- Deduplicar por URL normalizada.

### 3. Open Library — resolución de portadas

1. Si `external_provider_id` es `/works/…`, llamar `https://openlibrary.org{workKey}/editions.json?limit=30`.
2. Por cada edición en `entries`, leer `covers.cover_id` o construir URL desde `cover_i` / ISBN (`/b/isbn/{isbn}-L.jpg`).
3. Incluir la portada ya mostrada en el resultado de búsqueda si no está en editions.
4. Si la clave es `/books/…` (edición), usar `https://openlibrary.org{editionKey}.json` y sus `covers`.

### 4. Google Books — resolución de portadas

1. `GET volumes/{volumeId}` y mapear todos los `imageLinks` disponibles (thumbnail, small, medium, large, extraLarge) como entradas distintas si las URLs difieren.
2. Si solo hay una imagen, devolver array de un elemento.

### 5. Guardado

- `CreateBookDto.cover_image_url` = URL de la portada seleccionada en paso 2.
- Resto de metadatos de la edición seleccionada en paso 1 (sin cambios).

### 6. Errores y vacíos

- Sin portadas: `covers: []` → UI muestra placeholder «Sin portada» y permite guardar igual (UC-01).
- Error de red al cargar portadas: mensaje en modal + reintentar; no bloquear guardado con portada nula.

## Risks / Trade-offs

| Riesgo | Mitigación |
| --- | --- |
| Latencia extra (editions.json) | Cargar portadas solo tras clic en edición; spinner en paso 2; reutilizar timeout 12s |
| Muchas ediciones por obra | `limit=30` + cap 12 portadas en respuesta |
| URLs HTTP mixtas | Normalizar a `https://` (como en GB client actual) |
| CORS en imágenes | Las `<img>` cargan URLs públicas OL/GB (mismo patrón que hoy) |

## Migration Plan

1. Desplegar backend con endpoint `covers` (compatible con clientes antiguos).
2. Desplegar frontend con paso de portada.
3. Sin migración de datos.

## Resolved decisions (heredadas de KAN-9)

- Estructura `backend/` + `frontend/`, prefijo `/v1`, sin mock de catálogo en fixtures (mocks solo en tests unitarios de clientes).
