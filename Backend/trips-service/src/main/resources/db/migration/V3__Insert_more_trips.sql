-- Additional trips with different drivers for testing
INSERT INTO trips (id, driver_id, origin, destination_sede_id, date_time, seats_total, seats_free) VALUES
    ('550e8400-e29b-41d4-a716-446655440101', 'user-006', '40.4600,-3.7000', 'SEDE-1', NOW() + interval '2 hour', 3, 3),
    ('550e8400-e29b-41d4-a716-446655440102', 'user-007', '40.4200,-3.6800', 'SEDE-2', NOW() + interval '3 hour', 2, 2),
    ('550e8400-e29b-41d4-a716-446655440103', 'user-008', '41.3900,2.1700', 'SEDE-3', NOW() + interval '4 hour', 4, 4),
    ('550e8400-e29b-41d4-a716-446655440104', 'user-009', '40.4000,-3.7200', 'SEDE-1', NOW() + interval '5 hour', 2, 2),
    ('550e8400-e29b-41d4-a716-446655440105', 'user-010', '40.5000,-3.6500', 'SEDE-2', NOW() + interval '6 hour', 3, 3)
ON CONFLICT (id) DO NOTHING;


