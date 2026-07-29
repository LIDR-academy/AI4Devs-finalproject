## Why

KAN-9 ya permite elegir **edición** al añadir un libro, pero cada resultado trae una sola portada (la primera que devuelve Open Library o Google Books). En la práctica un mismo título tiene varias cubiertas (ediciones, reimpresiones, mercados). Sin elegir portada, el tracker muestra una imagen arbitraria y la usuaria no controla cómo ve su biblioteca — algo relevante en un producto visual orientado a lectura.

## What Changes

- Nuevo endpoint (o ampliación del catálogo) que, **tras seleccionar una edición**, devuelve **varias opciones de portada** normalizadas (`url`, origen, etiqueta opcional).
- Para **Open Library**: obtener portadas de las ediciones asociadas al work (`/works/{id}/editions.json`) y/o IDs `cover_i` distintos; deduplicar URLs.
- Para **Google Books**: cuando el volumen tenga varias imágenes o existan volúmenes hermanos con distinta portada en el mismo resultado de búsqueda, exponer las disponibles (mínimo la principal + alternativas si la API las aporta).
- UI del modal «Añadir libro»: paso intermedio **«Elige portada»** (grid o carrusel) entre la selección de edición y «Guardar»; la portada elegida se envía en `cover_image_url` al `POST /v1/books`.
- Placeholder coherente si solo hay una portada o ninguna (UC-01 / estética app).
- Tests unitarios del agregador de portadas y prueba manual ampliada en KAN-9.

**Fuera de alcance:** subida de portada propia por la usuaria; búsqueda de portadas en fuentes distintas a las ya integradas (Goodreads, etc.).

## Capabilities

### New Capabilities

- `edition-cover-catalog`: Listado de variantes de portada para una edición concreta (`data_source` + `external_provider_id`), con deduplicación y límite razonable.
- `add-book-cover-picker`: Paso de UI en el flujo de alta para previsualizar y seleccionar una portada antes de guardar.

### Modified Capabilities

- `add-book-ui` (delta sobre el cambio KAN-9): el flujo de alta pasa de «seleccionar edición → guardar» a «seleccionar edición → elegir portada → guardar»; el escenario 3 de KAN-9 sigue exigiendo portada visible, pero la elegida por la usuaria.

## Impact

- **Backend:** `books` module — nuevo servicio/cliente de portadas OL; endpoint `GET /v1/books/catalog/covers`; posible extensión de `CatalogEditionDto` con `available_covers` opcional en fase 2.
- **Frontend:** `AddBookModal` — estado de paso (`search` | `pick-cover` | `confirm`), componente `CoverPicker`, API client.
- **Relación:** extiende implementación de `kan-9-add-book-auto-search` (mismo Jira **KAN-9**, UC-01).
- **APIs externas:** más llamadas a Open Library por work/editions (timeout ya ampliado a 12s en el cambio anterior).
