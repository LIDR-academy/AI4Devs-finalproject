-- Runs once on first initialization of the Postgres volume.
-- Dedicated database for the AuditCare app, kept separate from Statewave's data.
CREATE DATABASE auditcare_app;
