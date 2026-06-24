-- V4: Availability and AvailabilityHold tables.
--
-- Availability tracks per-property, per-date status. Sparse storage: if no row
-- exists for a (property_id, date) the property is considered available.
--
-- AvailabilityHold is a temporary lock that prevents double-booking during the
-- payment window. Holds expire automatically (held_until = NOW() + INTERVAL
-- '10 minutes') and are cleaned up by a scheduled job.
--
-- Foreign keys reference property(id) (V3) and guest(id) (V2).

CREATE TABLE availability (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id   UUID        NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    date          DATE        NOT NULL,
    is_available  BOOLEAN     NOT NULL DEFAULT TRUE,
    status        VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'booked', 'blocked'))
);

-- One row per (property, date). Doubles as the lookup index for date queries.
CREATE UNIQUE INDEX idx_availability_property_date
    ON availability (property_id, date);

-- Partial index for the common "find available dates" query path.
CREATE INDEX idx_availability_available
    ON availability (property_id, date)
    WHERE is_available = TRUE;


CREATE TABLE availability_hold (
    id           UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id  UUID      NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    guest_id     UUID      NOT NULL REFERENCES guest(id) ON DELETE CASCADE,
    check_in     DATE      NOT NULL,
    check_out    DATE      NOT NULL,
    held_until   TIMESTAMP NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_hold_dates CHECK (check_out > check_in)
);

-- Composite index for "is this property held for these dates?" lookups.
CREATE INDEX idx_hold_property_dates
    ON availability_hold (property_id, check_in, check_out);

-- Index used by the scheduled cleanup job (expired holds: held_until < NOW()).
CREATE INDEX idx_hold_expiry
    ON availability_hold (held_until);
