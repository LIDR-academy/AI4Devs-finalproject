-- Set search path to matches schema
SET search_path TO matches, public;

-- Insert seed data for testing
INSERT INTO matches (id, trip_id, passenger_id, driver_id, match_score, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user-006', 'user-001', 0.95, 'ACCEPTED'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'user-007', 'user-001', 0.87, 'PENDING'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'user-008', 'user-002', 0.72, 'ACCEPTED'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'user-009', 'user-003', 0.91, 'REJECTED'),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'user-010', 'user-004', 0.68, 'PENDING');
