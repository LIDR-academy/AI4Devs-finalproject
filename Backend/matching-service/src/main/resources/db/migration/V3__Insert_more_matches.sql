-- Additional matches for user-001 to see results
INSERT INTO matches (id, trip_id, passenger_id, driver_id, match_score, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440101', 'user-001', 'user-006', 0.82, 'PENDING'),
    ('770e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440102', 'user-001', 'user-007', 0.76, 'ACCEPTED')
ON CONFLICT (id) DO NOTHING;


