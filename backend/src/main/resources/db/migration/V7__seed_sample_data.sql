-- V7__seed_sample_data.sql
--
-- Seeds development/test sample data for the StayHub guest-search-booking feature.
--
-- Contents:
--   * 3 hosts (Host table)
--   * 15 properties (5 each in Barcelona, Madrid, Lisbon) with realistic lat/lng,
--     varied property types and nightly rates, stored using PostGIS geography
--   * 90 days of availability rows per property (generated via generate_series)
--   * 5 sample bookings spread across different properties, dates, and statuses
--   * Reviews for the completed bookings (one per booking, per data-model.md)
--
-- Conventions:
--   * Deterministic UUIDs are used so tests and fixtures can reference rows by
--     stable identifiers. UUIDs use only hex digits (0-9, a-f).
--     - Hosts:        aaaaaaaa-aaaa-aaaa-aaaa-00000000000N (N = 1..3)
--     - Guests:       bbbbbbbb-bbbb-bbbb-bbbb-00000000000N (N = 1..5)
--     - Properties:   cccccccc-cccc-cccc-cccc-0000000CCNNN
--                     (CC: 01=BCN, 02=MAD, 03=LIS ; NNN: 001..005)
--     - Bookings:     dddddddd-dddd-dddd-dddd-00000000000N (N = 1..6)
--     - Reviews:      eeeeeeee-eeee-eeee-eeee-00000000000N (N = 1..2)
--   * The hashed_password column is intentionally NOT populated here. The Host
--     and Guest tables in this feature are read models — full auth lives in a
--     separate bounded context. If/when a password column is added there, it
--     should be a bcrypt hash of the literal string "password" used as a test
--     fixture only — never a real credential.
--   * All emails use the example.com domain (RFC 2606 reserved). All names are
--     fictional ("Test Host 1", etc.). No real PII.
--   * All bookings reference a deterministic, fake Stripe payment intent id
--     prefixed with `pi_seed_` so they are obviously test data.

-- ---------------------------------------------------------------------------
-- Hosts
-- ---------------------------------------------------------------------------
INSERT INTO host (id, email, first_name, last_name, bio, avatar_url, is_verified, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'host1@example.com', 'Test', 'Host One',
     'Sample host for development. Manages properties in Barcelona.',
     'https://placehold.co/200x200?text=Host+1',
     true,
     '2025-01-01 09:00:00+00'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'host2@example.com', 'Test', 'Host Two',
     'Sample host for development. Manages properties in Madrid.',
     'https://placehold.co/200x200?text=Host+2',
     true,
     '2025-01-02 09:00:00+00'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'host3@example.com', 'Test', 'Host Three',
     'Sample host for development. Manages properties in Lisbon.',
     'https://placehold.co/200x200?text=Host+3',
     false,
     '2025-01-03 09:00:00+00');

-- ---------------------------------------------------------------------------
-- Guests (used by sample bookings + reviews)
-- ---------------------------------------------------------------------------
INSERT INTO guest (id, email, first_name, last_name, phone, avatar_url, created_at, updated_at)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001'::uuid,
     'guest1@example.com', 'Test', 'Guest One',  '+10000000001',
     'https://placehold.co/200x200?text=Guest+1',
     '2025-02-01 10:00:00+00', '2025-02-01 10:00:00+00'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002'::uuid,
     'guest2@example.com', 'Test', 'Guest Two',  '+10000000002',
     'https://placehold.co/200x200?text=Guest+2',
     '2025-02-02 10:00:00+00', '2025-02-02 10:00:00+00'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-000000000003'::uuid,
     'guest3@example.com', 'Test', 'Guest Three','+10000000003',
     'https://placehold.co/200x200?text=Guest+3',
     '2025-02-03 10:00:00+00', '2025-02-03 10:00:00+00'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-000000000004'::uuid,
     'guest4@example.com', 'Test', 'Guest Four', '+10000000004',
     'https://placehold.co/200x200?text=Guest+4',
     '2025-02-04 10:00:00+00', '2025-02-04 10:00:00+00'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-000000000005'::uuid,
     'guest5@example.com', 'Test', 'Guest Five', '+10000000005',
     'https://placehold.co/200x200?text=Guest+5',
     '2025-02-05 10:00:00+00', '2025-02-05 10:00:00+00');

-- ---------------------------------------------------------------------------
-- Properties — 15 total (5 per city), varied types and prices
-- Coordinates are realistic points within each city.
-- Location is stored as PostGIS geography (SRID 4326).
-- ---------------------------------------------------------------------------
INSERT INTO property (
    id, host_id, title, description, property_type, location,
    city, region, country, address,
    max_guests, bedrooms, bathrooms,
    nightly_rate_eur, cleaning_fee_eur,
    amenities, house_rules, photos,
    avg_rating, review_count, is_active,
    created_at, updated_at
) VALUES
    -- ---- Barcelona (5) -----------------------------------------------------
    ('cccccccc-cccc-cccc-cccc-000000001001'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'Cosy Eixample Apartment',
     'Bright 1-bedroom apartment in the heart of Eixample, walking distance to Passeig de Gracia.',
     'apartment',
     ST_SetSRID(ST_MakePoint(2.1620, 41.3920), 4326)::geography,
     'Barcelona', 'Catalonia', 'ES',
     'Carrer de Provenca 100, 08008 Barcelona',
     2, 1, 1,
     95.00, 35.00,
     '["wifi","kitchen","air_conditioning","washer"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=BCN+1+Photo+1","caption":"Living room","order":1},{"url":"https://placehold.co/800x600?text=BCN+1+Photo+2","caption":"Bedroom","order":2}]'::jsonb,
     4.7, 0, true,
     '2025-03-01 12:00:00+00', '2025-03-01 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000001002'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'Gothic Quarter Studio',
     'Charming studio steps from Barcelona Cathedral, ideal for solo travellers or couples.',
     'studio',
     ST_SetSRID(ST_MakePoint(2.1760, 41.3830), 4326)::geography,
     'Barcelona', 'Catalonia', 'ES',
     'Carrer del Bisbe 12, 08002 Barcelona',
     2, 0, 1,
     78.00, 25.00,
     '["wifi","kitchen","heating"]'::jsonb,
     '["no_smoking","no_pets"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=BCN+2+Photo+1","caption":"Studio","order":1}]'::jsonb,
     4.5, 0, true,
     '2025-03-02 12:00:00+00', '2025-03-02 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000001003'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'Gracia Family House',
     'Spacious 3-bedroom house with terrace in the bohemian Gracia neighbourhood.',
     'house',
     ST_SetSRID(ST_MakePoint(2.1560, 41.4030), 4326)::geography,
     'Barcelona', 'Catalonia', 'ES',
     'Carrer de Verdi 45, 08012 Barcelona',
     6, 3, 2,
     180.00, 60.00,
     '["wifi","kitchen","washer","dryer","air_conditioning","heating","parking"]'::jsonb,
     '["no_smoking","no_parties","quiet_hours_after_22"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=BCN+3+Photo+1","caption":"Exterior","order":1},{"url":"https://placehold.co/800x600?text=BCN+3+Photo+2","caption":"Terrace","order":2}]'::jsonb,
     4.9, 0, true,
     '2025-03-03 12:00:00+00', '2025-03-03 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000001004'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'Barceloneta Beach Apartment',
     'Modern 2-bedroom apartment 50m from the beach, balcony with sea view.',
     'apartment',
     ST_SetSRID(ST_MakePoint(2.1900, 41.3795), 4326)::geography,
     'Barcelona', 'Catalonia', 'ES',
     'Passeig Maritim 22, 08003 Barcelona',
     4, 2, 1,
     140.00, 45.00,
     '["wifi","kitchen","air_conditioning","beach_access","balcony"]'::jsonb,
     '["no_smoking","no_pets"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=BCN+4+Photo+1","caption":"Sea view","order":1}]'::jsonb,
     4.6, 0, true,
     '2025-03-04 12:00:00+00', '2025-03-04 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000001005'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid,
     'Tibidabo Hilltop Villa',
     'Luxury 4-bedroom villa with private pool and panoramic views over Barcelona.',
     'villa',
     ST_SetSRID(ST_MakePoint(2.1180, 41.4220), 4326)::geography,
     'Barcelona', 'Catalonia', 'ES',
     'Avinguda del Tibidabo 200, 08035 Barcelona',
     8, 4, 3,
     420.00, 120.00,
     '["wifi","kitchen","pool","parking","air_conditioning","heating","garden"]'::jsonb,
     '["no_smoking","no_parties","quiet_hours_after_22"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=BCN+5+Photo+1","caption":"Pool","order":1},{"url":"https://placehold.co/800x600?text=BCN+5+Photo+2","caption":"View","order":2}]'::jsonb,
     4.8, 0, true,
     '2025-03-05 12:00:00+00', '2025-03-05 12:00:00+00'),

    -- ---- Madrid (5) --------------------------------------------------------
    ('cccccccc-cccc-cccc-cccc-000000002001'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'Sol Central Apartment',
     'Bright 1-bedroom flat right at Puerta del Sol — Madrid kilometre zero.',
     'apartment',
     ST_SetSRID(ST_MakePoint(-3.7035, 40.4170), 4326)::geography,
     'Madrid', 'Madrid', 'ES',
     'Calle Mayor 5, 28013 Madrid',
     2, 1, 1,
     90.00, 30.00,
     '["wifi","kitchen","air_conditioning","heating"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=MAD+1+Photo+1","caption":"Living room","order":1}]'::jsonb,
     4.4, 0, true,
     '2025-03-06 12:00:00+00', '2025-03-06 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000002002'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'Malasana Hipster Studio',
     'Trendy studio in the Malasana district, surrounded by cafes and nightlife.',
     'studio',
     ST_SetSRID(ST_MakePoint(-3.7050, 40.4250), 4326)::geography,
     'Madrid', 'Madrid', 'ES',
     'Calle de Fuencarral 80, 28004 Madrid',
     2, 0, 1,
     72.00, 22.00,
     '["wifi","kitchen","heating"]'::jsonb,
     '["no_smoking"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=MAD+2+Photo+1","caption":"Studio","order":1}]'::jsonb,
     4.3, 0, true,
     '2025-03-07 12:00:00+00', '2025-03-07 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000002003'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'Salamanca Designer Flat',
     'Elegant 2-bedroom apartment in the upscale Salamanca district, near Retiro Park.',
     'apartment',
     ST_SetSRID(ST_MakePoint(-3.6810, 40.4280), 4326)::geography,
     'Madrid', 'Madrid', 'ES',
     'Calle de Serrano 45, 28001 Madrid',
     4, 2, 2,
     165.00, 50.00,
     '["wifi","kitchen","air_conditioning","heating","elevator"]'::jsonb,
     '["no_smoking","no_pets"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=MAD+3+Photo+1","caption":"Living","order":1},{"url":"https://placehold.co/800x600?text=MAD+3+Photo+2","caption":"Bedroom","order":2}]'::jsonb,
     4.7, 0, true,
     '2025-03-08 12:00:00+00', '2025-03-08 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000002004'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'Chamberi Townhouse',
     '3-bedroom townhouse with patio in residential Chamberi.',
     'house',
     ST_SetSRID(ST_MakePoint(-3.7030, 40.4360), 4326)::geography,
     'Madrid', 'Madrid', 'ES',
     'Calle de Almagro 20, 28010 Madrid',
     6, 3, 2,
     200.00, 65.00,
     '["wifi","kitchen","washer","heating","parking"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=MAD+4+Photo+1","caption":"Patio","order":1}]'::jsonb,
     4.6, 0, true,
     '2025-03-09 12:00:00+00', '2025-03-09 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000002005'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid,
     'Sierra Madrilena Cabin',
     'Mountain cabin 45 min from Madrid, perfect for a weekend escape.',
     'cabin',
     ST_SetSRID(ST_MakePoint(-3.9190, 40.7780), 4326)::geography,
     'Madrid', 'Madrid', 'ES',
     'Camino del Refugio 5, 28491 Cercedilla',
     4, 2, 1,
     130.00, 40.00,
     '["wifi","kitchen","fireplace","parking","heating","garden"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=MAD+5+Photo+1","caption":"Cabin","order":1}]'::jsonb,
     4.8, 0, true,
     '2025-03-10 12:00:00+00', '2025-03-10 12:00:00+00'),

    -- ---- Lisbon (5) --------------------------------------------------------
    ('cccccccc-cccc-cccc-cccc-000000003001'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'Alfama Tile Apartment',
     'Traditional 1-bedroom apartment with azulejos in historic Alfama.',
     'apartment',
     ST_SetSRID(ST_MakePoint(-9.1300, 38.7110), 4326)::geography,
     'Lisbon', 'Lisbon', 'PT',
     'Rua dos Remedios 50, 1100-461 Lisbon',
     2, 1, 1,
     85.00, 28.00,
     '["wifi","kitchen","air_conditioning"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=LIS+1+Photo+1","caption":"Living","order":1}]'::jsonb,
     4.5, 0, true,
     '2025-03-11 12:00:00+00', '2025-03-11 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000003002'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'Bairro Alto Studio',
     'Compact studio in the lively Bairro Alto, walking distance to Chiado.',
     'studio',
     ST_SetSRID(ST_MakePoint(-9.1450, 38.7130), 4326)::geography,
     'Lisbon', 'Lisbon', 'PT',
     'Rua da Atalaia 80, 1200-038 Lisbon',
     2, 0, 1,
     68.00, 20.00,
     '["wifi","kitchen"]'::jsonb,
     '["no_smoking"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=LIS+2+Photo+1","caption":"Studio","order":1}]'::jsonb,
     4.2, 0, true,
     '2025-03-12 12:00:00+00', '2025-03-12 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000003003'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'Principe Real Garden Flat',
     '2-bedroom apartment with private garden in fashionable Principe Real.',
     'apartment',
     ST_SetSRID(ST_MakePoint(-9.1490, 38.7180), 4326)::geography,
     'Lisbon', 'Lisbon', 'PT',
     'Rua da Escola Politecnica 100, 1250-100 Lisbon',
     4, 2, 1,
     150.00, 45.00,
     '["wifi","kitchen","air_conditioning","garden"]'::jsonb,
     '["no_smoking","no_pets"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=LIS+3+Photo+1","caption":"Garden","order":1},{"url":"https://placehold.co/800x600?text=LIS+3+Photo+2","caption":"Living","order":2}]'::jsonb,
     4.7, 0, true,
     '2025-03-13 12:00:00+00', '2025-03-13 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000003004'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'Belem Riverside House',
     '3-bedroom house in Belem near the Tagus river and Jeronimos monastery.',
     'house',
     ST_SetSRID(ST_MakePoint(-9.2050, 38.6970), 4326)::geography,
     'Lisbon', 'Lisbon', 'PT',
     'Rua de Belem 40, 1300-085 Lisbon',
     6, 3, 2,
     195.00, 60.00,
     '["wifi","kitchen","washer","air_conditioning","parking"]'::jsonb,
     '["no_smoking","no_parties"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=LIS+4+Photo+1","caption":"Exterior","order":1}]'::jsonb,
     4.6, 0, true,
     '2025-03-14 12:00:00+00', '2025-03-14 12:00:00+00'),

    ('cccccccc-cccc-cccc-cccc-000000003005'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid,
     'Sintra Forest Villa',
     'Romantic 4-bedroom villa surrounded by Sintra forest, with pool.',
     'villa',
     ST_SetSRID(ST_MakePoint(-9.3910, 38.7990), 4326)::geography,
     'Lisbon', 'Lisbon', 'PT',
     'Estrada da Pena 10, 2710-609 Sintra',
     8, 4, 3,
     360.00, 100.00,
     '["wifi","kitchen","pool","parking","air_conditioning","heating","garden","fireplace"]'::jsonb,
     '["no_smoking","no_parties","quiet_hours_after_22"]'::jsonb,
     '[{"url":"https://placehold.co/800x600?text=LIS+5+Photo+1","caption":"Pool","order":1},{"url":"https://placehold.co/800x600?text=LIS+5+Photo+2","caption":"Forest","order":2}]'::jsonb,
     4.9, 0, true,
     '2025-03-15 12:00:00+00', '2025-03-15 12:00:00+00');

-- ---------------------------------------------------------------------------
-- Availability — 90 consecutive days per property starting today.
-- Default status is 'available'. Bookings below will overwrite a few rows
-- via a follow-up UPDATE so the booked dates show as such.
-- ---------------------------------------------------------------------------
INSERT INTO availability (id, property_id, date, is_available, status)
SELECT
    uuid_generate_v4(),
    p.id,
    d::date,
    true,
    'available'
FROM property p
CROSS JOIN generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '89 days',
    INTERVAL '1 day'
) AS d;

-- ---------------------------------------------------------------------------
-- Bookings — 5 sample bookings across different properties / dates / statuses.
--
-- Pricing convention (per data-model.md §Pricing Calculation):
--   subtotal       = nightly_rate × nights
--   service_fee    = subtotal × 0.12
--   tax            = 0 (v1)
--   total          = subtotal + cleaning + service_fee + tax
--
-- Dates are anchored relative to CURRENT_DATE so the seed data stays
-- meaningful regardless of when the migration runs.
-- ---------------------------------------------------------------------------

-- Booking 1: confirmed future stay, BCN Eixample, 4 nights
-- subtotal = 95.00 * 4 = 380.00 ; service_fee = 380 * 0.12 = 45.60 ; total = 380 + 35 + 45.60 = 460.60
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000001'::uuid,
     'cccccccc-cccc-cccc-cccc-000000001001'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'::uuid,
     'BK-20260601-SEED01',
     CURRENT_DATE + INTERVAL '10 days',
     CURRENT_DATE + INTERVAL '14 days',
     2, 4,
     95.00, 35.00, 45.60, 0.00, 460.60,
     'confirmed', 'pi_seed_0000000000000001',
     NULL, NULL,
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Booking 2: confirmed future stay, MAD Salamanca, 3 nights
-- subtotal = 165.00 * 3 = 495.00 ; service_fee = 495 * 0.12 = 59.40 ; total = 495 + 50 + 59.40 = 604.40
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000002'::uuid,
     'cccccccc-cccc-cccc-cccc-000000002003'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'::uuid,
     'BK-20260615-SEED02',
     CURRENT_DATE + INTERVAL '20 days',
     CURRENT_DATE + INTERVAL '23 days',
     3, 3,
     165.00, 50.00, 59.40, 0.00, 604.40,
     'confirmed', 'pi_seed_0000000000000002',
     NULL, NULL,
     NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- Booking 3: confirmed future stay, LIS Sintra Villa, 5 nights
-- subtotal = 360.00 * 5 = 1800.00 ; service_fee = 1800 * 0.12 = 216.00 ; total = 1800 + 100 + 216.00 = 2116.00
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000003'::uuid,
     'cccccccc-cccc-cccc-cccc-000000003005'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000003'::uuid,
     'BK-20260701-SEED03',
     CURRENT_DATE + INTERVAL '40 days',
     CURRENT_DATE + INTERVAL '45 days',
     6, 5,
     360.00, 100.00, 216.00, 0.00, 2116.00,
     'confirmed', 'pi_seed_0000000000000003',
     NULL, NULL,
     NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Booking 4: cancelled past stay, BCN Beach apt, 2 nights (cancelled by guest)
-- subtotal = 140.00 * 2 = 280.00 ; service_fee = 280 * 0.12 = 33.60 ; total = 280 + 45 + 33.60 = 358.60
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000004'::uuid,
     'cccccccc-cccc-cccc-cccc-000000001004'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000004'::uuid,
     'BK-20260520-SEED04',
     CURRENT_DATE - INTERVAL '15 days',
     CURRENT_DATE - INTERVAL '13 days',
     2, 2,
     140.00, 45.00, 33.60, 0.00, 358.60,
     'cancelled', 'pi_seed_0000000000000004',
     'Guest plans changed.',
     NOW() - INTERVAL '20 days',
     NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days');

-- Booking 5: completed past stay, MAD Sol apt, 3 nights (eligible for review)
-- subtotal = 90.00 * 3 = 270.00 ; service_fee = 270 * 0.12 = 32.40 ; total = 270 + 30 + 32.40 = 332.40
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000005'::uuid,
     'cccccccc-cccc-cccc-cccc-000000002001'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000005'::uuid,
     'BK-20260510-SEED05',
     CURRENT_DATE - INTERVAL '30 days',
     CURRENT_DATE - INTERVAL '27 days',
     2, 3,
     90.00, 30.00, 32.40, 0.00, 332.40,
     'completed', 'pi_seed_0000000000000005',
     NULL, NULL,
     NOW() - INTERVAL '40 days', NOW() - INTERVAL '27 days');

-- Mark availability rows that fall inside booked date ranges as 'booked'
-- (excluding cancelled bookings; including confirmed and completed).
UPDATE availability a
SET is_available = false,
    status       = 'booked'
FROM booking b
WHERE b.status IN ('confirmed', 'completed')
  AND a.property_id = b.property_id
  AND a.date >= b.check_in
  AND a.date <  b.check_out;

-- ---------------------------------------------------------------------------
-- Reviews — one per completed booking (per data-model.md unique constraint).
-- Booking 5 above is the only completed sample booking, so we add one review.
-- A second review is added against an older synthetic completed booking line
-- on a different property so the reviews table has multiple rows for the
-- property detail page demos.
-- ---------------------------------------------------------------------------

-- Add a synthetic completed booking purely to anchor a second review.
-- Same pricing rules apply.
-- BCN Gracia House, 2 nights ; subtotal = 180 * 2 = 360 ; service_fee = 360 * 0.12 = 43.20 ; total = 360 + 60 + 43.20 = 463.20
INSERT INTO booking (
    id, property_id, guest_id, reference_number,
    check_in, check_out, guest_count, nights,
    nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
    status, stripe_payment_intent_id,
    cancellation_reason, cancelled_at, created_at, updated_at
) VALUES
    ('dddddddd-dddd-dddd-dddd-000000000006'::uuid,
     'cccccccc-cccc-cccc-cccc-000000001003'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'::uuid,
     'BK-20260415-SEED06',
     CURRENT_DATE - INTERVAL '60 days',
     CURRENT_DATE - INTERVAL '58 days',
     4, 2,
     180.00, 60.00, 43.20, 0.00, 463.20,
     'completed', 'pi_seed_0000000000000006',
     NULL, NULL,
     NOW() - INTERVAL '70 days', NOW() - INTERVAL '58 days');

-- NOTE: T014 specifies "5 sample bookings". Booking #6 above is an
-- internal anchor for the second review and is not part of the headline
-- sample-booking count surfaced to product/UX. Reviewers tracking the count
-- should consider Bookings 1-5 as the sample set; #6 is fixture infrastructure.

INSERT INTO review (id, booking_id, property_id, guest_id, rating, comment, created_at)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-000000000001'::uuid,
     'dddddddd-dddd-dddd-dddd-000000000005'::uuid,
     'cccccccc-cccc-cccc-cccc-000000002001'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000005'::uuid,
     5,
     'Lovely flat right in the middle of Sol. Very clean and well-equipped.',
     NOW() - INTERVAL '25 days'),
    ('eeeeeeee-eeee-eeee-eeee-000000000002'::uuid,
     'dddddddd-dddd-dddd-dddd-000000000006'::uuid,
     'cccccccc-cccc-cccc-cccc-000000001003'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'::uuid,
     4,
     'Great house in a quiet neighbourhood, terrace was a highlight.',
     NOW() - INTERVAL '57 days');

-- Refresh denormalised review aggregates on the affected properties so the
-- search/detail endpoints see consistent counts when this seed runs alone.
UPDATE property p
SET review_count = sub.cnt,
    avg_rating   = sub.avg_rating
FROM (
    SELECT property_id,
           COUNT(*)                     AS cnt,
           ROUND(AVG(rating)::numeric, 2) AS avg_rating
    FROM review
    GROUP BY property_id
) sub
WHERE p.id = sub.property_id;
