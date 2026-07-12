-- V10: Add password_hash column to guest table
--
-- Required for auth Slice 0 (issue #127). Guests register with a hashed
-- password; the hash is stored here. DEFAULT '' lets existing rows satisfy the
-- NOT NULL constraint; a real password will be set on first registration.

ALTER TABLE guest
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';
