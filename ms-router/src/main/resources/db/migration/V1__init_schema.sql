-- =============================================================
-- ms-router  |  V1__init_schema.sql
-- Geographic source of truth: Stops, Routes, Snapshots,
-- Geometries and the Outbox for reliable event publishing.
--
-- DB:      ms-router
-- Engine:  InnoDB  |  Charset: utf8mb4_unicode_ci
-- Compat:  MySQL 8.0+
-- =============================================================

-- Use backtick-quoted name because the DB name contains a hyphen.
USE `ms-router`;

-- =============================================================
-- stops
-- A stop is a unique physical location reusable across routes.
-- =============================================================
CREATE TABLE IF NOT EXISTS stops (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    name            VARCHAR(255)    NOT NULL,
    address         VARCHAR(500)    NULL,
    lat             DECIMAL(10,7)   NOT NULL,
    lon             DECIMAL(11,7)   NOT NULL,
    -- Native POINT column with SRID 4326 (WGS-84) for spatial queries
    -- (nearest-stop, bounding-box) via ST_Distance_Sphere / ST_Within.
    location        POINT           NOT NULL SRID 4326,
    timezone        VARCHAR(64)     NOT NULL DEFAULT 'UTC',
    is_accessible   TINYINT(1)      NOT NULL DEFAULT 0,
    approval_status ENUM('pending','approved','rejected')
                                    NOT NULL DEFAULT 'pending',
    metadata        JSON            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME        NULL,

    PRIMARY KEY (id),
    SPATIAL INDEX idx_stops_location       (location),
    INDEX         idx_stops_approval       (approval_status),
    INDEX         idx_stops_deleted_at     (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- routes
-- Logical persistent object that groups a route's history and
-- ownership.  current_snapshot_id is added via ALTER TABLE after
-- route_snapshots is created (circular FK workaround).
-- =============================================================
CREATE TABLE IF NOT EXISTS routes (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    name                VARCHAR(255) NOT NULL,
    status              ENUM('draft','approved','archived')
                                     NOT NULL DEFAULT 'draft',
    -- Nullable FK to route_snapshots; set after the first snapshot
    -- is published.  Constraint added below.
    current_snapshot_id CHAR(36)     NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_routes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- route_snapshots  (immutable)
-- Immutable after INSERT.  Represents the route at a specific
-- point in time with pre-cached performance metrics.
-- Consumed by ms-planifications via route_snapshot_ref_id.
-- =============================================================
CREATE TABLE IF NOT EXISTS route_snapshots (
    id                   CHAR(36)          NOT NULL DEFAULT (UUID()),
    route_id             CHAR(36)          NOT NULL,
    version_number       SMALLINT UNSIGNED NOT NULL,
    total_distance_m     INT UNSIGNED      NULL COMMENT 'Cached distance in metres',
    estimated_duration_s INT UNSIGNED      NULL COMMENT 'Cached travel time in seconds',
    valid_from           DATE              NULL,
    valid_until          DATE              NULL,
    published_at         DATETIME          NULL,
    created_at           DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_route_snapshot     (route_id, version_number),
    INDEX      idx_rsnap_published_at (published_at),
    CONSTRAINT fk_rsnap_route FOREIGN KEY (route_id)
        REFERENCES routes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- Back-fill the circular FK on routes.current_snapshot_id now
-- that route_snapshots exists.
-- =============================================================
ALTER TABLE routes
    ADD CONSTRAINT fk_routes_current_snapshot
    FOREIGN KEY (current_snapshot_id)
    REFERENCES route_snapshots (id)
    ON DELETE SET NULL;


-- =============================================================
-- route_stops
-- Represents the role and configuration of a stop within a
-- specific route snapshot.
-- =============================================================
CREATE TABLE IF NOT EXISTS route_stops (
    id                 CHAR(36)          NOT NULL DEFAULT (UUID()),
    route_snapshot_id  CHAR(36)          NOT NULL,
    stop_id            CHAR(36)          NOT NULL,
    sequence_order     SMALLINT UNSIGNED NOT NULL,
    dwell_time_s       SMALLINT UNSIGNED NOT NULL DEFAULT 0
                           COMMENT 'Planned dwell time in seconds',
    alias              VARCHAR(255)      NULL     COMMENT 'Display name override',
    pickup_allowed     TINYINT(1)        NOT NULL DEFAULT 1,
    dropoff_allowed    TINYINT(1)        NOT NULL DEFAULT 1,
    active             TINYINT(1)        NOT NULL DEFAULT 1,

    PRIMARY KEY (id),
    UNIQUE KEY uq_rs_snapshot_order (route_snapshot_id, sequence_order),
    INDEX idx_rs_stop (stop_id),
    CONSTRAINT fk_rs_snapshot FOREIGN KEY (route_snapshot_id)
        REFERENCES route_snapshots (id),
    CONSTRAINT fk_rs_stop FOREIGN KEY (stop_id)
        REFERENCES stops (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- route_geometries
-- Stores multiple geometric representations of a route snapshot
-- in different formats for various consumers (UI, providers…).
-- =============================================================
CREATE TABLE IF NOT EXISTS route_geometries (
    id                CHAR(36)     NOT NULL DEFAULT (UUID()),
    route_snapshot_id CHAR(36)     NOT NULL,
    geometry_type     ENUM('full','simplified','segment','provider')
                                   NOT NULL DEFAULT 'full',
    format            ENUM('geojson','polyline','wkt')
                                   NOT NULL DEFAULT 'geojson',
    provider          VARCHAR(100) NULL COMMENT 'Map-provider identifier when type=provider',
    -- segment_index is non-null only when geometry_type = 'segment'
    segment_index     SMALLINT UNSIGNED NULL,
    accuracy_m        DECIMAL(8,2) NULL COMMENT 'Positional accuracy in metres',
    content           LONGTEXT     NOT NULL,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_rg_snapshot_type (route_snapshot_id, geometry_type),
    CONSTRAINT fk_rg_snapshot FOREIGN KEY (route_snapshot_id)
        REFERENCES route_snapshots (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- outbox_events
-- Transactional outbox for reliable, at-least-once event
-- publishing.  Events: RoutePublished, StopCreated,
-- RouteEstimateUpdated.
-- =============================================================
CREATE TABLE IF NOT EXISTS outbox_events (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    event_type     VARCHAR(100) NOT NULL COMMENT 'e.g. RoutePublished',
    aggregate_type VARCHAR(100) NOT NULL COMMENT 'e.g. Route',
    aggregate_id   VARCHAR(36)  NOT NULL,
    payload        JSON         NOT NULL,
    published      TINYINT(1)   NOT NULL DEFAULT 0,
    published_at   DATETIME     NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_outbox_poll (published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
