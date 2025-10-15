-- Set search path to bookings schema
SET search_path TO bookings, public;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    passenger_id VARCHAR(255) NOT NULL,
    seats_requested INTEGER NOT NULL CHECK (seats_requested > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Add comments
COMMENT ON TABLE bookings IS 'Bookings made by passengers for trips';
COMMENT ON COLUMN bookings.trip_id IS 'ID of the trip being booked';
COMMENT ON COLUMN bookings.passenger_id IS 'ID of the passenger making the booking';
COMMENT ON COLUMN bookings.seats_requested IS 'Number of seats requested';
COMMENT ON COLUMN bookings.status IS 'Booking status (PENDING, CONFIRMED, CANCELLED)';
