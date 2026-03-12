-- Set search_path to notifications schema
SET search_path TO notifications, public;

-- Insert seed data for notification subscriptions (omit id to use default UUID)
INSERT INTO notification_subscriptions (user_id, endpoint, p256dh_key, auth_key, created_at, last_used, is_active) VALUES
    ('user-001', 'https://fcm.googleapis.com/fcm/send/example1', 'p256dh-key-1', 'auth-key-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
    ('user-002', 'https://fcm.googleapis.com/fcm/send/example2', 'p256dh-key-2', 'auth-key-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
    ('user-001', 'https://fcm.googleapis.com/fcm/send/example3', 'p256dh-key-3', 'auth-key-3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
