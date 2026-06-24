-- V5: Create Booking table.
--
-- Source of truth: specs/001-guest-search-booking/data-model.md (Booking entity).
-- Depends on:
--   * V1__create_extensions.sql — uuid_generate_v4()
--   * V2__create_users.sql      — guest(id) FK target
--   * V3__create_properties.sql — property(id) FK target
--
-- Pricing columns (nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur,
-- total_eur) are SNAPSHOTS captured at booking creation time so the booking
-- record reflects the exact pricing the guest agreed to, even if the host later
-- changes the property's rates.
--
-- service_fee is 12% of subtotal; tax is 0% in v1 (configurable later) — see
-- the "Pricing Calculation" section of data-model.md.
--
-- reference_number format: BK-{YYYYMMDD}-{random6} (e.g. BK-20250517-A3F2K9).
-- Generation lives in the application layer; this migration only enforces
-- uniqueness and presence.

CREATE TABLE booking (
    id                        UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id               UUID           NOT NULL REFERENCES property(id),
    guest_id                  UUID           NOT NULL REFERENCES guest(id),
    reference_number          VARCHAR(32)    NOT NULL UNIQUE,
    check_in                  DATE           NOT NULL,
    check_out                 DATE           NOT NULL,
    guest_count               INTEGER        NOT NULL CHECK (guest_count > 0),
    nights                    INTEGER        NOT NULL CHECK (nights > 0),
    nightly_rate_eur          DECIMAL(10, 2) NOT NULL,
    cleaning_fee_eur          DECIMAL(10, 2) NOT NULL,
    service_fee_eur           DECIMAL(10, 2) NOT NULL,
    tax_eur                   DECIMAL(10, 2) NOT NULL,
    total_eur                 DECIMAL(10, 2) NOT NULL,
    status                    VARCHAR(20)    NOT NULL
        CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    stripe_payment_intent_id  VARCHAR(255)   NOT NULL,
    cancellation_reason       TEXT,
    cancelled_at              TIMESTAMP,
    created_at                TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_dates CHECK (check_out > check_in)
);

-- "My Trips" lookup: list a guest's bookings.
CREATE INDEX idx_booking_guest_id
    ON booking (guest_id);

-- Property + date-range lookup: used when checking conflicts and showing a
-- property's booked windows.
CREATE INDEX idx_booking_property_dates
    ON booking (property_id, check_in, check_out);

-- Filter by booking lifecycle state (e.g. list active vs. cancelled).
CREATE INDEX idx_booking_status
    ON booking (status);
