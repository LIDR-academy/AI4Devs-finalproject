-- Flyway migration - Seed data for demo purposes (US4 Playback)
-- Targets user ID: 550e8400-e29b-41d4-a716-446655440000
-- Created at: 2026-02-17

-- INSERT DEMO DATA
-- Note: the title in Playback BC is currently derived from 'narration_script_text'

INSERT INTO generation.meditation_output (
    meditation_id, composition_id, user_id, idempotency_key, media_type, status, 
    narration_script_text, narration_script_duration_seconds, output_media_url, background_image_url, 
    subtitle_url, created_at, completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440001', 
    '550e8400-e29b-41d4-a716-446655440000', 'demo-key-1', 'VIDEO', 'COMPLETED',
    'Mindfulness Matutino', 300.5, 
    'https://meditation-outputs.s3.amazonaws.com/demo/video1.mp4', 
    'https://meditation-outputs.s3.amazonaws.com/demo/image1.jpg',
    'https://meditation-outputs.s3.amazonaws.com/demo/subs1.srt',
    '2026-01-15 10:30:00', '2026-01-15 10:35:00'
);

INSERT INTO generation.meditation_output (
    meditation_id, composition_id, user_id, idempotency_key, media_type, status, 
    narration_script_text, narration_script_duration_seconds, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440000', 'demo-key-2', 'AUDIO', 'PROCESSING',
    'Relajación Nocturna', 450.0,
    '2026-02-17 14:00:00'
);

INSERT INTO generation.meditation_output (
    meditation_id, composition_id, user_id, idempotency_key, media_type, status, 
    narration_script_text, narration_script_duration_seconds, error_message, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440003', 
    '550e8400-e29b-41d4-a716-446655440000', 'demo-key-3', 'VIDEO', 'FAILED',
    'Meditación de la Respiración', 120.0, 'Error al generar la imagen de fondo',
    '2026-02-17 10:00:00'
);
