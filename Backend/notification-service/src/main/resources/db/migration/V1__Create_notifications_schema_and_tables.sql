-- Set search path to notifications schema
SET search_path TO notifications, public;

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(2048) NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_endpoint ON notification_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_active ON notification_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_active ON notification_subscriptions(user_id, is_active);

-- Add comments
COMMENT ON TABLE notification_subscriptions IS 'Push notification subscriptions for users';
COMMENT ON COLUMN notification_subscriptions.user_id IS 'ID of the user who subscribed';
COMMENT ON COLUMN notification_subscriptions.endpoint IS 'Push notification endpoint URL';
COMMENT ON COLUMN notification_subscriptions.p256dh_key IS 'P256DH public key for encryption';
COMMENT ON COLUMN notification_subscriptions.auth_key IS 'Authentication key for the subscription';
COMMENT ON COLUMN notification_subscriptions.is_active IS 'Whether the subscription is active';
