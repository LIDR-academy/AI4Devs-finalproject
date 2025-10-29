-- Set search path to trips schema
SET search_path TO trips, public;

-- Add direction enum type
CREATE TYPE trip_direction AS ENUM ('TO_SEDE', 'FROM_SEDE');

-- Add direction column with default value for existing trips
ALTER TABLE trips ADD COLUMN direction trip_direction DEFAULT 'TO_SEDE' NOT NULL;

-- Add paired trip ID column (nullable, self-referencing FK)
ALTER TABLE trips ADD COLUMN paired_trip_id UUID;

-- Create index for efficient lookups on paired trips
CREATE INDEX IF NOT EXISTS idx_trips_paired_trip_id ON trips(paired_trip_id);

-- Add foreign key constraint for paired trip relationship
ALTER TABLE trips ADD CONSTRAINT fk_trips_paired_trip_id 
    FOREIGN KEY (paired_trip_id) REFERENCES trips(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN trips.direction IS 'Direction of the trip: TO_SEDE (to headquarters) or FROM_SEDE (from headquarters)';
COMMENT ON COLUMN trips.paired_trip_id IS 'ID of the paired trip for round-trip journeys (optional)';
