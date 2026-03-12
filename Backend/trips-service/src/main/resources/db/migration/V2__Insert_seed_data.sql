-- Set search path to trips schema
SET search_path TO trips, public;

-- Insert seed data for testing
-- Note: origin uses "lat,lng" format to match Trip.origin usage
INSERT INTO trips (id, driver_id, origin, destination_sede_id, date_time, seats_total, seats_free) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'user-001', '40.4168,-3.7038', 'SEDE-1', '2025-10-06 08:30:00+00', 3, 3),
    ('550e8400-e29b-41d4-a716-446655440002', 'user-002', '40.4983,-3.6827', 'SEDE-1', '2025-10-06 09:00:00+00', 2, 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'user-003', '40.3451,-3.7064', 'SEDE-2', '2025-10-06 08:30:00+00', 4, 4),
    ('550e8400-e29b-41d4-a716-446655440004', 'user-004', '40.4164,-3.6510', 'SEDE-1', '2025-10-07 08:30:00+00', 2, 1),
    ('550e8400-e29b-41d4-a716-446655440005', 'user-005', '40.4350,-3.7450', 'SEDE-2', '2025-10-07 09:00:00+00', 3, 3);
