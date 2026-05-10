# Especificación de la API — MotoCiudad

> Especificación OpenAPI 3.1 de los endpoints principales del sistema.
> Acompaña a `arquitectura.md` (qué tipos de endpoints existen) y `modelo-datos.md` (schema de los datos que se intercambian).

**Versión**: 0.1
**Última actualización**: Mayo 2026

---

## 1. Visión general

MotoCiudad **no implementa una API REST custom**. Toda la comunicación entre la app móvil y el backend pasa a través de Supabase, que ofrece tres patrones de acceso:

| Patrón | Uso | Ejemplo |
|---|---|---|
| **REST auto-generado** (PostgREST) | Lectura simple y escrituras con RLS | `POST /rest/v1/parkings` |
| **RPC (funciones SQL)** | Queries complejas (geo, agregaciones) | `POST /rest/v1/rpc/nearby_parkings` |
| **Edge Functions** (Deno + TypeScript) | Lógica crítica con validaciones server-side | `POST /functions/v1/validate-verification` |

Los tres endpoints documentados en este capítulo representan cada uno de los tres patrones, ofreciendo una vista completa del estilo de la API.

### 1.1 Datos generales

| Concepto | Valor |
|---|---|
| URL base | `https://<project-ref>.supabase.co` |
| Versión OpenAPI | 3.1.0 |
| Formato de intercambio | JSON |
| Codificación | UTF-8 |
| Autenticación | JWT Bearer (Supabase Auth) |
| Header obligatorio adicional | `apikey: <anon_key>` |

### 1.2 Convenciones

- Todos los endpoints requieren autenticación salvo los explícitamente marcados como públicos.
- Los timestamps se devuelven en formato ISO 8601 con zona horaria (`2026-05-09T14:30:00+00:00`).
- Las coordenadas se expresan como pares `(longitude, latitude)` en sistema WGS84 (EPSG:4326), siguiendo la convención de PostGIS.
- Las distancias en metros con dos decimales.
- Los UUIDs siguen el formato canónico v4 (`550e8400-e29b-41d4-a716-446655440000`).
- Los errores devuelven siempre el mismo formato (ver §5).

### 1.3 Endpoints documentados

| # | Método | Endpoint | Tipo | Descripción |
|---|---|---|---|---|
| 1 | POST | `/rest/v1/rpc/nearby_parkings` | RPC | Búsqueda geoespacial de parkings cercanos |
| 2 | POST | `/rest/v1/parkings` | REST con RLS | Proponer un parking nuevo |
| 3 | POST | `/functions/v1/validate-verification` | Edge Function | Verificar un parking in situ |

---

## 2. Especificación OpenAPI 3.1

```yaml
openapi: 3.1.0

info:
  title: MotoCiudad API
  description: |
    API de MotoCiudad servida íntegramente por Supabase.
    Documenta los tres endpoints principales del sistema, representativos
    de los tres patrones de acceso: REST auto-generado, RPC y Edge Functions.
  version: 0.1.0
  contact:
    name: MotoCiudad
    email: hola@motociudad.app

servers:
  - url: https://{projectRef}.supabase.co
    description: Servidor Supabase (cloud)
    variables:
      projectRef:
        default: motociudad-prod
        description: Identificador del proyecto Supabase

security:
  - bearerAuth: []
    apiKey: []

tags:
  - name: parkings
    description: Operaciones sobre parkings
  - name: verifications
    description: Verificación in situ y anti-abuso

paths:

  # ================================================================
  # 1. RPC — Búsqueda geoespacial
  # ================================================================
  /rest/v1/rpc/nearby_parkings:
    post:
      tags: [parkings]
      summary: Obtener parkings cercanos a una ubicación
      description: |
        Devuelve los parkings dentro del radio especificado, ordenados por
        distancia ascendente. Usa la función SQL `nearby_parkings` que
        internamente aplica el operador PostGIS `ST_DWithin` sobre el
        índice GiST de la columna `parkings.location`.

        El endpoint respeta las políticas RLS: solo se retornan parkings
        verificados (`status='verified'`) salvo que el usuario sea el
        proponente.
      operationId: nearbyParkings
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [in_lat, in_lng]
              properties:
                in_lat:
                  type: number
                  format: double
                  description: Latitud del centro de búsqueda (WGS84)
                  example: 40.4231
                in_lng:
                  type: number
                  format: double
                  description: Longitud del centro de búsqueda (WGS84)
                  example: -3.7036
                in_radius_m:
                  type: integer
                  description: Radio de búsqueda en metros
                  default: 5000
                  minimum: 100
                  maximum: 50000
                  example: 2000
                in_filter:
                  type: string
                  description: Filtro opcional por tipo de parking
                  enum: [public, private]
                  example: public
                in_only_verified:
                  type: boolean
                  description: Si se devuelven solo parkings verificados
                  default: false
                in_limit:
                  type: integer
                  description: Máximo de resultados a devolver
                  default: 100
                  minimum: 1
                  maximum: 500
      responses:
        '200':
          description: Lista de parkings cercanos ordenados por distancia
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/NearbyParking'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'

  # ================================================================
  # 2. REST con RLS — Crear propuesta de parking
  # ================================================================
  /rest/v1/parkings:
    post:
      tags: [parkings]
      summary: Proponer un parking nuevo
      description: |
        Crea un nuevo parking en estado `pending`. La política RLS
        `parkings_insert` permite la operación si y solo si el campo
        `proposed_by` coincide con el `auth.uid()` del usuario autenticado
        y el `status` es `pending`.

        Tras la inserción se dispara automáticamente un trigger que
        registra un `octano_event` con `status='pending'`. Los Octanos
        (+50) se confirmarán cuando el parking sea verificado por la
        comunidad.

        El header `Prefer: return=representation` solicita que la API
        devuelva la fila creada en la respuesta.
      operationId: proposeParking
      parameters:
        - in: header
          name: Prefer
          schema:
            type: string
            default: return=representation
          description: Comportamiento de respuesta de PostgREST
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ParkingCreateInput'
      responses:
        '201':
          description: Parking creado exitosamente
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Parking'
                minItems: 1
                maxItems: 1
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          description: La política RLS rechaza la inserción
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # ================================================================
  # 3. Edge Function — Verificar parking in situ
  # ================================================================
  /functions/v1/validate-verification:
    post:
      tags: [verifications]
      summary: Verificar un parking in situ
      description: |
        Endpoint crítico del sistema. Recibe los datos de una verificación
        y aplica las reglas anti-abuso descritas en `gamificacion.md` §2.2:

        1. **Geofence**: la distancia entre `user_location` y la posición
           del parking debe ser ≤ 100 m.
        2. **Frescura de la foto**: `photo_taken_at` ≤ 5 minutos respecto
           al momento de la petición.
        3. **Cooldown**: el usuario no puede verificar el mismo parking
           más de una vez (UNIQUE en BBDD).
        4. **No auto-verificación**: el usuario no puede verificar un
           parking que él mismo propuso.
        5. **Cap diario**: el usuario no puede superar 200 Octanos
           confirmados en 24 horas.

        Si todas las reglas pasan, la función ejecuta una transacción
        que:
        - Inserta `parking_photos` con `is_verification=true`.
        - Inserta `parking_verifications`.
        - Inserta `octano_event(verify_parking, +25, status='confirmed')`.
        - Si `is_first_verifier=true`, inserta también
          `octano_event(first_verifier, +15, status='confirmed')`.

        El trigger `refresh_user_octano_caches` se encarga de actualizar
        los cachés del usuario y disparar la subida de nivel si procede.
      operationId: validateVerification
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VerificationInput'
      responses:
        '200':
          description: Verificación aceptada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VerificationSuccess'
        '400':
          description: Verificación rechazada por reglas anti-abuso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VerificationError'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'

# ================================================================
# Componentes reutilizables
# ================================================================
components:

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Token JWT emitido por Supabase Auth
    apiKey:
      type: apiKey
      in: header
      name: apikey
      description: Anon key del proyecto Supabase

  schemas:

    # ----------------------------------------------------------
    # Schemas de parking
    # ----------------------------------------------------------
    NearbyParking:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 550e8400-e29b-41d4-a716-446655440000
        name:
          type: string
          example: Plaza Pedro Zerolo
        type:
          type: string
          enum: [public, private]
          example: public
        status:
          type: string
          enum: [pending, verified, rejected, archived]
          example: verified
        city:
          type: string
          example: Madrid
        district:
          type: string
          nullable: true
          example: Malasaña
        capacity:
          type: integer
          nullable: true
          example: 24
        features:
          $ref: '#/components/schemas/ParkingFeatures'
        verifications_count:
          type: integer
          example: 12
        distance_meters:
          type: number
          format: float
          description: Distancia desde el punto de búsqueda
          example: 180.45
        lat:
          type: number
          format: double
          example: 40.4231
        lng:
          type: number
          format: double
          example: -3.7036

    ParkingCreateInput:
      type: object
      required: [proposed_by, name, type, location, city]
      properties:
        proposed_by:
          type: string
          format: uuid
          description: Debe coincidir con el `auth.uid()` del token
        name:
          type: string
          maxLength: 120
          example: Plaza Pedro Zerolo
        type:
          type: string
          enum: [public, private]
          example: public
        status:
          type: string
          enum: [pending]
          default: pending
          description: Solo `pending` permitido en inserción (RLS)
        location:
          type: string
          description: Punto en formato WKT (Well-Known Text)
          example: POINT(-3.7036 40.4231)
        address:
          type: string
          nullable: true
          maxLength: 200
          example: Calle de Pelayo s/n
        city:
          type: string
          maxLength: 80
          example: Madrid
        district:
          type: string
          nullable: true
          maxLength: 80
          example: Malasaña
        capacity:
          type: integer
          nullable: true
          minimum: 1
          example: 24
        features:
          $ref: '#/components/schemas/ParkingFeatures'
        notes:
          type: string
          nullable: true
          example: Plaza tranquila, suele quedar sitio los viernes noche.

    Parking:
      allOf:
        - $ref: '#/components/schemas/ParkingCreateInput'
        - type: object
          properties:
            id:
              type: string
              format: uuid
            verifications_count:
              type: integer
            reports_count:
              type: integer
            last_verified_at:
              type: string
              format: date-time
              nullable: true
            created_at:
              type: string
              format: date-time
            updated_at:
              type: string
              format: date-time

    ParkingFeatures:
      type: object
      description: Características del parking en formato JSONB
      properties:
        covered:
          type: boolean
        cameras:
          type: boolean
        anchors:
          type: boolean
        lit:
          type: boolean
        free:
          type: boolean
        h24:
          type: boolean
        battery_layout:
          type: boolean
      example:
        covered: false
        cameras: true
        anchors: false
        lit: true
        free: true
        h24: true
        battery_layout: true

    # ----------------------------------------------------------
    # Schemas de verificación
    # ----------------------------------------------------------
    VerificationInput:
      type: object
      required: [parking_id, user_lat, user_lng, photo_taken_at, photo_storage_path]
      properties:
        parking_id:
          type: string
          format: uuid
          description: Parking que se está verificando
          example: 550e8400-e29b-41d4-a716-446655440000
        user_lat:
          type: number
          format: double
          description: Latitud del usuario en el momento de la captura
          example: 40.42312
        user_lng:
          type: number
          format: double
          description: Longitud del usuario en el momento de la captura
          example: -3.70358
        photo_taken_at:
          type: string
          format: date-time
          description: Timestamp ISO 8601 de cuándo se tomó la foto
          example: '2026-05-09T14:28:30+00:00'
        photo_storage_path:
          type: string
          description: Path en Supabase Storage tras upload previo
          example: parkings/550e8400-e29b/photo-abc123.webp

    VerificationSuccess:
      type: object
      required: [success, octanos_awarded]
      properties:
        success:
          type: boolean
          enum: [true]
        verification_id:
          type: string
          format: uuid
          example: c1f2e3d4-0001-4abc-8def-000000000001
        octanos_awarded:
          type: integer
          description: Total de Octanos otorgados (25 + 15 si primer verificador)
          example: 40
        is_first_verifier:
          type: boolean
          example: true
        new_level_unlocked:
          type: integer
          nullable: true
          description: Nivel nuevo si esta verificación lo desbloqueó
          example: null

    VerificationError:
      type: object
      required: [success, error]
      properties:
        success:
          type: boolean
          enum: [false]
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
              enum:
                - GEOFENCE_FAIL
                - STALE_PHOTO
                - ALREADY_VERIFIED
                - SELF_VERIFICATION_FORBIDDEN
                - DAILY_CAP_REACHED
              description: |
                Códigos de error específicos:
                * `GEOFENCE_FAIL` — distancia > 100m
                * `STALE_PHOTO` — foto > 5 minutos
                * `ALREADY_VERIFIED` — usuario ya verificó este parking
                * `SELF_VERIFICATION_FORBIDDEN` — el usuario propuso este parking
                * `DAILY_CAP_REACHED` — cap de 200 Octanos/día alcanzado
            message:
              type: string
              example: Estás demasiado lejos del parking
            details:
              type: object
              additionalProperties: true
              example:
                distance_meters: 245.7
                max_allowed: 100

    # ----------------------------------------------------------
    # Errores genéricos
    # ----------------------------------------------------------
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          example: PGRST116
        message:
          type: string
          example: 'JSON object requested, multiple (or no) rows returned'
        details:
          type: string
          nullable: true
        hint:
          type: string
          nullable: true

  responses:
    Unauthorized:
      description: Token ausente, inválido o expirado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            code: '401'
            message: 'Invalid JWT'
    BadRequest:
      description: Petición malformada o datos inválidos
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalError:
      description: Error interno del servidor
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

---

## 3. Ejemplos de petición y respuesta

### 3.1 Endpoint 1: `nearby_parkings`

**Caso de uso**: el usuario abre la app, su GPS reporta su posición, y la app pinta los parkings públicos a 2 km a la redonda.

**Petición**:

```http
POST /rest/v1/rpc/nearby_parkings HTTP/1.1
Host: motociudad-prod.supabase.co
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "in_lat": 40.4231,
  "in_lng": -3.7036,
  "in_radius_m": 2000,
  "in_filter": "public",
  "in_only_verified": true,
  "in_limit": 50
}
```

**Respuesta** (`200 OK`):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Plaza Pedro Zerolo",
    "type": "public",
    "status": "verified",
    "city": "Madrid",
    "district": "Malasaña",
    "capacity": 24,
    "features": {
      "covered": false,
      "cameras": true,
      "free": true,
      "h24": true,
      "battery_layout": true
    },
    "verifications_count": 12,
    "distance_meters": 180.45,
    "lat": 40.4231,
    "lng": -3.7036
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Calle Argumosa 14",
    "type": "public",
    "status": "verified",
    "city": "Madrid",
    "district": "Lavapiés",
    "capacity": 8,
    "features": {
      "covered": false,
      "cameras": false,
      "free": true,
      "h24": true,
      "battery_layout": false
    },
    "verifications_count": 4,
    "distance_meters": 420.12,
    "lat": 40.4078,
    "lng": -3.6997
  }
]
```

---

### 3.2 Endpoint 2: `POST /parkings`

**Caso de uso**: el usuario está en el formulario "Aportar", arrastra el pin a la ubicación correcta, marca las características y envía.

**Petición**:

```http
POST /rest/v1/parkings HTTP/1.1
Host: motociudad-prod.supabase.co
Content-Type: application/json
Prefer: return=representation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "proposed_by": "11111111-1111-1111-1111-111111111111",
  "name": "Plaza Pedro Zerolo",
  "type": "public",
  "status": "pending",
  "location": "POINT(-3.7036 40.4231)",
  "address": "Calle de Pelayo s/n",
  "city": "Madrid",
  "district": "Malasaña",
  "capacity": 24,
  "features": {
    "covered": false,
    "cameras": true,
    "anchors": false,
    "lit": true,
    "free": true,
    "h24": true,
    "battery_layout": true
  },
  "notes": "Plaza tranquila, normalmente queda sitio incluso un viernes noche. Buena visibilidad."
}
```

**Respuesta** (`201 Created`):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "proposed_by": "11111111-1111-1111-1111-111111111111",
    "name": "Plaza Pedro Zerolo",
    "type": "public",
    "status": "pending",
    "location": "POINT(-3.7036 40.4231)",
    "address": "Calle de Pelayo s/n",
    "city": "Madrid",
    "district": "Malasaña",
    "capacity": 24,
    "features": {
      "covered": false,
      "cameras": true,
      "anchors": false,
      "lit": true,
      "free": true,
      "h24": true,
      "battery_layout": true
    },
    "notes": "Plaza tranquila, normalmente queda sitio incluso un viernes noche. Buena visibilidad.",
    "verifications_count": 0,
    "reports_count": 0,
    "last_verified_at": null,
    "created_at": "2026-05-09T14:30:00+00:00",
    "updated_at": "2026-05-09T14:30:00+00:00"
  }
]
```

**Respuesta de error** (`403 Forbidden`) si el `proposed_by` no coincide con el `auth.uid()`:

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"parkings\"",
  "details": null,
  "hint": null
}
```

---

### 3.3 Endpoint 3: `validate-verification`

**Caso de uso**: el usuario llega al parking, abre el detalle, pulsa "¿Has aparcado aquí?", la app abre la cámara, captura la foto con la moto y el parking visibles, y envía.

**Petición** (camino feliz):

```http
POST /functions/v1/validate-verification HTTP/1.1
Host: motociudad-prod.supabase.co
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "parking_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_lat": 40.42312,
  "user_lng": -3.70358,
  "photo_taken_at": "2026-05-09T14:28:30+00:00",
  "photo_storage_path": "parkings/550e8400-e29b-41d4-a716-446655440000/photo-abc123.webp"
}
```

**Respuesta de éxito** (`200 OK`):

```json
{
  "success": true,
  "verification_id": "c1f2e3d4-0001-4abc-8def-000000000001",
  "octanos_awarded": 40,
  "is_first_verifier": true,
  "new_level_unlocked": null
}
```

**Respuesta de error** (`400 Bad Request`) cuando el GPS está demasiado lejos:

```json
{
  "success": false,
  "error": {
    "code": "GEOFENCE_FAIL",
    "message": "Estás demasiado lejos del parking",
    "details": {
      "distance_meters": 245.7,
      "max_allowed": 100
    }
  }
}
```

**Respuesta de error** cuando ya verificó previamente:

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_VERIFIED",
    "message": "Ya has verificado este parking anteriormente",
    "details": {
      "previous_verification_at": "2026-04-15T10:22:00+00:00"
    }
  }
}
```

**Respuesta de error** al alcanzar el cap diario:

```json
{
  "success": false,
  "error": {
    "code": "DAILY_CAP_REACHED",
    "message": "Has alcanzado el límite diario de 200 Octanos",
    "details": {
      "octanos_today": 200,
      "cap": 200,
      "resets_at": "2026-05-10T00:00:00+00:00"
    }
  }
}
```

---

## 4. Manejo de errores — convención global

Todas las respuestas de error siguen una de estas dos formas, según el origen:

### 4.1 Errores de PostgREST (REST y RPC)

```json
{
  "code": "<código PostgreSQL o PostgREST>",
  "message": "<descripción legible>",
  "details": "<detalles opcionales>",
  "hint": "<sugerencia opcional>"
}
```

### 4.2 Errores de Edge Functions

```json
{
  "success": false,
  "error": {
    "code": "<CÓDIGO_DE_NEGOCIO>",
    "message": "<mensaje localizable en castellano>",
    "details": { "...": "..." }
  }
}
```

### 4.3 Códigos HTTP usados

| Código | Significado en este sistema |
|---|---|
| `200` | Operación correcta (lecturas, RPC, Edge Functions) |
| `201` | Recurso creado correctamente |
| `400` | Datos inválidos o regla de negocio rechaza la operación |
| `401` | Token ausente, inválido o expirado |
| `403` | Política RLS rechaza la operación (autorización) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej: clave única duplicada) |
| `429` | Rate limit excedido |
| `500` | Error interno (visible en Sentry) |

---

## 5. Por qué estos tres endpoints

La elección no es arbitraria: cada uno demuestra un patrón distinto del backend.

| Endpoint | Patrón demostrado | Lección que aporta |
|---|---|---|
| `nearby_parkings` (RPC) | Función SQL llamada desde el cliente con argumentos tipados, usa PostGIS y devuelve filas | Demuestra cómo se delegan al motor de BBDD las operaciones que requerían un endpoint custom en arquitecturas tradicionales |
| `POST /parkings` (REST con RLS) | Inserción directa contra la tabla, autorizada por una política RLS declarada en SQL | Demuestra que la autorización vive en la base de datos, no en middleware aplicacional |
| `validate-verification` (Edge Function) | Endpoint server-side con validaciones de negocio complejas que no se pueden expresar en SQL puro | Demuestra cuándo se sale del patrón anterior: cuando hay reglas que cruzan tablas, dependen del reloj y necesitan transacción explícita |

Juntos cubren los tres pilares de un backend Supabase: **lectura inteligente** (RPC), **escritura autorizada** (REST + RLS) y **lógica crítica** (Edge Functions). Los demás endpoints del sistema (perfil, ranking, comentarios, reports, badges) son variantes de estos tres patrones.

---

## 6. Endpoints adicionales del sistema (no documentados aquí)

Para completitud, lista de endpoints reales del sistema MVP. Su forma sigue uno de los tres patrones documentados arriba:

```
# Auth (gestionado por Supabase Auth, no PostgREST)
POST   /auth/v1/signup
POST   /auth/v1/token?grant_type=password
POST   /auth/v1/token?grant_type=refresh_token
POST   /auth/v1/logout

# Parkings (REST)
GET    /rest/v1/parkings
GET    /rest/v1/parkings?id=eq.{id}
POST   /rest/v1/parkings                       ← documentado
PATCH  /rest/v1/parkings?id=eq.{id}
GET    /rest/v1/parking_photos?parking_id=eq.{id}
POST   /rest/v1/parking_photos
GET    /rest/v1/comments?parking_id=eq.{id}
POST   /rest/v1/comments
POST   /rest/v1/comment_votes
POST   /rest/v1/parking_reports

# RPC (funciones SQL)
POST   /rest/v1/rpc/nearby_parkings            ← documentado
POST   /rest/v1/rpc/get_ranking
POST   /rest/v1/rpc/compute_user_octanos

# Edge Functions
POST   /functions/v1/validate-verification     ← documentado
POST   /functions/v1/award-octanos
POST   /functions/v1/check-badges
POST   /functions/v1/process-photo-upload
POST   /functions/v1/delete-account

# Storage
POST   /storage/v1/object/parkings-photos/{path}
GET    /storage/v1/object/public/parkings-photos/{path}
```

---

## 7. Documentos relacionados

- `arquitectura.md` §5 — Diseño general de la API.
- `modelo-datos.md` §11–§12 — Funciones SQL y vistas detrás de las RPC.
- `gamificacion.md` §2.2 — Reglas anti-abuso aplicadas en `validate-verification`.
- `entidades-principales.md` — Detalle de los schemas de respuesta.
- `componentes-principales.md` §3.5–§3.6 — Pantallas que consumen estos endpoints.
