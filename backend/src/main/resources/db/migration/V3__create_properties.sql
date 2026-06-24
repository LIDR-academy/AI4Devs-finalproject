-- V3__create_properties.sql
--
-- Creates the Property table — the central entity for guest search.
-- Stores location as PostGIS geography(Point, 4326) to enable spatial
-- bounding-box queries via a GiST index. See data-model.md for the
-- authoritative column and index specification.

CREATE TABLE property (
    id                   UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id              UUID            NOT NULL REFERENCES host(id),
    title                VARCHAR(255)    NOT NULL,
    description          TEXT            NOT NULL,
    property_type        VARCHAR(32)     NOT NULL,
    location             GEOGRAPHY(Point, 4326) NOT NULL,
    city                 VARCHAR(128)    NOT NULL,
    region               VARCHAR(128),
    country              VARCHAR(128)    NOT NULL,
    address              VARCHAR(512)    NOT NULL,
    max_guests           INTEGER         NOT NULL,
    bedrooms             INTEGER         NOT NULL,
    bathrooms            INTEGER         NOT NULL,
    nightly_rate_eur     DECIMAL(10, 2)  NOT NULL,
    cleaning_fee_eur     DECIMAL(10, 2)  NOT NULL,
    amenities            JSONB           NOT NULL DEFAULT '[]'::jsonb,
    house_rules          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    photos               JSONB           NOT NULL,
    avg_rating           DECIMAL(2, 1),
    review_count         INTEGER         NOT NULL DEFAULT 0,
    is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT property_type_chk
        CHECK (property_type IN ('apartment', 'house', 'villa', 'cabin', 'studio')),
    CONSTRAINT property_max_guests_chk    CHECK (max_guests > 0),
    CONSTRAINT property_bedrooms_chk      CHECK (bedrooms >= 0),
    CONSTRAINT property_bathrooms_chk     CHECK (bathrooms > 0),
    CONSTRAINT property_nightly_rate_chk  CHECK (nightly_rate_eur > 0),
    CONSTRAINT property_cleaning_fee_chk  CHECK (cleaning_fee_eur >= 0),
    CONSTRAINT property_avg_rating_chk    CHECK (avg_rating IS NULL OR (avg_rating >= 1.0 AND avg_rating <= 5.0)),
    CONSTRAINT property_review_count_chk  CHECK (review_count >= 0),
    CONSTRAINT property_photos_min_chk    CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) >= 1),
    CONSTRAINT property_amenities_arr_chk CHECK (jsonb_typeof(amenities) = 'array'),
    CONSTRAINT property_house_rules_arr_chk CHECK (jsonb_typeof(house_rules) = 'array')
);

-- GiST index on the geography column for spatial bounding-box queries.
CREATE INDEX idx_property_location
    ON property
    USING GIST (location);

-- B-tree on host_id for host → properties lookups.
CREATE INDEX idx_property_host_id
    ON property (host_id);

-- Partial composite index for active-property type filtering (search path).
CREATE INDEX idx_property_active_type
    ON property (property_type, is_active)
    WHERE is_active = TRUE;

-- B-tree on nightly_rate_eur for price sorting / range filters.
CREATE INDEX idx_property_nightly_rate
    ON property (nightly_rate_eur);

-- B-tree on avg_rating for rating sorting.
CREATE INDEX idx_property_avg_rating
    ON property (avg_rating);
