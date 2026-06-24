-- V6__create_reviews.sql
-- Creates the Review table per data-model.md.
--
-- A Review is written by a Guest about a Property, tied to a single Booking.
-- Business rules:
--   - One review per booking (enforced by UNIQUE on booking_id).
--   - rating must be between 1 and 5 inclusive.
--   - Reviews are only created after a booking reaches "completed" status,
--     but that transition is enforced in the application layer, not here.
--
-- FK targets:
--   booking(id)   from V5__create_bookings.sql
--   property(id)  from V3__create_properties.sql
--   guest(id)     from V2__create_users.sql

CREATE TABLE review (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id  UUID        NOT NULL,
    property_id UUID        NOT NULL,
    guest_id    UUID        NOT NULL,
    rating      INTEGER     NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_review_booking_id
        UNIQUE (booking_id),

    CONSTRAINT chk_review_rating_range
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_review_booking
        FOREIGN KEY (booking_id)  REFERENCES booking(id)  ON DELETE CASCADE,
    CONSTRAINT fk_review_property
        FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_guest
        FOREIGN KEY (guest_id)    REFERENCES guest(id)    ON DELETE RESTRICT
);

-- Property detail page lists reviews for a given property.
CREATE INDEX idx_review_property_id
    ON review (property_id);

-- Most recent reviews first (used on property detail page and aggregations).
CREATE INDEX idx_review_created_at
    ON review (created_at DESC);
