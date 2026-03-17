-- Set search path to bookings schema
SET search_path TO bookings, public;

-- Insert seed data for testing
INSERT INTO bookings (id, trip_id, passenger_id, seats_requested, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user-006', 1, 'CONFIRMED'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'user-007', 2, 'CONFIRMED'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'user-008', 1, 'PENDING'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'user-009', 3, 'CONFIRMED'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'user-010', 1, 'CANCELLED');
