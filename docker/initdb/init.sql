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
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Crear la tabla Trips
CREATE TABLE IF NOT EXISTS Trips (
    ID VARCHAR(50) PRIMARY KEY,
    UserID INTEGER REFERENCES users(ID) ON DELETE CASCADE,
    Destination VARCHAR(255) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Description TEXT,
    Accompaniment VARCHAR(50) NOT NULL CHECK (Accompaniment IN ('Solo', 'Friends', 'Family', 'Couple')),
    ActivityType TEXT[] NOT NULL CHECK (ActivityType && ARRAY['Nature', 'Culture', 'Nightlife', 'Gastronomic']), 
    BudgetMin INTEGER NOT NULL,
    BudgetMax INTEGER NOT NULL
);

-- Crear la tabla Activities
CREATE TABLE IF NOT EXISTS Activities (
    ID VARCHAR(50) PRIMARY KEY,
    TripID VARCHAR(50) REFERENCES Trips(ID) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Sequence INTEGER NOT NULL,
    DateTime TIMESTAMP NOT NULL
);