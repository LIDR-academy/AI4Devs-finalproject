-- docker/initdb/init.sql
DO $$ 
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ikigoo') THEN
      CREATE DATABASE ikigoo;
   END IF;
END $$;

-- Connect to the ikigoo database
\c ikigoo

-- Example table creation
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE,
    creation_date DATE NOT NULL,
    last_login DATE
);

-- Crear la tabla Trips
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    accompaniment VARCHAR(50) NOT NULL CHECK (accompaniment IN ('Solo', 'Friends', 'Family', 'Couple')),
    activity_type TEXT[] NOT NULL CHECK (activity_type && ARRAY['Nature', 'Culture', 'Nightlife', 'Gastronomic']), 
    budget_min INTEGER NOT NULL,
    budget_max INTEGER NOT NULL
);

-- Crear la tabla Activities
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence INTEGER NOT NULL,
    date_time TIMESTAMP NOT NULL
);