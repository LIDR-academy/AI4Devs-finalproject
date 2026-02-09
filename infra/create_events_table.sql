-- T-004-BACK: Create events table for upload confirmation tracking
-- This migration creates the events table to store audit trail of file uploads

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on file_id for faster queries
CREATE INDEX IF NOT EXISTS idx_events_file_id ON events(file_id);

-- Create index on event_type for filtering
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Create index on created_at for time range queries
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Add comment to table
COMMENT ON TABLE events IS 'Audit trail of file upload events and processing status';
COMMENT ON COLUMN events.id IS 'Unique event identifier';
COMMENT ON COLUMN events.file_id IS 'Reference to the uploaded file';
COMMENT ON COLUMN events.event_type IS 'Type of event (e.g., upload.confirmed, processing.started)';
COMMENT ON COLUMN events.metadata IS 'Flexible JSON storage for event-specific data';
COMMENT ON COLUMN events.created_at IS 'Timestamp when the event was created';
