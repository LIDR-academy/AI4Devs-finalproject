-- V8: Allow 'pending' status in the booking table.
-- The original V5 CHECK constraint excluded 'pending', but the domain
-- aggregate starts bookings in PENDING state before payment is confirmed.
ALTER TABLE booking
    DROP CONSTRAINT IF EXISTS booking_status_check;

ALTER TABLE booking
    ADD CONSTRAINT booking_status_check
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
