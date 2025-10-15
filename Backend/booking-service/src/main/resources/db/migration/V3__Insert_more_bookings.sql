-- Additional bookings to ensure listings are not empty
INSERT INTO bookings (id, trip_id, passenger_id, seats_requested, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440101', 'user-001', 1, 'PENDING'),
    ('660e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440102', 'user-001', 1, 'CONFIRMED')
ON CONFLICT (id) DO NOTHING;


