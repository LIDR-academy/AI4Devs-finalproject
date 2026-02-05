# 4. API Specification

This section documents the 3 main API endpoints for the Route Searcher system in OpenAPI 3.0 format. These endpoints represent the critical user flow: searching for routes, viewing schedules, and validating site configurations.

## Overview

**Base URL:** `https://api.routesearch.busup.org`

**API Version:** v1

**Authentication:** Not specified in current documentation (future implementation)

**Content Type:** `application/json`

---

## Endpoint 1: Search Routes

### POST /api/v1/search/routes

**Service:** Search Service  
**Description:** Performs a geospatial search for available routes based on origin, destination, date, and optional time filters. This is the main entry point for the user journey.

**Request Body:**

```yaml
openapi: 3.0.3
components:
  schemas:
    SearchRoutesRequest:
      type: object
      required:
        - origin
        - destination
        - date
        - journeyType
      properties:
        origin:
          type: object
          description: Starting point of the journey
          required:
            - latitude
            - longitude
          properties:
            latitude:
              type: number
              format: double
              minimum: -90
              maximum: 90
              example: 40.416775
            longitude:
              type: number
              format: double
              minimum: -180
              maximum: 180
              example: -3.703790
            address:
              type: string
              description: Human-readable address
              example: "Calle Gran Vía 28, Madrid, España"
        destination:
          type: object
          description: End point of the journey
          required:
            - latitude
            - longitude
          properties:
            latitude:
              type: number
              format: double
              minimum: -90
              maximum: 90
              example: 40.453567
            longitude:
              type: number
              format: double
              minimum: -180
              maximum: 180
              example: -3.689021
            address:
              type: string
              description: Human-readable address
              example: "Parque Empresarial Las Rozas, Madrid, España"
        siteId:
          type: integer
          format: int32
          description: Corporate site ID for configuration (search radius)
          example: 42
        date:
          type: string
          format: date
          description: Journey date in ISO 8601 format (YYYY-MM-DD)
          example: "2026-02-10"
        journeyType:
          type: string
          enum: [outbound, return, roundtrip]
          description: |
            Type of journey:
            - outbound: Home → Work
            - return: Work → Home  
            - roundtrip: Home → Work → Home
          example: "outbound"
        filters:
          type: object
          description: Optional time filters
          properties:
            departureAfter:
              type: string
              format: time
              pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
              description: Minimum departure time (HH:mm)
              example: "07:30"
            arrivalBefore:
              type: string
              format: time
              pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
              description: Maximum arrival time (HH:mm)
              example: "09:00"
```

**Success Response (200 OK):**

```yaml
    SearchRoutesResponse:
      type: object
      properties:
        results:
          type: array
          description: List of matching routes sorted by departure time (ascending)
          items:
            type: object
            properties:
              routeId:
                type: integer
                format: int32
                description: Unique route identifier
                example: 158
              title:
                type: string
                description: Route name/title
                example: "L1 - Madrid Centro → Las Rozas Business Park"
              invitationCode:
                type: string
                description: Optional invitation code for private routes
                example: "MRZ2024"
              assignedStop:
                type: object
                description: Closest stop to user's origin/destination
                properties:
                  stopId:
                    type: integer
                    example: 3421
                  name:
                    type: string
                    example: "Parada Gran Vía - Metro Callao"
                  knownTitle:
                    type: string
                    example: "Gran Vía (frente a Metro Callao)"
                  distance:
                    type: number
                    format: double
                    description: Distance from user's location in meters
                    example: 245.5
                  latitude:
                    type: number
                    format: double
                    example: 40.420000
                  longitude:
                    type: number
                    format: double
                    example: -3.706000
              schedules:
                type: array
                description: Available departure times for this route
                items:
                  type: object
                  properties:
                    trackId:
                      type: integer
                      description: Specific expedition/track ID
                      example: 2891
                    departureTime:
                      type: string
                      format: time
                      description: Departure time from assigned stop
                      example: "07:45"
                    arrivalTime:
                      type: string
                      format: time
                      description: Estimated arrival time at destination
                      example: "08:35"
                    duration:
                      type: integer
                      description: Journey duration in minutes
                      example: 50
              hasMultipleSchedules:
                type: boolean
                description: True if route has more schedules not shown
                example: true
              additionalSchedulesCount:
                type: integer
                description: Number of additional schedules available
                example: 3
        metadata:
          type: object
          properties:
            totalResults:
              type: integer
              description: Total number of routes found
              example: 5
            searchRadius:
              type: number
              format: double
              description: Search radius used (in meters)
              example: 2000.0
            appliedFilters:
              type: object
              properties:
                departureAfter:
                  type: string
                  example: "07:30"
                arrivalBefore:
                  type: string
                  example: "09:00"
```

**Error Responses:**

**400 Bad Request** - Location out of search radius:
```json
{
  "error": {
    "code": "LOCATION_OUT_OF_RANGE",
    "message": "Tu ubicación no tiene paradas cercanas disponibles",
    "details": {
      "searchRadius": 2000.0,
      "closestStopDistance": 3500.5
    }
  }
}
```

**404 Not Found** - No routes match criteria:
```json
{
  "error": {
    "code": "NO_ROUTES_FOUND",
    "message": "No se encontraron rutas para los criterios especificados",
    "suggestions": [
      "Prueba ampliando tu rango de horario",
      "Intenta con otra fecha"
    ]
  }
}
```

**Example Request:**

```json
{
  "origin": {
    "latitude": 40.416775,
    "longitude": -3.703790,
    "address": "Calle Gran Vía 28, Madrid, España"
  },
  "destination": {
    "latitude": 40.453567,
    "longitude": -3.689021,
    "address": "Parque Empresarial Las Rozas, Madrid, España"
  },
  "siteId": 42,
  "date": "2026-02-10",
  "journeyType": "outbound",
  "filters": {
    "departureAfter": "07:30",
    "arrivalBefore": "09:00"
  }
}
```

**Example Response:**

```json
{
  "results": [
    {
      "routeId": 158,
      "title": "L1 - Madrid Centro → Las Rozas Business Park",
      "invitationCode": "MRZ2024",
      "assignedStop": {
        "stopId": 3421,
        "name": "Parada Gran Vía - Metro Callao",
        "knownTitle": "Gran Vía (frente a Metro Callao)",
        "distance": 245.5,
        "latitude": 40.420000,
        "longitude": -3.706000
      },
      "schedules": [
        {
          "trackId": 2891,
          "departureTime": "07:45",
          "arrivalTime": "08:35",
          "duration": 50
        }
      ],
      "hasMultipleSchedules": true,
      "additionalSchedulesCount": 3
    }
  ],
  "metadata": {
    "totalResults": 5,
    "searchRadius": 2000.0,
    "appliedFilters": {
      "departureAfter": "07:30",
      "arrivalBefore": "09:00"
    }
  }
}
```

---

## Endpoint 2: Get Route Schedules

### GET /api/v1/routes/{routeId}/schedules

**Service:** Routes Service  
**Description:** Retrieves detailed schedule information for a specific route, including all tracks/expeditions, stops, and timing details.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `routeId` | integer | Yes | Unique route identifier |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (date) | No | Filter schedules by specific date (YYYY-MM-DD) |
| `trackId` | integer | No | Filter by specific track/expedition |

**Success Response (200 OK):**

```yaml
RouteSchedulesResponse:
  type: object
  properties:
    routeId:
      type: integer
      example: 158
    title:
      type: string
      example: "L1 - Madrid Centro → Las Rozas Business Park"
    invitationCode:
      type: string
      example: "MRZ2024"
    status:
      type: integer
      description: Route status (1=active, 0=inactive)
      example: 1
    polyline:
      type: string
      description: Google Maps encoded polyline for route visualization
      example: "eqkeFx~qfMuAiAcCsCwBoBmCwBeD{C"
    validityPeriod:
      type: object
      properties:
        startDate:
          type: string
          format: date-time
          example: "2026-01-01T00:00:00Z"
        endDate:
          type: string
          format: date-time
          example: "2026-12-31T23:59:59Z"
    tracks:
      type: array
      description: All expeditions/variants for this route
      items:
        type: object
        properties:
          trackId:
            type: integer
            example: 2891
          departureTime:
            type: string
            format: time
            description: Base departure time
            example: "07:45"
          polyline:
            type: string
            description: Specific track polyline (may differ from main route)
            example: "eqkeFx~qfMuAiAcCsCwBoBmCwBeD{C"
          schedule:
            type: object
            description: Calendar availability
            properties:
              startDate:
                type: string
                format: date
                example: "2026-02-01"
              endDate:
                type: string
                format: date
                example: "2026-02-28"
              daysOfWeek:
                type: object
                description: Active days (1=active, 0=inactive)
                properties:
                  monday:
                    type: integer
                    example: 1
                  tuesday:
                    type: integer
                    example: 1
                  wednesday:
                    type: integer
                    example: 1
                  thursday:
                    type: integer
                    example: 1
                  friday:
                    type: integer
                    example: 1
                  saturday:
                    type: integer
                    example: 0
                  sunday:
                    type: integer
                    example: 0
          stops:
            type: array
            description: Ordered list of stops with timing
            items:
              type: object
              properties:
                stopId:
                  type: integer
                  example: 3421
                name:
                  type: string
                  example: "Parada Gran Vía - Metro Callao"
                knownTitle:
                  type: string
                  example: "Gran Vía (frente a Metro Callao)"
                latitude:
                  type: number
                  format: double
                  example: 40.420000
                longitude:
                  type: number
                  format: double
                  example: -3.706000
                stopType:
                  type: string
                  enum: [pickup, dropoff, both]
                  example: "pickup"
                arrivalTime:
                  type: string
                  format: time
                  description: Arrival time at this stop
                  example: "07:50"
                departureTime:
                  type: string
                  format: time
                  description: Departure time from this stop
                  example: "07:52"
                order:
                  type: integer
                  description: Stop sequence number
                  example: 2
```

**Error Response (404 Not Found):**

```json
{
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "La ruta solicitada no existe"
  }
}
```

**Example Request:**

```
GET /api/v1/routes/158/schedules?date=2026-02-10
```

**Example Response:**

```json
{
  "routeId": 158,
  "title": "L1 - Madrid Centro → Las Rozas Business Park",
  "invitationCode": "MRZ2024",
  "status": 1,
  "polyline": "eqkeFx~qfMuAiAcCsCwBoBmCwBeD{C",
  "validityPeriod": {
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z"
  },
  "tracks": [
    {
      "trackId": 2891,
      "departureTime": "07:45",
      "polyline": "eqkeFx~qfMuAiAcCsCwBoBmCwBeD{C",
      "schedule": {
        "startDate": "2026-02-01",
        "endDate": "2026-02-28",
        "daysOfWeek": {
          "monday": 1,
          "tuesday": 1,
          "wednesday": 1,
          "thursday": 1,
          "friday": 1,
          "saturday": 0,
          "sunday": 0
        }
      },
      "stops": [
        {
          "stopId": 3421,
          "name": "Parada Gran Vía - Metro Callao",
          "knownTitle": "Gran Vía (frente a Metro Callao)",
          "latitude": 40.420000,
          "longitude": -3.706000,
          "stopType": "pickup",
          "arrivalTime": "07:45",
          "departureTime": "07:47",
          "order": 1
        },
        {
          "stopId": 3422,
          "name": "Moncloa Interchange",
          "knownTitle": "Moncloa - Intercambiador",
          "latitude": 40.435000,
          "longitude": -3.717000,
          "stopType": "pickup",
          "arrivalTime": "07:55",
          "departureTime": "07:57",
          "order": 2
        },
        {
          "stopId": 3423,
          "name": "Las Rozas Business Park - North Entrance",
          "knownTitle": "Parque Empresarial - Entrada Norte",
          "latitude": 40.453567,
          "longitude": -3.689021,
          "stopType": "dropoff",
          "arrivalTime": "08:35",
          "departureTime": "08:35",
          "order": 3
        }
      ]
    }
  ]
}
```

---

## Endpoint 3: Get Site Configuration

### GET /api/v1/sites/{siteId}/config

**Service:** Sites Service  
**Description:** Retrieves configuration settings for a corporate site, including search radius, predefined destinations, and available routes.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siteId` | integer | Yes | Unique corporate site identifier |

**Success Response (200 OK):**

```yaml
SiteConfigResponse:
  type: object
  properties:
    siteId:
      type: integer
      example: 42
    name:
      type: string
      description: Corporate site name
      example: "ACME Corporation - Las Rozas Campus"
    slug:
      type: string
      description: URL-friendly site identifier
      example: "acme-las-rozas"
    status:
      type: string
      enum: [active, inactive]
      example: "active"
    configuration:
      type: object
      description: Site-specific settings
      properties:
        searchRadius:
          type: number
          format: double
          description: Maximum search radius in meters for stop assignment
          example: 2000.0
        ratioOrigin:
          type: integer
          description: Origin ratio configuration (business logic specific)
          example: 80
        template:
          type: string
          description: UI template/theme for this site
          example: "corporate_blue"
        allowedJourneyTypes:
          type: array
          description: Journey types enabled for this site
          items:
            type: string
            enum: [outbound, return, roundtrip]
          example: ["outbound", "return", "roundtrip"]
    destinations:
      type: array
      description: Predefined destination points for this site
      items:
        type: object
        properties:
          id:
            type: integer
            example: 891
          name:
            type: string
            example: "Edificio Principal - Entrada Norte"
          latitude:
            type: number
            format: double
            example: 40.453567
          longitude:
            type: number
            format: double
            example: -3.689021
          isSearchable:
            type: integer
            description: If 1, can be used in searches
            example: 1
    availableRoutes:
      type: array
      description: Routes subscribed to this site
      items:
        type: object
        properties:
          routeId:
            type: integer
            example: 158
          isActive:
            type: integer
            description: If 1, route is active for this site
            example: 1
          publishDate:
            type: string
            format: date
            description: Date when route was published for this site
            example: "2026-01-15"
          includesReturn:
            type: integer
            description: If 1, includes return journey
            example: 1
```

**Error Responses:**

**404 Not Found** - Site does not exist:
```json
{
  "error": {
    "code": "SITE_NOT_FOUND",
    "message": "El sitio corporativo no existe"
  }
}
```

**403 Forbidden** - Site is inactive:
```json
{
  "error": {
    "code": "SITE_INACTIVE",
    "message": "El sitio corporativo está inactivo"
  }
}
```

**Example Request:**

```
GET /api/v1/sites/42/config
```

**Example Response:**

```json
{
  "siteId": 42,
  "name": "ACME Corporation - Las Rozas Campus",
  "slug": "acme-las-rozas",
  "status": "active",
  "configuration": {
    "searchRadius": 2000.0,
    "ratioOrigin": 80,
    "template": "corporate_blue",
    "allowedJourneyTypes": ["outbound", "return", "roundtrip"]
  },
  "destinations": [
    {
      "id": 891,
      "name": "Edificio Principal - Entrada Norte",
      "latitude": 40.453567,
      "longitude": -3.689021,
      "isSearchable": 1
    },
    {
      "id": 892,
      "name": "Edificio B - Recepción",
      "latitude": 40.454000,
      "longitude": -3.690000,
      "isSearchable": 1
    }
  ],
  "availableRoutes": [
    {
      "routeId": 158,
      "isActive": 1,
      "publishDate": "2026-01-15",
      "includesReturn": 1
    },
    {
      "routeId": 159,
      "isActive": 1,
      "publishDate": "2026-01-20",
      "includesReturn": 0
    }
  ]
}
```

---

## Endpoint 4: Create Booking

### POST /api/v1/bookings

**Service:** Booking Service  
**Description:** Creates a new reservation for a passenger. Handles availability checking with Routes Service directly.

**Request Body:**

```yaml
openapi: 3.0.3
components:
  schemas:
    CreateBookingRequest:
      type: object
      required:
        - routeId
        - siteId
        - items
      properties:
        routeId:
          type: integer
          description: Route identifier to book
          example: 158
        siteId:
          type: integer
          description: User's corporate site context
          example: 42
        items:
          type: array
          description: List of specific trips to book
          minItems: 1
          items:
            type: object
            required:
              - trackId
              - stopId
              - date
            properties:
              trackId:
                type: integer
                example: 2891
              stopId:
                type: integer
                example: 3421
              date:
                type: string
                format: date
                example: "2026-02-10"
              type:
                type: string
                enum: [outbound, return]
                example: "outbound"
```

**Success Response (201 Created):**

```yaml
BookingResponse:
  type: object
  properties:
    bookingId:
      type: string
      format: uuid
      example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    status:
      type: string
      enum: [confirmed, pending]
      example: "confirmed"
    createdAt:
      type: string
      format: date-time
      example: "2026-02-04T10:00:00Z"
    items:
      type: array
      items:
        type: object
        properties:
          itemId:
            type: string
            format: uuid
            example: "b1f2bc88-1d0a-4ef8-cc7d-7cc0cd491b22"
          date:
            type: string
            format: date
            example: "2026-02-10"
          status:
            type: string
            example: "confirmed"
```

**Error Responses:**

**422 Unprocessable Entity** - No availability:
```json
{
  "error": {
    "code": "NO_AVAILABILITY",
    "message": "No hay plazas disponibles para la expedición seleccionada",
    "details": {
      "trackId": 2891,
      "date": "2026-02-10"
    }
  }
}
```

---

## Endpoint 5: List User Bookings

### GET /api/v1/bookings

**Service:** Booking Service  
**Description:** API to retrieve the list of active and past bookings for the authenticated user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (confirmed, cancelled, pending) |
| `from` | date | No | Filter by start date |
| `to` | date | No | Filter by end date |

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "bookingId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "routeTitle": "L1 - Madrid Centro → Las Rozas",
      "status": "confirmed",
      "totalItems": 2,
      "items": [
        {
          "date": "2026-02-10",
          "type": "outbound",
          "time": "07:45"
        },
        {
          "date": "2026-02-10",
          "type": "return",
          "time": "17:30"
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "perPage": 20
  }
}
```

---

## Endpoint 6: Get User Profile

### GET /api/v1/users/me

**Service:** Sites Service  
**Description:** Retrieves the authenticated user's profile and site context.

**Success Response (200 OK):**

```json
{
  "id": 101,
  "email": "user@acme.com",
  "name": "Juan Perez",
  "site": {
    "id": 42,
    "name": "ACME Corporation",
    "slug": "acme-las-rozas"
  },
  "status": "active"
}
```
