-- docker/initdb/init.sql
DO $$ 
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ikigoo') THEN
      CREATE DATABASE ikigoo;
   END IF;
END $$;

-- Connect to the ikigoo database
\c ikigoo