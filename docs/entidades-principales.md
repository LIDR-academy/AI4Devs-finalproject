# Descripción de entidades principales — MotoCiudad

> Documentación detallada de cada entidad del modelo de datos: atributos, tipos, restricciones, claves y relaciones.
> Acompaña a `modelo-datos.md` (que contiene el SQL ejecutable) ofreciendo una vista **legible y didáctica** de cada tabla, pensada para revisión académica.

**Versión**: 0.1
**Última actualización**: Mayo 2026

---

## 1. Introducción

El sistema persiste su información en **PostgreSQL 15 con extensión PostGIS 3.4**. El modelo se compone de **13 entidades** agrupadas en cuatro subdominios:

| Subdominio | Entidades |
|---|---|
| Identidad | `user_levels`, `users`, `friendships` |
| Dominio principal (parkings) | `parkings`, `parking_photos`, `parking_verifications`, `parking_reports`, `comments`, `comment_votes` |
| POIs secundarios | `pois` |
| Gamificación | `octano_events`, `badges`, `user_badges` |

### 1.1 Convenciones de tipos

| Tipo PostgreSQL | Significado | Ejemplo |
|---|---|---|
| `UUID` | Identificador universal único de 128 bits | `550e8400-e29b-41d4-a716-446655440000` |
| `VARCHAR(N)` | Texto de longitud variable con tope N caracteres | `'Plaza Pedro Zerolo'` |
| `TEXT` | Texto sin límite de longitud | Descripciones largas |
| `INTEGER` (`INT`) | Número entero de 32 bits | `42` |
| `SMALLINT` | Entero de 16 bits | `-1`, `1` |
| `NUMERIC(P, S)` | Decimal exacto con P dígitos totales, S decimales | `25.50`, `100.00` |
| `BOOLEAN` (`BOOL`) | Verdadero / falso | `true`, `false` |
| `TIMESTAMPTZ` | Fecha y hora con zona horaria | `2026-05-09 14:30:00+00` |
| `JSONB` | Documento JSON binario indexable | `{"covered": true, "h24": false}` |
| `ENUM` | Tipo enumerado con valores cerrados predefinidos | Ver §1.2 |
| `GEOGRAPHY(Point, 4326)` | Coordenada geográfica (longitud, latitud) en sistema WGS84 | `POINT(-3.7036 40.4231)` |
| `TEXT[]` | Array de cadenas de texto | `{"BMW Motorrad","KTM"}` |

### 1.2 Tipos enumerados (ENUM)

Estos tipos limitan los valores permitidos en sus columnas:

| Tipo | Valores permitidos |
|---|---|
| `parking_type` | `public`, `private` |
| `parking_status` | `pending`, `verified`, `rejected`, `archived` |
| `poi_type` | `workshop`, `itv`, `gas_station`, `shop` |
| `report_reason` | `not_exists`, `wrong_location`, `closed`, `private_now`, `duplicate`, `other` |
| `report_status` | `pending`, `confirmed`, `dismissed` |
| `octano_action` | `propose_parking`, `parking_verified_bonus`, `verify_parking`, `first_verifier`, `report_error`, `upload_photo`, `useful_comment`, `propose_poi`, `weekly_streak`, `invite_friend` |
| `octano_status` | `pending`, `confirmed`, `reverted` |
| `badge_family` | `discovery`, `verification`, `community`, `thematic` |
| `friendship_status` | `pending`, `accepted`, `blocked` |

### 1.3 Notación para claves y restricciones

| Símbolo | Significado |
|---|---|
| **PK** | Primary Key (clave primaria) |
| **FK** | Foreign Key (clave foránea, referencia a otra tabla) |
| **UK** | Unique Key (valor único en la tabla) |
| **NN** | Not Null (no puede ser nulo) |
| **DEF** | Default (valor por defecto si no se especifica al insertar) |
| **CHK** | Check constraint (regla de validación a nivel de fila) |
| **GIST** | Índice especial para tipos geográficos |

### 1.4 Tipos de relación

| Cardinalidad | Significado |
|---|---|
| **1:1** | Uno a uno: cada fila de A se relaciona con exactamente una de B |
| **1:N** | Uno a muchos: una fila de A puede relacionarse con muchas de B |
| **N:M** | Muchos a muchos: implementado vía tabla intermedia |
| **0..1** | Relación opcional: la columna FK puede ser NULL |

---

## 2. Vista global del modelo

```mermaid
erDiagram
    user_levels ||--o{ users : "current_level"
    users ||--o{ friendships : "user_id"
    users ||--o{ friendships : "friend_id"
    users ||--o{ parkings : "proposed_by"
    users ||--o{ parking_photos : "uploaded_by"
    users ||--o{ parking_verifications : "verified_by"
    users ||--o{ parking_reports : "reported_by"
    users ||--o{ comments : "author_id"
    users ||--o{ comment_votes : "user_id"
    users ||--o{ pois : "proposed_by"
    users ||--o{ octano_events : "user_id"
    users ||--o{ user_badges : "user_id"
    parkings ||--o{ parking_photos : "has"
    parkings ||--o{ parking_verifications : "is verified by"
    parkings ||--o{ parking_reports : "reported"
    parkings ||--o{ comments : "has"
    parking_photos ||--o| parking_verifications : "evidence"
    comments ||--o{ comment_votes : "receives"
    badges ||--o{ user_badges : "awarded"
```

Para diagramas detallados por subdominio, ver `modelo-datos.md` §5–§8.

---

## 3. Entidades de Identidad

### 3.1 `user_levels` — Catálogo de niveles

**Propósito**: catálogo estático con los 7 niveles del sistema de gamificación (Pipiolo → Leyenda del Asfalto). Carga datos vía seed; no se modifica en tiempo de ejecución.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `level` | `INTEGER` | **PK**, NN | Número de nivel (1 a 7) |
| `name` | `VARCHAR(40)` | NN | Nombre público del nivel ("Pipiolo", "Cartógrafo"...) |
| `min_octanos` | `INTEGER` | NN, **UK** | Octanos mínimos para alcanzar este nivel |
| `benefits` | `JSONB` | NN, DEF `'[]'` | Lista de capacidades desbloqueadas (ej: `["verify", "auto_publish"]`) |
| `icon_url` | `TEXT` | — | URL del icono asociado al nivel |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de creación del registro |

**Claves**:
- Primaria: `level`
- Únicas: `min_octanos` (no puede haber dos niveles con el mismo umbral)

**Relaciones**:
- `1:N` con `users` a través de `users.current_level` → `user_levels.level`

**Datos iniciales** (seed):

| level | name | min_octanos |
|---|---|---|
| 1 | Pipiolo | 0 |
| 2 | Rodador | 101 |
| 3 | Buscaplazas | 501 |
| 4 | Cartógrafo | 1.501 |
| 5 | Centinela | 4.001 |
| 6 | Maestro Motero | 10.001 |
| 7 | Leyenda del Asfalto | 25.001 |

---

### 3.2 `users` — Perfil público de usuario

**Propósito**: extiende `auth.users` (gestionado por Supabase Auth) con los campos públicos del perfil. Es el centro relacional del modelo: prácticamente todas las demás entidades referencian a `users`.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, **FK** → `auth.users(id)` ON DELETE CASCADE, NN | Mismo UUID que la cuenta de autenticación |
| `username` | `VARCHAR(30)` | **UK**, NN | Nombre de usuario público, inmutable post-registro |
| `display_name` | `VARCHAR(60)` | NN | Nombre mostrado, editable libremente |
| `avatar_url` | `TEXT` | — | URL del avatar en Supabase Storage |
| `bike_model` | `VARCHAR(80)` | — | Modelo de moto del usuario (ej: "Z900", "MT-07") |
| `city_primary` | `VARCHAR(80)` | — | Ciudad principal de actividad |
| `current_level` | `INTEGER` | **FK** → `user_levels(level)`, NN, DEF `1` | Nivel actual del usuario |
| `total_octanos` | `INTEGER` | NN, DEF `0` | **Caché derivada**: suma de Octanos confirmados |
| `octanos_this_month` | `INTEGER` | NN, DEF `0` | **Caché derivada**: Octanos en últimos 30 días |
| `ranking_visible` | `BOOLEAN` | NN, DEF `true` | Si `false`, el usuario no aparece en rankings públicos |
| `flagged_for_review` | `BOOLEAN` | NN, DEF `false` | Cuenta marcada por sistema anti-abuso |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de registro |
| `updated_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Última modificación (mantenida por trigger) |

**Claves**:
- Primaria: `id`
- Únicas: `username`
- Foráneas: `id` → `auth.users(id)`, `current_level` → `user_levels(level)`

**Índices**:
- `idx_users_city` sobre `city_primary` (parcial: solo donde `ranking_visible = true`)
- `idx_users_total_octanos` sobre `total_octanos DESC` (parcial: solo donde `ranking_visible = true`)

**Notas importantes**:
- Los campos `total_octanos` y `octanos_this_month` son **cachés derivadas**. La fuente de verdad es la suma de `octano_events` con `status='confirmed'`. Se recalculan vía trigger tras cada nuevo evento confirmado.
- El borrado de la cuenta en `auth.users` propaga en cascada a `public.users` y, a través de relaciones, a todas las contribuciones del usuario (con anonimización previa para preservar el dataset; ver §RGPD en `modelo-datos.md` §15).

**Relaciones** (resumen):
- `N:1` con `user_levels` (un usuario tiene un nivel; un nivel agrupa muchos usuarios)
- `1:N` como creador con: `parkings`, `parking_photos`, `parking_verifications`, `parking_reports`, `comments`, `comment_votes`, `pois`, `octano_events`, `user_badges`
- `N:M` consigo mismo a través de `friendships`

---

### 3.3 `friendships` — Relación de amistad entre usuarios

**Propósito**: implementa el sistema de amigos para el ranking privado. Es una **autorrelación** sobre `users`, opt-in mutua.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `user_id` | `UUID` | **PK**, **FK** → `users(id)` ON DELETE CASCADE, NN | Usuario que envía la petición |
| `friend_id` | `UUID` | **PK**, **FK** → `users(id)` ON DELETE CASCADE, NN | Usuario receptor |
| `status` | `friendship_status` | NN, DEF `'pending'` | Estado: `pending`, `accepted`, `blocked` |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de envío de la petición |
| `updated_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Última actualización del estado |

**Claves**:
- Primaria compuesta: `(user_id, friend_id)`
- Foráneas: ambas a `users(id)` con borrado en cascada

**Restricciones de integridad**:
- `CHK (user_id <> friend_id)`: un usuario no puede ser amigo de sí mismo

**Índices**:
- `idx_friendships_friend` sobre `(friend_id, status)` para consultar peticiones recibidas

**Cardinalidad**: relación `N:M` reflexiva sobre `users`.

---

## 4. Entidades de dominio principal (parkings)

### 4.1 `parkings` — Plaza de aparcamiento

**Propósito**: entidad central del dominio. Representa cada parking propuesto por la comunidad. Concentra toda la información que el usuario necesita para decidir si va a un sitio.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `proposed_by` | `UUID` | **FK** → `users(id)`, NN | Usuario que propuso el parking |
| `name` | `VARCHAR(120)` | NN | Nombre o referencia ("Plaza Pedro Zerolo") |
| `type` | `parking_type` | NN | `public` o `private` |
| `status` | `parking_status` | NN, DEF `'pending'` | Estado del ciclo de vida |
| `location` | `GEOGRAPHY(Point, 4326)` | NN | Coordenadas (lng, lat) en sistema WGS84 |
| `address` | `VARCHAR(200)` | — | Dirección postal completa |
| `city` | `VARCHAR(80)` | NN | Ciudad ("Madrid", "Barcelona") |
| `district` | `VARCHAR(80)` | — | Barrio o distrito ("Malasaña", "Lavapiés") |
| `capacity` | `INTEGER` | — | Número aproximado de plazas |
| `price_monthly` | `NUMERIC(7, 2)` | — | Precio mensual en € (solo privados) |
| `features` | `JSONB` | NN, DEF `'{}'` | Características booleanas (ver tabla abajo) |
| `notes` | `TEXT` | — | Comentario libre del proponente |
| `verifications_count` | `INTEGER` | NN, DEF `0` | **Caché derivada**: nº verificaciones |
| `reports_count` | `INTEGER` | NN, DEF `0` | **Caché derivada**: nº reportes |
| `last_verified_at` | `TIMESTAMPTZ` | — | Fecha de la última verificación válida |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de propuesta |
| `updated_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Última modificación |
| `deleted_at` | `TIMESTAMPTZ` | — | Soft delete: si no es NULL, el parking está borrado |

**Estructura del campo `features` (JSONB)**:

| Clave | Tipo | Significado |
|---|---|---|
| `covered` | bool | Tiene techo/cubierta |
| `cameras` | bool | Vigilancia con cámaras |
| `anchors` | bool | Anclajes para candados |
| `lit` | bool | Iluminado |
| `free` | bool | Gratuito (false implica privado de pago) |
| `h24` | bool | Acceso 24 horas |
| `battery_layout` | bool | Plazas en batería (vs. cordón) |

**Claves**:
- Primaria: `id`
- Foráneas: `proposed_by` → `users(id)`

**Índices**:
- `idx_parkings_location` (GIST sobre `location`) — imprescindible para queries geoespaciales
- `idx_parkings_status` (parcial: solo donde `deleted_at IS NULL`)
- `idx_parkings_city` (parcial: solo donde `deleted_at IS NULL`)
- `idx_parkings_proposer` sobre `proposed_by`

**Relaciones**:
- `N:1` con `users` (un parking tiene un proponente)
- `1:N` con `parking_photos` (un parking tiene varias fotos)
- `1:N` con `parking_verifications` (un parking puede ser verificado N veces)
- `1:N` con `parking_reports` (un parking puede ser reportado N veces)
- `1:N` con `comments` (un parking puede tener N comentarios)

---

### 4.2 `parking_photos` — Fotos asociadas a un parking

**Propósito**: cada foto de un parking, ya sea del proponente, fruto de una verificación, o aporte posterior.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `parking_id` | `UUID` | **FK** → `parkings(id)` ON DELETE CASCADE, NN | Parking al que pertenece |
| `uploaded_by` | `UUID` | **FK** → `users(id)`, NN | Usuario que subió la foto |
| `storage_path` | `TEXT` | NN | Ruta en Supabase Storage |
| `thumbnail_path` | `TEXT` | — | Ruta del thumbnail generado |
| `is_primary` | `BOOLEAN` | NN, DEF `false` | Si es la foto destacada del parking |
| `is_verification` | `BOOLEAN` | NN, DEF `false` | Si proviene de un acto de verificación |
| `width` | `INTEGER` | — | Ancho original en píxeles |
| `height` | `INTEGER` | — | Alto original en píxeles |
| `size_bytes` | `INTEGER` | — | Tamaño del archivo |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de subida |

**Claves**:
- Primaria: `id`
- Foráneas: `parking_id` → `parkings(id)` (cascada), `uploaded_by` → `users(id)`

**Índices**:
- `idx_photos_parking` sobre `parking_id`
- `idx_photos_uploader` sobre `uploaded_by`

**Relaciones**:
- `N:1` con `parkings`
- `N:1` con `users` (subidor)
- `0..1:1` con `parking_verifications` (una foto puede ser evidencia de una verificación)

---

### 4.3 `parking_verifications` — Verificación in situ

**Propósito**: cada acto de verificación (foto in situ con geofencing) que confirma que un parking existe. Es la acción **más valiosa** del sistema y la que más Octanos otorga (+25, +15 extra si es primer verificador).

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `parking_id` | `UUID` | **FK** → `parkings(id)` ON DELETE CASCADE, NN | Parking verificado |
| `verified_by` | `UUID` | **FK** → `users(id)`, NN | Usuario que verifica |
| `photo_id` | `UUID` | **FK** → `parking_photos(id)`, NN | Foto que evidencia la verificación |
| `user_location` | `GEOGRAPHY(Point, 4326)` | NN | Posición GPS declarada al verificar |
| `distance_meters` | `NUMERIC(8, 2)` | NN | Distancia validada al parking (≤ 100m) |
| `is_first_verifier` | `BOOLEAN` | NN, DEF `false` | Si es la primera verificación del parking |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Momento de la verificación |

**Claves**:
- Primaria: `id`
- Únicas: `(parking_id, verified_by)` — un usuario solo puede verificar un parking una vez (cooldown)
- Foráneas: `parking_id` → `parkings(id)` (cascada), `verified_by` → `users(id)`, `photo_id` → `parking_photos(id)`

**Índices**:
- `idx_verifications_parking` sobre `parking_id`
- `idx_verifications_user` sobre `verified_by`

**Restricciones de negocio** (validadas en Edge Function `validate-verification`, no en SQL):
- `distance_meters ≤ 100`
- Foto con `taken_at` ≤ 5 minutos antes de la inserción
- El usuario no es el mismo que `parkings.proposed_by` (no auto-verificación)
- Cap diario del usuario < 200 Octanos

**Relaciones**:
- `N:1` con `parkings`
- `N:1` con `users` (verificador)
- `N:1` con `parking_photos` (foto-evidencia)

---

### 4.4 `parking_reports` — Reporte de error

**Propósito**: permite a la comunidad reportar parkings inexistentes, mal ubicados o que han cambiado. Mantiene el dataset limpio.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `parking_id` | `UUID` | **FK** → `parkings(id)` ON DELETE CASCADE, NN | Parking reportado |
| `reported_by` | `UUID` | **FK** → `users(id)`, NN | Usuario que reporta |
| `reason` | `report_reason` | NN | Motivo del reporte |
| `comment` | `TEXT` | — | Aclaración opcional |
| `status` | `report_status` | NN, DEF `'pending'` | `pending`, `confirmed` o `dismissed` |
| `weight` | `INTEGER` | NN, DEF `1` | Peso del reporte (2 si reporter es nivel ≥ 4) |
| `resolved_at` | `TIMESTAMPTZ` | — | Fecha de resolución por moderador |
| `resolved_by` | `UUID` | **FK** → `users(id)` | Moderador que lo resolvió |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de reporte |

**Claves**:
- Primaria: `id`
- Únicas: `(parking_id, reported_by, status)` — evita reportes pendientes duplicados del mismo usuario sobre el mismo parking
- Foráneas: `parking_id` → `parkings(id)` (cascada), `reported_by` → `users(id)`, `resolved_by` → `users(id)`

**Índices**:
- `idx_reports_parking` sobre `parking_id`
- `idx_reports_status` sobre `status` (para colas de moderación)

---

### 4.5 `comments` — Comentarios sobre parkings

**Propósito**: comentarios libres de los usuarios sobre los parkings. Solo otorgan Octanos cuando reciben ≥ 2 votos positivos (regla de calidad).

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `parking_id` | `UUID` | **FK** → `parkings(id)` ON DELETE CASCADE, NN | Parking comentado |
| `author_id` | `UUID` | **FK** → `users(id)`, NN | Autor del comentario |
| `body` | `TEXT` | NN, **CHK** longitud entre 1 y 500 | Texto del comentario |
| `upvotes_count` | `INTEGER` | NN, DEF `0` | **Caché derivada**: nº votos positivos |
| `octanos_awarded` | `BOOLEAN` | NN, DEF `false` | Garantiza que los Octanos se otorgan una sola vez |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de publicación |
| `updated_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Última edición |
| `deleted_at` | `TIMESTAMPTZ` | — | Soft delete |

**Claves**:
- Primaria: `id`
- Foráneas: `parking_id` → `parkings(id)` (cascada), `author_id` → `users(id)`

**Restricciones**:
- `CHK length(body) BETWEEN 1 AND 500`

**Índices**:
- `idx_comments_parking` sobre `parking_id` (parcial: solo donde `deleted_at IS NULL`)

---

### 4.6 `comment_votes` — Votos sobre comentarios

**Propósito**: registra cada voto (positivo o negativo) que un usuario emite sobre un comentario. Es una **tabla intermedia** que materializa la relación `N:M` entre `users` y `comments`.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `comment_id` | `UUID` | **PK**, **FK** → `comments(id)` ON DELETE CASCADE, NN | Comentario votado |
| `user_id` | `UUID` | **PK**, **FK** → `users(id)` ON DELETE CASCADE, NN | Usuario votante |
| `value` | `SMALLINT` | NN, **CHK** ∈ {-1, +1} | Voto: +1 positivo, -1 negativo |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Momento del voto |

**Claves**:
- Primaria compuesta: `(comment_id, user_id)` — un usuario solo vota una vez por comentario
- Foráneas: ambas con borrado en cascada

**Restricciones**:
- `CHK value IN (-1, 1)`

**Cardinalidad**: implementa relación `N:M` entre `users` y `comments`.

---

## 5. Entidades de POIs secundarios

### 5.1 `pois` — Puntos de interés (talleres, ITV, etc.)

**Propósito**: entidad paralela a `parkings` que representa POIs útiles para moteros pero distintos a parkings: talleres especializados, ITV, gasolineras, tiendas. En el MVP solo se activa `workshop` (taller).

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `proposed_by` | `UUID` | **FK** → `users(id)`, NN | Usuario que propuso el POI |
| `name` | `VARCHAR(120)` | NN | Nombre comercial |
| `type` | `poi_type` | NN | `workshop`, `itv`, `gas_station`, `shop` |
| `status` | `parking_status` | NN, DEF `'pending'` | Reutiliza enum de parkings |
| `location` | `GEOGRAPHY(Point, 4326)` | NN | Coordenadas WGS84 |
| `address` | `VARCHAR(200)` | — | Dirección postal |
| `city` | `VARCHAR(80)` | NN | Ciudad |
| `phone` | `VARCHAR(20)` | — | Teléfono de contacto |
| `website` | `TEXT` | — | URL del sitio web |
| `opening_hours` | `JSONB` | — | Horarios estructurados por día |
| `specialties` | `TEXT[]` | — | Array de especialidades ("BMW Motorrad", "KTM"...) |
| `rating_average` | `NUMERIC(2, 1)` | — | Caché de valoración media |
| `reviews_count` | `INTEGER` | NN, DEF `0` | Caché de número de reseñas |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de creación |
| `updated_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Última modificación |
| `deleted_at` | `TIMESTAMPTZ` | — | Soft delete |

**Estructura de `opening_hours` (JSONB)**:

```json
{
  "mon": ["09:00-13:30", "16:00-19:30"],
  "tue": ["09:00-13:30", "16:00-19:30"],
  "wed": ["09:00-13:30", "16:00-19:30"],
  "thu": ["09:00-13:30", "16:00-19:30"],
  "fri": ["09:00-13:30", "16:00-19:30"],
  "sat": ["09:00-14:00"],
  "sun": []
}
```

**Claves**:
- Primaria: `id`
- Foráneas: `proposed_by` → `users(id)`

**Índices**:
- `idx_pois_location` (GIST sobre `location`)
- `idx_pois_city` (parcial: `deleted_at IS NULL`)
- `idx_pois_type` (parcial: `deleted_at IS NULL`)

**Relaciones**:
- `N:1` con `users` (proponente)

---

## 6. Entidades de Gamificación

### 6.1 `octano_events` — Registro inmutable de Octanos

**Propósito**: tabla **insert-only** que guarda cada acción puntuable. Es la **fuente de verdad** del sistema de puntuación: la suma de eventos con `status='confirmed'` es la moneda real del usuario. La existencia de esta tabla permite auditoría completa, reversibilidad y reconciliación de cachés.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `user_id` | `UUID` | **FK** → `users(id)` ON DELETE CASCADE, NN | Usuario que recibe los Octanos |
| `action_type` | `octano_action` | NN | Tipo de acción (ver enum) |
| `points` | `INTEGER` | NN | Octanos otorgados (siempre positivo) |
| `reference_id` | `UUID` | — | ID del recurso asociado (parking, comment, poi...) |
| `reference_type` | `VARCHAR(20)` | — | Tipo del recurso ("parking", "comment", "poi", "user", "none") |
| `status` | `octano_status` | NN, DEF `'pending'` | `pending`, `confirmed`, `reverted` |
| `metadata` | `JSONB` | DEF `'{}'` | Contexto adicional (ciudad, IP, etc.) |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Momento del evento |
| `confirmed_at` | `TIMESTAMPTZ` | — | Momento de confirmación (si aplica) |

**Tabla de Octanos por acción**:

| Acción | Octanos | Notas |
|---|---|---|
| Proponer un parking nuevo | +50 | Confirmados al pasar verificación |
| Tu parking propuesto se verifica | +30 | Bonus al proponente |
| Verificar un parking (con foto in situ) | +25 | La acción más valiosa |
| Ser el primer verificador de un parking | +15 | Bonus encima de los +25 |
| Reportar parking erróneo (confirmado) | +20 | Mantiene calidad del dataset |
| Subir foto a un parking existente | +10 | Máx. 3 fotos puntuables por parking |
| Comentario útil (≥2 upvotes) | +5 | Solo si recibe votos positivos |
| Proponer taller / POI secundario | +30 | Feature secundario |
| Racha semanal (7 días seguidos) | +15 | Refuerza hábito |
| Invitar amigo que se registra y aporta | +40 | Crecimiento orgánico |

**Claves**:
- Primaria: `id`
- Foráneas: `user_id` → `users(id)` (cascada)

**Índices**:
- `idx_octano_events_user` sobre `(user_id, status)` — para sumar Octanos del usuario
- `idx_octano_events_user_recent` sobre `(user_id, confirmed_at DESC)` (parcial: solo `confirmed`)
- `idx_octano_events_action` sobre `(action_type, created_at)` — para análisis temporal

**Reglas de integridad**:
- **Inmutabilidad**: una vez creado, solo el campo `status` puede cambiar (de `pending` a `confirmed` o `reverted`).
- **Inserción solo desde Edge Functions** con service role; políticas RLS bloquean inserción directa desde el cliente.

**Relaciones**:
- `N:1` con `users`
- Polimórfica con `parkings`, `comments`, `pois`... a través de `(reference_type, reference_id)` (no FK explícita, simplemente referencia lógica)

**Trigger asociado** (`refresh_user_octano_caches`):
- Tras INSERT con `status='confirmed'` o UPDATE de `status` a `confirmed`:
  - Recalcula `users.total_octanos` y `users.octanos_this_month`.
  - Llama a `check_level_up()` para detectar subidas de nivel.

---

### 6.2 `badges` — Catálogo de insignias

**Propósito**: catálogo de las ~20 insignias del MVP. Cada insignia tiene una `condition` (regla evaluable) que la Edge Function `check-badges` evalúa tras cada Octano confirmado.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | **PK**, NN, DEF `gen_random_uuid()` | Identificador único |
| `code` | `VARCHAR(60)` | **UK**, NN | Código estable (ej: `"first_finding"`, `"eagle_eye"`) |
| `family` | `badge_family` | NN | Familia: `discovery`, `verification`, `community`, `thematic` |
| `name` | `VARCHAR(80)` | NN | Nombre público ("Primer Hallazgo", "Ojo de Águila") |
| `description` | `TEXT` | NN | Descripción mostrada al usuario |
| `icon_url` | `TEXT` | — | Icono de la insignia |
| `condition` | `JSONB` | NN | Regla evaluable (ver estructura abajo) |
| `is_active` | `BOOLEAN` | NN, DEF `true` | Permite desactivar temporadas / insignias temáticas |
| `created_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Fecha de alta |

**Estructura del campo `condition` (JSONB)** — ejemplos:

```jsonc
// Insignia "Cartógrafo Local": 10 parkings aprobados en una misma ciudad
{
  "type": "city_count",
  "metric": "approved_parkings",
  "city_match": "same",
  "threshold": 10
}

// Insignia "Ojo de Águila": 25 verificaciones realizadas
{
  "type": "global_count",
  "metric": "verifications",
  "threshold": 25
}

// Insignia "Trotamundos": parkings aprobados en 5+ ciudades distintas
{
  "type": "distinct_cities",
  "metric": "approved_parkings",
  "threshold": 5
}
```

**Claves**:
- Primaria: `id`
- Únicas: `code`

**Índices**:
- `idx_badges_active` sobre `is_active` (parcial: solo donde `is_active = true`)

**Relaciones**:
- `1:N` con `user_badges`

---

### 6.3 `user_badges` — Insignias desbloqueadas por usuario

**Propósito**: relación que indica qué usuarios han desbloqueado qué insignias. Es la tabla intermedia que materializa el `N:M` entre `users` y `badges`.

**Atributos**:

| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `user_id` | `UUID` | **PK**, **FK** → `users(id)` ON DELETE CASCADE, NN | Usuario propietario |
| `badge_id` | `UUID` | **PK**, **FK** → `badges(id)` ON DELETE CASCADE, NN | Insignia desbloqueada |
| `earned_at` | `TIMESTAMPTZ` | NN, DEF `now()` | Momento de desbloqueo |
| `metadata` | `JSONB` | DEF `'{}'` | Contexto adicional (ej: ciudad de la insignia temática) |

**Claves**:
- Primaria compuesta: `(user_id, badge_id)` — un usuario no puede tener la misma insignia dos veces
- Foráneas: ambas con borrado en cascada

**Índices**:
- `idx_user_badges_user` sobre `user_id`

**Cardinalidad**: implementa `N:M` entre `users` y `badges`.

---

## 7. Resumen de relaciones

Tabla compacta con todas las relaciones del modelo:

| Origen | Destino | Cardinalidad | Vía | Borrado |
|---|---|---|---|---|
| `users` | `user_levels` | N:1 | `users.current_level` | RESTRICT (no se puede borrar nivel con usuarios) |
| `users` | `users` | N:M | tabla `friendships` | CASCADE |
| `parkings` | `users` | N:1 | `parkings.proposed_by` | RESTRICT |
| `parking_photos` | `parkings` | N:1 | `parking_photos.parking_id` | CASCADE |
| `parking_photos` | `users` | N:1 | `parking_photos.uploaded_by` | RESTRICT |
| `parking_verifications` | `parkings` | N:1 | `parking_verifications.parking_id` | CASCADE |
| `parking_verifications` | `users` | N:1 | `parking_verifications.verified_by` | RESTRICT |
| `parking_verifications` | `parking_photos` | N:1 | `parking_verifications.photo_id` | RESTRICT |
| `parking_reports` | `parkings` | N:1 | `parking_reports.parking_id` | CASCADE |
| `parking_reports` | `users` | N:1 | `parking_reports.reported_by` | RESTRICT |
| `parking_reports` | `users` | 0..1 | `parking_reports.resolved_by` | SET NULL |
| `comments` | `parkings` | N:1 | `comments.parking_id` | CASCADE |
| `comments` | `users` | N:1 | `comments.author_id` | RESTRICT |
| `comments` | `users` | N:M | tabla `comment_votes` | CASCADE |
| `pois` | `users` | N:1 | `pois.proposed_by` | RESTRICT |
| `octano_events` | `users` | N:1 | `octano_events.user_id` | CASCADE |
| `user_badges` | `users` | N:1 | `user_badges.user_id` | CASCADE |
| `user_badges` | `badges` | N:1 | `user_badges.badge_id` | CASCADE |
| `users` | `badges` | N:M | tabla `user_badges` | CASCADE |

---

## 8. Restricciones e invariantes del modelo

Resumen de las restricciones más relevantes que protegen la integridad de los datos:

### 8.1 Restricciones declaradas en SQL

| Tabla | Restricción | Tipo |
|---|---|---|
| `friendships` | `CHK (user_id <> friend_id)` | Integridad: nadie es su propio amigo |
| `comments` | `CHK length(body) BETWEEN 1 AND 500` | Validación de tamaño |
| `comment_votes` | `CHK value IN (-1, 1)` | Dominio cerrado |
| `parking_verifications` | `UNIQUE (parking_id, verified_by)` | Cooldown: 1 verificación por usuario y parking |
| `parking_reports` | `UNIQUE (parking_id, reported_by, status)` | Evita reports duplicados pendientes |
| `users` | `UNIQUE username` | Username único en todo el sistema |
| `user_levels` | `UNIQUE min_octanos` | No hay dos niveles con el mismo umbral |
| `badges` | `UNIQUE code` | Código de insignia único |

### 8.2 Invariantes mantenidas por triggers y Edge Functions

Restricciones que **no se declaran en SQL** pero son críticas; viven en lógica de negocio:

| Invariante | Dónde se mantiene |
|---|---|
| `users.total_octanos` siempre igual a la suma de `octano_events` con `status='confirmed'` | Trigger `refresh_user_octano_caches` |
| `users.current_level` corresponde al nivel cuyo `min_octanos` es ≤ `total_octanos` | Función `check_level_up()` invocada por trigger |
| `users.current_level` solo sube, nunca baja | Lógica en `check_level_up()` |
| Una verificación solo se acepta si distancia ≤ 100m y foto ≤ 5min | Edge Function `validate-verification` |
| Cap diario de 200 Octanos por usuario | Edge Function `validate-verification` |
| Un usuario no puede verificar su propio parking | Edge Function `validate-verification` |
| Comentarios solo otorgan Octanos cuando llegan a 2 upvotes (una sola vez) | Edge Function disparada por trigger en `comment_votes`, controlada por flag `comments.octanos_awarded` |

### 8.3 Soft delete

Las entidades con soft delete no se eliminan físicamente sino que marcan `deleted_at = now()`:

- `parkings`
- `pois`
- `comments`

El resto usa hard delete (con o sin cascada según la relación).

---

## 9. Mapeo entidad ↔ documentación complementaria

| Entidad | Detalle SQL | Reglas de negocio | UI / componentes |
|---|---|---|---|
| `users`, `user_levels`, `friendships` | `modelo-datos.md` §5 | `gamificacion.md` §3 | `componentes-principales.md` §3.1, §3.9 |
| `parkings`, `parking_photos` | `modelo-datos.md` §6.2-6.3 | `prd.md` §8.2 | `componentes-principales.md` §3.4, §3.5 |
| `parking_verifications` | `modelo-datos.md` §6.4 | `gamificacion.md` §2.2 | `componentes-principales.md` §3.6 |
| `parking_reports` | `modelo-datos.md` §6.5 | `prd.md` §8.2 | `componentes-principales.md` §3.4 |
| `comments`, `comment_votes` | `modelo-datos.md` §6.6-6.7 | `gamificacion.md` §2.1 | `componentes-principales.md` §3.4 |
| `pois` | `modelo-datos.md` §7.2 | `prd.md` §7.1 (F14) | `componentes-principales.md` §3.4 |
| `octano_events` | `modelo-datos.md` §8.2 | `gamificacion.md` §2 | `componentes-principales.md` §3.7 |
| `badges`, `user_badges` | `modelo-datos.md` §8.3-8.4 | `gamificacion.md` §4 | `componentes-principales.md` §3.7, §3.9 |

---

## 10. Documentos relacionados

- `modelo-datos.md` — schema SQL completo, RLS policies, funciones, vistas materializadas.
- `gamificacion.md` — reglas detalladas del sistema de Octanos, niveles e insignias.
- `componentes-principales.md` — qué componentes funcionales consumen y producen estas entidades.
- `arquitectura.md` — cómo la app accede a estos datos a través de Supabase.
- `prd.md` — requisitos de producto que justifican cada entidad.
