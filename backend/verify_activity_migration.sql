-- Post-Migration Verification Queries for Activity Table

-- 1. Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'activity';

-- 2. Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activity'
ORDER BY ordinal_position;

-- 3. Verify indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'activity';

-- 4. Verify foreign key constraints
SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage
JOIN information_schema.table_constraints USING (constraint_name, table_schema, table_name)
WHERE table_name = 'activity' AND constraint_type = 'FOREIGN KEY';

-- 5. Test insert
INSERT INTO activity (user_id, activity_type, description, entity_id)
VALUES (NULL, 'TEST_VERIFICATION', 'Test activity for migration verification', NULL);

-- 6. Verify insert worked
SELECT * FROM activity WHERE activity_type = 'TEST_VERIFICATION';

-- 7. Clean up test data
DELETE FROM activity WHERE activity_type = 'TEST_VERIFICATION';

-- 8. Verify deletion worked
SELECT COUNT(*) as test_records_remaining
FROM activity WHERE activity_type = 'TEST_VERIFICATION';

