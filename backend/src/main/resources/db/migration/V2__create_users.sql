-- V2: Create Guest and Host tables
--
-- Source of truth: specs/001-guest-search-booking/data-model.md
-- Depends on: V1__create_extensions.sql (enables uuid-ossp for uuid_generate_v4())

-- Guest: minimal read model for the booking feature.
CREATE TABLE guest (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    first_name  VARCHAR(255) NOT NULL,
    last_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(255),
    avatar_url  VARCHAR(2048),
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP    NOT NULL
);

-- Host: minimal read model for property ownership.
CREATE TABLE host (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    first_name  VARCHAR(255) NOT NULL,
    last_name   VARCHAR(255) NOT NULL,
    bio         TEXT,
    avatar_url  VARCHAR(2048),
    is_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL
);
