-- Ensure we are operating in the notifications schema
SET search_path TO notifications, public;

-- Convert id column to UUID if not already
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'notifications'
          AND table_name = 'notification_subscriptions'
          AND column_name = 'id'
          AND data_type <> 'uuid'
    ) THEN
        ALTER TABLE notifications.notification_subscriptions
            ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
END$$;

-- Ensure default is gen_random_uuid (pgcrypto enabled in init script)
ALTER TABLE notifications.notification_subscriptions
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Cleanup probe table if present
DROP TABLE IF EXISTS notifications._probe;


