# 3. Data Model

## 3.1. Overview
The Data Model is designed according to the **Database-per-Service** pattern. The monolithic schema has been decomposed into four isolated schemas corresponding to the architectural Bounded Contexts.

- **Data Ownership**: Each service owns its specific tables.
- **Relationships**: Cross-service relationships are handled via **Logical IDs** (Stored as Integer/UUID) and not Database Foreign Keys.
- **Integrity**: Referential integrity across services is maintained eventually via Domain Events (e.g., `RouteDeleted` event cleans up references in `Sites Service`).

---

## 3.2. Service-by-Service Data Model

### 3.2.1. Routes Service (Core Domain)
Responsible for the distinct definition of the transport network (Lines, Stops, Schedules).

```mermaid
erDiagram
    routes ||--o{ route_stops : "has"
    routes ||--|{ route_schedules : "has"
    routes }o--o| provinces : "located_in"
    routes ||--o{ tracks : "defined_by"
    tracks ||--|{ track_stops : "composed_of"
    route_stops ||--|{ track_stops : "mapped_to"
    route_stops }o--o| stop_types : "classified_as"
    routes ||--o| commuting_routes_data : "details"
    
    routes {
        int id PK
        string title
        string invitation_code
        int province_id FK
        int primary_site_id "Logical Ref (Sites Svc)"
        int status
        string polyline_raw
        datetime start_timestamp
        datetime end_timestamp
    }

    route_stops {
        int id PK
        int route_id FK
        int stop_type_id FK
        float lat
        float lng
        string title
        string known_title
        int type_stop
        datetime start_timestamp
        datetime end_timestamp
    }

    route_schedules {
        int id PK
        int route_id FK
        int track_id FK
        date start_date
        date end_date
        int monday "Bitmask/Bool"
        int tuesday
        int wednesday
    }

    tracks {
        int id PK
        int route_id FK
        string time
        string polyline_raw
    }

    track_stops {
        int id PK
        int track_id FK
        int route_stop_id FK
        int seconds_until_arrival
        int seconds_until_departure
    }
    
    stop_types {
        int id PK
        string name "Implied"
    }

    provinces {
        int id PK
        string timezone
    }

    commuting_routes_data {
        int id PK
        int route_id FK
        int on_demand
        int shuttle
        date date_init
        date date_finish
    }
```

#### Entities Description - Routes Service
| Entity | Description | PK | Constraints |
| :--- | :--- | :--- | :--- |
| **routes** | Core entity representing a transport line. | `id` | `province_id` not null. `primary_site_id` is a logical reference to Sites DB. |
| **route_stops** | Physical stops (Lat/Lng) associated with a route. | `id` | `route_id` FK. |
| **route_schedules** | Calendar availability for a route. | `id` | `route_id` FK. |
| **tracks** | Specific path or expedition variants within a route. | `id` | `route_id` FK. |
| **track_stops** | Timing details (arrival/departure) for stops on a specific track. | `id` | `track_id` FK, `route_stop_id` FK. |

---

### 3.2.2. Sites Service (Core Domain)
Responsible for Corporate Clients, Site configurations, and Service subscriptions.

```mermaid
erDiagram
    commuting_sites ||--o{ commuting_sites_config_values : "configures"
    config_options ||--o{ commuting_sites_config_values : "defines"
    commuting_sites ||--o{ commuting_sites_destinations : "has_destinations"
    commuting_sites ||--o{ commuting_companies : "contracts"
    commuting_companies ||--o{ commuting_companies_shift : "has_shifts"
    commuting_sites ||--o{ commuting_sites_routes : "subscribes_to"
    commuting_sites ||--o{ users : "employs"

    users {
        int id PK
        int site_id FK
        string email
        string name
        string phone
        string status
    }
    
    commuting_sites {
        int id PK
        string name
        string slug
        int promoter_id "Logical Ref (Identity/Users)"
        int ratio_origin
        string template
        datetime deleted_at
    }

    commuting_sites_routes {
        int id PK
        int site_id FK
        int route_id "Logical Ref (Routes Svc)"
        int active
        date publish
        int return
    }

    commuting_sites_config_values {
        int id PK
        int site_id FK
        int key_id FK
        string value
    }

    commuting_companies {
        int id PK
        int site_id FK
        string name
    }

    commuting_companies_shift {
        int id PK
        int company_id FK
        string name
    }
    
    commuting_sites_destinations {
        int id PK
        int commuting_site_id FK
        string name
        float latitude
        float longitude
        int search
    }
    
    config_options {
        int id PK
        string key
        string default_value
    }
    
    routes_shifts {
        int route_id "Logical Ref (Routes Svc)"
        int commuting_company_shift_id FK
    }
```

#### Entities Description - Sites Service
| Entity | Description | PK | Constraints |
| :--- | :--- | :--- | :--- |
| **commuting_sites** | Represents a Client Site (Office/Factory). | `id` | `slug` Unique. `promoter_id` Log Ref. |
| **commuting_sites_routes** | **Join Table managed by Sites**. Defines which Routes are active/published for a specific Site. | `id` | `site_id` FK. `route_id` is a Logical Reference to Routes DB. |
| **commuting_companies** | Legal entities or sub-divisions operating within a Site. | `id` | `site_id` FK. |
| **routes_shifts** | Association of Shift times to Routes. Managed here as Shifts belong to Companies. | Composite | `commuting_company_shift_id` FK. `route_id` Logical Ref. |
| **users** | **Passengers/Employees**. The end-users who make bookings. | `id` | `site_id` FK. `email` Unique. |

> **Note:** `sites` table from legacy schema appears redundant with `commuting_sites` or `commuting_companies`. Mapped `commuting_sites` as the primary aggregate root.

---

### 3.2.3. Booking Service (Core Domain)
Responsible for the lifecycle of passenger reservations.

```mermaid
erDiagram
    bookings ||--|{ booking_items : "contains"
    bookings ||--o{ booking_status_history : "tracks"
    
    bookings {
        uuid id PK
        int user_id "Logical Ref (Sites Svc)"
        int route_id "Logical Ref (Routes Svc)"
        string status "confirmed, cancelled, pending"
        datetime created_at
        datetime updated_at
    }

    booking_items {
        uuid id PK
        uuid booking_id FK
        int track_id "Logical Ref (Routes Svc)"
        int stop_id "Logical Ref (Routes Svc)"
        date journey_date
        string type "outbound/return"
        decimal price
    }

    booking_status_history {
        uuid id PK
        uuid booking_id FK
        string status
        datetime changed_at
        string reason
    }
```

#### Entities Description - Booking Service
| Entity | Description | PK | Constraints |
| :--- | :--- | :--- | :--- |
| **bookings** | Represents a user's reservation for a route. | `id` (UUID) | `user_id` Logical Ref. `route_id` Logical Ref. |
| **booking_items** | Individual trips within a booking (e.g., specific day/expedition). | `id` (UUID) | `booking_id` FK. |
| **booking_status_history** | Audit trail for booking status changes. | `id` (UUID) | `booking_id` FK. |

---

### 3.2.4. Rates Service (Support Domain)
Responsible for Pricing Logic and Fares.

```mermaid
erDiagram
    rates_sites ||--o{ rates_routes : "defines_prices"
    
    rates_sites {
        int id PK
        int sites_id "Logical Ref (Sites Svc)"
        int rates_id "Legacy Ref?"
        int status
    }

    rates_routes {
        int id PK
        int rates_sites_id FK
        int routes_id "Logical Ref (Routes Svc)"
        decimal price
    }
    
    routes_rates {
        int id PK
        int route_id "Logical Ref (Routes Svc)"
        int type_rate_id
        decimal amount "Assumed"
        date date_init_valid
        date date_finish_valid
    }
```

#### Entities Description - Rates Service
| Entity | Description | PK | Constraints |
| :--- | :--- | :--- | :--- |
| **rates_routes** | Defines the specific price for a Route within a Site's context. | `id` | `rates_sites_id` FK. `routes_id` Logical Ref. |
| **routes_rates** | General rate configuration for a route (base price). | `id` | `route_id` Logical Ref. |

---

### 3.2.5. Search Service (Generic Subdomain)
This service maintains a **Read-Model**. It does not own the "System of Record" tables but maintains optimized views populated via events (`RouteCreated`, `StopMoved`).

```mermaid
erDiagram
    spatial_stops_index {
        int id PK
        int original_stop_id "Ref Routes"
        int original_route_id "Ref Routes"
        geography location "PostGIS Point"
        json schedule_metadata "Denormalized"
    }
    
    search_logs {
        int id PK
        geography search_origin
        geography search_destination
        datetime created_at
    }
```

#### Entities Description - Search Service
| Entity | Description | PK | Constraints |
| :--- | :--- | :--- | :--- |
| **spatial_stops_index** | Denormalized table optimized for `ST_DWithin` queries. Populated by events from Routes Service. | `id` | `location` Spatial Index. |

---

## 3.3. Cross-Service Data Relationships

| Source Entity | Field | Target Service | Relationship Type | Handling |
| :--- | :--- | :--- | :--- | :--- |
| `routes` | `primary_site_id` | **Sites** | Many-to-One | Logical ID. Frontend fetches Site Name via API Gateway composite or separate call. |
| `commuting_sites_routes` | `route_id` | **Routes** | Many-to-Many | Logical ID. Subscriptions. Integrity checked via "RouteDeleted" event. |
| `route_stops` | `external_stop_id` | **External** | Ref | ID Reference to external provider (if applicable). |
| `rates_routes` | `routes_id` | **Routes** | Many-to-One | Logical ID. |
