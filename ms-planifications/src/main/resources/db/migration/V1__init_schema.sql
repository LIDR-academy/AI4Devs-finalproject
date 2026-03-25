-- =============================================================
-- ms-planifications  |  V1__init_schema.sql
-- Operational templates (Expeditions), planning windows
-- (Planifications), concrete service instances (Services),
-- resource assignments, async jobs, audit log and Outbox.
--
-- DB:      ms-planifications
-- Engine:  InnoDB  |  Charset: utf8mb4_unicode_ci
-- Compat:  MySQL 8.0+
--
-- Cross-service references (route_snapshot_ref_id, stop_logical_id,
-- vehicle_logical_id, driver_logical_id) are stored as VARCHAR(36)
-- with NO database-level foreign keys.  Referential integrity is
-- enforced at the application layer.
-- =============================================================

USE `ms-planifications`;

-- =============================================================
-- expeditions
-- Operational template derived from an approved route snapshot.
-- Defines the recurring schedule blueprint before materialisation.
-- =============================================================
CREATE TABLE IF NOT EXISTS expeditions (
    id                    CHAR(36)        NOT NULL DEFAULT (UUID()),
    name                  VARCHAR(255)    NOT NULL,
    -- Logical reference to route_snapshots.id in ms-router.
    route_snapshot_ref_id VARCHAR(36)     NOT NULL,
    -- Bitmask: bit 0 = Monday … bit 6 = Sunday (max 127 = every day).
    days_of_week          TINYINT UNSIGNED NOT NULL DEFAULT 127,
    base_time             TIME            NOT NULL COMMENT 'Base departure time for all stops',
    status                ENUM('draft','active','archived')
                                          NOT NULL DEFAULT 'draft',
    metadata              JSON            NULL,
    created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                   ON UPDATE CURRENT_TIMESTAMP,
    deleted_at            DATETIME        NULL,

    PRIMARY KEY (id),
    INDEX idx_exp_status               (status),
    INDEX idx_exp_route_snapshot_ref   (route_snapshot_ref_id),
    INDEX idx_exp_deleted_at           (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- expedition_stops
-- Active stops within an expedition, with per-stop timing offsets
-- and pickup/dropoff rules.
-- =============================================================
CREATE TABLE IF NOT EXISTS expedition_stops (
    id               CHAR(36)          NOT NULL DEFAULT (UUID()),
    expedition_id    CHAR(36)          NOT NULL,
    -- Logical reference to stops.id in ms-router.
    stop_logical_id  VARCHAR(36)       NOT NULL,
    sequence_order   SMALLINT UNSIGNED NOT NULL,
    -- Seconds relative to base_time (can be 0 for the first stop).
    offset_seconds   INT               NOT NULL DEFAULT 0,
    active           TINYINT(1)        NOT NULL DEFAULT 1,
    pickup_allowed   TINYINT(1)        NOT NULL DEFAULT 1,
    dropoff_allowed  TINYINT(1)        NOT NULL DEFAULT 1,

    PRIMARY KEY (id),
    UNIQUE KEY uq_es_expedition_order (expedition_id, sequence_order),
    INDEX idx_es_stop_logical (stop_logical_id),
    CONSTRAINT fk_es_expedition FOREIGN KEY (expedition_id)
        REFERENCES expeditions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- capacity_rules
-- Capacity policies attached to an expedition.
-- =============================================================
CREATE TABLE IF NOT EXISTS capacity_rules (
    id                   CHAR(36)          NOT NULL DEFAULT (UUID()),
    expedition_id        CHAR(36)          NOT NULL,
    max_seats            SMALLINT UNSIGNED NOT NULL,
    -- Optional JSON for per-segment seat overrides.
    segment_rules        JSON              NULL,
    -- Optional JSON for client-type restrictions.
    client_restrictions  JSON              NULL,
    active               TINYINT(1)        NOT NULL DEFAULT 1,
    created_at           DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_cr_expedition (expedition_id),
    CONSTRAINT fk_cr_expedition FOREIGN KEY (expedition_id)
        REFERENCES expeditions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- allocation_rules
-- Rules that drive resource-assignment decisions for an expedition.
-- =============================================================
CREATE TABLE IF NOT EXISTS allocation_rules (
    id            CHAR(36)         NOT NULL DEFAULT (UUID()),
    expedition_id CHAR(36)         NOT NULL,
    -- e.g. 'nearest_vehicle', 'fixed_vehicle', 'operator_pool'
    rule_type     VARCHAR(100)     NOT NULL,
    parameters    JSON             NOT NULL,
    priority      TINYINT UNSIGNED NOT NULL DEFAULT 10,
    active        TINYINT(1)       NOT NULL DEFAULT 1,
    created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ar_expedition_priority (expedition_id, priority),
    CONSTRAINT fk_ar_expedition FOREIGN KEY (expedition_id)
        REFERENCES expeditions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- planifications
-- Intent to materialise an expedition into concrete services
-- for a specific calendar window.
-- =============================================================
CREATE TABLE IF NOT EXISTS planifications (
    id               CHAR(36)    NOT NULL DEFAULT (UUID()),
    expedition_id    CHAR(36)    NOT NULL,
    date_from        DATE        NOT NULL,
    date_until       DATE        NOT NULL,
    -- JSON array of DATE strings to skip (e.g. bank holidays).
    exceptions       JSON        NULL,
    -- JSON array of DATE strings treated as non-working days.
    non_working_days JSON        NULL,
    status           ENUM('draft','active','cancelled')
                                 NOT NULL DEFAULT 'draft',
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pl_expedition           (expedition_id),
    INDEX idx_pl_status_date          (status, date_from),
    CONSTRAINT fk_pl_expedition FOREIGN KEY (expedition_id)
        REFERENCES expeditions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- plan_generation_jobs
-- Async job that materialises a planification into service rows.
-- =============================================================
CREATE TABLE IF NOT EXISTS plan_generation_jobs (
    id               CHAR(36)         NOT NULL DEFAULT (UUID()),
    planification_id CHAR(36)         NOT NULL,
    status           ENUM('pending','running','completed','failed')
                                      NOT NULL DEFAULT 'pending',
    retries          TINYINT UNSIGNED NOT NULL DEFAULT 0,
    error_message    TEXT             NULL,
    results          JSON             NULL,
    started_at       DATETIME         NULL,
    completed_at     DATETIME         NULL,
    created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pgj_planification   (planification_id),
    INDEX idx_pgj_status_created  (status, created_at),
    CONSTRAINT fk_pgj_planification FOREIGN KEY (planification_id)
        REFERENCES planifications (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- services
-- Concrete, executable service instance generated from a
-- planification.  Represents a specific run on a specific date.
-- =============================================================
CREATE TABLE IF NOT EXISTS services (
    id                    CHAR(36)          NOT NULL DEFAULT (UUID()),
    planification_id      CHAR(36)          NOT NULL,
    -- Logical reference to route_snapshots.id in ms-router.
    route_snapshot_ref_id VARCHAR(36)       NOT NULL,
    service_date          DATE              NOT NULL,
    departure_time        TIME              NOT NULL,
    capacity              SMALLINT UNSIGNED NOT NULL,
    status                ENUM('scheduled','confirmed','running',
                               'completed','cancelled')
                                            NOT NULL DEFAULT 'scheduled',
    created_at            DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                     ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_sv_planification          (planification_id),
    INDEX idx_sv_date_status            (service_date, status),
    INDEX idx_sv_route_snapshot_ref     (route_snapshot_ref_id),
    CONSTRAINT fk_sv_planification FOREIGN KEY (planification_id)
        REFERENCES planifications (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- service_stops
-- Fixed stop set for a concrete service instance.
-- =============================================================
CREATE TABLE IF NOT EXISTS service_stops (
    id              CHAR(36)          NOT NULL DEFAULT (UUID()),
    service_id      CHAR(36)          NOT NULL,
    -- Logical reference to stops.id in ms-router.
    stop_logical_id VARCHAR(36)       NOT NULL,
    sequence_order  SMALLINT UNSIGNED NOT NULL,
    scheduled_time  TIME              NOT NULL,
    pickup_allowed  TINYINT(1)        NOT NULL DEFAULT 1,
    dropoff_allowed TINYINT(1)        NOT NULL DEFAULT 1,
    active          TINYINT(1)        NOT NULL DEFAULT 1,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ss_service_order (service_id, sequence_order),
    INDEX idx_ss_stop_logical (stop_logical_id),
    CONSTRAINT fk_ss_service FOREIGN KEY (service_id)
        REFERENCES services (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- service_assignments
-- Records the operational resource (vehicle + driver) assigned
-- to a concrete service.  One active assignment per service.
-- =============================================================
CREATE TABLE IF NOT EXISTS service_assignments (
    id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
    service_id         CHAR(36)    NOT NULL,
    -- Logical references to fleet / driver services (no FK).
    vehicle_logical_id VARCHAR(36) NULL,
    driver_logical_id  VARCHAR(36) NULL,
    assignment_status  ENUM('pending','assigned','rejected','cancelled')
                                   NOT NULL DEFAULT 'pending',
    -- e.g. 'local_heuristic', 'brainer_service'
    provider           VARCHAR(100) NULL,
    decision_reason    TEXT         NULL,
    assigned_at        DATETIME     NULL,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_sa_service           (service_id),
    INDEX idx_sa_status            (assignment_status),
    INDEX idx_sa_vehicle_logical   (vehicle_logical_id),
    INDEX idx_sa_driver_logical    (driver_logical_id),
    CONSTRAINT fk_sa_service FOREIGN KEY (service_id)
        REFERENCES services (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- planification_history
-- Append-only audit log for all state changes across the
-- planning domain.  The application user should NOT have
-- UPDATE or DELETE privileges on this table (enforced via a
-- follow-on V2 migration REVOKE statement).
-- =============================================================
CREATE TABLE IF NOT EXISTS planification_history (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    -- 'Expedition' | 'Planification' | 'Service' | 'ServiceAssignment'
    entity_type    VARCHAR(100) NOT NULL,
    entity_id      VARCHAR(36)  NOT NULL,
    -- 'created' | 'published' | 'updated' | 'cancelled' | …
    action         VARCHAR(100) NOT NULL,
    -- Logical reference to the acting user or system.
    actor_id       VARCHAR(36)  NULL,
    previous_state JSON         NULL,
    new_state      JSON         NULL,
    reason         TEXT         NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ph_entity     (entity_type, entity_id),
    INDEX idx_ph_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- outbox_events
-- Transactional outbox for reliable, at-least-once event
-- publishing.  Events: ServiceCreated, ServiceUpdated,
-- ServiceCancelled, ServiceAssigned.
-- =============================================================
CREATE TABLE IF NOT EXISTS outbox_events (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    event_type     VARCHAR(100) NOT NULL COMMENT 'e.g. ServiceCreated',
    aggregate_type VARCHAR(100) NOT NULL COMMENT 'e.g. Service',
    aggregate_id   VARCHAR(36)  NOT NULL,
    payload        JSON         NOT NULL,
    published      TINYINT(1)   NOT NULL DEFAULT 0,
    published_at   DATETIME     NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_outbox_poll (published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
